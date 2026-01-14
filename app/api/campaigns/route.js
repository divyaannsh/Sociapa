import { MongoClient, ObjectId } from "mongodb";

const MONGODB_URI =
  "mongodb+srv://bookstoreuser:bookstoreuser@cluster0.dlfwrrz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const DB_NAME = "dashboard";
const COLLECTION_NAME = "campaigns";

export async function GET(request) {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);

    // Get clientId from query parameters
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get("clientId");

    // Build query filter
    const query = {};
    if (clientId && ObjectId.isValid(clientId)) {
      query.clientId = new ObjectId(clientId);
    }

    // Fetch campaigns
    const campaigns = await collection.find(query).sort({ uploadedAt: -1 }).toArray();

    return new Response(JSON.stringify({ campaigns }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("API Error:", error);
    return new Response(JSON.stringify({ message: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  } finally {
    await client.close();
  }
}

