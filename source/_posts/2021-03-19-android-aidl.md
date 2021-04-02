---
title: android aidl
date: 2021-03-19 11:48:34
tags: android
---



AIDL: Android Interface Definition Language （android接口定义语言）
可以使用AIDL定于跨进程的客户端与服务端通信(IPC)的编程接口.

主要流程是在项目中新建一个aidl文件，此时会自动在src目录下生成aidl目录，并创建包名路径，并在路径下生成命名的aidl文件。

```
package com.justin.ipc.application;

// Declare any non-default types here with import statements

interface IMyAidlInterface {
    /**
     * Demonstrates some basic types that you can use as parameters
     * and return values in AIDL.
     */
    void basicTypes(int anInt, long aLong, boolean aBoolean, float aFloat,
            double aDouble, String aString);

    void setName(String name);

    void getName();
}

```

然后rebuild project，会在app/build/generated/aidl_source_doutput_dir/denug/out/包名/下生成对应的 IMyAidlInterface.java文件

会生成大量代码，首先是接口基本代码：

```
public interface IMyAidlInterface extends android.os.IInterface
{
  /** Default implementation for IMyAidlInterface. */
  public static class Default implements com.justin.ipc.application.IMyAidlInterface
  {
    /**
         * Demonstrates some basic types that you can use as parameters
         * and return values in AIDL.
         */
    @Override public void basicTypes(int anInt, long aLong, boolean aBoolean, float aFloat, double aDouble, java.lang.String aString) throws android.os.RemoteException
    {
    }
    @Override public void setName(java.lang.String name) throws android.os.RemoteException
    {
    }
    @Override public void getName() throws android.os.RemoteException
    {
    }
    @Override
    public android.os.IBinder asBinder() {
      return null;
    }
  }
  ....

  public void basicTypes(int anInt, long aLong, boolean aBoolean, float aFloat, double aDouble, java.lang.String aString) throws android.os.RemoteException;
  public void setName(java.lang.String name) throws android.os.RemoteException;
  public void getName() throws android.os.RemoteException;
}
```

如上代码， 是 IMyAidlInterface.java 文件中代码主体部分，IMyAidlInterface 继承 android.os.IInterface 接口
然后有一个默认的静态内部类 Default 实现 IMyAidlInterface 接口，具体的函数实现都是空，没有具体逻辑。
注意其中的 asBinder 函数，这是 android.os.IInterface 中的方法


### Stub

然后在 IMyAidlInterface 接口类中，还有一个静态内部抽象类 Stub 继承自 android.os.Binder 实现 IMyAidlInterface 接口
而 android.os.Binder 又实现于 IBinder 接口
介于 Binder 对象在系统底层的支持下，Stub 对象就具有了远程传输数据的能力，在生成 Stub 对象的时候会调用 asInterface 方法。

```
public static com.justin.ipc.application.IMyAidlInterface asInterface(android.os.IBinder obj)
{
    if ((obj==null)) {
    return null;
    }
    // 检索 Binder 对象是否是本地接口的实现
    android.os.IInterface iin = obj.queryLocalInterface(DESCRIPTOR);
    if (((iin!=null)&&(iin instanceof com.justin.ipc.application.IMyAidlInterface))) {
    return ((com.justin.ipc.application.IMyAidlInterface)iin);
    }
    return new com.justin.ipc.application.IMyAidlInterface.Stub.Proxy(obj);
}
```
Binder 为什么具有远程通信的能力，因为如上面所说 Stub 继承了 Binder 类
下面是官网对 IBinder 接口的描述：
`
远程对象的基础接口，轻量级远程过程调用机制的核心部分，专为执行进程内和跨进程调用时的高性能而设计。该接口描述了与可远程对象交互的抽象协议。不要直接实现这个接口，而是从Binder扩展。
`
这里我们知道 Binder 实现了 IBinder 接口，也就是说 Binder 具备了远程通信的能力，当不同进程之间（远程）之间通信时，显然使用的是 Stub 的代理对象 Proxy ，
而在 Proxy 中的具体函数中，只是将数据序列号，然后在系统跨进程支持下最终调用 onTransact() 方法

