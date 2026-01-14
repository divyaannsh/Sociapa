"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";
import PageHeader from "../../../components/PageHeader";

const DIMENSION_FIELD_DEFINITIONS = [
  { key: "platform", patterns: ["platform", "channel", "network", "publisher"] },
  { key: "accountId", patterns: ["account id", "account_id", "ad account id", "acct id"] },
  { key: "account", patterns: ["account name", "ad account", "account"] },
  { key: "campaignId", patterns: ["campaign id", "campaign_id", "campaign id (facebook)"] },
  { key: "campaign", patterns: ["campaign", "campaign name"] },
  { key: "adSetId", patterns: ["ad set id", "adset id", "ad_set id", "ad group id"] },
  { key: "adSet", patterns: ["ad set", "adset", "ad group"] },
  { key: "adId", patterns: ["ad id", "ad_id", "creative id"] },
  { key: "ad", patterns: ["ad name", "ad", "creative name"] },
  { key: "status", patterns: ["status", "delivery", "state"] },
  { key: "objective", patterns: ["objective", "campaign objective", "goal"] },
  { key: "placement", patterns: ["placement", "publisher platform", "platform position"] },
  { key: "country", patterns: ["country", "location", "region", "geo"] },
  { key: "device", patterns: ["device", "platform device", "impression device"] },
  { key: "age", patterns: ["age", "age range"] },
  { key: "gender", patterns: ["gender"] },
  { key: "bidStrategy", patterns: ["bid strategy", "bid type"] },
  { key: "optimizationGoal", patterns: ["optimization goal", "optimization event", "optimization"] },
  { key: "dateStart", patterns: ["start date", "reporting starts", "date start", "from date"] },
  { key: "dateEnd", patterns: ["end date", "reporting ends", "date stop", "to date"] },
  { key: "date", patterns: ["date", "day"] },
];

const SELECT_FILTERS = [
  { key: "platform", label: "Platform", placeholder: "All Platforms" },
  { key: "account", label: "Ad Account", placeholder: "All Ad Accounts" },
  { key: "accountId", label: "Account ID", placeholder: "All Account IDs" },
  { key: "campaign", label: "Campaign", placeholder: "All Campaigns", dependsOn: "platform", optionsType: "campaign" },
  { key: "campaignId", label: "Campaign ID", placeholder: "All Campaign IDs" },
  { key: "adSet", label: "Ad Set", placeholder: "All Ad Sets", dependsOn: "campaign", optionsType: "adSet" },
  { key: "adSetId", label: "Ad Set ID", placeholder: "All Ad Set IDs" },
  { key: "ad", label: "Ad", placeholder: "All Ads", dependsOn: "adSet", optionsType: "ad" },
  { key: "adId", label: "Ad ID", placeholder: "All Ad IDs" },
  { key: "status", label: "Delivery Status", placeholder: "All Statuses" },
  { key: "objective", label: "Objective", placeholder: "All Objectives" },
  { key: "placement", label: "Placement", placeholder: "All Placements" },
  { key: "country", label: "Country / Region", placeholder: "All Countries" },
  { key: "device", label: "Device", placeholder: "All Devices" },
  { key: "age", label: "Age Range", placeholder: "All Age Ranges" },
  { key: "gender", label: "Gender", placeholder: "All Genders" },
  { key: "bidStrategy", label: "Bid Strategy", placeholder: "All Strategies" },
  { key: "optimizationGoal", label: "Optimization Goal", placeholder: "All Optimization Goals" },
];

const SELECT_FILTER_KEYS = SELECT_FILTERS.map((filter) => filter.key);
const SELECT_FILTER_LABEL_MAP = SELECT_FILTERS.reduce((acc, filter) => {
  acc[filter.key] = filter.label;
  return acc;
}, {});

const METRIC_FILTERS = [
  { key: "impressions", label: "Impressions", patterns: ["impressions"] },
  { key: "clicks", label: "Clicks", patterns: ["clicks", "link clicks"] },
  { key: "spend", label: "Amount Spent", patterns: ["spend", "amount spent", "cost"] },
  { key: "conversions", label: "Conversions", patterns: ["conversions", "leads", "purchases"] },
];

const METRIC_LABEL_MAP = METRIC_FILTERS.reduce((acc, metric) => {
  acc[metric.key] = metric.label;
  return acc;
}, {});

const createDefaultMetricFilters = () =>
  METRIC_FILTERS.reduce((acc, metric) => {
    acc[metric.key] = { min: "", max: "" };
    return acc;
  }, {});

const getDefaultFilters = () => ({
  platform: "",
  account: "",
  accountId: "",
  campaign: "",
  campaignId: "",
  adSet: "",
  adSetId: "",
  ad: "",
  adId: "",
  status: "",
  objective: "",
  placement: "",
  country: "",
  device: "",
  age: "",
  gender: "",
  bidStrategy: "",
  optimizationGoal: "",
  dateRange: { start: "", end: "" },
  metrics: createDefaultMetricFilters(),
});

const getDefaultExpandedFilters = () =>
  SELECT_FILTER_KEYS.reduce(
    (acc, key) => ({
      ...acc,
      [key]: false,
    }),
    {}
  );

const matchesPattern = (header, patterns) => {
  if (!header) return false;
  const headerLower = header.toLowerCase().trim();
  return patterns.some((pattern) => headerLower.includes(pattern));
};

