"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import PageHeader from "../../../components/PageHeader";
import ClientSelector from "../../../components/ClientSelector";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Dynamically import ChartWrapper to avoid SSR issues
const ChartWrapper = dynamic(() => import("./ChartWrapper"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        height: "350px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#666",
      }}
    >
      Loading chart...
    </div>
  ),
});

export default function CampaignsAll() {
  const [clients, setClients] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingCampaigns, setLoadingCampaigns] = useState(false);
  const [error, setError] = useState("");
  const [selectedClientId, setSelectedClientId] = useState("");
  const [selectedCampaignId, setSelectedCampaignId] = useState("");
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [campaignToDelete, setCampaignToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [editingCPM, setEditingCPM] = useState(null);
  const [cpmEditValue, setCpmEditValue] = useState("");
  const [updatingCPM, setUpdatingCPM] = useState(false);
  const [viewMode, setViewMode] = useState("viewData"); // "viewData" or "compareData"
  const [activeTab, setActiveTab] = useState("overview");
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [appliedDateRange, setAppliedDateRange] = useState({ start: null, end: null });
  const [mounted, setMounted] = useState(false);

  // Set mounted state
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleClientDataChange = (clientData) => {
    if (clientData) {
      console.log("📊 Client data populated:", clientData);
      // The campaigns are already being fetched by the existing useEffect
      // This handler can be used for additional client-specific logic
    }
  };

  const fetchClients = async () => {
    try {
      const response = await fetch("/api/clients");
      const data = await response.json();
      if (response.ok) {
        const clientsData = data.clients || [];
        console.log("📊 Clients data from DB:", clientsData);
        
        // Log schema structure
        if (clientsData.length > 0) {
          console.log("📋 Client Schema Structure:", {
            _id: "ObjectId (MongoDB ID)",
            companyName: "string (required)",
            username: "string (required, lowercase)",
            password: "string (required)",
            createdAt: "Date (ISO string)",
            updatedAt: "Date (ISO string) - optional"
          });
          console.log("📋 Sample Client Object:", clientsData[0]);
          console.log("📋 All Client Fields:", Object.keys(clientsData[0] || {}));
        }
        
        setClients(clientsData);
      } else {
        console.error("❌ Failed to load clients:", data);
        setError("Failed to load clients");
      }
    } catch (err) {
      console.error("❌ Error fetching clients:", err);
      setError("Failed to load clients");
    } finally {
      setLoading(false);
    }
  };

  const fetchCampaigns = useCallback(async (clientId) => {
    setLoadingCampaigns(true);
    setError("");
    console.log("🔍 Fetching campaigns for client ID:", clientId);
    try {
      const response = await fetch(`/api/campaigns?clientId=${clientId}`);
      const data = await response.json();
      if (response.ok) {
        const fetchedCampaigns = data.campaigns || [];
        console.log("📈 Campaigns data from DB:", fetchedCampaigns);
        console.log("📈 Total campaigns found:", fetchedCampaigns.length);
        
        // Log schema structure
        if (fetchedCampaigns.length > 0) {
          const firstCampaign = fetchedCampaigns[0];
          console.log("📋 Campaign Schema Structure:", {
            _id: "ObjectId (MongoDB ID)",
            clientId: "ObjectId (Reference to clients collection)",
            fileName: "string (required)",
            uploadedAt: "Date (ISO string)",
            rows: "Array of objects (campaign data rows from Excel)"
          });
          console.log("📋 Sample Campaign Object:", firstCampaign);
          console.log("📋 Campaign Top-Level Fields:", Object.keys(firstCampaign || {}));
          
          // Log rows schema if available
          if (firstCampaign.rows && firstCampaign.rows.length > 0) {
            const firstRow = firstCampaign.rows[0];
            console.log("📋 Campaign Row Schema:", {
              structure: "Object with dynamic keys from Excel headers",
              sampleRow: firstRow,
              rowKeys: Object.keys(firstRow || {}),
              totalRows: firstCampaign.rows.length,
              note: "Each row is an object where keys are Excel column headers and values are cell data"
            });
            console.log("📋 Sample Row Data:", firstRow);
            console.log("📋 All Row Field Names:", Object.keys(firstRow || {}));
          }
        }
        
        setCampaigns(fetchedCampaigns);
        // Auto-select "All" option by default
        setSelectedCampaignId((prevId) => {
          if (fetchedCampaigns.length > 0 && !prevId) {
            console.log("✅ Auto-selected 'All' campaigns");
            return "all";
          }
          return prevId || "all";
        });
      } else {
        console.error("❌ Failed to load campaigns:", data);
        setError("Failed to load campaigns");
      }
    } catch (err) {
      console.error("❌ Error fetching campaigns:", err);
      setError("Failed to load campaigns");
    } finally {
      setLoadingCampaigns(false);
    }
  }, []);

  // Fetch clients on component mount
  useEffect(() => {
    fetchClients();
  }, []);

  // Fetch campaigns when client is selected
  useEffect(() => {
    if (selectedClientId) {
      const selectedClient = clients.find((c) => c._id === selectedClientId);
      console.log("👤 Client selected:", {
        clientId: selectedClientId,
        clientName: selectedClient?.companyName || selectedClient?.username,
        clientData: selectedClient
      });
      fetchCampaigns(selectedClientId);
    } else {
      console.log("🔄 Client deselected, clearing campaigns");
      setCampaigns([]);
      setSelectedCampaignId("");
    }
  }, [selectedClientId, fetchCampaigns, clients]);

  // Filter campaigns based on selection and date range
  const filteredCampaigns = useMemo(() => {
    if (!campaigns || campaigns.length === 0) {
      return [];
    }
    
    let filtered = [];
    
    // If "All" is selected, return all campaigns
    if (selectedCampaignId === "all" || !selectedCampaignId) {
      filtered = campaigns;
    } else {
      // Otherwise, return only the selected campaign
      const selectedCampaign = campaigns.find((c) => c._id === selectedCampaignId);
      filtered = selectedCampaign ? [selectedCampaign] : [];
    }
    
    // Apply date range filter if dates are set
    if (appliedDateRange.start && appliedDateRange.end) {
      const startDate = new Date(appliedDateRange.start);
      const endDate = new Date(appliedDateRange.end);
      // Set time to start/end of day for proper comparison
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      
      filtered = filtered.map(campaign => {
        if (!campaign.rows || !Array.isArray(campaign.rows)) {
          return campaign;
        }
        
        const filteredRows = campaign.rows.filter(row => {
          // Try to get date from various fields
          let dateStr = row["Reporting starts"] || row["date"] || row["Date"] || row["Reporting ends"];
          
          if (!dateStr) {
            // If no date in row, use campaign upload date
            dateStr = campaign.uploadedAt;
          }
          
          let rowDate;
          if (typeof dateStr === 'string') {
            rowDate = new Date(dateStr);
          } else if (dateStr instanceof Date) {
            rowDate = dateStr;
          } else {
            return false; // Skip rows without valid dates
          }
          
          if (isNaN(rowDate.getTime())) {
            return false;
          }
          
          rowDate.setHours(0, 0, 0, 0);
          return rowDate >= startDate && rowDate <= endDate;
        });
        
        return {
          ...campaign,
          rows: filteredRows
        };
      }).filter(campaign => campaign.rows && campaign.rows.length > 0); // Remove campaigns with no rows after filtering
    }
    
    return filtered;
  }, [campaigns, selectedCampaignId, appliedDateRange]);

  // Update selected campaign when campaign ID changes
  useEffect(() => {
    if (selectedCampaignId && selectedCampaignId !== "all" && campaigns.length > 0) {
      const campaign = campaigns.find((c) => c._id === selectedCampaignId);
      if (campaign) {
        console.log("🎯 Campaign selected:", {
          campaignId: selectedCampaignId,
          campaignName: campaign.fileName,
          campaignData: campaign,
          totalRows: campaign.rows?.length || 0
        });
        
        // Log detailed campaign schema
        console.log("📊 Selected Campaign Full Schema:", {
          _id: campaign._id,
          clientId: campaign.clientId,
          fileName: campaign.fileName,
          uploadedAt: campaign.uploadedAt,
          rowsCount: campaign.rows?.length || 0,
          rowsStructure: campaign.rows && campaign.rows.length > 0 
            ? {
                sampleRow: campaign.rows[0],
                allRowKeys: Object.keys(campaign.rows[0] || {}),
                note: "Rows array contains objects with dynamic keys from Excel columns"
              }
            : "No rows data"
        });
      }
      setSelectedCampaign(campaign || null);
    } else {
      setSelectedCampaign(null);
    }
  }, [selectedCampaignId, campaigns]);

  const openViewModal = (campaign) => {
    setSelectedCampaign(campaign);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedCampaign(null);
  };

  const handleDeleteClick = () => {
    if (selectedCampaignId && campaigns.length > 0) {
      const campaign = campaigns.find((c) => c._id === selectedCampaignId);
      if (campaign) {
        setCampaignToDelete(campaign);
        setShowDeleteModal(true);
      }
    }
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setCampaignToDelete(null);
  };

  const handleDeleteConfirm = async () => {
    if (!campaignToDelete) return;

    setDeleting(true);
    setError("");

    try {
      const response = await fetch(`/api/campaigns/${campaignToDelete._id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to delete campaign");
        setDeleting(false);
        return;
      }

      // Remove campaign from local state
      const updatedCampaigns = campaigns.filter((c) => c._id !== campaignToDelete._id);
      setCampaigns(updatedCampaigns);
      
      // Clear selected campaign if it was deleted
      if (selectedCampaignId === campaignToDelete._id) {
        setSelectedCampaignId("");
        setSelectedCampaign(null);
      }

      // Auto-select first campaign if available
      if (updatedCampaigns.length > 0) {
        setSelectedCampaignId(updatedCampaigns[0]._id);
      }

      closeDeleteModal();
    } catch (err) {
      console.error("Error deleting campaign:", err);
      setError("An error occurred while deleting the campaign");
    } finally {
      setDeleting(false);
    }
  };

  const handleCPMEdit = (platform, currentCPM) => {
    setEditingCPM(platform);
    setCpmEditValue(currentCPM.toString());
  };

  const handleCPMCancel = () => {
    setEditingCPM(null);
    setCpmEditValue("");
  };

  const handleCPMSave = async (platform) => {
    const newCPM = parseFloat(cpmEditValue);
    
    if (isNaN(newCPM) || newCPM < 0) {
      setError("Please enter a valid CPM value (must be a positive number)");
      return;
    }

    setUpdatingCPM(true);
    setError("");

    try {
      const response = await fetch("/api/campaigns/update-rows", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: selectedClientId,
          platform: platform,
          newCPM: newCPM,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to update CPM");
        setUpdatingCPM(false);
        return;
      }

      // Refresh campaigns to get updated data
      await fetchCampaigns(selectedClientId);
      
      setEditingCPM(null);
      setCpmEditValue("");
      
      // Data will automatically refresh and show updated values
    } catch (err) {
      console.error("Error updating CPM:", err);
      setError("An error occurred while updating CPM");
    } finally {
      setUpdatingCPM(false);
    }
  };

  const getSelectedClientName = () => {
    if (!selectedClientId) return "";
    const client = clients.find((c) => c._id === selectedClientId);
    return client ? client.companyName || client.username : "";
  };

  // Calculate aggregated metrics from filtered campaigns
  const aggregatedMetrics = useMemo(() => {
    if (!filteredCampaigns || filteredCampaigns.length === 0) {
      return null;
    }

    let totalSpend = 0;
    let totalImpressions = 0;
    let totalEngagements = 0;
    let totalClicks = 0;
    let totalConversions = 0;
    let totalCPM = 0;
    let totalCPC = 0;
    let cpmCount = 0;
    let cpcCount = 0;

    filteredCampaigns.forEach((campaign) => {
      if (campaign.rows && campaign.rows.length > 0) {
        campaign.rows.forEach((row) => {
          // Amount spent
          const spend = parseFloat(row["Amount spent (INR)"] || row["Amount spent"] || 0);
          if (!isNaN(spend)) totalSpend += spend;

          // Impressions
          const impressions = parseFloat(row["Impressions"] || 0);
          if (!isNaN(impressions)) totalImpressions += impressions;

          // Engagements (try different field names)
          const engagements = parseFloat(
            row["Page engagement"] || 
            row["Post engagements"] || 
            row["Engagements"] || 
            0
          );
          if (!isNaN(engagements)) totalEngagements += engagements;

          // Clicks
          const clicks = parseFloat(row["Clicks (all)"] || row["Clicks"] || 0);
          if (!isNaN(clicks)) totalClicks += clicks;

          // Conversions
          const conversions = parseFloat(row["Results"] || row["Web Conversions"] || 0);
          if (!isNaN(conversions)) totalConversions += conversions;

          // CPM
          const cpm = parseFloat(row["CPM (cost per 1,000 impressions)"] || row["CPM"] || 0);
          if (!isNaN(cpm) && cpm > 0) {
            totalCPM += cpm;
            cpmCount++;
          }

          // CPC
          const cpc = parseFloat(row["CPC (all)"] || row["CPC"] || 0);
          if (!isNaN(cpc) && cpc > 0) {
            totalCPC += cpc;
            cpcCount++;
          }
        });
      }
    });

    // Calculate averages or derived metrics
    const avgCPM = cpmCount > 0 ? totalCPM / cpmCount : totalImpressions > 0 ? (totalSpend / totalImpressions) * 1000 : 0;
    const avgCPC = cpcCount > 0 ? totalCPC / cpcCount : totalClicks > 0 ? totalSpend / totalClicks : 0;
    const cpe = totalEngagements > 0 ? totalSpend / totalEngagements : 0;
    const cpcon = totalConversions > 0 ? totalSpend / totalConversions : null;
    
    // Additional digital marketing formulas
    // CTR (Click-Through Rate) = (Clicks / Impressions) × 100
    const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
    
    // Conversion Rate = (Conversions / Clicks) × 100
    const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;
    
    // Engagement Rate (adapted) = (Engagements / Impressions) × 100
    const engagementRate = totalImpressions > 0 ? (totalEngagements / totalImpressions) * 100 : 0;

    return {
      totalSpend,
      totalImpressions,
      avgCPM,
      totalEngagements,
      cpe,
      totalClicks,
      avgCPC,
      ctr,
      totalConversions,
      conversionRate,
      cpcon,
      engagementRate,
    };
  }, [filteredCampaigns]);

  // Format number with Indian currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Format large numbers
  const formatNumber = (num) => {
    if (num >= 10000000) {
      return (num / 10000000).toFixed(2) + "Cr";
    } else if (num >= 100000) {
      return (num / 100000).toFixed(2) + "L";
    } else if (num >= 1000) {
      return (num / 1000).toFixed(2) + "K";
    }
    return num.toLocaleString("en-IN");
  };

  // Format percentage
  const formatPercentage = (num) => {
    return num.toFixed(2) + "%";
  };

  // Calculate monthly data for impressions chart
  const monthlyData = useMemo(() => {
    if (!filteredCampaigns || filteredCampaigns.length === 0) {
      return [];
    }

    const monthlyMap = new Map();

    filteredCampaigns.forEach((campaign) => {
      if (campaign.rows && campaign.rows.length > 0) {
        campaign.rows.forEach((row) => {
          // Try to get date from various fields
          let dateStr = row["Reporting starts"] || row["date"] || row["Date"] || row["Reporting ends"];
          
          if (!dateStr) {
            // If no date in row, use campaign upload date
            dateStr = campaign.uploadedAt;
          }

          let date;
          if (typeof dateStr === 'string') {
            date = new Date(dateStr);
          } else if (dateStr instanceof Date) {
            date = dateStr;
          } else {
            return; // Skip if no valid date
          }

          if (isNaN(date.getTime())) {
            return; // Skip invalid dates
          }

          // Get month key (YYYY-MM format)
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          const monthLabel = date.toLocaleDateString("en-US", { month: "short", year: "numeric" }).toUpperCase().replace(',', '');

          if (!monthlyMap.has(monthKey)) {
            monthlyMap.set(monthKey, {
              monthKey,
              monthLabel,
              spend: 0,
              impressions: 0,
            });
          }

          const monthData = monthlyMap.get(monthKey);

          // Amount spent
          const spend = parseFloat(row["Amount spent (INR)"] || row["Amount spent"] || 0);
          if (!isNaN(spend)) monthData.spend += spend;

          // Impressions
          const impressions = parseFloat(row["Impressions"] || 0);
          if (!isNaN(impressions)) monthData.impressions += impressions;
        });
      }
    });

    // Convert to array and sort by month
    const sortedData = Array.from(monthlyMap.values()).sort((a, b) => 
      a.monthKey.localeCompare(b.monthKey)
    );

    return sortedData;
  }, [filteredCampaigns]);

  // Calculate monthly conversion data
  const monthlyConversionData = useMemo(() => {
    if (!filteredCampaigns || filteredCampaigns.length === 0) {
      return [];
    }

    const monthlyMap = new Map();

    filteredCampaigns.forEach((campaign) => {
      if (campaign.rows && campaign.rows.length > 0) {
        campaign.rows.forEach((row) => {
          // Try to get date from various fields
          let dateStr = row["Reporting starts"] || row["date"] || row["Date"] || row["Reporting ends"];
          
          if (!dateStr) {
            dateStr = campaign.uploadedAt;
          }

          let date;
          if (typeof dateStr === 'string') {
            date = new Date(dateStr);
          } else if (dateStr instanceof Date) {
            date = dateStr;
          } else {
            return;
          }

          if (isNaN(date.getTime())) {
            return;
          }

          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          const monthLabel = date.toLocaleDateString("en-US", { month: "short", year: "numeric" }).toUpperCase().replace(',', '');

          if (!monthlyMap.has(monthKey)) {
            monthlyMap.set(monthKey, {
              monthKey,
              monthLabel,
              spend: 0,
              conversions: 0,
            });
          }

          const monthData = monthlyMap.get(monthKey);

          // Amount spent
          const spend = parseFloat(row["Amount spent (INR)"] || row["Amount spent"] || 0);
          if (!isNaN(spend)) monthData.spend += spend;

          // Conversions
          const conversions = parseFloat(row["Results"] || row["Web Conversions"] || 0);
          if (!isNaN(conversions)) monthData.conversions += conversions;
        });
      }
    });

    const sortedData = Array.from(monthlyMap.values()).sort((a, b) => 
      a.monthKey.localeCompare(b.monthKey)
    );

    return sortedData;
  }, [filteredCampaigns]);

  // Calculate performance by platform
  const platformPerformance = useMemo(() => {
    if (!filteredCampaigns || filteredCampaigns.length === 0) {
      return [];
    }

    const platformMap = new Map();

    filteredCampaigns.forEach((campaign) => {
      if (campaign.rows && campaign.rows.length > 0) {
        campaign.rows.forEach((row) => {
          const platform = (row["Platform"] || row["platform"] || "").toString().trim();
          if (!platform || platform === "" || platform.toLowerCase() === "all") return;

          if (!platformMap.has(platform)) {
            platformMap.set(platform, {
              name: platform,
              spend: 0,
              impressions: 0,
              clicks: 0,
              engagements: 0,
              conversions: 0,
            });
          }

          const platformData = platformMap.get(platform);

          const spend = parseFloat(row["Amount spent (INR)"] || row["Amount spent"] || 0);
          if (!isNaN(spend)) platformData.spend += spend;

          const impressions = parseFloat(row["Impressions"] || 0);
          if (!isNaN(impressions)) platformData.impressions += impressions;

          const clicks = parseFloat(row["Clicks (all)"] || row["Clicks"] || 0);
          if (!isNaN(clicks)) platformData.clicks += clicks;

          const engagements = parseFloat(row["Page engagement"] || row["Post engagements"] || 0);
          if (!isNaN(engagements)) platformData.engagements += engagements;

          const conversions = parseFloat(row["Results"] || row["Web Conversions"] || 0);
          if (!isNaN(conversions)) platformData.conversions += conversions;
        });
      }
    });

    return Array.from(platformMap.values())
      .map(p => ({
        ...p,
        cpm: p.impressions > 0 ? (p.spend / p.impressions) * 1000 : 0,
        cpc: p.clicks > 0 ? p.spend / p.clicks : 0,
        cpe: p.engagements > 0 ? p.spend / p.engagements : 0,
        cpcon: p.conversions > 0 ? p.spend / p.conversions : null,
      }))
      .sort((a, b) => b.spend - a.spend);
  }, [filteredCampaigns]);

  // Calculate totals for platform performance
  const platformTotals = useMemo(() => {
    if (!platformPerformance || platformPerformance.length === 0) {
      return null;
    }

    const totals = platformPerformance.reduce((acc, platform) => {
      acc.spend += platform.spend;
      acc.impressions += platform.impressions;
      acc.clicks += platform.clicks;
      acc.engagements += platform.engagements;
      return acc;
    }, { spend: 0, impressions: 0, clicks: 0, engagements: 0 });

    // Calculate overall CPM and CPC from totals
    totals.cpm = totals.impressions > 0 ? (totals.spend / totals.impressions) * 1000 : 0;
    totals.cpc = totals.clicks > 0 ? totals.spend / totals.clicks : 0;

    return totals;
  }, [platformPerformance]);

  // Calculate top performing campaigns
  const topCampaigns = useMemo(() => {
    if (!campaigns || campaigns.length === 0) {
      return [];
    }

    const campaignPerformance = filteredCampaigns.map((campaign) => {
      let spend = 0;
      let impressions = 0;
      let clicks = 0;
      let engagements = 0;
      let conversions = 0;

      if (campaign.rows && campaign.rows.length > 0) {
        campaign.rows.forEach((row) => {
          const rowSpend = parseFloat(row["Amount spent (INR)"] || row["Amount spent"] || 0);
          if (!isNaN(rowSpend)) spend += rowSpend;

          const rowImpressions = parseFloat(row["Impressions"] || 0);
          if (!isNaN(rowImpressions)) impressions += rowImpressions;

          const rowClicks = parseFloat(row["Clicks (all)"] || row["Clicks"] || 0);
          if (!isNaN(rowClicks)) clicks += rowClicks;

          const rowEngagements = parseFloat(row["Page engagement"] || row["Post engagements"] || 0);
          if (!isNaN(rowEngagements)) engagements += rowEngagements;

          const rowConversions = parseFloat(row["Results"] || row["Web Conversions"] || 0);
          if (!isNaN(rowConversions)) conversions += rowConversions;
        });
      }

      return {
        name: campaign.fileName,
        spend,
        impressions,
        clicks,
        engagements,
        conversions,
        cpm: impressions > 0 ? (spend / impressions) * 1000 : 0,
        cpc: clicks > 0 ? spend / clicks : 0,
        cpe: engagements > 0 ? spend / engagements : 0,
        cpcon: conversions > 0 ? spend / conversions : null,
      };
    });

    return campaignPerformance
      .sort((a, b) => b.spend - a.spend)
      .slice(0, 10); // Top 10 campaigns
  }, [filteredCampaigns]);

  // Calculate totals for top performing campaigns
  const topCampaignsTotals = useMemo(() => {
    if (!topCampaigns || topCampaigns.length === 0) {
      return null;
    }

    const totals = topCampaigns.reduce((acc, campaign) => {
      acc.spend += campaign.spend;
      acc.impressions += campaign.impressions;
      acc.clicks += campaign.clicks;
      acc.engagements += campaign.engagements;
      return acc;
    }, { spend: 0, impressions: 0, clicks: 0, engagements: 0 });

    // Calculate overall CPC from totals
    totals.cpc = totals.clicks > 0 ? totals.spend / totals.clicks : 0;

    return totals;
  }, [topCampaigns]);

  // Calculate impressions breakdown by type
  const impressionsBreakdown = useMemo(() => {
    if (!campaigns || campaigns.length === 0) {
      return null;
    }

    let totalImpressions = 0;
    let platformImpressions = {};

    filteredCampaigns.forEach((campaign) => {
      if (campaign.rows && campaign.rows.length > 0) {
        campaign.rows.forEach((row) => {
          // Total Impressions
          const impressions = parseFloat(row["Impressions"] || 0);
          if (!isNaN(impressions)) {
            totalImpressions += impressions;

            // Platform breakdown
            const platform = (row["Platform"] || row["platform"] || "").toString().trim();
            if (platform && platform !== "" && platform.toLowerCase() !== "all" && platform.toLowerCase() !== "unknown") {
              platformImpressions[platform] = (platformImpressions[platform] || 0) + impressions;
            }
          }
        });
      }
    });

    // Get top platforms (limit to top 3, sorted by value)
    const topPlatforms = Object.entries(platformImpressions)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([name, value]) => ({ name, value }));

    // Find max value for percentage calculation (use total as max for proper scaling)
    const maxValue = totalImpressions > 0 ? totalImpressions : 1;

    return {
      totalImpressions: {
        value: totalImpressions,
        percentage: 100, // Total is always 100%
      },
      platforms: topPlatforms.map(p => ({
        name: p.name,
        value: p.value,
        percentage: maxValue > 0 ? (p.value / maxValue) * 100 : 0,
      })),
    };
  }, [filteredCampaigns]);

  // Calculate monthly engagement data
  const monthlyEngagementData = useMemo(() => {
    if (!filteredCampaigns || filteredCampaigns.length === 0) {
      return [];
    }

    const monthlyMap = new Map();

    filteredCampaigns.forEach((campaign) => {
      if (campaign.rows && campaign.rows.length > 0) {
        campaign.rows.forEach((row) => {
          // Try to get date from various fields
          let dateStr = row["Reporting starts"] || row["date"] || row["Date"] || row["Reporting ends"];
          
          if (!dateStr) {
            // If no date in row, use campaign upload date
            dateStr = campaign.uploadedAt;
          }

          let date;
          if (typeof dateStr === 'string') {
            date = new Date(dateStr);
          } else if (dateStr instanceof Date) {
            date = dateStr;
          } else {
            return; // Skip if no valid date
          }

          if (isNaN(date.getTime())) {
            return; // Skip invalid dates
          }

          // Get month key (YYYY-MM format)
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          const monthLabel = date.toLocaleDateString("en-US", { month: "short", year: "numeric" }).toUpperCase().replace(',', '');

          if (!monthlyMap.has(monthKey)) {
            monthlyMap.set(monthKey, {
              monthKey,
              monthLabel,
              spend: 0,
              engagements: 0,
            });
          }

          const monthData = monthlyMap.get(monthKey);

          // Amount spent
          const spend = parseFloat(row["Amount spent (INR)"] || row["Amount spent"] || 0);
          if (!isNaN(spend)) monthData.spend += spend;

          // Engagements (try different field names)
          const engagements = parseFloat(
            row["Page engagement"] || 
            row["Post engagements"] || 
            row["Engagements"] || 
            0
          );
          if (!isNaN(engagements)) monthData.engagements += engagements;
        });
      }
    });

    // Convert to array and sort by month
    const sortedData = Array.from(monthlyMap.values()).sort((a, b) => 
      a.monthKey.localeCompare(b.monthKey)
    );

    return sortedData;
  }, [filteredCampaigns]);

  // Calculate engagement breakdown by type
  const engagementBreakdown = useMemo(() => {
    if (!filteredCampaigns || filteredCampaigns.length === 0) {
      return null;
    }

    let totalEngagements = 0;
    let totalLikes = 0;
    let totalShares = 0;
    let totalComments = 0;

    filteredCampaigns.forEach((campaign) => {
      if (campaign.rows && campaign.rows.length > 0) {
        campaign.rows.forEach((row) => {
          // Total Engagements
          const engagements = parseFloat(
            row["Page engagement"] || 
            row["Post engagements"] || 
            row["Engagements"] || 
            0
          );
          if (!isNaN(engagements)) totalEngagements += engagements;

          // Likes
          const likes = parseFloat(
            row["Facebook likes"] || 
            row["Post reactions"] || 
            row["Likes"] || 
            0
          );
          if (!isNaN(likes)) totalLikes += likes;

          // Shares
          const shares = parseFloat(
            row["Post shares"] || 
            row["Shares"] || 
            0
          );
          if (!isNaN(shares)) totalShares += shares;

          // Comments
          const comments = parseFloat(
            row["Post comments"] || 
            row["Comments"] || 
            0
          );
          if (!isNaN(comments)) totalComments += comments;
        });
      }
    });

    // Find max value for percentage calculation
    const maxValue = Math.max(totalEngagements, totalLikes, totalShares, totalComments);

    return {
      totalEngagements: {
        value: totalEngagements,
        percentage: maxValue > 0 ? (totalEngagements / maxValue) * 100 : 0,
      },
      likes: {
        value: totalLikes,
        percentage: maxValue > 0 ? (totalLikes / maxValue) * 100 : 0,
      },
      shares: {
        value: totalShares,
        percentage: maxValue > 0 ? (totalShares / maxValue) * 100 : 0,
      },
      comments: {
        value: totalComments,
        percentage: maxValue > 0 ? (totalComments / maxValue) * 100 : 0,
      },
    };
  }, [filteredCampaigns]);


  return (
    <>
      <PageHeader
        title="Campaign Analytics Dashboard"
        breadcrumb={[
          { label: "Home", path: "/" },
          { label: "Campaigns", path: "/campaigns" },
          { label: "All", path: "/campaigns/all" },
        ]}
      />

      <div className="main-content">
        <div
          className="campaigns-full-width-container"
          style={{
            background: "#f5f7fa",
            minHeight: "calc(100vh - 80px)",
            padding: "40px 0",
          }}
        >
          <div className="campaigns-content-wrapper" style={{ width: "100%", maxWidth: "1600px", margin: "0 auto" }}>
            {/* Enhanced Client Selection */}
            <ClientSelector
              onClientSelect={(clientId) => {
                setSelectedClientId(clientId);
                setSelectedCampaignId("");
              }}
              onClientDataChange={handleClientDataChange}
              showCurrentData={false} // Don't show overview since we have detailed analytics below
              disabled={loading}
            />

            {/* Campaign Selection - Only show when client is selected */}
            {selectedClientId && campaigns.length > 0 && (
              <div
                style={{
                  background: "#fff",
                  boxShadow: "0 2px 16px rgba(0,0,0,0.08)",
                  borderRadius: "12px",
                  padding: "24px",
                  marginBottom: "24px",
                }}
              >
                <div style={{ display: "flex", gap: "16px", alignItems: "center", flexWrap: "wrap" }}>
                  <div style={{ flex: "1", minWidth: "200px" }}>
                    <label
                      style={{
                        color: "#222",
                        fontWeight: "600",
                        fontSize: "1.08rem",
                        marginBottom: "8px",
                        display: "block",
                      }}
                    >
                      Select Campaign
                    </label>
                    <div style={{ display: "flex", gap: "8px", alignItems: "stretch" }}>
                      <select
                        value={selectedCampaignId || "all"}
                        onChange={(e) => setSelectedCampaignId(e.target.value)}
                        style={{
                          flex: "1",
                          padding: "12px",
                          fontSize: "1.08rem",
                          border: "1px solid #e0e0e0",
                          borderRadius: "8px",
                          background: "#fff",
                          color: "#222",
                        }}
                      >
                        <option value="all">All Campaigns</option>
                        {campaigns.map((campaign) => (
                          <option key={campaign._id} value={campaign._id}>
                            {campaign.fileName}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={handleDeleteClick}
                        disabled={!selectedCampaignId || selectedCampaignId === "all" || deleting}
                        style={{
                          padding: "12px 20px",
                          fontSize: "1.08rem",
                          border: "none",
                          borderRadius: "8px",
                          background: deleting ? "#ccc" : "#ef4444",
                          color: "#fff",
                          cursor: deleting || !selectedCampaignId || selectedCampaignId === "all" ? "not-allowed" : "pointer",
                          fontWeight: "600",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          whiteSpace: "nowrap",
                          opacity: deleting || !selectedCampaignId || selectedCampaignId === "all" ? 0.6 : 1,
                          transition: "all 0.2s",
                        }}
                        title="Delete selected campaign"
                      >
                        <i className="feather-trash-2" style={{ fontSize: "1rem" }}></i>
                        Delete
                      </button>
                    </div>
                  </div>

                  <Link
                    href="/campaigns/create"
                    style={{
                      display: "inline-block",
                      padding: "12px 24px",
                      background: "linear-gradient(90deg,#667eea 0%,#764ba2 100%)",
                      color: "#fff",
                      textDecoration: "none",
                      borderRadius: "8px",
                      fontWeight: "600",
                      fontSize: "1.08rem",
                      boxShadow: "0 4px 16px rgba(102,126,234,0.15)",
                    }}
                  >
                    <i className="feather-plus" style={{ marginRight: "8px" }}></i>
                    Create Campaign
                  </Link>
                </div>
              </div>
            )}

            {/* View Mode Toggle Section - Only show when "All Campaigns" is selected */}
            {selectedClientId && campaigns.length > 0 && selectedCampaignId === "all" && (
              <div
                style={{
                  background: "#fff",
                  boxShadow: "0 2px 16px rgba(0,0,0,0.08)",
                  borderRadius: "12px",
                  padding: "24px",
                  marginBottom: "24px",
                }}
              >
                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                  <button
                    onClick={() => setViewMode("viewData")}
                    style={{
                      flex: "1",
                      padding: "12px 24px",
                      fontSize: "1.08rem",
                      border: "none",
                      borderRadius: "8px",
                      background: viewMode === "viewData" 
                        ? "linear-gradient(90deg,#667eea 0%,#764ba2 100%)" 
                        : "#f3f4f6",
                      color: viewMode === "viewData" ? "#fff" : "#666",
                      cursor: "pointer",
                      fontWeight: "600",
                      transition: "all 0.2s",
                      boxShadow: viewMode === "viewData" 
                        ? "0 4px 16px rgba(102,126,234,0.15)" 
                        : "none",
                    }}
                  >
                    View Data
                  </button>
                  <button
                    onClick={() => setViewMode("compareData")}
                    style={{
                      flex: "1",
                      padding: "12px 24px",
                      fontSize: "1.08rem",
                      border: "none",
                      borderRadius: "8px",
                      background: viewMode === "compareData" 
                        ? "linear-gradient(90deg,#667eea 0%,#764ba2 100%)" 
                        : "#f3f4f6",
                      color: viewMode === "compareData" ? "#fff" : "#666",
                      cursor: "pointer",
                      fontWeight: "600",
                      transition: "all 0.2s",
                      boxShadow: viewMode === "compareData" 
                        ? "0 4px 16px rgba(102,126,234,0.15)" 
                        : "none",
                    }}
                  >
                    Compare Data
                  </button>
                </div>
              </div>
            )}

            {/* Date Range Filter Section - Only show when "View Data" is selected and "All Campaigns" is selected */}
            {false && viewMode === "viewData" && selectedClientId && campaigns.length > 0 && selectedCampaignId === "all" && (
              <div
                style={{
                  background: "#fff",
                  boxShadow: "0 2px 16px rgba(0,0,0,0.08)",
                  borderRadius: "12px",
                  padding: "24px",
                  marginBottom: "24px",
                }}
              >
                <h3
                  style={{
                    color: "#222",
                    fontWeight: "700",
                    fontSize: "1.2rem",
                    marginBottom: "20px",
                  }}
                >
                  Filter by Date Range
                </h3>
                <div style={{ display: "flex", gap: "16px", alignItems: "flex-end", flexWrap: "wrap" }}>
                  <div style={{ flex: "1", minWidth: "200px" }}>
                    <label
                      style={{
                        color: "#666",
                        fontWeight: "600",
                        fontSize: "0.95rem",
                        marginBottom: "8px",
                        display: "block",
                      }}
                    >
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={dateRange.start || ""}
                      onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "12px",
                        fontSize: "1rem",
                        border: "1px solid #e0e0e0",
                        borderRadius: "8px",
                        background: "#fff",
                        color: "#222",
                      }}
                    />
                  </div>
                  <div style={{ flex: "1", minWidth: "200px" }}>
                    <label
                      style={{
                        color: "#666",
                        fontWeight: "600",
                        fontSize: "0.95rem",
                        marginBottom: "8px",
                        display: "block",
                      }}
                    >
                      End Date
                    </label>
                    <input
                      type="date"
                      value={dateRange.end || ""}
                      onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                      min={dateRange.start || ""}
                      style={{
                        width: "100%",
                        padding: "12px",
                        fontSize: "1rem",
                        border: "1px solid #e0e0e0",
                        borderRadius: "8px",
                        background: "#fff",
                        color: "#222",
                      }}
                    />
                  </div>
                  <button
                    onClick={() => {
                      if (dateRange.start && dateRange.end) {
                        setAppliedDateRange({ ...dateRange });
                      } else {
                        setAppliedDateRange({ start: null, end: null });
                      }
                    }}
                    disabled={!dateRange.start || !dateRange.end}
                    style={{
                      padding: "12px 24px",
                      fontSize: "1.08rem",
                      border: "none",
                      borderRadius: "8px",
                      background: (!dateRange.start || !dateRange.end)
                        ? "#ccc"
                        : "linear-gradient(90deg,#667eea 0%,#764ba2 100%)",
                      color: "#fff",
                      cursor: (!dateRange.start || !dateRange.end) ? "not-allowed" : "pointer",
                      fontWeight: "600",
                      transition: "all 0.2s",
                      boxShadow: (!dateRange.start || !dateRange.end)
                        ? "none"
                        : "0 4px 16px rgba(102,126,234,0.15)",
                      whiteSpace: "nowrap",
                      opacity: (!dateRange.start || !dateRange.end) ? 0.6 : 1,
                    }}
                  >
                    Apply Date Range
                  </button>
                  {appliedDateRange.start && appliedDateRange.end && (
                    <button
                      onClick={() => {
                        setDateRange({ start: null, end: null });
                        setAppliedDateRange({ start: null, end: null });
                      }}
                      style={{
                        padding: "12px 24px",
                        fontSize: "1.08rem",
                        border: "1px solid #e0e0e0",
                        borderRadius: "8px",
                        background: "#fff",
                        color: "#666",
                        cursor: "pointer",
                        fontWeight: "600",
                        transition: "all 0.2s",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Clear Filter
                    </button>
                  )}
                </div>
                {appliedDateRange.start && appliedDateRange.end && (
                  <div
                    style={{
                      marginTop: "16px",
                      padding: "12px",
                      background: "#f5f7ff",
                      borderRadius: "8px",
                      color: "#667eea",
                      fontSize: "0.95rem",
                      fontWeight: "500",
                    }}
                  >
                    Showing data from {new Date(appliedDateRange.start).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })} to {new Date(appliedDateRange.end).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                )}
              </div>
            )}

            {/* View Data Content */}
            {viewMode === "viewData" && (
              <>
            {/* Paid Performance Dashboard */}
            {selectedClientId && filteredCampaigns.length > 0 && aggregatedMetrics && (
              <div
                style={{
                  background: "#fff",
                  boxShadow: "0 2px 16px rgba(0,0,0,0.08)",
                  borderRadius: "12px",
                  padding: "32px",
                  marginBottom: "24px",
                }}
              >
                {/* Header */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "24px",
                    flexWrap: "wrap",
                    gap: "16px",
                  }}
                >
                  <div>
                    <h2
                      style={{
                        color: "#222",
                        fontWeight: "700",
                        fontSize: "1.5rem",
                        marginBottom: "8px",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <span>⭐</span> Paid Performance
                    </h2>
                    <p
                      style={{
                        color: "#666",
                        fontSize: "0.95rem",
                        margin: 0,
                      }}
                    >
                      View your key paid campaign performance metrics from the reporting period.
                    </p>
                  </div>
                </div>

                {/* Client Info */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    marginBottom: "24px",
                    padding: "12px",
                    background: "#f5f7fa",
                    borderRadius: "8px",
                  }}
                >
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      fontWeight: "600",
                    }}
                  >
                    FB
                  </div>
                  <div>
                    <div style={{ fontWeight: "600", color: "#222" }}>
                      {getSelectedClientName()}
                    </div>
                    <div style={{ fontSize: "0.85rem", color: "#666" }}>
                      ({selectedCampaignId === "all" ? filteredCampaigns.length : 1} Campaign{selectedCampaignId === "all" ? (filteredCampaigns.length !== 1 ? "s" : "") : ""} selected)
                    </div>
                  </div>
                </div>

                {/* Total Spend - Prominent */}
                <div
                  style={{
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    borderRadius: "12px",
                    padding: "24px",
                    marginBottom: "24px",
                    color: "#fff",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.9rem",
                      opacity: 0.9,
                      marginBottom: "8px",
                    }}
                  >
                    Total Spend
                  </div>
                  <div
                    style={{
                      fontSize: "2.5rem",
                      fontWeight: "700",
                    }}
                  >
                    {formatCurrency(aggregatedMetrics.totalSpend)}
                  </div>
                </div>

                {/* Metrics Grid */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: "20px",
                  }}
                >
                  {/* Impressions */}
                  <div
                    style={{
                      padding: "20px",
                      background: "#f9fafb",
                      borderRadius: "8px",
                      border: "1px solid #e5e7eb",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "0.85rem",
                        color: "#666",
                        marginBottom: "8px",
                      }}
                    >
                      Impressions
                    </div>
                    <div
                      style={{
                        fontSize: "1.5rem",
                        fontWeight: "700",
                        color: "#222",
                        marginBottom: "4px",
                      }}
                    >
                      {formatNumber(aggregatedMetrics.totalImpressions)}
                    </div>
                    <div
                      style={{
                        fontSize: "0.85rem",
                        color: "#666",
                      }}
                    >
                      CPM: {formatCurrency(aggregatedMetrics.avgCPM)}
                    </div>
                  </div>

                  {/* CTR (Click-Through Rate) */}
                  <div
                    style={{
                      padding: "20px",
                      background: "#f9fafb",
                      borderRadius: "8px",
                      border: "1px solid #e5e7eb",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "0.85rem",
                        color: "#666",
                        marginBottom: "8px",
                      }}
                    >
                      Click-Through Rate (CTR)
                    </div>
                    <div
                      style={{
                        fontSize: "1.5rem",
                        fontWeight: "700",
                        color: "#222",
                        marginBottom: "4px",
                      }}
                    >
                      {formatPercentage(aggregatedMetrics.ctr)}
                    </div>
                    <div
                      style={{
                        fontSize: "0.85rem",
                        color: "#666",
                      }}
                    >
                      Clicks / Impressions
                    </div>
                  </div>

                  {/* Engagements */}
                  <div
                    style={{
                      padding: "20px",
                      background: "#f9fafb",
                      borderRadius: "8px",
                      border: "1px solid #e5e7eb",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "0.85rem",
                        color: "#666",
                        marginBottom: "8px",
                      }}
                    >
                      Engagements
                    </div>
                    <div
                      style={{
                        fontSize: "1.5rem",
                        fontWeight: "700",
                        color: "#222",
                        marginBottom: "4px",
                      }}
                    >
                      {formatNumber(aggregatedMetrics.totalEngagements)}
                    </div>
                    <div
                      style={{
                        fontSize: "0.85rem",
                        color: "#666",
                      }}
                    >
                      CPE: {formatCurrency(aggregatedMetrics.cpe)}
                    </div>
                    <div
                      style={{
                        fontSize: "0.85rem",
                        color: "#666",
                        marginTop: "4px",
                      }}
                    >
                      Engagement Rate: {formatPercentage(aggregatedMetrics.engagementRate)}
                    </div>
                  </div>

                  {/* Clicks */}
                  <div
                    style={{
                      padding: "20px",
                      background: "#f9fafb",
                      borderRadius: "8px",
                      border: "1px solid #e5e7eb",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "0.85rem",
                        color: "#666",
                        marginBottom: "8px",
                      }}
                    >
                      Clicks
                    </div>
                    <div
                      style={{
                        fontSize: "1.5rem",
                        fontWeight: "700",
                        color: "#222",
                        marginBottom: "4px",
                      }}
                    >
                      {formatNumber(aggregatedMetrics.totalClicks)}
                    </div>
                    <div
                      style={{
                        fontSize: "0.85rem",
                        color: "#666",
                      }}
                    >
                      CPC: {formatCurrency(aggregatedMetrics.avgCPC)}
                    </div>
                  </div>

                  {/* Web Conversions */}
                  <div
                    style={{
                      padding: "20px",
                      background: "#f9fafb",
                      borderRadius: "8px",
                      border: "1px solid #e5e7eb",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "0.85rem",
                        color: "#666",
                        marginBottom: "8px",
                      }}
                    >
                      Web Conversions
                    </div>
                    <div
                      style={{
                        fontSize: "1.5rem",
                        fontWeight: "700",
                        color: "#222",
                        marginBottom: "4px",
                      }}
                    >
                      {formatNumber(aggregatedMetrics.totalConversions)}
                    </div>
                    <div
                      style={{
                        fontSize: "0.85rem",
                        color: "#666",
                      }}
                    >
                      CPCon: {aggregatedMetrics.cpcon ? formatCurrency(aggregatedMetrics.cpcon) : "—"}
                    </div>
                    <div
                      style={{
                        fontSize: "0.85rem",
                        color: "#666",
                        marginTop: "4px",
                      }}
                    >
                      Conversion Rate: {formatPercentage(aggregatedMetrics.conversionRate)}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Paid Impressions Chart Section */}
            {selectedClientId && filteredCampaigns.length > 0 && monthlyData.length > 0 && (
              <div
                style={{
                  background: "#fff",
                  boxShadow: "0 2px 16px rgba(0,0,0,0.08)",
                  borderRadius: "12px",
                  padding: "32px",
                  marginBottom: "24px",
                }}
              >
                {/* Header */}
                <div style={{ marginBottom: "24px" }}>
                  <h2
                    style={{
                      color: "#222",
                      fontWeight: "700",
                      fontSize: "1.5rem",
                      marginBottom: "8px",
                    }}
                  >
                    Paid Impressions
                  </h2>
                  <p
                    style={{
                      color: "#666",
                      fontSize: "0.95rem",
                      margin: 0,
                    }}
                  >
                    Review how many times your content was seen by the targeted audience during the reporting period.
                  </p>
                </div>

                {/* Chart */}
                <div style={{ marginTop: "32px" }}>
                  <h3
                    style={{
                      color: "#222",
                      fontWeight: "600",
                      fontSize: "1.1rem",
                      marginBottom: "20px",
                    }}
                  >
                    Impressions, by Month
                  </h3>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart
                      data={monthlyData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis
                        dataKey="monthLabel"
                        stroke="#666"
                        style={{ fontSize: "12px" }}
                      />
                      <YAxis
                        yAxisId="left"
                        stroke="#14b8a6"
                        style={{ fontSize: "12px" }}
                        label={{ value: "Total Spend (₹)", angle: -90, position: "insideLeft", style: { textAnchor: "middle", fill: "#14b8a6" } }}
                        tickFormatter={(value) => {
                          if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
                          if (value >= 1000) return `₹${(value / 1000).toFixed(0)}K`;
                          return `₹${value}`;
                        }}
                      />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        stroke="#764ba2"
                        style={{ fontSize: "12px" }}
                        label={{ value: "Total (Impressions)", angle: 90, position: "insideRight", style: { textAnchor: "middle", fill: "#764ba2" } }}
                        tickFormatter={(value) => {
                          if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                          if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
                          return value.toString();
                        }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#fff",
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                          padding: "12px",
                        }}
                        formatter={(value, name) => {
                          if (name === "Total Spend") {
                            return [formatCurrency(value), "Total Spend"];
                          } else if (name === "Total (Impressions)") {
                            return [formatNumber(value), "Total (Impressions)"];
                          }
                          return [value, name];
                        }}
                      />
                      <Legend
                        wrapperStyle={{ paddingTop: "20px" }}
                        iconType="line"
                      />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="spend"
                        stroke="#14b8a6"
                        strokeWidth={3}
                        dot={{ fill: "#14b8a6", r: 4 }}
                        activeDot={{ r: 6 }}
                        name="Total Spend"
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="impressions"
                        stroke="#764ba2"
                        strokeWidth={3}
                        dot={{ fill: "#764ba2", r: 4 }}
                        activeDot={{ r: 6 }}
                        name="Total (Impressions)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Impressions by Type */}
                {impressionsBreakdown && (
                  <div style={{ marginTop: "48px" }}>
                    <h3
                      style={{
                        color: "#222",
                        fontWeight: "600",
                        fontSize: "1.1rem",
                        marginBottom: "20px",
                      }}
                    >
                      Impressions, by Type
                    </h3>
                    
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                      {/* Total Impressions */}
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                          <span style={{ color: "#222", fontWeight: "500", fontSize: "0.95rem" }}>Total Impressions</span>
                          <span style={{ color: "#222", fontWeight: "700", fontSize: "0.95rem" }}>
                            {formatNumber(impressionsBreakdown.totalImpressions.value)}
                          </span>
                        </div>
                        <div style={{ width: "100%", height: "8px", background: "#e5e7eb", borderRadius: "4px", overflow: "hidden" }}>
                          <div
                            style={{
                              width: `${impressionsBreakdown.totalImpressions.percentage}%`,
                              height: "100%",
                              background: "linear-gradient(90deg, #764ba2 0%, #764ba2 95%, #14b8a6 95%, #14b8a6 100%)",
                              borderRadius: "4px",
                            }}
                          />
                        </div>
                      </div>

                      {/* Top Platforms */}
                      {impressionsBreakdown.platforms.map((platform, index) => (
                        <div key={`platform-${index}`}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                            <span style={{ color: "#222", fontWeight: "500", fontSize: "0.95rem" }}>{platform.name}</span>
                            <span style={{ color: "#222", fontWeight: "700", fontSize: "0.95rem" }}>
                              {formatNumber(platform.value)}
                            </span>
                          </div>
                          <div style={{ width: "100%", height: "8px", background: "#e5e7eb", borderRadius: "4px", overflow: "hidden" }}>
                            <div
                              style={{
                                width: `${platform.percentage}%`,
                                height: "100%",
                                background: "linear-gradient(90deg, #764ba2 0%, #764ba2 95%, #e5e7eb 95%, #e5e7eb 100%)",
                                borderRadius: "4px",
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Paid Engagement Chart Section */}
            {selectedClientId && filteredCampaigns.length > 0 && monthlyEngagementData.length > 0 && engagementBreakdown && (
              <div
                style={{
                  background: "#fff",
                  boxShadow: "0 2px 16px rgba(0,0,0,0.08)",
                  borderRadius: "12px",
                  padding: "32px",
                  marginBottom: "24px",
                }}
              >
                {/* Header */}
                <div style={{ marginBottom: "24px" }}>
                  <h2
                    style={{
                      color: "#222",
                      fontWeight: "700",
                      fontSize: "1.5rem",
                      marginBottom: "8px",
                    }}
                  >
                    Paid Engagement
                  </h2>
                  <p
                    style={{
                      color: "#666",
                      fontSize: "0.95rem",
                      margin: 0,
                    }}
                  >
                    Visualize and analyze how people are engaging with your paid campaigns during the reporting period.
                  </p>
                </div>

                {/* Engagements by Month Chart */}
                <div style={{ marginTop: "32px", marginBottom: "48px" }}>
                  <h3
                    style={{
                      color: "#222",
                      fontWeight: "600",
                      fontSize: "1.1rem",
                      marginBottom: "20px",
                    }}
                  >
                    Engagements, by Month
                  </h3>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart
                      data={monthlyEngagementData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis
                        dataKey="monthLabel"
                        stroke="#666"
                        style={{ fontSize: "12px" }}
                      />
                      <YAxis
                        yAxisId="left"
                        stroke="#14b8a6"
                        style={{ fontSize: "12px" }}
                        label={{ value: "Total Spend (₹)", angle: -90, position: "insideLeft", style: { textAnchor: "middle", fill: "#14b8a6" } }}
                        tickFormatter={(value) => {
                          if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
                          if (value >= 1000) return `₹${(value / 1000).toFixed(0)}K`;
                          return `₹${value}`;
                        }}
                      />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        stroke="#6b7280"
                        style={{ fontSize: "12px" }}
                        label={{ value: "Total", angle: 90, position: "insideRight", style: { textAnchor: "middle", fill: "#6b7280" } }}
                        tickFormatter={(value) => {
                          if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                          if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
                          return value.toString();
                        }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#fff",
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                          padding: "12px",
                        }}
                        formatter={(value, name) => {
                          if (name === "Total Spend") {
                            return [formatCurrency(value), "Total Spend"];
                          } else if (name === "Total") {
                            return [formatNumber(value), "Total"];
                          }
                          return [value, name];
                        }}
                      />
                      <Legend
                        wrapperStyle={{ paddingTop: "20px" }}
                        iconType="line"
                      />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="spend"
                        stroke="#14b8a6"
                        strokeWidth={3}
                        dot={{ fill: "#14b8a6", r: 4 }}
                        activeDot={{ r: 6 }}
                        name="Total Spend"
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="engagements"
                        stroke="#764ba2"
                        strokeWidth={3}
                        dot={{ fill: "#764ba2", r: 4 }}
                        activeDot={{ r: 6 }}
                        name="Total"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Engagement by Type */}
                <div style={{ marginTop: "48px" }}>
                  <h3
                    style={{
                      color: "#222",
                      fontWeight: "600",
                      fontSize: "1.1rem",
                      marginBottom: "20px",
                    }}
                  >
                    Engagement, by Engagement Type
                  </h3>
                  
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {/* Total Engagements */}
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                        <span style={{ color: "#222", fontWeight: "500", fontSize: "0.95rem" }}>Total Engagements</span>
                        <span style={{ color: "#222", fontWeight: "700", fontSize: "0.95rem" }}>
                          {formatNumber(engagementBreakdown.totalEngagements.value)}
                        </span>
                      </div>
                      <div style={{ width: "100%", height: "8px", background: "#e5e7eb", borderRadius: "4px", overflow: "hidden" }}>
                        <div
                          style={{
                            width: `${engagementBreakdown.totalEngagements.percentage}%`,
                            height: "100%",
                            background: "linear-gradient(90deg, #764ba2 0%, #764ba2 95%, #14b8a6 95%, #14b8a6 100%)",
                            borderRadius: "4px",
                          }}
                        />
                      </div>
                    </div>

                    {/* Likes */}
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                        <span style={{ color: "#222", fontWeight: "500", fontSize: "0.95rem" }}>Likes</span>
                        <span style={{ color: "#222", fontWeight: "700", fontSize: "0.95rem" }}>
                          {formatNumber(engagementBreakdown.likes.value)}
                        </span>
                      </div>
                      <div style={{ width: "100%", height: "8px", background: "#e5e7eb", borderRadius: "4px", overflow: "hidden" }}>
                        <div
                          style={{
                            width: `${engagementBreakdown.likes.percentage}%`,
                            height: "100%",
                            background: "linear-gradient(90deg, #764ba2 0%, #764ba2 95%, #14b8a6 95%, #14b8a6 100%)",
                            borderRadius: "4px",
                          }}
                        />
                      </div>
                    </div>

                    {/* Shares */}
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                        <span style={{ color: "#222", fontWeight: "500", fontSize: "0.95rem" }}>Shares</span>
                        <span style={{ color: "#222", fontWeight: "700", fontSize: "0.95rem" }}>
                          {formatNumber(engagementBreakdown.shares.value)}
                        </span>
                      </div>
                      <div style={{ width: "100%", height: "8px", background: "#e5e7eb", borderRadius: "4px", overflow: "hidden" }}>
                        <div
                          style={{
                            width: `${engagementBreakdown.shares.percentage}%`,
                            height: "100%",
                            background: "linear-gradient(90deg, #764ba2 0%, #764ba2 95%, #14b8a6 95%, #14b8a6 100%)",
                            borderRadius: "4px",
                          }}
                        />
                      </div>
                    </div>

                    {/* Comments */}
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                        <span style={{ color: "#222", fontWeight: "500", fontSize: "0.95rem" }}>Comments</span>
                        <span style={{ color: "#222", fontWeight: "700", fontSize: "0.95rem" }}>
                          {formatNumber(engagementBreakdown.comments.value)}
                        </span>
                      </div>
                      <div style={{ width: "100%", height: "8px", background: "#e5e7eb", borderRadius: "4px", overflow: "hidden" }}>
                        <div
                          style={{
                            width: `${engagementBreakdown.comments.percentage}%`,
                            height: "100%",
                            background: "linear-gradient(90deg, #764ba2 0%, #764ba2 95%, #14b8a6 95%, #14b8a6 100%)",
                            borderRadius: "4px",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Paid Web Conversions Section */}
            {selectedClientId && filteredCampaigns.length > 0 && monthlyConversionData.length > 0 && (
              <div
                style={{
                  background: "#fff",
                  boxShadow: "0 2px 16px rgba(0,0,0,0.08)",
                  borderRadius: "12px",
                  padding: "32px",
                  marginBottom: "24px",
                }}
              >
                {/* Header */}
                <div style={{ marginBottom: "24px" }}>
                  <h2
                    style={{
                      color: "#222",
                      fontWeight: "700",
                      fontSize: "1.5rem",
                      marginBottom: "8px",
                    }}
                  >
                    Paid Web Conversions
                  </h2>
                  <p
                    style={{
                      color: "#666",
                      fontSize: "0.95rem",
                      margin: 0,
                    }}
                  >
                    Visualize how many actions were taken on your website during the reporting period.
                  </p>
                </div>

                {/* Web Conversions by Month Chart */}
                <div style={{ marginTop: "32px", marginBottom: "32px" }}>
                  <h3
                    style={{
                      color: "#222",
                      fontWeight: "600",
                      fontSize: "1.1rem",
                      marginBottom: "20px",
                    }}
                  >
                    Web Conversions, by Month
                  </h3>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart
                      data={monthlyConversionData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis
                        dataKey="monthLabel"
                        stroke="#666"
                        style={{ fontSize: "12px" }}
                      />
                      <YAxis
                        yAxisId="left"
                        stroke="#14b8a6"
                        style={{ fontSize: "12px" }}
                        label={{ value: "Total Spend (₹)", angle: -90, position: "insideLeft", style: { textAnchor: "middle", fill: "#14b8a6" } }}
                        tickFormatter={(value) => {
                          if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
                          if (value >= 1000) return `₹${(value / 1000).toFixed(0)}K`;
                          return `₹${value}`;
                        }}
                      />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        stroke="#764ba2"
                        style={{ fontSize: "12px" }}
                        label={{ value: "Total", angle: 90, position: "insideRight", style: { textAnchor: "middle", fill: "#764ba2" } }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#fff",
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                          padding: "12px",
                        }}
                        formatter={(value, name) => {
                          if (name === "Total Spend") {
                            return [formatCurrency(value), "Total Spend"];
                          } else if (name === "Total") {
                            return [formatNumber(value), "Total"];
                          }
                          return [value, name];
                        }}
                      />
                      <Legend
                        wrapperStyle={{ paddingTop: "20px" }}
                        iconType="line"
                      />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="spend"
                        stroke="#14b8a6"
                        strokeWidth={3}
                        dot={{ fill: "#14b8a6", r: 4 }}
                        activeDot={{ r: 6 }}
                        name="Total Spend"
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="conversions"
                        stroke="#764ba2"
                        strokeWidth={3}
                        dot={{ fill: "#764ba2", r: 4 }}
                        activeDot={{ r: 6 }}
                        name="Total"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Web Conversion Metrics Summary */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "16px" }}>
                  <div
                    style={{
                      padding: "20px",
                      background: "#f9fafb",
                      borderRadius: "8px",
                      border: "1px solid #e5e7eb",
                    }}
                  >
                    <div style={{ fontSize: "0.85rem", color: "#666", marginBottom: "8px" }}>
                      Web Conversion Metrics
                    </div>
                    <div style={{ fontSize: "1.1rem", fontWeight: "600", color: "#222", marginBottom: "12px" }}>
                      Total Web Conversions
                    </div>
                    <div style={{ fontSize: "1.5rem", fontWeight: "700", color: "#222" }}>
                      {formatNumber(aggregatedMetrics?.totalConversions || 0)}
                    </div>
                  </div>
                  <div
                    style={{
                      padding: "20px",
                      background: "#f9fafb",
                      borderRadius: "8px",
                      border: "1px solid #e5e7eb",
                    }}
                  >
                    <div style={{ fontSize: "0.85rem", color: "#666", marginBottom: "8px" }}>
                      Totals
                    </div>
                    <div style={{ fontSize: "1.1rem", fontWeight: "600", color: "#222", marginBottom: "12px" }}>
                      CPCon
                    </div>
                    <div style={{ fontSize: "1.5rem", fontWeight: "700", color: "#222" }}>
                      {aggregatedMetrics?.cpcon ? formatCurrency(aggregatedMetrics.cpcon) : "—"}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Performance by Platform Section */}
            {selectedClientId && filteredCampaigns.length > 0 && platformPerformance.length > 0 && (
              <div
                style={{
                  background: "#fff",
                  boxShadow: "0 2px 16px rgba(0,0,0,0.08)",
                  borderRadius: "12px",
                  padding: "32px",
                  marginBottom: "24px",
                }}
              >
                <div style={{ marginBottom: "24px" }}>
                  <h2
                    style={{
                      color: "#222",
                      fontWeight: "700",
                      fontSize: "1.5rem",
                      marginBottom: "8px",
                    }}
                  >
                    Performance by Platform
                  </h2>
                  <p
                    style={{
                      color: "#666",
                      fontSize: "0.95rem",
                      margin: 0,
                    }}
                  >
                    Compare performance metrics across different advertising platforms.
                  </p>
                </div>

                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ borderBottom: "2px solid #e5e7eb" }}>
                        <th style={{ padding: "12px", textAlign: "left", color: "#666", fontWeight: "600", fontSize: "0.9rem" }}>Platform</th>
                        <th style={{ padding: "12px", textAlign: "right", color: "#666", fontWeight: "600", fontSize: "0.9rem" }}>Spend</th>
                        <th style={{ padding: "12px", textAlign: "right", color: "#666", fontWeight: "600", fontSize: "0.9rem" }}>Impressions</th>
                        <th style={{ padding: "12px", textAlign: "right", color: "#666", fontWeight: "600", fontSize: "0.9rem" }}>Clicks</th>
                        <th style={{ padding: "12px", textAlign: "right", color: "#666", fontWeight: "600", fontSize: "0.9rem" }}>Engagements</th>
                        <th style={{ padding: "12px", textAlign: "right", color: "#666", fontWeight: "600", fontSize: "0.9rem" }}>CPM</th>
                        <th style={{ padding: "12px", textAlign: "right", color: "#666", fontWeight: "600", fontSize: "0.9rem" }}>CPC</th>
                      </tr>
                    </thead>
                    <tbody>
                      {platformPerformance.map((platform, index) => (
                        <tr key={index} style={{ borderBottom: "1px solid #f3f4f6" }}>
                          <td style={{ padding: "12px", fontWeight: "600", color: "#222" }}>{platform.name}</td>
                          <td style={{ padding: "12px", textAlign: "right", color: "#222" }}>{formatCurrency(platform.spend)}</td>
                          <td style={{ padding: "12px", textAlign: "right", color: "#222" }}>{formatNumber(platform.impressions)}</td>
                          <td style={{ padding: "12px", textAlign: "right", color: "#222" }}>{formatNumber(platform.clicks)}</td>
                          <td style={{ padding: "12px", textAlign: "right", color: "#222" }}>{formatNumber(platform.engagements)}</td>
                          <td style={{ padding: "12px", textAlign: "right", color: "#222", position: "relative" }}>
                            {editingCPM === platform.name ? (
                              <div style={{ display: "flex", alignItems: "center", gap: "6px", justifyContent: "flex-end" }}>
                                <input
                                  type="number"
                                  value={cpmEditValue}
                                  onChange={(e) => setCpmEditValue(e.target.value)}
                                  disabled={updatingCPM}
                                  style={{
                                    width: "80px",
                                    padding: "4px 8px",
                                    fontSize: "0.9rem",
                                    border: "1px solid #667eea",
                                    borderRadius: "4px",
                                    textAlign: "right",
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      handleCPMSave(platform.name);
                                    } else if (e.key === "Escape") {
                                      handleCPMCancel();
                                    }
                                  }}
                                  autoFocus
                                />
                                <button
                                  onClick={() => handleCPMSave(platform.name)}
                                  disabled={updatingCPM}
                                  style={{
                                    padding: "4px 8px",
                                    background: "#10b981",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: "4px",
                                    cursor: updatingCPM ? "not-allowed" : "pointer",
                                    fontSize: "0.85rem",
                                    opacity: updatingCPM ? 0.6 : 1,
                                  }}
                                  title="Save"
                                >
                                  <i className="feather-check" style={{ fontSize: "0.85rem" }}></i>
                                </button>
                                <button
                                  onClick={handleCPMCancel}
                                  disabled={updatingCPM}
                                  style={{
                                    padding: "4px 8px",
                                    background: "#ef4444",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: "4px",
                                    cursor: updatingCPM ? "not-allowed" : "pointer",
                                    fontSize: "0.85rem",
                                    opacity: updatingCPM ? 0.6 : 1,
                                  }}
                                  title="Cancel"
                                >
                                  <i className="feather-x" style={{ fontSize: "0.85rem" }}></i>
                                </button>
                              </div>
                            ) : (
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "6px",
                                  justifyContent: "flex-end",
                                  cursor: "pointer",
                                  padding: "4px 8px",
                                  borderRadius: "4px",
                                  transition: "background 0.2s",
                                }}
                                onClick={() => handleCPMEdit(platform.name, platform.cpm)}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = "#f3f4f6";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = "transparent";
                                }}
                                title="Click to edit CPM"
                              >
                                <span>{formatCurrency(platform.cpm)}</span>
                                <i className="feather-edit-2" style={{ fontSize: "0.75rem", color: "#666", opacity: 0.7 }}></i>
                              </div>
                            )}
                          </td>
                          <td style={{ padding: "12px", textAlign: "right", color: "#222" }}>{formatCurrency(platform.cpc)}</td>
                        </tr>
                      ))}
                      {platformTotals && (
                        <tr style={{ borderTop: "2px solid #e5e7eb", backgroundColor: "#f9fafb" }}>
                          <td style={{ padding: "12px", fontWeight: "700", color: "#222", fontSize: "0.95rem" }}>Total</td>
                          <td style={{ padding: "12px", textAlign: "right", fontWeight: "700", color: "#222", fontSize: "0.95rem" }}>{formatCurrency(platformTotals.spend)}</td>
                          <td style={{ padding: "12px", textAlign: "right", fontWeight: "700", color: "#222", fontSize: "0.95rem" }}>{formatNumber(platformTotals.impressions)}</td>
                          <td style={{ padding: "12px", textAlign: "right", fontWeight: "700", color: "#222", fontSize: "0.95rem" }}>{formatNumber(platformTotals.clicks)}</td>
                          <td style={{ padding: "12px", textAlign: "right", fontWeight: "700", color: "#222", fontSize: "0.95rem" }}>{formatNumber(platformTotals.engagements)}</td>
                          <td style={{ padding: "12px", textAlign: "right", fontWeight: "700", color: "#222", fontSize: "0.95rem" }}>{formatCurrency(platformTotals.cpm)}</td>
                          <td style={{ padding: "12px", textAlign: "right", fontWeight: "700", color: "#222", fontSize: "0.95rem" }}>{formatCurrency(platformTotals.cpc)}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Top Performing Campaigns Section */}
            {selectedClientId && filteredCampaigns.length > 0 && topCampaigns.length > 0 && (
              <div
                style={{
                  background: "#fff",
                  boxShadow: "0 2px 16px rgba(0,0,0,0.08)",
                  borderRadius: "12px",
                  padding: "32px",
                  marginBottom: "24px",
                }}
              >
                <div style={{ marginBottom: "24px" }}>
                  <h2
                    style={{
                      color: "#222",
                      fontWeight: "700",
                      fontSize: "1.5rem",
                      marginBottom: "8px",
                    }}
                  >
                    Top Performing Campaigns
                  </h2>
                  <p
                    style={{
                      color: "#666",
                      fontSize: "0.95rem",
                      margin: 0,
                    }}
                  >
                    View your best performing campaigns ranked by total spend.
                  </p>
                </div>

                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ borderBottom: "2px solid #e5e7eb" }}>
                        <th style={{ padding: "12px", textAlign: "left", color: "#666", fontWeight: "600", fontSize: "0.9rem" }}>Campaign</th>
                        <th style={{ padding: "12px", textAlign: "right", color: "#666", fontWeight: "600", fontSize: "0.9rem" }}>Spend</th>
                        <th style={{ padding: "12px", textAlign: "right", color: "#666", fontWeight: "600", fontSize: "0.9rem" }}>Impressions</th>
                        <th style={{ padding: "12px", textAlign: "right", color: "#666", fontWeight: "600", fontSize: "0.9rem" }}>Clicks</th>
                        <th style={{ padding: "12px", textAlign: "right", color: "#666", fontWeight: "600", fontSize: "0.9rem" }}>Engagements</th>
                        <th style={{ padding: "12px", textAlign: "right", color: "#666", fontWeight: "600", fontSize: "0.9rem" }}>CPC</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topCampaigns.map((campaign, index) => (
                        <tr key={index} style={{ borderBottom: "1px solid #f3f4f6" }}>
                          <td style={{ padding: "12px", fontWeight: "500", color: "#222", maxWidth: "300px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {campaign.name.length > 40 ? campaign.name.substring(0, 40) + "..." : campaign.name}
                          </td>
                          <td style={{ padding: "12px", textAlign: "right", color: "#222" }}>{formatCurrency(campaign.spend)}</td>
                          <td style={{ padding: "12px", textAlign: "right", color: "#222" }}>{formatNumber(campaign.impressions)}</td>
                          <td style={{ padding: "12px", textAlign: "right", color: "#222" }}>{formatNumber(campaign.clicks)}</td>
                          <td style={{ padding: "12px", textAlign: "right", color: "#222" }}>{formatNumber(campaign.engagements)}</td>
                          <td style={{ padding: "12px", textAlign: "right", color: "#222" }}>{formatCurrency(campaign.cpc)}</td>
                        </tr>
                      ))}
                      {topCampaignsTotals && (
                        <tr style={{ borderTop: "2px solid #e5e7eb", backgroundColor: "#f9fafb" }}>
                          <td style={{ padding: "12px", fontWeight: "700", color: "#222", fontSize: "0.95rem" }}>Total</td>
                          <td style={{ padding: "12px", textAlign: "right", fontWeight: "700", color: "#222", fontSize: "0.95rem" }}>{formatCurrency(topCampaignsTotals.spend)}</td>
                          <td style={{ padding: "12px", textAlign: "right", fontWeight: "700", color: "#222", fontSize: "0.95rem" }}>{formatNumber(topCampaignsTotals.impressions)}</td>
                          <td style={{ padding: "12px", textAlign: "right", fontWeight: "700", color: "#222", fontSize: "0.95rem" }}>{formatNumber(topCampaignsTotals.clicks)}</td>
                          <td style={{ padding: "12px", textAlign: "right", fontWeight: "700", color: "#222", fontSize: "0.95rem" }}>{formatNumber(topCampaignsTotals.engagements)}</td>
                          <td style={{ padding: "12px", textAlign: "right", fontWeight: "700", color: "#222", fontSize: "0.95rem" }}>{formatCurrency(topCampaignsTotals.cpc)}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
              </>
            )}

            {/* Compare Data Content */}
            {viewMode === "compareData" && (
              <div
                style={{
                  background: "#fff",
                  boxShadow: "0 2px 16px rgba(0,0,0,0.08)",
                  borderRadius: "12px",
                  padding: "48px",
                  marginBottom: "24px",
                  textAlign: "center",
                }}
              >
                <p
                  style={{
                    color: "#666",
                    fontSize: "1.2rem",
                    fontWeight: "500",
                    margin: 0,
                  }}
                >
                  compare data section selected
                </p>
              </div>
            )}

            {/* No Client Selected Message - Only show in View Data mode */}
            {viewMode === "viewData" && !selectedClientId && !loading && (
              <div
                style={{
                  background: "#fff",
                  boxShadow: "0 2px 16px rgba(0,0,0,0.08)",
                  borderRadius: "12px",
                  padding: "60px 32px",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: "4rem", marginBottom: "16px" }}>📊</div>
                <p
                  style={{
                    color: "#666",
                    fontSize: "1.2rem",
                    fontWeight: "500",
                  }}
                >
                  Please select a client to view campaign analytics
                </p>
              </div>
            )}

            {/* Loading State */}
            {loadingCampaigns && (
              <div
                style={{
                  background: "#fff",
                  borderRadius: "12px",
                  padding: "60px 32px",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: "2rem", color: "#4F46E5" }}>⟳</div>
                <p
                  style={{
                    color: "#666",
                    fontSize: "1.1rem",
                    marginTop: "16px",
                  }}
                >
                  Loading campaigns...
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* View Campaign Modal */}
      {showModal && selectedCampaign && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            animation: "fadeIn 0.3s ease-in-out",
          }}
          onClick={closeModal}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "16px",
              padding: "32px",
              maxWidth: "90vw",
              width: "1200px",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.15)",
              animation: "slideUp 0.4s ease-out",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              style={{
                color: "#222",
                fontWeight: "700",
                fontSize: "1.5rem",
                marginBottom: "24px",
              }}
            >
              Campaign Details
            </h2>

            {/* Campaign Info */}
            <div
              style={{
                background: "#f5f7ff",
                padding: "20px",
                borderRadius: "8px",
                marginBottom: "24px",
                borderLeft: "5px solid #667eea",
              }}
            >
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <p
                    style={{
                      color: "#666",
                      fontSize: "0.95rem",
                      marginBottom: "4px",
                    }}
                  >
                    File Name
                  </p>
                  <p
                    style={{
                      color: "#222",
                      fontWeight: "600",
                      fontSize: "1.1rem",
                    }}
                  >
                    {selectedCampaign.fileName}
                  </p>
                </div>
                <div>
                  <p
                    style={{
                      color: "#666",
                      fontSize: "0.95rem",
                      marginBottom: "4px",
                    }}
                  >
                    Upload Date
                  </p>
                  <p
                    style={{
                      color: "#222",
                      fontWeight: "600",
                      fontSize: "1.1rem",
                    }}
                  >
                    {new Date(selectedCampaign.uploadedAt).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )}
                  </p>
                </div>
                <div>
                  <p
                    style={{
                      color: "#666",
                      fontSize: "0.95rem",
                      marginBottom: "4px",
                    }}
                  >
                    Total Rows
                  </p>
                  <p
                    style={{
                      color: "#222",
                      fontWeight: "600",
                      fontSize: "1.1rem",
                    }}
                  >
                    {selectedCampaign.rows ? selectedCampaign.rows.length : 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Data Table */}
            {selectedCampaign.rows && selectedCampaign.rows.length > 0 && (
              <div>
                <h3
                  style={{
                    color: "#222",
                    fontWeight: "600",
                    fontSize: "1.2rem",
                    marginBottom: "16px",
                  }}
                >
                  Campaign Data
                </h3>
                <div
                  style={{
                    overflowX: "auto",
                    maxHeight: "500px",
                    overflowY: "auto",
                    border: "1px solid #e0e0e0",
                    borderRadius: "8px",
                  }}
                >
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      fontSize: "0.9rem",
                    }}
                  >
                    <thead
                      style={{
                        position: "sticky",
                        top: 0,
                        background: "#667eea",
                        color: "#fff",
                        zIndex: 10,
                      }}
                    >
                      <tr>
                        {Object.keys(selectedCampaign.rows[0]).map(
                          (header, index) => (
                            <th
                              key={index}
                              style={{
                                padding: "12px",
                                textAlign: "left",
                                fontWeight: "600",
                                border: "1px solid rgba(255,255,255,0.2)",
                              }}
                            >
                              {header}
                            </th>
                          )
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {selectedCampaign.rows.slice(0, 100).map((row, rowIndex) => (
                        <tr
                          key={rowIndex}
                          style={{
                            background:
                              rowIndex % 2 === 0 ? "#fff" : "#f9f9f9",
                          }}
                        >
                          {Object.keys(selectedCampaign.rows[0]).map(
                            (header, colIndex) => (
                              <td
                                key={colIndex}
                                style={{
                                  padding: "10px 12px",
                                  border: "1px solid #e0e0e0",
                                  color: "#222",
                                }}
                              >
                                {row[header] !== undefined &&
                                row[header] !== null
                                  ? String(row[header])
                                  : ""}
                              </td>
                            )
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {selectedCampaign.rows.length > 100 && (
                    <div
                      style={{
                        padding: "12px",
                        textAlign: "center",
                        background: "#f5f5f5",
                        color: "#666",
                        fontSize: "0.9rem",
                      }}
                    >
                      Showing first 100 rows of {selectedCampaign.rows.length}{" "}
                      total rows
                    </div>
                  )}
                </div>
              </div>
            )}

            <button
              onClick={closeModal}
              style={{
                width: "100%",
                marginTop: "24px",
                padding: "12px",
                background: "linear-gradient(90deg,#667eea 0%,#764ba2 100%)",
                color: "#fff",
                border: "none",
                borderRadius: "10px",
                fontWeight: "700",
                fontSize: "1.08rem",
                cursor: "pointer",
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && campaignToDelete && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1001,
            animation: "fadeIn 0.3s ease-in-out",
          }}
          onClick={closeDeleteModal}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "16px",
              padding: "32px",
              maxWidth: "480px",
              width: "90%",
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.15)",
              animation: "slideUp 0.4s ease-out",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                fontSize: "3.5rem",
                marginBottom: "16px",
                textAlign: "center",
                color: "#ef4444",
              }}
            >
              ⚠️
            </div>

            <h2
              style={{
                color: "#222",
                fontWeight: "700",
                fontSize: "1.5rem",
                marginBottom: "12px",
                textAlign: "center",
              }}
            >
              Delete Campaign
            </h2>

            <p
              style={{
                color: "#444",
                fontSize: "1.08rem",
                fontWeight: "500",
                marginBottom: "28px",
                lineHeight: "1.6",
                textAlign: "center",
              }}
            >
              Are you sure you want to delete <strong>&quot;{campaignToDelete.fileName}&quot;</strong>? This action cannot be undone.
            </p>

            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={closeDeleteModal}
                disabled={deleting}
                style={{
                  flex: 1,
                  padding: "14px",
                  background: "#f3f4f6",
                  color: "#222",
                  border: "none",
                  borderRadius: "10px",
                  fontWeight: "700",
                  fontSize: "1.08rem",
                  cursor: deleting ? "not-allowed" : "pointer",
                  opacity: deleting ? 0.6 : 1,
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleting}
                style={{
                  flex: 1,
                  padding: "14px",
                  background: deleting ? "#ccc" : "linear-gradient(90deg,#ef4444 0%,#dc2626 100%)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "10px",
                  fontWeight: "700",
                  fontSize: "1.08rem",
                  cursor: deleting ? "not-allowed" : "pointer",
                  boxShadow: deleting ? "none" : "0 4px 16px rgba(239,68,68,0.15)",
                  transition: "all 0.2s",
                }}
              >
                {deleting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        .campaigns-full-width-container {
          width: calc(100% + 60px);
          margin-left: -30px;
          margin-right: -30px;
        }
        
        .campaigns-content-wrapper {
          padding: 0 20px;
        }
        
        @media (max-width: 767.98px) {
          .campaigns-full-width-container {
            width: calc(100% + 60px);
            margin-left: -30px;
            margin-right: -30px;
            padding: 20px 0;
          }
          
          .campaigns-content-wrapper {
            padding: 0 15px;
          }
        }
        
        @media (max-width: 575.98px) {
          .campaigns-full-width-container {
            width: calc(100% + 40px);
            margin-left: -20px;
            margin-right: -20px;
            padding: 15px 0;
          }
          
          .campaigns-content-wrapper {
            padding: 0 10px;
          }
        }
      `}</style>
    </>
  );
}
