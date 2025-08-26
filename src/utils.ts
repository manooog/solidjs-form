import dayjs from 'dayjs';
import type { BetterForm } from './type';

import Decimal from 'decimal.js';

export const emailRegex = /^(?!\.)(?!.*\.\.)([A-Z0-9_'+-.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9-]*\.)+[A-Z]{2,}$/i;

export const isPlainObject = (value: any) => {
  return typeof value === 'object' && value !== null && Object.getPrototypeOf(value) === Object.prototype;
};

export function cleanData(data: any): any {
  if (Array.isArray(data)) {
    const cleanedArray = data.map((item) => cleanData(item)).filter((item) => !isFalsy(item));
    return cleanedArray.length > 0 ? cleanedArray : undefined;
  } else if (isPlainObject(data)) {
    const cleanedObject = Object.entries(data).reduce((acc: { [key: string]: any }, [key, value]) => {
      const cleanedValue = cleanData(value);
      if (!isFalsy(cleanedValue)) {
        acc[key] = cleanedValue;
      }
      return acc;
    }, {});
    return Object.keys(cleanedObject).length > 0 ? cleanedObject : undefined;
  }
  return data;
}

export const isRequired = (rules: BetterForm.Rule[] = []) => {
  const ruleIsRequired = rules.find((rule) => rule.required);
  if (ruleIsRequired) return ruleIsRequired;
  return false;
};

export const isControlledByYourself = (rules: BetterForm.Rule[] = []) => {
  return rules.some((rule) => rule.type === 'controlledByYourself');
};

export const isFalsy = (value: any) => {
  return value === undefined || value === null || value === '';
};

export const getErrorMessage = (value: any, rules: BetterForm.Rule[] = []) => {
  const required = isRequired(rules);
  function getResponse(message: string, isError: boolean) {
    return {
      isError,
      message,
    };
  }
  if (required && isFalsy(value)) {
    return getResponse(required.message || '', true);
  }

  for (const rule of rules) {
    if (rule.validator) {
      const res = rule.validator(value);
      if (res === true || res === '') {
        continue;
      }
      return getResponse(typeof res === 'string' ? res : (rule.message as string), true);
    }
    if (!isFalsy(value)) {
      if (rule.regex && !rule.regex.test(value)) {
        return getResponse(rule.message as string, true);
      }
      if (rule.type === 'name' && !/^[\p{L}\p{M}\s'-]{1,150}$/u.test(value)) {
        return getResponse(rule.message as string, true);
      }
      if (rule.type === 'tenantName' && !/^[A-Za-z\s',.-]{2,150}$/u.test(value)) {
        return getResponse(rule.message as string, true);
      }
      if (rule.type === 'email' && !emailRegex.test(value)) {
        return getResponse(rule.message as string, true);
      }
      if (
        rule.type === 'phone' &&
        !/^\+1\s*(?:\(?\d{3}\)?[\s-]?)?\d{3}[\s-]?\d{4}$|^\d{10}$|^\d{3}[\s-]\d{3}[\s-]\d{4}$|^\(\d{3}\)\s?\d{3}[\s-]\d{4}$/.test(value)
      ) {
        return getResponse(rule.message as string, true);
      }
      if (rule.type === 'number') {
        if (isNaN(value)) {
          return getResponse(rule.message as string, true);
        }
      }
      if (rule.type === 'int') {
        if (!Number.isInteger(value)) {
          return getResponse(rule.message as string, true);
        }
      }
      if (rule.type === 'numberInputStep') {
        if (isNaN(value)) {
          return getResponse(rule.message as string, true);
        }

        if (!rule.numberInputStep) {
          return getResponse('numberInputStep is required when rule type is numberInputStep', true);
        }
        const valueDecimal = new Decimal(value);
        if (!valueDecimal.mod(rule.numberInputStep).eq(0)) {
          return getResponse(rule.message as string, true);
        }
      }
      if (rule.type === 'dateOfBirth') {
        const isDateOfBirthInvalid = dayjs().isBefore(dayjs(value)) || !/^\d{4}-\d{2}-\d{2}$/.test(value);
        const isUnder18YearsAnd2Days = dayjs().isBefore(dayjs(value).add(18, 'year').add(2, 'day'));
        const isOver125Years = dayjs().isAfter(dayjs(value).add(125, 'year'));
        if (isDateOfBirthInvalid || isUnder18YearsAnd2Days || isOver125Years) {
          return getResponse(rule.message as string, true);
        }
      }

      if (rule.type === 'ssn' && !/^(\d{3}-{0,1}\d{2}-{0,1}\d{4}|\d{9}|\d{2}-{0,1}\d{7})$/.test(value)) {
        return getResponse(rule.message as string, true);
      }

      if (rule.type === 'ein' && !/^\d{2}-?\d{7}$/.test(value)) {
        return getResponse(rule.message as string, true);
      }

      if (rule.length && typeof rule.length === 'number' && value.length > rule.length) {
        return getResponse(rule.message as string, true);
      }
      if (rule.length && Array.isArray(rule.length) && (value.length < rule.length[0] || value.length > rule.length[1])) {
        return getResponse(rule.message as string, true);
      }
      if (rule.range && (value < rule.range[0] || value > rule.range[1])) {
        return getResponse(rule.message as string, true);
      }
      if (rule.type === 'date') {
        if (!dayjs(value).isValid()) {
          return getResponse(rule.message as string, true);
        }
        if (rule.dateRange && (dayjs(value).isBefore(dayjs(rule.dateRange[0])) || dayjs(value).isAfter(dayjs(rule.dateRange[1])))) {
          return getResponse(rule.message as string, true);
        }
      }
    }
  }

  return getResponse('', false);
};

export const transFormNamePath = (name: BetterForm.NamePath = []) => {
  return Array.isArray(name) ? name : stringToNamePath(name);
};

export const namePathToString = (namePath: BetterForm.NamePath) => {
  return transFormNamePath(namePath).join('.');
};

export const stringToNamePath = (namePathStr: string) => {
  return namePathStr.split('.').map((key) => (/^\d+$/.test(key) ? Number(key) : key));
};

export const compareTwoNamePath = (namePath1: BetterForm.NamePath, namePath2: BetterForm.NamePath) => {
  const namePath1Arr = transFormNamePath(namePath1);
  const namePath2Arr = transFormNamePath(namePath2);
  if (namePath1Arr.length !== namePath2Arr.length) return false;
  for (let i = 0; i < namePath1Arr.length; i++) {
    if (namePath1Arr[i] !== namePath2Arr[i]) return false;
  }
  return true;
};

export const combineNamePaths = (...namePaths: BetterForm.NamePath[]): BetterForm.NamePath => {
  return namePaths.reduce((acc, cur) => {
    return (acc as (string | number)[]).concat(transFormNamePath(cur));
  }, []);
};

export const FieldDataKeyName = 'data-form-field-name';

export const FormDataKeyName = 'data-form-name';
