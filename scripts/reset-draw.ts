import { MongoClient } from "mongodb";

const DB_NAME = "viazova";

async function ensureIndexes(db: ReturnType<MongoClient["db"]>) {
  await db
    .collection("reward_pool")
    .createIndex({ claimed: 1 }, { name: "reward_pool_claimed_idx" });
  await db
    .collection("participants")
    .createIndex({ mobile: 1 }, { unique: true, name: "participants_mobile_unique" });
  await db.collection("participants").createIndex(
    { couponCode: 1 },
    { unique: true, sparse: true, name: "participants_coupon_unique" },
  );
}

async function reset() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is required");
  }

  const client = new MongoClient(uri);
  await client.connect();

  try {
    const db = client.db(DB_NAME);
    const participants = db.collection("participants");
    const rewardPool = db.collection("reward_pool");

    await ensureIndexes(db);

    const beforeParticipants = await participants.countDocuments();
    const beforeClaimed = await rewardPool.countDocuments({ claimed: true });

    console.log(`Before reset — participants: ${beforeParticipants}, claimed rewards: ${beforeClaimed}`);

    const session = client.startSession();
    try {
      await session.withTransaction(async () => {
        await participants.deleteMany({}, { session });
        await rewardPool.updateMany(
          {},
          { $set: { claimed: false }, $unset: { claimedAt: "" } },
          { session },
        );
      });
    } finally {
      await session.endSession();
    }

    const afterParticipants = await participants.countDocuments();
    const afterClaimed = await rewardPool.countDocuments({ claimed: true });

    console.log(`After reset — participants: ${afterParticipants}, claimed rewards: ${afterClaimed}`);
    console.log("Reset complete.");
  } finally {
    await client.close();
  }
}

reset().catch((error) => {
  console.error("Reset failed:", error);
  process.exit(1);
});
