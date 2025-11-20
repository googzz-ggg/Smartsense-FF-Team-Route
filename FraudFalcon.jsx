import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  // Lucide Icons
  Map, 
  FileBarChart, 
  ShieldAlert, 
  Menu, 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  Upload, 
  Siren,
  CheckCircle,
  XCircle,
  MapPin,
  Filter,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Database,
  User,
  Zap,
  ListMinus,
  AlertOctagon,
} from 'lucide-react';
import { 
  // Recharts for charting
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
} from 'recharts';

// --- Firebase Imports (For Persistence & Multi-User Access) ---
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  signInWithCustomToken, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  addDoc, 
  collection, 
  query, 
  onSnapshot, 
  serverTimestamp,
  orderBy, 
  where,
} from 'firebase/firestore';


// --- Utility Functions ---

/**
 * Converts CSV content string into a structured array of objects.
 * Assumes the first row is the header.
 * @param {string} csvText The raw CSV string content.
 * @param {string} type The type of CSV: 'route' or 'missing'.
 * @returns {Array<Object>} Array of objects mapping headers to values.
 */
const parseCSV = (csvText, type) => {
    if (!csvText || csvText.trim() === "") return [];

    const lines = csvText.trim().split('\n').filter(line => line.trim() !== '');
    if (lines.length === 0) return [];

    const rawHeaders = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const headers = [];
    const headerMap = new Map();

    // Clean headers and handle duplicates
    rawHeaders.forEach((rawHeader, index) => {
        let cleanHeader = rawHeader.replace(/[^a-zA-Z0-9\s]/g, '').trim().replace(/\s+/g, '');
        
        // Standardize common headers for both file types
        if (cleanHeader.toLowerCase().includes('date')) cleanHeader = 'date';
        if (cleanHeader.toLowerCase().includes('code') && cleanHeader.length < 5) cleanHeader = 'Code'; // Employee Code from Route
        if (cleanHeader.toLowerCase().includes('employeecode')) cleanHeader = 'EMPLOYEECODE'; // Employee Code from Missing
        if (cleanHeader.toLowerCase().includes('name')) cleanHeader = 'Name'; // Employee Name from Route
        if (cleanHeader.toLowerCase().includes('employeename')) cleanHeader = 'EMPLOYEENAME'; // Employee Name from Missing
        if (cleanHeader.toLowerCase().includes('governorate')) cleanHeader = 'Governorate'; // Governorates from Route
        if (cleanHeader.toLowerCase().includes('governoratename')) cleanHeader = 'GOVERNORATENAME'; // Governorates from Missing
        if (cleanHeader === 'Check') cleanHeader = 'checked'; // Standardize completion status

        let key = cleanHeader;
        let count = 1;
        while(headerMap.has(key)) {
            key = cleanHeader + count;
            count++;
        }
        headers.push(key);
        headerMap.set(key, index);
    });

    const data = [];
    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        if (values.length !== rawHeaders.length) continue; // Skip malformed rows
        
        const row = {};
        headers.forEach((header, index) => {
            row[header] = values[index] ? values[index].trim().replace(/"/g, '') : '';
        });

        // --- Standardize Output based on File Type ---
        if (type === 'route') {
            row.checked = row.checked && row.checked.toLowerCase() === 'true'; 
            row.employeeId = row.Code || null;
            row.employeeName = row.Name || null;
            row.governorate = row.Governorate || null;
            row.shopName = row.ShopName || row.ShopName1 || null;
            row.date = row.date || null;
            
            if (row.employeeId) {
                 data.push(row);
            }
        } else if (type === 'missing') {
            // Missing List specific fields (Ensure they match the cleaned headers)
            row.EMPLOYEECODE = row.EMPLOYEECODE || null;
            row.EMPLOYEENAME = row.EMPLOYEENAME || null;
            row.GOVERNORATENAME = row.GOVERNORATENAME || null;
            row.TITLE = row.TITLE || 'Unknown';

            if (row.EMPLOYEECODE) {
                 data.push(row);
            }
        }
    }
    return data;
};


