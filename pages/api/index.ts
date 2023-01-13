import type { NextApiRequest, NextApiResponse } from "next";

const endpoints = [
  {
    route: "/product",
    query: {
      pathname: "Product pathname",
      secret: "Secret",
    },
  },
] as const;

type Endpoints = typeof endpoints;

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Endpoints>
) {
  res.status(200).json(endpoints);
}
