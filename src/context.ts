import { createContext, useContext, ValidComponent } from 'solid-js';
import { createStore, produce, unwrap } from 'solid-js/store';
import { scrollToFormField } from './scroll';
import {
  compareTwoNamePath,
  getErrorMessage,
  isControlledByYourself,
  namePathToString,
  stringToNamePath,
  transFormNamePath,
} from './utils';
import { cleanData } from './utils';
import type { BetterForm } from './type';

import { cloneDeep } from 'lodash-es';

const defaultFormContext = createContext<BetterForm.ContextValue>();

export const getFormContext = () => {
  return defaultFormContext;
};

export const useFormContext = (formContext?: ReturnType<typeof getFormContext>) => {
  const context = useContext(defaultFormContext || formContext);
  if (!context) {
    throw new Error('Form context is not found');
  }
  return context;
};

export const getValueFromStore = (store: BetterForm.FormStore, name?: BetterForm.NamePath) => {
  if (!name) {
    return;
  }
  const _namePath = transFormNamePath(name);
  return _namePath.reduce((acc, cur) => acc?.[cur], store);
};

export const copyStore = (store: BetterForm.FormStore) => {
  return cloneDeep(store);
};

interface UseFormConfig {
  validateTriggers?: BetterForm.ValidateTriggers[];
  onFieldChange?: () => void;
  initialValues?: BetterForm.FormStore;
  inputLabel?: ValidComponent;
}

export const useForm = (config?: UseFormConfig) => {
  const [configStore, setConfigStore] = createStore<BetterForm.ConfigStore>({
    fieldsErrors: {},
    rules: {},
    validateTriggers: config?.validateTriggers,
    onFieldChange: config?.onFieldChange,
    inputLabel: config?.inputLabel,
    formName: `form-${Math.random().toString(36).substring(2, 15)}`,
  });

  const [formStore, setFormStore] = createStore<BetterForm.FormStore>(config?.initialValues || {});

  function setFormError(namePath: BetterForm.NamePath, error: string | undefined) {
    const namePathStr = transFormNamePath(namePath);
    if (namePathStr.length > 0) {
      setConfigStore(
        produce((draft) => {
          const path = namePathStr.join('.');
          error ? (draft.fieldsErrors[path] = error) : delete draft.fieldsErrors[path];
        })
      );
    }
  }

  function validateForm(name?: BetterForm.NamePath, setError = true) {
    const { rules, fieldsErrors } = unwrap(configStore);
    const _formStore = unwrap(formStore);
    const result: BetterForm.ValidateResult = {
      errorFields: [],
      validateStatus: true,
    };
    for (const key in rules) {
      const namePath = stringToNamePath(key);
      if (name && !compareTwoNamePath(namePath, name)) continue;
      const value = getValueFromStore(_formStore, namePath);
      const rule = rules[key];
      if (isControlledByYourself(rule)) {
        if (fieldsErrors[key]) {
          result.validateStatus = false;
          result.errorFields?.push({
            name: namePath,
          });
        }
        continue;
      }
      const { isError, message } = getErrorMessage(value, rule);
      if (isError) {
        result.validateStatus = false;
        result.errorFields?.push({
          name: namePath,
          message,
        });
        if (setError || !!getFormFieldError(namePath)) setFormError(namePath, message);
      } else {
        setFormError(namePath, '');
      }
    }

    return result;
  }

  function validateFormAndScrollToFirstError() {
    const validateResult = validateForm();
    if (validateResult.errorFields.length > 0) {
      scrollToFormField(configStore.formName, validateResult.errorFields);
    }

    return validateResult;
  }

  function setFormFieldRules(rules: BetterForm.Rule[], namePath: BetterForm.NamePath) {
    const namePathStr = transFormNamePath(namePath);
    if (namePathStr.length > 0) {
      setConfigStore('rules', (_rules) => ({
        ..._rules,
        [namePathStr.join('.')]: rules,
      }));
    }
  }

  function getFormFieldError(namePath?: BetterForm.NamePath) {
    const namePathStr = transFormNamePath(namePath);
    if (namePathStr.length > 0) {
      return configStore.fieldsErrors[namePathStr.join('.')];
    }
  }

  function setFieldValue(name: BetterForm.NamePath | undefined, value: any, needClean = true) {
    if (!name) return;
    const { validateTriggers } = unwrap(configStore);
    const cleanedValue = needClean ? cleanData(value) : value;

    const _namePath = transFormNamePath(name);
    setFormStore(
      produce((draft) => {
        _namePath.reduce((acc, cur, index) => {
          if (index === _namePath.length - 1) {
            if (cleanedValue !== undefined) {
              acc[cur] = cleanedValue;
            } else {
              delete acc[cur];
            }
          } else {
            const defaultValue = Number.isNaN(+_namePath[index + 1]) ? {} : [];
            acc[cur] = acc[cur] || defaultValue;
          }
          return acc[cur];
        }, draft);
      })
    );
    validateForm(name, !!validateTriggers?.includes('onChange'));
  }

  function setFieldsValue(values: any, needClean = true) {
    const meaningfulValues = needClean ? cleanData(values) : values;
    const { validateTriggers } = unwrap(configStore);

    if (formStore) {
      setFormStore(cloneDeep(meaningfulValues));
      validateForm(undefined, !!validateTriggers?.includes('onChange'));
    }
  }

  function getFieldValue(name: BetterForm.NamePath) {
    return getValueFromStore(formStore, name);
  }

  function removeFormField(name: BetterForm.NamePath, opts: BetterForm.RemoveFormFieldOpts = {}) {
    setConfigStore(
      produce((draft) => {
        delete draft.rules[namePathToString(name)];
        delete draft.fieldsErrors[namePathToString(name)];
      })
    );
    if (opts.removeValue) {
      setFormStore(
        produce((draft) => {
          const _namePath = transFormNamePath(name);
          _namePath.reduce((acc, cur, index) => {
            if (index === _namePath.length - 1) {
              delete acc[cur];
            }
            return acc[cur];
          }, draft);
        })
      );
    }
  }

  function resetFields(namePaths?: BetterForm.NamePath[]) {
    if (!namePaths) {
      setFormStore(
        produce((draft) => {
          Object.keys(draft).forEach((key) => {
            draft[key] = undefined;
          });
        })
      );
      return;
    }
    namePaths.forEach((cur) => {
      setFieldValue(cur, undefined);
    });
  }

  const clearValidate = (names?: BetterForm.NamePath[]) => {
    setConfigStore(
      produce((draft) => {
        if (names?.length) {
          names.forEach((name) => {
            const path = namePathToString(name);
            delete draft.fieldsErrors[path];
          });
        } else {
          draft.fieldsErrors = {};
        }
      })
    );
  };

  return {
    get isValidate() {
      return Object.values(configStore.fieldsErrors || {}).every((cur) => !cur);
    },
    formStore,
    setFormStore,
    configStore,
    setConfigStore,

    setFieldValue,
    setFieldsValue,
    getFieldValue,

    resetFields,
    clearValidate,

    setFormError,
    setFormFieldRules,
    getFormFieldError,
    validateForm: validateFormAndScrollToFirstError,

    removeFormField,
  };
};
