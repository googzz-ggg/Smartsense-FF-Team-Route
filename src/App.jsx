import React, { useState, useEffect, useMemo } from 'react';
import { 
  Map, ShieldAlert, Menu, Users, TrendingUp, Upload, Siren, 
  CheckCircle, XCircle, MapPin, Database, Zap, ListMinus, AlertOctagon, ArrowDownRight
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, addDoc, collection, query, onSnapshot, serverTimestamp } from 'firebase/firestore';

// ==================== CONFIG ====================
const APP_ID = process.env.REACT_APP_FIREBASE_APP_ID || 'demo-app';
const FIREBASE_CONFIG = process.env.REACT_APP_FIREBASE_CONFIG 
  ? JSON.parse(process.env.REACT_APP_FIREBASE_CONFIG) 
  : null;

// ==================== CSV PARSER ====================
const parseCSV = (text, type) => {
  if (!text?.trim()) return [];
  const lines = text.trim().split('\n').filter(Boolean);
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
    if (values.length < headers.length) continue;

    const row = {};
    headers.forEach((h, idx) => {
      let key = h.toLowerCase().replace(/[^a-z]/g, '');
      if (key.includes('date')) key = 'date';
      if (key.includes('code') && !key.includes('employee')) key = 'Code';
      if (key.includes('employeecode')) key = 'EMPLOYEECODE';
      if (key.includes('name') && !key.includes('employee')) key = 'Name';
      if (key.includes('employeename')) key = 'EMPLOYEENAME';
      if (key.includes('governorate') && !key.includes('name')) key = 'Governorate';
      if (key.includes('governoratename')) key = 'GOVERNORATENAME';
      if (h === 'Check') key = 'checked';
      row[key] = values[idx] || '';
    });

    if (type === 'route' && row.Code) {
      row.checked = row.checked?.toLowerCase() === 'true';
      row.employeeId = row.Code;
      row.employeeName = row.Name || 'Unknown';
      row.governorate = row.Governorate || 'N/A';
      row.shopName = row.shopname || row.shop || 'Unnamed Shop';
      row.date = row.date || new Date().toISOString().split('T')[0];
      rows.push(row);
    }
    if (type === 'missing' && row.EMPLOYEECODE) {
      row.TITLE = row.TITLE || 'Sales Rep';
      rows.push(row);
    }
  }
  return rows;
};

