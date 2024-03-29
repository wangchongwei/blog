---
title: Android View的事件分发
date: 2020-12-17 10:11:13
tags: android
---

# View的事件分发

首先用户的交互事件都是先交给Actiivty，然后再来向下分发事件

## Activity
我们可以查看 Activity 的 dispatchTouchEvent

```java
public boolean dispatchTouchEvent(MotionEvent ev) {
    // 事件的起点时，调用一次 onUserInteraction
    if (ev.getAction() == MotionEvent.ACTION_DOWN) {
        onUserInteraction();
    }
    // 将事件先分发给 window.superDispatchTouchEvent 如果返回为true 则直接终止
    if (getWindow().superDispatchTouchEvent(ev)) {
        return true;
    }
    // 当通过事件分发 依然返回为false，代表没有被消费时，则执行 Activity 的 onTouchEvent
    return onTouchEvent(ev);
}
```

首先需要明确一点，ACTION_DOWN是一次完整的交互事件的起点，onUserInteraction是一个空函数可以不要管，

会将事件分发到 window 的 superDispatchTouchEvent，而 window 指的是PhoneWindow，在andorid源码中，只有一个window的实现类，就是PhoneWindow，
如果 window 的 dispatch 返回为 true 则不向下执行，否则会执行到 Activity 的 onTouchEvent，


## PhoneWindow

```java
@Override
public boolean superDispatchTouchEvent(MotionEvent event) {
    return mDecor.superDispatchTouchEvent(event);
}
```
在PhoneWindow.java中 superDispatchTouchEvent函数又代理给DecorView的superDispatchTouchEvent

## DecorView


```java
public boolean superDispatchTouchEvent(MotionEvent event) {
        return super.dispatchTouchEvent(event);
    }
```
> DecorView 继承自 FrameLayout，FrameLayout 继承自 ViewGroup
DecorView中的 superDispatchTouchEvent 直接调用父类的 dispatchTouchEvent，
而在FrameLayout 中没有重写 dispatchTouchEvent 函数，所以会直接调用到 ViewGroup 的 dispatchTouchEvent 函数

## ViewGroup

首先，所有的View都是继承自View的，ViewGroup也是继承自View

在ViewGroup的dispatchTouchEvent函数中，代码太长，先将部分代码收缩起来

```java
 @Override
    public boolean dispatchTouchEvent(MotionEvent ev) {
        // mInputEventConsistencyVerifier是View中的一个变量，这里是对事件的一些校验
        if (mInputEventConsistencyVerifier != null) {
            mInputEventConsistencyVerifier.onTouchEvent(ev, 1);
        }

        // If the event targets the accessibility focused view and this is it, start
        // normal event dispatch. Maybe a descendant is what will handle the click.
        // 此处是对一些无障碍功能的设置
        if (ev.isTargetAccessibilityFocus() && isAccessibilityFocusedViewOrHost()) {
            ev.setTargetAccessibilityFocus(false);
        }

        // 局部变量，每一个事件分发时，都会重置为false
        boolean handled = false;
        if (onFilterTouchEventForSecurity(ev)) {
            ...
        }

        // 重新校验
        if (!handled && mInputEventConsistencyVerifier != null) {
            mInputEventConsistencyVerifier.onUnhandledEvent(ev, 1);
        }
        
        return handled;
    }
```

