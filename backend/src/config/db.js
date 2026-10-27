import mongoose from 'mongoose';

let isConnected = false;
let inMemoryStore = {
  events: [],
  recaps: [],
  datasets: [],
  userPreferences: []
};

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/omnipitch';
  try {
    mongoose.set('strictQuery', false);
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000
    });
    isConnected = true;
    console.log(`[MongoDB] Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`[MongoDB Warning] Could not connect to MongoDB at ${uri}. Running with in-memory resilient data store.`);
    isConnected = false;
  }
};

export const getDBStatus = () => ({
  connected: isConnected,
  type: isConnected ? 'MongoDB' : 'In-Memory Store',
  itemCounts: {
    events: inMemoryStore.events.length,
    recaps: inMemoryStore.recaps.length,
    datasets: inMemoryStore.datasets.length
  }
});

export const getInMemoryStore = () => inMemoryStore;
