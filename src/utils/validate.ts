import { isPhone } from './index';
interface ValidateFunction {
  (rule: [], value: string, callback: (errorMessage?: string) => void): void;
}
export const validatorPhone: ValidateFunction = function (rule, value, callback) {
  const res = isPhone(value);
  if (!res) {
    callback && callback('手机号码输入有误');
  } else {
    callback && callback();
  }
};
