import type { Component } from 'solid-js';
import { createEffect, onMount, splitProps } from 'solid-js';
import { getFormContext, useForm } from './context';
import type { BetterForm } from './type';
import { FormDataKeyName } from './utils';

export const Form: Component<BetterForm.FormProps> = (_props) => {
  const [localProps, formProps] = splitProps(_props, [
    'onFormSubmit',
    'children',
    'initialValues',
    'defaultForm',
    'validateTriggers',
    'onFieldChange',
  ]);

  const FormContext = getFormContext();

  const defaultForm = localProps.defaultForm || useForm();

  onMount(() => {
    defaultForm.setFieldsValue(localProps.initialValues);
  });

  createEffect(() => {
    const _config: Partial<BetterForm.ConfigStore> = {};
    if (localProps.validateTriggers) {
      _config.validateTriggers = localProps.validateTriggers;
    }
    if (localProps.onFieldChange) {
      _config.onFieldChange = localProps.onFieldChange;
    }
    defaultForm.setConfigStore(_config);
  });

  return (
    <FormContext.Provider value={defaultForm}>
      <form
        {...Object.assign({}, formProps, {
          [FormDataKeyName]: defaultForm.configStore.formName,
        })}
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();

          const { validateStatus } = defaultForm.validateForm();

          if (validateStatus) {
            localProps.onFormSubmit?.(defaultForm.formStore);
          }
        }}>
        {localProps.children}
      </form>
    </FormContext.Provider>
  );
};