// --- Component Structure and Logic ---

const StatCard = ({ title, value, subtext, icon, color }) => (
  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.01] cursor-pointer">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <h3 className="mt-2 text-3xl font-bold text-slate-900">{value}</h3>
        <p className={`mt-2 text-xs font-medium ${color === 'red' ? 'text-red-600' : 'text-emerald-600'}`}>
          {subtext}
        </p>
      </div>
      <div className={`rounded-lg p-3 ring-1 ring-inset ${
        color === 'red' ? 'bg-red-50 ring-red-100 text-red-600' : 
        color === 'blue' ? 'bg-blue-50 ring-blue-100 text-blue-600' : 
        'bg-emerald-50 ring-emerald-100 text-emerald-600'
      }`}>
        {icon}
      </div>
    </div>
  </div>
);

const ComplianceRow = ({ row }) => (
  <tr className="hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0 text-sm">
    <td className="px-6 py-4 font-medium text-slate-900">
      <div className="flex flex-col">
        <span>{row.shopName}</span>
        <span className="text-xs text-slate-400">{row.District}, {row.Governorate}</span>
      </div>
    </td>
    <td className="px-6 py-4 text-slate-600">{row.employeeName} ({row.employeeId})</td>
    <td className="px-6 py-4 text-slate-500">{row.date}</td>
    <td className="px-6 py-4">
      {row.checked ? (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
          <CheckCircle size={12} /> Visited
        </span>
      ) : (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700">
          <XCircle size={12} /> Missed (GAP)
        </span>
      )}
    </td>
  </tr>
);

const MissingEmployeeRow = ({ employee, isAlert }) => (
  <tr className={`hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0 text-sm ${isAlert ? 'bg-red-50/50 hover:bg-red-100/70' : ''}`}>
    <td className="px-6 py-4 font-medium text-slate-900 flex items-center gap-2">
        {isAlert && <AlertOctagon size={16} className="text-red-500 flex-shrink-0" />}
        {employee.EMPLOYEENAME}
    </td>
    <td className="px-6 py-4 text-slate-600">{employee.EMPLOYEECODE}</td>
    <td className="px-6 py-4 text-slate-500">{employee.TITLE}</td>
    <td className="px-6 py-4 text-slate-500">{employee.GOVERNORATENAME}</td>
    <td className="px-6 py-4">
        {isAlert ? (
             <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700">
                 <Siren size={12} /> Unreported Route
             </span>
        ) : (
             <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                 <ListMinus size={12} /> Expected Coverage
             </span>
        )}
    </td>
  </tr>
);

const FraudAlertRow = ({ alert }) => (
  <div className="flex items-start gap-4 p-4 border-b border-slate-100 last:border-0 hover:bg-red-50/50 transition-colors cursor-pointer">
    <div className="p-2 bg-red-100 text-red-600 rounded-full flex-shrink-0">
      <Siren size={18} />
    </div>
    <div className="flex-1">
      <div className="flex justify-between">
        <h4 className="text-sm font-bold text-slate-900">{alert.employeeName} <span className="text-slate-400 font-normal">({alert.employeeId})</span></h4>
        <span className="text-xs text-red-600 font-bold bg-red-100 px-2 py-0.5 rounded-full">{alert.type}</span>
      </div>
      <p className="text-xs text-slate-600 mt-1">{alert.details}</p>
      <p className="text-xs text-slate-400 mt-1 flex items-center gap-1"><MapPin size={10}/> {alert.location}</p>
    </div>
  </div>
);

