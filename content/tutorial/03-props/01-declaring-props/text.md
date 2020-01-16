---
title: 属性声明
---

进行到现在， 我们只能处理内部状态，这些值且只能在特定的组件内访问。 

在通常情况下，你需要将数据从一个组件传递到其子组件中。因此，我们需要声明*properties*，通常缩写为'props'。 在 Svelte中，我们通过  `export` 关键字来实现组件的导出，编辑 `Nested.svelte` 组件：

```html
<script>
	export let answer;
</script>
```

> 就如 `$:`，刚开始可能你会觉得有些奇怪 `export` 怎么不是 JavaScript 般使用？等你习惯后，也许你会认同它的。