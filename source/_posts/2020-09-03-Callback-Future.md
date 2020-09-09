---
title: Callback Future
date: 2020-09-03 15:08:01
tags: java
---

# Future
 
** Future代表一个异步计算的结果，并且它提供一些方法来让调用者检测异步过程是否完成，或者取得异步计算的结果，或者取消正在执行的异步任务。 **

```
public class Test {
    private static ExecutorService executorService = Executors.newSingleThreadExecutor();


    public static void main(String[]args){
        System.out.println("hello world");

        Future<Integer>future = calcute(9);
        while (!future.isDone()){
            try {
                Thread.sleep(100);
            } catch (InterruptedException e) {
                e.printStackTrace();
            } finally {
                System.out.println("正在执行");
            }
        }
        try {
            int result = future.get();
            System.out.println("result = " + result);
        } catch (ExecutionException e) {
            e.printStackTrace();
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }
    
    public static Future<Integer>calcute(Integer i) {
        return executorService.submit(() -> {
            Thread.sleep(1000);
            System.out.println("return future for " + i);
            return i *i;
        });
    }
}
```

一个简单Future使用用例写完，使用线程池+Callback+Future，完成了一个简单的计算操作。

Future是一个接口，先看一下内部方法：

```
public interface Future<V> {
    boolean cancel(boolean var1);

    boolean isCancelled();

    boolean isDone();

    V get() throws ExecutionException, InterruptedException;

    V get(long var1, TimeUnit var3) throws ExecutionException, InterruptedException, TimeoutException;
}
```


get()函数是返回计算结果，注意get会同步操作，每天返回结果前，会阻塞线程。
get还有一个重载函数get(long var1, TimeUnit var3)，第一个参数是时长，第二个是单位。
表示在多少时长内获取结果，如果仍未返回，则抛出异常TimeoutException。
```
try{
    int result2 = future2.get(1000, TimeUnit.MILLISECONDS);
} catch(TimeoutException e) {
    e.printStackTrace();
}
```

cancel(boolean) 表示是否取消该future，

不能在调用cancel(true)/cancel(false)后，调用get()函数，否则会抛出异常CancellationException


isCancelled()函数是判断该future是否已取消

isDone()函数是判断该future是否已完成

isDone()函数是实时状态读取，不会阻塞线程。

## Callback

Callback 是一个接口，内部只有一个函数

```
@FunctionalInterface
public interface Callable<V> {
    V call() throws Exception;
}

```

Callback 可以理解为一个执行任务，如上面例子中的计算


## FutureTask介绍

Future是一个接口，
RunnableFuture也是一个接口，继承Future、Runnable两个接口
```
public interface RunnableFuture<V> extends Runnable, Future<V> {
    /**
     * Sets this Future to the result of its computation
     * unless it has been cancelled.
     */
    void run();
}

```
而FutureTask是对RunnableFuture的基本实现

FutureTask 有一个状态值
```
/*
* 状态值存在如下几种变化：
* Possible state transitions:
* NEW -> COMPLETING -> NORMAL
* NEW -> COMPLETING -> EXCEPTIONAL
* NEW -> CANCELLED
* NEW -> INTERRUPTING -> INTERRUPTED
*/
private volatile int state;
private static final int NEW          = 0;
private static final int COMPLETING   = 1;
private static final int NORMAL       = 2;
private static final int EXCEPTIONAL  = 3;
private static final int CANCELLED    = 4;
private static final int INTERRUPTING = 5;
private static final int INTERRUPTED  = 6;
```


