---
title: 添加参数
---

Transition 函数接受参数设置，我们先用 `移入移出(fly)`替换掉`fade` 来过渡：

```html
<script>
	import { fly } from 'svelte/transition';
	let visible = true;
</script>
```

接着给`<p>` 标签添加`fly`属性并设置参数：

```html
<p transition:fly="{{ y: 200, duration: 2000 }}">
	Flies in and out
</p>
```

请注意，transition函数是 *可逆（reversible）* 的，如果给复选框添加transition，它将会从当前状态过渡，而不是从指定的起点或终点过渡。