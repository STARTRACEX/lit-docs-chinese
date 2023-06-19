# 自定义指令

指令是可以通过自定义模板表达式的呈现方式来扩展Lit的函数. 指令非常有用和强大, 因为它们可以是有状态的, 可以访问DOM, 可以在模板断开连接和重新连接时得到通知, 还可以在渲染调用之外独立更新表达式.
在模板中使用指令与调用模板表达式中的函数一样简单:

```js
html`<div>
       ${fancyDirective("some text")}
     </div>`;
```

Lit 带有许多[内置指令](/docs/templates/directives/) 像
[ `repeat()` ](/docs/templates/directives/#repeat) 和
[ `cache()` ](/docs/templates/directives/#cache). 用户还可以编写自己的自定义指令.

有两类指令:

* 简单的函数
* 基于类的指令

一个简单的函数返回一个要渲染的值. 它可以接受任意数量的参数, 也可以不接受任何参数

```js
export noVowels = (str) => str.replaceAll(/[aeiou]/ig, 'x');
```

基于类的指令允许您执行简单函数无法执行的操作. 使用基于类的指令：

* 直接访问渲染的DOM(例如, 添加、删除或重新排序渲染的DOM节点).
* 渲染之间保持状态.
* 在呈现调用之外异步更新DOM.
* 当指令与DOM断开连接时清理资源

本页的其余部分描述基于类的指令.

## 创建基于类的指令

创建基于类的指令:

* 将指令实现为扩展`directive`类的类.
* 将类传递给`directive()`, 以创建可在Lit模板表达式中使用的指令函数.

```js
import {
    Directive,
    directive
} from "lit/directive.js";

// Define directive
class HelloDirective extends Directive {
    render() {
        return `Hello!`;
    }
}
// Create the directive function
const hello = directive(HelloDirective);

// Use directive
const template = html`<div>${hello()}</div>`;
```

评估此模板时, 指令_function_( `hello()` )返回一个 `DirectiveResult` 对象, 该对象指示Lit创建或更新指令_class_( `HelloDirective` )的实例. Lit然后调用指令实例上的方法来运行其更新逻辑.

有些指令需要在正常更新周期之外异步更新DOM. 要创建_异步指令_, 请扩展 `AsyncDirective` 基类, 而不是 `directive` . 参阅
[异步指令](#异步指令).

## 基于类的指令的生命周期

指令类具有一些内置的生命周期方法:

* 类构造函数, 用于一次性初始化.
* `render()`, 用于声明性呈现.
* `update()`, 用于命令式 DOM 访问.

必须为所有指令实现 `render()` 回调. 实现 `update()` 是可选的. `update()` 的默认实现调用并返回 `render()` 中的值.

异步指令可以在正常更新周期之外更新DOM, 它使用一些附加的生命周期回调. 参阅
[异步指令](#异步指令)

### 一次性设置: constructor()

当Lit第一次在表达式中遇到 `DirectiveResult` 时, 它将构造相应指令类的实例(导致指令的构造函数和任何类字段初始化器运行)：

```ts
class MyDirective extends Directive {
  // Class fields will be initialized once and can be used to persist
  // state between renders
  value = 0;
  // Constructor is only run the first time a given directive is used
  // in an expression
  constructor(partInfo: PartInfo) {
    super(partInfo);
    console.log('MyDirective created');
  }
  ...
}
```

```js
class MyDirective extends Directive {
    // Class fields will be initialized once and can be used to persist
    // state between renders
    value = 0;
    // Constructor is only run the first time a given directive is used
    // in an expression
    constructor(partInfo) {
            super(partInfo);
            console.log('MyDirective created');
        }
        ...
}
```

只要在每个渲染的同一表达式中使用相同的指令函数, 就会重用前一个实例, 因此实例的状态在渲染之间保持不变.

构造函数接收一个 `PartInfo` 对象, 该对象提供了有关在其中使用指令的表达式的元数据. 在指令设计为仅在特定类型的表达式中使用的情况下, 这对于提供错误检查非常有用(参阅
[将指令限制为一种表达式类型](#将指令限制为一种表达式类型)).

### Declarative rendering: render()

`render()` 方法应返回要渲染到DOM中的值. 它可以返回任何可渲染的值, 包括另一个 `DirectiveResult` .
除了引用指令实例上的状态, `render()` 方法还可以接受传入指令函数的任意参数：

```js
const template = html`<div>${myDirective(name, rank)}</div>`;
```

为 `render()` 方法定义的参数决定指令函数的签名：

```ts
class MaxDirective extends Directive {
  maxValue = Number.MIN * VALUE;
  // Define a render method, which may accept arguments:
  render(value: number, minValue = Number.MIN * VALUE) {
    this.maxValue = Math.max(value, this.maxValue, minValue);
    return this.maxValue;
  }
}
const max = directive(MaxDirective);

// Call the directive with `value` and `minValue` arguments defined for `render()`:
const template = html`<div>${max(someNumber, 0)}</div>`;
```

```js
class MaxDirective extends Directive {
    maxValue = Number.MIN * VALUE;
    // Define a render method, which may accept arguments:
    render(value, minValue = Number.MIN * VALUE) {
        this.maxValue = Math.max(value, this.maxValue, minValue);
        return this.maxValue;
    }
}
const max = directive(MaxDirective);

// Call the directive with `value` and `minValue` arguments defined for `render()`:
const template = html`<div>${max(someNumber, 0)}</div>`;
```

### 强制DOM访问: update()

在更高级的用例中, 您的指令可能需要访问底层DOM并强制读取或变异它. 您可以通过重写 `update()` 回调来实现这一点.
`update()` 回调函数接收两个参数：
-带有API的 `Part` 对象, 用于直接管理与表达式关联的DOM. -包含 `render()` 参数的数组.

`update()` 方法应该返回Lit可以渲染的内容, 如果不需要重新渲染, 则返回特殊值 `noChange` . `update()` 回调非常灵活, 但典型的用法包括：

* 从DOM读取数据, 并使用它生成要渲染的值.
* 使用`Part`对象上的`element`或`parentNode`引用强制更新DOM. 在这种情况下, `update()`通常返回`noChange`, 表示Lit不需要采取任何进一步的操作来呈现指令.

#### Parts

E每个表达式位置都有其自己的特定 `Part` 对象:

* `ChildPart` HTML 子位置中的表达式.
* `"AttributePart` 对应HTML 属性值位置中的表达式.
* `"BooleanAttributePart` 对应布尔属性值 (名称前缀为 `?`).
* `"EventPart` 对应事件侦听器位置 (名称前缀为 `@`).
* `"PropertyPart`对应属性值位置 (名称前缀为 `.`).
* `"ElementPart` 对应元素标记上的表达式.

除了 `PartInfo` 中包含的特定于部件的元数据之外, 所有 `part` 类型都提供对与表达式关联的DOM `元素` 的访问(在 `ChildPart` 的情况下为 `parentNode` ), 可以在 `update()` 中直接访问. 例如：

```ts
// Renders attribute names of parent element to textContent
class AttributeLogger extends Directive {
  attributeNames = "";
  update(part: ChildPart) {
    this.attributeNames = (part.parentNode as Element).getAttributeNames?.()
      .join(" ");
    return this.render();
  }
  render() {
    return this.attributeNames;
  }
}
const attributeLogger = directive(AttributeLogger);

const template = html`<div a b>${attributeLogger()}</div>`;
// Renders: `<div a b>a b</div>`
```

```js
// Renders attribute names of parent element to textContent
class AttributeLogger extends Directive {
    attributeNames = "";
    update(part) {
        this.attributeNames = part.parentNode.getAttributeNames?.().join(" ");
        return this.render();
    }
    render() {
        return this.attributeNames;
    }
}
const attributeLogger = directive(AttributeLogger);

const template = html`<div a b>${attributeLogger()}</div>`;
// Renders: `<div a b>a b</div>`
```

此外, `directive helpers.js` 模块包括许多助手函数, 这些函数作用于 `Part` 对象, 可用于在指令的 `ChildPart` 中动态创建、插入和移动部件.

#### 从 update() 调用 render()

`update()` 的默认实现只是调用并返回 `render()` 中的值. 如果覆盖 `update()` , 但仍要调用 `render()` 来生成值, 则需要显式调用 `render()` .
`render()` 参数作为数组传递到 `update()` 中. 可以像这样将参数传递给 `render()` ：

```ts
class MyDirective extends Directive {
  update(part: Part, [fish, bananas]: DirectiveParameters<this>) {
    // ...
    return this.render(fish, bananas);
  }
  render(fish: number, bananas: number) { ... }
}
```

```js
class MyDirective extends Directive {
    update(part, [fish, bananas]) {
        // ...
        return this.render(fish, bananas);
    }
    render(fish, bananas) {
        ...
    }
}
```

### update() 和 render() 的不同

虽然 `update()` 回调比 `render()` 调用更强大, 但有一个重要的区别：当使用 `@lit labs/ssr` 包进行服务器端渲染(ssr)时, *仅*在服务器上调用 `render)` 方法. 为了与SSR兼容, 指令应该从 `render()` 返回值, 并且只对需要访问DOM的逻辑使用 `update()` .

## 无变化信号

有时, 指令可能没有什么新的内容可供Lit呈现. 您可以通过从 `update()` 或 `render()` 方法返回 `noChange` 来表示这一点. 这与返回 `undefined` 不同, 后者会导致Lit清除与指令关联的 `Part` . 返回 `noChange` 将保留先前呈现的值.

返回 `noChange有几个常见原因` :

* 根据输入值, 没有什么新的内容可以渲染.
* `update()`方法强制更新了DOM.
* 在异步指令中, 对`update()`或`render()`的调用可能会返回`noChange`, 因为*还没有*要渲染的内容.

例如, 指令可以跟踪传递给它的先前值, 并执行自己的脏检查以确定是否需要更新指令的输出. `update()` 或 `render()` 方法可以返回 `noChange` , 表示不需要重新呈现指令的输出.

```ts
import { Directive } from "lit/directive.js";
import { noChange } from "lit";
class CalculateDiff extends Directive {
  a?: string;
  b?: string;
  render(a: string, b: string) {
    if (this.a !== a || this.b !== b) {
      this.a = a;
      this.b = b;
      // Expensive & fancy text diffing algorithm
      return calculateDiff(a, b);
    }
    return noChange;
  }
}
```

```js
import {
    Directive
} from "lit/directive.js";
import {
    noChange
} from "lit";
class CalculateDiff extends Directive {
    render(a, b) {
        if (this.a !== a || this.b !== b) {
            this.a = a;
            this.b = b;
            // Expensive & fancy text diffing algorithm
            return calculateDiff(a, b);
        }
        return noChange;
    }
}
```

## 将指令限制为一种表达式类型

某些指令仅在一个上下文中有用, 例如属性表达式或子表达式. 如果放在错误的上下文中, 指令应该抛出适当的错误

例如, `classMap` 指令验证它是否仅在 `AttributePart` 中使用, 并且仅用于 `class` 属性:

```ts
class ClassMap extends Directive {
  constructor(partInfo: PartInfo) {
    super(partInfo);
    if (
      partInfo.type !== PartType.ATTRIBUTE ||
      partInfo.name !== 'class'
    ) {
      throw new Error('The `classMap` directive must be used in the `class` attribute');
    }
  }
  ...
}
```

```js
class ClassMap extends Directive {
    constructor(partInfo) {
            super(partInfo);
            if (
                partInfo.type !== PartType.ATTRIBUTE ||
                partInfo.name !== 'class'
            ) {
                throw new Error('The `classMap` directive must be used in the `class` attribute');
            }
        }
        ...
}
```

## 异步指令

前面的示例指令是同步的：它们从其 `render()` / `update()` 生命周期回调中同步返回值, 因此它们的结果在组件的 `update()` 回调期间写入DOM.

有时, 您希望指令能够异步更新DOM, 例如, 如果它依赖于网络请求等异步事件.

要异步更新指令的结果, 指令需要扩展｛%api `AsyncDirective` %｝基类, 该基类提供了一个 `setValue()` api `setValue()` 允许指令在模板的正常 `更新` / `渲染` 周期之外将新值 `推入` 到其模板表达式中.

下面是一个简单的异步指令的示例, 该指令呈现Promise值：

```ts
class ResolvePromise extends AsyncDirective {
  render(promise: Promise<unknown>) {
    Promise.resolve(promise).then((resolvedValue) => {
      // Rendered asynchronously:
      this.setValue(resolvedValue);
    });
    // Rendered synchronously:
    return `Waiting for promise to resolve`;
  }
}
export const resolvePromise = directive(ResolvePromise);
```

```js
class ResolvePromise extends AsyncDirective {
    render(promise) {
        Promise.resolve(promise).then((resolvedValue) => {
            // Rendered asynchronously:
            this.setValue(resolvedValue);
        });
        // Rendered synchronously:
        return `Waiting for promise to resolve`;
    }
}
export const resolvePromise = directive(ResolvePromise);
```

这里, 呈现的模板显示 `Waiting for promise to resolve` , 然后是promise的已解析值(每当它解析时).

异步指令通常需要订阅外部资源. 为了防止内存泄漏, 异步指令应在指令实例不再使用时取消订阅或释放资源. 为此, `AsyncDirective` 提供了以下额外的生命周期回调和API:

* `disconnected()`: 当指令不再使用时调用. 指令实例在三种情况下断开连接:
  + 当包含指令的DOM树从DOM中移除时
  + 当指令的主机元素断开连接时
  + 当生成指令的表达式不再解析为同一指令时

  在指令接收到 `断开连接` 回调后, 它应该释放在 `更新` 或 `呈现` 期间订阅的所有资源, 以防止内存泄漏.

* `reconnected()`:
  当以前断开连接的指令返回使用时调用. 因为DOM子树可以暂时断开连接, 然后稍后再重新连接, 所以断开连接的指令可能需要对重新连接做出反应. 例如, 当DOM被删除并缓存以供以后使用时, 或者当主机元素被移动导致断开连接和重新连接时. `reconnected()` 回调应始终与 `disconnected()` 一起实现, 以便将断开连接的指令恢复到其工作状态.

* `isConnected`: 反映指令的当前连接状态.

:::info

请注意, 如果 `AsyncDirective` 的包含树被重新呈现, 则它可以在断开连接时继续接收更新. 因此, 在订阅任何长期保留的资源之前, `update` 和/或 `render` 应始终检查 `this.isConnected` 标志, 以防止内存泄漏.

:::

以下是订阅 `Observable` 并适当处理断开和重新连接的指令示例：

```ts
class ObserveDirective extends AsyncDirective {
  observable: Observable<unknown> | undefined;
  unsubscribe: (() => void) | undefined;
  // When the observable changes, unsubscribe to the old one and
  // subscribe to the new one
  render(observable: Observable<unknown>) {
    if (this.observable !== observable) {
      this.unsubscribe?.();
      this.observable = observable;
      if (this.isConnected) {
        this.subscribe(observable);
      }
    }
    return noChange;
  }
  // Subscribes to the observable, calling the directive's asynchronous
  // setValue API each time the value changes
  subscribe(observable: Observable<unknown>) {
    this.unsubscribe = observable.subscribe((v: unknown) => {
      this.setValue(v);
    });
  }
  // When the directive is disconnected from the DOM, unsubscribe to ensure
  // the directive instance can be garbage collected
  disconnected() {
    this.unsubscribe!();
  }
  // If the subtree the directive is in was disconnected and subsequently
  // re-connected, re-subscribe to make the directive operable again
  reconnected() {
    this.subscribe(this.observable!);
  }
}
export const observe = directive(ObserveDirective);
```

```js
class ObserveDirective extends AsyncDirective {
    // When the observable changes, unsubscribe to the old one and
    // subscribe to the new one
    render(observable) {
        if (this.observable !== observable) {
            this.unsubscribe?.();
            this.observable = observable;
            if (this.isConnected) {
                this.subscribe(observable);
            }
        }
        return noChange;
    }
    // Subscribes to the observable, calling the directive's asynchronous
    // setValue API each time the value changes
    subscribe(observable) {
        this.unsubscribe = observable.subscribe((v) => {
            this.setValue(v);
        });
    }
    // When the directive is disconnected from the DOM, unsubscribe to ensure
    // the directive instance can be garbage collected
    disconnected() {
        this.unsubscribe();
    }
    // If the subtree the directive is in was disconneted and subsequently
    // re-connected, re-subscribe to make the directive operable again
    reconnected() {
        this.subscribe(this.observable);
    }
}
export const observe = directive(ObserveDirective);
```
