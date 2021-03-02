---
title: java ThreadLocal解析
date: 2020-08-28 13:46:49
tags: java
---

# ThreadLocal

ThreadLocal 是一个线程的内部存储类，对于被存储的对象，在不同的线程读取的变量是独立的。

实现原理是：对每一个线程都有一个ThreadLocalMap，ThreadLocal维护每个ThreadLocalMap中的值
ThreadLocalMap 内部是一个[]Enter, 不同的ThreadLocal都是存储在线程的同一个ThreadLocalMap中的，只是下标位置不同，
同一个ThreadLocal在不同线程的ThreadLocalMap中的下标值即索引值是相同的。

## ThreadLocal 方法解析


ThreadLocal 最常用的示例：
```
ThreadLocal<String> threadLocal = new ThreadLocal<String>();
threadLocal.set("1");
String name = threadLocal.get();
```
在主线程初始化ThreadLocal实例，在各个线程调用set、get，设置、获取存储在各个线程中的值

查看源码

### set

```
public void set(T value) {
    Thread t = Thread.currentThread();
    ThreadLocalMap map = getMap(t);
    if (map != null)
        map.set(this, value);
    else
        createMap(t, value);
}
```

当调用set函数时，会去获取当前线程的ThreadLocalMap对象，该对象是在Thread.java中申明，默认值为null。
当map为null时，则调用createMap,为threadLocals对象赋值，不为null，在调用ThreadLocalMap中的set函数，将值保存到数组中


### get
```
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

当调用get方法时，获取当前线程的ThreadLocalMap对象，如果map不为null，则获取map持有的Entry对象，再返回该Entry对象持有的value值。
如果map为null或者获取的Enter对象为null，则会调用setInitialValue，而initialValue的返回值是null。
当map为null时，会调用createMap方法，实例化ThreadLocalMap



上面的set、get都会调用getMap方法，来获取当前线程的ThreadLocalMap实例

### getMap

```
ThreadLocalMap getMap(Thread t) {
        return t.threadLocals;
    }
```


threadLocals 是在Thread.java中声明的，默认值为null，也就是说每个线程中都有这个对象，只是默认是null。



### createMap
在set、get中都会对当前线程的ThreadLocalMap对象判断，当为null时，会调用createMap对ThreadLocalMap对象threadLocals赋值，

```
void createMap(Thread t, T firstValue) {
        t.threadLocals = new ThreadLocalMap(this, firstValue);
    }
```


## ThreadLocalMap
```
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

getEntry 函数就是获取key对应的节点Entry
在getEntry、set函数中可以看到value存储在[]Entry中的下标位置是由 key.threadLocalHashCode & (len-1)计算得出的。
就是ThreadLocal中的threadLocalHashCode 对[]Entry长度取模
getEntry，通过下标获取e，如果不为null而且再次校验key相等，则返回e
set时，e不为null，而且key相等，代表已存在，则替换e.value，
key不相等，代表不存在，而添加


```
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

当Entry[] 中存入的值数量已达到数组长度的3/4；
则会调用resize函数，调整Entry[]的长度，
将新数组长度*2，遍历老数组，
重新获取下标h，判断h处是否有值，无值填充，有值则重新获取h，再填充



### Entry
ThreadLocalMap 的内部类

```
static class Entry extends WeakReference<ThreadLocal<?>> {
    /** The value associated with this ThreadLocal. */
    Object value;

    Entry(ThreadLocal<?> k, Object v) {
        super(k);
        value = v;
    }
}
```

value是调用ThreadLocal保存的值，




## ThreadLocal 内存泄漏

首先要知道ThreadLocal的结构：

Thread 持有 ThreadLocalMap 
ThreadLocalMap 持有 Entry数组
Entry 持有 ThreadLocal 和 value 

Enry是弱引用，但是 value data是强引用，而这就是内存泄漏的点


Entry虽然是继承自弱引用，但是存储的value是强引用，
所以在ThreadLocal仍然存在内存泄漏可能，
即使在set时会调用 replaceStaleEntry 来清理数据

最好是在确定线程中不再使用ThreadLocal中线程副本时，调用remove函数，清除线程副本


## ThreadLocal线程不安全


```
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


````

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


我们在主线程与5个子线程中改变了person的age值，使加1，并打印了person的age值
ThreadLocal在每个线程存有一个线程副本，按照理解打印结果应该都是21才对，因为每个线程副本取age应该都是20，加1就是21
但从我们执行的情况来看，线程与线程之间的变量值在相互干扰。导致age值在不同线程之间也在累加。

这是因为我们在ThreadLocal中存有的person对象是静态对象的引用，而静态对象全局唯一，导致在不同线程之间的引用，指向了同一个对象。




