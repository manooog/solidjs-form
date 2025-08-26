import {
  Accessor,
  Component,
  createContext,
  createEffect,
  createMemo,
  Index,
  JSX,
  ParentComponent,
  Show,
  splitProps,
  useContext,
} from 'solid-js';
import { Dynamic } from 'solid-js/web';
import { getValueFromStore, useFormContext } from './context';
import { FormFieldError } from './FormFieldError';
import type { BetterForm } from './type';
import { transFormNamePath } from './utils';

import { FormListItemContext } from './formListItemContext';
import { FormList as LegacyFormList } from './LegacyFormList';

const FormListContext = createContext<{
  formFieldName: BetterForm.NamePath;
  autoCombineFieldName: boolean;
  onDelete: (index: number) => void;
  onAdd: (initValue?: any) => void;
  listValue: Accessor<unknown[]>;
}>();

const FormListItems = <T,>(
  props: {
    component: Component<{
      remove: () => void;
      item: Accessor<T>;
      index: number;
    }>;
  } & JSX.HTMLAttributes<HTMLDivElement>
) => {
  const [local, rest] = splitProps(props, ['component']);
  const formListContext = useContext(FormListContext);
  if (!formListContext) throw new Error('FormListItems must be used within a FormList');

  return (
    <div {...rest}>
      <Index each={formListContext.listValue()}>
        {(item, index) => {
          const remove = formListContext.onDelete.bind(null, index);
          return (
            <FormListItemContext.Provider
              value={{
                formFieldName: formListContext.formFieldName,
                autoCombineFieldName: formListContext.autoCombineFieldName,
                index,
                remove,
              }}>
              <Dynamic component={local.component} remove={remove} item={item as Accessor<T>} index={index} />
            </FormListItemContext.Provider>
          );
        }}
      </Index>
    </div>
  );
};

const _FormList: ParentComponent<BetterForm.FormListProps> = (props) => {
  const [local, rest] = splitProps(props, ['formFieldName', 'autoCombineFieldName', 'rules', 'children']);
  const formContext = useFormContext();
  if (!formContext) throw new Error('FormList must be used within a FormWrapper');

  const val = createMemo(() => (getValueFromStore(formContext.formStore, local.formFieldName) || []) as unknown[]);

  function onDelete(index: number) {
    const arr = (val() || []).slice();
    if (index >= arr.length) return;
    arr.splice(index, 1);
    formContext.setFieldValue(local.formFieldName, arr, false);
  }

  function onAdd(initValue?: any) {
    const arr = (val() || []).slice();
    arr.push(initValue || {});
    formContext.setFieldValue(local.formFieldName, arr, false);
  }

  createEffect(() => {
    const { rules, formFieldName } = local;
    if (rules?.length && formFieldName) {
      formContext.setFormFieldRules(rules, formFieldName);
    }
  });

  return (
    <div {...rest}>
      <FormListContext.Provider
        value={{
          formFieldName: local.formFieldName,
          autoCombineFieldName: local.autoCombineFieldName || true,
          onDelete,
          onAdd,
          listValue: val,
        }}>
        {local.children}

        <Show when={local.rules?.length}>
          <FormFieldError formFieldName={local.formFieldName} />
        </Show>
      </FormListContext.Provider>
    </div>
  );
};

const ActionArea: Component<{
  children: (options: {
    listValue: Accessor<unknown[]>;
    add: (initValue?: any) => void;
    delete: (index: number) => void;
    prefix: BetterForm.NamePath;
  }) => JSX.Element;
}> = (props) => {
  const formListContext = useContext(FormListContext);
  if (!formListContext) throw new Error('ActionArea must be used within a FormList');

  const _component = createMemo(() => {
    return props.children({
      listValue: formListContext.listValue,
      add: formListContext.onAdd,
      delete: formListContext.onDelete,
      prefix: transFormNamePath(formListContext.formFieldName),
    });
  });

  return <Dynamic component={_component} />;
};

/**
 * @description This is the new FormList, it's more flexible and easier to use. You can use FormList.Legacy for the old version.
 */
const FormList = Object.assign(_FormList, {
  ActionArea,
  Items: FormListItems,
  Legacy: LegacyFormList,
});

export { FormList };
