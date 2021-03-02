---
title: ForkJoinTask
date: 2021-01-27 13:59:20
tags: java
---


# ForkJoinTask

ForkJoin 是采用分而治之的思维，将一个大任务分解为若干个相互独立的子任务（异步），
达到提高运算效率。
我们做一个简单的运算 计算1-100000的累加


```
class TestJoinTask {

    public static void main(String[] args) {
        long currentTime = System.currentTimeMillis();
        ForkJoinPool pool = new ForkJoinPool();
        ForkJoinTask<Integer> task = pool.submit(new MyForkJoinTask(1, 100000));

        try {
            int result = task.get();
            System.out.println("result = " + result);
        } catch (ExecutionException e) {
            e.printStackTrace();
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        System.out.println("线程名" + Thread.currentThread().getName() + "  执行完毕" + "   time = " + (System.currentTimeMillis() - currentTime));
    }

    /**
     * 传入的范型Integer是返回结果类型
     */
    static class MyForkJoinTask extends RecursiveTask<Integer> {

        private int startValue;

        private int endValue;

        private int limitValue = 100;

        public MyForkJoinTask(int startValue, int endValue) {
            if(startValue > endValue) {
                throw new RuntimeException("startValue < endValue");
            }
            this.startValue = startValue;
            this.endValue = endValue;
        }

        @Override
        protected Integer compute() {
            if(endValue - startValue <= limitValue) {
                System.out.println("线程名" + Thread.currentThread().getName() + "  执行计算");
                // 两个值在限制值内 进行计算
                int sum = 0;
                for(int i = startValue; i <= endValue; i ++) {
                    sum += i;
                }
                return sum;
            }
            MyForkJoinTask task1 = new MyForkJoinTask(startValue, (endValue + startValue) / 2);
            task1.fork();
            MyForkJoinTask task2 = new MyForkJoinTask((endValue + startValue) / 2 + 1, endValue);
            task2.fork();
            return task1.join() + task2.join();
        }
    }
}
```
如上所示，我们将一个从0 - 100000的累加任务分解为500个子任务：每200位数累加

在日志打印中，我们可以看到，有多个线程在执行任务，也就是说，分解的任务其实都是提交到线程池中执行，
