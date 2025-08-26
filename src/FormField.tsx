import { createMemo, splitProps } from 'solid-js';
import { Dynamic } from 'solid-js/web';
import { useFormItemContext } from './FormItem';
import { FieldDataKeyName, namePathToString } from './utils';
import type { ComponentProps, ValidComponent } from 'solid-js';

export const FormField = function <T extends ValidComponent>(props: { as?: T } & ComponentProps<T>) {
  const formItemContext = useFormItemContext();
  const [local, restProps] = splitProps(props, ['as']);
  const fieldProps = createMemo(() => {
    if (!formItemContext) return {};
    return {
      [FieldDataKeyName]: namePathToString(formItemContext.formFieldName()),
    };
  });
  return <Dynamic component={local.as || 'div'} {...restProps} {...fieldProps()} />;
};
