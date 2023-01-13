import { PRODUCT_STATUSES } from "../constants";

export type ProductStatus = (typeof PRODUCT_STATUSES)[number];

export interface Product {
  url: string;
  name: string;
  status: ProductStatus;
}
