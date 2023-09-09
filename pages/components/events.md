# 事件

事件是元素传达更改的标准方式. 这些更改通常是由于用户交互而发生的. 例如, 当用户单击按钮时, 按钮会调度该事件; 当用户在其中输入值时, 输入将调度更改事件.

除了这些自动调度的标准事件外, 光照元素还可以调度自定义事件. 例如, 菜单元素可能会调度一个事件来指示所选项已更改; 弹出窗口元素可能会在弹出窗口打开或关闭时调度事件.

任何 Javascript 代码, 包括 Lit
元素本身, 都可以监听事件并根据事件采取行动. 例如, 工具栏元素可能会在选择菜单项时筛选列表; 登录元素在处理对登录按钮的单击时可能会处理登录.

## 监听事件

除了标准 API 之外, Lit 还引入了一种添加事件监听器的声明性方法 `addEventListener`

### 在元素模板中添加事件监听器

可以使用模板中的 `@` 表达式将事件监听器添加到组件模板中的元素. 呈现模板时会添加声明性事件监听器

[示例](https://lit.dev/playground/#sample=docs/components/events/child)

#### 自定义事件监听器选项

如果需要自定义用于声明性事件监听器的事件选项（如被动或捕获）, 可以使用 `@eventOptions` 修饰符在监听器上指定这些选项. 传递给 `@eventOptions` 的对象作为 `options` 参数传递给 `addEventListener` .

```ts
import {LitElement, html} from 'lit';
import {eventOptions} from 'lit/decorators.js';
//...
@eventOptions({passive: true})
private _handleTouchStart(e) { console.log(e.type) }
```

如果不使用修饰器, 则可以通过向事件监听器表达式传递对象来自定义事件监听器选项. 该对象必须具有handleEvent（）方法, 并且可以包含通常出现在addEventListener（）的options参数中的任何选项

```js
render() {
    return html`<button @click=${{handleEvent: () => this.onClick(), once: true}}>click</button>`
}
```

#### 将事件监听器添加到组件或其shadow root

为了获得从组件的槽子级以及通过组件模板呈现到shadow
DOM中的子级发出的事件通知, 可以使用标准的 `addEventListener`

DOM方法向组件本身添加监听器. 有关详细信息, 请参阅MDN上的[EventTarget.addEventListener](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener)

是组件上添加事件监听器的好地方是constructor()

```js
constructor() {
    super();
    this.addEventListener('click', (e) => console.log(e.type, e.target.localName));
}
```

将事件监听器添加到组件本身是事件委托的一种形式, 可以减少代码或提高性能. 有关详细信息, 请参阅[事件委托](https://lit.dev/docs/components/events/#event-delegation). 通常, 完成此操作后, 将使用事件的目标属性根据触发事件的元素采取操作.

但是, 当组件上的事件监听器听到从组件的shadow
DOM触发的事件时, 会重新定位这些事件. 这意味着事件目标是组件本身. 有关详细信息, 请参阅[在shadow DOM中处理事件](https://lit.dev/docs/components/events/#shadowdom).

重新定位可能会干扰事件委托, 为了避免这种情况, 可以将事件监听器添加到组件的shadow
root本身. 由于 `shadowRoot` 在构造函数中不可用, 因此可以在 `createRenderRoot` 方法中添加事件监听器, 如下所示. 请注意, 确保从 `createRenderRoot` 方法返回shadow
root非常重要.

[示例](https://lit.dev/playground/#sample=docs/components/events/host)

### 将事件监听器添加到其他元素

如果您的组件将事件监听器添加到除其自身或其模板化DOM之外的任何对象（例如, 添加到Window、Document或主DOM中的某个元素）, 则应在connectedCallback中添加监听器, 并在disconnectedCallback中删除它.

* 在`disconnectedCallback`中删除事件监听器可确保在组件被破坏或与页面断开连接时, 组件分配的所有内存都将被清理.
* 在`connectedCallbac`k中添加事件监听器(而不是`constructor`或`firstUpdated`)可确保组件在断开连接并随后重新连接到DOM时重新创建其事件监听器.

```js
connectedCallback() {
    super.connectedCallback();
    window.addEventListener('resize', this._handleResize);
}
disconnectedCallback() {
    window.removeEventListener('resize', this._handleResize);
    super.disconnectedCallback();
}
```

有关 `connectedCallback` 和 `disconnectedCallback` 的更多信息, 请参阅有关使用自定义元素[生命周期回调](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements#Using_the_lifecycle_callbacks)的MDN文档

### 针对性能优化

添加事件监听器的速度非常快, 通常不是性能问题. 但是, 对于高频使用且需要大量事件监听器的组件, 可以通过减少通过事件委托使用的监听器数量并在呈现后异步添加监听器来优化首次渲染性能.

#### 事件委托

使用事件委托可以减少使用的事件侦听器的数量, 从而提高性能. 有时集中事件处理以减少代码也很方便. 事件委托只能用于处理 `冒泡事件` . 有关冒泡的详细信息, 请参阅调度事件.

可以在DOM中的任何祖先元素上听到气泡事件. 您可以通过在祖先组件上添加一个事件侦听器来利用这一点, 以便在DOM中通知其任何后代发出的冒泡事件. 使用事件的 `目标` 属性根据调度事件的元素执行特定操作

[示例](https://lit.dev/playground/#sample=docs/components/events/delegate)

#### 异步添加事件监听

要在渲染后添加事件侦听器, 请使用 `firstUpdated` 方法. 这是一个Lit生命周期回调, 在组件首次更新并呈现其模板化DOM后运行.

`firstUpdated` 回调在组件第一次更新并调用其 `render` 方法之后, 但在浏览器有机会绘制**之前**激发.

有关更多信息, 请参阅Lifecycle文档中的[firstUpdated](/docs/components/lifecycle/#firstupdated).

为了确保在用户看到组件后添加侦听器, 可以等待浏览器绘制后解析的Promise.

```js
async firstUpdated() {
    // Give the browser a chance to paint
    await new Promise((r) => setTimeout(r, 0));
    this.addEventListener('click', this._handleClick);
}
```

### 了解this事件监听

使用模板中的声明性 `@` 语法添加的事件侦听器将自动绑定到组件.
因此, 您可以使用 `this` 来引用任何声明性事件处理程序中的组件实例:

```js
class MyElement extends LitElement {
    render() {
        return html`<button @click="${this._handleClick}">click</button>`;
    }
    _handleClick(e) {
        console.log(this.prop);
    }
}
```

当使用 `addEventListener` 强制添加侦听器时, 您需要使用箭头函数, 以便 `this` 引用组件:

```js
export class MyElement extends LitElement {
    private _handleResize = () => {
        // `this` refers to the component
        console.log(this.isConnected);
    }
    constructor() {
        window.addEventListener('resize', this._handleResize);
    }
}
```

参阅[MDN上的文档](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this)

### 监听从重复模板触发的事件

在侦听重复项上的事件时, 如果事件冒泡, 使用事件委托通常很方便. 当事件没有冒泡时, 可以在重复的元素上添加一个侦听器

[示例](https://lit.dev/playground/#sample=docs/components/events/list)

## 调度事件

所有DOM节点都可以使用 `dispatchEvent` 方法分派事件. 首先, 创建一个事件实例, 指定事件类型和选项. 然后将其传递给 `dispatchEvent` , 如下所示

```js
const event = new Event("my-event", {
    bubbles: true,
    composed: true
});
myElement.dispatchEvent(event);
```

`bubbles` 选项允许事件沿着DOM树流向调度元素的祖先. 如果您希望活动能够参与活动委托, 设置此标志很重要.

`composed` 选项可用于设置以允许将事件调度到元素所在的shadow DOM tree上方

参阅 MDN 上的
[EventTarget.dispatchEvent()](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/dispatchEvent)
以获取调度事件的完整描述

### 何时调度事件

应响应用户交互或组件状态的异步更改来分派事件. 通常不应响应组件所有者通过其属性或属性API所做的状态更改来分派它们. 这通常是本机web平台元素的工作方式.

例如, 当用户在 `input` 元素中键入值时, 将发送 `change` 事件, 但如果代码设置了 `input` 的 `value` 属性, 则不会发送 `change` 事件.

类似地, 当用户选择菜单项时, 菜单组件应发送事件, 但如果设置了菜单的 `selectedItem` 属性, 则不应发送事
. 这通常意味着组件应该响应它正在侦听的另一个事件来分派事件.

[示例](https://lit.dev/playground/#sample=docs/components/events/dispatch)

### 元素更新后调度事件

通常, 只有在元素更新和呈现之后才会触发事件. 如果事件旨在基于用户交互传达呈现状态的更改, 则这可能是必要的. 在这种情况下, 组件的 `updateCompletePromise` 可以在更改状态后等待, 但要在分派事件之前等待.

[示例](https://lit.dev/playground/#sample=docs/components/events/update)

### 使用标准或自定义事件

可以通过构造 `Event` 或 `CustomEvent` 来分派事件. 这两种方法都是合理的. 使用 `CustomEvent` 时, 任何事件数据都会传递到事件的 `detail` 属性中. 使用 `Event` 时, 可以创建一个事件子类, 并将自定义API附加到它.

参阅MDN上的[事件](https://developer.mozilla.org/en-US/docs/Web/API/Event/Event).

#### 触发自定义事件

```js
const event = new CustomEvent("my-event", {
    detail: {
        message: "Something important happened",
    },
});
this.dispatchEvent(event);
```

[有关自定义事件的MDN文档](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent)

#### 触发标准事件

```js
class MyEvent extends Event {
    constructor(message) {
        super();
        this.type = "my-event";
        this.message = message;
    }
}
const event = new MyEvent("Something important happened");
this.dispatchEvent(event);
```

## 在shadow DOM中处理事件

使用Shadow DOM 时, 对标准事件系统进行一些修改非常重要. 影子 DOM 的存在主要是为了在
DOM 中提供一个范围机制, 该机制封装了有关这些“影子”元素的详细信息. 因此, 影子 DOM
中的事件封装了来自外部 DOM 元素的某些细节

### 了解组合事件调度

默认情况下, 在卷影根目录内部分派的事件在该卷影根之外将不可见. 要使事件通过阴影DOM边界, 必须将 `composited` 属性设置为 `true` . 常见的做法是使用 `冒泡组合` , 以便DOM树中的所有节点都可以看到事件:

```js
_dispatchMyEvent() {
    let myEvent = new CustomEvent('my-event', {
        detail: {
            message: 'my-event happened.'
        },
        bubbles: true,
        composed: true
    });
    this.dispatchEvent(myEvent);
}
```

如果一个事件是合成的并且发生了气泡, 那么它可以被发送该事件的元素的所有祖先接收, 包括外部阴影根中的祖先. 如果一个事件是合成的, 但没有冒泡, 那么它只能在分派事件的元素和包含shadow
root的主机元素上接收.

注意, 大多数标准用户界面事件, 包括所有鼠标、触摸和键盘事件, 都是冒泡和合成的. 参阅[有关组合事件的MDN文档](https://developer.mozilla.org/en-US/docs/Web/API/Event/composed).

### 了解事件重定向

从shadow root中分派的合成事件被重定目标, 这意味着对于托管shadow
root的元素或其任何祖先的任何侦听器来说, 它们似乎来自托管元素. 由于Lit组件呈现为shadow
root, 因此从Lit组件内部发出的所有合成事件似乎都由Lit组件本身发出. 事件的 `目标` 属性是Lit组件.

```html
<my-element onClick="(e) => console.log(e.target)"></my-element>
```

```js
render() {
    return html`
    <button id="mybutton" @click="${(e) => console.log(e.target)}">
      click me
    </button>`;
}
```

在需要确定事件起源的高级情况下, 请使用 `event.composedPath()` API. 此方法返回事件分派所遍历的所有节点的数组, 包括影子根中的节点. 因为这破坏了封装, 所以应该小心避免依赖可能暴露的实现细节. 常见的用例包括确定单击的元素是否是锚标记, 以便于客户端路由.

```js
handleMyEvent(event) {
    console.log('Origin: ', event.composedPath()[0]);
}
```

[MDN上的composedPath文档](https://developer.mozilla.org/en-US/docs/Web/API/Event/composedPath)

## 事件调度程序和侦听器之间的通信

事件主要用于将更改从事件调度程序传达给事件侦听器, 但事件也可用于将信息从侦听器传递回调度程序.

执行此操作的一种方法是在事件上公开 API, 侦听器可以使用这些 API
来自定义组件行为. 例如, 侦听器可以在自定义事件的详细信息属性上设置一个属性, 然后调度组件使用该属性来自定义行为.

分派器和侦听器之间的另一种通信方式是通过 `preventDefault()` 方法. 可以调用它来指示事件的标准操作不应发生. 当监听器调用 `preventDefault()` 时, 事件的 `defaultPrevented` 属性变为 `true` . 然后, 侦听器可以使用此标志自定义行为.

[示例, 使用了这两种技术](https://lit.dev/playground/#sample=docs/components/events/comm)
