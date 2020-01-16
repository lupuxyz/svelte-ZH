---
title: 深入反应式声明
---

反应式声明不仅可以与*values* 进行绑定，你还可以加入任意语句，例如， 我们可以记录 `count` whenever it changes:

```js
$: console.log(`the count is ${count}`);
```

你可以很容易的置入代码块：

```js
$: {
	console.log(`the count is ${count}`);
	alert(`I SAID THE COUNT IS ${count}`);
}
```

你甚至可以将`$:` 与 `if` 代码块放在一起：

```js
$: if (count >= 10) {
	alert(`count is dangerously high!`);
	count = 9;
}
```