其实主要逻辑还是在 if (onFilterTouchEventForSecurity(ev)) { 这个代码区域里

```java
public boolean onFilterTouchEventForSecurity(MotionEvent event) {
    //noinspection RedundantIfStatement
    if ((mViewFlags & FILTER_TOUCHES_WHEN_OBSCURED) != 0
            && (event.getFlags() & MotionEvent.FLAG_WINDOW_IS_OBSCURED) != 0) {
        // Window is obscured, drop this touch.
        return false;
    }
    return true;
}
```
对事件安全过滤的函数，正常情况都能通过。
接着看dispatchTouchEvent函数

```java
final int action = ev.getAction();
final int actionMasked = action & MotionEvent.ACTION_MASK;

// Handle an initial down.
if (actionMasked == MotionEvent.ACTION_DOWN) {
    // Throw away all previous state when starting a new touch gesture.
    // The framework may have dropped the up or cancel event for the previous gesture
    // due to an app switch, ANR, or some other state change.
    cancelAndClearTouchTargets(ev);
    resetTouchState();
}
```

判断是ACTION_DOWN就清除、重置touch事件，因为在上面讲过，ACTION_DOWN是一次交互的起点，在这里将上一次交互的状态都清除掉

### 判断事件是否拦截

```java
// Check for interception.
final boolean intercepted;
if (actionMasked == MotionEvent.ACTION_DOWN
        || mFirstTouchTarget != null) {
            // 当是事件的起点，获取此连续事件已经获取到对应的 target时
            // 先获取子视图中是否设置了 外部拦截，
    final boolean disallowIntercept = (mGroupFlags & FLAG_DISALLOW_INTERCEPT) != 0;

    if (!disallowIntercept) {
        // 如果子视图允许外部拦截 即 disallowIntercept = false，默认为false
        // 进行内部拦截判断，看 viewgroup 的拦截逻辑
        intercepted = onInterceptTouchEvent(ev);
        ev.setAction(action); // restore action in case it was changed
    } else {
        // 子视图禁止外部拦截，则事件必须尝试向下分发，不能在当前 viewgroup 拦截
        intercepted = false;
    }
} else {
    // There are no touch targets and this action is not an initial down
    // so this view group continues to intercept touches.
    // 当 不是连续事件的起点，且 mFirstTouchTarget = null， 说明无视图处理了 ACTION_DOWN 事件，则没必要再向下分发该连续事件，直接拦截
    intercepted = true;
}

```
这里是判断是否开启拦截，注意这里的判断逻辑，intercepted 是是否拦截标志位
disallowIntercept： 是否允许拦截，此处是一个外部拦截，在子视图中设置的，子视图设置是否让父容器拦截事件
如果 disallowIntercept = false，再取执行内部拦截, onInterceptTouchEvent ,查看 ViewGroup 是否拦截，为内部拦截
disallowIntercept 为true时，代表子视图不允许父容器拦截，则 intercepted = false;

> 此处 else 的逻辑， 走到 else 说明： actionMasked 不是 ACTION_DOWN ，说明是一个后续事件，而且 mFirstTouchTarget = null
> 说明 在这一个连续事件中，没有视图消费 ACTION_DOWN 事件，所以后续的事件也不再向下分发。


```java
 if (intercepted || mFirstTouchTarget != null) {
    ev.setTargetAccessibilityFocus(false);
}

// Check for cancelation.
final boolean canceled = resetCancelNextUpFlag(this)
        || actionMasked == MotionEvent.ACTION_CANCEL;

// Update list of touch targets for pointer down, if needed.
final boolean split = (mGroupFlags & FLAG_SPLIT_MOTION_EVENTS) != 0;
TouchTarget newTouchTarget = null;
boolean alreadyDispatchedToNewTouchTarget = false;
``` 
当被拦截时，或者 touchTarget 不为空时，设置事件的 TargetAccessibilityFocus 为false
然后判断事件是否是取消事件
初始化一个变量 alreadyDispatchedToNewTouchTarget=false , 是否已经将事件绑定到一个targetView


```java
if (!canceled && !intercepted) {
    // 当不是取消、没有被拦截时
    // If the event is targeting accessibility focus we give it to the
    // view that has accessibility focus and if it does not handle it
    // we clear the flag and dispatch the event to all children as usual.
    // We are looking up the accessibility focused host to avoid keeping
    // state since these events are very rare.
    // 获取到该事件绑定的view
    View childWithAccessibilityFocus = ev.isTargetAccessibilityFocus()
            ? findChildWithAccessibilityFocus() : null;
    
    ......
}
```
在上述代码段中，其实只是执行了一个操作，即遍历子 View ，获取该事件对应的处理的 View 。
注意这里有一个函数调用 dispatchTransformedTouchEvent

当遍历找到需要处理这个事件的 View 或者 确定不存在该 View 时，即执行这个函数，对这个事件进行重新分发
```java
private boolean dispatchTransformedTouchEvent(MotionEvent event, boolean cancel,
            View child, int desiredPointerIdBits) {
    final boolean handled;

    // Canceling motions is a special case.  We don't need to perform any transformations
    // or filtering.  The important part is the action, not the contents.
    final int oldAction = event.getAction();
    if (cancel || oldAction == MotionEvent.ACTION_CANCEL) {
        event.setAction(MotionEvent.ACTION_CANCEL);
        if (child == null) {
            // 为空，将事件交给View.dispatchTouchEvent处理
            handled = super.dispatchTouchEvent(event);
        } else {
            // 子View处理
            handled = child.dispatchTouchEvent(event);
        }
        event.setAction(oldAction);
        return handled;
    }

    // Calculate the number of pointers to deliver.
    final int oldPointerIdBits = event.getPointerIdBits();
    final int newPointerIdBits = oldPointerIdBits & desiredPointerIdBits;

    // If for some reason we ended up in an inconsistent state where it looks like we
    // might produce a motion event with no pointers in it, then drop the event.
    if (newPointerIdBits == 0) {
        return false;
    }

    // If the number of pointers is the same and we don't need to perform any fancy
    // irreversible transformations, then we can reuse the motion event for this
    // dispatch as long as we are careful to revert any changes we make.
    // Otherwise we need to make a copy.
    final MotionEvent transformedEvent;
    if (newPointerIdBits == oldPointerIdBits) {
        if (child == null || child.hasIdentityMatrix()) {
            if (child == null) {
                handled = super.dispatchTouchEvent(event);
            } else {
                final float offsetX = mScrollX - child.mLeft;
                final float offsetY = mScrollY - child.mTop;
                event.offsetLocation(offsetX, offsetY);

                handled = child.dispatchTouchEvent(event);

                event.offsetLocation(-offsetX, -offsetY);
            }
            return handled;
        }
        transformedEvent = MotionEvent.obtain(event);
    } else {
        transformedEvent = event.split(newPointerIdBits);
    }

    // Perform any necessary transformations and dispatch.
    if (child == null) {
        handled = super.dispatchTouchEvent(transformedEvent);
    } else {
        final float offsetX = mScrollX - child.mLeft;
        final float offsetY = mScrollY - child.mTop;
        transformedEvent.offsetLocation(offsetX, offsetY);
        if (! child.hasIdentityMatrix()) {
            transformedEvent.transform(child.getInverseMatrix());
        }

        handled = child.dispatchTouchEvent(transformedEvent);
    }

    // Done.
    transformedEvent.recycle();
    return handled;
}

```
上述函数总结其实就是判断 childView 是否为空，如果为空的话，就再将事件转交给 View.dispatchTouchEvent 来处理，
super.dispatchTouchEvent，因为 ViewGroup 继承自 View，此时会调用到 View.dispatchTouchEvent
如果 childView 存在，则执行 childView.dispatchTouchEvent，如果 childView 还是 ViewGroup ，还会再次执行这个过程，
遍历-找寻子View-分发，注意在分发过程中，如果已经返回为true了，则不会再向下分发。


接下来看 View 的 dispatchTouchEvent

## View

```java
public boolean dispatchTouchEvent(MotionEvent event) {
    // If the event should be handled by accessibility focus first.
    if (event.isTargetAccessibilityFocus()) {
        // We don't have focus or no virtual descendant has it, do not handle the event.
        if (!isAccessibilityFocusedViewOrHost()) {
            return false;
        }
        // We have focus and got the event, then use normal event dispatch.
        event.setTargetAccessibilityFocus(false);
    }

    boolean result = false;

    if (mInputEventConsistencyVerifier != null) {
        mInputEventConsistencyVerifier.onTouchEvent(event, 0);
    }

    final int actionMasked = event.getActionMasked();
    if (actionMasked == MotionEvent.ACTION_DOWN) {
        // Defensive cleanup for new gesture
        // 当手指触碰时，停止滚动
        stopNestedScroll();
    }

    if (onFilterTouchEventForSecurity(event)) {
        if ((mViewFlags & ENABLED_MASK) == ENABLED && handleScrollBarDragging(event)) {
            result = true;
        }
        //noinspection SimplifiableIfStatement
        // 当onTouch事件返回了true时，此处返回true
        ListenerInfo li = mListenerInfo;
        if (li != null && li.mOnTouchListener != null
                && (mViewFlags & ENABLED_MASK) == ENABLED
                && li.mOnTouchListener.onTouch(this, event)) {
            result = true;
        }
        // 当onTouch事件返回了true时，此处返回true
        if (!result && onTouchEvent(event)) {
            result = true;
        }
    }

    if (!result && mInputEventConsistencyVerifier != null) {
        mInputEventConsistencyVerifier.onUnhandledEvent(event, 0);
    }

    // Clean up after nested scrolls if this is the end of a gesture;
    // also cancel it if we tried an ACTION_DOWN but we didn't want the rest
    // of the gesture.
    // 当手指抬起、取消时，结束滚动
    if (actionMasked == MotionEvent.ACTION_UP ||
            actionMasked == MotionEvent.ACTION_CANCEL ||
            (actionMasked == MotionEvent.ACTION_DOWN && !result)) {
        stopNestedScroll();
    }

    return result;
}
```

再看一下 onTouchEvent 事件，onTouchEvent是对事件的处理


```java
if ((viewFlags & ENABLED_MASK) == DISABLED) {
    if (action == MotionEvent.ACTION_UP && (mPrivateFlags & PFLAG_PRESSED) != 0) {
        setPressed(false);
    }
    mPrivateFlags3 &= ~PFLAG3_FINGER_DOWN;
    // A disabled view that is clickable still consumes the touch
    // events, it just doesn't respond to them.
    return clickable;
}
```
* 如果View是不可点击的，如：ImageView,直接return false

* View里因为设置了 onClickListener(), 这样就导致 View是 clickable (或者可以直接在xml里加上android:clickable=”true”)，即可点击，
* 那么View.onTouchEvent就会永远返回 True, 代表View consume了该事件。
> 注意：只要View consume了该事件，那么该事件既不会往下传(不会传给子view)，也不会往上传(后面Activity/ViewGroup 的 onTouchEvent将不会再调用)。
>
> View中不存在拦截，只有ViewGroup才有拦截



## 总结：
* 事件 Event 从 Activity 分发到 PhoneWindow 再到 DecorView 再到自己写的视图中，每一步都会先判断是否拦截，如果拦截，则不继续向下分发，而是执行当前拦截层的 onTouchEvent事件
* 当事件分发到了自己写的视图中时，因为所有的视图都是View的子集，包括ViewGroup，所有事件其实是在View、ViewGroup中一层一层向下分发。
* 在 ViewGroup 分发中，会先判断内部子View是否允许外部拦截，默认允许，此时会执行 ViewGroup 的 onTouchEvent 事件
* 如果ViewGroup未拦截事件，则ViewGroup会遍历子View，继续分发过程，直到找到消费该事件的targetView
* 如果该事件无子View消费，则该事件又会向上传递，一直到Activity 的 onTouchEvent 事件

* 关于可点击View的click事件与touch事件监听：dispatchTouchEvent>onInterceptTouchEvent(ViewGroup才有)>onTouch>onTouchEvent>onClick。



