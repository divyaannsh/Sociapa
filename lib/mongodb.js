import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 
  'mongodb+srv://bookstoreuser:bookstoreuser@cluster0.dlfwrrz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const DB_NAME = process.env.MONGODB_DB_NAME || 'dashboard';

// OFFLINE MODE: Provide a dummy MongoDB interface to prevent connection hangs
export async function getDb() {
  console.warn('[OFFLINE MODE] Using mocked database connection');
  return {
    collection: (name) => ({
      findOne: async () => null,
      find: () => ({ 
        sort: () => ({ 
          limit: () => ({ toArray: async () => [] }),
          toArray: async () => []
        }), 
        toArray: async () => [] 
      }),
      countDocuments: async () => 0,
      insertOne: async () => ({ insertedId: 'mock-id' }),
      updateOne: async () => ({}),
      updateMany: async () => ({}),
      deleteOne: async () => ({})
    })
  };
}

export default Promise.resolve();
