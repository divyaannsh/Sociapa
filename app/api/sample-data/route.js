import { MongoClient, ObjectId } from "mongodb";

const MONGODB_URI =
  "mongodb+srv://bookstoreuser:bookstoreuser@cluster0.dlfwrrz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const DB_NAME = "dashboard";
const CLIENTS_COLLECTION = "clients";
const CAMPAIGNS_COLLECTION = "campaigns";

export async function POST(request) {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    const db = client.db(DB_NAME);
    
    // Get first client (or create one if none exists)
    const clientsCollection = db.collection(CLIENTS_COLLECTION);
    let clientDoc = await clientsCollection.findOne({});
    
    if (!clientDoc) {
      // Create a sample client
      const result = await clientsCollection.insertOne({
        companyName: "Test Client",
        username: "testclient",
        password: "password123",
        createdAt: new Date(),
      });
      clientDoc = { _id: result.insertedId };
    }

    // Create sample campaign data
    const sampleRows = [
      {
        "Reporting starts": "2024-01-01",
        "Amount spent (INR)": 1500.50,
        "Impressions": 45000,
        "Clicks (all)": 225,
        "CPM (cost per 1,000 impressions)": 33.34,
        "CPC (all)": 6.67,
        "Platform": "Google",
        "Results": 12
      },
      {
        "Reporting starts": "2024-01-02", 
        "Amount spent (INR)": 2200.75,
        "Impressions": 62000,
        "Clicks (all)": 310,
        "CPM (cost per 1,000 impressions)": 35.50,
        "CPC (all)": 7.10,
        "Platform": "Facebook",
        "Results": 18
      },
      {
        "Reporting starts": "2024-01-03",
        "Amount spent (INR)": 1800.25,
        "Impressions": 51000,
        "Clicks (all)": 255,
        "CPM (cost per 1,000 impressions)": 35.30,
        "CPC (all)": 7.06,
        "Platform": "LinkedIn",
        "Results": 15
      },
      {
        "Reporting starts": "2024-01-04",
        "Amount spent (INR)": 2800.00,
        "Impressions": 78000,
        "Clicks (all)": 390,
        "CPM (cost per 1,000 impressions)": 35.90,
        "CPC (all)": 7.18,
        "Platform": "Google",
        "Results": 22
      },
      {
        "Reporting starts": "2024-01-05",
        "Amount spent (INR)": 1950.50,
        "Impressions": 55000,
        "Clicks (all)": 275,
        "CPM (cost per 1,000 impressions)": 35.46,
        "CPC (all)": 7.09,
        "Platform": "Meta",
        "Results": 17
      }
    ];

    // Insert sample campaign
    const campaignsCollection = db.collection(CAMPAIGNS_COLLECTION);
    const result = await campaignsCollection.insertOne({
      clientId: clientDoc._id,
      fileName: "Sample Campaign Data",
      uploadedAt: new Date(),
      rows: sampleRows,
    });

    return new Response(
      JSON.stringify({
        message: "Sample data created successfully!",
        clientId: clientDoc._id,
        campaignId: result.insertedId,
        rowsAdded: sampleRows.length
      }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error creating sample data:", error);
    return new Response(
      JSON.stringify({ message: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  } finally {
    await client.close();
  }
}
