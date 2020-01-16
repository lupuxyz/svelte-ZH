---
title: 销毁
---

如果想让组件代码销毁，请使用 `onDestroy`。

例如，我们可以添加`setInterval` 在初始化的组件中，并对其进行销毁`Destroy`操作， 这样做可以防止内存泄露。

```html
<script>
	import { onDestroy } from 'svelte';

	let seconds = 0;
	const interval = setInterval(() => seconds += 1, 1000);

	onDestroy(() => clearInterval(interval));
</script>
```

虽然在组件初始化期间调用生命周期函数很重要,但是从何处调用它都没关系。我们可以在外部新建一个名为 `utils.js`的文件，将这个功能放在这个文件中：

```js
import { onDestroy } from 'svelte';

export function onInterval(callback, milliseconds) {
	const interval = setInterval(callback, milliseconds);

	onDestroy(() => {
		clearInterval(interval);
	});
}
```

然后将它导入至组件内：

```html
<script>
	import { onInterval } from './utils.js';

	let seconds = 0;
	onInterval(() => seconds += 1, 1000);
</script>
```