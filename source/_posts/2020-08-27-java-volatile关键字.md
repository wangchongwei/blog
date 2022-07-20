---
title: java volatile 关键字
date: 2020-08-27 17:27:26
tags: java
---

参考： https://www.jianshu.com/p/157279e6efdb
    https://www.jianshu.com/p/e79bdd15a08b
## valotile 可见性

* 任意一个线程修改了 volatile 修饰的变量，其他线程可以马上识别到最新值。实现可见性的原理如下。
* 步骤 1：修改本地内存，强制刷回主内存
* 步骤 2：强制让其他线程的工作内存失效过期。
* 步骤 3：其他线程重新从主内存加载最新值。

1、修改 volatile 变量时会强制将修改后的值刷新的主内存中。

2、修改volatile变量后会导致其他线程工作内存中对应的变量值失效。因此，再读取该变量值的时候就需要重新从读取主内存中的值。


```
class TestThread {
    public static void main(String[] args){
        Work work = new Work();

        new Thread(work::work).start();
        new Thread(work::work).start();
        new Thread(work::work).start();
        new Thread(work::shutdown).start();
        new Thread(work::work).start();
        new Thread(work::work).start();
        new Thread(work::work).start();
    }

    static class Work{
        volatile boolean isShutdown = false;

        void shutdown() {
            System.out.println("shutdown -----");
            isShutdown = true;
            System.out.println("shutdown ---- down");
        }

        void work() {
            while (!isShutdown) {
                System.out.println("work ----");
            }
        }
    }
}

```
上面的代码运行后输出的结果如下：
work ----
work ----
work ----
work ----
work ----
work ----
work ----
work ----
work ----
work ----
work ----
shutdown -----
work ----
shutdown ---- down
work ----
work ----



说明一个问题：
volatile 的可见性，
volatile变量时会强制将修改后的值刷新的主内存
修改volatile变量后会导致其他线程工作内存中对应的变量值失效。因此，再读取该变量值的时候就需要重新从读取主内存中的值。
将主内存的值刷新，其他线程去读取主内存的值是需要一定时间的，



底层实现主要是通过汇编lock前缀指令，它会锁定这块内存区域的缓存（缓存行锁定）并回写到主内存。其中lock前缀指令在多核处理器下会引发两件事情：

会将当前处理器缓存行的数据立即回写到系统内存。
这个写回内存的操作会引起在其他CPU里缓存了该内存地址的数据无效（通过MESI缓存一致性协议）。

## 单个读/写具有原子性
* 单个 volatile 变量的读/写（比如 vl=l）具有原子性，复合操作（比如 i++）不具有原子性

## 互斥性
* 同一时刻只允许一个线程操作 volatile 变量，volatile 修饰的变量在不加锁的场景下也能实现有锁的效果，类似于互斥锁。


## 部分有序性

* 为了性能优化，JMM在不改变正确语义的前提下，会允许编译器和处理器对指令序列进行重排序
* JVM 是使用内存屏障来禁止指令重排，从而达到部分有序性效果

针对 volatile 变量
* 在每个volatile写操作的前面插入一个StoreStore屏障；
* 在每个volatile写操作的后面插入一个StoreLoad屏障；
* 在每个volatile读操作的后面插入一个LoadLoad屏障；
* 在每个volatile读操作的后面插入一个LoadStore屏障。



* **StoreStore屏障**：禁止上面的普通写和下面的volatile写重排序；

* **StoreLoad屏障**：防止上面的volatile写与下面可能有的volatile读/写重排序

* **LoadLoad屏障**：禁止下面所有的普通读操作和上面的volatile读重排序

* **LoadStore屏障**：禁止下面所有的普通写操作和上面的volatile读重排序

