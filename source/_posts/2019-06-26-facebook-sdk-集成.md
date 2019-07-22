---
title: facebook sdk 集成
date: 2019-06-26 16:52:30
tags: facebook
---

# Facebook sdk 集成

首先需要在facebook注册一个账号，
自通过账号进入facebook的开发者平台

创建应用，只需要填写应用名即可，回生成一个appid。




## 集成事件功能
1、配置远端maven仓库地址
    在项目android/build.gradle文件
```

buildscript{
    repositories{
        ...
        mavenCentral(); // 添加这行
    }
}


allprojects{
    repositories {
        ...
        mavenCentral() // 添加这行
    }
}

```

2、添加依赖
在app/build.gradle文件中添加依赖
```

dependencies{
    ...
    implementation 'com.facebook.android:facebook-android-sdk:[4,5)' // 添加这行
    // 最新sdk版本为 implementation 'com.facebook.android:facebook-android-sdk:[5,6)' 
}

```

3、添加facebook-app-id
在res/values/string.xml中
```
<string name="facebook_app_id">462119014332748</string> 
<string name="fb_login_protocol_scheme">fb462119014332748</string>
// 462119014332748为你在facebook应用的appid
// fb_login_protocol_scheme应该是用于登陆的
```

在/app/manifest/AndroidManifest.xml中
```
<application>
    <meta-data android:name="com.facebook.sdk.ApplicationId" android:value="@string/facebook_app_id"/> 
    <activity android:name="com.facebook.FacebookActivity"
        android:configChanges= "keyboard|keyboardHidden|screenLayout|screenSize|orientation"
        android:label="@string/app_name" /> 
    <activity android:name="com.facebook.CustomTabActivity"
        android:exported="true">
            <intent-filter>
            <action android:name="android.intent.action.VIEW" /> 
            <category android:name="android.intent.category.DEFAULT" />
            <category android:name="android.intent.category.BROWSABLE" />
            <data android:scheme="@string/fb_login_protocol_scheme" />
        </intent-filter>
    </activity>

</application>
```

4、在facebook开发者控制台配置analytics sdk
在facebook开发者官网，点击「我的应用」即可进入应用控制台，
可以创建应用，只需提供应用名，以及邮箱即可，

点击单个应用即可进入应用控制台进行编辑 
![images]('../images/facebook1.png');
上图是应用可添加的功能，

点击Analytics即将功能添加进应用，点设置，前几步都是提示，
第四步，填入应用id，app/build.gradle中的applicationid，以及应用默认启动的Actiivty，

第五步，填入密钥散列，注意应该要填入两个，一个开发、一个发布，即debug自带的、一个release时通过jks文件签名生成的。
获取方法
```
// macos debug ，按下enter键需要输入开机密码
keytool -exportcert -alias androiddebugkey -keystore ~/.android/debug.keystore | openssl sha1 -binary | openssl base64

// release 
keytool -exportcert -alias YOUR_RELEASE_KEY_ALIAS -keystore YOUR_RELEASE_KEY_PATH | openssl sha1 -binary | openssl base64

```


5、发送事件

上面的1、2、3都只是基本配置，下面是手动发送事件

在MainApplication.java中
FacebookSdk.sdkInitialize 四个初始化方法都已被遗弃， 看到说是不需要初始化了

 在MainApplication.java中
 ```
@Override
    public void onCreate() {
        super.onCreate();

        // facebook 初始化
        FacebookSdk.setIsDebugEnabled(true);
        AppEventsLogger.activateApp(MainApplication.this);
        FacebookSdk.addLoggingBehavior(LoggingBehavior.APP_EVENTS);
    
    }

 ```

注意facebooksdk回自动收集一些事件,如果不需要自动收集功能需要在清单文件中配置

```

<meta-data
    android:name="com.facebook.sdk.AutoLogAppEventsEnabled"
    android:value="false"/>

```

在Actiivty中测试发送自定义事件

```
    @Override
    protected void onResume() {
        super.onResume();
        logEvent();
    }

    private void logEvent() {
        Log.d("========", "logEvent");
        AppEventsLogger logger = AppEventsLogger.newLogger(this);
        logger.logEvent(AppEventsConstants.EVENT_NAME_ACTIVATED_APP);
        logger.logEvent("Test Event");
    }

```

在测试时发现，当打断点调试时发现，发送事件总是会失败，正常运行却可以在facebook分析工具中看得到提交的事件。

***注意，运行时手机需要能连接到facebook后台服务器，大陆用户需要科学上网。***