import type { Accessor, ValidComponent } from 'solid-js';
import { createContext, createEffect, createMemo, onCleanup, splitProps, useContext } from 'solid-js';
import { Dynamic } from 'solid-js/web';
import { InputLabel } from './InputLabel';
import { getValueFromStore, useFormContext } from './context';
import { FormListItemContext } from './formListItemContext';
import type { BetterForm } from './type';
import { combineNamePaths, isFalsy, isPlainObject, isRequired } from './utils';

const defaultOnChangeMethodName = 'onInput';
const defaultGetValueFromEvent = (val: any) => val;

const formItemContext = createContext<{
  formFieldName: Accessor<BetterForm.NamePath>;
}>();

export const useFormItemContext = () => {
  return useContext(formItemContext);
};

export const FormItem = function <T extends ValidComponent>(props: BetterForm.FormItemProps<T>) {
  const formContext = useFormContext();
  const formListContext = useContext(FormListItemContext);

  const [formItemProps, componentProps] = splitProps(props, [
    'component',
    'formFieldName',
    'onChangeMethodName',
    'label',
    'rules',
    'removeValueOnClean',
    'customSyncValue',
    'customGetValue',
    'getValueFromEvent',
    'valuePropName',
    'description',
  ]);

  if (!formContext) throw new Error('FormItem must be used within a FormWrapper');

  const realFormFieldName = createMemo(() => {
    if (formListContext && formItemProps.formFieldName) {
      return combineNamePaths(formListContext.formFieldName, [formListContext.index], formItemProps.formFieldName);
    }
    return formItemProps.formFieldName;
  });

  const labelJSX = createMemo(() =>
    formItemProps.label ? (
      <Dynamic
        component={formContext.configStore.inputLabel || InputLabel}
        description={formItemProps.description}
        label={formItemProps.label}
        required={!!isRequired(formItemProps.rules)}
      />
    ) : null
  );

  const onChangeMethodName = createMemo<string>(() => formItemProps.onChangeMethodName || defaultOnChangeMethodName);

  const value = createMemo(() => {
    if (typeof formItemProps.customGetValue === 'function') {
      return formItemProps.customGetValue(formContext);
    }
    return getValueFromStore(formContext.formStore, realFormFieldName());
  });

  const getValueFromEvent = createMemo(() => {
    if (formItemProps.getValueFromEvent) return formItemProps.getValueFromEvent;
    return defaultGetValueFromEvent;
  });

  const autoBindProps = createMemo(() => {
    return {
      [formItemProps.valuePropName || 'value']: value(),
      [onChangeMethodName()]: (...args: any[]) => {
        const value = args[0];
        const isEmpty =
          isFalsy(value) || (Array.isArray(value) && value.length === 0) || (isPlainObject(value) && Object.keys(value).length === 0);

        const realValue = isEmpty ? undefined : getValueFromEvent()(value);

        if (formItemProps.customSyncValue) {
          formItemProps.customSyncValue(formContext, realValue);
        } else {
          formContext.setFieldValue(realFormFieldName(), realValue);
        }
        (componentProps[onChangeMethodName() as keyof typeof componentProps] as any)?.(...args);
        formContext.configStore.onFieldChange?.();
      },
      error: formContext.getFormFieldError(realFormFieldName()),
    };
  });

  createEffect(() => {
    const _realFormFieldName = realFormFieldName();
    if (formItemProps.rules && _realFormFieldName) {
      formContext.setFormFieldRules(formItemProps.rules, _realFormFieldName);
    }
  });

  onCleanup(() => {
    const _realFormFieldName = realFormFieldName();
    if (_realFormFieldName) {
      formContext.removeFormField(_realFormFieldName);
    }
    if (formItemProps.removeValueOnClean && _realFormFieldName) {
      formContext.removeFormField(_realFormFieldName, { removeValue: true });
    }
  });

  return (
    <formItemContext.Provider value={{ formFieldName: realFormFieldName }}>
      <Dynamic
        {...componentProps}
        {...autoBindProps()}
        component={formItemProps.component as any}
        label={props.label}
        labelJSX={labelJSX()}
      />
    </formItemContext.Provider>
  );
};
