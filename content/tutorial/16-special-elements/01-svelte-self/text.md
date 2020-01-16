---
title: <svelte:self>
---

Svelte 内置了一系列特殊标签，首先是 `<svelte:self>`标签，允许组件递归自身身。

对于此文件夹树视图之类的东西很有用，此文件夹中可以包含其他文件夹。 在`Folder.svelte` 中我们希望能够做到这一点：

```html
{#if file.type === 'folder'}
	<Folder {...file}/>
{:else}
	<File {...file}/>
{/if}
```

但这是不可能的，因为Folder.svelte无法导入自身作为组件。对此，我们可以使用`<svelte:self>`：

```html
{#if file.type === 'folder'}
	<svelte:self {...file}/>
{:else}
	<File {...file}/>
{/if}
```