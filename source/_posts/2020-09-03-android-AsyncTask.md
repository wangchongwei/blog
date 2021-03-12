---
title: android AsyncTask
date: 2020-09-03 15:04:59
tags: android
---


AsyncTask 顾名思义 即是异步任务。在内部实现了线程的切换，并会一直回调任务进度。
适用于耗时任务、网络请求，并需要与主线程进行交互。

AsyncTask 内部有一个线程池，使用线程池执行任务，并通过Handler 来发送消息、回调状态，任务执行完毕使用Handler与主线程交互，使用Handler一直回调任务进度。

```
public abstract class AsyncTask<Params, Progress, Result>
// Params Progress Result 分别时三个范性，代指参数、任务执行进度、返回结果体

// API 29 与 API 28略有不同
private static final int CORE_POOL_SIZE = 1; // 核心线程数
private static final int MAXIMUM_POOL_SIZE = 20; // 最大线程数
private static final int BACKUP_POOL_SIZE = 5; // 备份线程数
private static final int KEEP_ALIVE_SECONDS = 3; // 空闲线程空闲存活时间
// 线程工厂
private static final ThreadFactory sThreadFactory = new ThreadFactory() {
    // 线程数原子类 保证原子操作
    private final AtomicInteger mCount = new AtomicInteger(1);
    // 重写该方法是为了对线程加 别名 AsyncTask #
    public Thread newThread(Runnable r) {
        return new Thread(r, "AsyncTask #" + mCount.getAndIncrement());
    }
};
// 当任务超出时的拒绝策略。
private static final RejectedExecutionHandler sRunOnSerialPolicy =
    new RejectedExecutionHandler() {
    public void rejectedExecution(Runnable r, ThreadPoolExecutor e) {
        android.util.Log.w(LOG_TAG, "Exceeded ThreadPoolExecutor pool size");
        // As a last ditch fallback, run it on an executor with an unbounded queue.
        // Create this executor lazily, hopefully almost never.
        synchronized (this) {
            if (sBackupExecutor == null) { // 当任务添加到队列失败，并且最大线程数已满，此时会新建一个备份线程池去执行任务
                sBackupExecutorQueue = new LinkedBlockingQueue<Runnable>();
                sBackupExecutor = new ThreadPoolExecutor(
                        BACKUP_POOL_SIZE, BACKUP_POOL_SIZE, KEEP_ALIVE_SECONDS,
                        TimeUnit.SECONDS, sBackupExecutorQueue, sThreadFactory);
                sBackupExecutor.allowCoreThreadTimeOut(true);
            }
        }
        sBackupExecutor.execute(r);
    }
};

public static final Executor THREAD_POOL_EXECUTOR;
// 类加载时就会执行 初始化线程池 注意初入的队列参数为 new SynchronousQueue<Runnable>() 任务添加都会失败，都会开启新线程执行直到最大线程数满
static {
    ThreadPoolExecutor threadPoolExecutor = new ThreadPoolExecutor(
            CORE_POOL_SIZE, MAXIMUM_POOL_SIZE, KEEP_ALIVE_SECONDS, TimeUnit.SECONDS,
            new SynchronousQueue<Runnable>(), sThreadFactory);
    threadPoolExecutor.setRejectedExecutionHandler(sRunOnSerialPolicy);
    THREAD_POOL_EXECUTOR = threadPoolExecutor;
}
```

直接查看 execute 执行任务函数
## execute

execute函数存在重载

```
@MainThread
public final AsyncTask<Params, Progress, Result> execute(Params... params) {
    return executeOnExecutor(sDefaultExecutor, params);
}

@MainThread
public static void execute(Runnable runnable) {
    sDefaultExecutor.execute(runnable);
}
```
当执行execute时，并传入Runnabe时，执行sDefaultExecutor.execute(runnable);
sDefaultExecutor 是 Async 的一个内部类 SerialExecutor 的一个实例对象

```
private static class SerialExecutor implements Executor {
        final ArrayDeque<Runnable> mTasks = new ArrayDeque<Runnable>();
        Runnable mActive;

        public synchronized void execute(final Runnable r) {
            mTasks.offer(new Runnable() {
                public void run() {
                    try {
                        r.run();
                    } finally {
                        scheduleNext();
                    }
                }
            });
            if (mActive == null) {
                scheduleNext();
            }
        }

        protected synchronized void scheduleNext() {
            if ((mActive = mTasks.poll()) != null) {
                THREAD_POOL_EXECUTOR.execute(mActive);
            }
        }
    }
```

