---
title: 共享代码
---

在我们目前看到的所有示例中，`<script>`块包含在初始化每个组件实例时运行的代码。对于绝大多数组件，这可能已经可以满足你的所有需求。

偶尔，您需要在单个组件实例之外运行一些代码。例如，你同时拥有五个音频播放器，其中一个播放中，另外四个则为暂停，如何实现这点？

我们可以通过声明一个 `<script context="module">` 块来做到这一点。当模块首次计算时，其中包含的代码将运行一次，而不是等到组件被实例化时。将 `<script context="module">`添加到 `AudioPlayer.svelte`顶部：

```html
<script context="module">
	let current;
</script>
```

现在，无需任何状态管理，组件就可以彼此“通信”

```js
function stopOthers() {
	if (current && current !== audio) current.pause();
	current = audio;
}
```
