import { MongoClient, ObjectId } from "mongodb";

const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://bookstoreuser:bookstoreuser@cluster0.dlfwrrz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const DB_NAME = "dashboard";
const COLLECTION_NAME = "campaigns";

export async function PUT(request) {
  const client = new MongoClient(MONGODB_URI);

  try {
    const body = await request.json();
    const { clientId, platform, newCPM } = body;

    // Validate required fields
    if (!clientId || !platform || newCPM === undefined || newCPM === null) {
      return new Response(
        JSON.stringify({ message: "Missing required fields: clientId, platform, and newCPM" }),
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

    // Validate newCPM is a valid number
    const cpmValue = parseFloat(newCPM);
    if (isNaN(cpmValue) || cpmValue < 0) {
      return new Response(
        JSON.stringify({ message: "Invalid CPM value. Must be a positive number." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    await client.connect();
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);

    // Find all campaigns for this client
    const campaigns = await collection.find({
      clientId: new ObjectId(clientId),
    }).toArray();

    let totalRowsUpdated = 0;
    let campaignsUpdated = 0;

    // Update rows in each campaign
    for (const campaign of campaigns) {
      if (!campaign.rows || !Array.isArray(campaign.rows)) {
        continue;
      }

      let campaignModified = false;
      const updatedRows = campaign.rows.map((row) => {
        // Check if this row belongs to the platform we're updating
        const rowPlatform = (row["Platform"] || row["platform"] || "").toString().trim();
        if (rowPlatform.toLowerCase() !== platform.toLowerCase()) {
          return row;
        }

        // Get current impressions, clicks, and engagements (keep these unchanged)
        const currentImpressions = parseFloat(row["Impressions"] || 0);
        const currentClicks = parseFloat(row["Clicks (all)"] || row["Clicks"] || 0);
        const currentEngagements = parseFloat(row["Page engagement"] || row["Post engagements"] || row["Engagements"] || 0);

        if (isNaN(currentImpressions) || currentImpressions <= 0) {
          return row; // Skip rows with invalid impressions
        }

        // Recalculate Spend based on new CPM and keep Impressions unchanged
        // Formula: CPM = (Spend × 1000) / Impressions
        // Therefore: Spend = (CPM × Impressions) / 1000
        const newSpend = (cpmValue * currentImpressions) / 1000;

        // Recalculate CPC based on new Spend (keep Clicks unchanged)
        // Formula: CPC = Spend / Clicks
        const newCPC = currentClicks > 0 ? newSpend / currentClicks : 0;

        // Create updated row
        const updatedRow = { ...row };

        // Update CPM field (try different possible field names)
        if (row["CPM (cost per 1,000 impressions)"]) {
          updatedRow["CPM (cost per 1,000 impressions)"] = cpmValue;
        } else if (row["CPM"]) {
          updatedRow["CPM"] = cpmValue;
        } else {
          // Add CPM field if it doesn't exist
          updatedRow["CPM"] = cpmValue;
        }

        // Update Spend (recalculated based on new CPM)
        if (row["Amount spent (INR)"]) {
          updatedRow["Amount spent (INR)"] = newSpend;
        } else if (row["Amount spent"]) {
          updatedRow["Amount spent"] = newSpend;
        } else {
          updatedRow["Amount spent"] = newSpend;
        }

        // Keep Impressions unchanged
        // (Already in row, no need to update)

        // Keep Clicks unchanged
        // (Already in row, no need to update)

        // Keep Engagements unchanged
        // (Already in row, no need to update)

        // Update CPC (recalculated based on new Spend)
        if (row["CPC (cost per click)"]) {
          updatedRow["CPC (cost per click)"] = newCPC;
        } else if (row["CPC (all)"]) {
          updatedRow["CPC (all)"] = newCPC;
        } else if (row["CPC"]) {
          updatedRow["CPC"] = newCPC;
        } else {
          updatedRow["CPC"] = newCPC;
        }

        campaignModified = true;
        totalRowsUpdated++;

        return updatedRow;
      });

      // Update campaign in database if any rows were modified
      if (campaignModified) {
        await collection.updateOne(
          { _id: campaign._id },
          { $set: { rows: updatedRows } }
        );
        campaignsUpdated++;
      }
    }

    return new Response(
      JSON.stringify({
        message: "Campaign rows updated successfully",
        rowsUpdated: totalRowsUpdated,
        campaignsUpdated: campaignsUpdated,
      }),
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

