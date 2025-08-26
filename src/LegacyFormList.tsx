import { createEffect, createMemo, For, Show } from 'solid-js';
import { copyStore, getValueFromStore, useFormContext } from './context';
import { FormFieldError } from './FormFieldError';
import { FormListItemContext } from './formListItemContext';
import type { BetterForm } from './type';
import { transFormNamePath } from './utils';

export const FormList = (props: BetterForm.LegacyFormListProps) => {
  const formContext = useFormContext();
  if (!formContext) throw new Error('FormList must be used within a FormWrapper');
  const val = createMemo(() => (getValueFromStore(formContext.formStore, props.formFieldName) || []) as unknown[]);

  const onDelete = (index: number) => {
    const arr = copyStore(val() as any[]);
    if (index >= arr.length) return;
    arr.splice(index, 1);
    formContext.setFieldValue(props.formFieldName, arr, false);
  };

  const itemsGroups = createMemo(() => {
    if (!props.renderItemsGroup) return null;

    return (
      <For each={val()}>
        {(item, index) => (
          <FormListItemContext.Provider
            value={{
              formFieldName: props.formFieldName,
              autoCombineFieldName: props.autoCombineFieldName || true,
              index: index(),
            }}>
            {props.renderItemsGroup?.({
              remove: onDelete.bind(null, index()),
              item,
              index,
            })}
          </FormListItemContext.Provider>
        )}
      </For>
    );
  });

  const children = createMemo(() => {
    if (!props.children) return null;
    return props.children({
      val,
      add(initValue?: any) {
        const arr = copyStore(val());
        arr.push(initValue || {});
        formContext.setFieldValue(props.formFieldName, arr, false);
      },
      delete: onDelete,
      prefix: transFormNamePath(props.formFieldName),
    });
  });

  createEffect(() => {
    const { rules, formFieldName } = props;
    if (rules?.length && formFieldName) {
      formContext.setFormFieldRules(rules, formFieldName);
    }
  });

  return (
    <div class={props.class}>
      <div class={props.itemsGroupsClass}>{itemsGroups()}</div>
      {children()}

      <Show when={props.rules?.length}>
        <FormFieldError formFieldName={props.formFieldName} />
      </Show>
    </div>
  );
};