```
@Override public boolean onTransact(int code, android.os.Parcel data, android.os.Parcel reply, int flags) throws android.os.RemoteException
{
    java.lang.String descriptor = DESCRIPTOR;
    switch (code)
    {
    case INTERFACE_TRANSACTION:
    {
        reply.writeString(descriptor);
        return true;
    }
    case TRANSACTION_basicTypes:
    {
        data.enforceInterface(descriptor);
        int _arg0;
        _arg0 = data.readInt();
        long _arg1;
        _arg1 = data.readLong();
        boolean _arg2;
        _arg2 = (0!=data.readInt());
        float _arg3;
        _arg3 = data.readFloat();
        double _arg4;
        _arg4 = data.readDouble();
        java.lang.String _arg5;
        _arg5 = data.readString();
        this.basicTypes(_arg0, _arg1, _arg2, _arg3, _arg4, _arg5);
        reply.writeNoException();
        return true;
    }
    case TRANSACTION_setName:
    {
        data.enforceInterface(descriptor);
        java.lang.String _arg0;
        _arg0 = data.readString();
        this.setName(_arg0);
        reply.writeNoException();
        return true;
    }
    case TRANSACTION_getName:
    {
        data.enforceInterface(descriptor);
        this.getName();
        reply.writeNoException();
        return true;
    }
    default:
    {
        return super.onTransact(code, data, reply, flags);
    }
    }
}
```
显然，这个方法在当系统回调给开发者的时候，传递回来的 code 是一个常量，在跨进程时，每个具体的服务（方法）都会对应一个编号
，然后根据这个编号来执行相应的服务（业务），这里说到了最后要执行的具体业务，
那么这个业务要体现在什么地方呢，从上面可知 Stub 是一个抽象类，那么它所提供的具体业务必然需要一个具体的实现类来完成，
而这个类就是需要我们自己手动根据需要来实现


### Proxy

Proxy 是 Stub 中的一个 静态内部类，实现 IMyAidlInterface 接口

```
private static class Proxy implements com.justin.ipc.application.IMyAidlInterface
{
    private android.os.IBinder mRemote;
    Proxy(android.os.IBinder remote)
    {
    mRemote = remote;
    }
    @Override public android.os.IBinder asBinder()
    {
    return mRemote;
    }
    public java.lang.String getInterfaceDescriptor()
    {
    return DESCRIPTOR;
    }
    /**
        * Demonstrates some basic types that you can use as parameters
        * and return values in AIDL.
        */
    @Override public void basicTypes(int anInt, long aLong, boolean aBoolean, float aFloat, double aDouble, java.lang.String aString) throws android.os.RemoteException
    {
    android.os.Parcel _data = android.os.Parcel.obtain();
    android.os.Parcel _reply = android.os.Parcel.obtain();
    try {
        _data.writeInterfaceToken(DESCRIPTOR);
        _data.writeInt(anInt);
        _data.writeLong(aLong);
        _data.writeInt(((aBoolean)?(1):(0)));
        _data.writeFloat(aFloat);
        _data.writeDouble(aDouble);
        _data.writeString(aString);
        boolean _status = mRemote.transact(Stub.TRANSACTION_basicTypes, _data, _reply, 0);
        if (!_status && getDefaultImpl() != null) {
        getDefaultImpl().basicTypes(anInt, aLong, aBoolean, aFloat, aDouble, aString);
        return;
        }
        _reply.readException();
    }
    finally {
        _reply.recycle();
        _data.recycle();
    }
    }
    @Override public void setName(java.lang.String name) throws android.os.RemoteException
    {
    android.os.Parcel _data = android.os.Parcel.obtain();
    android.os.Parcel _reply = android.os.Parcel.obtain();
    try {
        _data.writeInterfaceToken(DESCRIPTOR);
        _data.writeString(name);
        boolean _status = mRemote.transact(Stub.TRANSACTION_setName, _data, _reply, 0);
        if (!_status && getDefaultImpl() != null) {
        getDefaultImpl().setName(name);
        return;
        }
        _reply.readException();
    }
    finally {
        _reply.recycle();
        _data.recycle();
    }
    }
    @Override public void getName() throws android.os.RemoteException
    {
    android.os.Parcel _data = android.os.Parcel.obtain();
    android.os.Parcel _reply = android.os.Parcel.obtain();
    try {
        _data.writeInterfaceToken(DESCRIPTOR);
        boolean _status = mRemote.transact(Stub.TRANSACTION_getName, _data, _reply, 0);
        if (!_status && getDefaultImpl() != null) {
        getDefaultImpl().getName();
        return;
        }
        _reply.readException();
    }
    finally {
        _reply.recycle();
        _data.recycle();
    }
    }
    public static com.justin.ipc.application.IMyAidlInterface sDefaultImpl;
}

```
可以看到在 Proxy 中的几个具体方法，主要是对数据做序列化处理，然后调用 mRemote.transact(Stub.TRANSACTION_getName, _data, _reply, 0);

