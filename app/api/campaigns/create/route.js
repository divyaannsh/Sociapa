import { MongoClient, ObjectId } from "mongodb";

const MONGODB_URI =
  "mongodb+srv://bookstoreuser:bookstoreuser@cluster0.dlfwrrz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const DB_NAME = "dashboard";
const COLLECTION_NAME = "campaigns";

export async function POST(request) {
  const client = new MongoClient(MONGODB_URI);

  try {
    const body = await request.json();
    const { clientId, fileName, rows } = body;

    // Validate required fields
    if (!clientId || !fileName || !rows) {
      return new Response(
        JSON.stringify({ message: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Validate clientId is a valid ObjectId
    if (!ObjectId.isValid(clientId)) {
      return new Response(
        JSON.stringify({ message: "Invalid client ID" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Connect to MongoDB
    await client.connect();
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);

    // Insert new campaign
    const result = await collection.insertOne({
      clientId: new ObjectId(clientId),
      fileName,
      uploadedAt: new Date(),
      rows,
    });

    return new Response(
      JSON.stringify({
        message: "Campaign created successfully!",
        campaignId: result.insertedId,
      }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
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

