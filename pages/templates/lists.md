# 列表

您可以使用标准 JavaScript 构造来创建重复模板.

Lit还提供了 `repeat` 指令, 可以更有效地构建某些类型的动态列表

## 渲染数组

当子位置的表达式返回数组或可迭代对象时, Lit 将呈现数组中的所有项目

[示例](https://lit.dev/playground/#sample=docs/templates/lists-arrays)

在大多数情况下, 您需要将数组项转换为更有用的形式

## 使用map重复模板

若要呈现列表, 可以使用 `map` 将数据列表转换为模板列表

[示例](https://lit.dev/playground/#sample=docs/templates/lists-map)

请注意, 此表达式返回一个 `TemplateResult` 对象数组. 点亮将呈现子模板和其他值的数组或可迭代对象

## 使用循环语句重复模板

您还可以构建模板数组并将其传递到模板表达式中

```js
render() {
    const itemTemplates = [];
    for (const i of this.items) {
        itemTemplates.push(html`<li>${i}</li>`);
    }

    return html`
    <ul>
      ${itemTemplates}
    </ul>
  `;
}
```

## repeat指令

在大多数情况下, 使用循环或 `map` 是构建重复模板的有效方法. 然而, 如果您想要对一个大列表进行重新排序, 或者通过添加和删除单个条目来对其进行变异, 那么这种方法可能需要更新大量的DOM节点.

repeat指令可以在此处情况提供帮助.

重复指令根据用户提供的键执行列表的高效更新:

```js
repeat(items, keyFunction, itemTemplate);
```

当

* `items` 是一个数组或可迭代的数组.
* `keyFunction` 是一个函数, 它将单个项目作为参数并返回该项目的保证唯一键.
* `itemTemplate` 是一个模板函数, 它将项目及其当前索引作为参数, 并返回
`TemplateResult` .

[示例](https://lit.dev/playground/#sample=docs/templates/lists-repeat)

如果重新排序 `employees` 数组, `repeat` 指令将重新排序现有的DOM节点.
要将其与Lit对列表的默认处理进行比较, 请考虑反转一大串名称:

* 对于使用`map`创建的列表, Lit维护列表项的DOM节点, 但重新分配值.
* 对于使用`repeat`创建的列表, `repeat`指令会重新排序现有的DOM节点, 因此表示第一个列表项的节点会移动到最后一个位置

### 何时使用map或repeat

哪种重复更有效取决于您的使用案例:

* 如果更新 DOM 节点比移动它们更昂贵, 请使用该指令.repeat

* 如果 DOM 节点的状态不受模板表达式控制, 请使用该指令.repeat

例如, 请考虑以下列表### 何时使用map或repeat

```js
html`${
  this.users.map((user) =>
    html`
    <div><input type="checkbox"> ${user.name}</div>
  `
  )
}`;
```

复选框具有选中或未选中状态, 但它不受模板表达式控制.
如果在用户选中一个或多个复选框后对列表重新排序, Lit
将更新与复选框关联的名称, 但不会更新复选框的状态

如果这两种情况都不适用, 请使用 `map` 或循环语句.
