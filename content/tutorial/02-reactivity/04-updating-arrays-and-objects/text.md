---
title:更新数组和对象
---

由于 Svelte 的反应性是在指定时触发的，所以使用诸如 `push`、 `splice`这样的方法不会触发更新。 例如，点击按钮不会有任何反应。

解决办法是将此类方法写入一个函数内，添加一个连续赋值的表达式：

```js
function addNumber() {
	numbers.push(numbers.length + 1);
	numbers = numbers;
}
```

或者用ES6写法替此类方法使用：

```js
function addNumber() {
	numbers = [...numbers, numbers.length + 1];
}
```
你也可以使用类似的方式来替代 `pop`、`shift`、 `unshift` 和 `splice`。

数组和对象 *属性* 的指定。例如 `obj.foo += 1` 或 `array[i] = x` — 工作方式与值本身的分配相同。

```js
function addNumber() {
	numbers[numbers.length] = numbers.length + 1;
}
```

一个简单的经验法则：需要更新变量的名必须出现在赋值的左侧。例如这个：

```js
const foo = obj.foo;
foo.bar = 'baz';
```

不会更新对`obj.foo.bar`的引用 ,除非您使用 `obj = obj`来跟进。