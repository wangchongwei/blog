---
title: android 自定义View
date: 2019-12-10 15:42:49
tags: android
---
# Android 自定义View

自定义View主要用于：需要一些不规则的图形、事件冲突、特定的视图群组、扩展某些组件的功能。

首页android自定义View有三种类型，
1、继承View，多用于实现一些不规则的图形。

2、继承特定的组件，如TextView，

3、继承ViewGroup，用于视图组

在自定义View中有三个关键的方法：
onMeasure、onLayout、onDraw

## onMeasure
测量，
ViewGroup 会遍历测量子视图的onMeasure方法。
一般view 则是在测量自身。

在这个方法中，一般是对视图的尺寸做一些要求。
如：处理padding、处理wrap_parent

margin是无需处理的，margin其实是在父容器的onMeasure时处理的。

在自定义view时，如果没有重写onMeasure方法，我们调用该组件时，除非制定尺寸，否则wrap_parent、match_parent表现一样，都是充满父容器-match_parent

onMeasure方法有两个参数(int widthMeasureSpec, int heightMeasureSpec); MeasureSpec时测量规格。
这两个参数都是父容器传递过来。

视图的测量大小由两个元素决定，视图本身的LayoutParams 以及 父容器的测量规格MeasureSpec

### LayoutParams 
我们在使用时，一般是在xml文件，配置某个组件，指定视图宽高：
android:layout_width = "wrap_parent | 50dp | match_parent"
存在三种情况，
wrap_parent： 自适应大小，
50dp: 具体尺寸
match_parent: 充满父容器-父容器大小

### MeasureSpec
测量规格，MeasureSpec由size和mode组成

1.static int getMode(int measureSpec): // 获取mode
2.static int getSize(int measureSpec):// 获取size
3.static int makeMeasureSpec(int size,int mode):// 构造一个MeasureSpec

specMode存在三种情况:
EXACTLY:
具体尺寸、具体值
AT_MOST：
表示子视图最多只能是specSize中指定的大小
UNSPECIFIED：
可以将视图按照自己的意愿设置成任意的大小，没有任何限制，很少用到，主要是系统内部会用到。

size：
就是LayputParams中指定的大小


而子视图的大小也就是通过size和specMode获取的，具体关系如下图：

| |EXACTLY|AT_MOST|UNSPECIFIED|<-MeasureSpec|
|-|-|-|-|-|
|wrap_parnet|EXACTLY|AT_MOST|AT_MOST| |
|match_parent|EXACTLY|AT_MOST|AT_MOST| |
|50dp|50dp|50dp|50dp| |
|^LayoutParams| | | | | |

总结就是，设置了具体尺寸时，具体尺寸生效，未设置具体尺寸时，就会显示最大尺寸

下面会讲具体使用


## onLayout
布局方法

在调用onLayout时，onMeasure已经完成，
子容器的onLyout是在父容器执行onLayout时调用，而自身的onLyout也会触发内部子容器的遍历onLayout。这样就完成了整个视图的布局过程。
在onLayout中，会计算该视图的 左上右下 四个顶点的坐标，就完成了该视图的布局。


## onDraw
绘制的方法
onDraw是在容器的draw方法时调用的。
而绘制的顺序为：
1.绘制背景
2.如果有必要，保存画布的图层，以准备失效
3.绘制视图的内容
4.绘制子控件
5.如果必要，绘制衰落边缘和恢复层
6.绘制装饰（比如滚动条）

onDraw 有一个参数(Canvas cancas),
canvas 就是画布，画布的范围就是onLayout布局后确定的区域
Paint 画笔


### Paint的常用配置
```
Paint mPaint = new Paint();
```
#### Style
画笔的样式分三种类型 Style是个枚举类
```
public enum Style {
    /**
        * Geometry and text drawn with this style will be filled, ignoring all
        * stroke-related settings in the paint.
        */
    FILL            (0),
    /**
        * Geometry and text drawn with this style will be stroked, respecting
        * the stroke-related fields on the paint.
        */
    STROKE          (1),
    /**
        * Geometry and text drawn with this style will be both filled and
        * stroked at the same time, respecting the stroke-related fields on
        * the paint. This mode can give unexpected results if the geometry
        * is oriented counter-clockwise. This restriction does not apply to
        * either FILL or STROKE.
        */
    FILL_AND_STROKE (2);

    Style(int nativeInt) {
        this.nativeInt = nativeInt;
    }
    final int nativeInt;
}
```



### canvas的常用函数








