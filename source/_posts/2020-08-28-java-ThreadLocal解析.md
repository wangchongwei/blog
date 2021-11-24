---
title: java ThreadLocal解析
date: 2020-08-28 13:46:49
tags: java
---

# ThreadLocal

ThreadLocal 是一个线程的内部存储类，对于被存储的对象，在不同的线程读取的变量是独立的。

实现原理是：对每一个线程都有一个 ThreadLocalMap，ThreadLocal 维护每个 ThreadLocalMap 中的值
ThreadLocalMap 内部是一个[]Enter, 不同的 ThreadLocal 都是存储在线程的同一个 ThreadLocalMap 中的，只是下标位置不同，
同一个 ThreadLocal 在不同线程的 ThreadLocalMap 中的下标值即索引值是相同的。

## ThreadLocal 方法解析

ThreadLocal 最常用的示例：

```
ThreadLocal<String> threadLocal = new ThreadLocal<String>();
threadLocal.set("1");
String name = threadLocal.get();
```

在主线程初始化 ThreadLocal 实例，在各个线程调用 set、get，设置、获取存储在各个线程中的值

查看源码

### set

```java
public void set(T value) {
    Thread t = Thread.currentThread();
    ThreadLocalMap map = getMap(t);
    if (map != null)
        map.set(this, value);
    else
        createMap(t, value);
}
```

当调用 set 函数时，会去获取当前线程的 ThreadLocalMap 对象，该对象是在 Thread.java 中申明，默认值为 null。
当 map 为 null 时，则调用 createMap,为 threadLocals 对象赋值，不为 null，在调用 ThreadLocalMap 中的 set 函数，将值保存到数组中

### get

```java
 public T get() {
        Thread t = Thread.currentThread();
        ThreadLocalMap map = getMap(t);
        if (map != null) {
            ThreadLocalMap.Entry e = map.getEntry(this);
            if (e != null) {
                @SuppressWarnings("unchecked")
                T result = (T)e.value;
                return result;
            }
        }
        return setInitialValue();
}


private T setInitialValue() {
        T value = initialValue();
        Thread t = Thread.currentThread();
        ThreadLocalMap map = getMap(t);
        if (map != null)
            map.set(this, value);
        else
            createMap(t, value);
        return value;
}

```

当调用 get 方法时，获取当前线程的 ThreadLocalMap 对象，如果 map 不为 null，则获取 map 持有的 Entry 对象，再返回该 Entry 对象持有的 value 值。
如果 map 为 null 或者获取的 Enter 对象为 null，则会调用 setInitialValue，而 initialValue 的返回值是 null。
当 map 为 null 时，会调用 createMap 方法，实例化 ThreadLocalMap

上面的 set、get 都会调用 getMap 方法，来获取当前线程的 ThreadLocalMap 实例

### getMap

```java
ThreadLocalMap getMap(Thread t) {
        return t.threadLocals;
    }
```

threadLocals 是在 Thread.java 中声明的，默认值为 null，也就是说每个线程中都有这个对象，只是默认是 null。

### createMap

在 set、get 中都会对当前线程的 ThreadLocalMap 对象判断，当为 null 时，会调用 createMap 对 ThreadLocalMap 对象 threadLocals 赋值，

```java
void createMap(Thread t, T firstValue) {
        t.threadLocals = new ThreadLocalMap(this, firstValue);
    }
```

## ThreadLocalMap

```java
static class ThreadLocalMap {
    // 必须为2的次方
    private static final int INITIAL_CAPACITY = 16;

    // 最终存储数据的数组
    private Entry[] table;

    // table 有值的长度
    private int size = 0;

    // resize后的大小
    private int threshold;


   ThreadLocalMap(ThreadLocal<?> firstKey, Object firstValue) {
            table = new Entry[INITIAL_CAPACITY];
            int i = firstKey.threadLocalHashCode & (INITIAL_CAPACITY - 1);
            table[i] = new Entry(firstKey, firstValue);
            size = 1;
            setThreshold(INITIAL_CAPACITY);
        }


    private Entry getEntry(ThreadLocal<?> key) {
            int i = key.threadLocalHashCode & (table.length - 1);
            Entry e = table[i];
            if (e != null && e.get() == key)
                return e;
            else
                return getEntryAfterMiss(key, i, e);
        }


    private void set(ThreadLocal<?> key, Object value) {

            // We don't use a fast path as with get() because it is at
            // least as common to use set() to create new entries as
            // it is to replace existing ones, in which case, a fast
            // path would fail more often than not.

            Entry[] tab = table;
            int len = tab.length;
            int i = key.threadLocalHashCode & (len-1);

            for (Entry e = tab[i];
                 e != null;
                 e = tab[i = nextIndex(i, len)]) {
                ThreadLocal<?> k = e.get();

                if (k == key) {
                    e.value = value;
                    return;
                }

                if (k == null) {
                    replaceStaleEntry(key, value, i);
                    return;
                }
            }

            tab[i] = new Entry(key, value);
            int sz = ++size;
            if (!cleanSomeSlots(i, sz) && sz >= threshold)
                rehash();
        }




    ......
}

```

getEntry 函数就是获取 key 对应的节点 Entry
在 getEntry、set 函数中可以看到 value 存储在[]Entry 中的下标位置是由 key.threadLocalHashCode & (len-1)计算得出的。
就是 ThreadLocal 中的 threadLocalHashCode 对[]Entry 长度取模
getEntry，通过下标获取 e，如果不为 null 而且再次校验 key 相等，则返回 e
set 时，e 不为 null，而且 key 相等，代表已存在，则替换 e.value，
key 不相等，代表不存在，而添加

