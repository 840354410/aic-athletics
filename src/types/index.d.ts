type Nullable<T> = T | null;

interface Uni {
  $u: typeof uni.$u;
}

interface Option {
  label: string;
  value: any;
  [propName: string]: any;
}

interface StatisticItem {
  key?: string;
  [propName: string]: any;
}

interface FileItem {
  url: string;
  status?: 'uploading' | 'failed' | 'success';
  message?: string;
  name?: string;
  [propsName: string]: any;
}
