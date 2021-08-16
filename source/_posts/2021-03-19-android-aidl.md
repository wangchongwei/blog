---
title: android aidl
date: 2021-03-19 11:48:34
tags: android
---

AIDL: Android Interface Definition Language （android 接口定义语言）
可以使用 AIDL 定于跨进程的客户端与服务端通信(IPC)的编程接口.

主要流程是在项目中新建一个 aidl 文件，此时会自动在 src 目录下生成 aidl 目录，并创建包名路径，并在路径下生成命名的 aidl 文件。

```java
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

然后 rebuild project，会在 app/build/generated/aidl_source_doutput_dir/denug/out/包名/下生成对应的 IMyAidlInterface.java 文件

会生成大量代码，首先是接口基本代码：

```java
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

```java
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
`远程对象的基础接口，轻量级远程过程调用机制的核心部分，专为执行进程内和跨进程调用时的高性能而设计。该接口描述了与可远程对象交互的抽象协议。不要直接实现这个接口，而是从Binder扩展。`
这里我们知道 Binder 实现了 IBinder 接口，也就是说 Binder 具备了远程通信的能力，当不同进程之间（远程）之间通信时，显然使用的是 Stub 的代理对象 Proxy ，
而在 Proxy 中的具体函数中，只是将数据序列号，然后在系统跨进程支持下最终调用 onTransact() 方法

```java
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

```java
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

可以看到在 Proxy 中的几个具体方法，主要是对数据做序列化处理，然后调用 mRemote.transact(Stub.TRANSACTION_getName, \_data, \_reply, 0);

mRemote 在 Proxy 的构造函数内被赋值，而 Proxy 是在 Stub 中的 asInterface 函数， 所以又回到了 上面的逻辑。

### 手动实现进程通信

#### Service

创建一个 Service，并运行在其他进程，模拟跨进程调用 Service

```java
public class MyTestAIDLService extends Service {
    public MyTestAIDLService() {
    }

    @Override
    public IBinder onBind(Intent intent) {
        return new MyAIDLTestImp();
    }
}
```

在 AndroidManifest.xml 文件中，配置 Service

```xml
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

写三个按钮，一个绑定服务，一个解绑服务，一个调用服务中的 Binder 获取数据

```java
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

当我们在 AndroidManifest.xml 中去除 Service 的 process 配置，即让 service 与 MainActivity 处于同一进程时，
输出如下：
onServiceConnected:
具体的业务对象：com.justin.ipc.application.MyAIDLTestImp@da080a
getInfo: name

对比发现，输出的 interfaces 对象不同
原因是在 Stub 中 asInterface 函数中

```java
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

当在同一进程中，queryLocalInterface 返回的 iin 不为空，此时获取的就是 om.justin.ipc.application.MyAIDLTestImp@da080a

而处于跨进程通信时，queryLocalInterface 返回的 iin 为空，此时会返回 new com.justin.ipc.application.IMyAidlInterface.Stub.Proxy(obj);
一个新的 Proxy 对象，也就是上面的 com.justin.ipc.application.IMyAidlInterface$Stub$Proxy@2b5157

### 跨进程通信的身份认证

在跨进程通信时，可能需要对通信双方进行安全认证
认证方式一般包括：自定义权限、数据认证

#### 自定义权限

自定义权限，一般适用于需要提供功能给第三方应用使用时，做一个权限认证。
需要我们先在自己应用中申明我们的自定义权限

#### 申明自定义权限

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.justin.ipc.application">

    ...

    <permission
        android:name="com.justin.custom.permission.PERSONAL"
        android:description="自定义权限描述"
        android:permissionGroup="MINE_CUSTOM_PERMISSION_GROUP"
        android:protectionLevel="normal"
    />

    ...
</manifest>
```

解释下各个属性：

- name，该标签就是权限的名字。
- 您需要为权限提供标签和说明。这些是用户在查看权限列表 (android:label) 或有关单个权限的详细信息 (android:description) 时能够看到的字符串资源。标签应当简短，用几个词描述该权限所保护的关键功能。说明应该用几个句子描述权限允许权限获得者执行哪些操作。我们通常会使用包含两个句子的说明：第一句描述权限；第二句提醒用户在向应用授予权限后可能会出现哪类错误。
- android:permissionGroup 属性为可选项，仅用于帮助系统向用户显示权限。在大多数情况下，您应将其设置为标准系统组（在 android.Manifest.permission_group 中列出），但您也可以自行定义组。最好使用现有的组，因为这可以简化用户看到的权限界面。
- protectionLevel 属性为必需项，用于指示系统如何向用户告知哪些应用正在请求权限或者谁可以获得该权限

Android 将权限分为若干个保护级别:normal, dangerous, signature 等。
normal 就是正常权限，该权限并不会给用户或者设备的隐私带来风险； 在 6.0 后不需要动态申请
dangerous 就是危险权限，该级别的权限通常会给用户的数据或设备的隐私带来风险； 在 6.0 后需要动态申请
signature 指的是，只有相同签名的应用才能使用该权限。 在 6.0 后需要动态申请

#### 使用

当我们申明了自定义权限后，在其他应用中使用时，就与系统的权限使用是一样的配置。

而我们也会对权限进行校验
