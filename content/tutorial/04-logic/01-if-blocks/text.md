---
title: If 块
---

HTML虽然没有条件条件和循环之类的*逻辑*范式，但 Svelte 有！

为了有条件地渲染一些标记，我们将其包装在一个 `if` 块中：

```html
{#if user.loggedIn}
	<button on:click={toggle}>
		Log out
	</button>
{/if}

{#if !user.loggedIn}
	<button on:click={toggle}>
		Log in
	</button>
{/if}
```

尝试一下更改代码，然后点击按钮试试。