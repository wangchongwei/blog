---
title: react-native 适配androidX
date: 2020-09-15 09:15:50
tags: android
---
# androidX
在API28后，android新增androidX依赖，用于解决以前的android.support.v*依赖混乱问题。
对v1-v9做了合并处理。

然后很多使用的第三方依赖中在新版本都适配了androidX，当你需要使用这些插件的较新版本时，只能去适配androidX。

最近使用react-native-firebase时，被提示必须使用17.0.0+的 Firebase Crashlytics SDK，否则2020年11月15日之后，将不再向firebase发送错误日志。

## 适配androidX

点击andorid studio上方导航栏Refactor/Migrate to AndroidX
这时会提示你，gradle tool version 最低3.2.0
项目中每一个project的build.gradle都需要修改

classpath("com.android.tools.build:gradle:3.2.0")
其中3.2.0为最低版本。

注意，选择的版本可能maven仓库找不到。
如在第三方插件中，设置的maven仓库可能不存在该版本。
如： 我使用的是版本：3.4.0
```
buildscript {
  repositories {
    jcenter()
  }

  dependencies {
    classpath 'com.android.tools.build:gradle:3.4.0'
  }
}

```
此时会报错，404，找不到。
因为在jcenter远程仓库中不存在该版本。

3.4.0的版本只有google的maven仓库中有，所以需要修改

```
repositories {
    google()
    jcenter()
  }
```

查看maven插件地址：https://maven.aliyun.com/mvn/search

同时需要修改每个project的targetSdkVersion

将所有project的版本都修改为3.4.0之后，在点即Migrate to AndroidX,
此时会提示你需要修改的地方，
* java文件，去除一些v*的引入
* build.gradle 去除一些v*的依赖
* manifest.xml 需要修改一些属性，如配置的FileProvider,修改name属性
` android:name="androidx.core.content.FileProvider" `

修改完后，无报错时直接运行。

会有一些java文件报错，就是引入的之前的v*的包，需要手动修改，哪里报错改哪里。

最后运行，运行成功



