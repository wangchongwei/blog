---
title: react Hook
date: 2021-01-11 11:27:26
tags: react
---


# Hook技术

Hook 是React 16.8 的新增特性。它可以让你在不编写 class 的情况下使用 state 以及其他的 React 特性。
Hook 使用了 JavaScript 的闭包机制，而不用在 JavaScript 已经提供了解决方案的情况下，还引入特定的 React API。


## useState

在这里，useState 就是一个 Hook （等下我们会讲到这是什么意思）。通过在函数组件里调用它来给组件添加一些内部 state。
React 会在重复渲染时保留这个 state。useState 会返回一对值：当前状态和一个让你更新它的函数，你可以在事件处理函数中或其他一些地方调用这个函数。
它类似 class 组件的 this.setState，但是它不会把新的 state 和旧的 state 进行合并。

```js
import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
} from 'react-native';

export default function test() {
    console.log('------test');
    const [count, setCount] = useState(0);
    return (
        <View style={{ marginTop: 100 }}>
            <TouchableOpacity onPress={() => { setCount(count + 1) }}>
                <Text>点击获取次数：{count}</Text>
            </TouchableOpacity>
            <Text onPress={() => { setCount(count + 1) }} style={{ marginTop: 100, fontSize: 30 }}>test</Text>
        </View>
    );
}

```
如上图所示，是在react-native中简单使用Hook，使用其中的useState
const [count, setCount] = useState(0);
结构赋值，第一个count为获取的参数，
第二个参数setCount是修改第一个参数的函数，
useState(0)中，useState是在react中引入，后面的 0 是 count 的默认数据。


## useEffect

useEffect 是一个副作用函数，默认在每次渲染之后都会执行。
而且保证每次运行effect时，DOM已经渲染完毕。

传递给 useEffect 的函数在每次渲染中都会有所不同，这是刻意为之的。
事实上这正是我们可以在 effect 中获取最新的 useState中 的值，而不用担心其过期的原因。
每次我们重新渲染，都会生成新的 effect，替换掉之前的。
某种意义上讲，effect 更像是渲染结果的一部分 —— 每个 effect “属于”一次特定的渲染。

* 
与 componentDidMount 或 componentDidUpdate 不同，使用 useEffect 调度的 effect 不会阻塞浏览器更新屏幕，这让你的应用看起来响应更快。大多数情况下，effect 不需要同步地执行。在个别情况下（例如测量布局），有单独的 useLayoutEffect Hook 供你使用，其 API 与 useEffect 相同。
* 

useEffect提供清除操作，当我们需要在React组件清除时，执行某一些操作，可以在useEffect中，返回清除函数。
当React清除时，会执行useEffect中的返回函数。

```
useEffect(() => {
    ...

    return function remove() {
        // when react remove 
    }

})
```

* 为什么要在 effect 中返回一个函数？ 这是 effect 可选的清除机制。每个 effect 都可以返回一个清除函数。如此可以将添加和移除订阅的逻辑放在一起。它们都属于 effect 的一部分。

React 何时清除 effect？ React 会在组件卸载的时候执行清除操作。正如之前学到的，effect 在每次渲染的时候都会执行。
这就是为什么 React 会在执行当前 effect 之前对上一个 effect 进行清除。


还可以对useEffect进行优化，useEffect接受两个参数，第二个参数为比较值，当这个值发生了变化，才会执行useEffect。


```
const [count, setCount] = useState(0)
useEffect(() => {
    ...

    return function remove() {
        // when react remove 
    }

}, [count])

```

这样，只有当count发生变化，即我们调用过 setCount来改变count的值，下一次渲染完毕，才会执行useEffect

所以，当我们需要执行一些只需执行一次的逻辑时，可以传入一个定值，一般使用空数组[]

```
useEffect(() => {
    ...

    function request() {

    }

    return function remove() {
        // when react remove 
    }

}, []])

```

如上所示，request只会在第一次渲染完毕执行一次，remove函数也时只会执行一次


## Hook规则

Hook 本质就是 JavaScript 函数，但是在使用它时需要遵循两条规则

* 只在最顶层使用 Hook
    不要在循环，条件或嵌套函数中调用 Hook， 确保总是在你的 React 函数的最顶层调用他们。
    遵守这条规则，你就能确保 Hook 在每一次渲染中都按照同样的顺序被调用。这让 React 能够在多次的 useState 和 useEffect 调用之间保持 hook 状态的正确。

* 只在 React 函数中调用 Hook
    不要在普通的 JavaScript 函数中调用 Hook



## 自定义Hook

* 自定义一个Hook函数
* 函数命名以use开始


