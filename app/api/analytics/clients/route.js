import { MongoClient, ObjectId } from "mongodb";

const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://bookstoreuser:bookstoreuser@cluster0.dlfwrrz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const DB_NAME = "dashboard";
const CLIENTS_COLLECTION = "clients";
const CAMPAIGNS_COLLECTION = "campaigns";

export async function GET(request) {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const clientsCollection = db.collection(CLIENTS_COLLECTION);
    const campaignsCollection = db.collection(CAMPAIGNS_COLLECTION);

    // 1. Fetch all clients
    const clients = await clientsCollection.find({}).toArray();

    // 2. Fetch all campaigns (optimization: could filter by clientIds if needed, but for now fetch all)
    const campaigns = await campaignsCollection.find({}).toArray();

    // 3. Aggregate data per client
    const clientsData = clients.map((clientDoc) => {
      const clientCampaigns = campaigns.filter(
        (c) => c.clientId && c.clientId.toString() === clientDoc._id.toString()
      );

      let totalSpend = 0;
      let totalImpressions = 0;
      let totalClicks = 0;
      const timelineMap = new Map(); // Date -> { spend, impressions, clicks }

      clientCampaigns.forEach((campaign) => {
        if (!campaign.rows || !Array.isArray(campaign.rows)) return;

        campaign.rows.forEach((row) => {
          // Parse Date
          let dateStr = row["Day"] || row["Date"] || row["date"];
          if (!dateStr) return;
          
          // Normalize date format if needed (assuming YYYY-MM-DD or similar sortable string for now)
          // If date is ISO, extract YYYY-MM-DD
          try {
             const d = new Date(dateStr);
             if (!isNaN(d.getTime())) {
                dateStr = d.toISOString().split('T')[0];
             }
          } catch (e) {
             // keep original string if parsing fails
          }

          // Parse Metrics with fallbacks
          const spend = parseFloat(row["Amount spent (INR)"] || row["Amount spent"] || 0) || 0;
          const impressions = parseFloat(row["Impressions"] || 0) || 0;
          const clicks = parseFloat(row["Clicks (all)"] || row["Clicks"] || 0) || 0;

          // Update Totals
          totalSpend += spend;
          totalImpressions += impressions;
          totalClicks += clicks;

          // Update Timeline
          if (!timelineMap.has(dateStr)) {
            timelineMap.set(dateStr, { spend: 0, impressions: 0, clicks: 0 });
          }
          const dayData = timelineMap.get(dateStr);
          dayData.spend += spend;
          dayData.impressions += impressions;
          dayData.clicks += clicks;
        });
      });

      // Calculate derived metrics
      const cpc = totalClicks > 0 ? (totalSpend / totalClicks).toFixed(2) : 0;
      const cpm = totalImpressions > 0 ? ((totalSpend * 1000) / totalImpressions).toFixed(2) : 0;

      // Format Timeline
      const timeline = Array.from(timelineMap.entries())
        .map(([date, data]) => ({
          date,
          spend: data.spend,
          impressions: data.impressions,
          clicks: data.clicks,
        }))
        .sort((a, b) => new Date(a.date) - new Date(b.date));

      return {
        id: clientDoc._id.toString(),
        name: clientDoc.companyName || clientDoc.username || "Unknown Client",
        spend: totalSpend,
        impressions: totalImpressions,
        clicks: totalClicks,
        cpc: parseFloat(cpc),
        cpm: parseFloat(cpm),
        timeline,
      };
    });

    // Sort clients by spend descending (Top Performers)
    clientsData.sort((a, b) => b.spend - a.spend);

    return new Response(JSON.stringify({ 
      clients: clientsData,
      topPerformers: clientsData
    }), {
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
