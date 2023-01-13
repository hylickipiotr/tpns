import { BASE_URL } from "../constants";
import { trimEnd, trimStart } from "./string";

export function joinUrlWithRoute(
  url: string,
  route?: string | null | undefined
) {
  return `${trimEnd("/", url)}/${trimStart("/", route ?? "")}`;
}

export function getProductUrl(pathname: string) {
  return joinUrlWithRoute(BASE_URL, decodeURI(pathname));
}
