import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

import { getRegionLabelByCode } from "@/lib/regions";

type RegionStat = {
  regionCode: string;
  label: string;
  count: number;
};

type RegionInput = {
  regionCode?: unknown;
  code?: unknown;
  count?: unknown;
  users?: unknown;
};

const FALLBACK_REGIONS: RegionStat[] = [
  { regionCode: "38", label: "Иркутская область", count: 1 }
];

const MAX_REGIONS = 200;
const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || "ciwork";

let clientPromise: Promise<MongoClient> | null = null;

const toPositiveInt = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return Math.floor(value);
  }
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed) && parsed > 0) {
      return Math.floor(parsed);
    }
  }
  return null;
};

const toRegionCode = (value: unknown): string | null => {
  if (typeof value !== "string" && typeof value !== "number") return null;
  const raw = String(value).trim();
  if (!raw) return null;
  return raw.padStart(2, "0");
};

const parseRegionArray = (input: unknown): RegionStat[] => {
  if (!Array.isArray(input)) return [];

  return input
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const record = item as RegionInput;
      const regionCode = toRegionCode(record.regionCode ?? record.code);
      if (!regionCode) return null;

      const count =
        toPositiveInt(record.count) ?? toPositiveInt(record.users) ?? 1;
      const label = getRegionLabelByCode(regionCode);
      if (!label) return null;

      return { regionCode, label, count };
    })
    .filter((item): item is RegionStat => item !== null)
    .slice(0, MAX_REGIONS);
};

const aggregateUsersByRegion = (usersPayload: unknown): RegionStat[] => {
  if (!Array.isArray(usersPayload)) return [];
  const byCode = new Map<string, number>();

  for (const user of usersPayload) {
    if (!user || typeof user !== "object") continue;
    const record = user as Record<string, unknown>;
    const regionCode = toRegionCode(record.regionCode);
    if (!regionCode) continue;
    byCode.set(regionCode, (byCode.get(regionCode) ?? 0) + 1);
  }

  return Array.from(byCode.entries())
    .map(([regionCode, count]) => {
      const label = getRegionLabelByCode(regionCode);
      if (!label) return null;
      return { regionCode, label, count };
    })
    .filter((item): item is RegionStat => item !== null)
    .slice(0, MAX_REGIONS);
};

const parseUpstreamPayload = (payload: unknown): RegionStat[] => {
  if (!payload || typeof payload !== "object") return [];
  const record = payload as Record<string, unknown>;

  const fromRegions = parseRegionArray(record.regions);
  if (fromRegions.length > 0) return fromRegions;

  const fromUsers = aggregateUsersByRegion(record.users);
  if (fromUsers.length > 0) return fromUsers;

  return parseRegionArray(payload);
};

const getMongoClient = () => {
  if (!MONGODB_URI) return null;
  if (!clientPromise) {
    clientPromise = new MongoClient(MONGODB_URI).connect();
  }
  return clientPromise;
};

const fetchRegionsFromMongo = async (): Promise<RegionStat[]> => {
  const clientConnection = getMongoClient();
  if (!clientConnection) return [];

  const client = await clientConnection;
  const db = client.db(MONGODB_DB_NAME);

  const rows = await db
    .collection("users")
    .aggregate([
      {
        $project: {
          regionCodeStr: {
            $trim: {
              input: { $toString: "$regionCode" }
            }
          }
        }
      },
      { $match: { regionCodeStr: { $regex: "^[0-9]{1,2}$" } } },
      { $group: { _id: "$regionCodeStr", count: { $sum: 1 } } },
      { $project: { _id: 0, regionCode: "$_id", count: 1 } },
      { $sort: { count: -1 } },
      { $limit: MAX_REGIONS }
    ])
    .toArray();

  return parseRegionArray(rows);
};

export const dynamic = "force-dynamic";

export async function GET() {
  const upstreamUrl = process.env.GEOGRAPHY_REGIONS_API_URL;
  const upstreamToken = process.env.GEOGRAPHY_REGIONS_API_TOKEN;

  if (upstreamUrl) {
    try {
      const response = await fetch(upstreamUrl, {
        cache: "no-store",
        headers: upstreamToken
          ? { Authorization: `Bearer ${upstreamToken}` }
          : undefined
      });

      if (response.ok) {
        const payload = await response.json();
        const regions = parseUpstreamPayload(payload);
        if (regions.length > 0) {
          return NextResponse.json(
            { regions, source: "upstream" },
            { headers: { "Cache-Control": "no-store" } }
          );
        }
      }
    } catch {
      // Fall back to direct mongo lookup.
    }
  }

  try {
    const mongoRegions = await fetchRegionsFromMongo();
    if (mongoRegions.length > 0) {
      return NextResponse.json(
        { regions: mongoRegions, source: "mongo" },
        { headers: { "Cache-Control": "no-store" } }
      );
    }
  } catch {
    // Fall through to static fallback.
  }

  return NextResponse.json(
    { regions: FALLBACK_REGIONS, source: "fallback" },
    { headers: { "Cache-Control": "no-store" } }
  );
}
