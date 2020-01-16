---
title: 文本域绑定
---

同样，`<textarea>`标签在 Svelte 也可使用`bind:value`进行绑定：

```html
<textarea bind:value={value}></textarea>
```

在这种情况下，如果值与变量名相同，我们也可以使用简写形式：

```html
<textarea bind:value></textarea>
```

这种写法适用于所有绑定，而不仅仅是`<textarea>`。