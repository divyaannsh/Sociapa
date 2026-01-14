'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export default function AnalyticsDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [campaigns, setCampaigns] = useState([]);
  const [dateFilter, setDateFilter] = useState('month'); // 'month', 'range', 'day'
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [activePlatform, setActivePlatform] = useState('all'); // 'all', 'google', 'meta', etc.

  // New State for Comparison
  const [viewMode, setViewMode] = useState('dashboard'); // 'dashboard' | 'comparison'
  const [globalData, setGlobalData] = useState({ clients: [], topPerformers: [] });
  const [compareSelection, setCompareSelection] = useState([]);
  const [compareMetric, setCompareMetric] = useState('spend'); // 'spend', 'impressions', 'clicks'

  // Fetch Clients
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await fetch('/api/clients');
        const data = await res.json();
        if (res.ok) {
          setClients(data.clients || []);
          if (data.clients && data.clients.length > 0) {
            setSelectedClientId(data.clients[0]._id);
          }
        }
      } catch (err) {
        console.error('Error fetching clients:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchClients();
  }, []);

  // Fetch Global Analytics Data
  useEffect(() => {
    const fetchGlobal = async () => {
      try {
        const res = await fetch('/api/analytics/clients');
        if (res.ok) {
          const data = await res.json();
          setGlobalData(data);
          // Default selection: Top 3 performers
          if (data.topPerformers) {
             setCompareSelection(data.topPerformers.slice(0, 3).map(c => c.id));
          }
        }
      } catch (err) {
        console.error('Error fetching global analytics:', err);
      }
    };
    fetchGlobal();
  }, []);

  // Fetch Campaigns when Client Selected
  useEffect(() => {
    if (!selectedClientId) return;
    const fetchCampaigns = async () => {
      try {
        const res = await fetch(`/api/campaigns?clientId=${selectedClientId}`);
        const data = await res.json();
        if (res.ok) {
          setCampaigns(data.campaigns || []);
        }
      } catch (err) {
        console.error('Error fetching campaigns:', err);
      }
    };
    fetchCampaigns();
  }, [selectedClientId]);

  // Comparison Chart Data Logic
  const comparisonChartData = useMemo(() => {
    if (!globalData.clients.length || !compareSelection.length) return [];

    // 1. Collect all unique dates from selected clients
    const allDates = new Set();
    const selectedClientsData = globalData.clients.filter(c => compareSelection.includes(c.id));
    
    selectedClientsData.forEach(client => {
        client.timeline.forEach(point => {
            allDates.add(point.date);
        });
    });

    const sortedDates = Array.from(allDates).sort();

    // 2. Build chart data
    return sortedDates.map(date => {
        const point = { date };
        selectedClientsData.forEach(client => {
            const dayData = client.timeline.find(d => d.date === date);
            point[client.name] = dayData ? dayData[compareMetric] : 0;
        });
        return point;
    });
  }, [globalData, compareSelection, compareMetric]);

  // Filter Data Logic (Single Client)
  const filteredData = useMemo(() => {
    if (!campaigns.length) return [];

    let start, end;
    if (dateFilter === 'month') {
      const [year, month] = selectedMonth.split('-');
      start = new Date(year, month - 1, 1);
      end = new Date(year, month, 0, 23, 59, 59);
    } else if (dateFilter === 'day') {
      start = new Date(selectedDate);
      start.setHours(0, 0, 0, 0);
      end = new Date(selectedDate);
      end.setHours(23, 59, 59, 999);
    } else if (dateFilter === 'range' && dateRange.start && dateRange.end) {
      start = new Date(dateRange.start);
      end = new Date(dateRange.end);
      end.setHours(23, 59, 59, 999);
    } else {
      return [];
    }

    const rows = [];
    campaigns.forEach(campaign => {
      if (campaign.rows) {
        campaign.rows.forEach(row => {
          let dateStr = row["Reporting starts"] || row["date"] || row["Date"] || row["Reporting ends"] || campaign.uploadedAt;
          let date = new Date(dateStr);
          if (!isNaN(date) && date >= start && date <= end) {
            rows.push({ ...row, parsedDate: date });
          }
        });
      }
    });

    return rows.sort((a, b) => a.parsedDate - b.parsedDate);
  }, [campaigns, dateFilter, selectedMonth, selectedDate, dateRange]);

  // Calculate Metrics (Single Client)
  const metrics = useMemo(() => {
    let spend = 0, impressions = 0, clicks = 0, cpmSum = 0, cpcSum = 0, cpmCount = 0, cpcCount = 0;
    
    filteredData.forEach(row => {
        const s = parseFloat(row["Amount spent (INR)"] || row["Amount spent"] || 0);
        const i = parseFloat(row["Impressions"] || 0);
        const c = parseFloat(row["Clicks (all)"] || row["Clicks"] || 0);
        const cpm = parseFloat(row["CPM (cost per 1,000 impressions)"] || row["CPM"] || 0);
        const cpc = parseFloat(row["CPC (all)"] || row["CPC"] || 0);

        if (!isNaN(s)) spend += s;
        if (!isNaN(i)) impressions += i;
        if (!isNaN(c)) clicks += c;
        if (!isNaN(cpm) && cpm > 0) { cpmSum += cpm; cpmCount++; }
        if (!isNaN(cpc) && cpc > 0) { cpcSum += cpc; cpcCount++; }
    });

    const avgCPM = impressions > 0 ? (spend / impressions) * 1000 : 0;
    const avgCPC = clicks > 0 ? spend / clicks : 0;

    return { spend, impressions, clicks, avgCPM, avgCPC };
  }, [filteredData]);

  // Chart Data Preparation (Single Client)
  const chartData = useMemo(() => {
    const map = new Map();
    
    filteredData.forEach(row => {
        const dateKey = row.parsedDate.toISOString().split('T')[0];
        if (!map.has(dateKey)) {
            map.set(dateKey, { 
                date: dateKey, 
                spend: 0, 
                impressions: 0, 
                cpm: 0, 
                cpc: 0,
                google_impressions: 0,
                facebook_impressions: 0,
                linkedin_impressions: 0,
                other_impressions: 0
            });
        }
        
        const entry = map.get(dateKey);
        const s = parseFloat(row["Amount spent (INR)"] || row["Amount spent"] || 0);
        const i = parseFloat(row["Impressions"] || 0);
        const platform = (row["Platform"] || row["platform"] || "").toLowerCase();

        entry.spend += s;
        entry.impressions += i;

        if (platform.includes('google')) entry.google_impressions += i;
        else if (platform.includes('facebook') || platform.includes('meta') || platform.includes('instagram')) entry.facebook_impressions += i;
        else if (platform.includes('linkedin')) entry.linkedin_impressions += i;
        else entry.other_impressions += i;
    });

    return Array.from(map.values()).map(d => ({
        ...d,
        cpm: d.impressions > 0 ? (d.spend / d.impressions) * 1000 : 0,
        cpc: d.spend > 0 && d.impressions > 0 ? (d.spend / (d.impressions * 0.01)) : 0 
    })).sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredData]);

  // Helpers
  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val);
  const formatNumber = (val) => new Intl.NumberFormat('en-IN').format(val);

  if (loading) return <div className="p-5 text-center">Loading Dashboard...</div>;

  return (
    <>
      <div className="main-content">
        {/* Header & Tab Switcher */}
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
            <div>
                <h2 className="fw-bold text-dark mb-0">Analytics</h2>
                <p className="text-muted mb-0">
                    {viewMode === 'dashboard' ? 'Client Overview' : 'Global Comparison'}
                </p>
            </div>
            <div className="d-flex gap-3 align-items-center">
                 <div className="btn-group bg-white p-1 shadow-sm rounded-pill" role="group">
                    <button 
                        className={`btn rounded-pill px-4 fw-bold ${viewMode === 'dashboard' ? 'btn-primary' : 'btn-white text-muted border-0'}`}
                        onClick={() => setViewMode('dashboard')}
                    >Dashboard</button>
                    <button 
                        className={`btn rounded-pill px-4 fw-bold ${viewMode === 'comparison' ? 'btn-primary' : 'btn-white text-muted border-0'}`}
                        onClick={() => setViewMode('comparison')}
                    >Comparison</button>
                 </div>
                 {viewMode === 'dashboard' && (
                     <select 
                        className="form-select border-0 shadow-sm fw-bold text-primary" 
                        style={{ width: '200px', backgroundColor: '#fff', borderRadius: '12px' }}
                        value={selectedClientId}
                        onChange={(e) => setSelectedClientId(e.target.value)}
                     >
                        {clients.map(c => (
                            <option key={c._id} value={c._id}>{c.companyName || c.username}</option>
                        ))}
                     </select>
                 )}
                 <button className="btn btn-light text-danger fw-bold" onClick={() => router.push('/login')} style={{ borderRadius: '12px' }}>
                    <i className="feather-log-out"></i>
                 </button>
            </div>
        </div>

        {viewMode === 'comparison' ? (
            <div className="animate__animated animate__fadeIn">
                 {/* COMPARISON VIEW */}
                 <div className="row g-4 mb-4">
                    {/* Top Performers Table */}
                    <div className="col-lg-5">
                       <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '16px' }}>
                          <div className="card-header bg-white border-0 p-4">
                             <h5 className="mb-0 fw-bold text-dark">Top Performing Clients</h5>
                             <p className="text-muted small mb-0">Ranked by Total Spend</p>
                          </div>
                          <div className="card-body p-0 table-responsive" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                             <table className="table table-hover align-middle mb-0">
                                <thead className="bg-light sticky-top">
                                   <tr>
                                      <th className="ps-4 border-0">Rank</th>
                                      <th className="border-0">Client</th>
                                      <th className="text-end pe-4 border-0">Total Spend</th>
                                   </tr>
                                </thead>
                                <tbody>
                                   {globalData.topPerformers.map((client, idx) => (
                                      <tr key={client.id}>
                                         <td className="ps-4">
                                            <span className={`badge rounded-pill ${idx < 3 ? 'bg-warning text-dark' : 'bg-light text-muted'}`} style={{ width: '30px' }}>
                                               #{idx + 1}
                                            </span>
                                         </td>
                                         <td className="fw-bold text-dark">{client.name}</td>
                                         <td className="text-end pe-4 font-monospace fw-bold text-primary">{formatCurrency(client.totalSpend)}</td>
                                      </tr>
                                   ))}
                                </tbody>
                             </table>
                          </div>
                       </div>
                    </div>
                    
                    {/* Comparison Controls & Chart */}
                    <div className="col-lg-7">
                       <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '16px' }}>
                          <div className="card-header bg-white border-0 p-4 d-flex justify-content-between align-items-center flex-wrap gap-2">
                             <div className="d-flex align-items-center gap-2">
                                <i className="feather-activity text-primary"></i>
                                <h5 className="mb-0 fw-bold">Performance Comparison</h5>
                             </div>
                             <div className="d-flex gap-2">
                                <select 
                                    className="form-select form-select-sm fw-bold border-0 bg-light" 
                                    value={compareMetric} 
                                    onChange={(e) => setCompareMetric(e.target.value)}
                                >
                                   <option value="spend">Spend</option>
                                   <option value="impressions">Impressions</option>
                                   <option value="clicks">Clicks</option>
                                </select>
                             </div>
                          </div>
                          <div className="card-body p-4 pt-0">
                             <div className="mb-4">
                                <label className="form-label small text-muted fw-bold text-uppercase mb-2">Select Clients to Compare</label>
                                <div className="d-flex flex-wrap gap-2" style={{ maxHeight: '100px', overflowY: 'auto' }}>
                                   {globalData.clients.map(client => (
                                      <button 
                                        key={client.id}
                                        onClick={() => {
                                           setCompareSelection(prev => 
                                              prev.includes(client.id) 
                                                ? prev.filter(id => id !== client.id)
                                                : [...prev, client.id]
                                           );
                                        }}
                                        className={`btn btn-sm rounded-pill fw-semibold ${compareSelection.includes(client.id) ? 'btn-primary' : 'btn-light text-muted'}`}
                                        style={{ fontSize: '0.8rem' }}
                                      >
                                         {client.name}
                                      </button>
                                   ))}
                                </div>
                             </div>
                             
                             <div style={{ height: '400px' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                   <LineChart data={comparisonChartData}>
                                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                      <XAxis dataKey="date" tick={{fontSize: 12, fill: '#9ca3af'}} axisLine={false} tickLine={false} dy={10} />
                                      <YAxis tick={{fontSize: 12, fill: '#9ca3af'}} axisLine={false} tickLine={false} tickFormatter={(val) => val >= 1000 ? `${val/1000}k` : val} />
                                      <Tooltip 
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                        formatter={(val) => compareMetric === 'spend' ? formatCurrency(val) : formatNumber(val)}
                                      />
                                      <Legend iconType="circle" />
                                      {globalData.clients.filter(c => compareSelection.includes(c.id)).map((client, i) => (
                                         <Line 
                                            key={client.id}
                                            type="monotone" 
                                            dataKey={client.name} 
                                            name={client.name}
                                            stroke={`hsl(${i * 137.508}, 70%, 50%)`} 
                                            strokeWidth={3} 
                                            dot={false}
                                            activeDot={{ r: 6 }}
                                         />
                                      ))}
                                   </LineChart>
                                </ResponsiveContainer>
                             </div>
                          </div>
                       </div>
                    </div>
                 </div>
            </div>
        ) : (
            <div className="animate__animated animate__fadeIn">
            {/* Quick Actions / Filters */}
            <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '12px' }}>
                <div className="card-body p-3 d-flex flex-wrap gap-3 align-items-center justify-content-between">
                    <div className="d-flex gap-2">
                        <button 
                            className={`btn fw-bold px-4 ${dateFilter === 'month' ? 'btn-primary' : 'btn-light text-muted'}`}
                            onClick={() => setDateFilter('month')}
                            style={{ borderRadius: '8px' }}
                        >Month</button>
                        <button 
                            className={`btn fw-bold px-4 ${dateFilter === 'day' ? 'btn-primary' : 'btn-light text-muted'}`}
                            onClick={() => setDateFilter('day')}
                            style={{ borderRadius: '8px' }}
                        >Single Day</button>
                        <button 
                            className={`btn fw-bold px-4 ${dateFilter === 'range' ? 'btn-primary' : 'btn-light text-muted'}`}
                            onClick={() => setDateFilter('range')}
                            style={{ borderRadius: '8px' }}
                        >Range</button>
                    </div>

                    <div className="d-flex gap-2 align-items-center">
                        {dateFilter === 'month' && (
                            <input type="month" className="form-control border-0 bg-light fw-bold" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} />
                        )}
                        {dateFilter === 'day' && (
                            <input type="date" className="form-control border-0 bg-light fw-bold" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
                        )}
                        {dateFilter === 'range' && (
                            <>
                                <input type="date" className="form-control border-0 bg-light fw-bold" value={dateRange.start} onChange={(e) => setDateRange({...dateRange, start: e.target.value})} />
                                <span className="text-muted fw-bold">-</span>
                                <input type="date" className="form-control border-0 bg-light fw-bold" value={dateRange.end} onChange={(e) => setDateRange({...dateRange, end: e.target.value})} />
                            </>
                        )}
                        <button className="btn btn-light text-primary fw-bold ms-2" style={{ borderRadius: '8px' }}>
                            <i className="feather-download me-2"></i>Export Data
                        </button>
                    </div>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="row g-4 mb-5">
                {/* Total Spend */}
                <div className="col-xl-3 col-md-6">
                    <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '16px' }}>
                        <div className="card-body p-4">
                            <div className="d-flex justify-content-between mb-4">
                                <div className="d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px', backgroundColor: '#e0f2fe', borderRadius: '12px', color: '#0ea5e9' }}>
                                    <i className="feather-dollar-sign fs-4"></i>
                                </div>
                                <span className="badge bg-success-subtle text-success rounded-pill px-3 py-2 d-flex align-items-center gap-1">
                                    <i className="feather-trending-up"></i> +12%
                                </span>
                            </div>
                            <h2 className="fw-bold text-dark mb-1">{formatCurrency(metrics.spend)}</h2>
                            <p className="text-muted small fw-semibold mb-0">TOTAL SPEND</p>
                        </div>
                    </div>
                </div>

                {/* Avg CPM */}
                <div className="col-xl-3 col-md-6">
                    <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '16px' }}>
                        <div className="card-body p-4">
                            <div className="d-flex justify-content-between mb-4">
                                <div className="d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px', backgroundColor: '#f3e8ff', borderRadius: '12px', color: '#9333ea' }}>
                                    <i className="feather-eye fs-4"></i>
                                </div>
                                <span className="badge bg-danger-subtle text-danger rounded-pill px-3 py-2 d-flex align-items-center gap-1">
                                    <i className="feather-trending-down"></i> -2.1%
                                </span>
                            </div>
                            <h2 className="fw-bold text-dark mb-1">{formatCurrency(metrics.avgCPM)}</h2>
                            <p className="text-muted small fw-semibold mb-0">AVG CPM</p>
                        </div>
                    </div>
                </div>

                {/* Avg CPC */}
                <div className="col-xl-3 col-md-6">
                    <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '16px' }}>
                        <div className="card-body p-4">
                            <div className="d-flex justify-content-between mb-4">
                                <div className="d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px', backgroundColor: '#fef3c7', borderRadius: '12px', color: '#d97706' }}>
                                    <i className="feather-mouse-pointer fs-4"></i>
                                </div>
                                <span className="badge bg-success-subtle text-success rounded-pill px-3 py-2 d-flex align-items-center gap-1">
                                    <i className="feather-trending-up"></i> +5.3%
                                </span>
                            </div>
                            <h2 className="fw-bold text-dark mb-1">{formatCurrency(metrics.avgCPC)}</h2>
                            <p className="text-muted small fw-semibold mb-0">AVG CPC</p>
                        </div>
                    </div>
                </div>

                 {/* Impressions */}
                 <div className="col-xl-3 col-md-6">
                    <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '16px' }}>
                        <div className="card-body p-4">
                            <div className="d-flex justify-content-between mb-4">
                                <div className="d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px', backgroundColor: '#dcfce7', borderRadius: '12px', color: '#16a34a' }}>
                                    <i className="feather-bar-chart-2 fs-4"></i>
                                </div>
                                <span className="badge bg-success-subtle text-success rounded-pill px-3 py-2 d-flex align-items-center gap-1">
                                    <i className="feather-activity"></i> Live
                                </span>
                            </div>
                            <h2 className="fw-bold text-dark mb-1">{formatNumber(metrics.impressions)}</h2>
                            <p className="text-muted small fw-semibold mb-0">TOTAL IMPRESSIONS</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="row g-4 mb-4">
                <div className="col-lg-8">
                    <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '16px' }}>
                        <div className="card-header bg-white border-0 p-4 d-flex justify-content-between align-items-center">
                            <div className="d-flex align-items-center gap-2">
                                <i className="feather-activity text-primary"></i>
                                <h5 className="mb-0 fw-bold">Performance Trends</h5>
                            </div>
                            <div className="btn-group" role="group">
                                <button className={`btn btn-sm ${activePlatform === 'all' ? 'btn-primary' : 'btn-outline-light text-dark'}`} onClick={() => setActivePlatform('all')}>All</button>
                                <button className={`btn btn-sm ${activePlatform === 'google' ? 'btn-primary' : 'btn-outline-light text-dark'}`} onClick={() => setActivePlatform('google')}>Google</button>
                                <button className={`btn btn-sm ${activePlatform === 'meta' ? 'btn-primary' : 'btn-outline-light text-dark'}`} onClick={() => setActivePlatform('meta')}>Meta</button>
                            </div>
                        </div>
                        <div className="card-body p-4 pt-0" style={{ height: '350px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                    <XAxis dataKey="date" tick={{fontSize: 12, fill: '#9ca3af'}} axisLine={false} tickLine={false} dy={10} />
                                    <YAxis tick={{fontSize: 12, fill: '#9ca3af'}} axisLine={false} tickLine={false} tickFormatter={(val) => val >= 1000 ? `${val/1000}k` : val} />
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                        formatter={(val) => formatNumber(val)}
                                    />
                                    <Legend iconType="circle" />
                                    {(activePlatform === 'all' || activePlatform === 'google') && (
                                        <Line type="monotone" dataKey="google_impressions" name="Google" stroke="#4285F4" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                                    )}
                                    {(activePlatform === 'all' || activePlatform === 'meta') && (
                                        <Line type="monotone" dataKey="facebook_impressions" name="Meta" stroke="#1877F2" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                                    )}
                                    {(activePlatform === 'all' || activePlatform === 'linkedin') && (
                                        <Line type="monotone" dataKey="linkedin_impressions" name="LinkedIn" stroke="#0077b5" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                                    )}
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                <div className="col-lg-4">
                    <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '16px' }}>
                        <div className="card-header bg-white border-0 p-4">
                            <div className="d-flex align-items-center gap-2">
                                <i className="feather-pie-chart text-warning"></i>
                                <h5 className="mb-0 fw-bold">Spend vs CPM</h5>
                            </div>
                        </div>
                        <div className="card-body p-4 pt-0" style={{ height: '350px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                    <XAxis dataKey="date" hide />
                                    <YAxis yAxisId="left" orientation="left" stroke="#8884d8" fontSize={10} axisLine={false} tickLine={false} />
                                    <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" fontSize={10} axisLine={false} tickLine={false} />
                                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }} />
                                    <Legend iconType="circle" />
                                    <Line yAxisId="left" type="monotone" dataKey="spend" stroke="#8884d8" strokeWidth={3} dot={false} name="Spend" />
                                    <Line yAxisId="right" type="monotone" dataKey="cpm" stroke="#82ca9d" strokeWidth={3} dot={false} name="CPM" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Detailed Table */}
            <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '16px' }}>
                <div className="card-header bg-white border-0 p-4">
                    <h5 className="mb-0 fw-bold">Detailed Report</h5>
                </div>
                <div className="table-responsive">
                    <table className="table align-middle mb-0">
                        <thead className="bg-light">
                            <tr>
                                <th className="ps-4 border-0">Date</th>
                                <th className="border-0">Platform</th>
                                <th className="border-0">Spend</th>
                                <th className="border-0">Impressions</th>
                                <th className="border-0">Clicks</th>
                                <th className="border-0">CPM</th>
                                <th className="border-0">CPC</th>
                                <th className="pe-4 border-0">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.map((row, index) => (
                                <tr key={index}>
                                    <td className="ps-4 text-muted fw-semibold">{row.parsedDate.toLocaleDateString()}</td>
                                    <td>
                                        <span className="badge bg-light text-dark border">
                                            {row["Platform"] || row["platform"] || "Unknown"}
                                        </span>
                                    </td>
                                    <td className="fw-bold">{formatCurrency(row["Amount spent (INR)"] || row["Amount spent"] || 0)}</td>
                                    <td>{formatNumber(row["Impressions"] || 0)}</td>
                                    <td>{formatNumber(row["Clicks (all)"] || row["Clicks"] || 0)}</td>
                                    <td>{formatCurrency(row["CPM (cost per 1,000 impressions)"] || row["CPM"] || 0)}</td>
                                    <td>{formatCurrency(row["CPC (all)"] || row["CPC"] || 0)}</td>
                                    <td className="pe-4">
                                        {(parseFloat(row["Amount spent (INR)"] || row["Amount spent"] || 0) > 0) ? (
                                            <span className="badge bg-success-subtle text-success rounded-pill px-2">Active</span>
                                        ) : (
                                            <span className="badge bg-secondary-subtle text-secondary rounded-pill px-2">No Spend</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {filteredData.length === 0 && (
                                <tr>
                                    <td colSpan="8" className="text-center py-5 text-muted">
                                        <i className="feather-inbox fs-1 d-block mb-2"></i>
                                        No data found for the selected period
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            </div>
        )}
      </div>
    </>
  );
}
