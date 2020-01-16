---
title: 过渡指令
---

我们通过给DOM标签添加优雅地过渡效果，可以使用户界面更具吸引力， Svelte 给DOM标签添加过渡效果非常容易，只需使用 `transition`模块，。

首先，从`svelte/transition`路径引入名为 `淡入淡出(fade)` 的方法：

```html
<script>
	import { fade } from 'svelte/transition';
	let visible = true;
</script>
```

.然后添加到 `<p>` 标签上：

```html
<p transition:fade>Fades in and out</p>
```