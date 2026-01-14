"use client";

import { useState, useEffect } from "react";

const ClientSelector = ({ 
  onClientSelect, 
  onClientDataChange,
  showCurrentData = true,
  disabled = false,
  compact = false 
}) => {
  const [clients, setClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState("");
  const [loading, setLoading] = useState(true);
  const [clientData, setClientData] = useState(null);
  const [error, setError] = useState("");

  // Fetch clients on component mount
  useEffect(() => {
    fetchClients();
  }, []);

  // Fetch client data when client is selected
  useEffect(() => {
    if (selectedClientId) {
      fetchClientData(selectedClientId);
    } else {
      setClientData(null);
      onClientDataChange?.(null);
    }
  }, [selectedClientId]);

  const fetchClients = async () => {
    try {
      const response = await fetch("/api/clients");
      const data = await response.json();
      if (response.ok) {
        setClients(data.clients || []);
      } else {
        setError("Failed to load clients");
      }
    } catch (err) {
      console.error("Error fetching clients:", err);
      setError("Failed to load clients");
    } finally {
      setLoading(false);
    }
  };

  const fetchClientData = async (clientId) => {
    try {
      // Fetch campaigns for this client
      const campaignsResponse = await fetch(`/api/campaigns?clientId=${clientId}`);
      const campaignsData = await campaignsResponse.json();
      
      if (campaignsResponse.ok) {
        const clientInfo = clients.find(c => c._id === clientId);
        const data = {
          client: clientInfo,
          campaigns: campaignsData.campaigns || [],
          totalCampaigns: campaignsData.campaigns?.length || 0,
          totalSpend: calculateTotalSpend(campaignsData.campaigns || []),
          lastUpload: getLastUploadDate(campaignsData.campaigns || [])
        };
        
        setClientData(data);
        onClientSelect?.(clientId);
        onClientDataChange?.(data);
      } else {
        setError("Failed to load client data");
      }
    } catch (err) {
      console.error("Error fetching client data:", err);
      setError("Failed to load client data");
    }
  };

  const calculateTotalSpend = (campaigns) => {
    let totalSpend = 0;
    campaigns.forEach(campaign => {
      if (campaign.rows) {
        campaign.rows.forEach(row => {
          const spend = parseFloat(row["Amount spent (INR)"] || row["Amount spent"] || 0);
          if (!isNaN(spend)) totalSpend += spend;
        });
      }
    });
    return totalSpend;
  };

  const getLastUploadDate = (campaigns) => {
    if (campaigns.length === 0) return null;
    
    const dates = campaigns.map(c => new Date(c.uploadedAt));
    const latestDate = new Date(Math.max(...dates));
    return latestDate.toLocaleDateString();
  };

  const handleClientChange = (e) => {
    const clientId = e.target.value;
    setSelectedClientId(clientId);
    setError("");
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  if (loading) {
    return (
      <div style={{ marginBottom: "24px" }}>
        <label style={{
          color: "#222",
          fontWeight: "600",
          fontSize: "1.08rem",
          marginBottom: "8px",
          display: "block"
        }}>
          Select Client
          <span className="text-danger" style={{ marginLeft: "4px" }}>*</span>
        </label>
        <div style={{
          width: "100%",
          padding: "12px",
          fontSize: "1.08rem",
          border: "1px solid #e0e0e0",
          borderRadius: "8px",
          background: "#f5f5f5",
          color: "#666",
          textAlign: "center"
        }}>
          Loading clients...
        </div>
      </div>
    );
  }

  return (
    <div style={{ marginBottom: "24px" }}>
      <label style={{
        color: "#222",
        fontWeight: "600",
        fontSize: compact ? "0.9rem" : "1.08rem",
        marginBottom: "8px",
        display: "block"
      }}>
        Select Client
        <span className="text-danger" style={{ marginLeft: "4px" }}>*</span>
      </label>
      
      <select
        value={selectedClientId}
        onChange={handleClientChange}
        disabled={disabled}
        style={{
          width: "100%",
          padding: compact ? "8px 12px" : "12px",
          fontSize: compact ? "0.95rem" : "1.08rem",
          border: "1px solid #e0e0e0",
          borderRadius: "8px",
          background: disabled ? "#f5f5f5" : "#fff",
          color: "#222",
          cursor: disabled ? "not-allowed" : "pointer",
          marginBottom: error ? "8px" : "0",
          fontWeight: compact ? "600" : "normal"
        }}
      >
        <option value="">-- Select a client --</option>
        {clients.map((client) => (
          <option key={client._id} value={client._id}>
            {client.companyName || client.username}
          </option>
        ))}
      </select>

      {error && (
        <div style={{
          color: "#dc3545",
          fontSize: "0.9rem",
          marginTop: "4px"
        }}>
          {error}
        </div>
      )}

      {/* Client Data Summary */}
      {showCurrentData && clientData && (
        <div style={{
          marginTop: "16px",
          padding: "16px",
          background: "#f8f9fa",
          border: "1px solid #e9ecef",
          borderRadius: "8px"
        }}>
          <h4 style={{
            margin: "0 0 12px 0",
            color: "#222",
            fontSize: "1rem",
            fontWeight: "600"
          }}>
            Client Overview
          </h4>
          
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "12px"
          }}>
            <div>
              <div style={{ fontSize: "0.85rem", color: "#666", marginBottom: "4px" }}>
                Client Name
              </div>
              <div style={{ fontSize: "0.95rem", fontWeight: "500", color: "#222" }}>
                {clientData.client?.companyName || clientData.client?.username}
              </div>
            </div>
            
            <div>
              <div style={{ fontSize: "0.85rem", color: "#666", marginBottom: "4px" }}>
                Total Campaigns
              </div>
              <div style={{ fontSize: "0.95rem", fontWeight: "500", color: "#222" }}>
                {clientData.totalCampaigns}
              </div>
            </div>
            
            <div>
              <div style={{ fontSize: "0.85rem", color: "#666", marginBottom: "4px" }}>
                Total Spend
              </div>
              <div style={{ fontSize: "0.95rem", fontWeight: "500", color: "#222" }}>
                {formatCurrency(clientData.totalSpend)}
              </div>
            </div>
            
            <div>
              <div style={{ fontSize: "0.85rem", color: "#666", marginBottom: "4px" }}>
                Last Upload
              </div>
              <div style={{ fontSize: "0.95rem", fontWeight: "500", color: "#222" }}>
                {clientData.lastUpload || "No uploads yet"}
              </div>
            </div>
          </div>

          {/* Recent Campaigns List */}
          {clientData.campaigns.length > 0 && (
            <div style={{ marginTop: "16px" }}>
              <h5 style={{
                margin: "0 0 8px 0",
                fontSize: "0.9rem",
                fontWeight: "600",
                color: "#222"
              }}>
                Recent Campaigns
              </h5>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {clientData.campaigns.slice(0, 3).map((campaign) => (
                  <div
                    key={campaign._id}
                    style={{
                      padding: "8px 12px",
                      background: "#fff",
                      border: "1px solid #e9ecef",
                      borderRadius: "6px",
                      fontSize: "0.85rem",
                      color: "#495057"
                    }}
                  >
                    <div style={{ fontWeight: "500", marginBottom: "2px" }}>
                      {campaign.fileName}
                    </div>
                    <div style={{ color: "#6c757d", fontSize: "0.8rem" }}>
                      {campaign.rows?.length || 0} rows • 
                      {" " + new Date(campaign.uploadedAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
                {clientData.campaigns.length > 3 && (
                  <div style={{
                    padding: "8px 12px",
                    background: "#f8f9fa",
                    border: "1px solid #e9ecef",
                    borderRadius: "6px",
                    fontSize: "0.85rem",
                    color: "#6c757d",
                    textAlign: "center"
                  }}>
                    +{clientData.campaigns.length - 3} more campaigns
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ClientSelector;
