import { Prisma } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import PrismaDb from "../../../lib/prisma/client";
import { OlxResponseData, Value } from "../../../types/olx";
import {
  createOlxNewOffersEmailData,
  sendEmail,
  SendEmailResponse,
} from "../../../utils/email";
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
    created_time: item.created_time,
    last_refresh_time: item.last_refresh_time,
    location_city_name: item.location.city.name,
    location_region_name: item.location.region.name,
    title: item.title,
    url: item.url,
    valid_to_time: item.valid_to_time,
    pushup_time: item.pushup_time,
    param_enginesize: params.enginesize,
    param_milage: params.milage,
    param_price: params.price,
    param_year: params.year,
    param_country_origin: params.countryOrigin,
    updated_at: new Date().toISOString(),
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
  error?: any;
};

async function saveSearchData(data: OlxResponseData): Promise<SavedSearchData> {
  const { db } = PrismaDb;

  try {
    db.$connect();
  } catch (e) {
    return { create: {}, update: {}, error: e };
  }

  const offers = await db.tpns_olx_offer.findMany({
    where: { id: { in: data.data.map(mapOlxResponseDataToId) } },
  });
  const offersMap = offers.reduce(
    (map, offer) => map.set(offer.id, offer),
    new Map()
  );

  const input = data.data.reduce(
    (currentInput, item) => {
      if (offersMap.has(String(item.id))) {
        currentInput.update.set(
          item.id,
          mapOlxResponseDataToDatabaseInput(item)
        );
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

  if (input.update.size) {
    const updateData = Array.from(input.update.values());
    result.update.data = updateData;
    await db.$transaction(
      updateData.map((item) =>
        db.tpns_olx_offer.update({
          data: item,
          where: {
            id: item.id,
          },
        })
      )
    );
  }

  const createData = Array.from(input.create.values());
  await db.tpns_olx_offer.createMany({
    data: createData,
  });
  result.create.data = createData;

  return result;
}

export default async function search(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const result: Array<{
    searched: OlxResponseData;
    saved: SavedSearchData | null;
    message: SendEmailResponse | null;
  }> = [];
  let searched: OlxResponseData;
  let offset = 0;
  do {
    const url = new URL(joinUrlWithRoute(olxUrl, "api/v1/offers"));
    const searchParams: Record<string, string> = {
      ...req.query,
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
    let message: SendEmailResponse | null = null;
    try {
      saved = await saveSearchData(searched);
      if (saved.create.data?.length) {
        message = await sendEmail(
          createOlxNewOffersEmailData(saved.create.data)
        );
      }
    } catch (e) {
      console.log(e);
    }

    result.push({ searched, saved, message });
    offset += PAGE_SIZE;
  } while (searched?.links?.next);

  res.status(200).json(result);
}
