---
title: 绑定Store
---

如果 store可写入的(即具有`set`方法）,则可以绑定其值，就像可以绑定局部组件状态一样。

在此示例中，我们有一个可写 `store`：`name`和一个派生`store `：`greeting`，尝试更改`<input>`标签：

```html
<input bind:value={$name}>
```

现在，更改`name`的输入值 ，其值和依赖项都将获得更新。

我们还可以直接分配`store`值在组件内部，尝试添加`<button>` 标签：

```html
<button on:click="{() => $name += '!'}">
	Add exclamation mark!
</button>
```

此处 `$name += '!'` 相当于 `name.set($name + '!')`。