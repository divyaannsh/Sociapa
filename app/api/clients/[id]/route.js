import { MongoClient, ObjectId } from "mongodb";

const MONGODB_URI =
  "mongodb+srv://bookstoreuser:bookstoreuser@cluster0.dlfwrrz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const DB_NAME = "dashboard";
const COLLECTION_NAME = "clients";

export async function PUT(request, { params }) {
  const client = new MongoClient(MONGODB_URI);
  const { id } = params;

  try {
    const body = await request.json();
    const { companyName, username, password } = body;

    if (!companyName || !username) {
      return new Response(
        JSON.stringify({ message: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (password && password.length < 6) {
      return new Response(
        JSON.stringify({
          message: "Password must be at least 6 characters long",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    await client.connect();
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);

    // Check if username already exists (excluding current client)
    const existingClient = await collection.findOne({
      username: username.toLowerCase(),
      _id: { $ne: new ObjectId(id) },
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

    // Build update object
    const updateData = {
      companyName,
      username: username.toLowerCase(),
      updatedAt: new Date(),
    };

    // Only add password if provided
    if (password) {
      updateData.password = password;
    }

    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return new Response(JSON.stringify({ message: "Client not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ message: "Client updated successfully!" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
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

export async function DELETE(request, { params }) {
  const client = new MongoClient(MONGODB_URI);
  const { id } = params;

  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);

    const result = await collection.deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return new Response(JSON.stringify({ message: "Client not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ message: "Client deleted successfully!" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
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
