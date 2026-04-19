import { MongoClient, ObjectId } from "mongodb";

const MONGODB_URI =
  "mongodb+srv://bookstoreuser:bookstoreuser@cluster0.dlfwrrz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const DB_NAME = "dashboard";
const COLLECTION_NAME = "campaigns";

export async function GET(request) {
  // Get clientId from query parameters
  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get("clientId");

  try {
    const fs = require('fs');
    const path = require('path');
    const staticDataPath = path.join(process.cwd(), 'public', 'gyan_static_data.json');
    if (fs.existsSync(staticDataPath)) {
      const staticDb = JSON.parse(fs.readFileSync(staticDataPath, 'utf-8'));
      // if we have static campaigns for this client, or just default to gyan-static-id if it's there
      const staticCampaigns = staticDb.campaignData[clientId] || staticDb.campaignData['gyan-static-id'];
      if (staticCampaigns) {
        return new Response(JSON.stringify({ campaigns: staticCampaigns }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
    }
  } catch (e) { console.error("Static data error:", e) }

  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);

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

