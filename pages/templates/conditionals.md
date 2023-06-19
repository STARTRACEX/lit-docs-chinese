# 条件

由于 Lit 利用了普通的 Javascript 表达式, 因此您可以使用标准的 Javascript 控制流构造(如条件运算符、函数调用和 `if` / `switch` 或语句)来呈现条件内容.

JavaScript 条件还允许您组合嵌套的模板表达式, 您甚至可以将模板结果存储在变量中以在其他地方使用

## 带条件(三元)运算符的条件

带条件运算符的三元表达式 `?` , 是添加内联条件的好方法:

```js
render() {
    return this.userName ?
        html`Welcome ${this.userName}` :
        html`Please log in <button>Login</button>`;
}
```

## 带有 if 语句的条件

您可以使用模板外部的 if 语句来表达条件逻辑, 以计算要在模板内部使用的值

```js
render() {
    let message;
    if (this.userName) {
        message = html`Welcome ${this.userName}`;
    } else {
        message = html`Please log in <button>Login</button>`;
    }
    return html`<p class="message">${message}</p>`;
}
```

或者, 您可以将逻辑分解到单独的函数中以简化模板

```js
getUserMessage() {
    if (this.userName) {
        return html`Welcome ${this.userName}`;
    } else {
        return html`Please log in <button>Login</button>`;
    }
}
render() {
    return html`<p>${this.getUserMessage()}</p>`;
}
```

## 缓存模板结果: 缓存指令

在大多数情况下, JavaScript 条件是条件模板所需要的. 但是, 如果要在大型复杂模板之间切换, 则可能希望节省在每个交换机上重新创建 DOM 的成本

在这种情况下, 您可以使用 `cache` 指令. 缓存指令为当前未呈现的模板缓存 DOM

```js
render() {
    return html`${cache(this.userName ?
    html`Welcome ${this.userName}`:
    html`Please log in <button>Login</button>`)
  }`;
}
```

## 有条件地不呈现任何内容

有时, 您可能希望在条件运算符的一个分支中不呈现任何内容. 这通常是子表达式所必需的, 有时在属性表达式中也需要.

`""` , `null` , `undefinde` 和 `Lit's nothing` 无信号值不渲染任何内容

此示例呈现一个值(如果存在), 否则不呈现任何值

```js
render() {
    return html`<user-name>${this.userName ?? nothing}</user-name>`;
}
```

对于属性表达式, Lit的无信号值会删除属性

此示例有条件地呈现 `aria-label` 属性

```js
html`<button aria-label="${this.ariaLabel || nothing}"></button>`
```
