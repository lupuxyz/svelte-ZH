---
title: Await 块
---

很多Web应用程序都可能在某个时候有需要处理异步数据的需求。使用 Svelte 在标签中使用 *await* 处理[promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises) 数据亦是十分容易：

```html
{#await promise}
	<p>...waiting</p>
{:then number}
	<p>The number is {number}</p>
{:catch error}
	<p style="color: red">{error.message}</p>
{/await}
```

> `promise`总是获取最新的信息，这使得你无需关心 rece 状态。

如果你的知道你的 promise 返回错误，则可以忽略  `catch` 块。如果在请求完成之前不想程序执行任何操作，也可以忽略第一个块。

```html
{#await promise then value}
	<p>the value is {value}</p>
{/await}
```