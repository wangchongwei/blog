---
title: Application生命周期
date: 2020-09-28 14:44:45
tags: andorid
---

# Application

Application是指代一个应用，默认我们在android应用中可以不指定，
也可以写一个类，继承Application，在AndroidManifest.xml中指定applictaion类即可

Application是应用的入口。

Application的生命周期就是应用的生命周期。


## 生命周期

生命周期函数有：
onCreate、onLowMemory、onTrimMemory、onTerminate、onConfigurationChanged

各个生命周期函数解释
* onCreate: 应用被创建时调用，是程序的主入口，在此处做一些初始化操作，不要做耗时操作。
* onLowMemory： 当系统整体内存可用量较少时触发，可以在这里做一些不重要数据的清除、释放资源，避免因内存不足导致App被系统杀掉
* onTrimMemory(int level)： andorid4.0后出的API，用来取代onLowMemory函数的，其中这个函数还有一个入参，来表示等级。
* onTerminate： 当Application结束时，又系统决定调用时机。常规手动kill app进程没有触发此函数


### onTrimMemory

此函数是在android4.0后引入的，能实现的组件不止Application，还有Activity、Fragment、Service、ContentProvider
作用是指导应用程序在不同情况下进行自身的内存释放，以避免被系统杀掉，提高用户体验

根据不同的情况，在函数中的提现就是 onTrimMemory函数中的 level这个入参。
level有7个值，

* TRIM_MEMORY_UI_HIDDEN：表示应用程序的所有UI界面被隐藏了，即用户点击了Home键或者Back键、Pause键导致应用的UI界面不可见．这时候应该释放一些资源．

当app运行在前台时，会回调下面这三个值，内存余量从高到低排列
 
* TRIM_MEMORY_MODERATE：表示应用程序正常运行，并且不会被杀掉。但是目前手机的内存已经有点低了，系统可能会开始根据LRU缓存规则来去杀死进程了。

* TRIM_MEMORY_RUNNING_CRITICAL：表示应用程序仍然正常运行，但是系统已经根据LRU缓存规则杀掉了大部分缓存的进程了。
这个时候我们应当尽可能地去释放任何不必要的资源，不然的话系统可能会继续杀掉所有缓存中的进程，并且开始杀掉一些本来应当保持运行的进程，比如说后台运行的服务。

* TRIM_MEMORY_RUNNING_LOW：表示应用程序正常运行，并且不会被杀掉。但是目前手机的内存已经非常低了，我们应该去释放掉一些不必要的资源以提升系统的性能，
同时这也会直接影响到我们应用程序的性能。


当app缓存在后台时，会回调一下三个值，内存余量从高到低排列

* TRIM_MEMORY_BACKGROUND：表示手机目前内存已经很低了，系统准备开始根据LRU缓存来清理进程。这个时候我们的程序在LRU缓存列表的最近位置，
是不太可能被清理掉的，但这时去释放掉一些比较容易恢复的资源能够让手机的内存变得比较充足，从而让我们的程序更长时间地保留在缓存当中，
这样当用户返回我们的程序时会感觉非常顺畅，而不是经历了一次重新启动的过程。

* TRIM_MEMORY_RUNNING_MODERATE： 表示手机目前内存已经很低了，并且我们的程序处于LRU缓存列表的中间位置，如果手机内存还得不到进一步释放的话，那么我们的程序就有被系统杀掉的风险了。

* TRIM_MEMORY_COMPLETE：表示手机目前内存已经很低了，并且我们的程序处于LRU缓存列表的最边缘位置，系统会最优先考虑杀掉我们的应用程序，
在这个时候应当尽可能地把一切可以释放的东西都进行释放。



onTrimMemory 主要是在考虑内存优化时需要考虑。在此处做数据清除、资源释放

