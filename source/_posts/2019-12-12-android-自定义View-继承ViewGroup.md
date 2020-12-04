---
title: android-自定义View 继承ViewGroup
date: 2019-12-12 15:13:45
tags: android
---

# android 自定义View 继承ViewGroup

自定义ViewGroup与自定义View不同，自定义View主要侧重于实现如何绘制，而自定义ViewGroup主要侧重于如何布局。
所以自定义ViewGroup时，必须重写obLayout函数。

## 自定义FlowLayout
这里我们自定义一个自动换行的流式布局。
思路：
1、默认横向布局、当横向布局宽度要超出容器宽度时，则自动换行，
2、将整个视图分割成多少行，而每行又能分割成多个视图
3、使用两个数组，一个记录单行视图，一个记录所有行（也就是前一个数组）
4、每次需要换行时，记录这行的高度，当前所有视图的高度，当所有子视图计算完毕，就能知道所有子视图一起需要的宽度与高度
5、根据ViewGroup使用时的SpecMode来得出最后实际的宽高

关于第5点，可自定义View中是一样的

| |EXACTLY|AT_MOST|UNSPECIFIED|<-MeasureSpec|
|-|-|-|-|-|
|wrap_parnet|EXACTLY|AT_MOST|AT_MOST| |
|match_parent|EXACTLY|AT_MOST|AT_MOST| |
|50dp|50dp|50dp|50dp| |
|^LayoutParams| | | | | |



