import { MongoClient } from 'mongodb';

const mongoClient = () => {
  const mongoUrl = process.env.MONGO_URL;

  return new MongoClient(mongoUrl);
};

export default mongoClient;
