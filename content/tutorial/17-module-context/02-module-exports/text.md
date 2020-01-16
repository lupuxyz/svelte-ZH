---
title: Exports
---

从`context="module"`代码块导出的所有内容都将作为它本身来导出。如果我们从`AudioPlayer.svelte`导出`stopAll` 函数：

```html
<script context="module">
	const elements = new Set();

	export function stopAll() {
		elements.forEach(element => {
			element.pause();
		});
	}
</script>
```

然后我们从`App.svelte`中导入它：

```html
<script>
	import AudioPlayer, { stopAll } from './AudioPlayer.svelte';
</script>
```

将它绑定到事件中：

```html
<button on:click={stopAll}>
	stop all audio
</button>
```

> 你不能使用默认导出，因为该组件本来就是default export。