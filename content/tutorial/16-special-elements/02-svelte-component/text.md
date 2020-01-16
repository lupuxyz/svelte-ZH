---
title: <svelte:component>
---

组件可以使用`<svelte:component>`来更改其类别， 从而代替 `if` 块来使用：

```html
{#if selected.color === 'red'}
	<RedThing/>
{:else if selected.color === 'green'}
	<GreenThing/>
{:else if selected.color === 'blue'}
	<BlueThing/>
{/if}
```

将它指向一个动态组件：

```html
<svelte:component this={selected.component}/>
```

该`this`值可以是所有组件构造器，也可以是一个布尔值，如果结果为假，则不会渲染组件。 