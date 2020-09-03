---
title: java volatile关键字
date: 2020-08-27 17:27:26
tags: java
---

## valotile 可见性
1、修改volatile变量时会强制将修改后的值刷新的主内存中。

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
volatile的可见性，
volatile变量时会强制将修改后的值刷新的主内存
修改volatile变量后会导致其他线程工作内存中对应的变量值失效。因此，再读取该变量值的时候就需要重新从读取主内存中的值。
将主内存的值刷新，其他线程去读取主内存的值是需要一定时间的，

