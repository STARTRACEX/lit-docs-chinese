# 使用 Shadow DOM

Shadow DOM有三个好处:

* DOM 范围. 像`document.querySelector`这样的 DOM API 不会在组件的影子 DOM
  中找到元素, 因此全局脚本更难意外破坏您的组件.
* 样式范围. 您可以为影子 DOM 编写封装样式, 这些样式不会影响 DOM 树的其余部分.
* 组成. 组件的影子根目录(包含其内部
  DOM)独立于组件的子级. 您可以选择如何在组件的内部 DOM 中呈现子项.

有关影子 DOM 的更多信息

* [Shadow DOM v1Web Fundamentals 上的自包含 Web 组件](https://developers.google.com/web/fundamentals/web-components/shadowdom)

* [在 MDN 上使用影子
  DOM]https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_shadow_DOM

## 访问节点

Lit将组件渲染到其renderRoot(默认情况下为shadow
root). 要查找内部元素, 可以使用DOM查询API, 例如this.renderRoot.querySelector().

`renderRoot` 应始终是影子根或元素, 它们共享 API 如
`querySelectorAll()` 和.children``

使用 `this.renderRoot.querySelector()` 查询内部元素

可以在组件初始渲染后查询内部DOM( `firstUpdated` )或使用 `getter`

```js
firstUpdated() {
    this.staticNode = this.renderRoot.querySelector('#static-node');
}
get _closeButton() {
    return this.renderRoot.querySelector('#close-button');
}
```

LitElement 提供了一组修饰器, 它们提供了一种定义此类 getter 的简写方法

### @query, @queryAll和@queryAsync修饰器

#### @query

修改类属性, 将其转换为从呈现根目录返回节点的 getter. 如果为
true, 则可选的第二个参数仅执行一次 DOM
查询并缓存结果. 这可以用作在所查询的节点不会更改的情况下进行性能优化.

```ts
import { html, LitElement } from "lit";
import { query } from "lit/decorators/query.js";
class MyElement extends LitElement {
  // highlight-next-line
  @query("#first")
  _first;
  render() {
    return html`
      <div id="first"></div>
      <div id="second"></div>`;
  }
}
```

```ts
get _first() {
  return this.renderRoot?.querySelector('#first') ?? null;
}
```

#### @queryAll

与 `query` 相同, 只是它返回所有匹配的节点, 而不是单个节点. 这相当于 `querySelectorAll`

```ts
import { html, LitElement } from "lit";
import { queryAll } from "lit/decorators/queryAll.js";
class MyElement extends LitElement {
  @queryAll("div")
  _divs;
  render() {
    return html`
      <div id="first"></div>
      <div id="second"></div>`;
  }
}
```

在这里, _divs将返回模板中的两个 `<div>` 元素. 对于TypeScript, @queryAll属性的类型是 `NodeListOf<HTMLElement>` . 如果您确切地知道要检索哪种类型的节点, 则推断可以更具体

```ts
@queryAll('button') _buttons!: NodeListOf<HTMLButtonElement>
```

#### queryAsync

与 `@query` 类似, 不同的是它不直接返回节点, 而是返回Promise, 该Promise在完成任何挂起的元素渲染后解析到该节点. 代码可以使用它而不是等待updateComplete承诺.

如果@queryAsync返回的节点可能会因另一个属性更改而更改, 将会有用.

## 渲染slot子元素

您的组件可以接受子项(就像 `<ul>` 元素可以有 `<li>` 子项一样)

```html
<my-element>
    <p>A child</p>
</my-element>
```

默认情况下, 如果元素具有shadow tree, 则其子元素根本不渲染

若要呈现子节点, 模板需要包含一个或多个 `<slot>` 元素, 这些元素充当子节点的占位符

### 使用slot元素

若要呈现元素的子元素, 请在元素的模板中为它们创建 `<slot><slot>` . 子项不会在 DOM
树中移动, 但它们会以子项形式呈现

[示例](https://lit.dev/playground/#sample=docs/components/shadowdom/slots)

### 命名slot

* 命名槽仅接受具有匹配槽属性的子项
  例如 `<slot name="one"></slot>` 仅接受 `slot="one"` 属性的元素
* 具有插槽属性的子级将仅在具有匹配名称属性的插槽中渲染.
  例如 `<p slot=“one”></p>` 只会呈现在 `<slot name="one"></slot>` 中

[示例](https://lit.dev/playground/#sample=docs/components/shadowdom/namedslots)

### 回调内容

通过自定义元素中 `<slot>...</slot>` 来指定没有内部元素时()显示的内容

## 访问slot子项

要访问分配给shadow
root中slot的子级, 可以在 `slotchchange` 事件中使用标准 `slot.assignedNodes` 或 `slot.assissignedElements` 方法

例如, 您可以创建一个 getter 来访问特定插槽的指定元素

```js
get _slottedChildren() {
    const slot = this.shadowRoot.querySelector('slot');
    return slot.assignedElements({
        flatten: true
    });
}
```

可以使用 `slotchange` 事件在指定的节点发生更改时采取操作

下面的示例提取所有slot项的文本内容

```js
handleSlotchange(e) {
    const childNodes = e.target.assignedNodes({
        flatten: true
    });
    // 使用childNodes执行某些操作
    this.allText = childNodes.map((node) => {
        return node.textContent ? node.textContent : ''
    }).join('');
}
render() {
    return html`<slot @slotchange=${this.handleSlotchange}></slot>`;
}
```

参阅[MDN上的HTMLSlotElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLSlotElement)

### @queryAssignedElements和@queryAssignedNodes装饰器

| 属性                                   | 说明                                                                   |
| -------------------------------------- | ---------------------------------------------------------------------- |
| flatten                                | 指定是否通过将任何 `<slot>` 子元素替换为分配的节点来平展分配节点的布尔值 |
| slot                                   | 指定要查询的插槽的插槽名称. 保留未定义以选择默认插槽                    |
| selector (只允许queryAssignedElements) | 如果指定, 则仅返回与此 CSS 选择器匹配的已分配元素                       |

```js
get _listItems() {
    const slot = this.shadowRoot.querySelector('slot[name=list]');
    return slot.assignedElements().filter((node) => node.matches('.item'));
}
get _headerNodes() {
    const slot = this.shadowRoot.querySelector('slot[name=header]');
    return slot.assignedNodes({
        flatten: true
    });
}
```

```ts
@queryAssignedElements({slot: 'list', selector: '.item'})
_listItems!: Array<HTMLElement>;
@queryAssignedNodes({slot: 'header', flatten: true})
_headerNodes!: Array<Node>;
```

## 自定义呈现shadow root

每个 Lit 组件都有一个渲染根 — 一个用作其内部 DOM 容器的 DOM 节点

默认情况下, LitElement 创建一个 `shadowRoot open` 并在其中渲染, 生成以下 DOM 结构

```html
<my-element>
    #shadow-root
    <p>child 1</p>
    <p>child 2</p>
```

有两种方法可以自定义 LitElement 使用的渲染根目录：

* 设置.`shadowRootOptions`
* 实现该方法.`createRenderRoot`

### 设置shadowRootOptions

自定义渲染根的最简单方法是设置 `shadowRootOptions` 静态属性. `createRenderRoot` 的默认实现在创建组件的影子根时将 `shadowRootOptions` 作为选项参数传递给 `attachShadow` . 它可以设置为自定义[ShadowRootInit](https://developer.mozilla.org/en-US/docs/Web/API/Element/attachShadow#parameters)字典中允许的任何选项, 例如mode和delegatesFocus.

参见[MDN上的Element.attachShado()](https://developer.mozilla.org/en-US/docs/Web/API/Element/attachShadow)

### 实现createRenderRoot

createRenderRoot的默认实现创建一个开放的影子根, 并将静态样式类字段中设置的任何样式添加到其中. 有关样式的详细信息, 请参见[样式](/docs/components/styles/).

要自定义组件的渲染根, 请实现createRenderRoot并返回要将模板渲染到的节点.

例如, 要将模板作为元素的子元素呈现到主DOM树中, 请实现createRenderRoot并返回它.

[示例](https://lit.dev/playground/#sample=docs/components/shadowdom/renderroot)
