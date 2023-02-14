import { Prisma, tpns_olx_offer } from "@prisma/client";
import { dequal } from "dequal/lite";
import type { NextApiRequest } from "next";
import { z } from "zod";
import PrismaDb from "../../../lib/prisma/client";
import { OlxResponseData, Value } from "../../../types/olx";
import { createOlxNewOffersEmailData, sendEmail } from "../../../utils/email";
import omit from "../../../utils/omit";
import { joinUrlWithRoute } from "../../../utils/url";

const olxUrl = "https://www.olx.pl";
const PAGE_SIZE = 50;

function getOfferParam<T>(
  name: string,
  data: OlxResponseData["data"][number],
  key: keyof Value = "key"
): T | undefined {
  const param = data.params.find((p) => p.key === name);
  return param?.value[key] as T;
}

function mapOlxResponseDataToId(item: OlxResponseData["data"][number]): string {
  return String(item.id);
}

function mapOlxResponseDataToDatabaseInput(
  item: OlxResponseData["data"][number]
): Prisma.tpns_olx_offerCreateInput {
  const params = {
    enginesize:
      parseInt(getOfferParam<string>("enginesize", item) || "0", 10) || null,
    milage: parseInt(getOfferParam<string>("milage", item) || "0", 10) || null,
    price: getOfferParam<number>("price", item, "value"),
    year: parseInt(getOfferParam<string>("year", item) || "0", 10) || null,
    countryOrigin: getOfferParam<string>("country_origin", item, "label"),
  };

  return {
    id: String(item.id),
    created_time: new Date(item.created_time),
    last_refresh_time: new Date(item.last_refresh_time),
    location_city_name: item.location.city.name,
    location_region_name: item.location.region.name,
    title: item.title,
    url: item.url,
    valid_to_time: new Date(item.valid_to_time),
    pushup_time: item.pushup_time && new Date(item.pushup_time),
    param_enginesize: params.enginesize,
    param_milage: params.milage,
    param_price: params.price,
    param_year: params.year,
    param_country_origin: params.countryOrigin ?? null,
    updated_at: new Date(),
  };
}

type SavedSearchData = {
  create: {
    data?: Prisma.tpns_olx_offerCreateInput[];
    error?: any;
  };
  update: {
    data?: Prisma.tpns_olx_offerUpdateManyMutationInput[];
    error?: any;
  };
};

async function saveSearchData(data: OlxResponseData): Promise<SavedSearchData> {
  const { db } = PrismaDb;

  const offers = await db.tpns_olx_offer.findMany({
    where: { id: { in: data.data.map(mapOlxResponseDataToId) } },
  });
  const offersMap = offers.reduce(
    (map, offer) => map.set(offer.id, offer),
    new Map<string, tpns_olx_offer>()
  );

  const input = data.data.reduce(
    (currentInput, item) => {
      const id = String(item.id);
      if (offersMap.has(id)) {
        const newItem = mapOlxResponseDataToDatabaseInput(item);
        const currentItem = offersMap.get(id);
        if (!currentItem) return currentInput;
        const isEqual = dequal(
          omit(currentItem, "updated_at"),
          omit(newItem, "updated_at")
        );
        if (!isEqual) return currentInput;
        currentInput.update.set(item.id, newItem);
      } else {
        currentInput.create.set(
          item.id,
          mapOlxResponseDataToDatabaseInput(item)
        );
      }
      return currentInput;
    },
    {
      create: new Map<number, Prisma.tpns_olx_offerCreateInput>(),
      update: new Map<number, Prisma.tpns_olx_offerCreateInput>(),
    }
  );

  const result: SavedSearchData = { create: {}, update: {} };
  const updateData = Array.from(input.update.values());
  const createData = Array.from(input.create.values());
  result.update.data = updateData;
  result.create.data = createData;
  await db.$transaction([
    ...updateData.map((item) =>
      db.tpns_olx_offer.update({
        data: item,
        where: {
          id: item.id,
        },
      })
    ),
    db.tpns_olx_offer.createMany({
      data: createData,
    }),
  ]);

  return result;
}

const QuerySchema = z.object({
  secret: z.literal(process.env.SECRET, {
    errorMap() {
      return {
        message: "Invalid secret",
      };
    },
  }),
});

export default async function search(req: NextApiRequest) {
  try {
    QuerySchema.parse(req.query);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify({ error: error.issues[0].message }), {
        status: 400,
      });
    }
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
    });
  }

  const result: Array<{
    searched: OlxResponseData;
    saved: SavedSearchData | null;
  }> = [];
  let searched: OlxResponseData;
  let offset = 0;
  do {
    const url = new URL(joinUrlWithRoute(olxUrl, "api/v1/offers"));
    const { secret, ...queryWithoutSecret } = req.query;
    const searchParams: Record<string, string> = {
      ...queryWithoutSecret,
      offset: String(offset),
      limit: String(PAGE_SIZE),
    };
    const searchParamsArray = Object.entries(searchParams);
    for (
      let searchParamIndex = 0;
      searchParamIndex < searchParamsArray.length;
      searchParamIndex += 1
    ) {
      const [name, value] = searchParamsArray[searchParamIndex];
      url.searchParams.append(name, value);
    }
    const response = await fetch(url);
    searched = await response.json();

    let saved: SavedSearchData | null = null;
    try {
      saved = await saveSearchData(searched);
      if (saved.create.data?.length) {
        await sendEmail(createOlxNewOffersEmailData(saved.create.data));
      }
    } catch (e) {
      console.log(e);
    }

    result.push({ searched, saved });
    offset += PAGE_SIZE;
  } while (searched?.links?.next);

  return new Response(JSON.stringify(result), {
    status: 200,
  });
}

export const config = {
  runtime: "edge",
};
