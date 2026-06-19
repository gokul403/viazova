import { MongoClient, type Db } from "mongodb";

const DB_NAME = "viazova";

function createMongoClient() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("Missing MONGODB_URI");

  return new MongoClient(uri, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  });
}

let _client: MongoClient | undefined;

async function getClient(): Promise<MongoClient> {
  if (_client) {
    try {
      await _client.db(DB_NAME).command({ ping: 1 });
      return _client;
    } catch {
      await _client.close().catch(() => {});
      _client = undefined;
    }
  }

  _client = createMongoClient();
  await _client.connect();
  return _client;
}

export async function getDb(): Promise<Db> {
  const client = await getClient();
  return client.db(DB_NAME);
}