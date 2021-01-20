---
title: Synchronized详解
date: 2020-09-03 15:26:31
tags: java
---


# Synchronized详解


Synchronized是内置锁，锁的是对象，
Synchronized 有几个使用方式，但其实都是作用于对象。


* 1、作用于方法块
* 2、作用于obj
* 3、作用于this
* 4、作用于class


```
public synchronized void lockFun() {
    try {
        Thread.sleep(10);
        System.out.println("当前线程Name: " + Thread.currentThread().getName());
        Thread.sleep(10);
        System.out.println("当前线程Name: " + Thread.currentThread().getName() + "结束");
    } catch (InterruptedException e) {
        e.printStackTrace();
    }
}

public void lockThis() {
    synchronized (this) {
        try {
            Thread.sleep(10);
            System.out.println("当前线程Name: " + Thread.currentThread().getName());
            Thread.sleep(10);
            System.out.println("当前线程Name: " + Thread.currentThread().getName() + "结束");
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }
}

```
上面的示例代码中，lockFun是作用于方法块，lockThis是作用于this，但实际上这两个函数都是作用于当前的类的实例对象上的

```
public void lockClass() {
    synchronized (Test.class) {
        
    }
}

public static synchronized void lockStatic() {
    
}

```
而在lockClass与lockStatic中，lockStatic作用与static静态函数，lockClass作用与Test.class对象，但实际都是作用与Test的所有实例对象

```
public void lockObj(Object o) {
    synchronized (o){
        
    }
}
```
lockObj就是直接作用于Object对象。
