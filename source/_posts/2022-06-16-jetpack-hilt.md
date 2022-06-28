---
title: jetpack hilt
date: 2022-06-16 14:09:19
tags:
---


# Hilt

先讲使用，再讲原理

google文档地址：https://developer.android.google.cn/training/dependency-injection/hilt-android?hl=zh_cn

[示例源码地址](https://github.com/wangchongwei/JetpackLearn/tree/master/app/src/main/java/com/justin/jetpacklearn/hilt)

## 使用示例： Hilt + ViewModel + Repository



### 添加依赖

* 注意事项不要参考google文档中的地址设置版本号，因为文档中使用的是 aplha 版本，API会随时变动，很可能使用此版本但运行结果与文档不同，本人就碰到了，（@HiltViewModel 不可用） *

在项目根目录的 build.gradle 中添加：
```groovy
buildscript {
    ext.hilt_version = "2.36"

    dependencies {
        // hilt
        classpath "com.google.dagger:hilt-android-gradle-plugin:$hilt_version"
    }
}

```

在需要使用 hilt 的 module 的 build.gradle 文件中添加依赖

```groovy
    // Hilt
    implementation "com.google.dagger:hilt-android:$hilt_version"
    kapt "com.google.dagger:hilt-android-compiler:$hilt_version"
```

### Application

```kotlin
@HiltAndroidApp
class MyApplication : Application() {}
```

### ViewModel

```kotlin
@HiltViewModel
class HiltViewModel @Inject constructor(
    var repository: HiltRepository,
): ViewModel() {

    fun login() {
        repository.login()
    }
}
```

### Repository

```kotlin
class HiltRepository @Inject constructor() {
    fun login(){
    }
}

@Module
@InstallIn(ActivityComponent::class)
object HiltRepositoryModule{

    @Provides
    fun providerHiltRepository() :HiltRepository = HiltRepository()
}
```
-----
注意，Repository中即使构造函数无需入参，也必须 使用 @Inject constructor()
-----

### Activity

```kotlin
@AndroidEntryPoint
class HiltActivity : AppCompatActivity() {

    lateinit var binding: ActivityHiltBinding

    private val viewModel: HiltViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityHiltBinding.inflate(layoutInflater)
        setContentView(binding.root)
    }
}

```

可以发现，此时生成 viewModel实例时，无需再次传入参数，也不需要另外使用ViewModelFactory来生成。
原因就是在 Repository 中的代码：

```kotlin
@Module
@InstallIn(ActivityComponent::class)
object HiltRepositoryModule{

    @Provides
    fun providerHiltRepository() :HiltRepository = HiltRepository()
}
```

这里通过注解已经提供了生成 HiltRepository 实例的方式。

以上就是一次简单的使用。

## 原理解析