---
title: 组件之间的嵌套
---

整个应用程序的代码放在一个组件中显得十分臃肿也难以管理。所以，Svelte 允许从其他文件中导入组件，并像标签一样包含它们。

添加 `<script>` 标签引入外部组件 `Nested.svelte`...

```html
<script>
	import Nested from './Nested.svelte';
</script>
```

..然后用标签的形式使用它：

```html
<p>This is a paragraph.</p>
<Nested/>
```

如上一章节提到的那样，即使`App.svelte` 含有 `<p>` 标签的样式定义 ，`Nested.svelte` 组件内也有一个相同的 `<p>` 标签,  两者样式也不会相互影响。