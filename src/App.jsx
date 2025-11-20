import React, { useState, useEffect, useMemo } from 'react';
import { 
  Map, ShieldAlert, Menu, Users, TrendingUp, Upload, Siren, 
  CheckCircle, XCircle, MapPin, Database, Zap, AlertOctagon, 
  ArrowDownRight, Plus, X, Activity, BarChart3, AlertTriangle, RefreshCw
} from 'lucide-react';
import { 
  LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart
} from 'recharts';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';

const FIREBASE_CONFIG = process.env.REACT_APP_FIREBASE_CONFIG ? JSON.parse(process.env.REACT_APP_FIREBASE_CONFIG) : null;

// Ultra-smooth counter with spring physics
const SmoothCounter = ({ value, suffix = '' }) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, Math.round);
  const springValue = useSpring(rounded, { stiffness: 80, damping: 30, mass: 0.8 });

  useEffect(() => {
    count.set(value);
  }, [value, count]);

  return <motion.span>{springValue}{suffix}</motion.span>;
};

export default function App() {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [routeData, setRouteData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [db, setDb] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Firebase init (same)
  useEffect(() => {
    const init = async () => {
      if (FIREBASE_CONFIG) {
        const { initializeApp } = await import('firebase/app');
        const { getAuth, signInAnonymously } = await import('firebase/auth');
        const { getFirestore } = await import('firebase/firestore');
        const app = initializeApp(FIREBASE_CONFIG);
        const auth = getAuth(app);
        const firestore = getFirestore(app);
        setDb(firestore);
        signInAnonymously(auth);
      }
      setTimeout(() => setLoading(false), 2000);
    };
    init();
  }, []);

  // Real-time data listener
  useEffect(() => {
    if (!db) return;
    const unsub = onSnapshot(collection(db, `/artifacts/demo-app/public/data/route_visits`), snap => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setRouteData(data);
    });
    return unsub;
  }, [db]);

  const metrics = useMemo(() => {
    const total = routeData.length;
    const checked = routeData.filter(r => r.checked).length;
    const compliance = total ? Math.round((checked / total) * 100) : 0;
    const alerts = routeData.filter(r => !r.checked).map(r => ({
      employeeId: r.employeeId,
      employeeName: r.employeeName || 'Unknown',
      type: 'GAP',
      details: `Missed visit at ${r.shopName}`,
      location: r.governorate || 'N/A'
    }));
    return { total, checked, compliance, alerts: alerts.slice(0, 30) };
  }, [routeData]);

  const chartData = useMemo(() => {
    const byDate = {};
    routeData.forEach(r => {
      const d = r.date || 'Today';
      byDate[d] = byDate[d] || { date: d, total: 0, checked: 0 };
      byDate[d].total++;
      if (r.checked) byDate[d].checked++;
    });
    return Object.values(byDate).slice(-7).map((d, i) => ({
      ...d,
      compliance: Math.round((d.checked / d.total) * 100),
      index: i
    }));
  }, [routeData]);

  const govData = useMemo(() => {
    const map = {};
    routeData.forEach(r => {
      const g = r.governorate || 'Other';
      map[g] = (map[g] || 0) + 1;
    });
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a,b) => b.value - a.value)
      .slice(0, 8);
  }, [routeData]);

  if (loading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Zap size={80} className="mb-8" />
        </motion.div>
        <motion.h1 
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-6xl font-black tracking-tight"
        >
          SmartSense-Ltd CE FF
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-2xl mt-4 font-light"
        >
          Initializing real-time tracking...
        </motion.p>
      </motion.div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 overflow-hidden font-sans">
      {/* Sidebar - unchanged for brevity */}

      <main className={`flex-1 overflow-y-auto transition-all duration-500 ${sidebarOpen ? 'ml-72' : 'ml-20'} p-10`}>
        <div className="max-w-7xl mx-auto space-y-12">

          {/* Hero Header */}
          <motion.div
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
          >
            <h1 className="text-6xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight">
              SmartSense-Ltd CE FF
            </h1>
            <p className="text-mt-2 text-2xl text-slate-600 font-light">Real-Time Fraud Detection Dashboard</p>
          </motion.div>

          {/* Stats Grid - Ultra Smooth */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: "Total Visits", value: metrics.total, icon: <Map size={36} />, delay: 0.1 },
              { title: "Completed", value: metrics.checked, icon: <CheckCircle size={36} />, color: "green", delay: 0.2 },
              { title: "Compliance", value: metrics.compliance, suffix: "%", icon: metrics.compliance >= 90 ? <TrendingUp size={36} /> : <ArrowDownRight size={36} />, color: metrics.compliance >= 90 ? "green" : "red", delay: 0.3 },
              { title: "Alerts", value: metrics.alerts.length, icon: <Siren size={36} />, color: "red", delay: 0.4 },
            ].map((stat, i) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 60, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: stat.delay, type: "spring", stiffness: 120, damping: 20 }}
                whileHover={{ 
                  y: -16, 
                  scale: 1.05,
                  transition: { type: "spring", stiffness: 400, damping: 20 }
                }}
                className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-slate-600 text-lg font-medium">{stat.title}</p>
                    <h3 className="text-5xl font-black mt-4 text-slate-900">
                      <SmoothCounter value={stat.value} />{stat.suffix}
                    </h3>
                  </div>
                  <motion.div 
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className={`p-5 rounded-2xl ${stat.color === 'red' ? 'bg-red-100 text-red-600' : stat.color === 'green' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}
                  >
                    {stat.icon}
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid lg:grid-cols-3 gap-10">
            {/* Compliance Trend */}
            <motion.div 
              initial={{ opacity: 0, x: -100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 1.2, type: "spring" }}
              className="lg:col-span-2 bg-white/90 backdrop-blur-2xl rounded-3xl p-10 shadow-2xl"
            >
              <h2 className="text-3xl font-bold mb-8 flex items-center gap-4">
                <Activity className="text-purple-600" size={36} />
                Live Compliance Trend
              </h2>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorCompliance" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="6 6" stroke="#e0e7ff" />
                  <XAxis dataKey="date" stroke="#64748b" />
                  <YAxis domain={[0, 100]} stroke="#64748b" />
                  <Tooltip 
                    contentStyle={{ background: 'rgba(15, 23, 42, 0.95)', border: 'none', borderRadius: '16px', backdropFilter: 'blur(12px)' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="compliance" 
                    stroke="#8b5cf6" 
                    strokeWidth={4}
                    fillOpacity={1} 
                    fill="url(#colorCompliance)"
                    animationDuration={2000}
                    animationEasing="ease-out"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Pie Chart */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8, duration: 1.5, type: "spring", stiffness: 100 }}
              className="bg-white/90 backdrop-blur-2xl rounded-3xl p-10 shadow-2xl"
            >
              <h2 className="text-3xl font-bold mb-8">Visits by Region</h2>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={govData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={120}
                    startAngle={90}
                    endAngle={-270}
                    paddingAngle={4}
                    animationDuration={1800}
                    animationBegin={400}
                  >
                    {govData.map((_, i) => (
                      <Cell 
                        key={i} 
                        fill={['#3b82f6','#8b5cf6','#10b981','#f59e0b','#ef4444','#06b6d4','#ec4899','#6366f1'][i]} 
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </motion.div>
          </div>

          {/* Alerts Section - Ultra Smooth */}
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 1.2 }}
            className="bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="bg-gradient-to-r from-rose-600 to-pink-600 text-white p-10 flex justify-between items-center">
              <h2 className="text-4xl font-black">Live Fraud Alerts ({metrics.alerts.length})</h2>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setModalOpen(true)}
                className="bg-white text-rose-600 px-8 py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition flex items-center gap-3"
              >
                <Plus size={28} /> Report Issue
              </motion.button>
            </div>

            <div className="max-h-96 overflow-y-auto">
              <AnimatePresence mode="popLayout">
                {metrics.alerts.length === 0 ? (
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="p-20 text-center"
                  >
                    <CheckCircle size={80} className="text-emerald-600 mx-auto mb-6" />
                    <p className="text-3xl font-bold text-emerald-600">Perfect Compliance – Keep it up!</p>
                  </motion.div>
                ) : (
                  metrics.alerts.map((alert, i) => (
                    <motion.div
                      key={i}
                      layout
                      initial={{ opacity: 0, x: -100 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 100 }}
                      transition={{ delay: i * 0.08 }}
                      whileHover={{ 
                        scale: 1.02, 
                        background: "linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)",
                        transition: { duration: 0.3 }
                      }}
                      className="flex items-center gap-6 p-6 border-b border-slate-100 cursor-pointer"
                    >
                      <motion.div
                        animate={{ rotate: [0, -10, 10, -10, 0] }}
                        transition={{ duration: 0.6, delay: i * 0.1 }}
                      >
                        <AlertTriangle className="text-rose-600" size={28} />
                      </motion.div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-2">
                          <strong className="text-xl">{alert.employeeName}</strong>
                          <span className="px-4 py-2 bg-rose-100 text-rose-700 rounded-full text-sm font-bold">{alert.type}</span>
                        </div>
                        <p className="text-slate-600">{alert.details}</p>
                        <p className="text-sm text-slate-500 mt-2 flex items-center gap-2">
                          <MapPin size={16} /> {alert.location}
                        </p>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </motion.div>

        </div>
      </main>
    </div>
  );
}
