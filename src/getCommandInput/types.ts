export type ObjectValue = {
  [key: string]: string | number | boolean;
};

export type ArrayValue = (string | number | boolean)[];

export type OptionValue = ObjectValue | ArrayValue;
