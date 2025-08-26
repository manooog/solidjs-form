## FormList 使用文档

`FormList` 用于处理动态表单列表，提供新增、删除、校验等能力。支持新旧两个版本：`FormList` 与 `FormList.Legacy`。

### 基本示例

```tsx
import { Form, FormItem, FormList } from "@manooog/solidjs-form";

export default function Demo() {
  return (
    <Form
      initialValues={{ users: [{ name: "" }] }}
      onFormSubmit={(values) => console.log(values)}
    >
      <FormList formFieldName={["users"]} rules={[{ required: true }]}>
        <FormList.Items
          component={(props) => (
            <div>
              <FormItem
                formFieldName={["name"]}
                component={(p) => <input {...p} />}
                rules={[{ required: true }]}
              />
              <button type="button" onClick={() => props.remove()}>
                删除
              </button>
            </div>
          )}
        />

        <FormList.ActionArea>
          {({ add }) => (
            <button type="button" onClick={() => add({ name: "" })}>
              新增
            </button>
          )}
        </FormList.ActionArea>
      </FormList>

      <button type="submit">提交</button>
    </Form>
  );
}
```

### API

- `FormList`

  - **formFieldName**: 绑定列表字段名，支持字符串或路径数组
  - **autoCombineFieldName**: 是否自动拼接子项字段名，默认 true
  - **rules**: 针对整个列表的校验规则
  - 其他原生容器属性透传到根 `div`

- `FormList.Items`

  - **component**: 渲染函数组件，入参：`{ item, index, remove }`

- `FormList.ActionArea`
  - children 为渲染函数，参数：`{ listValue, add, delete, prefix }`

### 旧版 FormList（兼容）

保留 `FormList.Legacy` 以兼容旧实现，建议优先使用新版本 API。

### 校验

当传入 `rules` 时，组件会为 `formFieldName` 注册规则并自动展示错误：

```tsx
<FormList
  formFieldName={["users"]}
  rules={[{ required: true, message: "至少一项用户" }]}
>
  <FormFieldError formFieldName={["users"]} />
</FormList>
```
