---
sidebar_position: 2
---

# 表达式

下面是一个快速参考

| 类型                                                                                                  | 示例                                                         |
| ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| 子节点                                                                                                | ` ` html ` <h1>Hello ${name}</h1><ul>${listItems}</ul> `  ` ` |
| 属性                                                                                                  | ` ` html ` <input type="text" value="${name}"> `  ` ` |
| 布尔属性                                                                                              | ` ` html ` <div ?hidden=${!show}></div> `  ` ` |
| Properties                                                                                            | ` ` html ` <input .value=${name}> `  ` ` |
| 事件监听                                                                                              | ` ` html ` <button @click=${this._clickHandler}>Go</button> `  ` ` |
| 元素指令                                                                                              | ` ` html ` <input ${ref(inputRef)}> `  ` ` |
| [此基本示例](https://lit.dev/playground/#sample=docs/templates/expressions)显示了各种不同类型的表达式 |                                                              |

以下各节更详细地介绍了每种表达式

## 子表达式

在元素的开始标记和结束标记之间出现的表达式可以向元素添加子节点. 例如:

```js
html`<p>Hello, ${name}</p>`;
```

或

```js
html`<main>${bodyText}</main>`;
```

子位置中的表达式可以采用多种值

* 基元值 如字符串、数字和布尔值
* 使用`html`创建的`TemplateResult`, 或svg
* DOM 节点
* 标记值
* 任何受支持类型的数组或可迭代项

### 基元值

Lit 可以呈现几乎所有基元值, 并在插入文本内容时将它们转换为字符串.

像 `5` 这样的数字值将呈现字符串 `"5"` . Bigint的处理方式类似

布尔值 `true` 将呈现 `"true"` , `false` 将呈现 `"false"` , 但呈现这样的布尔值并不常见. 相反, 布尔值通常在条件中用于呈现其他适当的值.

`""` , `null` , `undefined` 不呈现任何内容

Symbol放在子表达式中时不能转换为字符串和抛出

### 标记值

Lit 提供了几个可在子表达式中使用的特殊标记值

标记值不会更改表达式的现有值. 它通常用于自定义指令

标记值不呈现任何内容

### 模板

由于子位置的表达式可以返回 `TemplateResult` , 因此可以嵌套和组合模板

```js
const nav = html`<nav>...</nav>`;
const page = html`
  ${nav}
  <main>...</main>
`;
```

这意味着您可以使用普通 JavaScript 来创建条件模板、重复模板等

```js
html`
  ${
  this.user.isloggedIn ? html`Welcome ${this.user.name}` : html`Please log in`
}
`;
```

### DOM节点

任何DOM节点都可以传递给子表达式. 通常, DOM节点应该通过使用 `html` 指定模板来呈现, 但在需要时可以直接这样呈现DOM节点. 该节点在此时附加到DOM树, 因此从任何当前父节点中移除:

```js
const div = document.createElement("div");
const page = html`
  ${div}
  <p>This is some text</p>
`;
```

### 任何受支持类型的数组或可迭代项

表达式还可以以任意组合返回任何受支持类型的数组或可迭代对象. 您可以将此功能与标准
JavaScript（如 Array
方法）一起使用来创建重复模板和列表. 有关示例, 请参阅[列表](https://lit.dev/docs/templates/lists/)

### 删除子内容

`""` , `null` , `undefined` 和 Lit's nothing 哨兵值会删除任何以前渲染的内容

设置或删除子内容通常基于条件完成

当表达式是具有 Shadow DOM
的元素的子元素的子元素时, 不呈现任何节点可能很重要, 该元素包含
具有回调内容. 不呈现节点可确保呈现回调内容. 有关详细信息, 请参阅[回调内容](/docs/components/shadow-dom/#回调内容)

## attribute表达式

除了使用表达式添加子节点外, 还可以使用它们来设置元素的属性和属性.

默认情况下, 属性值中的表达式设置属性

```js
html`<div class=${this.textClass}>Stylish text.</div>`;
```

由于属性值始终是字符串, 因此表达式应返回可转换为字符串的值

如果表达式构成整个属性值, 则可以省略引号. 如果表达式仅构成属性值的一部分, 则需要引用整个值

```js
html`<img src="/images/${this.image}">`;
```

### 布尔属性

若要设置布尔属性, 请使用带有属性名称 `?` 的前缀. 如果表达式的计算结果为真值, 则添加该属性, 如果表达式的计算结果为假值, 则删除该属性

```js
html`<div ?hidden=${!this.showAdditional}>This text may be hidden.</div>`;
```

### 删除属性

有时您希望仅在特定条件下设置属性, 否则将删除该属性. 对于常见的"布尔属性"（如 `disabled` 和 `hidden` ）, 如果您希望将属性设置为一个空字符串以获得真实值, 否则将其删除, 请使用布尔属性. 然而, 有时, 添加或删除属性可能需要不同的条件

```js
html`<img src="/images/${this.imagePath}/${this.imageFile}">`;
```

如果未定义 `this.imagePath` 或 `this.imageFile` , 则不应设置 `src` 属性, 否则将发生无效的网络请求.

lit的标记值通过在属性值中的任何表达式的计算结果为 `nothing`

```js
html`<img src="/images/${this.imagePath ?? nothing}/${
  this.imageFile ?? nothing
}">`;
```

在此示例中, 必须定义 `this.imagePath` 和 `this.imageFile` 属性才能设置 `src` 属性. 这个如果左侧值为 `null` 或 `undefined` , 则null合并运算符返回右侧值.

Lit还提供了一个ifDefined指令, 该指令是指令糖 `value ?? nothing`

```js
html`<img src="/images/${ifDefined(this.imagePath)}/${
  ifDefined(this.imageFile)
}">`;
```

可能要在值不实际时移除属性, `false` 或 `""` 的值将删除该属性, 例如, 一个具有 `""` 的 `this.ariaLabel` 默认值的元素

```js
html`<button aria-label="${this.ariaLabel || nothing}"></button>`;
```

在此示例中, 只有当 `this.ariaLabel` 不是空字符串时, 才会呈现 `ariaLabel` 属性.

## property表达式

您可以使用前缀 `.` 和属性名称在元素上设置 JavaScript 属性

```js
html`<input .value=${this.itemCount}>`;
```

您可以使用此语法将复杂数据从树传递到子组件. 例如, 如果您有一个带有 `listItems` 属性的 `my-list` 组件, 则可以向它传递一个对象数组

请注意, 此示例中的属性名称 `listItems` 是混合大小写的. 尽管 HTML 属性不区分大小写, 但
Lit 在处理模板时会保留属性名称的大小写

## 事件监听表达式

模板还可以包括声明性事件侦听器. 使用前缀 `@` , 后跟事件名称. 表达式的计算结果应为事件侦听器

```js
html`<button @click=${this.clickHandler}>Click Me!</button>`;
```

这类似于调用 `addEventListener('click', this.clickHandler)` 的按钮元素.

事件侦听器可以是普通函数, 也可以是具有 `handleEvent` 方法的对象-与标准[ `addEventListener` ](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener)方法的侦听器参数相同.

在Lit组件中, 事件侦听器自动绑定到组件, 因此您可以在处理程序中使用this值来引用组件实例.

```js
clickHandler() {
    this.clickCount++;
}
```

## 元素表达式

您还可以添加访问元素实例的表达式, 而不是元素上的单个属性或特性:

```js
html`<div ${myDirective()}></div>`;
```

元素表达式仅适用于指令. 元素表达式中的任何其他值类型都将被忽略.

可以在元素表达式中使用的一个内置指令是指令. 它提供对呈现元素的引用.ref

```js
html`<button ${ref(this.myRef)}`;
```

## 正确的HTML格式

点亮模板必须是格式正确的 HTML. 在插入任何值之前, 模板由浏览器的内置 HTML
解析器解析. 对于格式正确的模板, 请遵循以下规则

* 当所有表达式都替换为空值时, 模板必须是格式正确的 HTML
* 模板可以有多个顶级元素和文本
* 模板不应包含未关闭的元素 - 它们将由 HTML 解析器关闭

```js
// HTML解析器在"某些文本"之后关闭此div
const template1 = html`<div class="broken-div">Some text`;
// 连接时,"more text"不会以.brued-div结尾
const template2 = html`${template1} more text. </div>`;
```

## 有效的表达式位置

表达式**只能**出现在可以在 HTML 中放置属性值和子元素的位置

```html
<!-- 属性值 -->
<div label=${label}></div>
<button ?disabled=${isDisabled}>Click me!</button>
<input .value=${currentValue}>
<button @click=${this.handleClick()}>
    <!-- 子内容 -->
    <div>${textContent}</div>
```

元素表达式可以出现在标签名称之后的开始标签内

```html
<div ${ref(elementReference)}></div>
```

### 无效位置

表达式通常不应出现在以下位置:

* 标记或属性名称的显示位置. Lit不支持在此位置动态更改值, 并且在开发模式下会出错

  

```html
  <!-- 错误 -->
  <${tagName}></${tagName}>
  <!-- 错误 -->
  <div ${attrName}=true></div>
```

* `<template>`元素内容内部（允许模板元素本身的属性表达式）. Lit
  不会递归到模板内容中以动态更新表达式, 并且在开发模式下会出错

  

```html
  <!-- ERROR -->
  <template>${content}</template>
  <!-- OK -->
  <template id="${attrValue}">static content ok</template>
```

* 在`<textarea>`元素内容内部（允许textarea元素本身的属性表达式）. 注意, Lit可以将内容呈现到文本区域中, 但是编辑文本区域将破坏对Lit用于动态更新的DOM的引用, 并且Lit将在开发模式下发出警告. 相反, 绑定到textarea的.value属性

  

```html
  <!-- 小心 -->
  <textarea>${content}</textarea>
  <!-- OK -->
  <textarea .value=${content}></textarea>
  <!-- OK -->
  <textarea id="${attrValue}">static content ok</textarea>
```

* 在具有contenteditable属性的元素内部. 而是绑定到元素的.innerText属性

  

```html
  <!-- 小心 -->
  <div contenteditable>${content}</div>
  <!-- OK -->
  <div contenteditable .innerText=${content}></div>
  <!-- OK -->
  <div contenteditable id="${attrValue}">static content ok</div>
```

* 在 HTML 注释中. Lit 不会更新注释中的表达式, 在开发过程中注释掉可能包含表达式的
  HTML 块是安全的

  

```html
  <!-- will not update: ${value} -->
```

* 使用 ShadyCSS polyfill 时`<style>`元素内部

## 静态表达式

静态表达式返回特殊值, 这些值在模板被 Lit 处理为 HTML
之前插入到模板中. 由于它们成为模板静态 HTML
的一部分, 因此它们可以放置在模板中的任何位置 -
即使在通常不允许表达式的位置, 例如属性和标记名称中也是如此.

要使用静态表达式, 必须从Lit的 `static-html` 模块导入一个特殊版本的 `html` 或 `svg` 模板标记

静态html模块包含支持静态表达式的html和svg标记函数, 应使用这些函数代替lit模块中提供的标准版本. 使用文本标记函数创建静态表达式.

您可以将静态表达式用于不太可能更改的配置选项, 或者用于自定义模板中无法使用常规表达式的部分-有关详细信息, 请参阅[有效表达式位置](#有效的表达式位置)一节. 例如, my-button组件可能会呈现一个 `<button>` 标记, 但子类可能会呈现 `<a>` 标记. 这是一个使用静态表达式的好地方, 因为设置不会频繁更改, 并且自定义HTML标记无法使用普通表达式完成.

```js
import { LitElement } from "lit";
import { html, literal } from "lit/static-html.js";
class MyButton extends LitElement {
    static properties = {
        caption: {},
        active: {
            type: Boolean
        },
    };
    tag = literal`button`;
    activeAttribute = literal`active`;
    constructor() {
        super();
        this.caption = "Hello static";
        this.active = false;
    }
    render() {
        return html`
      <${this.tag} ${this.activeAttribute}?=${this.active}>
        <p>${this.caption}</p>
      </${this.tag}>`;
    }
}
customElements.define("my-button", MyButton);

class MyAnchor extends MyButton {
    tag = literal`a`;
}
customElements.define("my-anchor", MyAnchor);
```

```ts
import { LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { html, literal } from "lit/static-html.js";
@customElement("my-button")
class MyButton extends LitElement {
  tag = literal`button`;
  activeAttribute = literal`active`;
  @property()
  caption = "Hello static";
  @property({ type: Boolean })
  active = false;
  render() {
    return html`
      <${this.tag} ${this.activeAttribute}?=${this.active}>
        <p>${this.caption}</p>
      </${this.tag}>`;
  }
}

@customElement("my-anchor")
class MyAnchor extends MyButton {
  tag = literal`a`;
}
```

:::danger

更改静态表达式的值代价高昂. 使用 `literal` 值的表达式不应频繁更改, 因为它们会导致重新分析新模板, 并且每个变体都保存在内存中

:::

在上面的示例中, 如果模板重新渲染并且this.option或this.active发生更改, Lit将有效地更新模板, 只更改受影响的表达式. 但是, 如果this.tag或this.activeAttribute发生更改, 因为它们是用文本标记的静态值, 则会创建一个全新的模板；更新是低效的, 因为DOM被完全重新呈现. 此外, 更改传递给表达式的文字值会增加内存使用, 因为每个唯一模板都缓存在内存中以提高重新渲染性能.
出于这些原因, 最好尽量减少对使用文字的表达式的更改, 并避免使用反应性属性来更改文字值, 因为反应性属性是要更改的.

### 模板结构

### 静态非字面量

在极少数情况下, 您可能需要将静态HTML插入到脚本中未定义的模板中, 因此无法使用 `literal` 进行标记. 对于这些情况, 可以使用 `unsafeStatic()` 基于来自非脚本源的字符串创建静态HTML.

```js
import { html, unsafeStatic } from "lit/static-html.js";
```

:::danger

仅适用于受信任的内容. 注意在 `unsafeStatic()` 中使用了 `unsafe` . 传递给 `unsafeStatic()` 的字符串必须由开发人员控制, 并且不能包含不受信任的内容, 因为它将被直接解析为HTML, 而不需要净化. 不可信内容的示例包括来自用户输入的查询字符串参数和值. 使用此指令呈现的不受信任的内容可能会导致跨站点脚本漏洞.

:::

```js
class MyButton extends LitElement {
    static properties = {
        caption: {},
        active: {
            type: Boolean
        },
    };
    constructor() {
        super();
        this.caption = "Hello static";
        this.active = false;
    }
    render() {
        const tag = getTagName();
        const activeAttribute = getActiveAttribute();
        return html`
      <${unsafeStatic(tag)} ${unsafeStatic(activeAttribute)}?=${this.active}>
        <p>${this.caption}</p>
      </${unsafeStatic(tag)}>`;
    }
}
customElements.define("my-button", MyButton);
```

```ts
@customElement("my-button")
class MyButton extends LitElement {
  @property()
  caption = "Hello static";
  @property({ type: Boolean })
  active = false;
  render() {
    const tag = getTagName();
    const activeAttribute = getActiveAttribute();
    return html`
      <${unsafeStatic(tag)} ${unsafeStatic(activeAttribute)}?=${this.active}>
        <p>${this.caption}</p>
      </${unsafeStatic(tag)}>`;
  }
}
```

请注意, 使用 `unsafeStatic` 的行为带有与 `literal` 相同的警告: 因为更改值会导致解析新模板并将其缓存在内存中, 因此不应频繁更改.