export default function CampaignsCreate() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [clients, setClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState("");
  const [clientCampaigns, setClientCampaigns] = useState([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(false);
  const [deletingCampaignId, setDeletingCampaignId] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [customFileName, setCustomFileName] = useState("");
  const [parsedData, setParsedData] = useState(null);
  const [headers, setHeaders] = useState([]);
  const [rows, setRows] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [campaignToDelete, setCampaignToDelete] = useState(null);
  
  // Filter states
  const [filters, setFilters] = useState(() => getDefaultFilters());
  const [expandedFilters, setExpandedFilters] = useState(() => getDefaultExpandedFilters());

  // Fetch clients on component mount
  useEffect(() => {
    fetchClients();
  }, []);

  // Fetch campaigns when client is selected
  useEffect(() => {
    if (selectedClientId) {
      fetchClientCampaigns(selectedClientId);
    } else {
      setClientCampaigns([]);
    }
  }, [selectedClientId]);

  const fetchClientCampaigns = async (clientId) => {
    setLoadingCampaigns(true);
    try {
      const response = await fetch(`/api/campaigns?clientId=${clientId}`);
      const data = await response.json();
      if (response.ok) {
        setClientCampaigns(data.campaigns || []);
      } else {
        console.error("Failed to load campaigns:", data);
      }
    } catch (err) {
      console.error("Error fetching campaigns:", err);
    } finally {
      setLoadingCampaigns(false);
    }
  };

  const handleDeleteCampaign = (campaign) => {
    setCampaignToDelete(campaign);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setCampaignToDelete(null);
  };

  const handleDeleteConfirm = async () => {
    if (!campaignToDelete) return;

    setDeletingCampaignId(campaignToDelete._id);
    try {
      const response = await fetch(`/api/campaigns/${campaignToDelete._id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to delete campaign");
        setModalType("error");
        setShowModal(true);
        closeDeleteModal();
        return;
      }

      // Remove campaign from local state
      setClientCampaigns((prev) => prev.filter((c) => c._id !== campaignToDelete._id));
      
      setSuccess("Campaign deleted successfully!");
      setModalType("success");
      setShowModal(true);
      closeDeleteModal();
    } catch (err) {
      console.error("Error deleting campaign:", err);
      setError("An error occurred while deleting the campaign");
      setModalType("error");
      setShowModal(true);
      closeDeleteModal();
    } finally {
      setDeletingCampaignId(null);
    }
  };

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
    }
  };

  // Function to detect the header row by looking for common header patterns
  const detectHeaderRow = (worksheet, maxRowsToCheck = 20) => {
    const range = XLSX.utils.decode_range(worksheet["!ref"] || "A1:A1");
    const maxRow = Math.min(range.e.r, maxRowsToCheck - 1);

    for (let row = 0; row <= maxRow; row++) {
      const rowData = [];
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
        const cell = worksheet[cellAddress];
        rowData.push(cell ? cell.v : "");
      }

      // Check if this row looks like a header (has multiple non-empty text cells)
      const nonEmptyCount = rowData.filter(
        (cell) => cell && typeof cell === "string" && cell.trim().length > 0
      ).length;

      // If we have at least 3 non-empty cells, likely a header row
      if (nonEmptyCount >= 3) {
        // Check if next row has data (not empty)
        const nextRowData = [];
        if (row < maxRow) {
          for (let col = range.s.c; col <= range.e.c; col++) {
            const cellAddress = XLSX.utils.encode_cell({ r: row + 1, c: col });
            const cell = worksheet[cellAddress];
            nextRowData.push(cell ? cell.v : "");
          }
          const nextRowNonEmpty = nextRowData.filter(
            (cell) => cell && cell.toString().trim().length > 0
          ).length;

          // If next row also has data, this is likely the header
          if (nextRowNonEmpty >= 2) {
            return row;
          }
        }
      }
    }

    // Default to first row if no header detected
    return 0;
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (
      !file.name.endsWith(".xlsx") &&
      !file.name.endsWith(".xls")
    ) {
      setError("Please upload a valid Excel file (.xlsx or .xls)");
      setModalType("error");
      setShowModal(true);
      return;
    }

    setSelectedFile(file);
    // Set default custom file name to original file name (without extension)
    const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
    setCustomFileName(fileNameWithoutExt);
    setError("");
    setParsedData(null);
    setHeaders([]);
    setRows([]);

    try {
      setLoading(true);

      // Read file as array buffer
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "array" });

      // Try to find "Raw Data Report" sheet, fallback to "Formatted Report"
      let sheetName = null;
      if (workbook.SheetNames.includes("Raw Data Report")) {
        sheetName = "Raw Data Report";
      } else if (workbook.SheetNames.includes("Formatted Report")) {
        sheetName = "Formatted Report";
      } else if (workbook.SheetNames.length > 0) {
        // Fallback to first sheet if neither exists
        sheetName = workbook.SheetNames[0];
      } else {
        throw new Error("No sheets found in the Excel file");
      }

      const worksheet = workbook.Sheets[sheetName];

      // Detect header row
      const headerRowIndex = detectHeaderRow(worksheet);

      // Convert to JSON starting from header row
      const jsonData = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        defval: "",
      });

      // Extract headers (from detected header row)
      const detectedHeaders = jsonData[headerRowIndex] || [];
      const cleanHeaders = detectedHeaders.map((h) =>
        h ? String(h).trim() : ""
      );

      // Extract data rows (skip header row and any empty rows)
      const dataRows = jsonData.slice(headerRowIndex + 1).filter((row) => {
        // Filter out completely empty rows
        return row.some((cell) => cell && String(cell).trim().length > 0);
      });

      // Convert rows to objects with header keys
      const rowsAsObjects = dataRows.map((row) => {
        const rowObj = {};
        cleanHeaders.forEach((header, index) => {
          if (header) {
            rowObj[header] = row[index] || "";
          }
        });
        return rowObj;
      });

      setHeaders(cleanHeaders);
      setRows(rowsAsObjects);
      setParsedData({
        sheetName,
        totalRows: rowsAsObjects.length,
        headers: cleanHeaders,
        rows: rowsAsObjects,
      });
    } catch (err) {
      console.error("Error parsing Excel:", err);
      setError(
        err.message || "Failed to parse Excel file. Please check the file format."
      );
      setModalType("error");
      setShowModal(true);
      setSelectedFile(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedClientId || !parsedData) {
      setError("Please select a client and upload a file");
      setModalType("error");
      setShowModal(true);
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      // Use custom file name if provided, otherwise use original file name
      const finalFileName = customFileName.trim() || selectedFile.name;
      
      const response = await fetch("/api/campaigns/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: selectedClientId,
          fileName: finalFileName,
          rows: parsedData.rows,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to save campaign");
        setModalType("error");
        setShowModal(true);
        setSaving(false);
        return;
      }

      setSuccess("Campaign saved successfully!");
      setModalType("success");
      setShowModal(true);

      // Refresh campaigns list after successful save
      if (selectedClientId) {
        fetchClientCampaigns(selectedClientId);
      }

      // Reset form after successful save
      setTimeout(() => {
        setSelectedFile(null);
        setCustomFileName("");
        setParsedData(null);
        setHeaders([]);
        setRows([]);
        setFilters(getDefaultFilters());
        setExpandedFilters(getDefaultExpandedFilters());
        setShowModal(false);
      }, 2000);
    } catch (err) {
      setError(err.message || "An error occurred while saving the campaign");
      setModalType("error");
      setShowModal(true);
    } finally {
      setSaving(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setError("");
    setSuccess("");
  };

  const isSaveDisabled = !selectedClientId || !parsedData || saving;

  // Find field mappings from headers
  const fieldMappings = useMemo(() => {
    if (!headers.length || !rows.length) return {};

    const mappings = {};
    const usedHeaders = new Set();

    DIMENSION_FIELD_DEFINITIONS.forEach(({ key, patterns }) => {
      if (mappings[key]) return;
      const match = headers.find(
        (header) => header && !usedHeaders.has(header) && matchesPattern(header, patterns)
      );
      if (match) {
        mappings[key] = match;
        usedHeaders.add(match);
      }
    });

    return mappings;
  }, [headers, rows]);

  const metricMappings = useMemo(() => {
    if (!headers.length || !rows.length) return {};

    const mappings = {};
    METRIC_FILTERS.forEach(({ key, patterns }) => {
      const match = headers.find((header) => header && matchesPattern(header, patterns));
      if (match) {
        mappings[key] = match;
      }
    });

    return mappings;
  }, [headers, rows]);

  // Extract unique values for each filter field
  const filterOptions = useMemo(() => {
    if (!rows.length) return {};

    const options = {};

    SELECT_FILTER_KEYS.forEach((key) => {
      const headerName = fieldMappings[key];
      if (headerName) {
        const uniqueValues = [
          ...new Set(
            rows
              .map((row) => row[headerName])
              .filter((val) => val !== null && val !== undefined && val !== "")
              .map((val) => String(val).trim())
          ),
        ].sort();
        options[key] = uniqueValues;
      }
    });

    return options;
  }, [rows, fieldMappings]);

  // Get nested filter options based on parent selections
  const getNestedOptions = (fieldKey) => {
    if (!rows.length) return [];
    
    // Filter rows based on parent filters
    let filteredRows = rows;
    
    if (fieldKey === "campaign" && filters.platform && fieldMappings.platform) {
      filteredRows = filteredRows.filter(
        (row) => String(row[fieldMappings.platform] || "").trim() === filters.platform
      );
    } else if (fieldKey === "adSet" && filters.campaign && fieldMappings.campaign) {
      filteredRows = filteredRows.filter(
        (row) => String(row[fieldMappings.campaign] || "").trim() === filters.campaign
      );
    } else if (fieldKey === "ad" && filters.adSet && fieldMappings.adSet) {
      filteredRows = filteredRows.filter(
        (row) => String(row[fieldMappings.adSet] || "").trim() === filters.adSet
      );
    }
    
    const headerName = fieldMappings[fieldKey];
    if (!headerName) return [];
    
    const uniqueValues = [...new Set(
      filteredRows
        .map((row) => row[headerName])
        .filter((val) => val !== null && val !== undefined && val !== "")
        .map((val) => String(val).trim())
    )].sort();
    
    return uniqueValues;
  };

  // Filter rows based on selected filters
  const filteredRows = useMemo(() => {
    if (!rows.length) return [];
    
    let filtered = rows;
    
    SELECT_FILTER_KEYS.forEach((key) => {
      if (filters[key] && fieldMappings[key]) {
        filtered = filtered.filter(
          (row) => String(row[fieldMappings[key]] ?? "").trim() === filters[key]
        );
      }
    });

    const hasDateFilter = filters.dateRange.start || filters.dateRange.end;
    if (hasDateFilter && (fieldMappings.date || fieldMappings.dateStart || fieldMappings.dateEnd)) {
      const startDateInput = filters.dateRange.start ? new Date(filters.dateRange.start) : null;
      const endDateInput = filters.dateRange.end ? new Date(filters.dateRange.end) : null;
      const startDate =
        startDateInput && !Number.isNaN(startDateInput.getTime()) ? startDateInput : null;
      const endDate = endDateInput && !Number.isNaN(endDateInput.getTime()) ? endDateInput : null;

      filtered = filtered.filter((row) => {
        const rowStartValue = fieldMappings.dateStart
          ? row[fieldMappings.dateStart]
          : row[fieldMappings.date];
        const rowEndValue = fieldMappings.dateEnd
          ? row[fieldMappings.dateEnd]
          : row[fieldMappings.dateStart] || row[fieldMappings.date];

        const rowStartDate = parseDateValue(rowStartValue);
        const rowEndDate = parseDateValue(rowEndValue || rowStartValue);

        if (startDate && (!rowEndDate || rowEndDate < startDate)) {
          return false;
        }
        if (endDate && (!rowStartDate || rowStartDate > endDate)) {
          return false;
        }

        return true;
      });
    }

    Object.entries(filters.metrics).forEach(([metricKey, range]) => {
      if (!range.min && !range.max) return;
      const metricColumn = metricMappings[metricKey];
      if (!metricColumn) return;
      const minValue = range.min ? Number(range.min) : null;
      const maxValue = range.max ? Number(range.max) : null;

      filtered = filtered.filter((row) => {
        const numericValue = parseNumericValue(row[metricColumn]);

        if (minValue !== null && (numericValue === null || numericValue < minValue)) {
          return false;
        }

        if (maxValue !== null && (numericValue === null || numericValue > maxValue)) {
          return false;
        }

        return true;
      });
    });
    
    return filtered;
  }, [rows, filters, fieldMappings, metricMappings]);

  // Handle filter change
  const handleFilterChange = (filterKey, value) => {
    setFilters((prev) => {
      const newFilters = { ...prev, [filterKey]: value };
      
      // Reset dependent filters when parent changes
      if (filterKey === "platform") {
        newFilters.campaign = "";
        newFilters.adSet = "";
        newFilters.ad = "";
      } else if (filterKey === "campaign") {
        newFilters.adSet = "";
        newFilters.ad = "";
      } else if (filterKey === "adSet") {
        newFilters.ad = "";
      }
      
      return newFilters;
    });
  };

  // Toggle filter expansion
  const toggleFilter = (filterKey) => {
    setExpandedFilters((prev) => ({
      ...prev,
      [filterKey]: !prev[filterKey],
    }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters(getDefaultFilters());
    setExpandedFilters(getDefaultExpandedFilters());
  };

  const handleMetricChange = (metricKey, bound, value) => {
    setFilters((prev) => ({
      ...prev,
      metrics: {
        ...prev.metrics,
        [metricKey]: {
          ...prev.metrics[metricKey],
          [bound]: value,
        },
      },
    }));
  };

  const handleDateRangeChange = (bound, value) => {
    setFilters((prev) => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        [bound]: value,
      },
    }));
  };

  const parseDateValue = (value) => {
    if (value === null || value === undefined || value === "") return null;
    if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
    if (typeof value === "number") {
      const parsed = XLSX.SSF?.parse_date_code?.(value);
      if (parsed) {
        return new Date(
          parsed.y,
          (parsed.m || 1) - 1,
          parsed.d || 1,
          parsed.H || 0,
          parsed.M || 0,
          parsed.S || 0
        );
      }
      const excelEpoch = new Date(Date.UTC(1899, 11, 30));
      const converted = new Date(excelEpoch.getTime() + value * 86400000);
      if (!Number.isNaN(converted.getTime())) {
        return converted;
      }
    }
    const parsedDate = new Date(value);
    if (!Number.isNaN(parsedDate.getTime())) return parsedDate;
    return null;
  };

  const parseNumericValue = (value) => {
    if (value === null || value === undefined || value === "") return null;
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string") {
      const normalized = value.replace(/[^0-9.,-]/g, "").replace(/,/g, "");
      if (!normalized) return null;
      const parsed = Number(normalized);
      return Number.isFinite(parsed) ? parsed : null;
    }
    return null;
  };

  // Check if any filter is active
  const hasActiveFilters = useMemo(() => {
    const selectActive = SELECT_FILTER_KEYS.some((key) => filters[key]);
    const dateActive = filters.dateRange.start || filters.dateRange.end;
    const metricActive = Object.values(filters.metrics).some(
      (range) => range.min || range.max
    );
    return selectActive || dateActive || metricActive;
  }, [filters]);

  const getSelectOptions = (key) => {
    if (key === "campaign") return getNestedOptions("campaign");
    if (key === "adSet") return getNestedOptions("adSet");
    if (key === "ad") return getNestedOptions("ad");
    return filterOptions[key] || [];
  };

  const renderSelectFilter = (filterKey) => {
    const config = SELECT_FILTERS.find((filter) => filter.key === filterKey);
    if (!config || !fieldMappings[filterKey]) return null;

    const options = getSelectOptions(filterKey);
    const hasParentField = config.dependsOn && fieldMappings[config.dependsOn];
    const shouldDisable = hasParentField && !filters[config.dependsOn] && options.length > 0;

    return (
      <div key={filterKey}>
        <div
          onClick={() => toggleFilter(filterKey)}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "10px",
            background: "#fff",
            borderRadius: "8px",
            cursor: "pointer",
            border: "1px solid #e0e0e0",
            marginBottom: expandedFilters[filterKey] ? "8px" : "0",
          }}
        >
          <label
            style={{
              fontWeight: "600",
              fontSize: "0.95rem",
              color: "#222",
              cursor: "pointer",
            }}
          >
            {config.label}
          </label>
          <i
            className={`feather-chevron-${expandedFilters[filterKey] ? "up" : "down"}`}
            style={{ fontSize: "0.9rem", color: "#666" }}
          ></i>
        </div>
        {expandedFilters[filterKey] && (
          <select
            value={filters[filterKey]}
            onChange={(e) => handleFilterChange(filterKey, e.target.value)}
            disabled={shouldDisable}
            style={{
              width: "100%",
              padding: "10px",
              fontSize: "0.95rem",
              border: "1px solid #e0e0e0",
              borderRadius: "8px",
              background: shouldDisable ? "#f5f5f5" : "#fff",
              color: "#222",
              cursor: shouldDisable ? "not-allowed" : "pointer",
            }}
          >
            <option value="">{config.placeholder || "All"}</option>
            {options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        )}
      </div>
    );
  };

  const filterGroups = [
    {
      title: "Account & Structure",
      keys: ["platform", "account", "accountId", "campaign", "campaignId", "adSet", "adSetId", "ad", "adId"],
    },
    {
      title: "Delivery & Audience",
      keys: [
        "status",
        "objective",
        "placement",
        "country",
        "device",
        "age",
        "gender",
        "bidStrategy",
        "optimizationGoal",
      ],
    },
  ];

  const activeFilterSummary = useMemo(() => {
    const summary = [];

    SELECT_FILTERS.forEach(({ key, label }) => {
      if (filters[key]) {
        summary.push(`${label}: ${filters[key]}`);
      }
    });

    if (filters.dateRange.start || filters.dateRange.end) {
      summary.push(
        `Date Range: ${filters.dateRange.start || "Any"} → ${filters.dateRange.end || "Any"}`
      );
    }

    Object.entries(filters.metrics).forEach(([metricKey, range]) => {
      if (!range.min && !range.max) return;
      const parts = [];
      if (range.min) parts.push(`≥ ${range.min}`);
      if (range.max) parts.push(`≤ ${range.max}`);
      summary.push(`${METRIC_LABEL_MAP[metricKey] || metricKey}: ${parts.join(" & ")}`);
    });

    return summary;
  }, [filters]);

  return (
    <>
      <PageHeader
        title="Create Campaign"
        breadcrumb={[
          { label: "Home", path: "/" },
          { label: "Campaigns", path: "/campaigns" },
          { label: "Create", path: "/campaigns/create" },
        ]}
      />

      <div className="main-content">
        <div
          style={{
            background: "#fff",
            width: "100vw",
            minHeight: "calc(100vh - 80px)",
            marginLeft: "calc(-50vw + 50%)",
            marginRight: "calc(-50vw + 50%)",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            padding: "40px 0",
          }}
        >
          <div style={{ width: "90vw", maxWidth: "1400px" }}>
            <div
              style={{
                background: "#fff",
                boxShadow: "0 2px 16px rgba(0,0,0,0.08)",
                borderRadius: "12px",
                padding: "32px",
                width: "100%",
              }}
            >
              {/* Client Selection */}
              <div style={{ marginBottom: "24px" }}>
                <label
                  style={{
                    color: "#222",
                    fontWeight: "600",
                    fontSize: "1.08rem",
                    marginBottom: "8px",
                    display: "block",
                  }}
                >
                  Select Client
                  <span className="text-danger" style={{ marginLeft: "4px" }}>
                    *
                  </span>
                </label>
                <select
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  disabled={loading || saving}
                  style={{
                    width: "100%",
                    padding: "12px",
                    fontSize: "1.08rem",
                    border: "1px solid #e0e0e0",
                    borderRadius: "8px",
                    background: "#fff",
                    color: "#222",
                  }}
                >
                  <option value="">-- Select a client --</option>
                  {clients.map((client) => (
                    <option key={client._id} value={client._id}>
                      {client.companyName || client.username}
                    </option>
                  ))}
                </select>
              </div>

              {/* Currently Added Data Section */}
              {selectedClientId && (
                <div style={{ marginBottom: "24px" }}>
                  <label
                    style={{
                      color: "#222",
                      fontWeight: "600",
                      fontSize: "1.08rem",
                      marginBottom: "12px",
                      display: "block",
                    }}
                  >
                    Currently Added Data
                  </label>
                  <div
                    style={{
                      background: "#f9fafb",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      padding: "16px",
                      maxHeight: "300px",
                      overflowY: "auto",
                    }}
                  >
                    {loadingCampaigns ? (
                      <div style={{ textAlign: "center", padding: "20px", color: "#666" }}>
                        <div className="spinner-border spinner-border-sm text-primary me-2"></div>
                        Loading campaigns...
                      </div>
                    ) : clientCampaigns.length === 0 ? (
                      <div style={{ textAlign: "center", padding: "20px", color: "#666" }}>
                        No campaigns uploaded yet for this client.
                      </div>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        {clientCampaigns.map((campaign) => (
                          <div
                            key={campaign._id}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              padding: "12px",
                              background: "#fff",
                              borderRadius: "6px",
                              border: "1px solid #e5e7eb",
                            }}
                          >
                            <div style={{ flex: 1 }}>
                              <div
                                style={{
                                  fontWeight: "600",
                                  color: "#222",
                                  fontSize: "0.95rem",
                                  marginBottom: "4px",
                                }}
                              >
                                {campaign.fileName}
                              </div>
                              <div
                                style={{
                                  fontSize: "0.85rem",
                                  color: "#666",
                                }}
                              >
                                Uploaded: {new Date(campaign.uploadedAt).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                                {campaign.rows && campaign.rows.length > 0 && (
                                  <span style={{ marginLeft: "12px" }}>
                                    • {campaign.rows.length} row{campaign.rows.length !== 1 ? "s" : ""}
                                  </span>
                                )}
                              </div>
                            </div>
                            <button
                              onClick={() => handleDeleteCampaign(campaign)}
                              disabled={deletingCampaignId === campaign._id}
                              style={{
                                padding: "8px 16px",
                                fontSize: "0.9rem",
                                border: "none",
                                borderRadius: "6px",
                                background: deletingCampaignId === campaign._id ? "#ccc" : "#ef4444",
                                color: "#fff",
                                cursor: deletingCampaignId === campaign._id ? "not-allowed" : "pointer",
                                fontWeight: "600",
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                whiteSpace: "nowrap",
                                opacity: deletingCampaignId === campaign._id ? 0.6 : 1,
                                transition: "all 0.2s",
                              }}
                              title="Delete this campaign"
                            >
                              {deletingCampaignId === campaign._id ? (
                                <>
                                  <span className="spinner-border spinner-border-sm"></span>
                                  Deleting...
                                </>
                              ) : (
                                <>
                                  <i className="feather-trash-2" style={{ fontSize: "0.9rem" }}></i>
                                  Delete
                                </>
                              )}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* File Upload */}
              <div style={{ marginBottom: "24px" }}>
                <label
                  style={{
                    color: "#222",
                    fontWeight: "600",
                    fontSize: "1.08rem",
                    marginBottom: "8px",
                    display: "block",
                  }}
                >
                  Upload Excel File (.xlsx)
                  <span className="text-danger" style={{ marginLeft: "4px" }}>
                    *
                  </span>
                </label>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  disabled={loading || saving}
                  style={{
                    width: "100%",
                    padding: "12px",
                    fontSize: "1.08rem",
                    border: "1px solid #e0e0e0",
                    borderRadius: "8px",
                    background: "#fff",
                    color: "#222",
                  }}
                />
                {selectedFile && (
                  <p style={{ marginTop: "8px", color: "#666", fontSize: "0.9rem" }}>
                    Selected: {selectedFile.name}
                  </p>
                )}
              </div>

              {/* Custom File Name */}
              {selectedFile && (
                <div style={{ marginBottom: "24px" }}>
                  <label
                    style={{
                      color: "#222",
                      fontWeight: "600",
                      fontSize: "1.08rem",
                      marginBottom: "8px",
                      display: "block",
                    }}
                  >
                    Campaign Name
                    <span className="text-danger" style={{ marginLeft: "4px" }}>
                      *
                    </span>
                  </label>
                  <input
                    type="text"
                    value={customFileName}
                    onChange={(e) => setCustomFileName(e.target.value)}
                    placeholder="Enter a name for this campaign"
                    disabled={loading || saving}
                    style={{
                      width: "100%",
                      padding: "12px",
                      fontSize: "1.08rem",
                      border: "1px solid #e0e0e0",
                      borderRadius: "8px",
                      background: "#fff",
                      color: "#222",
                    }}
                  />
                  <p style={{ marginTop: "8px", color: "#666", fontSize: "0.85rem" }}>
                    This name will be displayed everywhere for this campaign. If left empty, the original file name will be used.
                  </p>
                </div>
              )}

              {/* Loading Indicator */}
              {loading && (
                <div
                  style={{
                    textAlign: "center",
                    padding: "20px",
                    color: "#666",
                  }}
                >
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p style={{ marginTop: "10px" }}>Parsing Excel file...</p>
                </div>
              )}

              {/* Parsed Data Table */}
              {parsedData && !loading && (
                <div style={{ marginTop: "32px" }}>
                  <div
                    style={{
                      marginBottom: "16px",
                      padding: "16px",
                      background: "#f5f7ff",
                      borderRadius: "8px",
                      borderLeft: "5px solid #667eea",
                    }}
                  >
                    <p style={{ margin: 0, fontWeight: "600", color: "#222" }}>
                      File parsed successfully! Found {parsedData.totalRows} rows
                      from sheet: &quot;{parsedData.sheetName}&quot;
                    </p>
                  </div>

                  {/* Filters Section */}
                  <div className="filter-panel">
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "16px",
                      }}
                    >
                      <h3
                        style={{
                          margin: 0,
                          fontSize: "1.2rem",
                          fontWeight: "700",
                          color: "#222",
                        }}
                      >
                        <i className="feather-filter me-2"></i>
                        Filters
                      </h3>
                      {hasActiveFilters && (
                        <button
                          onClick={clearFilters}
                          style={{
                            padding: "6px 16px",
                            fontSize: "0.9rem",
                            background: "#ef4444",
                            color: "#fff",
                            border: "none",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontWeight: "600",
                          }}
                        >
                          Clear All
                        </button>
                      )}
                    </div>

                    <div className="filter-panels-grid">
                      {filterGroups.map((group) => {
                      const renderedFilters = group.keys
                        .map((key) => renderSelectFilter(key))
                        .filter(Boolean);
                      if (!renderedFilters.length) return null;
                      return (
                          <div key={group.title} className="filter-panel-card">
                          <h4
                            style={{
                              fontSize: "1rem",
                              fontWeight: "700",
                              color: "#444",
                            }}
                          >
                            {group.title}
                          </h4>
                            <div className="filter-card-grid">{renderedFilters}</div>
                          </div>
                        );
                      })}
                    </div>

                    {(fieldMappings.date || fieldMappings.dateStart || fieldMappings.dateEnd) && (
                      <div className="filter-panel-card filter-card--dashed">
                        <h4
                          style={{
                            fontSize: "1rem",
                            fontWeight: "700",
                            color: "#444",
                          }}
                        >
                          Date Range
                        </h4>
                        <div className="filter-card-grid grid-two">
                          <div>
                            <label
                              style={{
                                fontWeight: "600",
                                fontSize: "0.9rem",
                                color: "#444",
                                marginBottom: "6px",
                                display: "block",
                              }}
                            >
                              From
                            </label>
                            <input
                              type="date"
                              value={filters.dateRange.start}
                              onChange={(e) => handleDateRangeChange("start", e.target.value)}
                              style={{
                                width: "100%",
                                padding: "10px",
                                borderRadius: "8px",
                                border: "1px solid #e0e0e0",
                              }}
                            />
                          </div>
                          <div>
                            <label
                              style={{
                                fontWeight: "600",
                                fontSize: "0.9rem",
                                color: "#444",
                                marginBottom: "6px",
                                display: "block",
                              }}
                            >
                              To
                            </label>
                            <input
                              type="date"
                              value={filters.dateRange.end}
                              onChange={(e) => handleDateRangeChange("end", e.target.value)}
                              style={{
                                width: "100%",
                                padding: "10px",
                                borderRadius: "8px",
                                border: "1px solid #e0e0e0",
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {Object.keys(metricMappings).length > 0 && (
                      <div className="filter-panel-card filter-card--dashed">
                        <h4
                          style={{
                            fontSize: "1rem",
                            fontWeight: "700",
                            color: "#444",
                          }}
                        >
                          Performance Metrics (Min / Max)
                        </h4>
                        <div className="filter-card-grid grid-three">
                          {METRIC_FILTERS.filter(({ key }) => metricMappings[key]).map(
                            ({ key, label }) => (
                              <div
                                key={key}
                                style={{
                                  background: "#f9fafb",
                                  borderRadius: "10px",
                                  border: "1px solid #e5e7eb",
                                  padding: "12px",
                                }}
                              >
                                <label
                                  style={{
                                    fontWeight: "600",
                                    fontSize: "0.9rem",
                                    color: "#444",
                                    marginBottom: "8px",
                                    display: "block",
                                  }}
                                >
                                  {label}
                                </label>
                                <div
                                  style={{
                                    // display: "flex",
                                    gap: "18px",
                                  }}
                                >
                                  <input
                                    type="number"
                                    min="0"
                                    placeholder="Min"
                                    value={filters.metrics[key]?.min || ""}
                                    onChange={(e) => handleMetricChange(key, "min", e.target.value)}
                                    style={{
                                      flex: 1,
                                      padding: "8px",
                                      borderRadius: "8px",
                                      border: "1px solid #d1d5db",
                                    }}
                                  />
                                  <input
                                    type="number"
                                    min="0"
                                    placeholder="Max"
                                    value={filters.metrics[key]?.max || ""}
                                    onChange={(e) => handleMetricChange(key, "max", e.target.value)}
                                    style={{
                                      flex: 1,
                                      padding: "8px",
                                      borderRadius: "8px",
                                      border: "1px solid #d1d5db",
                                    }}
                                    className="mt-2"
                                  />
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                    {/* Filter Summary */}
                    {hasActiveFilters && (
                      <div
                        style={{
                          marginTop: "16px",
                          padding: "12px",
                          background: "#e0f2fe",
                          borderRadius: "8px",
                          fontSize: "0.9rem",
                          color: "#0369a1",
                        }}
                      >
                        <strong>Active Filters:</strong>{" "}
                        {activeFilterSummary.join(" • ") || "Custom filters applied"}{" "}
                        <span style={{ fontWeight: "600" }}>
                          ({filteredRows.length} of {rows.length} rows)
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Data Table */}
                  <div
                    style={{
                      overflowX: "auto",
                      maxHeight: "600px",
                      overflowY: "auto",
                      border: "1px solid #e0e0e0",
                      borderRadius: "8px",
                      marginBottom: "24px",
                    }}
                  >
                    <table
                      style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        fontSize: "0.95rem",
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
                          {headers.map((header, index) => (
                            <th
                              key={index}
                              style={{
                                padding: "12px",
                                textAlign: "left",
                                fontWeight: "600",
                                border: "1px solid rgba(255,255,255,0.2)",
                              }}
                            >
                              {header || `Column ${index + 1}`}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredRows.slice(0, 100).map((row, rowIndex) => (
                          <tr
                            key={rowIndex}
                            style={{
                              background: rowIndex % 2 === 0 ? "#fff" : "#f9f9f9",
                            }}
                          >
                            {headers.map((header, colIndex) => (
                              <td
                                key={colIndex}
                                style={{
                                  padding: "10px 12px",
                                  border: "1px solid #e0e0e0",
                                  color: "#222",
                                }}
                              >
                                {row[header] !== undefined && row[header] !== null
                                  ? String(row[header])
                                  : ""}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {filteredRows.length === 0 && (
                      <div
                        style={{
                          padding: "40px",
                          textAlign: "center",
                          background: "#fff",
                          color: "#666",
                          fontSize: "1rem",
                        }}
                      >
                        No data matches the selected filters. Try adjusting your filters.
                      </div>
                    )}
                    {filteredRows.length > 100 && (
                      <div
                        style={{
                          padding: "12px",
                          textAlign: "center",
                          background: "#f5f5f5",
                          color: "#666",
                          fontSize: "0.9rem",
                        }}
                      >
                        Showing first 100 rows of {filteredRows.length} filtered rows
                        {hasActiveFilters && ` (${rows.length} total rows)`}
                      </div>
                    )}
                    {filteredRows.length > 0 && filteredRows.length <= 100 && hasActiveFilters && (
                      <div
                        style={{
                          padding: "12px",
                          textAlign: "center",
                          background: "#f5f5f5",
                          color: "#666",
                          fontSize: "0.9rem",
                        }}
                      >
                        Showing {filteredRows.length} filtered rows of {rows.length} total rows
                      </div>
                    )}
                  </div>

                  {/* Save Button */}
                  <div style={{ textAlign: "center", marginTop: "24px" }}>
                    <button
                      onClick={handleSave}
                      disabled={isSaveDisabled}
                      style={{
                        padding: "16px 48px",
                        fontSize: "1.15rem",
                        fontWeight: "700",
                        background: isSaveDisabled
                          ? "#ccc"
                          : "linear-gradient(90deg,#667eea 0%,#764ba2 100%)",
                        color: "#fff",
                        border: "none",
                        borderRadius: "10px",
                        cursor: isSaveDisabled ? "not-allowed" : "pointer",
                        boxShadow: isSaveDisabled
                          ? "none"
                          : "0 4px 16px rgba(102,126,234,0.15)",
                        transition: "all 0.2s",
                        opacity: isSaveDisabled ? 0.6 : 1,
                      }}
                      onMouseEnter={(e) => {
                        if (!isSaveDisabled) {
                          e.target.style.transform = "translateY(-2px)";
                          e.target.style.boxShadow =
                            "0 6px 20px rgba(102,126,234,0.25)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSaveDisabled) {
                          e.target.style.transform = "translateY(0)";
                          e.target.style.boxShadow =
                            "0 4px 16px rgba(102,126,234,0.15)";
                        }
                      }}
                    >
                      {saving ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Saving...
                        </>
                      ) : (
                        <>
                          <i className="feather-save me-2"></i>
                          SAVE CAMPAIGN
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Overlay */}
      {showModal && (
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
              maxWidth: "480px",
              width: "90%",
              textAlign: "center",
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.15)",
              animation: "slideUp 0.4s ease-out",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                fontSize: "3.5rem",
                marginBottom: "16px",
                animation: "popIn 0.5s ease-out",
              }}
            >
              {modalType === "success" ? (
                <span style={{ color: "#10b981" }}>✓</span>
              ) : (
                <span style={{ color: "#ef4444" }}>✕</span>
              )}
            </div>

            <h2
              style={{
                color: "#222",
                fontWeight: "700",
                fontSize: "1.5rem",
                marginBottom: "12px",
              }}
            >
              {modalType === "success" ? "Success!" : "Error"}
            </h2>

            <p
              style={{
                color: "#444",
                fontSize: "1.08rem",
                fontWeight: "500",
                marginBottom: "28px",
                lineHeight: "1.6",
              }}
            >
              {modalType === "success" ? success : error}
            </p>

            <button
              onClick={closeModal}
              style={{
                background:
                  modalType === "success"
                    ? "linear-gradient(90deg,#10b981 0%,#059669 100%)"
                    : "linear-gradient(90deg,#ef4444 0%,#dc2626 100%)",
                color: "#fff",
                border: "none",
                borderRadius: "10px",
                padding: "14px 32px",
                fontWeight: "700",
                fontSize: "1.08rem",
                cursor: "pointer",
                boxShadow:
                  modalType === "success"
                    ? "0 4px 16px rgba(16,185,129,0.15)"
                    : "0 4px 16px rgba(239,68,68,0.15)",
                transition: "transform 0.2s, box-shadow 0.2s",
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow =
                  modalType === "success"
                    ? "0 6px 20px rgba(16,185,129,0.25)"
                    : "0 6px 20px rgba(239,68,68,0.25)";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow =
                  modalType === "success"
                    ? "0 4px 16px rgba(16,185,129,0.15)"
                    : "0 4px 16px rgba(239,68,68,0.15)";
              }}
            >
              {modalType === "success" ? "Continue" : "Try Again"}
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
                disabled={deletingCampaignId === campaignToDelete._id}
                style={{
                  flex: 1,
                  padding: "14px",
                  background: "#f3f4f6",
                  color: "#222",
                  border: "none",
                  borderRadius: "10px",
                  fontWeight: "700",
                  fontSize: "1.08rem",
                  cursor: deletingCampaignId === campaignToDelete._id ? "not-allowed" : "pointer",
                  opacity: deletingCampaignId === campaignToDelete._id ? 0.6 : 1,
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deletingCampaignId === campaignToDelete._id}
                style={{
                  flex: 1,
                  padding: "14px",
                  background: deletingCampaignId === campaignToDelete._id ? "#ccc" : "linear-gradient(90deg,#ef4444 0%,#dc2626 100%)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "10px",
                  fontWeight: "700",
                  fontSize: "1.08rem",
                  cursor: deletingCampaignId === campaignToDelete._id ? "not-allowed" : "pointer",
                  boxShadow: deletingCampaignId === campaignToDelete._id ? "none" : "0 4px 16px rgba(239,68,68,0.15)",
                  transition: "all 0.2s",
                }}
              >
                {deletingCampaignId === campaignToDelete._id ? (
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

      {/* CSS Animations */}
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

        @keyframes popIn {
          0% {
            transform: scale(0.5);
            opacity: 0;
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        .filter-panel {
          margin-bottom: 24px;
          padding: 20px;
          background: #f8f9fa;
          border-radius: 12px;
          border: 1px solid #e0e0e0;
        }

        .filter-panels-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 16px;
        }

        .filter-panel-card {
          background: #fff;
          border-radius: 12px;
          padding: 18px;
          border: 1px solid #e5e7eb;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .filter-card--dashed {
          border-style: dashed;
          border-color: #d1d5db;
        }

        .filter-card-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 14px;
        }

        .filter-card-grid.grid-two {
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        }

        .filter-card-grid.grid-three {
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        }

        @media (max-width: 768px) {
          .filter-panel {
            padding: 16px;
          }

          .filter-panel-card {
            padding: 14px;
          }

          .filter-card-grid {
            grid-template-columns: 1fr;
          }

          .filter-panels-grid {
            grid-template-columns: 1fr;
          }

          .filter-panel-card h4 {
            margin-bottom: 6px;
          }
        }
      `}</style>
    </>
  );
}

