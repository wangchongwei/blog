---
title: jetpack Room
date: 2021-12-22 18:44:10
tags: Jetpack
---

**使用 Room 将数据保存到本地数据库**

Room 在 SQLite 上提供了一个抽象层，以便在充分利用 SQLite 的强大功能的同时，能够流畅地访问数据库。

处理大量结构化数据的应用可极大地受益于在本地保留这些数据。最常见的用例是缓存相关数据。这样，当设备无法访问网络时，用户仍可在离线状态下浏览相应内容。设备重新连接到网络后，用户发起的所有内容更改都会同步到服务器。

由于 Room 负责为您处理这些问题，因此我们强烈建议您使用 Room（而不是 SQLite）。不过，如果您想直接使用 SQLite API，请参阅使用 SQLite 保存数据。

如需在应用中使用 Room，请将以下依赖项添加到应用的 build.gradle 文件。

```groovy
dependencies {
    def room_version = "2.3.0"

    implementation "androidx.room:room-runtime:$room_version"
    annotationProcessor "androidx.room:room-compiler:$room_version"

    // optional - RxJava2 support for Room
    implementation "androidx.room:room-rxjava2:$room_version"

    // optional - RxJava3 support for Room
    implementation "androidx.room:room-rxjava3:$room_version"

    // optional - Guava support for Room, including Optional and ListenableFuture
    implementation "androidx.room:room-guava:$room_version"

    // optional - Test helpers
    testImplementation "androidx.room:room-testing:$room_version"

    // optional - Paging 3 Integration
    implementation "androidx.room:room-paging:2.4.0-rc01"
}
```

## 异常情况记录

- Room AppDatabase_Impl does not exist

使用了 kotlin 构建了项目,并且使用 kotlin 编写 room 创建数据库,在 build.gradle 文件里做如下修改

```groovy
plugins {
    id 'com.android.library'
    id 'kotlin-android'
    id 'kotlin-android-extensions'
    id 'kotlin-kapt'
}
//略...
dependencies {
    api"android.arch.persistence.room:runtime:$rootProject.room_version"
    kapt"android.arch.persistence.room:compiler:$rootProject.room_version"
}
```

将 annotationProcessor 替换成 kapt,请注意需要导入 id 'kotlin-kapt' 才能使用 kapt

参考地址：https://www.cnblogs.com/guanxinjing/p/14990401.html
