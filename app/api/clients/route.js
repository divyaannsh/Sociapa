import { MongoClient, ObjectId } from "mongodb";

const MONGODB_URI =
  "mongodb+srv://bookstoreuser:bookstoreuser@cluster0.dlfwrrz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const DB_NAME = "dashboard";
const COLLECTION_NAME = "clients";

export async function GET(request) {
  try {
    const fs = require('fs');
    const path = require('path');
    const staticDataPath = path.join(process.cwd(), 'public', 'gyan_static_data.json');
    if (fs.existsSync(staticDataPath)) {
      const staticDb = JSON.parse(fs.readFileSync(staticDataPath, 'utf-8'));
      return new Response(JSON.stringify({ clients: staticDb.clients }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
  } catch (e) { console.error("Static DB reading error:", e); }

  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);

    const clients = await collection.find({}).toArray();

    return new Response(JSON.stringify({ clients }), {
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

export async function POST(request) {
  const client = new MongoClient(MONGODB_URI);

  try {
    // Parse request body
    const body = await request.json();
    const { companyName, username, password } = body;

    // Validate required fields
    if (!companyName || !username || !password) {
      return new Response(
        JSON.stringify({ message: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Connect to MongoDB
    await client.connect();
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);

    // Check if username already exists
    const existingClient = await collection.findOne({
      username: username.toLowerCase(),
    });
    if (existingClient) {
      return new Response(
        JSON.stringify({
          message:
            "Username already exists. Please choose a different username.",
        }),
        { status: 409, headers: { "Content-Type": "application/json" } }
      );
    }

    // Insert new client
    const result = await collection.insertOne({
      companyName,
      username: username.toLowerCase(),
      password,
      createdAt: new Date(),
    });

    return new Response(
      JSON.stringify({
        message: "Client created successfully!",
        clientId: result.insertedId,
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