// The main application component
export default function RouteTrackingApp() {
  const [activeTab, setActiveTab] = useState('RouteTracking');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [routeData, setRouteData] = useState([]);
  const [missingData, setMissingData] = useState([]); // New state for Missing List
  const [loading, setLoading] = useState(true);
  const [uploadStatus, setUploadStatus] = useState('');

  // --- Firebase State ---
  const [db, setDb] = useState(null);
  const [auth, setAuth] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  // Firestore path constants
  const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
  const ROUTE_COLLECTION_PATH = `/artifacts/${appId}/public/data/route_visits`;
  const MISSING_COLLECTION_PATH = `/artifacts/${appId}/public/data/missing_list`; // New Collection

  // 1. Firebase Initialization and Authentication
  useEffect(() => {
    const initFirebase = async () => {
      try {
        const firebaseConfig = JSON.parse(typeof __firebase_config !== 'undefined' ? __firebase_config : '{}');
        const app = initializeApp(firebaseConfig);
        const firestore = getFirestore(app);
        const authentication = getAuth(app);
        
        setDb(firestore);
        setAuth(authentication);

        const unsubscribe = onAuthStateChanged(authentication, async (user) => {
          if (user) {
            setUserId(user.uid);
            setIsAuthReady(true);
          } else {
            const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;
            if (initialAuthToken) {
                await signInWithCustomToken(authentication, initialAuthToken);
            } else {
                await signInAnonymously(authentication);
            }
          }
        });

        return () => unsubscribe();
      } catch (error) {
        console.error("Firebase Initialization Error:", error);
        setIsAuthReady(true);
      }
    };
    initFirebase();
  }, []);

  // 2. Real-time Data Fetching (Route Map)
  useEffect(() => {
    if (!db || !isAuthReady) return;

    setLoading(true);
    const qRoute = query(collection(db, ROUTE_COLLECTION_PATH));

    const unsubscribeRoute = onSnapshot(qRoute, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      // Simple in-memory sort by date for display
      setRouteData(data.sort((a, b) => new Date(a.date) - new Date(b.date))); 
    }, (error) => {
      console.error("Firestore Route Snapshot Error:", error);
    });

    return () => unsubscribeRoute();
  }, [db, isAuthReady, ROUTE_COLLECTION_PATH]);

  // 3. Real-time Data Fetching (Missing List)
  useEffect(() => {
    if (!db || !isAuthReady) return;

    const qMissing = query(collection(db, MISSING_COLLECTION_PATH));

    const unsubscribeMissing = onSnapshot(qMissing, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMissingData(data);
      setLoading(false); 
    }, (error) => {
      console.error("Firestore Missing Snapshot Error:", error);
      setLoading(false);
    });

    return () => unsubscribeMissing();
  }, [db, isAuthReady, MISSING_COLLECTION_PATH]);


  // 4. Data Ingestion/Upload Handler
  const handleFileUpload = async (csvText, dataType) => {
    if (!db || !userId) {
      setUploadStatus("Error: Database not ready. Please wait.");
      return;
    }
    
    setUploadStatus(`Parsing and validating ${dataType} data...`);
    const parsedData = parseCSV(csvText, dataType);

    if (parsedData.length === 0) {
      setUploadStatus(`Error: No valid data found in ${dataType} CSV file. Check formatting.`);
      return;
    }

    // Determine the target collection path
    const collectionPath = dataType === 'route' ? ROUTE_COLLECTION_PATH : MISSING_COLLECTION_PATH;

    setUploadStatus(`Uploading ${parsedData.length} ${dataType} records to the central ledger...`);
    
    try {
        let recordsAdded = 0;
        // Batch upload (Firestore automatically handles this optimization via Promises)
        const uploadPromises = parsedData.map(async (record) => {
            // Use addDoc for simple record addition
            await addDoc(collection(db, collectionPath), {
                ...record,
                uploadedBy: userId,
                timestamp: serverTimestamp(),
            });
            recordsAdded++;
        });

        await Promise.all(uploadPromises);
        setUploadStatus(`Success! ${recordsAdded} ${dataType} records logged.`);
        // Switch back to the dashboard to see the new data immediately
        setActiveTab('RouteTracking'); 
    } catch (error) {
        console.error("Upload Error:", error);
        setUploadStatus(`Critical Error during upload: ${error.message}`);
    }
  };


  // 5. Computed Metrics and Fraud Logic (useMemo for efficiency)
  const dashboardMetrics = useMemo(() => {
    const totalVisits = routeData.length;
    const completedVisits = routeData.filter(r => r.checked).length;
    const missedVisits = totalVisits - completedVisits;
    const complianceRate = totalVisits > 0 ? Math.round((completedVisits / totalVisits) * 100) : 0;
    
    const governorateMap = {};
    const staffSet = new Set();
    const fraudAlerts = [];
    
    // --- Route Data Aggregation ---
    for (const record of routeData) {
        const gov = record.Governorate || 'Unknown';
        const isChecked = record.checked;
        const employeeId = record.employeeId;

        // Keep track of all staff that reported at least one visit
        staffSet.add(employeeId);

        if (!governorateMap[gov]) {
            governorateMap[gov] = { visits: 0, completed: 0 };
        }
        governorateMap[gov].visits += 1;
        if (isChecked) {
            governorateMap[gov].completed += 1;
        }

        // Rule 1: GAP (Missed Visit - Route Map Check=False)
        if (!isChecked) {
             fraudAlerts.push({
                employeeId: employeeId,
                employeeName: record.employeeName,
                type: 'VISIT GAP',
                details: `Did not check in at ${record.shopName} (Route map failure).`,
                location: `${record.District}, ${gov}`,
            });
        }
    }
    
    // --- Missing Data Cross-Reference (CRITICAL FRAUD ALERT) ---
    // Employee IDs that reported AT LEAST one visit
    const recordedEmployeeIds = new Set(routeData.map(r => r.employeeId).filter(id => id));

    // Employees in the MISSING list who are NOT in the reported list
    const employeesOnlyInMissingList = missingData.filter(
        (missing) => !recordedEmployeeIds.has(missing.EMPLOYEECODE)
    );
    
    // Add these serious non-compliance issues to fraud alerts
    for (const missing of employeesOnlyInMissingList) {
        // Prevent duplicate alerts for the same missing employee
        const existingAlert = fraudAlerts.some(a => a.employeeId === missing.EMPLOYEECODE && a.type === 'UNREPORTED COVERAGE');
        
        if (!existingAlert) {
            fraudAlerts.push({
                employeeId: missing.EMPLOYEECODE,
                employeeName: missing.EMPLOYEENAME,
                type: 'UNREPORTED COVERAGE',
                details: `Employee was expected to execute routes but reported ZERO visits in the Route Map.`,
                location: missing.GOVERNORATENAME,
            });
        }
    }

    // --- Mock Geofence/Velocity Alert (Placeholder for a real system) ---
    const inBothListCount = missingData.filter(m => recordedEmployeeIds.has(m.EMPLOYEECODE)).length;
    if (inBothListCount > 0) {
        // This is a simplified check for risk of dual reporting or data inconsistency
         fraudAlerts.push({
            employeeId: 'Multiple',
            employeeName: 'System Flag',
            type: 'DUAL REPORTING RISK',
            details: `${inBothListCount} employees appear in both lists. Needs audit for conflicting records.`,
            location: 'Multiple Regions',
        });
    }

    // Finalize Governorate Data for Chart
    const governorateData = Object.keys(governorateMap).map(name => {
        const data = governorateMap[name];
        return {
            name: name,
            visits: data.visits,
            compliance: data.visits > 0 ? Math.round((data.completed / data.visits) * 100) : 0,
        };
    }).sort((a, b) => b.visits - a.visits);

    return {
        totalVisits,
        completedVisits,
        missedVisits,
        complianceRate,
        activeStaff: staffSet.size,
        // Ensure UNREPORTED COVERAGE alerts appear first
        fraudAlerts: fraudAlerts.sort((a, b) => (a.type === 'UNREPORTED COVERAGE' ? -1 : 1)), 
        unreportedCoverageCount: employeesOnlyInMissingList.length,
        governorateData,
        employeesOnlyInMissingList,
    };
  }, [routeData, missingData]);

  // Destructure metrics for easy use in the JSX
  const { 
    totalVisits, 
    missedVisits, 
    complianceRate, 
    activeStaff, 
    fraudAlerts, 
    governorateData,
    unreportedCoverageCount,
    employeesOnlyInMissingList,
  } = dashboardMetrics;

  const SidebarItem = ({ icon, label, active, onClick }) => (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
        active 
          ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20' 
          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
      }`}
    >
      {isSidebarOpen ? icon : React.cloneElement(icon, { size: 24 })}
      {isSidebarOpen && <span>{label}</span>}
    </button>
  );

  // --- UI Render ---

  if (loading && !isAuthReady) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-900 text-white flex-col gap-4">
        <Zap size={48} className="animate-pulse text-blue-500" />
        <h1 className="text-xl font-bold">Initializing Fraud Falcon Systems...</h1>
        <p className="text-slate-400">Securing connection to Firestore database.</p>
      </div>
    );
  }

  // Content for the Import Tab
  const ImportContent = () => {
    const [csvInput, setCsvInput] = useState('');
    const [dataType, setDataType] = useState('route');

    const handleTextareaChange = (e) => {
        setCsvInput(e.target.value);
        setUploadStatus('');
    };

    const handleRunUpload = () => {
        if (csvInput.trim()) {
            handleFileUpload(csvInput, dataType);
        } else {
            setUploadStatus("Please paste the CSV data into the field above.");
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 p-4 md:p-0">
            <h2 className="text-3xl font-extrabold text-slate-900">Data Ingestion: Report Upload</h2>
            <p className="text-slate-600">
                Paste the raw CSV content (including the header row) for either the Weekly Route Map or the Missing List below.
            </p>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-lg">
                <div className="mb-6">
                    <label htmlFor="data-type" className="block text-sm font-medium text-slate-700 mb-2">
                        Select Data Type to Upload
                    </label>
                    <select
                        id="data-type"
                        value={dataType}
                        onChange={(e) => setDataType(e.target.value)}
                        className="w-full sm:w-1/2 p-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="route">Route Map (Weekly Visits)</option>
                        <option value="missing">Missing List (Expected/Unreported Coverage)</option>
                    </select>
                </div>

                <label htmlFor="csv-upload" className="block text-sm font-medium text-slate-700 mb-2">
                    Paste Raw CSV Content
                </label>
                <textarea
                    id="csv-upload"
                    rows="15"
                    className="w-full p-4 border border-slate-300 rounded-lg font-mono text-sm resize-none focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                    placeholder={`Paste the ${dataType === 'route' ? 'Route Map (Sub Div.,Job,Code,Name,...)' : 'Missing List (&&&,TITLE,EMPLOYEE CODE,...)'} data here...`}
                    value={csvInput}
                    onChange={handleTextareaChange}
                ></textarea>

                <div className="mt-4 flex items-center justify-between">
                    <p className={`text-sm font-medium ${uploadStatus.includes('Error') ? 'text-red-600' : uploadStatus.includes('Success') ? 'text-emerald-600' : 'text-slate-500'}`}>
                        {uploadStatus || 'Awaiting file content...'}
                    </p>
                    <button 
                        onClick={handleRunUpload}
                        disabled={!csvInput.trim()}
                        className="py-2.5 px-6 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:bg-slate-400 transition-all shadow-md flex items-center gap-2"
                    >
                        <Upload size={18} />
                        Process & Upload {dataType === 'route' ? 'Route' : 'Missing'} Data
                    </button>
                </div>
            </div>
        </div>
    );
  };
  
  // Content for the Missing List Review Tab
  const MissingListContent = () => (
    <div className="space-y-8">
        <h2 className="text-3xl font-extrabold text-slate-900">Missing Coverage Review</h2>
        <p className="text-slate-600">
            This section analyzes the **Missing List** against the **Route Map** to identify employees who failed to report any of their scheduled visits.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <StatCard 
                title="Total Missing List Entries" 
                value={missingData.length} 
                subtext={`Unique Employees: ${new Set(missingData.map(d => d.EMPLOYEECODE)).size}`}
                icon={<ListMinus size={24} />} 
                color="blue"
            />
            <StatCard 
                title="Unreported Coverage Alerts" 
                value={unreportedCoverageCount} 
                subtext={`Employees with 0 recorded visits (Critical Failure)`}
                icon={<AlertOctagon size={24} />} 
                color="red"
            />
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    <ListMinus size={18} className="text-red-600" /> 
                    Employees with Unreported Coverage ({unreportedCoverageCount} Records)
                </h3>
            </div>
            {loading ? (
                <div className="p-6 text-center text-slate-500">Cross-referencing staff data...</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white text-slate-500 text-xs uppercase tracking-wider sticky top-0 z-10">
                            <tr>
                                <th className="px-6 py-3 font-semibold">Employee Name</th>
                                <th className="px-6 py-3 font-semibold">Code</th>
                                <th className="px-6 py-3 font-semibold">Title</th>
                                <th className="px-6 py-3 font-semibold">Governorate (Missing List)</th>
                                <th className="px-6 py-3 font-semibold">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {employeesOnlyInMissingList.length > 0 ? employeesOnlyInMissingList.map((employee, i) => (
                                <MissingEmployeeRow key={i} employee={employee} isAlert={true} />
                            )) : (
                                <tr><td colSpan="5" className="px-6 py-4 text-center text-emerald-500 font-medium">All expected staff reported at least one visit.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    </div>
  );


  // Main Dashboard Content
  const DashboardContent = () => (
    <>
        {/* Top Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard 
              title="Total Visits Logged" 
              value={totalVisits} 
              subtext={loading ? "Loading..." : "Based on central ledger"}
              icon={<Map size={24} />} 
              color="blue"
            />
            <StatCard 
              title="Compliance Rate" 
              value={`${complianceRate}%`} 
              subtext={`${missedVisits} Visit GAP(s) Found in Route`}
              icon={complianceRate < 80 ? <ArrowDownRight size={24} /> : <TrendingUp size={24} />} 
              color={complianceRate < 80 ? 'red' : 'green'}
            />
            <StatCard 
              title="Active Staff Tracked" 
              value={activeStaff} 
              subtext={`Total expected staff: ${new Set(missingData.map(d => d.EMPLOYEECODE)).size}`}
              icon={<Users size={24} />} 
              color="blue"
            />
            <StatCard 
              title="Critical Fraud Alerts" 
              value={fraudAlerts.length} 
              subtext={`${unreportedCoverageCount} Unreported Coverage Alerts`}
              icon={<Siren size={24} />} 
              color="red"
            />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Charts & Compliance */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Governorate Performance Chart */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-6">Visits & Compliance by Governorate</h3>
                <div className="h-[300px]">
                  {loading ? (
                    <div className="flex justify-center items-center h-full text-slate-400">Loading Chart Data...</div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={governorateData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} />
                        <YAxis yAxisId="left" orientation="left" stroke="#3b82f6" axisLine={false} tickLine={false} />
                        <YAxis yAxisId="right" orientation="right" stroke="#10b981" axisLine={false} tickLine={false} domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                        <Tooltip 
                            cursor={{fill: '#f8fafc'}} 
                            contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                        />
                        <Bar yAxisId="left" dataKey="visits" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Total Visits" />
                        <Bar yAxisId="right" dataKey="compliance" fill="#10b981" radius={[4, 4, 0, 0]} name="Compliance %" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* Consolidated Compliance Table */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    <FileBarChart size={18} className="text-blue-600" /> 
                    Consolidated Route Compliance ({routeData.length} Records)
                  </h3>
                  <div className="flex gap-2">
                    <button className="p-1.5 text-slate-500 hover:bg-slate-100 rounded"><Filter size={16}/></button>
                    <button className="p-1.5 text-slate-500 hover:bg-slate-100 rounded"><Search size={16}/></button>
                  </div>
                </div>
                {loading ? (
                    <div className="p-6 text-center text-slate-500">Retrieving intelligence...</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider sticky top-0 z-10">
                                <tr>
                                    <th className="px-6 py-3 font-semibold">Shop / Area</th>
                                    <th className="px-6 py-3 font-semibold">Employee</th>
                                    <th className="px-6 py-3 font-semibold">Date</th>
                                    <th className="px-6 py-3 font-semibold">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {routeData.length > 0 ? routeData.map((row, i) => (
                                    <ComplianceRow key={i} row={row} />
                                )) : (
                                    <tr><td colSpan="4" className="px-6 py-4 text-center text-slate-400">No route data loaded yet. Upload a report to begin tracking.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
              </div>
            </div>

            {/* Right Column: Fraud Radar & Missing */}
            <div className="space-y-8">
              
              {/* Fraud Radar Panel */}
              <div className="bg-white rounded-xl border border-red-100 shadow-sm overflow-hidden">
                <div className="bg-red-50 px-6 py-4 border-b border-red-100 flex justify-between items-center">
                  <h3 className="font-bold text-red-800 flex items-center gap-2">
                    <ShieldAlert size={18} /> 
                    Fraud Radar
                  </h3>
                  <span className="bg-red-200 text-red-800 text-xs font-bold px-2 py-0.5 rounded-full">{fraudAlerts.length} Alerts</span>
                </div>
                <div className="max-h-[500px] overflow-y-auto">
                  {fraudAlerts.length > 0 ? fraudAlerts.map((alert, i) => (
                    <FraudAlertRow key={i} alert={alert} />
                  )) : (
                    <div className="p-4 text-center text-emerald-500 font-medium">No critical alerts detected. All clear.</div>
                  )}
                </div>
                <div className="p-4 bg-slate-50 text-center">
                  <button className="text-xs font-medium text-slate-500 hover:text-slate-800">View All Security Logs</button>
                </div>
              </div>

              {/* Data Integrity Gaps */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-slate-900 mb-4">System and Data Integrity</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
                      <div className="p-2 bg-amber-100 rounded text-amber-600"><AlertTriangle size={20}/></div>
                      <div>
                          <div className="text-sm font-bold text-slate-800">{missedVisits} In-Route Gaps Found</div>
                          <div className="text-xs text-slate-500">Staff missed specific shops on reported routes.</div>
                      </div>
                  </div>
                   <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-100">
                      <div className="p-2 bg-red-100 rounded text-red-600"><AlertOctagon size={20}/></div>
                      <div>
                          <div className="text-sm font-bold text-slate-800">{unreportedCoverageCount} Missing Employee Alerts</div>
                          <div className="text-xs text-slate-500">Employees expected to report had ZERO recorded visits.</div>
                      </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-slate-100 rounded-lg border border-slate-200">
                      <div className="p-2 bg-slate-200 rounded text-slate-600"><User size={20}/></div>
                      <div>
                          <div className="text-sm font-bold text-slate-800">Current User ID:</div>
                          <div className="text-xs text-slate-500 break-all">{userId || 'N/A'}</div>
                      </div>
                  </div>
                </div>
              </div>

            </div>
        </div>
    </>
  );


  return (
    <div className="flex min-h-screen w-full bg-slate-50 font-sans text-slate-900">
      <style>{`
        /* Custom scrollbar for better visual on dark sidebar/light content */
        .overflow-y-auto::-webkit-scrollbar {
            width: 8px;
        }
        .overflow-y-auto::-webkit-scrollbar-thumb {
            background-color: #d1d5db; /* Light gray */
            border-radius: 4px;
        }
        .overflow-y-auto::-webkit-scrollbar-track {
            background-color: #f9fafb; /* Lighter background */
        }
        /* Specific styling for the table within the dashboard */
        .overflow-x-auto::-webkit-scrollbar {
            height: 6px;
        }
        .overflow-x-auto::-webkit-scrollbar-thumb {
            background-color: #94a3b8;
            border-radius: 3px;
        }
      `}</style>
      
      {/* Sidebar (The Command Center) */}
      <aside 
        className={`${
          isSidebarOpen ? 'w-72' : 'w-20'
        } hidden md:flex flex-col bg-slate-900 text-white transition-all duration-300 ease-in-out flex-shrink-0 relative z-20 shadow-xl`}
      >
        <div className="flex h-16 items-center border-b border-slate-800 px-6 font-bold tracking-wider">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-red-600 flex items-center justify-center font-bold text-white shadow-lg shadow-red-500/30">FF</div>
            {isSidebarOpen && (
              <div className="flex flex-col">
                <span className="text-base leading-none"><span className="text-red-500">FRAUD</span>FALCON</span>
                <span className="text-[10px] text-slate-500 font-normal tracking-widest uppercase">Route Tracking</span>
              </div>
            )}
          </div>
        </div>

        <nav className="flex-1 space-y-1.5 px-3 py-6">
          <SidebarItem 
            icon={<Map size={20} />} 
            label={"Dashboard & Route"} 
            active={activeTab === 'RouteTracking'} 
            onClick={() => setActiveTab('RouteTracking')}
          />
          <SidebarItem 
            icon={<ShieldAlert size={20} />} 
            label={"Fraud Radar"} 
            active={activeTab === 'FraudRadar'} 
            onClick={() => setActiveTab('FraudRadar')}
          />
          <SidebarItem 
            icon={<ListMinus size={20} />} 
            label={"Missing Coverage"} 
            active={activeTab === 'MissingReview'} 
            onClick={() => setActiveTab('MissingReview')}
          />
          <div className="pt-4 pb-2">
            {isSidebarOpen && <div className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Data Ingestion</div>}
          </div>
          <SidebarItem 
            icon={<Upload size={20} />} 
            label={"Upload Data CSV"} 
            active={activeTab === 'Import'} 
            onClick={() => setActiveTab('Import')}
          />
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex flex-1 flex-col overflow-hidden relative">
        
        {/* Header (Control Panel) */}
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6 shadow-sm z-10">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-slate-500 hover:bg-slate-100 p-2 rounded-lg hidden md:block">
              <Menu size={20} />
            </button>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              {activeTab === 'RouteTracking' ? 'Route Tracking Dashboard' : activeTab === 'Import' ? 'Data Upload' : activeTab === 'MissingReview' ? 'Missing Coverage Review' : 'Intelligence'}
              <span className="text-slate-400 font-normal text-sm hidden sm:inline">| Status: {loading ? 'Syncing...' : 'Live'}</span>
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {/* Status Indicator */}
            <div className="hidden sm:flex items-center gap-2 text-sm text-slate-500">
                <Database size={16} className={loading ? 'animate-spin text-amber-500' : 'text-emerald-500'} />
                <span className="font-medium">{loading ? 'Syncing...' : 'Connected'}</span>
            </div>
          </div>
        </header>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
          {(activeTab === 'RouteTracking' || activeTab === 'FraudRadar') && <DashboardContent />}
          {activeTab === 'MissingReview' && <MissingListContent />}
          {activeTab === 'Import' && <ImportContent />}
        </div>
      </main>
    </div>
  );
}
