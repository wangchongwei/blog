---
title: kotlin 在android老项目中引入kotlin
date: 2020-09-09 16:31:56
tags: kotlin
---

# 在android项目中引入kotlin

存在两种方法
* 1、手动修改，在module/build.gradle中添加kotlin依赖
* 2、使用android studio 等ide工具
## 在项目引入kotlin依赖

修改项目的build.gradle 文件中


buildscript {

    ext {
        kotlin_version = "1.3.10"
    }

    dependencies {
        classpath "org.jetbrains.kotlin:kotlin-gradle-plugin:$kotlin_version"
    }
}

在app/build.gradle中

```
apply plugin: "com.android.application"
// 在顶行下添加
apply plugin: 'kotlin-android'
apply plugin: 'kotlin-android-extensions'

```

然后同步一下即可


## 在andorid studio操作

点击 android studio工具栏的 Tools -> Kotlin -> Configure Kotlin in Project

此时会弹窗选择需要添加kotlin依赖的module，可以选择某个modulw，也可以选择项目






## android studio 一键转换java代码为kotlin代码


选中某个java文件，需要该文件聚焦，
然后点击android studio工具栏  Code -> Convert Java File to Kotlin File
