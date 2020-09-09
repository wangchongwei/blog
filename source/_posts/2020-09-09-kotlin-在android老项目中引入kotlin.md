---
title: kotlin 在android老项目中引入kotlin
date: 2020-09-09 16:31:56
tags: kotlin
---

# 在android项目中引入kotlin

修改项目的build.gradle 文件


```
buildscript {

    ext {
        kotlin_version = "1.3.10"
    }

    dependencies {
        classpath "org.jetbrains.kotlin:kotlin-gradle-plugin:$kotlin_version"
    }

    ...
}
```

在app/build.gradle中

```
apply plugin: "com.android.application"
// 在顶行下添加
apply plugin: 'kotlin-android'
apply plugin: 'kotlin-android-extensions'

```

然后同步一下即可