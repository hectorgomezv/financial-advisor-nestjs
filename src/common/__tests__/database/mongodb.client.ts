import { MongoClient } from 'mongodb';
import { Mongoose } from 'mongoose';

export class MongoDBClient {
  private client: MongoClient;

  async getCollection(name: string) {
    await this.initClient();
    const db = await this.client.db(process.env.MONGO_DATABASE_NAME);
    return db.collection(name);
  }

  async close() {
    return this.client.close();
  }

  private async initClient(): Promise<MongoClient> {
    if (this.client) {
      return this.client;
    }

    const mongoose = new Mongoose();
    const conn = await mongoose.createConnection(
      `${process.env.MONGO_CONNECTION_STRING}/${process.env.MONGO_DATABASE_NAME}`,
    );
    this.client = await conn.getClient();
    return this.client;
  }
}
