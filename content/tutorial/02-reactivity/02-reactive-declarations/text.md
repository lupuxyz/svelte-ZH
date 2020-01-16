---
title: 声明
---

Svelte 会自动获取组件的状态变更并更新， 一般来说，大部分的组件状态来源于*其他* 部分 （之如 `姓名` 源于 `姓` 和 `名`），每当它们发生变化时便会重新计算。

相比之下，我们使用*reactive declarations（反应式声明）*。它的语法看起来像这样：

```js
let count = 0;
$: doubled = count * 2;
```

> 这看起来有些陌生，不过不必担心 这个[valid（有效的）](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/label) (非常规) JavaScript， Svelte 会将其解释为“只要任何引用的值发生更改，都要重新运行此代码”。一旦习惯了，就停不下来。

将`doubled` 添加到标签中：

```html
<p>{count} doubled is {doubled}</p>
```

当然，本例中你可以直接将 `{count * 2}` 插入你的代码， 而不必使用反应式声明写法。然而当你需要多次使用它们或你的值与其他反应性值绑定时，反应式声明写法的值变得特别有用。
