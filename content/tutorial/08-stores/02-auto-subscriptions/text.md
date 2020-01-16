---
title: 自动 subscriptions
---

上一个示例中的程序虽然可以运行，但是存在了一个小bug：该 `unsubscribe` 函数永远不会调用。如果该组件实例化时被多次销毁，则会导致 *内存泄漏（memory leak）*。

解决该问题的一种方法是使用 `onDestroy` [生命周期函数](tutorial/ondestroy)：

```html
<script>
	import { onDestroy } from 'svelte';
	import { count } from './stores.js';
	import Incrementer from './Incrementer.svelte';
	import Decrementer from './Decrementer.svelte';
	import Resetter from './Resetter.svelte';

	let count_value;

	const unsubscribe = count.subscribe(value => {
		count_value = value;
	});

	onDestroy(unsubscribe);
</script>

<h1>The count is {count_value}</h1>
```

但是这样会显得有些啰嗦，特别是你的组件`subscribes`了大量`stores`时。在Svelte 中，你可以给`store`值名称前添加  `$`来解决这个问题：

```html
<script>
	import { count } from './stores.js';
	import Incrementer from './Incrementer.svelte';
	import Decrementer from './Decrementer.svelte';
	import Resetter from './Resetter.svelte';
</script>

<h1>The count is {$count}</h1>
```

> 自动 subscription 仅适用于在最外层级的组件的声明(或导入)store变量 。

你可以在标签内部使用 `$count`，也可以在 `<script>` 代码块内使用，例如在事件处理程序或反应式声明中。

> 假定以任何以 `$`开头的名称均指代`store`值。它实际上是保留字符，Svelte中禁止你使用 `$` 开头的命名变量。