```java
 private void rehash() {
            expungeStaleEntries();

            // Use lower threshold for doubling to avoid hysteresis
            if (size >= threshold - threshold / 4)
                resize();
        }

private void resize() {
            Entry[] oldTab = table;
            int oldLen = oldTab.length;
            int newLen = oldLen * 2;
            Entry[] newTab = new Entry[newLen];
            int count = 0;

            for (int j = 0; j < oldLen; ++j) {
                Entry e = oldTab[j];
                if (e != null) {
                    ThreadLocal<?> k = e.get();
                    if (k == null) {
                        e.value = null; // Help the GC
                    } else {
                        int h = k.threadLocalHashCode & (newLen - 1);
                        while (newTab[h] != null)
                            h = nextIndex(h, newLen);
                        newTab[h] = e;
                        count++;
                    }
                }
            }

            setThreshold(newLen);
            size = count;
            table = newTab;
        }

```

当 Entry[] 中存入的值数量已达到数组长度的 3/4；
则会调用 resize 函数，调整 Entry[]的长度，
将新数组长度\*2，遍历老数组，
重新获取下标 h，判断 h 处是否有值，无值填充，有值则重新获取 h，再填充

### Entry

ThreadLocalMap 的内部类

```java
static class Entry extends WeakReference<ThreadLocal<?>> {
    /** The value associated with this ThreadLocal. */
    Object value;

    Entry(ThreadLocal<?> k, Object v) {
        super(k);
        value = v;
    }
}
```

value 是调用 ThreadLocal 保存的值，

## ThreadLocal 内存泄漏

首先要知道 ThreadLocal 的结构：

Thread 持有 ThreadLocalMap
ThreadLocalMap 持有 Entry 数组
Entry 持有 ThreadLocal 和 value

Enry 是弱引用，但是 value data 是强引用，而这就是内存泄漏的点

Entry 虽然是继承自弱引用，但是存储的 value 是强引用，
所以在 ThreadLocal 仍然存在内存泄漏可能，
即使在 set 时会调用 replaceStaleEntry 来清理数据

最好是在确定线程中不再使用 ThreadLocal 中线程副本时，调用 remove 函数，清除线程副本

## ThreadLocal 线程不安全

```java
class TestThreadLocal {
    private static Person person = new Person(20);
    private static ThreadLocal<Person> threadLocal = new ThreadLocal<>();

    public static void main(String[] args) {
        person.setAge(person.age + 1);
        threadLocal.set(person);
        System.out.println("age = " + threadLocal.get().getAge());
        for (int i = 0; i < 5; i ++) {
            new MyThread().start();
        }
    }

    static class MyThread extends Thread {
        @Override
        public void run() {
            super.run();
            person.setAge(person.age + 1);
            threadLocal.set(person);
//            try {
//                sleep(1);
//            } catch (InterruptedException e) {
//                e.printStackTrace();
//            }
            System.out.println("age = " + threadLocal.get().getAge());
        }
    }
    static class Person {
        int age;
        public Person(int age) {
            this.age = age;
        }
        public int getAge() {
            return age;
        }
        public void setAge(int age) {
            this.age = age;
        }
    }
}


```

打印结果如下：
age = 21
age = 22
age = 23
age = 24
age = 25
age = 26

如果将注释的 sleep 代码放开，打印结果：
age = 21
age = 26
age = 26
age = 26
age = 26
age = 26

我们在主线程与 5 个子线程中改变了 person 的 age 值，使加 1，并打印了 person 的 age 值
ThreadLocal 在每个线程存有一个线程副本，按照理解打印结果应该都是 21 才对，因为每个线程副本取 age 应该都是 20，加 1 就是 21
但从我们执行的情况来看，线程与线程之间的变量值在相互干扰。导致 age 值在不同线程之间也在累加。

这是因为我们在 ThreadLocal 中存有的 person 对象是静态对象的引用，而静态对象全局唯一，导致在不同线程之间的引用，指向了同一个对象。

## 汇总

ThreadLocalMap 為 ThreadLocal 的一個静态内部类，在 Thread 中有一个变量 ThreadLocalMap threadLocals;
ThreadLocalMap 中又有一個静态内部类：Enter，Enter 是继承至弱引用：WeakReference，
Enter 是一个 key、value 结构，key 为 ThreadLocal 对象，value 为 Object 强引用对象，而这就是内存泄露点。

ThreadLocalMap 中有一个 Enter 数组 table，用于存放我们放进区的数据
每次存放數據時，根據使用的 threadLocal 的 hash 值對 table 的長度取余，即为该要存放的数据要在 table 中的下标，
如果该处下标的 value 不为 null，则下标向后移一位，如果到最后一位了，则移到 0 处。
存放数据时。现根据传入的 key 获取 hash，再取余获取对应 index，从下标处还是后移遍历 enter，

- 取到 key 为 enter 的 k 相等，则说明为替换。修改 enter 的 value 即可，并结束操作
- enter 的 k 为 null，代表此处的 key 已被回收
  遍历完后，说明是添加，直接插入到该下标处一个新 Enter 对象

当存放的数据条数大于等于总长度 3/4 时，触发扩容 resize
每次 resize 的长度时上一次的两倍。
resize 时会遍历旧数组，如果 Enter 不为 null 但 key 为 null，代表弱引用被回收，此时直接将 value 置为 null，便于 GC。
使用 key 的 hash 对新数组长度取余，hash 碰撞则后移，与上面的一致。
