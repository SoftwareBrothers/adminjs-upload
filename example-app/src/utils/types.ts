export type Nullable<T> = T | null;
export type ValueOf<T> = T[keyof T];
export type RawFile = {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
};
export type RawFileOrBuffer = RawFile | Buffer;
