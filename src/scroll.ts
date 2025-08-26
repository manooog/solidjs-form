import { FieldDataKeyName, FormDataKeyName, namePathToString } from './utils';

export const scrollToFormField = (formName: string, errorFields: any[]) => {
  for (const field of errorFields) {
    const name = field.name;
    if (!name) continue;
    const formField = document
      .querySelector(`[${FormDataKeyName}="${formName}"]`)
      ?.querySelector(`[${FieldDataKeyName}="${namePathToString(name)}"]`);
    if (formField) {
      formField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      break;
    }
  }
};
