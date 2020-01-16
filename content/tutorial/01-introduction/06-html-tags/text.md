---
title: HTML 标签
---

通常，字符串以纯文本的形式插入到文档中，如果字符串内包含有HTML标签并不会正常显示 。

但是你可能会遇到需要将字符串以HTML的形式呈现到组件中，例如，你正在阅读的文本位于markdown文件中，该文件以HTML形式插入到本页面中。

在 Svelte 中, 你可借助 `{@html ...}` 语法来实现该功能：

```html
<p>{@html string}</p>
```

> Svelte 在 `{@html ...}` 插入DOM之前不会对你的内容作任何处理, 如果你需要使用此语法，必须转义来自不信任来源的HTML内容，这一点非常重要，否则你可能使用户面临XSS攻击的风险。