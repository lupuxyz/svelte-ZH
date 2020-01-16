---
title:  @debug 标记
---

有时候，检查程序的数据流对于排查问题十分有用。

一般通过使用 `console.log(...)` 来实现，如果你想让代码在某一段暂停执行，你可以使用 `{@debug ...}` 标记字符，在要调试的位置添加标记并指定值：

```html
{@debug user}

<h1>Hello {user.firstname}!</h1>
```

如果现在打开浏览器的devtools并键入`<input>` 标签以更改`user`值，则将触发debugger调试器。
