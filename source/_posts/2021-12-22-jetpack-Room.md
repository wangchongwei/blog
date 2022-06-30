---
title: jetpack Room
date: 2021-12-22 18:44:10
tags: Jetpack
---


处理大量结构化数据的应用可极大地受益于在本地保留这些数据。最常见的使用场景是缓存相关的数据，这样一来，当设备无法访问网络时，用户仍然可以在离线状态下浏览该内容。

Room 持久性库在 SQLite 上提供了一个抽象层，以便在充分利用 SQLite 的强大功能的同时，能够流畅地访问数据库。
具体来说，Room 具有以下优势：

* 针对 SQL 查询的编译时验证
* 可最大限度减少重复和容易出错的样板代码的方便注解。
* 简化了数据库迁移路径。

出于这些方面的考虑，我们强烈建议您使用 Room，而不是直接使用 SQLite API。


## 添加依赖

在build.gradle中添加 kapt plugin
```groovy
plugins {
    id 'com.android.application'
    id 'kotlin-android'
    id 'kotlin-kapt' // 新增
}
```

添加room依赖

```groovy
dependencies {
    // Room
    def room_version = "2.4.1"
    implementation "androidx.room:room-runtime:$room_version"
    kapt "androidx.room:room-compiler:$room_version"
    implementation "androidx.room:room-rxjava2:$room_version"
}

```
## 主要组件


Room 包含三个主要组件：

* 数据库类，用于保存数据库并作为应用持久性数据底层连接的主要访问点。
* 数据实体，用于表示应用的数据库中的表。
* 数据访问对象 (DAO)，提供您的应用可用于查询、更新、插入和删除数据库中的数据的方法。

数据库类为应用提供与该数据库关联的 DAO 的实例。反过来，应用可以使用 DAO 从数据库中检索数据，作为关联的数据实体对象的实例。
此外，应用还可以使用定义的数据实体更新相应表中的行，或者创建新行供插入。


## 实现示例
本部分介绍了具有单个数据实体和单个 DAO 的 Room 数据库实现示例。

### 创建实体

使用 Room 时，每个表都由一个类表示。在 Room 等 ORM（对象关系映射）库中，这些类通常称为模型类或实体。

* 1、创建一个名为 Schedule.kt 的新文件，并定义一个名为 Schedule 的数据类。
```kotlin
@Dao
data class Schedule ()
```
注意要使用注解@Dao,标注这是数据库实体类

* 2、添加主键

据表应该有一个用于唯一标识每行的主键。您要添加到 Schedule 类中的第一个属性是用于表示唯一 ID 的一个整数。
添加一个新属性，并使用 @PrimaryKey 注解对其进行标记。
此注解会告知 Room 在插入新行时将此属性视为主键。

```kotlin
@Dao
data class Schedule (
    @PrimaryKey val id: Int,

        )
```

* 3、添加其他信息列

对于新列，您需要添加 @ColumnInfo 注解，用于为该列指定名称。
通常，SQL 列名称使用以下划线分隔的单词，而 Kotlin 属性采用小驼峰命名法。
对于此列，我们还希望其值为非 null 值，因此您应该使用 @NonNull 注解对其进行标记。

```kotlin
@Dao
data class Schedule (
    @PrimaryKey val id: Int,
    @NonNull @ColumnInfo(name = "stop_name") val stopName: String,
    @NonNull @ColumnInfo(name = "arrival_time") val arrivalTime: Int
)
```


### 定义DAO

为了集成 Room 而需要添加的下一个类是 DAO。DAO 代表数据访问对象，是一个提供数据访问的 Kotlin 类。
具体而言，您会在 DAO 中包含用于读取和操作数据的函数。对 DAO 调用函数相当于对数据库执行 SQL 命令。
实际上，像您要在此应用中定义的函数这样的 DAO 函数通常会指定一个 SQL 命令，以便您可以精确地指定您希望该函数执行什么操作。
在定义 DAO 时，您从上一个 Codelab 中学到的 SQL 知识将派上用场。

* 为 Schedule 实体添加一个 DAO 类。

```kotlin
@Dao
interface ScheduleDao {

}
```

* 添加一条查询语句

根据到达时间升序查询所有车次

```kotlin
@Query("SELECT * FROM schedule ORDER BY arrival_time ASC")
fun getAll(): List<Schedule>
```

在增加一条条件查询语句
指定stop_name的查询

```kotlin
@Query("SELECT * FROM schedule WHERE stop_name = :stopName ORDER BY arrival_time ASC")
fun getByStopName(stopName: String): List<Schedule>
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


[样例代码地址](https://github.com/wangchongwei/JetpackLearn/tree/master/app/src/main/java/com/justin/jetpacklearn/Room)