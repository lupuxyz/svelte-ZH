---
title: beforeUpdate 和 afterUpdate
---

顾名思义，`beforeUpdate` 函数实现在DOM渲染完成前执行。`afterUpdate`函数则相反，它会运行在你的异步数据加载完成后。

总之，它们对于一些需要以状态驱动的地方很有用, 例如渲染标签的滚动位置。

这个 [Eliza](https://en.wikipedia.org/wiki/ELIZA) 聊天机器人窗口体验不太好，一旦消息超过窗口高度，你必须手动滚动窗口才能查看最新消息，让我们来改进它：

```js
let div;
let autoscroll;

beforeUpdate(() => {
	autoscroll = div && (div.offsetHeight + div.scrollTop) > (div.scrollHeight - 20);
});

afterUpdate(() => {
	if (autoscroll) div.scrollTo(0, div.scrollHeight);
});
```

请注意，`beforeUpdate` 函数需要在组件挂载前运行，所以我们需要先将div`与组件标签绑定，并判断`div` 是否已被正常渲染。