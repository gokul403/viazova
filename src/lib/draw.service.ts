import type { ClientSession } from "mongodb";
import { getDb } from "@/integrations/mongodb/client.server";

export type RewardName =
  | "THAILAND_FLIGHT"
  | "INR_1000_OFF"
  | "TEN_PERCENT_DISCOUNT"
  | "BETTER_LUCK_NEXT_TIME";

export type DrawServiceResult = {
  reward: RewardName;
  won: boolean;
  alreadyParticipated: boolean;
};

const BETTER_LUCK: RewardName = "BETTER_LUCK_NEXT_TIME";

function validateInput(name: string, mobile: string) {
  if (!name || name.trim().length < 2) {
    throw new Error("Invalid name");
  }
  if (!mobile || !/^[6-9][0-9]{9}$/.test(mobile)) {
    throw new Error("Invalid mobile number");
  }
}

async function claimRandomReward(session: ClientSession): Promise<RewardName> {
  const db = await getDb();
  const rewardPool = db.collection("reward_pool");

  for (let attempt = 0; attempt < 3; attempt++) {
    const [candidate] = await rewardPool
      .aggregate<{ _id: unknown; rewardName: RewardName }>(
        [{ $match: { claimed: false } }, { $sample: { size: 1 } }],
        { session },
      )
      .toArray();

    if (!candidate) {
      return BETTER_LUCK;
    }

    const update = await rewardPool.updateOne(
      { _id: candidate._id, claimed: false },
      { $set: { claimed: true, claimedAt: new Date() } },
      { session },
    );

    if (update.modifiedCount === 1) {
      return candidate.rewardName;
    }
  }

  return BETTER_LUCK;
}

export async function enterLuckyDrawService(
  name: string,
  mobile: string,
): Promise<DrawServiceResult> {
  validateInput(name, mobile);

  const db = await getDb();
  const participants = db.collection("participants");
  const client = db.client;
  const session = client.startSession();

  try {
    return await session.withTransaction(async () => {
      const existing = await participants.findOne({ mobile }, { session });
      if (existing) {
        return {
          reward: existing.reward as RewardName,
          won: existing.won,
          alreadyParticipated: true,
        };
      }

      const reward = await claimRandomReward(session);
      const won = reward !== BETTER_LUCK;

      await participants.insertOne(
        {
          createdAt: new Date(),
          name: name.trim(),
          mobile,
          reward,
          won,
        },
        { session },
      );

      return { reward, won, alreadyParticipated: false };
    });
  } finally {
    await session.endSession();
  }
}
