---
title: react Hook
date: 2021-01-11 11:27:26
tags: react
---


# Hook技术

Hook 是React 16.8 的新增特性。它可以让你在不编写 class 的情况下使用 state 以及其他的 React 特性。
Hook 使用了 JavaScript 的闭包机制，而不用在 JavaScript 已经提供了解决方案的情况下，还引入特定的 React API。


## useState



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

