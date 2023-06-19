# 渲染

将模板添加到组件以定义它应呈现的内容. 模板可以包含表达式, 表达式是动态内容的占位符.

要为光照组件定义模板, 请添加一个 `render()` 方法

[示例](https://lit.dev/playground/#sample=docs/templates/define)

使用 Lit 的 html 标签函数在 JavaScript 标记模板文字中以 HTML 形式编写模板

模板可以包含 JavaScript
表达式. 可以使用表达式来设置文本内容、属性、属性和事件侦听器. `render()` 方法还可以包含任何
JavaScript, 例如, 您可以创建用于表达式的局部变量

## 可渲染值

通常, 组件的 `render()` 方法返回单个 `TemplateResulthtml` 对象(与 tag
返回的类型相同). 但是, 它可以返回 Lit 可以呈现为 HTML 元素的子元素的任何内容:

* 基元值, 如字符串、数字或布尔值.
* thtml功能创建的TemplateResul对象.
* DOM 节点.
* nothing和nohaschange的标记值
* 任何受支持类型的数组或迭代对象.

这与可以渲染为Lit[子表达式](/docs/templates/expressions/#子表达式)的值集几乎相同。唯一的区别是子表达式可以呈现svg函数返回的 `SVGTemplateResult` 。这种模板结果只能作为 `<svg>` 元素的后代呈现。

## 编写一个好的 render() 方法

为了充分利用 Lit 的功能渲染模型, 您的 `render()` 方法应遵循以下准则:

* 避免更改组件的状态.
* 避免产生任何副作用.
* 仅使用组件的属性作为输入.
* 给定相同的属性值时返回相同的结果.

遵循这些准则可使模板具有确定性, 并使其更容易推理代码.

在大多数情况下, 应避免在 `render()` 之外进行 DOM
更新. 相反, 将组件的模板表示为其状态的函数, 并在属性中捕获其状态

例如, 如果组件在收到事件时需要更新其 UI, 请让事件侦听器设置在 `render()`

中使用的反应式属性, 而不是直接操作 DOM

详情参阅[反应式属性](/docs/components/properties/)

## 构成模板

您可以从其他模板引入lit模板. 示例为从页面页眉、页脚和主要内容的较小模板调用的组件组成模板

[示例](https://lit.dev/playground/#sample=docs/templates/compose)

上示例中, 各个模板定义为实例方法, 因此子类可以扩展此组件并覆盖一个或多个模板.

您还可以通过导入其他元素并在模板中使用它们来撰写模板

[示例](https://lit.dev/playground/#sample=docs/templates/composeimports)

## 模板呈现时

Lit 组件最初在添加到页面上的 DOM
时呈现其模板. 初始渲染后, 对组件反应属性的任何更改都会触发更新周期, 重新渲染组件.

点亮批量更新以最大限度地提高性能和效率. 一次设置多个属性仅触发一次更新, 在微任务计时异步执行.

在更新期间, 仅重新呈现 DOM 中更改的部分. 尽管 Lit 模板看起来像字符串插值, 但 Lit
解析并创建静态 HTML 一次, 然后只更新表达式中更改的值, 这使得更新非常高效.

有关更新周期的详细信息, 请参阅属性更改时会发生什么情况.

## DOM封装

Lit使用shadow
DOM封装组件渲染的DOM. ShadowDOM允许元素创建自己的、独立于主文档树的DOM树. 它是web组件规范的一个核心特性, 支持互操作性、样式封装和其他好处.

有关shadow
DOM的更多信息, 请参阅[shadow DOM v1: 自包含Web Components](https://developers.google.com/web/fundamentals/web-components/shadowdom)

有关在组件中使用Shadow DOM
的更多信息, 请参阅[Shadow DOM](/docs/components/shadow-dom/)
