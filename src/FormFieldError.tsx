import { createMemo, Show } from 'solid-js';
import { useFormContext } from './context';
import type { BetterForm } from './type';
import { useFormItemContext } from './FormItem';

export const FormFieldError = (props: { formFieldName?: BetterForm.NamePath }) => {
  const formIns = useFormContext();
  const formItemContext = useFormItemContext();
  const formFieldName = createMemo(() => {
    return props.formFieldName || formItemContext?.formFieldName();
  });
  const error = createMemo(() => {
    return formIns.getFormFieldError(formFieldName());
  });
  return (
    <Show when={error()}>
      <div class="mt-2 text-left text-xs normal-case text-red-500">
        <span>{error()}</span>
      </div>
    </Show>
  );
};
