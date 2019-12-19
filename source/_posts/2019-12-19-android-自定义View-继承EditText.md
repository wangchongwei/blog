---
title: android-自定义View-继承EditText
date: 2019-12-19 17:59:28
tags: android
---



# android-自定义View-继承EditText
一直觉得flutter中的输入框效果不错。
动画，提示标题都有。
这次要通过自定义View, 继承重写EditText来实现同样的输入框效果


首先确定大致思路
两个元素：TextView、EditText，TextView为标题，EditText为输入框展示
当未获取焦点时：
1、输入框如果已经有输入的内容，则输入框展示已输入的内容，并且TextView缩小在输入框上部
2、输入框如果没有输入的内容，则输入框展示的wei

