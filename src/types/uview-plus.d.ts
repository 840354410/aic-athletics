declare module 'uview-plus';
declare module 'uview-plus/components/u-form/u-form';
declare module '/node_modules/uview-plus/libs/config/props';
interface Form {
  validate(): Promise;
}
interface DatetimePicker {
  setFormatter(formatter: (type: string, value: string | number) => string | number): void;
}
