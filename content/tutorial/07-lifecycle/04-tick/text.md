---
title: tick
---
`tick`函数不同于其他生命周期函数，因为你可以随时调用它，而不用等待组件首次初始化。它返回一个带有resolve方法的 [Promise](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Using_promises)，每当组件`pending状态`变化便会立即体现到DOM中 (除非没有`pending状态`变化)。

在Svelte中每当组件状态失效时，DOM不会立即更新。 反而Svelte会等待下一个 *microtask* 以查看是否还有其他变化的状态或组件需要应用更新。这样做避免了浏览器做无用功，使之更高效。

这点在本示例中有所体现。选择文本，然后按“Tab”键。
因为 `<textarea>` 标签的值已发生变化，浏览器会将选中区域取消选中并将光标置于文本末尾，这显然不是我们想要的，我们可以借助`tick`函数来解决此问题：

```js
import { tick } from 'svelte';
```

然后在 `this.selectionStart` 和 `this.selectionEnd` 设置结束前立即运行`handleKeydown`：

```js
await tick();
this.selectionStart = selectionStart;
this.selectionEnd = selectionEnd;
```