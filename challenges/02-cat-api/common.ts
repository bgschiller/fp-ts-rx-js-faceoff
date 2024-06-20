export const CatCategories = [
  "boxes",
  "clothes",
  "hats",
  "sinks",
  "space",
  "sunglasses",
  "ties",
  "network-error",
  "empty-response",
  "missing-widths",
] as const;
export type CatCategory = (typeof CatCategories)[number];
export type CategoryMap = { [K in CatCategory]: number };
export interface CatImage {
  id: string;
  url: string;
  width: number;
  height: number;
}
