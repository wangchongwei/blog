# android动画


动画分为两类，传统动画、属性动画

## 传统动画
传统动画又分为帧动画、补间动画

## 帧动画
是通过在特定帧显示不同图片，使连贯起来在视觉上看起来像动画。
有点类似与gif

将图片资源放入到drawable文件夹
在drawable下新建资源文件 drawable1.xml  类型：animation-list

```
<?xml version="1.0" encoding="utf-8"?>
<animation-list xmlns:android="http://schemas.android.com/apk/res/android">
    <item
        android:drawable="@drawable/image1"
        android:duration="1000" />
    <item
        android:drawable="@drawable/image2"
        android:duration="1000" />
    <item
        android:drawable="@drawable/image3"
        android:duration="1000" />
    <item
        android:drawable="@drawable/image4"
        android:duration="1000" />
</animation-list>
```

android:drawable 指的是要显示的图片资源
android:duration: 图片显示时长

还有一些其它参数

在Activity中调用
```
imageView = findViewById(R.id.imageView);
imageView.setImageResource(R.drawable.image);
AnimationDrawable drawable = (AnimationDrawable) imageView.getDrawable();
drawable.start();
```
这样就可以让四张图片动起来了。

这样就是一个帧动画的简单样例

## 补间动画

补间动画分为四种类形式： alpha（淡入淡出），translate（位移），scale（缩放大小），rotate（旋转）
其实就是四种动画效果，我们选择单独选择一种、也可以同时使用几种。

补间动画可以通过xml、或者代码形式实现。

### xml实现补间动画






