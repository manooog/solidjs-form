# @manooog/solidjs-form

一个基于 SolidJS 的高级表单组件库，提供了灵活的表单验证和数据处理能力。

## 特性

- 🚀 基于 SolidJS 开发，性能优异
- 📝 支持复杂的表单验证规则
- 🔄 支持表单字段的动态增删
- 🎯 支持自定义验证触发器
- 🎨 支持自定义表单字段组件
- 📦 轻量级，无冗余依赖

## 安装

执行安装命令：

```bash
npm install @manooog/solidjs-form
# 或
yarn add @manooog/solidjs-form
# 或
pnpm add @manooog/solidjs-form
```

## 基本用法

```bash
cd packages/lib-playground

rushx dev
```

## 主要组件

### Form

表单容器组件，用于管理表单状态和提交行为。

#### 属性

- `onFormSubmit`: 表单提交回调函数
- `initialValues`: 表单初始值
- `validateTriggers`: 验证触发时机，可选值：'onChange' | 'onBlur' | 'onSubmit'
- `onFieldChange`: 字段值变化回调函数

### FormItem

表单字段组件，用于渲染单个表单控件。

#### 属性

- `formFieldName`: 字段名称
- `component`: 表单控件组件
- `rules`: 验证规则数组
- `label`: 字段标签
- `description`: 字段描述
- `valuePropName`: 值属性名
- `onChangeMethodName`: 变更事件名

### FormList

用于处理动态表单列表。

#### 属性

- `formFieldName`: 字段名称
- `renderItemsGroup`: 自定义渲染列表项
- `autoCombineFieldName`: 是否自动组合字段名
- `itemsGroupsClass`: 列表项容器类名

### 文档

- 参见 `docs/FormList.md` 获取 `FormList` 的详细使用说明与示例

## 验证规则

支持以下验证规则类型：

- `required`: 必填
- `type`: 类型验证（email、number、phone、int、dateOfBirth、ssn、name、tenantName、ein）
- `regex`: 正则表达式验证
- `length`: 长度验证
- `range`: 数值范围验证
- `validator`: 自定义验证函数

## 依赖

- solid-js: ~1.9.5
- dayjs: ~1.11.13
- lodash-es: ~4.17.21

## 许可证

MIT
