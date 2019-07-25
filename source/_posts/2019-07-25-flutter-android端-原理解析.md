---
title: flutter android端 原理解析
date: 2019-07-25 10:32:54
tags: flutter
---

# flutter android端 原理解析

首先看MainActivity，

继承FlutterActivity

再看FlutterActivity代码，继承Activity，实现Provider、PluginRegistry、ViewFactory

```

private final FlutterActivityDelegate delegate = new FlutterActivityDelegate(this, this);
private final FlutterActivityEvents eventDelegate;
private final Provider viewProvider;
private final PluginRegistry pluginRegistry;

public FlutterActivity() {
    this.eventDelegate = this.delegate;
    this.viewProvider = this.delegate;
    this.pluginRegistry = this.delegate;
}

protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    this.eventDelegate.onCreate(savedInstanceState);
}


```

一看delegate就知道代理模式

在生命周期onCrreate中，视图由eventDelegate创建，而该对象在构造函数中被初始化赋值，

FlutterActivityEvents 是一个接口类 继承了ActivityResultListener生命周期、RequestPermissionsResultListener权限请求、ComponentCallbacks2这个类先不管。

FlutterActivityDelegate 就是FlutterActivityEvents类的实现.

看FlutterActivityDelegate类中的onCreate函数

```

public void onCreate(Bundle savedInstanceState) {
        if (VERSION.SDK_INT >= 21) {
            Window window = this.activity.getWindow();
            window.addFlags(-2147483648);
            window.setStatusBarColor(1073741824);
            window.getDecorView().setSystemUiVisibility(1280);
        }

        String[] args = getArgsFromIntent(this.activity.getIntent());
        FlutterMain.ensureInitializationComplete(this.activity.getApplicationContext(), args);
        this.flutterView = this.viewFactory.createFlutterView(this.activity);
        if (this.flutterView == null) {
            FlutterNativeView nativeView = this.viewFactory.createFlutterNativeView();
            this.flutterView = new FlutterView(this.activity, (AttributeSet)null, nativeView);
            this.flutterView.setLayoutParams(matchParent);
            this.activity.setContentView(this.flutterView);
            this.launchView = this.createLaunchView();
            if (this.launchView != null) {
                this.addLaunchView();
            }
        }

        if (!this.loadIntent(this.activity.getIntent())) {
            String appBundlePath = FlutterMain.findAppBundlePath(this.activity.getApplicationContext());
            if (appBundlePath != null) {
                this.runBundle(appBundlePath);
            }
        }
    }



```

首先对android版本做了一个判断，当大于6.0，设置了状态栏颜色，和窗口模式。
























## android端与dart端通信

### 1、dart端调用android端代码

#### 1、原生android代码

新建一个类TestPlugin 实现MethodChannel类里的内部接口类MethodCallHandler。

重写onMethodCall方法，在此处写需要实现的逻辑代码

最后是将插件绑定。

```

public class TestPlugin implements MethodChannel.MethodCallHandler {

    public static final String CHANNEL = "plugin/test";

    static MethodChannel channel;

    // 上下文
    private Activity activity;

    private TestPlugin(Activity activity) {
        this.activity = activity;
    }


    public static void registerWith(PluginRegistry.Registrar registrar) {
        channel = new MethodChannel(registrar.messenger(), CHANNEL);
        TestPlugin plugin = new TestPlugin(registrar.activity());
        // 在此通道上接受方法调用的回调
        channel.setMethodCallHandler(plugin);
    }

    @Override
    public void onMethodCall(MethodCall methodCall, MethodChannel.Result result) {

        if(methodCall.method.equals("test")) {
            Toast.makeText(activity.getApplicationContext(), "测试dart调用android原生插件", Toast.LENGTH_SHORT).show();

            result.success("调用成功");
        }
        // 当未找到该函数
        result.notImplemented();
    }
}


```

在MainActivity中绑定

```

public class MainActivity extends FlutterActivity {
  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    GeneratedPluginRegistrant.registerWith(this);

    registerPlugin(this);

  }


  private void registerPlugin(PluginRegistry registry) {
    TestPlugin.registerWith(registry.registrarFor(TestPlugin.CHANNEL));
  }

}

```

#### 2、在dart中调用该原生方法

```

static const _platform = const MethodChannel('plugin/test');

_toast() {
    /// 调用原生的方法
    _platform.invokeMethod('test');
  }

```

一个原生插件调用就完成了。