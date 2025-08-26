import { Show } from 'solid-js';
import type { JSX } from 'solid-js';

export const InputLabel = (props: { label?: string; required?: boolean; class?: string; description?: JSX.Element }) => {
  return (
    <div>
      <div class="mr-1">
        {props.label}
        <Show when={props.required}>
          <span class="text-error">*</span>
        </Show>
      </div>
      <Show when={props.description}>
        <div class="text-warning text-xs normal-case">{props.description}</div>
      </Show>
    </div>
  );
};
