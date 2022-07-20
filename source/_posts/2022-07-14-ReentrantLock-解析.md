---
title: ReentrantLock 解析
date: 2022-07-14 16:42:29
tags: java
---

参考地址： https://blog.csdn.net/persistence_PSH/article/details/114504207

## 1. ReentrantLock

* ReentrantLock是基于AQS实现，AQS的基础又是CAS


* ReentrantLock 中有三个内部类
```java
public class ReentrantLock implements Lock, java.io.Serializable {

    abstract static class Sync extends AbstractQueuedSynchronizer{...}

    // 非公平锁
    static final class NonfairSync extends Sync {...}
    // 公平锁
    static final class FairSync extends Sync {...}

    //默认为非公平锁
    public ReentrantLock() {
        sync = new NonfairSync();
    }
	//可以通过构建对象时传入的boolean来设定锁是否公平
    public ReentrantLock(boolean fair) {
        sync = fair ? new FairSync() : new NonfairSync();
    }
	//获取锁
    public void lock() {
        sync.lock();
    }
	//尝试获取锁
    public boolean tryLock() {
        return sync.nonfairTryAcquire(1);
    }
	//尝试获取锁，参数为尝试的时间和时间单位
    public boolean tryLock(long timeout, TimeUnit unit)
            throws InterruptedException {
        return sync.tryAcquireNanos(1, unit.toNanos(timeout));
    }
	//释放锁
    public void unlock() {
        sync.release(1);
    }
}
```
以上是 ReentrantLock 类中的一些主要结构

看到 Sync 类其实是继承 AbstractQueuedSynchronizer



## 2. AbstractQueuedSynchronizer

* 定义
```java
public abstract class AbstractQueuedSynchronizer
    extends AbstractOwnableSynchronizer
    implements java.io.Serializable {}
```

* 构造器

```java
protected AbstractQueuedSynchronizer() { }
```

### 2.1 静态内部类Node

* ReentrantLock实现的前提就是AbstractQueuedSynchronizer，简称AQS，是java.util.concurrent的核心，CountDownLatch、FutureTask、Semaphore、ReentrantLock等都有一个内部类是这个抽象类的子类

AQS内部有一个内部类Node，每个node都是一个节点

```java
static final class Node{
    
		//表示Node处于共享模式
 		static final Node SHARED = new Node();
        //表示Node处于独占模式
        static final Node EXCLUSIVE = null;
    
     	//因为超时或者中断，Node被设置为取消状态，被取消的Node不应该去竞争锁，只能保持取消状态不变，不能转换为其他状态，处于这种状态的Node会被踢出队列，被GC回收
        static final int CANCELLED =  1;
       //表示这个Node的继任Node被阻塞了，到时需要通知它
        static final int SIGNAL    = -1;
        //表示这个Node在条件队列中，因为等待某个条件而被阻塞 
        static final int CONDITION = -2;
       //使用在共享模式头Node有可能处于这种状态， 表示锁的下一次获取可以无条件传播
        static final int PROPAGATE = -3;
        
    	//0，新Node会处于这种状态 
        volatile int waitStatus;
        //队列中某个Node之前的Node 
        volatile Node prev;
		//队列中某个Node之后的Node 
        volatile Node next;
    
        //这个Node持有的线程，表示等待锁的线程
        volatile Thread thread;
		//表示下一个等待condition的Node
        Node nextWaiter;
    
    
    	//三个构造器
    	Node() {   
        }

        Node(Thread thread, Node mode) {    
            this.nextWaiter = mode;
            this.thread = thread;
        }

        Node(Thread thread, int waitStatus) {
            this.waitStatus = waitStatus;
            this.thread = thread;
        }
}

```
可以看得出来，Node 本身具备一种数据结构 双向链表

* AQS中有的变量

```java
//FIFO队列中的头Node
	private transient volatile Node head;

 	//FIFO队列中的尾Node
    private transient volatile Node tail;

    //同步状态，0表示未锁
    private volatile int state;
```

* AQS是典型的模板模式的应用，FIFO队列的各种操作在AQS中已经实现，AQS的子类一般只需要重写tryAcquire(int arg)和tryRelease(int arg)两个方法即可。

## 3. ReentrantLock的实现


