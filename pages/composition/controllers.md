# 控制器

Lit 2 为代码重用和组合引入了一个新概念,称为_reactive controllers_.

反应式控制器是可以挂钩到组件的[反应式更新周期](/docs/components/lifecycle/#反应式生命周期)的对象.控制器可以捆绑与功能相关的状态和行为,使其可在多个组件定义中重用

您可以使用控制器实现需要其自身状态和访问组件生命周期的功能,例如：

- 处理鼠标事件等全局事件
- 管理异步task,例如通过网络获取数据
- 运行动画

反应式控制器允许您通过组合本身不是组件的较小部分来构建组件.它们可以被视为可重用的部分组件定义,具有自己的标识和状态

[示例](https://lit.dev/playground/#sample=docs/controllers/overview)

反应式控制器在许多方面与类混合相似.主要区别在于它们有自己的标识,并且不会添加到组件的原型中,这有助于包含其
API,并允许您为每个host组件使用多个控制器实例.有关更多详细信息,请参阅[控制器和mixins](/docs/composition/overview/#控制器和mixins).

## 使用控制器

每个控制器都有自己的创建API,但通常您将创建一个实例并将其与组件一起存储

```ts
class MyElement extends LitElement {
  private clock = new ClockController(this, 1000);
}
```

与控制器实例关联的组件称为host组件.

控制器实例注册自己以接收来自host组件的生命周期回调,并在控制器有新数据要呈现时触发host更新.这是`ClockController`示例定期呈现当前时间的方式.

控制器通常会公开一些要在host的`render（)`方法中使用的功能.例如,许多控制器将具有某些状态,如电流值：

```ts
render() {
  return html`
    <div>Current time: ${this.clock.value}</div>
  `;
}
```

由于每个控制器都有自己的API,请参阅特定的控制器文档以了解如何使用它们.

## 编写控制器

反应式控制器是与host组件关联的对象,它实现一个或多个host生命周期回调或与其host交互.它可以通过多种方式实现,但我们将重点关注使用JavaScript类,以及用于初始化的构造函数和用于生命周期的方法.

### 控制器初始化

控制器通过调用`host.addController（this)`向其host组件注册自己.通常,控制器存储对其host组件的引用,以便以后可以与其交互.

```ts
class ClockController implements ReactiveController {
  private host: ReactiveControllerHost;

  constructor(host: ReactiveControllerHost) {
    // Store a reference to the host
    this.host = host;
    // Register for lifecycle updates
    host.addController(this);
  }
}
```

```js
class ClockController {
  constructor(host) {
    // Store a reference to the host
    this.host = host;
    // Register for lifecycle updates
    host.addController(this);
  }
}
```

您可以为一次性配置添加其他构造函数参数.

```ts
class ClockController implements ReactiveController {
  private host: ReactiveControllerHost;
  timeout: number

  constructor(host: ReactiveControllerHost, timeout: number) {
    this.host = host;
    this.timeout = timeout;
    host.addController(this);
  }
```

```js
class ClockController {
  constructor(host, timeout) {
    this.host = host;
    this.timeout = timeout;
    host.addController(this);
  }
```

一旦控制器向host组件注册,就可以向控制器添加生命周期回调和其他类字段和方法,以实现所需的状态和行为.

### 生命周期

[ReactiveController](https://lit.dev/docs/api/controllers#ReactiveController)接口中定义的反应式控制器生命周期是反应式更新周期的一个子集.LitElement在其生命周期回调期间调用任何已安装的控制器.这些回调是可选的.

- `hostConnected（)`：
  - 在host连接时调用.
  - 在创建`renderRoot`后调用,因此此时将存在阴影根.
  - 用于设置事件侦听器、观察员等.
- `hostUpdate（)`：
  - 在host的`update（)`和`render（)`方法之前调用.
  - 用于在更新DOM之前阅读DOM（例如,用于动画).
- `hostUpdated（)`：
  - 在更新之后,在host的`updated（)`方法之前调用.
  - 用于在修改DOM后读取DOM（例如,用于动画).
- `hostDisconnected（)`：
  - 在host断开连接时调用.
  - 用于清理`hostConnected（)`中添加的内容,如事件侦听器和观察者.

参阅[反应更新周期](/docs/components/lifecycle/#反应式更新周期)

## 控制器host接口

反应式控制器host实现了一个用于添加控制器和请求更新的小型API,并负责调用其控制器的生命周期方法.
这是控制器host上公开的最小API：

- `addController(controller: ReactiveController)`
- `removeController(controller: ReactiveController)`
- `requestUpdate()`
- `updateComplete: Promise<boolean>`

您还可以创建特定于`HTMLElement`、`ReactiveElement`和`LitElement`的控制器,并需要更多这些API；或者甚至是绑定到特定元素类或其他接口的控制器.
`LitElement和ReactiveElement是控制器host,但host也可以是其他对象,如其他web组件库中的基类、框架中的组件或其他控制器.

### 构建来自其他控制器的控制器

控制器也可以由其他控制器组成.为此,创建子控制器并将host转发给它.

```ts
class DualClockController implements ReactiveController {
  private clock1: ClockController;
  private clock2: ClockController;

  constructor(host: ReactiveControllerHost, delay1: number, delay2: number) {
    this.clock1 = new ClockController(host, delay1);
    this.clock2 = new ClockController(host, delay2);
  }

  get time1() {
    return this.clock1.value;
  }
  get time2() {
    return this.clock2.value;
  }
}
```

```js
class DualClockController {
  constructor(host, delay1, delay2) {
    this.clock1 = new ClockController(host, delay1);
    this.clock2 = new ClockController(host, delay2);
  }

  get time1() {
    return this.clock1.value;
  }
  get time2() {
    return this.clock2.value;
  }
}
```

## 控制器和指令

将控制器与指令相结合是一种非常强大的技术,尤其是对于需要在渲染之前或之后执行工作的指令,如动画指令；或需要引用模板中特定元素的控制器.
使用带有指令的控制器有两种主要模式：

- 控制器指令 这些指令本身是控制器,以便钩住host生命周期.
- 拥有指令的控制器 这些控制器创建一个或多个用于使用host模板的指令.

有关编写指令,参阅[自定义指令](/docs/templates/custom-directives/)

### 控制器指令

反应式控制器不需要作为实例字段存储在host上.添加到host的任何内容都是`.addController()`控制器.特别是,指令也可以是控制器.这使指令能够挂钩到host生命周期

### 拥有指令的控制器

指令不需要是独立的函数,它们也可以是其他对象（如控制器)上的方法.这在控制器需要对模板中的元素的特定引用的情况下非常有用.

例如,假设有一个 ResizeController 允许您使用 ResizeObserver
观察元素的大小.要工作,我们需要一个 ResizeController
实例,以及一个放置在我们想要观察的元素上的指令

```ts
class MyElement extends LitElement {
  private _textSize = new ResizeController(this);

  render() {
    return html`
      <textarea ${this._textSize.observe()}></textarea>
      <p>The width is ${this._textSize.contentRect?.width}</p>
    `;
  }
}
```

```js
class MyElement extends LitElement {
  _textSize = new ResizeController(this);

  render() {
    return html`
      <textarea ${this._textSize.observe()}></textarea>
      <p>The width is ${this._textSize.contentRect?.width}</p>
    `;
  }
}
```

要实现这一点,请创建一个指令并从方法调用它

```ts
class ResizeDirective {
  /* ... */
}
const resizeDirective = directive(ResizeDirective);

export class ResizeController {
  /* ... */
  observe() {
    // Pass a reference to the controller so the directive can
    // notify the controller on size changes.
    return resizeDirective(this);
  }
}
```

## 使用案例

无功控制器非常通用,并且有一组非常广泛的可能用例.它们特别适合将组件连接到外部资源,如用户输入、状态管理或远程API.下面是一些常见的用例.

### 外部输入

无功控制器可用于连接到外部输入.例如,键盘和鼠标事件、调整观察者大小或变异观察者.控制器可以提供用于渲染的输入的当前值,并在值更改时请求host更新.

示例：鼠标移动控制器

此示例显示控制器如何在其host连接和断开连接时执行设置和清理工作,并在输入更改时请求更新

[示例](https://lit.dev/playground/#sample=docs/controllers/mouse)

### 异步Task

异步task（如长时间运行的计算或网络I/O)通常具有随时间变化的状态,并且需要在task状态发生变化（完成、错误等)时通知host.

控制器是捆绑task执行和状态的好方法,使其易于在组件内部使用.作为控制器编写的task通常具有host可以设置的输入和host可以呈现的输出.

`@lit labs/task`包含一个通用的`Task`控制器,它可以从host提取输入、执行task功能,并根据task状态呈现不同的模板.

您可以使用`Task`创建自定义控制器,该控制器具有为特定task定制的API.在这里,我们将`Task`包装在`名称控制器`中,它可以从演示REST
API中获取指定的名称列表之一.
`NameController`公开一个`kind`属性作为输入,以及一个`render（)`方法,该方法可以根据task状态呈现四个模板之一.task逻辑以及它如何更新host,都是从host组件中抽象出来的.

[示例](https://lit.dev/playground/#sample=docs/controllers/names)
