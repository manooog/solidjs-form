import { ConfigType } from 'dayjs';
import type { Accessor, ComponentProps, JSX, ValidComponent } from 'solid-js';
import type { useForm } from './context';

export namespace BetterForm {
  type NamePath = string | (string | number)[];

  type form = ReturnType<typeof useForm>;

  type Rule = {
    message?: string;
    required?: boolean;
    validator?: (value: any) => boolean | string;
    type?:
      | 'email'
      | 'number'
      | 'phone'
      | 'controlledByYourself'
      | 'int'
      | 'date'
      | 'dateOfBirth'
      | 'ssn'
      | 'name'
      | 'tenantName'
      | 'ein'
      | 'numberInputStep';
    regex?: RegExp;
    length?: number | [min: number, max: number];
    range?: [min: number, max: number];
    dateRange?: [min: ConfigType, max: ConfigType];
    numberInputStep?: number;
  };

  type FormItemProps<T extends ValidComponent> = {
    formFieldName?: NamePath;
    component: T;
    onChangeMethodName?: string;
    valuePropName?: string;
    rules?: Rule[];
    removeValueOnClean?: boolean;

    customSyncValue?: (context: form, realValue: any) => any;

    customGetValue?: (context: form) => any;
    getValueFromEvent?: (val: any) => any;
    label?: JSX.Element;
    description?: string;
  } & ComponentProps<T>;

  type LegacyFormListProps = {
    class?: string;
    formFieldName: NamePath;
    renderItemsGroup?: (options: { remove: () => void; item: any; index: Accessor<number> }) => JSX.Element;
    autoCombineFieldName?: boolean;
    children?: (options: { val: any; add: (initValue?: any) => void; delete: any; prefix: (string | number)[] }) => JSX.Element;
    itemsGroupsClass?: string;
    rules?: Rule[];
  };

  type FormListProps = {
    formFieldName: NamePath;
    autoCombineFieldName?: boolean;
    rules?: Rule[];
  } & JSX.HTMLAttributes<HTMLDivElement>;

  type ValidateTriggers = 'onChange' | 'onBlur' | 'onSubmit';

  type FormProps = JSX.HTMLAttributes<HTMLFormElement> & {
    children?: JSX.Element;
    onFormSubmit?: (store: FormStore) => void;
    initialValues?: FormStore;
    defaultForm?: form;
    validateTriggers?: ValidateTriggers[];
    onFieldChange?: () => void;
  };

  type FormStore<T = Record<string, any>> = T;

  type ConfigStore = {
    formError?: boolean;
    fieldsErrors: Record<string, string>;
    rules: Record<string, Rule[]>;
    validateTriggers?: ValidateTriggers[];
    onFieldChange?: () => void;
    inputLabel?: ValidComponent;
    formName: string;
  };

  type ContextValue = form;

  type RemoveFormFieldOpts = {
    removeValue?: boolean;
  };

  type ValidateResult = {
    errorFields: { name: NamePath; message?: string }[];
    validateStatus: boolean;
  };
}
