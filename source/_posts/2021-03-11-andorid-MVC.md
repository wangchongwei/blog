---
title: andorid MVC
date: 2021-03-11 17:42:14
tags: android
---

MVC 模式：

1）Model (模型层) 在 MVC 中 Model 一般用来保存数据的状态，比如数据存储，网络请求。同时还与View 存在一定的耦合，通过某种事件机制（比如观察者模式） 通知 View 状态的改变来让view 更新。

2）View (视图层)一般由一些GUI 组建组成，同时响应用户的交互行为并触发 Controller 的逻辑，View 还有可能修改Model 的状态 以使其与 Model 同步，View 还会在model 中注册 model 事件的改变。以此来刷新自己并展示给用户。

3）Control （控制层）控制器由View 根据用户行为触发并响应来自view 的用户交互，然后根据view 的事件逻辑来修改对应的Model, Control 并不关心 View 如何展示 相关数据或状态，而是通过修改 Model 来实现view 的数据的刷新。


view 层即指 xml文件
