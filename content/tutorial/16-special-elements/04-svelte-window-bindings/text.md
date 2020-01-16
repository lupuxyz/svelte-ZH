---
title: <svelte:window>绑定
---

我们还可以绑定某些属性到`window`事件例如 `scrollY`。更新代码第7行：
```html
<svelte:window bind:scrollY={y}/>
```

可以绑定到的属性：

* `innerWidth`
* `innerHeight`
* `outerWidth`
* `outerHeight`
* `scrollX`
* `scrollY`
* `online` ： `window.navigator.onLine`的别名。 

除“scrollX”和“scrollY”外，其余的都是只读的。