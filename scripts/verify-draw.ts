import { enterLuckyDrawService } from "../src/lib/draw.service";
import { MongoClient } from "mongodb";

async function verify() {
  const result = await enterLuckyDrawService("Test User", "9876543210");
  console.log("Draw result:", result);

  const uri = process.env.MONGODB_URI!;
  const client = new MongoClient(uri);
  await client.connect();
  try {
    const db = client.db("viazova");
    const participants = await db.collection("participants").countDocuments();
    const claimed = await db.collection("reward_pool").countDocuments({
      claimed: true,
    });
    console.log(`Participants: ${participants}, Claimed rewards: ${claimed}`);
  } finally {
    await client.close();
  }
}

verify().catch((error) => {
  console.error("Verify failed:", error);
  process.exit(1);
});
