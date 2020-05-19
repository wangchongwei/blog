---
title: 'android dialog '
date: 2020-05-13 15:56:53
tags: android
---


# dialog
在日常开发时会经常使用到弹窗dialog

针对自定义视图的弹窗使用方法，

```
AlertDialog.Builder builder = new AlertDialog.Builder(context);
LayoutInflater inflater = context.getLayoutInflater();
View view = inflater.inflate(R.layout.view, null);
build.setView(view);

AlertDialog dialog = build.create();
dialog.show();
```
上面就是一个AlertDialog实例的创建过程，其中AlertDialog使用了创建者模式。

关于点击弹窗其他部分、点击手机back而不关闭dialog的方法有如下:
```
dialog.setCancelable(false); // 点击back、其他部位都不关闭弹窗
dialog.setCanceledOnTouchOutside(false);// 点击其他部位不关闭、点back关闭
```

设置dialog弹窗的大小：

```
// 在dialog.show() 之后
Window window = dialog.getWindow();
if(window != null) {
    WindowManager.LayoutParams attr = window.getAttributes();
    if (attr != null) {
        attr.height = ViewGroup.LayoutParams.MATCH_PARENT;
        attr.width = ViewGroup.LayoutParams.MATCH_PARENT;
        window.setAttributes(attr);
    }
}
```
这样就将dialog窗口大小设置为了最大，但是可以发现我们的弹窗还是没有充满整个屏幕，因为dialog默认的主题theme就是偏距margin的，
所以如果我们想要充满整个屏幕的话，需要改变我们dialog的主题，

```
// AlertDialog.Builder builder = new AlertDialog.Builder(context);
AlertDialog.Builder builder = new AlertDialog.Builder(context, R.style.AppTheme);
```
