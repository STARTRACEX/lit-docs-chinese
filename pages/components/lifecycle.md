# 生命周期

lit组件使用标准的自定义元素生命周期方法.此外,lit 引入了一个反应式更新周期,当反应式属性发生变化时,它会呈现对 DOM 的更改

## 标准自定义元素生命周期

Lit组件是标准的自定义元素,并继承自定义元素生命周期方法.

>- `connectedCallback()`:当 custom element 首次被插入文档 DOM 时,被调用.
>- `disconnectedCallback()`:当 custom element 从文档 DOM 中删除时,被调用.
>- `adoptedCallback()`:当 custom element 被移动到新的文档时,被调用.
>- `attributeChangedCallback()`:当 custom element 增加、删除、修改自身属性时,被调用.
>
>[MDN使用生命周期回调](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements#using_the_lifecycle_callbacks)

如果您需要自定义任何标准的自定义元素生命周期方法,请确保调用超级实现(如`super.connectedCallback()`),以保持标准的Lit功能.

### constructor()

创建元素,升级现有元素时调用,在自定义元素的定义在元素已经在DOM中之后加载时发生

Lit行为

使用`requestUpdate()`方法请求异步更新,因此当Lit组件升级时,它会立即执行更新.

保存元素上已设置的所有属性.这可确保维护升级前设置的值,并正确覆盖组件设置的默认值.

使用案例

执行必须在第一次更新之前完成的一次性初始化任务.

示例

不使用修饰器时,设置属性的默认值

```js
constructor() {
  super();
  this.foo = 'foo';
  this.bar = 'bar';
}
```

### connectedCallback()

Lit行为

Lit在元素连接后启动第一个元素更新周期.在准备渲染时,Lit还确保创建renderRoot(shadow root)

一旦元素至少连接到文档一次,无论元素的连接状态如何,组件更新都将继续.

使用案例

设置仅在元素连接到文档时应执行的任务

示例

删除窗口上的事件侦听器以防止内存泄漏

```js
connectedCallback() {
  super.connectedCallback()
  addEventListener('keydown', this._handleKeydown);
}
```

### disconnectedCallback()

Lit行为

暂停反应式更新周期.当元素连接时,它将恢复

使用案例

应确保没有任何内容保存对元素的引用

示例

删除元素外部节点的事件侦听器,如添加到窗口的 keydown 事件处理程序

```js
disconnectedCallback() {
  super.disconnectedCallback()
  window.removeEventListener('keydown', this._handleKeydown);
}
```

无需删除内部事件侦听器

### attributeChangedCallback()

Lit行为

Lit使用此回调将属性更改同步到反应性属性.

当一个属性被设立时,相应的属性也被设立,Lit还自动设置元素的observedAttributes数组,以匹配组件的反应属性列表.

使用案例

很少需要实现此回调

### adoptedCallback()

在将组件移动到新文档时调用

采用的`Callback`不是`polyfilled`

Lit行为

无

使用案例

当元素行为在更改文档时应更改时,此回调应仅用于高级用例

## 反应式更新周期

除了标准的自定义元素生命周期外,点亮组件还实现了反应式更新周期.

当反应性属性更改或显式调用`requestUpdate()`方法时,会触发反应性更新周期.Lit异步执行更新,因此属性更改是批处理的-如果在请求更新之后但在更新开始之前有更多属性更改,则所有更改都将在同一更新中捕获.

更新发生在微任务计时,这意味着它们发生在浏览器将下一帧绘制到屏幕上之前.请参阅 [Jake Archibald 关于微任务的文章](https://jakearchibald.com/2015/tasks-microtasks-queues-and-schedules/),了解有关浏览器计时的更多信息.

在高级别上,反应式更新周期为:

1. 当一个或多个属性更改或调用时,将计划更新.requestUpdate()
2. 更新在绘制下一帧之前执行.
    1. 设置反射属性.
    2. 调用组件的呈现方法以更新其内部 DOM.
3. 更新已完成,承诺已解决.updateComplete

更详细地说,它看起来像这样:

更新前

![1](./update-1.jpg)
![2](./update-2.jpg)

更新

![3](./update-3.jpg)

更新后

![4](./update-4.jpg)

### changedProperties映射

许多反应式更新方法都会收到changedProperties的Map映射.Map键是属性名称,其值是以前的属性值
可以使用`this.properties`或`this[property]`查找当前属性值.

#### TypeScript 的changedProperties类型

`changedProperties`具有类型`PropertyValues<this>`,

```ts
import {LitElement, html, PropertyValues} from 'lit';
  shouldUpdate(changedProperties: PropertyValues<this>) {
  }
```
如果不太关心强类型(或者只检查属性名称,而不检查以前的值),则可以使用限制较少的类型,例如 `Map<string, any>`

请注意,`PropertyValues<this>`不识别受保护的或私有的属性

#### 在更新期间更改属性

在更新期间更改属性（包括`render()`方法）会更新changedProperties映射,但不会触发新的更新.在`render()`之后更改属性（例如,在`updated()`方法中）会触发一个新的更新周期,并且将更改的属性添加到新的`changedProperties`映射中,以用于下一个周期.

### 触发更新

当反应属性更改或调用`requestUpdate()`方法时,将触发更新.由于更新是异步执行的,因此在执行更新之前发生的任何和所有更改都只会导致**一次**更新.

#### hasChanged()

如果返回 ,则会安排更新

[hasChanged()](/docs/components/properties/#自定义更改检测)

#### requestUpdate()

调用`requestUpdate()`以计划显式更新.如果您需要在与属性无关的内容发生更改时更新和渲染元素.例如,计时器组件可能每秒调用`requestUpdate()`.

```js
connectedCallback() {
  super.connectedCallback();
  this._timerInterval = setInterval(() => this.requestUpdate(), 1000);}
disconnectedCallback() {
  super.disconnectedCallback();
  clearInterval(this._timerInterval);}
```

```js
this.requestUpdate('state', this._previousState);
```

### 执行更新

执行更新时,将调用`performUpdate()`方法.此方法调用许多其他生命周期方法.

在组件更新**时**通常会触发更新的任何更改**都不会安排新的更新**.这样做是为了在更新过程中计算属性值.在更新期间更改的属性反映在`changedProperties`映射中,因此后续的生命周期方法可以对更改进行操作.

#### shouldUpdate()

调用以确定是否需要更新周期

参数:`changedProperties`映射的键是已更改属性的名称,值是对应的先前值.
更新:此方法中的属性更改不会触发元素更新

如果`shouldUpdate()`返回true（默认情况下为`true`）,则更新正常进行.如果返回`false`,则不会调用更新周期的其余部分,但`updateCompletePromise`仍将被解析.

通过`shouldUpdate()`来指定哪些属性更改应该引起更新.使用`changedProperties`的映射来比较当前值和以前的值.

```js
shouldUpdate(changedProperties) {
  // 只更新prop1改变的元素.
  return changedProperties.has('prop1');}
```

```ts
shouldUpdate(changedProperties: Map<string, any>) {
  // 只更新prop1改变的元素.
  return changedProperties.has('prop1'); 
}
```

#### willUpdate()

在`update()`之前调用,以计算更新期间所需的值.

参数:`changedProperties`映射的键是已更改属性的名称,值是对应的先前值.
更新:此方法中的属性更改不会触发元素更新
在服务器上调用

```js
willUpdate(changedProperties) {
  // 只需要为高消耗的计算检查更改的属性.
  if (changedProperties.has('firstName') || changedProperties.has('lastName')) {
    this.sha = computeSHA(`${this.firstName} ${this.lastName}`);
  }
}
render() {
  return html`SHA: ${this.sha}`;
}
```

#### update()

调用以更新组件的DOM.

参数:`changedProperties`映射的键是已更改属性的名称,值是对应的先前值.
更新:此方法中的属性更改不会触发元素更新
CallSuper:需要,否则元素的属性和模板将不会更新

将属性值反映到属性,并调用`render()`更新组件的内部DOM.

通常,不需要实现此方法.

#### render()

由`update()`调用,并应实现为返回用于呈现组件的DOM的可呈现结果(如TemplateResult)

参数:无
更新:此方法中的属性更改不会触发元素更新
在服务器调用

该方法没有参数,但通常引用组件属性

### 完成更新

#### firstUpdated()

在组件的 DOM 第一次更新后调用,紧接在`updated()`被调用之前

参数:`changedProperties`映射的键是已更改属性的名称,值是对应的先前值.
更新:此方法中的属性更改会触发元素更新.

实现以在创建组件的 DOM 后执行一次性工作,包括聚焦特定的渲染元素或向元素添加 `ResizeObserver` 或 `IntersectionObserver`

```js
firstUpdated() {
  this.renderRoot.getElementById('my-text-area').focus();}
```

#### updated()

参数:`changedProperties`映射的键是已更改属性的名称,值是对应的先前值.
更新:此方法中的属性更改会触发元素更新.

实现`updated()`以执行更新后使用元素DOM的任务.例如,执行动画的代码可能需要测量元素DOM

```js
updated(changedProperties: Map<string, any>) {
  if (changedProperties.has('collapsed'))
    this._measureDOM();
}
```

#### updateComplete()

`updateComplete`Promise在元素完成更新时解析.使用`updateComplete`等待更新.解析值是一个布尔值,指示元素是否已完成更新.如果更新周期结束后没有挂起的更新,则为`true`.

可以在触发事件之前等待`updateComplete`Promise.

```js
async _loginClickHandler() {
  this.loggedIn = true;
  // 等待“loggedIn”状态呈现给DOM
  await this.updateComplete;
  this.dispatchEvent(new Event('login'));}
```

此外,在编写测试时,您可以在断言组件的 DOM 之前等待 `updateComplete`Promise.

如果在更新周期中出现未处理的错误,则Promise将被拒绝

### 处理错误

如果在生命周期方法(`render()`,`update()`)中存在未捕获的异常,则会导致`updateComplete`Promise被拒绝.如果生命周期方法中的代码可以引发异常,则最好将其放在 `try`/`catch` 语句中

```js
try {
  await this.updateComplete;
} catch (e) {
  /* 错误处理 */
}
```

在某些情况下,代码可能会在意想不到的地方抛出,添加`onunhandledrejection`来捕获这些问题

```js
window.onunhandledrejection = function(e) {
  /* handle error *
}
```

## 外部生命hook

除了实现生命周期回调的组件类之外,外部代码(如修饰器)可能需要连接到组件的生命周期中.
Lit为外部代码提供了两个与反应式更新生命周期集成的概念:静态`addInitializer()`和`addController()`

### 静态 addInitializer()

`addInitializer()`允许有权访问 Lit 类定义的代码在构造类的实例时运行代码

这在编写自定义修饰器时非常有用.修饰器在类定义时运行,可以执行诸如替换字段和方法定义之类的操作,如果他们在创建实例时还需要执行工作,则必须调用`addInitializer()`,通常用它来添加反应式控制器

```js
const myDecorator = (descriptor) => {
  // 描述
  finisher(ctor) {
    ctor.addInitializer((instance) => {
      // 这是在元素建造期间运行的
      new MyController(instance);
    });
  },
};
```

```ts
const myDecorator = (proto: ReactiveElement, key: string) => {
  const ctor = proto.constructor as typeof ReactiveElement;
  ctor.addInitializer((instance: ReactiveElement) => {
    // 这是在元素建造期间运行的
    new MyController(instance);
  });
};
```

然后,修饰字段将导致每个实例运行一个初始值设定项,该初始值设定值设定项将添加一个控制器

```js
class MyElement extends LitElement {
  @myDecorator foo;
}
```

初始值设定项按构造函数存储.将初始值设定项添加到子类不会将其添加到超类.由于初始值设定项在构造函数中运行,因此初始值设定项将按类层次结构的顺序运行,从超类开始,一直到实例的类

### addController()

`addController()`将反应式控制器添加到 Lit 组件,以便该组件调用控制器的生命周期回调.有关详细信息,请参阅反应式控制器文档.

### removeController()

`removeController()`删除反应式控制器,使其不再接收来自此组件的生命周期回调

## 服务端反应式更新周期

Lit有一个服务器渲染包,还在开发中
