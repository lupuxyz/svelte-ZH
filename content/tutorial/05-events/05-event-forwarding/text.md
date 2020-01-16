---
title: 事件转发
---

与 DOM 事件不同， 组件事件不会 *冒泡（bubble）* ，如果你想要在某个深层嵌套的组件上监听事件，则中间组件必须 *转发（forward）* 该事件。

这种情况，我们有类似的`App.svelte`和 `Inner.svelte` 在 [前面章节](tutorial/component-events)，但是现在多出一个 `Outer.svelte`来包含 `<Inner/>`。

解决这个问题的方法之一是添加 `createEventDispatcher` 到 `Outer.svelte`中，监听其 `message` 事件，并为它创建一个转发程序：

```html
<script>
	import Inner from './Inner.svelte';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	function forward(event) {
		dispatch('message', event.detail);
	}
</script>

<Inner on:message={forward}/>
```

但这样书写似乎有些臃肿，因此 Svelte 设立了一个简写属性 `on:message`。 `message` 没有赋予特定的值得情况下意味着转发所有`massage`事件：

```html
<script>
	import Inner from './Inner.svelte';
</script>

<Inner on:message/>
```