import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ArrowUpRight, Users, GraduationCap, DollarSign, Activity, Plus, Edit2, X } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { Course, FinancialRecord } from '../types';

const StatCard = ({ title, value, trend, icon: Icon, color }: any) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start justify-between hover:shadow-md transition-shadow">
    <div>
      <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-brand-900">{value}</h3>
      <div className={`flex items-center mt-2 text-sm ${trend.startsWith('+') ? 'text-kpi-green' : 'text-kpi-red'}`}>
        {trend.startsWith('+') ? <ArrowUpRight size={16} /> : <Activity size={16} />}
        <span className="mr-1 font-medium">{trend}</span>
        <span className="text-gray-400 mr-1">מהחודש שעבר</span>
      </div>
    </div>
    <div className={`p-3 rounded-lg ${color}`}>
      <Icon size={24} className="text-white" />
    </div>
  </div>
);

export const Dashboard: React.FC = () => {
  const { courses, financialData, addCourse, updateFinancialRecord } = useAppContext();
  
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [isFinancialModalOpen, setIsFinancialModalOpen] = useState(false);

  // Stats calculation
  const activeStudents = courses.reduce((acc, c) => acc + Number(c.registrants), 0);
  const currentMonthRevenue = financialData.length > 0 ? financialData[financialData.length - 1].revenue : 0;
  
  // No longer tracking profit margin as a primary KPI for display since profit is removed from input
  // We can just show generic growth or another metric if needed, or keep it 0.
  const profitMargin = 0; 

  // New Course State
  const [newCourse, setNewCourse] = useState<Partial<Course>>({
    name: '',
    owner: 'ארינה',
    status: 'Planning',
    registrants: 0,
    maxCapacity: 20,
    revenue: 0
  });

  // Financial Update State
  const [financialUpdate, setFinancialUpdate] = useState<FinancialRecord>({
    name: 'יולי',
    revenue: 0,
    profit: 0
  });

  const handleAddCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourse.name) return;
    addCourse({
      ...newCourse,
      id: Math.random().toString(36).substr(2, 9),
    } as Course);
    setIsCourseModalOpen(false);
    setNewCourse({ name: '', owner: 'ארינה', status: 'Planning', registrants: 0, maxCapacity: 20, revenue: 0 });
  };

  const handleUpdateFinancial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!financialUpdate.name) return;
    updateFinancialRecord(financialUpdate);
    setIsFinancialModalOpen(false);
  };

  return (
    <>
    <div className="space-y-6 relative">
      
      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="הכנסות חודש אחרון" 
          value={`₪${currentMonthRevenue.toLocaleString()}`} 
          trend="+22%" 
          icon={DollarSign} 
          color="bg-brand-500" 
        />
        <StatCard 
          title="סטודנטים פעילים" 
          value={activeStudents} 
          trend="+12%" 
          icon={Users} 
          color="bg-indigo-500" 
        />
        <StatCard 
          title="שביעות רצון (NPS)" 
          value="9.2" 
          trend="+0.3" 
          icon={GraduationCap} 
          color="bg-emerald-500" 
        />
        <StatCard 
          title="יעד הכנסות שנתי" 
          value="15%" 
          trend="+5%" 
          icon={Activity} 
          color="bg-rose-500" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main P&L Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-800">מגמת צמיחה (הכנסות)</h3>
            <div className="flex items-center gap-2">
               <button 
                onClick={() => setIsFinancialModalOpen(true)}
                className="flex items-center text-xs text-brand-600 hover:bg-brand-50 px-2 py-1 rounded transition-colors"
               >
                 <Edit2 size={12} className="ml-1" />
                 עדכון נתונים
               </button>
               <span className="bg-brand-100 text-brand-800 text-xs px-2 py-1 rounded-full font-medium">יעד: ולידציה + מזומן</span>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={financialData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRevenue)" name="הכנסות" />
                <Legend />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Active Courses List */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4">קורסים פעילים (סטטוס)</h3>
          <div className="space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar">
            {courses.map(course => {
              // CHANGE: Using 16 as the base for capacity percentage as requested
              const requiredCapacity = 16;
              const percent = Math.min(100, Math.round((course.registrants / requiredCapacity) * 100));
              
              return (
                <div key={course.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-semibold text-gray-800 text-sm">{course.name}</h4>
                    <div className="flex items-center mt-1">
                      <span className="text-xs text-gray-500 ml-2">אחראי: {course.owner}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        course.status === 'Active' ? 'bg-green-100 text-green-700' :
                        course.status === 'Marketing' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {course.status === 'Active' ? 'פעיל' : course.status === 'Marketing' ? 'שיווק' : 'תכנון'}
                      </span>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-bold text-brand-900">{course.registrants}/{requiredCapacity}</div>
                    <div className="w-16 h-1.5 bg-gray-200 rounded-full mt-1">
                      <div 
                        className={`h-1.5 rounded-full ${percent >= 100 ? 'bg-green-500' : 'bg-brand-500'}`}
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <button 
            onClick={() => setIsCourseModalOpen(true)}
            className="w-full mt-4 py-2 border border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:bg-gray-50 hover:border-gray-400 transition-colors flex items-center justify-center gap-2"
          >
            <Plus size={16} />
            פתח קורס חדש (Playbook)
          </button>
        </div>
      </div>
    </div>

    {/* Modals outside the relative container to avoid clipping/z-index issues if any parent transforms */}
    {isCourseModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative">
            <button onClick={() => setIsCourseModalOpen(false)} className="absolute top-4 left-4 text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
            <h3 className="text-xl font-bold mb-4 text-gray-900">פתיחת קורס חדש</h3>
            <form onSubmit={handleAddCourse} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">שם הקורס</label>
                <input 
                  type="text" 
                  value={newCourse.name}
                  onChange={e => setNewCourse({...newCourse, name: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-brand-500 outline-none"
                  placeholder="למשל: AI למתקדמים"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">אחראי</label>
                   <select 
                    value={newCourse.owner}
                    onChange={e => setNewCourse({...newCourse, owner: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg p-2"
                   >
                     <option value="ארינה">ארינה</option>
                     <option value="קטיה">קטיה</option>
                     <option value="פאינה">פאינה</option>
                     <option value="רוסלן">רוסלן</option>
                   </select>
                </div>
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">סטטוס</label>
                   <select 
                    value={newCourse.status}
                    onChange={e => setNewCourse({...newCourse, status: e.target.value as any})}
                    className="w-full border border-gray-300 rounded-lg p-2"
                   >
                     <option value="Planning">תכנון</option>
                     <option value="Marketing">שיווק</option>
                     <option value="Active">פעיל</option>
                   </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">תפוסה מקסימלית</label>
                    <input 
                      type="number" 
                      value={newCourse.maxCapacity}
                      onChange={e => setNewCourse({...newCourse, maxCapacity: Number(e.target.value)})}
                      className="w-full border border-gray-300 rounded-lg p-2"
                    />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">צפי הכנסות</label>
                    <input 
                      type="number" 
                      value={newCourse.revenue}
                      onChange={e => setNewCourse({...newCourse, revenue: Number(e.target.value)})}
                      className="w-full border border-gray-300 rounded-lg p-2"
                    />
                 </div>
              </div>
              <button type="submit" className="w-full bg-brand-600 text-white py-2 rounded-lg font-bold hover:bg-brand-700 transition-colors">
                שמור קורס
              </button>
            </form>
          </div>
        </div>
      )}

      {isFinancialModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 relative">
            <button onClick={() => setIsFinancialModalOpen(false)} className="absolute top-4 left-4 text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
            <h3 className="text-xl font-bold mb-4 text-gray-900">עדכון נתונים פיננסיים</h3>
            <form onSubmit={handleUpdateFinancial} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">חודש (שם)</label>
                <input 
                  type="text" 
                  value={financialUpdate.name}
                  onChange={e => setFinancialUpdate({...financialUpdate, name: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg p-2"
                  placeholder="למשל: יולי"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">הכנסות (₪)</label>
                <input 
                  type="number" 
                  value={financialUpdate.revenue}
                  onChange={e => setFinancialUpdate({...financialUpdate, revenue: Number(e.target.value)})}
                  className="w-full border border-gray-300 rounded-lg p-2"
                  required
                />
              </div>
              <button type="submit" className="w-full bg-green-600 text-white py-2 rounded-lg font-bold hover:bg-green-700 transition-colors">
                עדכן נתונים
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
