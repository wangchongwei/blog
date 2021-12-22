---
title: jetpack lifecycle
date: 2021-12-22 11:08:25
tags: Jetpack
---

Lifecycle 是 Jetpack 库中用来感知生命周期的组件

## 使用生命周期感知型组件处理生命周期

生命周期感知型组件可执行操作来响应另一个组件（如 Activity 和 Fragment）的生命周期状态的变化。这些组件有助于您编写出更有条理且往往更精简的代码，此类代码更易于维护。

一种常见的模式是在 Activity 和 Fragment 的生命周期方法中实现依赖组件的操作。但是，这种模式会导致代码条理性很差而且会扩散错误。通过使用生命周期感知型组件，您可以将依赖组件的代码从生命周期方法移入组件本身中。

androidx.lifecycle 软件包提供了可用于构建生命周期感知型组件的类和接口 - 这些组件可以根据 Activity 或 Fragment 的当前生命周期状态自动调整其行为。

## Lifecycle

Lifecycle 是一个类，用于存储有关组件（如 Activity 或 Fragment）的生命周期状态的信息，并允许其他对象观察此状态。

Lifecycle 使用两种主要枚举跟踪其关联组件的生命周期状态：

**事件**
从框架和 Lifecycle 类分派的生命周期事件。这些事件映射到 Activity 和 Fragment 中的回调事件。
**状态**
由 Lifecycle 对象跟踪的组件的当前状态

<img src='../../../images/lifecycle.svg' style="zoom:60%" />

### example

使用：

```kotlin
class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        lifecycle.addObserver(MainLifecycleObserver())
    }
}


class MainLifecycleObserver() : LifecycleObserver {
    private var TAG: String  = "MainLifecycleObserver";

    @OnLifecycleEvent(Lifecycle.Event.ON_CREATE)
    fun onActivityCreated() {
        Log.d(TAG, "onActivityCreated: ")
    }

    @OnLifecycleEvent(Lifecycle.Event.ON_RESUME)
    fun onActivityResume() {
        Log.d(TAG, "onActivityResume: ")
    }

    @OnLifecycleEvent(Lifecycle.Event.ON_STOP)
    fun onActivityStopped() {
        Log.d(TAG, "onActivityStopped: ")
    }
}
```

如上所示，就可以實現在 Activity 之外獲取到生命週期的變化，避免在 Activity/Fragment 中的生命週期中寫大量業務代碼

## LifecycleOwner

LifecycleOwner 是单一方法接口，表示类具有 Lifecycle。它具有一种方法（即 getLifecycle()），该方法必须由类实现。如果您尝试管理整个应用进程的生命周期，请参阅 ProcessLifecycleOwner。

此接口从各个类（如 Fragment 和 AppCompatActivity）抽象化 Lifecycle 的所有权，并允许编写与这些类搭配使用的组件。任何自定义应用类均可实现 LifecycleOwner 接口。

实现 DefaultLifecycleObserver 的组件可与实现 LifecycleOwner 的组件完美配合，因为所有者可以提供生命周期，而观察者可以注册以观察生命周期。

### 自定義 LifecycleOwner

我們不只是可以綁定視圖的生命週期，可以通過 LifecycleOwner 自定義對應色生命週期
如當處於 Activity 的 onCreate、onStart 中都需執行 onStart

```kotlin
class MainActivity : AppCompatActivity(), LifecycleOwner {
    lateinit var lifecycleRegistry: LifecycleRegistry;

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        lifecycleRegistry = LifecycleRegistry(this)
        lifecycleRegistry.markState(Lifecycle.State.STARTED)
    }

    override fun onStart() {
        super.onStart();
        lifecycleRegistry.markState(Lifecycle.State.STARTED)
    }

    override fun getLifecycle(): Lifecycle{
        return lifecycleRegistry
    }
}
```

## 总结

LifeCycle 组件实际上并没有带来什么新的功能，他通过观察者模式+注解来让我们更方便的监听 Activity 和 Fragment 的生命周期变化。
