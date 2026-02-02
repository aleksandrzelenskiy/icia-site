import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

export const dynamic = "force-dynamic";

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || "ciwork";
const API_TOKEN = process.env.GEOGRAPHY_REGIONS_API_TOKEN;

let clientPromise: Promise<MongoClient> | null = null;

function getClient() {
    if (!MONGODB_URI) throw new Error("MONGODB_URI is not set");
    if (!clientPromise) {
        clientPromise = new MongoClient(MONGODB_URI).connect();
    }
    return clientPromise;
}

function isAuthorized(req: Request) {
    if (!API_TOKEN) return false;
    const header = req.headers.get("authorization");
    return header === `Bearer ${API_TOKEN}`;
}

export async function GET(req: Request) {
    if (!isAuthorized(req)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const client = await getClient();
        const db = client.db(MONGODB_DB_NAME);

        const regions = await db.collection("users").aggregate([
            { $match: { regionCode: { $type: "string", $regex: "^[0-9]{1,2}$" } } },
            {
                $project: {
                    regionCode: { $substrCP: [{ $concat: ["0", "$regionCode"] }, -2,
                            2] }
                }
            },
            { $group: { _id: "$regionCode", count: { $sum: 1 } } },
            { $project: { _id: 0, regionCode: "$_id", count: 1 } },
            { $sort: { count: -1 } }
        ]).toArray();

        return NextResponse.json(
            { regions },
            { headers: { "Cache-Control": "no-store" } }
        );
    } catch (error) {
        console.error("geography regions api error", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status:
                500 });
    }
}