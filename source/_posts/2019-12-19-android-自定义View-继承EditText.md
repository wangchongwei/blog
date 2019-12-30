---
title: android-自定义View-继承EditText
date: 2019-12-19 17:59:28
tags: android
---



# android-自定义View-继承EditText
一直觉得flutter中的输入框效果不错。
动画，提示标题都有。
这次要通过自定义View, 继承重写EditText来实现同样的输入框效果

<a value="源码地址" target="_blank" href="https://github.com/wangchongwei/customView" style="font-size:25px; color:blue; font-weight:bold">源码地址</a>

首先确定大致思路
两个元素：TextView、EditText，TextView为标题，EditText为输入框展示
当未获取焦点时：
1、输入框如果已经有输入的内容，则输入框展示已输入的内容，并且TextView缩小在输入框上部
2、输入框如果没有输入的内容，则输入框展示的提示文本
当获取焦点时：
不管有无输入内容，提示文本缩小在输入框上部

TextView并非实质组件，只是绘制Text，当作TextView。

### 1、先写一个类继承AppCompatEditText，并实现构造函数

```

public class AnimatedInput extends AppCompatEditText {

 public AnimatedInput(Context context) {
        super(context);
        this.context = context;
    }

    public AnimatedInput(Context context, AttributeSet attrs) {
        super(context, attrs);
        this.context = context;
        initView(attrs);
    }

    public AnimatedInput(Context context, AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
        this.context = context;
        initView(attrs);
    }

}

```

### 2、重写onFocusChanged函数
这样获取到 是否获取焦点的标识位
```
@Override
    protected void onFocusChanged(boolean focused, int direction, Rect previouslyFocusedRect) {
        super.onFocusChanged(focused, direction, previouslyFocusedRect);
        isFocus = focused;
        postInvalidate();
    }
```

### 3、重写onTextChanged函数
这样获取到输入框的内容value
```
@Override
    protected void onTextChanged(CharSequence text, int start, int lengthBefore, int lengthAfter) {
        super.onTextChanged(text, start, lengthBefore, lengthAfter);
        value = text.toString();
    }
```

### 4、绘制提示文本
这时候要分情况，即是否获取焦点、输入框是否有内容
```
    @Override
    protected void onDraw(Canvas canvas) {
        // onDraw中通过getMeasuredWidth 或者 getMeasuredHeight 获取到的尺寸，就是实际测量的尺寸
        int width = getMeasuredWidth();
        int height = getMeasuredHeight();
        top = getPaddingTop();
        left = getPaddingLeft();
        right = width - left - getPaddingRight();
        bottom = height - top;
        drawTitle(canvas);
        super.onDraw(canvas);
    }

    /**
     * 绘制标题
     * @param canvas
     */
    private void drawTitle(Canvas canvas) {
        if(TextUtils.isEmpty(value)) {
            if(isFocus) {
                canvas.drawText(title, left, top + 20, focusTitlePaint);
            } else {
                canvas.drawText(title, left, bottom - 5 , noFocusTitlePaint);
            }
        } else {
            canvas.drawText(title, left, top + 20, focusTitlePaint);
        }

    }
```

如此就基本实现了我们的预期目标。
这里没有重写onMeasure函数，没有对尺寸做要求，正确的操作时需要做处理的，具体操作可以参照之前的 自定义View。