* ReentrantLock根据传入构造方法的布尔型参数实例化出Sync的实现类FairSync和NonfairSync，分别表示公平的Sync和非公平的Sync。
* ReentrantLock使用较多的为是非公平锁，因为非公平锁吞吐量大

下面都是以非公平锁举例：

### lock

* 假设线程1调用了ReentrantLock的lock()方法，那么线程1将会独占锁：

```java
final void lock() {
    if (compareAndSetState(0, 1))
        setExclusiveOwnerThread(Thread.currentThread());
    else
        acquire(1);
}
```

* 第一个获取锁的线程就做了两件事情：
  - 1、设置AbstractQueuedSynchronizer的state为1
  - 2、设置AbstractOwnableSynchronizer的thread为当前线程  

* 这两步做完之后就表示线程1独占了锁。然后线程2也要尝试获取同一个锁，在线程1没有释放锁的情况下，线程2会阻塞。
因为锁已被线程1占有，此时 status = 1， 所以在 lock 函数中，会走到 else 中

acquire 函数是在父类 AbstractQueuedSynchronizer 中实现的。

```java
public final void acquire(int arg) {
    //第一个判断条件尝试获取一次锁，如果获取的结果为false，才会走第二个判断条件添加FIFO等待队列
    if (!tryAcquire(arg) &&acquireQueued(addWaiter(Node.EXCLUSIVE), arg))
        selfInterrupt();
}

static void selfInterrupt() {
    Thread.currentThread().interrupt();
}
```

当调用 acquire 时，会调用 addWaiter 函数 & acquireQueued 函数

* addWaiter
```java
private Node addWaiter(Node mode) {
  //创建一个当前线程的Node，模式为独占模式（因为传入的mode是一个NULL）
    Node node = new Node(mode);
  //死循环
    for (;;) {
        Node oldTail = tail;
        //尾部的node部位不为空，则等待队列不为空，线程2为第一个需要添加到等待队列的，因为多线程并发，所以等待队列有可能不为空
        if (oldTail != null) {
            U.putObject(node, Node.PREV, oldTail);
            if (compareAndSetTail(oldTail, node)) {
              // oldTail 没有被其他线程修改，此时将 传入的 node 节点放置在 链表的尾部
                oldTail.next = node;
                return node;
            }
        } else {
          // 初始化链表
            initializeSyncQueue();
        }
    }
}
```

* acquireQueued

```java
final boolean acquireQueued(final Node node, int arg) {
    try {
        boolean interrupted = false;
        //死循环：
        for (;;) {
            final Node p = node.predecessor();
            //再次判断一下线程2能不能获取锁（可能这段时间内线程1已经执行完了把锁释放了，state变为了0）
            if (p == head && tryAcquire(arg)) {
                setHead(node);
                p.next = null; // help GC
                return interrupted;
            }
            //不能，则调用AQS的shouldParkAfterFailedAcquire(p, node)方法，第一次会得到false,继续循环，第二次才会走第二个判断条件
            if (shouldParkAfterFailedAcquire(p, node) &&
                parkAndCheckInterrupt())
                interrupted = true;
        }
    } catch (Throwable t) {
        cancelAcquire(node);
        throw t;
    }
}
```
* 当线程2仍无法获取到锁时，会调用 shouldParkAfterFailedAcquire &&  parkAndCheckInterrupt 进行判断，是否进行阻塞

  - shouldParkAfterFailedAcquire
```java
 private static boolean shouldParkAfterFailedAcquire(Node pred, Node node) {
     //第一次这个waitStatus是h的waitStatus，很明显是0，第二次为-1，会返回true
     int s = pred.waitStatus;
     if (s < 0)
         return true;
     if (s > 0) {  
     do {
     node.prev = pred = pred.prev;
     }
      while (pred.waitStatus > 0);
     pred.next = node;
     }
     else
         //把h的waitStatus设置为Noed.SIGNAL即-1并返回false
         compareAndSetWaitStatus(pred, 0, Node.SIGNAL);
     return false;
}
```
  - parkAndCheckInterrupt

```java
private final boolean parkAndCheckInterrupt() {
    //阻塞住了当前的线程
    LockSupport.park(this);
    return Thread.interrupted();
}
public static void park(Object blocker) {
    Thread t = Thread.currentThread();
    setBlocker(t, blocker);
    unsafe.park(false, 0L);
    setBlocker(t, null);
}
```

### tryLock

