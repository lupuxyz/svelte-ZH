---
title: Else 块
---

由于 `if user.loggedIn` 和 `if !user.loggedIn`是逻辑刚好是对立的，所以我们可以使用`else` 块来稍微简化此组件：

```html
{#if user.loggedIn}
	<button on:click={toggle}>
		Log out
	</button>
{:else}
	<button on:click={toggle}>
		Log in
	</button>
{/if}
```

> 带有 `#`的块标记表示*打开*，带有`/`的块标记表示结束，带有`:`的块标记表示继续。不用担心过于复杂，这已经是Svelte为HTML添加的所有语法。