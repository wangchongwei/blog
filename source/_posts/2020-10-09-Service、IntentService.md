---
title: Service、IntentService
date: 2020-10-09 15:06:04
tags: android
---


# Service、IntentService

Service是android中四大组件之一，用于处理后台任务，不能处理耗时任务，否则会造成ANR
而IntentService继承自Service，但是可以处理耗时任务，因为在内部开启了一个子线程。

## Service生命周期

Service的生命周期分为两种情形，一种是通过startService启动，另一种是通过bindService启动。
在这两种情况下时，Service的生命周期是有差异的。

### startService

通过startService去启动一个Service，
如果该Service未被创建，则会走onCreate、onStartCommand、onStart生命周期
如果该Service已被创建，则不会执行onCreate，只会执行onStartCommand、onStart

onStart为正常运行时的生命周期

而且startService可以被多次调用
被重复调用后会执行下面的生命周期

通过startService启动的Service存活不依赖与Activity，即使启动该Service的Activity已经被销毁，但该Service仍然可以存活。
通过startService启动的Service需要调用stopService来销毁该Service,此时会执行onDestroy周期函数

### bindService

bindService时，Service是依赖Activity的，当当前Activity被销毁、或者调用unBindService时，Service都会被销毁。

所以每一次调用bindService时，Service都会被重新创建
所以通过bindService去启动一个Service，
会走onCreate、onBind生命周期

```
class ServiceConnect() : ServiceConnection {
    override fun onServiceDisconnected(name: ComponentName?) {
        Log.d(TAG, "onServiceDisconnected: ")
    }
    override fun onServiceConnected(name: ComponentName?, service: IBinder?) {
        Log.d(TAG, "onServiceConnected: ")
    }
}
btn_bindService.setOnClickListener {
    var conn = ServiceConnect()
    bindService(Intent(this, MyService::class.java), conn, Context.BIND_AUTO_CREATE)
    hasBind = true
}
```
当执行到onBind时，还会执行onServiceConnected


在Service中，不能执行耗时操作，超过5秒，则会造成程序不响应ANR
当我们需要执行耗时操作时，则必须开启子线程，或者使用IntentService

## IntentService

IntentService有与Service一样的生命周期，
只是在内部开启了一个子线程，暴露onHandleIntent来执行耗时任务，
当子线程执行完就会终止当前Service


IntentService中的部分源码
```

    private final class ServiceHandler extends Handler {
        public ServiceHandler(Looper looper) {
            super(looper);
        }

        @Override
        public void handleMessage(Message msg) {
            onHandleIntent((Intent)msg.obj);
            stopSelf(msg.arg1);
        }
    }

    @Override
    public void onCreate() {
        super.onCreate();
        HandlerThread thread = new HandlerThread("IntentService[" + mName + "]");
        thread.start();

        mServiceLooper = thread.getLooper();
        mServiceHandler = new ServiceHandler(mServiceLooper);
    }

    @Override
    public void onStart(@Nullable Intent intent, int startId) {
        Message msg = mServiceHandler.obtainMessage();
        msg.arg1 = startId;
        msg.obj = intent;
        mServiceHandler.sendMessage(msg);
    }
```

Servicehandler是IntentService的一个内部类，当收到消息时调用onHandleIntent,当执行完，则调用stopSelf，终止当前服务

在OnCreate中，新建了一个HandleThread，并运行。
创建一个Servicehandler，而该ServiceHandler的Looper对象为HandleThread线程中创建的，


当执行到onStart生命周期时，
handler发送一条消息，此时就会走到ServiceHandler中的handlerMessage中，也就会执行onHandleIntent中。
因为mServiceLooper = thread.getLooper();
所以onHandleIntent是运行在HandlerThread中的。