* 在上面的代码中可以看到，tryLock 会执行 tryAcquireNanos 函数

```java
final boolean nonfairTryAcquire(int acquires) {
  final Thread current = Thread.currentThread();
//由于state是volatile的，所以state对线程2具有可见性，线程2拿到最新的state
  int c = getState();
  //再次判断一下能否持有锁（可能线程1同步代码执行得比较快，这会儿已经释放了锁）
  if (c == 0) {
        if (compareAndSetState(0, acquires)) {
          setExclusiveOwnerThread(current);
          return true;
        }
  } //判断当前线程和持有锁的线程是否相同
    //让某个线程可以多次调用同一个ReentrantLock，每调用一次给state+1，由于某个线程已经持有了锁，所以这里不会有竞争，因此不需要利用CAS设置state（相当于一个偏向锁*）。从这段代码可以看到，nextc每次加1，当nextc<0的时候抛出error，那么同一个锁最多能重入Integer.MAX_VALUE次
    else if (current == getExclusiveOwnerThread()) {
      int nextc = c + acquires;
      if (nextc < 0) // overflow
          throw new Error("Maximum lock count exceeded");
      setState(nextc);
        return true;
    }
    return false;
}
```

* 上面部分是加锁部分，接下来看看解锁部分

### unlock

```java
public void unlock() {
    sync.release(1);
}
```
release 函数会调用到 AbstractQueuedSynchronizer 中的 release
会调用 tryRelease 进行判断

```java

public final boolean release(int arg) {
    if (tryRelease(arg)) {
        Node h = head;
        if (h != null && h.waitStatus != 0)
            unparkSuccessor(h);
        return true;
    }
    return false;
}

protected boolean tryRelease(int arg) {
    throw new UnsupportedOperationException();
}
```

* 但是 tryRelease 会直接抛出异常，也就是说，会调用子类中的 tryRelease 函数

***tryRelease 函数为何不写成抽象函数？***

#### tryRelease

```java
protected final boolean tryRelease(int releases) {
    //每次执行该方法，state都会减1
    int c = getState() - releases;
    //判断当前线程和持有锁的线程是否相等，不相等抛异常
    if (Thread.currentThread() != getExclusiveOwnerThread())
        throw new IllegalMonitorStateException();
    boolean free = false;
    // 只有当c==0的时候才会让free=true，这和上面一个线程多次调用lock方法累加state是对应的，
    // 调用了多少次的lock()方法自然必须调用同样次数的unlock()方法才行，这样才把一个锁给全部解开
    // 同一个线程可能持有多次锁
    if (c == 0) {
        free = true;
        //设置占有锁的线程为空
        setExclusiveOwnerThread(null);
    }
    setState(c);
    return free;
}
```

* 当返回 free 为 true 时，release 函数中会执行 unparkSuccessor() 函数

```java

 private void unparkSuccessor(Node node) {
		//下一个Node，也就是线程2
     Node s = node.next;
     if (s == null || s.waitStatus > 0) {
         s = null;
        for (Node t = tail; t != null && t != node; t = t.prev)
             if (t.waitStatus <= 0)
                 s = t;
    }
     //等待队列不为空，执行unPark
     if (s != null)
         LockSupport.unpark(s.thread);
}
// LockSupport.unpark
public static void unpark(Thread thread) {
    if (thread != null)
        //jvm进行实现
        UNSAFE.unpark(thread);
}
```


**锁被解了怎样保证整个FIFO队列减少一个Node，回到了AQS的acquireQueued方法了**

回到上面讲过的未获取到锁的线程被阻塞的 acquireQueued 函数中：

```java
final boolean acquireQueued(final Node node, int arg) {
    try {
        boolean interrupted = false;
        //死循环：
        for (;;) {
            final Node p = node.predecessor();
            //再次判断一下线程2能不能获取锁（可能这段时间内线程1已经执行完了把锁释放了，state变为了0）
            if (p == head && tryAcquire(arg)) {
                setHead(node);
                p.next = null; // help GC
                return interrupted;
            }
            //不能，则调用AQS的shouldParkAfterFailedAcquire(p, node)方法，第一次会得到false,继续循环，第二次才会走第二个判断条件
            if (shouldParkAfterFailedAcquire(p, node) &&
                parkAndCheckInterrupt())
                interrupted = true;
        }
    } catch (Throwable t) {
        cancelAcquire(node);
        throw t;
    }
}
```