// ==================== COMPONENTS ====================
const StatCard = ({ title, value, subtext, icon, color = 'blue' }) => (
  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow hover:shadow-lg transition">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm text-slate-500">{title}</p>
        <h3 className="text-3xl font-bold mt-2">{value}</h3>
        <p className={`text-xs mt-2 ${color === 'red' ? 'text-red-600' : 'text-emerald-600'}`}>{subtext}</p>
      </div>
      <div className={`p-3 rounded-lg ${color === 'red' ? 'bg-red-50 text-red-600' : color === 'blue' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>
        {icon}
      </div>
    </div>
  </div>
);

const FraudAlertRow = ({ alert }) => (
  <div className="flex gap-4 p-4 border-b hover:bg-red-50 transition">
    <Siren size={18} className="text-red-600 mt-1 flex-shrink-0" />
    <div>
      <div className="flex justify-between gap-4">
        <strong>{alert.employeeName} ({alert.employeeId})</strong>
        <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">{alert.type}</span>
      </div>
      <p className="text-sm text-slate-600 mt-1">{alert.details}</p>
      <p className="text-xs text-slate-400 flex items-center gap-1"><MapPin size={12} /> {alert.location}</p>
    </div>
  </div>
);

export default function App() {
  const [activeTab, setActiveTab] = useState('RouteTracking');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [routeData, setRouteData] = useState([]);
  const [missingData, setMissingData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [db, setDb] = useState(null);
  const [userId, setUserId] = useState('demo-user');

  const ROUTE_PATH = `/artifacts/${APP_ID}/public/data/route_visits`;
  const MISSING_PATH = `/artifacts/${APP_ID}/public/data/missing_list`;

  // ==================== INIT (Works with or without Firebase) ====================
  useEffect(() => {
    const init = async () => {
      if (FIREBASE_CONFIG) {
        try {
          const { initializeApp } = await import('firebase/app');
          const { getAuth, signInAnonymously, onAuthStateChanged } = await import('firebase/auth');
          const { getFirestore } = await import('firebase/firestore');

          const app = initializeApp(FIREBASE_CONFIG);
          const auth = getAuth(app);
          const firestore = getFirestore(app);
          setDb(firestore);

          onAuthStateChanged(auth, user => {
            if (user) setUserId(user.uid);
            else signInAnonymously(auth);
          });
        } catch (err) {
          console.warn('Firebase failed → running in demo mode');
        }
      }
      // Always continue after max 3 seconds
      setTimeout(() => {
        setLoading(false);
      }, 3000);
    };
    init();
  }, []);

  // ==================== DATA LISTENERS (Optional) ====================
  useEffect(() => {
    if (!db) return;
    const unsubRoute = onSnapshot(query(collection(db, ROUTE_PATH)), snap => {
      setRouteData(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    const unsubMissing = onSnapshot(query(collection(db, MISSING_PATH)), snap => {
      setMissingData(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => { unsubRoute(); unsubMissing(); };
  }, [db]);

  // ==================== UPLOAD ====================
  const uploadCSV = async (text, type) => {
    if (!db) {
      alert('Running in demo mode — data will not be saved');
      return;
    }
    const data = parseCSV(text, type);
    const path = type === 'route' ? ROUTE_PATH : MISSING_PATH;
    for (const row of data) {
      await addDoc(collection(db, path), { ...row, uploadedBy: userId, timestamp: serverTimestamp() });
    }
    alert(`Uploaded ${data.length} records`);
  };

  // ==================== METRICS ====================
  const metrics = useMemo(() => {
    const total = routeData.length;
    const checked = routeData.filter(r => r.checked).length;
    const compliance = total ? Math.round((checked / total) * 100) : 0;
    const alerts = [];

    routeData.forEach(r => {
      if (!r.checked) {
        alerts.push({
          employeeId: r.employeeId,
          employeeName: r.employeeName,
          type: 'GAP',
          details: `Missed visit at ${r.shopName}`,
          location: r.governorate || 'Unknown'
        });
      }
    });

    const recorded = new Set(routeData.map(r => r.employeeId));
    missingData.forEach(m => {
      if (!recorded.has(m.EMPLOYEECODE)) {
        alerts.push({
          employeeId: m.EMPLOYEECODE,
          employeeName: m.EMPLOYEENAME,
          type: 'UNREPORTED',
          details: 'No visits recorded despite being assigned',
          location: m.GOVERNORATENAME || 'Unknown'
        });
      }
    });

    return { total, compliance, alerts: alerts.slice(0, 20) };
  }, [routeData, missingData]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-blue-600 text-white">
        <Zap size={64} className="animate-pulse mb-6" />
        <h1 className="text-4xl font-bold">Fraud Falcon</h1>
        <p className="text-xl mt-4">Initializing Systems...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 bg-slate-900 text-white transition-all ${sidebarOpen ? 'w-64' : 'w-20'} flex flex-col`}>
        <div className="p-5 flex items-center gap-3 border-b border-slate-800">
          <Zap size={32} className="text-blue-400" />
          {sidebarOpen && <span className="text-xl font-bold">Fraud Falcon</span>}
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {['RouteTracking', 'MissingList', 'Import'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${activeTab === tab ? 'bg-blue-600' : 'hover:bg-slate-800'}`}
            >
              {tab === 'RouteTracking' && <Map size={20} />}
              {tab === 'MissingList' && <AlertOctagon size={20} />}
              {tab === 'Import' && <Database size={20} />}
              {sidebarOpen && <span>{tab === 'RouteTracking' ? 'Dashboard' : tab === 'MissingList' ? 'Missing' : 'Upload'}</span>}
            </button>
          ))}
        </nav>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-4 hover:bg-slate-800">
          <Menu size={24} />
        </button>
      </aside>

      {/* Main */}
      <main className={`flex-1 overflow-auto transition-all ${sidebarOpen ? 'ml-64' : 'ml-20'} p-8`}>
        {activeTab === 'RouteTracking' && (
          <div className="space-y-8">
            <h1 className="text-3xl font-bold">Route Tracking Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <StatCard title="Total Visits" value={metrics.total} icon={<Map size={24}/>} />
              <StatCard title="Compliance" value={`${metrics.compliance}%`} icon={metrics.compliance < 80 ? <ArrowDownRight size={24}/> : <TrendingUp size={24}/>} color={metrics.compliance < 80 ? 'red' : 'green'} />
              <StatCard title="Active Staff" value={new Set(routeData.map(r => r.employeeId)).size} icon={<Users size={24}/>} />
              <StatCard title="Fraud Alerts" value={metrics.alerts.length} icon={<Siren size={24}/>} color="red" />
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-white p-6 rounded-xl border">
                <h2 className="text-xl font-bold mb-4">Compliance Overview</h2>
                <div className="h-64">
                  <ResponsiveContainer>
                    <BarChart data={[{ name: 'Today', compliance: metrics.compliance }]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="compliance" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white rounded-xl border overflow-hidden">
                <div className="bg-red-50 px-6 py-4 font-bold flex justify-between">
                  <span>Fraud Radar</span>
                  <span className="text-red-700">{metrics.alerts.length} alerts</span>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {metrics.alerts.length ? metrics.alerts.map((a, i) => <FraudAlertRow key={i} alert={a} />) 
                    : <div className="p-8 text-center text-green-600 font-medium">No alerts — All clear!</div>}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Import' && (
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">Upload Data</h1>
            <textarea className="w-full h-96 p-4 border rounded-lg font-mono text-sm" placeholder="Paste CSV here..." id="csv" />
            <div className="mt-4 flex gap-4">
              <button onClick={() => uploadCSV(document.getElementById('csv').value, 'route')} className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700">Upload Route Map</button>
              <button onClick={() => uploadCSV(document.getElementById('csv').value, 'missing')} className="px-6 py-3 bg-purple-600 text-white rounded hover:bg-purple-700">Upload Missing List</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
