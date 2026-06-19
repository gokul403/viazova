import { MongoClient, type Db } from "mongodb";

const DB_NAME = "viazova";

function createMongoClient(): MongoClient {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("Missing MONGODB_URI");
  }

  return new MongoClient(uri, {
    maxPoolSize: 1,
    minPoolSize: 0,
    connectTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    serverSelectionTimeoutMS: 10000,
  });
}

let client: MongoClient | undefined;
let db: Db | undefined;

async function getClient(): Promise<MongoClient> {
  if (!client) {
    client = createMongoClient();
    await client.connect();
  }
  return client;
}

export async function getDb(): Promise<Db> {
  if (!db) {
    db = (await getClient()).db(DB_NAME);
  }
  return db;
}

export async function connectDb(): Promise<{ db: Db; client: MongoClient }> {
  const connectedClient = await getClient();
  return { db: await getDb(), client: connectedClient };
}