如上代码所示，就是在数组队列mTasks队尾添加一个runnable，scheduleNext函数就是弹出队首任务并通过THREAD_POOL_EXECUTOR执行。


再看一下 execute(Params... params) 函数

## execute(Params... params)

```
// 此处传入的 exec 也是 一个 SerialExecutor 对象。
@MainThread
public final AsyncTask<Params, Progress, Result> executeOnExecutor(Executor exec,
        Params... params) {
    // 当一个任务状态不是处于 等待执行 而又执行了这个函数时，会抛出异常。
    if (mStatus != Status.PENDING) {
        switch (mStatus) {
            case RUNNING:
                throw new IllegalStateException("Cannot execute task:"
                        + " the task is already running.");
            case FINISHED:
                throw new IllegalStateException("Cannot execute task:"
                        + " the task has already been executed "
                        + "(a task can be executed only once)");
        }
    }
    // 改变状态为正在执行
    mStatus = Status.RUNNING;

    onPreExecute();

    mWorker.mParams = params;
    // 此处传入的时一个FutureTask 对象 mFuture
    exec.execute(mFuture);

    return this;
}
public enum Status {
        /**
         * 任务等待执行
         */
        PENDING,
        /**
         * 任务正在执行
         */
        RUNNING,
        /**
         * 任务已经完成
         */
        FINISHED,
    }
```

FutureTask 实现 Runnable 接口，但是功能更加丰富，能获取任务执行的结果Result，能主动取消Runnable
exec.execute(mFuture) 最后也会执行到 SerialExecutor 的 execute 函数，也会被添加到 队列队尾，


## InternalHandler

```
private static InternalHandler sHandler;
private static Handler getMainHandler() {
    synchronized (AsyncTask.class) {
        if (sHandler == null) {
            sHandler = new InternalHandler(Looper.getMainLooper());
        }
        return sHandler;
    }
}

private Handler getHandler() {
    return mHandler;
}
private static class InternalHandler extends Handler {
    public InternalHandler(Looper looper) {
        super(looper);
    }

    @SuppressWarnings({"unchecked", "RawUseOfParameterizedType"})
    @Override
    public void handleMessage(Message msg) {
        AsyncTaskResult<?> result = (AsyncTaskResult<?>) msg.obj;
        switch (msg.what) {
            case MESSAGE_POST_RESULT:
                // There is only one result
                result.mTask.finish(result.mData[0]);
                break;
            case MESSAGE_POST_PROGRESS:
                result.mTask.onProgressUpdate(result.mData);
                break;
        }
    }
}
```

全局的mHandler是InternalHandler实例，而且传入的looper对象是 getMainLooper();
所以finish，与 onProgressUpdate 一定会走到main线程


如果通过直接执行AsyncTask中的静态方法execute(Runnable runnable) 来执行runnable时，是不会触发回调， 并且是没有返回的。

因为只有在AsyncTask构造函数内，对mWorker、mFuture、mHandler都做了包装处理。


```
 public AsyncTask(@Nullable Looper callbackLooper) {
    mHandler = callbackLooper == null || callbackLooper == Looper.getMainLooper()
        ? getMainHandler()
        : new Handler(callbackLooper);

    mWorker = new WorkerRunnable<Params, Result>() {
        public Result call() throws Exception {
            mTaskInvoked.set(true);
            Result result = null;
            try {
                Process.setThreadPriority(Process.THREAD_PRIORITY_BACKGROUND);
                //noinspection unchecked
                result = doInBackground(mParams);
                Binder.flushPendingCommands();
            } catch (Throwable tr) {
                mCancelled.set(true);
                throw tr;
            } finally {
                postResult(result);
            }
            return result;
        }
    };

    mFuture = new FutureTask<Result>(mWorker) {
        @Override
        protected void done() {
            try {
                postResultIfNotInvoked(get());
            } catch (InterruptedException e) {
                android.util.Log.w(LOG_TAG, e);
            } catch (ExecutionException e) {
                throw new RuntimeException("An error occurred while executing doInBackground()",
                        e.getCause());
            } catch (CancellationException e) {
                postResultIfNotInvoked(null);
            }
        }
    };
}
```
这是AsyncTask其中一个构造函数，而其他构造函数都会调用到此处，最后都会执行此处逻辑。

