---
title: android-自定义View-继承Drawable
date: 2020-12-22 10:11:42
tags: android
---


<a value="源码地址" target="_blank" href="https://github.com/wangchongwei/customView" style="font-size:25px; color:blue; font-weight:bold">源码地址</a>


最后实现效果如下图：

<img src="../../../images/fish.gif" style="zoom:20%" />

思路：
1、将正个鱼分成几个部分，鱼头圆，鱼身二阶贝塞尔曲线，鱼尾，鱼鳍
2、因为鱼会摆动，需要考虑一个角度问题，需要定义一个点，来确定整个的角度
3、以鱼的重心点作为基准点，即鱼身的中心点
4、根据鱼的中心点以及每条线的长度获取其他点的坐标，就可以绘制整个图形
5、鱼的摆动根据属性动画来绘制，但要考虑鱼头与鱼尾的摆动频率不一致，可以使用三角函数，0-360，鱼头设置一倍，鱼尾设置多倍，
此时就能鱼头与鱼尾摆动频率不一致了。
6、鱼尾分两段，摆动的方向不一致，一段带动另一段，一个采用正旋sin，一个采用余旋cos

进阶：鱼能游动
7、点击时的水波纹
8、鱼回头问题




