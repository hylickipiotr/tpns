import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { load } from "cheerio";
import { getProductUrl } from "../../utils/url";
import { Product, ProductStatus } from "../../types/product";
import { PRODUCT_STATUSES } from "../../constants";
import {
  createProductStatusEmailData,
  sendEmail,
  SendEmailResponse,
} from "../../utils/email";

const QuerySchema = z.object({
  pathname: z.string(),
  secret: z.literal(process.env.SECRET, {
    errorMap() {
      return {
        message: "Invalid secret",
      };
    },
  }),
});
type Query = z.infer<typeof QuerySchema>;

async function getProduct(pathname: string): Promise<Product> {
  const url = getProductUrl(pathname);
  const response = await fetch(url);
  const html = await response.text();
  const $ = load(html);

  const name = $(".h1").text().trim();
  let status: ProductStatus | undefined = "outOfStock";

  for (let i = 0; i < PRODUCT_STATUSES.length; i += 1) {
    const currentStatus = PRODUCT_STATUSES[i];
    const statusElements = $(`.${currentStatus}`);
    if (statusElements.length) {
      status = currentStatus;
      break;
    }
  }

  return {
    url,
    name,
    status,
  };
}

interface ResponseSuccess {
  product: Product;
  mail: SendEmailResponse | null;
}

interface ResponseError {
  message: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseSuccess | ResponseError>
) {
  if (!req.url) {
    res.end();
    return;
  }

  if (!req.method || req.method !== "GET") {
    res.status(405);
    res.json({
      message: "method not allowed",
    });
    return;
  }

  try {
    QuerySchema.parse(req.query);
  } catch (e: any) {
    res.status(406);
    res.json({
      message: e.issues[0].message,
    });
    return;
  }

  const { pathname } = req.query as Query;
  const product = await getProduct(pathname);

  if (product.status) {
    let mail: SendEmailResponse | null = null;
    if (product.status !== "outOfStock") {
      mail = await sendEmail(createProductStatusEmailData(product));
    }
    res.status(200);
    res.json({ product, mail });
  }

  res.end();
}