* 被阻塞的线程2是被阻塞了，但是此处并没有return语句，所以，阻塞完成线程2依然会进行for循环。
* 然后，阻塞完成了，线程2所在的Node的前驱Node是p，线程2尝试tryAcquire，成功，然后线程2就成为了head节点了，把p的next设置为null，这样原头Node里面的所有对象都不指向任何块内存空间，h属于栈内存的内容，方法结束被自动回收，这样随着方法的调用完毕，原头Node也没有任何的引用指向它了，这样它就被GC自动回收了。此时，遇到一个return语句，acquireQueued方法结束


* setHead

```java
private void setHead(Node node) {
    head = node;
    node.thread = null;
    node.prev = null;
}
```

**setHead方法里面的前驱Node是Null，也没有线程，那么为什么不用一个在等待的线程作为Head Node呢？**
> 因为一个线程随时有可能因为中断而取消，而取消的话，Node自然就要被GC了，那GC前必然要把头Node的后继Node变为一个新的头而且要应对多种情况，这样就很麻烦。
> 用一个没有thread的Node作为头，相当于起了一个引导作用，因为head没有线程，自然也不会被取消。
>
> 从尾到头遍历，找出离head最近的一个node，对这个node进行unPark操作。


> 个人解读： 因为不知道之前被阻塞的线程会处于何种状态，直接让链表中下一个节点获取锁，可能会发生一些异常。
> 所以直接只释放锁，让各个线程再次抢占，这也是非公平锁的原理。
> 锁释放时，不是直接在阻塞链表中取下一个节点的线程，而且所有节点再次抢占，甚至可能让最新进来的线程获取到锁

### ReentrantLock 中的其他函数

* getHoldCount 获取state值
    - 获取到state值，也就知道了锁的状态
```java
final int getHoldCount() {
    return isHeldExclusively() ? getState() : 0;
}
```

* getOwner 获取占有锁的线程
```java
//获取当前占有锁的线程，就是AbstractOwnableSynchronizer中exclusiveOwnerThread的值
final Thread getOwner() {
    return getState() == 0 ? null : getExclusiveOwnerThread();
}
```

* getQueuedThreads 获取所有阻塞的线程
```
//从尾到头遍历一下，添加进ArrayList(等待队列)中
public final Collection<Thread> getQueuedThreads() {
    ArrayList<Thread> list = new ArrayList<Thread>();
    for (Node p = tail; p != null; p = p.prev) {
        Thread t = p.thread;
        if (t != null)
            list.add(t);
    }
    return list;
}
```

## 死锁问题

### 如何出现死锁
* 多个线程获取多个锁，形成了循环依赖锁，导致死锁
  * 线程A获取到锁1，并尝试获取锁2。
  * 线程B获取到锁2，并尝试获取锁1。
  * 线程A获取到锁1时，锁2已经被线程B获取。
  * 此时就形成了死锁

* 测试的线程类
```kotlin
class TestDeadLock(var flag: Boolean, var any1: Any, var any2: Any) : Runnable {

    override fun run() {
        if(flag) {
            synchronized(any1) {
                println("${flag} 线程: 获取到any1的锁")
                Thread.sleep(1000)

                synchronized(any2) {
                    println("${flag} 线程: 获取到any2的锁")
                }
            }
        } else {
            synchronized(any2) {
                println("${flag} 线程: 获取到any2的锁")
                Thread.sleep(1000)

                synchronized(any1) {
                    println("${flag} 线程: 获取到any1的锁")
                }
            }
        }
        println("${flag} 线程: 未出现死锁!!!")
    }
}
```
* 多个线程调用锁的地方
```kotlin
binding.deadLock.setOnClickListener {
            val any1 = Any()
            val any2 = Any()
            val thread1: Thread = Thread(TestDeadLock(true, any1, any2))
            val thread2: Thread = Thread(TestDeadLock(false, any1, any2))

            thread1.start()
            thread2.start()
        }
```
最后可以发现， "未出现死锁!!!" 这一句输出永远不会出现，
因为此时已经死锁

### 如何避免
* synchronized 锁的对象保持顺序一致，
  * 如上面示例，将 else 中 any2 与 any1 顺序对调以下即可避免死锁
* lock 锁的顺序保持一致
  