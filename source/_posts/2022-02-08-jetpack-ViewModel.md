---
title: jetpack-ViewModel
date: 2022-02-08 15:08:05
tags: android
---

参考 android developer 中的文档：https://developer.android.google.cn/topic/libraries/architecture/viewmodel?hl=zh_cn

## 问题记录

- 当 ViewModel 构造函数为有参构造函数时，使用 private val model : OverTimeViewModel by activityViewModels() 会报错
  此时处理方案为新建一个Factory类
  ```kotlin
    class ViewModelFactory(private val dataSource: OverTimeDao): ViewModelProvider.Factory {
        override fun <T : ViewModel> create(modelClass: Class<T>): T {
            if(modelClass.isAssignableFrom(OverTimeViewModel::class.java)) {
                return OverTimeViewModel(dataSource) as T
            }
            throw IllegalArgumentException("Unknown ViewModel class")
        }
    }
    // 在写一个静态类，作为Factory作为Provider
    object Injection {

        fun provideUserDataSource(context: Context): OverTimeDao {
            val database = AppDatabase.getInstance(context)
            return database.overTimeDao()
        }

        fun provideViewModelFactory(context: Context): ViewModelFactory {
            val dataSource = provideUserDataSource(context)
            return ViewModelFactory(dataSource)
        }
    }

    // 获取ViewModel实例
    private lateinit var viewModelFactory: ViewModelFactory
    private val model : OverTimeViewModel by activityViewModels{ viewModelFactory }

    // 在特定的生命函数中实例化ViewModelFactory
    viewModelFactory = Injection.provideViewModelFactory(activity!!)
  ```