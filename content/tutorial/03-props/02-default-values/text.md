---
title: 默认值
---

我们可以轻易的将属性值初始化：

```html
<script>
	export let answer = 'a mystery';
</script>
```

如果现在你的第二个组件中 *不指定*  `answer` 属性的值，它将会使用初始（默认）值：

```html
<Nested answer={42}/>
<Nested/>
```
