---
title:组件事件
---

组件也可以调度事件，为此，组件内必须创建一个相同事件并在外部进行分配。 更改 `Inner.svelte`：

```html
<script>
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	function sayHello() {
		dispatch('message', {
			text: 'Hello!'
		});
	}
</script>
```

> `createEventDispatcher` 必须在首次实例化组件时调用它，—组件本身不支持如 `setTimeout` 之类的事件回调。 定义一个`dispatch`进行连接，进而把组件实例化。