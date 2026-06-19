import { MongoClient } from "mongodb";

const DB_NAME = "viazova";

const REWARD_SEED: Array<{ rewardName: string; count: number }> = [
  { rewardName: "THAILAND_FLIGHT", count: 1 },
  { rewardName: "INR_1000_OFF", count: 200 },
  { rewardName: "TEN_PERCENT_DISCOUNT", count: 50 },
  { rewardName: "BETTER_LUCK_NEXT_TIME", count: 49 },
];

async function ensureIndexes(db: ReturnType<MongoClient["db"]>) {
  await db
    .collection("reward_pool")
    .createIndex({ claimed: 1 }, { name: "reward_pool_claimed_idx" });
  await db
    .collection("participants")
    .createIndex({ mobile: 1 }, { unique: true, name: "participants_mobile_unique" });
}

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is required");
  }

  const client = new MongoClient(uri);
  await client.connect();

  try {
    const db = client.db(DB_NAME);
    const rewardPool = db.collection("reward_pool");

    await ensureIndexes(db);

    const existing = await rewardPool.countDocuments();
    if (existing > 0) {
      console.log(`reward_pool already has ${existing} documents — skipping seed`);
      return;
    }

    const documents = REWARD_SEED.flatMap(({ rewardName, count }) =>
      Array.from({ length: count }, () => ({
        rewardName,
        claimed: false,
      })),
    );

    await rewardPool.insertMany(documents);
    console.log(`Seeded ${documents.length} reward_pool documents`);
  } finally {
    await client.close();
  }
}

seed().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
