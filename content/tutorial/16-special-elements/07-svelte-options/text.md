---
title: <svelte:options>
---

最后， `<svelte:options>`标签允许你指定编译器选项。

我们以 `immutable`项为例。在本程序中，`<Todo>` 在接收新数据时会闪烁，点击某一个 `done`就会更新`todos` 数据来切换状态， 就算其他 `<Todo>` 项没有对DOM进行更改，同样会有闪烁效果出现。

我们可以设置`<Todo>` 组件，让其期望的数据是*不可变（immutable）* 的。 这意味着我们承诺永远不会对“todo”的属性进行“变更（mutate ）”，而是在内容发生变化时重新创建新的todo对象。

将此代码添加到`Todo.svelte` 文件内顶部：

```html
<svelte:options immutable={true}/>
```

> 您可以根据需要将其简写为 `<svelte:options immutable/>` ：

现在，当您通过单击todo来切换状态时，仅被更新的组件会闪烁：

该标签可设置的选项有：

* `immutable={true}` ：你不能使用可变数据，因此编译器可以通过引用简单的对比检查来确定值是否已更改。
* `immutable={false}` ：默认值。对于可变对象数据变更，Svelte将其保持不变。
* `accessors={true}` ：为组件的属性添加getter和setter。
* `accessors={false}`：默认。
* `namespace="..."` ：将使用namespace的组件，最常见的是`"svg"`。
* `tag="..."` ：指定将此组件编译为自定义标签时使用的名称。

有关这些选项的更多信息，请查阅 [API reference](docs) 。