mRemote 在 Proxy 的构造函数内被赋值，而 Proxy 是在 Stub 中的 asInterface 函数， 所以又回到了 上面的逻辑。


### 手动实现进程通信

#### Service 
创建一个Service，并运行在其他进程，模拟跨进程调用Service
``` 
public class MyTestAIDLService extends Service {
    public MyTestAIDLService() {
    }

    @Override
    public IBinder onBind(Intent intent) {
        return new MyAIDLTestImp();
    }
}
```
在AndroidManifest.xml文件中，配置Service
```
<service
    android:name=".MyTestAIDLService"
    android:enabled="true"
    android:exported="true"
    android:process=":remote"
    >
</service>
```
其中 process=":remote" 表示运行在另一进程，进程号为： 主进程 + ':remote'


#### MainActivity

写三个按钮，一个绑定服务，一个解绑服务，一个调用服务中的Binder获取数据
```
public class MainActivity extends AppCompatActivity {

    private final String TAG = MainActivity.class.getName() + "MYTEST：";

    private Button btn_bind, btn_unbind, btn_get;

    private IMyAidlInterface interfaces;
    
    private boolean isConnected = false;

    private WebView webView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        btn_bind = findViewById(R.id.bind_server);
        btn_unbind = findViewById(R.id.unbind_server);
        btn_get = findViewById(R.id.btn_getInfo);

        btn_bind.setOnClickListener((View view) -> {
            bindService();
        });
        btn_unbind.setOnClickListener((View view) -> {
           unbindService(); 
        });
        btn_get.setOnClickListener((View view) -> {
            getInfo();
        });
    }

    private void bindService() {
        isConnected = true;
        Intent intent = new Intent(this, MyTestAIDLService.class);
        bindService(intent, connection, Context.BIND_AUTO_CREATE);
    }

    private void unbindService() {
        if(!isConnected) {
            Log.d(TAG, "unbindService: 已解绑，请勿重复提交");
            return;
        }
        isConnected = false;
        unbindService(connection);
        Log.d(TAG, "unbindService: ");
    }

    private void getInfo() {
        try {
            interfaces.setName("name");
            String result = interfaces.getName();
            Log.d(TAG, "getInfo: " + result);
        } catch (RemoteException e) {
            e.printStackTrace();
        }
    }

    private ServiceConnection connection = new ServiceConnection(){
        @Override
        public void onServiceConnected(ComponentName name, IBinder service) {
            Log.d(TAG, "onServiceConnected: ");
            interfaces = IMyAidlInterface.Stub.asInterface(service);
            System.out.println(TAG + "具体的业务对象："+interfaces);
        }

        @Override
        public void onServiceDisconnected(ComponentName name) {
            Log.d(TAG, "onServiceDisconnected: ");
        }

        @Override
        public void onBindingDied(ComponentName name) {
            Log.d(TAG, "onBindingDied: ");
        }
    };
}
```

当我们依次点击绑定服务、获取信息，输出如下：
onServiceConnected: 
具体的业务对象：com.justin.ipc.application.IMyAidlInterface$Stub$Proxy@2b5157
getInfo: name

当我们在 AndroidManifest.xml 中去除Service的 process 配置，即让 service 与 MainActivity处于同一进程时，
输出如下：
onServiceConnected:
具体的业务对象：com.justin.ipc.application.MyAIDLTestImp@da080a
getInfo: name

对比发现，输出的 interfaces 对象不同
原因是在 Stub中 asInterface 函数中 

```
public static com.justin.ipc.application.IMyAidlInterface asInterface(android.os.IBinder obj)
{
    if ((obj==null)) {
    return null;
    }
    android.os.IInterface iin = obj.queryLocalInterface(DESCRIPTOR);
    if (((iin!=null)&&(iin instanceof com.justin.ipc.application.IMyAidlInterface))) {
    return ((com.justin.ipc.application.IMyAidlInterface)iin);
    }
    return new com.justin.ipc.application.IMyAidlInterface.Stub.Proxy(obj);
}
```
当在同一进程中，queryLocalInterface 返回的 iin不为空，此时获取的就是 om.justin.ipc.application.MyAIDLTestImp@da080a

而处于跨进程通信时，queryLocalInterface 返回的 iin 为空，此时会返回 new com.justin.ipc.application.IMyAidlInterface.Stub.Proxy(obj);
一个新的 Proxy 对象，也就是上面的 com.justin.ipc.application.IMyAidlInterface$Stub$Proxy@2b5157

