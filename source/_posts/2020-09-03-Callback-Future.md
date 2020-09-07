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