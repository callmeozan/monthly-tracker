import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { supabase } from './lib/supabaseClient';
import AOS from 'aos';
import 'aos/dist/aos.css';

import Keuangan from './Keuangan';
import Siswa from './Siswa';
import Sistem from './Sistem';

import { 
  Users, 
  Edit3, 
  UserPlus, 
  X, 
  Wallet, 
  FileText, 
  Home, 
  Settings, 
  ArrowUpRight,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState('beranda');

  // Supabase Data State
  const [revenueData, setRevenueData] = useState([]);
  const [activeStudents, setActiveStudents] = useState(0);
  const [currentRevenue, setCurrentRevenue] = useState(0);
  const [growthRate, setGrowthRate] = useState(0);
  const [studentList, setStudentList] = useState([]);

  // Auth & Admin State
  const [isAdmin, setIsAdmin] = useState(() => {
    return localStorage.getItem('pec_is_admin') === 'true';
  });

  const [adminPassword, setAdminPassword] = useState(() => {
    return localStorage.getItem('pec_admin_password') || 'admin123';
  });

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

  // Form State (Revenue)
  const [isRevenueModalOpen, setIsRevenueModalOpen] = useState(false);
  const [period, setPeriod] = useState('2026-09');
  const [revenueInput, setRevenueInput] = useState('');
  const [notesInput, setNotesInput] = useState('');

  const [deleteStudentTarget, setDeleteStudentTarget] = useState(null);
  const [deleteRevenueTarget, setDeleteRevenueTarget] = useState(null);

  // Toast Notification State
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3200);
  };

  // Initialize AOS
  useEffect(() => {
    AOS.init({
      duration: 600,
      easing: 'ease-out-cubic',
      once: true,
    });
  }, []);

  useEffect(() => {
    AOS.refresh();
  }, [activeTab]);

  // Fetch Supabase Data
  const fetchData = async () => {
    try {
      const { data: revData } = await supabase
        .from('monthly_summaries')
        .select('*')
        .order('period', { ascending: true });

      if (revData && revData.length > 0) {
        setRevenueData(revData);
        
        const currentIdx = revData.findIndex(item => item.period.startsWith(period));
        const activeItem = currentIdx !== -1 ? revData[currentIdx] : revData[revData.length - 1];
        
        setCurrentRevenue(activeItem ? activeItem.total_revenue : 0);

        if (currentIdx > 0) {
          const prevRev = revData[currentIdx - 1].total_revenue;
          if (prevRev > 0) {
            const growth = ((activeItem.total_revenue - prevRev) / prevRev) * 100;
            setGrowthRate(growth.toFixed(1));
          }
        } else {
          setGrowthRate(0);
        }
      } else {
        setRevenueData([]);
        setCurrentRevenue(0);
        setGrowthRate(0);
      }

      const { data: students, count } = await supabase
        .from('students')
        .select('*', { count: 'exact' })
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (students) {
        setStudentList(students);
        setActiveStudents(count || 0);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [period]);

  // Auth Handlers
  const handleLogin = (e) => {
    e.preventDefault();
    if (usernameInput === 'admin' && passwordInput === adminPassword) {
      setIsAdmin(true);
      localStorage.setItem('pec_is_admin', 'true'); // Simpan sesi login
      setIsLoginModalOpen(false);
      setUsernameInput('');
      setPasswordInput('');
      setLoginError('');
      showToast('Successfully logged in as Administrator!');
    } else {
      setLoginError('Invalid username or password!');
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
    localStorage.removeItem('pec_is_admin'); // Hapus sesi login
    showToast('Logged out of Admin mode.', 'info');
  };

  // Revenue Handlers
  const handleSaveRevenue = async (e) => {
    e.preventDefault();
    const formattedPeriod = `${period}-01`;

    const { error } = await supabase
      .from('monthly_summaries')
      .upsert({
        period: formattedPeriod,
        total_revenue: Number(revenueInput),
        notes: notesInput,
        updated_at: new Date().toISOString()
      }, { onConflict: 'period' });

    if (!error) {
      setIsRevenueModalOpen(false);
      setRevenueInput('');
      setNotesInput('');
      fetchData();
      showToast('Financial record saved successfully!');
    } else {
      showToast(`Failed to save record: ${error.message}`, 'error');
    }
  };

  const handleOpenEditRevenue = (record) => {
    const formattedMonth = record.period.slice(0, 7);
    setPeriod(formattedMonth);
    setRevenueInput(record.total_revenue);
    setNotesInput(record.notes || '');
    setIsRevenueModalOpen(true);
  };

  const handleDeleteRevenue = async (periodToDelete) => {
    const { error } = await supabase
      .from('monthly_summaries')
      .delete()
      .eq('period', periodToDelete);

    if (!error) {
      fetchData();
      showToast('Financial record deleted successfully!');
    } else {
      showToast(`Failed to delete record: ${error.message}`, 'error');
    }
  };

  // Student Handlers
  const handleAddStudent = async (name) => {
    const { error } = await supabase
      .from('students')
      .insert([{ full_name: name, is_active: true }]);

    if (!error) {
      fetchData();
      showToast(`Student "${name}" successfully registered!`);
    } else {
      showToast(`Failed to add student: ${error.message}`, 'error');
    }
  };

  const handleUpdateStudent = async (id, updatedName) => {
    const { error } = await supabase
      .from('students')
      .update({ full_name: updatedName })
      .eq('id', id);

    if (!error) {
      fetchData();
      showToast('Student name updated successfully!');
    } else {
      showToast(`Failed to update student: ${error.message}`, 'error');
    }
  };

  const handleDeactivateStudent = async (id) => {
    const { error } = await supabase
      .from('students')
      .update({ is_active: false })
      .eq('id', id);

    if (!error) {
      fetchData();
      showToast('Student successfully removed from active roster!');
    } else {
      showToast(`Failed to remove student: ${error.message}`, 'error');
    }
  };

  // Area Chart formatting
  const chartData = revenueData.map(item => ({
    month: new Date(item.period).toLocaleDateString('en-US', { month: 'short' }),
    amount: item.total_revenue,
    amountMillion: item.total_revenue / 1_000_000
  }));

  return (
    <div className="min-h-screen bg-[#F7F4EE] text-neutral-800 flex justify-center py-6 px-4 pb-28 selection:bg-amber-100 relative">
      
      {/* FLOATING TOAST NOTIFICATION */}
      {toast.show && (
        <div className="fixed top-5 z-50 animate-slide-up flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-[#1C1A17] text-white shadow-2xl border border-neutral-700 text-xs">
          {toast.type === 'error' ? (
            <AlertCircle size={16} className="text-red-400 shrink-0" />
          ) : (
            <CheckCircle2 size={16} className="text-[#FBBF24] shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      <div className="w-full max-w-sm sm:max-w-md flex flex-col gap-5">
        
        {/* App Header */}
        <header data-aos="fade-down" className="flex justify-between items-center px-1">
          <div>
            <p className="text-[10px] font-bold tracking-widest text-[#000000] uppercase">DASHBOARD</p>
            <h1 className="text-2xl font-serif text-neutral-900 tracking-tight">
              <span className="italic font-normal text-[#92400E]">PEC Sarakan</span>
            </h1>
          </div>

          {isAdmin ? (
            <button 
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-semibold hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition shadow-sm"
              title="Click to Log Out"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Admin (Exit)
            </button>
          ) : (
            <button 
              onClick={() => setIsLoginModalOpen(true)}
              className="w-10 h-10 rounded-full bg-[#EFE8DC] border border-[#E2D8C6] flex items-center justify-center shadow-inner hover:bg-[#e4dbcb] transition"
              title="Sign in as Administrator"
            >
              <span className="font-serif font-bold text-xs text-[#78350F]">PEC</span>
            </button>
          )}
        </header>

        {/* VIEW 1: HOME */}
        {activeTab === 'beranda' && (
          <>
            {/* HERO CARD */}
            <div 
              data-aos="fade-up" 
              data-aos-delay="100" 
              className="relative rounded-[2rem] p-6 shadow-2xl overflow-hidden bg-gradient-to-b from-[#2A241F] to-[#171412] text-white border border-[#3E362F]/60"
            >
              <div className="absolute -top-10 -right-10 w-44 h-44 bg-amber-500/15 rounded-full blur-2xl pointer-events-none"></div>

              <div className="relative z-10">
                <div className="flex justify-between items-center mb-5">
                  <span className="inline-flex items-center gap-2 bg-[#383029]/80 backdrop-blur-md text-[#FBBF24] text-[11px] font-medium px-3.5 py-1.5 rounded-full border border-amber-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FBBF24] animate-pulse"></span>
                    PEC MONTHLY REVENUE
                  </span>
                  {isAdmin && (
                    <button 
                      onClick={() => {
                        setRevenueInput('');
                        setNotesInput('');
                        setIsRevenueModalOpen(true);
                      }}
                      className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 transition flex items-center justify-center border border-white/10 text-amber-300"
                      title="Edit Revenue"
                    >
                      <Edit3 size={14} />
                    </button>
                  )}
                </div>

                <p className="text-[11px] font-medium text-neutral-400 tracking-wide">TOTAL RECORDED REVENUE</p>
                <h2 className="text-3xl sm:text-4xl font-serif font-medium tracking-tight mt-1 text-[#FBF9F5]">
                  Rp {Number(currentRevenue).toLocaleString('id-ID')}
                </h2>

                <div className="mt-4 pt-3 pb-4 border-t border-b border-white/10 grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                    <ArrowUpRight size={14} />
                    <span>+{growthRate}% vs Prev</span>
                  </div>
                  <div className="text-right text-neutral-400 font-mono text-[11px]">
                    {new Date(`${period}-01`).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-4 text-center">
                  <div>
                    <p className="text-lg font-bold text-white tracking-tight">{activeStudents}</p>
                    <p className="text-[10px] text-neutral-400 font-semibold tracking-wider mt-0.5 uppercase">Students</p>
                  </div>
                  <div className="border-x border-white/10 px-1">
                    <p className="text-lg font-bold text-[#FBBF24] tracking-tight">Active</p>
                    <p className="text-[10px] text-neutral-400 font-semibold tracking-wider mt-0.5 uppercase">Status</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-emerald-400 tracking-tight">100%</p>
                    <p className="text-[10px] text-neutral-400 font-semibold tracking-wider mt-0.5 uppercase">Verified</p>
                  </div>
                </div>
              </div>
            </div>

            {/* QUICK ACTIONS */}
            <div 
              data-aos="fade-up" 
              data-aos-delay="200" 
              className="grid grid-cols-4 gap-2.5"
            >
              <button 
                onClick={() => {
                  if (isAdmin) {
                    setRevenueInput('');
                    setNotesInput('');
                    setIsRevenueModalOpen(true);
                  } else {
                    setActiveTab('keuangan');
                  }
                }}
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white shadow-sm border border-[#EFE8DC] active:scale-95 transition group"
              >
                <div className="w-11 h-11 rounded-2xl bg-amber-50 text-[#B45309] flex items-center justify-center mb-2 group-hover:bg-[#B45309] group-hover:text-white transition shadow-sm">
                  <Wallet size={19} />
                </div>
                <span className="text-[11px] font-semibold text-neutral-700">
                  {isAdmin ? 'Edit Funds' : 'View Funds'}
                </span>
              </button>

              <button 
                onClick={() => setActiveTab('siswa')}
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white shadow-sm border border-[#EFE8DC] active:scale-95 transition group"
              >
                <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-2 group-hover:bg-emerald-700 group-hover:text-white transition shadow-sm">
                  <Users size={19} />
                </div>
                <span className="text-[11px] font-semibold text-neutral-700">Students</span>
              </button>

              <button 
                onClick={() => {
                  if (isAdmin) {
                    setActiveTab('siswa');
                  } else {
                    setIsLoginModalOpen(true);
                  }
                }}
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white shadow-sm border border-[#EFE8DC] active:scale-95 transition group"
              >
                <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center mb-2 group-hover:bg-blue-700 group-hover:text-white transition shadow-sm">
                  <UserPlus size={19} />
                </div>
                <span className="text-[11px] font-semibold text-neutral-700">Register</span>
              </button>

              <button 
                onClick={() => setActiveTab('keuangan')}
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white shadow-sm border border-[#EFE8DC] active:scale-95 transition group"
              >
                <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center mb-2 group-hover:bg-purple-700 group-hover:text-white transition shadow-sm">
                  <FileText size={19} />
                </div>
                <span className="text-[11px] font-semibold text-neutral-700">Reports</span>
              </button>
            </div>

            {/* AREA CHART */}
            <div 
              data-aos="fade-up" 
              data-aos-delay="300" 
              className="bg-white rounded-[2rem] p-5 shadow-sm border border-[#EFE8DC] flex flex-col gap-3"
            >
              <div className="flex justify-between items-center px-1">
                <div>
                  <p className="text-[10px] font-bold tracking-wider text-neutral-400 uppercase">MONTHLY PERFORMANCE</p>
                  <h3 className="text-base font-bold text-neutral-900">Revenue Trajectory</h3>
                </div>
                <span className="text-[10px] bg-neutral-100 text-neutral-600 font-semibold px-2 py-1 rounded-md">
                  (Million IDR)
                </span>
              </div>

              <div className="w-full h-52 pt-3">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#D97706" stopOpacity={0.35}/>
                        <stop offset="95%" stopColor="#D97706" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#F1EFE9" />
                    <XAxis 
                      dataKey="month" 
                      tickLine={false} 
                      axisLine={false} 
                      tick={{ fill: '#8C857B', fontSize: 11, fontWeight: 500 }} 
                    />
                    <YAxis 
                      tickLine={false} 
                      axisLine={false} 
                      tick={{ fill: '#8C857B', fontSize: 11, fontWeight: 500 }} 
                      unit="M"
                    />
                    <Tooltip 
                      formatter={(val) => [`Rp ${(val * 1_000_000).toLocaleString('id-ID')}`, 'Total']}
                      contentStyle={{ 
                        borderRadius: '16px', 
                        border: 'none', 
                        backgroundColor: '#1E1B18', 
                        color: '#fff', 
                        fontSize: '12px',
                        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="amountMillion" 
                      stroke="#B45309" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorRevenue)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}

        {/* VIEW 2: REVENUE HISTORY */}
        {activeTab === 'keuangan' && (
          <Keuangan 
            revenueData={revenueData} 
            isAdmin={isAdmin} 
            onOpenAddModal={() => {
              setRevenueInput('');
              setNotesInput('');
              setIsRevenueModalOpen(true);
            }}
            onEditRevenue={handleOpenEditRevenue}
            onDeleteRevenue={(item) => setDeleteRevenueTarget(item)}
          />
        )}

        {/* VIEW 3: STUDENT ROSTER */}
        {activeTab === 'siswa' && (
          <Siswa 
            studentList={studentList} 
            activeStudents={activeStudents} 
            isAdmin={isAdmin} 
            onAddStudent={handleAddStudent} 
            onUpdateStudent={handleUpdateStudent}
            onDeactivateStudent={(student) => setDeleteStudentTarget(student)} 
          />
        )}

        {/* VIEW 4: SYSTEM & PREFERENCES */}
        {activeTab === 'sistem' && (
          <Sistem 
            isAdmin={isAdmin} 
            onOpenLoginModal={() => setIsLoginModalOpen(true)} 
            onLogout={handleLogout} 
            adminPassword={adminPassword} 
            onUpdatePassword={(newPass) => {
              setAdminPassword(newPass);
              localStorage.setItem('pec_admin_password', newPass); // Simpan password permanen
              showToast('Admin password updated successfully!');
            }} 
          />
        )}

      </div>

      {/* FLOATING BOTTOM NAV BAR */}
      <nav className="fixed bottom-4 inset-x-4 max-w-sm sm:max-w-md mx-auto bg-[#1C1A17] text-neutral-400 rounded-3xl p-2 shadow-2xl flex justify-around items-center border border-neutral-800 z-40 backdrop-blur-lg">
        <button 
          onClick={() => setActiveTab('beranda')}
          className={`flex flex-col items-center gap-1 p-1.5 transition ${activeTab === 'beranda' ? 'text-[#FBBF24]' : 'hover:text-white'}`}
        >
          <Home size={18} />
          <span className="text-[10px] font-medium">Home</span>
        </button>

        <button 
          onClick={() => setActiveTab('keuangan')}
          className={`flex flex-col items-center gap-1 p-1.5 transition ${activeTab === 'keuangan' ? 'text-[#FBBF24]' : 'hover:text-white'}`}
        >
          <Wallet size={18} />
          <span className="text-[10px] font-medium">Finance</span>
        </button>

        <button 
          onClick={() => setActiveTab('siswa')}
          className={`flex flex-col items-center gap-1 p-1.5 transition ${activeTab === 'siswa' ? 'text-[#FBBF24]' : 'hover:text-white'}`}
        >
          <Users size={18} />
          <span className="text-[10px] font-medium">Students</span>
        </button>

        <button 
          onClick={() => setActiveTab('sistem')}
          className={`flex flex-col items-center gap-1 p-1.5 transition ${activeTab === 'sistem' ? 'text-[#FBBF24]' : 'hover:text-white'}`}
        >
          <Settings size={18} />
          <span className="text-[10px] font-medium">System</span>
        </button>
      </nav>

      {/* MODAL: INPUT/EDIT REVENUE */}
      {isRevenueModalOpen && isAdmin && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-t-[2.5rem] sm:rounded-3xl p-6 shadow-2xl animate-slide-up">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-serif font-bold text-lg text-neutral-900">Manage Monthly Revenue</h3>
                <p className="text-xs text-neutral-400">Data will automatically overwrite if month exists</p>
              </div>
              <button 
                onClick={() => setIsRevenueModalOpen(false)} 
                className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 hover:text-neutral-900"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveRevenue} className="flex flex-col gap-4 mt-2">
              <div>
                <label className="text-xs font-semibold text-neutral-600">Period Month</label>
                <input 
                  type="month" 
                  value={period} 
                  onChange={(e) => setPeriod(e.target.value)}
                  className="w-full mt-1 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-sm bg-neutral-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                  required 
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-600">Total Inflow Amount (IDR)</label>
                <input 
                  type="number" 
                  placeholder="e.g. 6500000"
                  value={revenueInput} 
                  onChange={(e) => setRevenueInput(e.target.value)}
                  className="w-full mt-1 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-sm bg-neutral-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                  required 
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-600">Entry Notes (Optional)</label>
                <textarea 
                  rows="2"
                  placeholder="New enrollments, handbook fees, etc..."
                  value={notesInput} 
                  onChange={(e) => setNotesInput(e.target.value)}
                  className="w-full mt-1 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-sm bg-neutral-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                />
              </div>

              <button 
                type="submit" 
                className="w-full bg-[#1C1A17] text-[#FBBF24] py-3.5 rounded-xl font-medium text-sm hover:bg-black transition mt-2 shadow-lg"
              >
                Save & Synchronize
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADMIN LOGIN */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-slide-up">
            <div className="flex justify-between items-center mb-5">
              <div>
                <h3 className="font-serif font-bold text-lg text-neutral-900">PEC Admin Access</h3>
                <p className="text-xs text-neutral-400">Exclusive access for funds and student records</p>
              </div>
              <button 
                onClick={() => { setIsLoginModalOpen(false); setLoginError(''); }} 
                className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 hover:text-neutral-900"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleLogin} className="flex flex-col gap-3.5">
              {loginError && (
                <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs">
                  {loginError}
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-neutral-600">Username</label>
                <input 
                  type="text" 
                  placeholder="admin"
                  value={usernameInput} 
                  onChange={(e) => setUsernameInput(e.target.value)}
                  className="w-full mt-1 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-sm bg-neutral-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                  required 
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-600">Password</label>
                <input 
                  type="password" 
                  placeholder="admin123"
                  value={passwordInput} 
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full mt-1 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-sm bg-neutral-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                  required 
                />
              </div>

              <button 
                type="submit" 
                className="w-full bg-[#1C1A17] text-[#FBBF24] py-3.5 rounded-xl font-medium text-sm hover:bg-black transition mt-3 shadow-lg"
              >
                Authenticate
              </button>
            </form>
          </div>
        </div>
      )}

      {/* BOTTOM SHEET DENGAN PORTAL AGAR MENEMPEL 100% KE LAYAR BAWAH */}
      {deleteStudentTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          {/* Klik area luar untuk tutup */}
          <div 
            className="absolute inset-0" 
            onClick={() => setDeleteStudentTarget(null)} 
          />

          {/* Kartu Dialog Tengah Membulat Penuh */}
          <div className="relative w-full max-w-xs sm:max-w-sm bg-white rounded-[2rem] p-6 shadow-2xl animate-slide-up flex flex-col items-center text-center z-10 border border-neutral-100">
            
            {/* Ikon Peringatan Merah */}
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-3">
              <AlertCircle size={24} />
            </div>

            <h3 className="font-serif font-bold text-lg text-neutral-900">Remove Student</h3>
            <p className="text-xs text-neutral-500 mt-1.5 leading-relaxed">
              Are you sure you want to remove{' '}
              <span className="font-semibold text-neutral-800">"{deleteStudentTarget.full_name}"</span>{' '}
              from the active roster?
            </p>

            {/* Tombol Aksi Vertikal */}
            <div className="flex flex-col gap-2 w-full mt-6">
              <button
                type="button"
                onClick={() => {
                  handleDeactivateStudent(deleteStudentTarget.id);
                  setDeleteStudentTarget(null);
                }}
                className="w-full py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-sm transition active:scale-[0.98]"
              >
                Yes, Remove Student
              </button>

              <button
                type="button"
                onClick={() => setDeleteStudentTarget(null)}
                className="w-full py-3 rounded-2xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-semibold transition active:scale-[0.98]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI HAPUS KEUANGAN (LEVEL ROOT / FULL SCREEN) */}
      {deleteRevenueTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div 
            className="absolute inset-0" 
            onClick={() => setDeleteRevenueTarget(null)} 
          />

          <div className="relative w-full max-w-xs sm:max-w-sm bg-white rounded-[2rem] p-6 shadow-2xl animate-slide-up flex flex-col items-center text-center z-10 border border-neutral-100">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-3">
              <AlertCircle size={24} />
            </div>

            <h3 className="font-serif font-bold text-lg text-neutral-900">Delete Financial Entry</h3>
            <p className="text-xs text-neutral-500 mt-1.5 leading-relaxed">
              Are you sure you want to delete the record for{' '}
              <span className="font-semibold text-neutral-800">
                {new Date(deleteRevenueTarget.period).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </span>? This action cannot be undone.
            </p>

            <div className="flex flex-col gap-2 w-full mt-6">
              <button
                type="button"
                onClick={() => {
                  handleDeleteRevenue(deleteRevenueTarget.period);
                  setDeleteRevenueTarget(null);
                }}
                className="w-full py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-sm transition active:scale-[0.98]"
              >
                Yes, Delete Record
              </button>

              <button
                type="button"
                onClick={() => setDeleteRevenueTarget(null)}
                className="w-full py-3 rounded-2xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-semibold transition active:scale-[0.98]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}