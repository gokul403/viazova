import { MongoClient, type Db } from "mongodb";

const DB_NAME = "viazova";

function createMongoClient() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    const message =
      "Missing MongoDB environment variable: MONGODB_URI. Set it in .env.";
    console.error(`[MongoDB] ${message}`);
    throw new Error(message);
  }

  return new MongoClient(uri);
}

let _client: MongoClient | undefined;
let _db: Db | undefined;

async function getClient(): Promise<MongoClient> {
  if (!_client) {
    _client = createMongoClient();
    await _client.connect();
  }
  return _client;
}

export async function getDb(): Promise<Db> {
  if (!_db) {
    const client = await getClient();
    _db = client.db(DB_NAME);
  }
  return _db;
}
