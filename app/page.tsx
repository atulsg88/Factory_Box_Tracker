"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy, doc, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import { motion, AnimatePresence } from "framer-motion";
import { AreaChart, Area, BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Package, Calendar, Clock, BarChart3, Box, TrendingUp, Activity, CheckCircle2, ChevronRight, Download, Sun, Moon } from "lucide-react";

function ThemeToggle() {
  const [isDark, setIsDark] = useState<boolean>(true);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('theme');
      if (saved) {
        setIsDark(saved === 'dark');
        document.body.classList.toggle('dark', saved === 'dark');
        return;
      }
      const prefers = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDark(prefers);
      document.body.classList.toggle('dark', prefers);
    } catch (e) {
      // ignore in non-browser environments
    }
  }, []);

  useEffect(() => {
    try {
      document.body.classList.toggle('dark', isDark);
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
    } catch (e) {}
  }, [isDark]);

  return (
    <button
      className="export-btn"
      onClick={() => setIsDark((s) => !s)}
      aria-label="Toggle theme"
    >
      {isDark ? <Moon size={16} /> : <Sun size={16} />}
      <span style={{ marginLeft: 8 }}>{isDark ? 'Dark' : 'Light'}</span>
    </button>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState({ today: 0, month: 0, year: 0 });
  const [recentScans, setRecentScans] = useState<any[]>([]);
  const [dailyCategoryCounts, setDailyCategoryCounts] = useState<{ name: string, count: number, color: string }[]>([]);
  const [monthlyCategoryCounts, setMonthlyCategoryCounts] = useState<{ name: string, count: number, color: string }[]>([]);
  const [yearlyCategoryCounts, setYearlyCategoryCounts] = useState<{ name: string, count: number, color: string }[]>([]);
  const [categoryTimeframe, setCategoryTimeframe] = useState<"today" | "month" | "year">("today");
  const [chartTimeframe, setChartTimeframe] = useState<"today" | "month" | "year">("year");
  const [isSystemActive, setIsSystemActive] = useState<boolean>(false);
  const [showExportMenu, setShowExportMenu] = useState<boolean>(false);
  const [expandedScans, setExpandedScans] = useState<Record<string, boolean>>({});

  const toggleScan = (id: string) => {
    setExpandedScans(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const formatId = (url: string) => {
    try {
      // Directly map the specific QR code to the "Cable" category
      if (url.includes('wRizPo')) return 'Cable';

      if (!url.startsWith('http')) return url;
      const parts = url.split('/');
      return parts[parts.length - 1];
    } catch { return url; }
  };

  useEffect(() => {
    // Listen to the "box_scans" collection in real-time
    const q = query(collection(db, "box_scans"), orderBy("timestamp", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      const d = new Date();
      // Ensure we use the local timezone formatting rather than UTC
      const todayStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; // YYYY-MM-DD
      const monthStr = todayStr.substring(0, 7); // YYYY-MM
      const yearStr = todayStr.substring(0, 4); // YYYY

      let todayCount = 0;
      let monthCount = 0;
      let yearCount = 0;

      // Data aggregation for the chart and daily/monthly/yearly categories
      const typeCounts: Record<string, number> = {};
      const dailyTypeCounts: Record<string, number> = {};
      const monthlyTypeCounts: Record<string, number> = {};
      const yearlyTypeCounts: Record<string, number> = {};

      docs.forEach((doc: any) => {
        const docId = doc.box_type ? formatId(doc.box_type) : "Unknown";
        if (doc.date === todayStr) {
          todayCount++;
          dailyTypeCounts[docId] = (dailyTypeCounts[docId] || 0) + 1;
        }
        if (doc.month === monthStr) {
          monthCount++;
          monthlyTypeCounts[docId] = (monthlyTypeCounts[docId] || 0) + 1;
        }
        if (doc.year === yearStr) {
          yearCount++;
          yearlyTypeCounts[docId] = (yearlyTypeCounts[docId] || 0) + 1;
        }

        typeCounts[docId] = (typeCounts[docId] || 0) + 1;
      });

      setStats({ today: todayCount, month: monthCount, year: yearCount });
      setRecentScans(docs.slice(0, 5)); // Keep top 5 most recent

      // Auto-determine System Active status based on if a scan happened recently (last 15 minutes)
      if (docs.length > 0) {
        const latestDoc: any = docs[0];
        const latestScan = latestDoc.timestamp?.toDate ? latestDoc.timestamp.toDate() : new Date();
        const timeDiff = new Date().getTime() - latestScan.getTime();
        setIsSystemActive(timeDiff < 900000); // Active if scan within last 15 mins (900,000 ms)
      } else {
        setIsSystemActive(false);
      }

      // Format categories
      const formatCats = (countsObj: Record<string, number>) => {
        // Enforce strictly 'Adapter' and 'Cable' category cards and charts
        return ["Adapter", "Cable"].map((category) => ({
          name: category,
          count: countsObj[category] || 0,
          color: '#fff'
        }));
      };

      setDailyCategoryCounts(formatCats(dailyTypeCounts));
      setMonthlyCategoryCounts(formatCats(monthlyTypeCounts));
      setYearlyCategoryCounts(formatCats(yearlyTypeCounts));
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleExportCSV = async (timeframe: 'today' | 'month' | 'year' | 'all') => {
    setShowExportMenu(false);
    try {
      const q = query(collection(db, "box_scans"), orderBy("timestamp", "desc"));
      const querySnapshot = await getDocs(q);

      const d = new Date();
      const todayStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const monthStr = todayStr.substring(0, 7);
      const yearStr = todayStr.substring(0, 4);

      let csvContent = "data:text/csv;charset=utf-8,";
      csvContent += "ID,Box Type,Date,Time\n";

      let exportCount = 0;

      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();

        if (timeframe === 'today' && data.date !== todayStr) return;
        if (timeframe === 'month' && data.month !== monthStr) return;
        if (timeframe === 'year' && data.year !== yearStr) return;

        exportCount++;

        const shortId = data.box_type ? formatId(data.box_type) : "Unknown";

        let timeStr = "";
        if (data.timestamp) {
          const date = data.timestamp.toDate ? data.timestamp.toDate() : new Date(data.timestamp);
          timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        }

        csvContent += `${docSnap.id},${shortId},${data.date || 'N/A'},${timeStr}\n`;
      });

      if (exportCount === 0) {
        alert(`No data found for the selected timeframe (${timeframe}).`);
        return;
      }

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `production_data_${timeframe}_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error exporting data:", error);
      alert("Failed to export data. Check your console for details.");
    }
  };

  // Format timestamp safely
  const formatTime = (timestamp: any) => {
    if (!timestamp) return "Just now";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  // Framer Motion Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 60, damping: 20 } }
  };

  return (
    <div className="dashboard-container">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.header variants={itemVariants} className="dashboard-header">
          <div className="logo-container">
            <Activity size={24} className="logo-icon" />
          </div>
          <div>
            <h1>Production Monitor</h1>
            <p>Real-time Conveyor Analytics</p>
          </div>

          <div className="header-actions">
            <button className="export-btn" onClick={() => setShowExportMenu(!showExportMenu)}>
              <Download size={16} />
              Export to Spreadsheet
            </button>

            <AnimatePresence>
              {showExportMenu && (
                <motion.div
                  className="export-dropdown"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <button className="export-option" onClick={() => handleExportCSV('today')}>Export Today</button>
                  <button className="export-option" onClick={() => handleExportCSV('month')}>Export This Month</button>
                  <button className="export-option" onClick={() => handleExportCSV('year')}>Export This Year</button>
                  <button className="export-option" onClick={() => handleExportCSV('all')} style={{ borderTop: "1px solid rgba(0,0,0,0.05)", borderRadius: "0 0 8px 8px" }}>Export All Time</button>
                </motion.div>
              )}
            </AnimatePresence>

            <ThemeToggle />
          </div>
        </motion.header>

        {/* KPI Cards */}
        <div className="kpi-grid">
          <motion.div variants={itemVariants} className="glass-card">
            <div className="kpi-header">
              <span className="kpi-title">Scanned Today</span>
              <div className="kpi-icon">
                <Clock size={16} />
              </div>
            </div>
            <div className="kpi-value">{stats.today}</div>
            <div className={`kpi-trend ${isSystemActive ? 'trend-up' : 'text-red-400'}`}>
              {isSystemActive ? <CheckCircle2 size={14} /> : <TrendingUp size={14} />}
              {isSystemActive ? 'System Active' : 'System Offline'}
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="glass-card">
            <div className="kpi-header">
              <span className="kpi-title">This Month</span>
              <div className="kpi-icon">
                <Calendar size={16} />
              </div>
            </div>
            <div className="kpi-value">{stats.month}</div>
          </motion.div>

          <motion.div variants={itemVariants} className="glass-card">
            <div className="kpi-header">
              <span className="kpi-title">This Year</span>
              <div className="kpi-icon">
                <BarChart3 size={16} />
              </div>
            </div>
            <div className="kpi-value">{stats.year}</div>
          </motion.div>
        </div>

        {/* Categories Section */}
        <motion.div variants={itemVariants} className="mb-10">
          <div className="section-header-flex">
            <h2 className="section-title">Category Breakdown</h2>
            <div className="timeframe-tabs">
              <button
                className={categoryTimeframe === 'today' ? 'active' : ''}
                onClick={() => setCategoryTimeframe('today')}
              >Today</button>
              <button
                className={categoryTimeframe === 'month' ? 'active' : ''}
                onClick={() => setCategoryTimeframe('month')}
              >Month</button>
              <button
                className={categoryTimeframe === 'year' ? 'active' : ''}
                onClick={() => setCategoryTimeframe('year')}
              >Year</button>
            </div>
          </div>

          {(() => {
            const activeCats =
              categoryTimeframe === 'today' ? dailyCategoryCounts :
                categoryTimeframe === 'month' ? monthlyCategoryCounts :
                  yearlyCategoryCounts;

            return activeCats.length > 0 ? (
              <div className="category-kpi-grid">
                {activeCats.map((cat, idx) => (
                  <div key={idx} className="category-card">
                    <div className="category-header">
                      <div className="category-icon">
                        <Box size={14} />
                      </div>
                      <span className="truncate-text" title={cat.name}>{cat.name}</span>
                    </div>
                    <div className="category-value">{cat.count}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="category-empty">No boxes scanned this {categoryTimeframe} yet.</div>
            );
          })()}
        </motion.div>

        {/* Main Section */}
        <div className="main-grid">
          <motion.div variants={itemVariants} className="glass-card">
            <div className="section-header-flex">
              <h2 className="section-title">Volume by Type</h2>
              <div className="timeframe-tabs">
                <button
                  className={chartTimeframe === 'today' ? 'active' : ''}
                  onClick={() => setChartTimeframe('today')}
                >Today</button>
                <button
                  className={chartTimeframe === 'month' ? 'active' : ''}
                  onClick={() => setChartTimeframe('month')}
                >Month</button>
                <button
                  className={chartTimeframe === 'year' ? 'active' : ''}
                  onClick={() => setChartTimeframe('year')}
                >Year</button>
              </div>
            </div>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartTimeframe === 'today' ? dailyCategoryCounts : chartTimeframe === 'month' ? monthlyCategoryCounts : yearlyCategoryCounts}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  barSize={34}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid rgba(0,0,0,0.05)', borderRadius: '8px', color: '#292524' }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {(chartTimeframe === 'today' ? dailyCategoryCounts : chartTimeframe === 'month' ? monthlyCategoryCounts : yearlyCategoryCounts).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill="rgba(16, 185, 129, 0.85)" /> /* Emerald soft positive */
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="glass-card">
            <h2 className="section-title">Live Feed</h2>
            <div className="recent-scans-list">
              <AnimatePresence>
                {recentScans.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Waiting for scans...</p>
                ) : (
                  recentScans.map((scan, idx) => {
                    const shortId = scan.box_type ? formatId(scan.box_type) : "Unknown";
                    const displayLabel = (scan.vision_label && scan.vision_label !== "None") ? scan.vision_label : shortId;

                    return (
                      <motion.div
                        key={scan.id || idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.3 }}
                        className="scan-item"
                        style={{ flexDirection: 'column', alignItems: 'stretch' }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                          <div className="scan-info" onClick={() => toggleScan(scan.id)} style={{ cursor: 'pointer' }}>
                            <div className="scan-box-icon">
                              <ChevronRight size={14} />
                            </div>
                            <span className="scan-type-link hover:text-emerald-500 transition-colors">
                              {displayLabel}
                            </span>
                          </div>
                          <span className="scan-time">{formatTime(scan.timestamp)}</span>
                        </div>

                        <AnimatePresence>
                          {expandedScans[scan.id] && scan.qr_id && scan.qr_id !== "None" && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1, marginTop: 12 }}
                              exit={{ height: 0, opacity: 0, marginTop: 0 }}
                              style={{ overflow: 'hidden', paddingLeft: 28, fontSize: '0.8rem', color: "var(--text-secondary)" }}
                            >
                              <span style={{ fontWeight: 500, marginRight: 4 }}>QR Data:</span>
                              <a href={scan.qr_id.startsWith('http') ? scan.qr_id : '#'} target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent-secondary)", textDecoration: 'underline', wordBreak: 'break-all' }}>
                                {scan.qr_id}
                              </a>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    )
                  })
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

      </motion.div>
    </div>
  );
}