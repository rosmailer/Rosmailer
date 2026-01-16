import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Task, Course, FinancialRecord, Student, TeamMember } from '../types';
import { Trash2, Plus, Check, X, DollarSign, BookOpen, Users, Edit2, RefreshCw, ChevronDown, ChevronUp, ArrowUpDown, UserPlus, Mail, MessageCircle, Save, Filter, Download } from 'lucide-react';

export const ControlPanel: React.FC = () => {
  const { 
    courses, financialData, tasks, teamMembers,
    addCourse, updateCourse, deleteCourse, 
    updateFinancialRecord, syncFinancialsWithCourses,
    addTask, updateTask, deleteTask, toggleTaskStatus, updateTeamMember
  } = useAppContext();

  const [activeTab, setActiveTab] = useState<'tasks' | 'courses' | 'finance' | 'team'>('tasks');

  // --- Task State ---
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [taskForm, setTaskForm] = useState<Partial<Task>>({ description: '', assigneeId: 'faina', priority: 'Medium', assignedDate: new Date().toISOString().split('T')[0] });
  
  // Task Filters
  const [taskFilterName, setTaskFilterName] = useState('');
  const [taskFilterPriority, setTaskFilterPriority] = useState('');
  const [taskFilterDate, setTaskFilterDate] = useState('');

  // --- Course State ---
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [sortCoursesAsc, setSortCoursesAsc] = useState(true);
  const [expandedCourseId, setExpandedCourseId] = useState<string | null>(null);
  
  const [courseForm, setCourseForm] = useState<Partial<Course>>({ 
    name: '', 
    owner: 'ארינה', 
    status: 'Planning', 
    registrants: 0, 
    maxCapacity: 20,
    startDate: new Date().toISOString().split('T')[0],
    durationWeeks: 4,
    revenue: 0,
    students: [],
    studentColumns: []
  });

  // --- Student Management State (Inside expanded course) ---
  const [newStudent, setNewStudent] = useState<Partial<Student>>({ name: '', phone: '', amountPaid: 0, notes: '', customData: {} });
  const [newColumnName, setNewColumnName] = useState('');
  const [isAddingColumn, setIsAddingColumn] = useState(false);

  // --- Team Management State ---
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [teamForm, setTeamForm] = useState<Partial<TeamMember>>({});

  const [editingFinanceName, setEditingFinanceName] = useState<string | null>(null);
  const [financeForm, setFinanceForm] = useState<Partial<FinancialRecord>>({ name: '', revenue: 0, profit: 0 });

  // --- Task Logic ---
  const sortedTasks = [...tasks]
    .filter(task => {
        if (taskFilterName && task.assigneeId !== taskFilterName) return false;
        if (taskFilterPriority && task.priority !== taskFilterPriority) return false;
        if (taskFilterDate && (task.assignedDate !== taskFilterDate && task.dueDate !== taskFilterDate)) return false;
        return true;
    })
    .sort((a, b) => {
        // Primary sort: Status (Pending first)
        if (a.status !== b.status) {
            return a.status === 'Pending' ? -1 : 1;
        }
        // Secondary sort: Priority
        const priorityOrder = { 'High': 1, 'Medium': 2, 'Low': 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskForm.description) return;
    
    if (editingTaskId) {
      updateTask({ ...taskForm, id: editingTaskId } as Task);
      setEditingTaskId(null);
    } else {
      const newTask = { 
          ...taskForm, 
          id: Math.random().toString(36).substr(2, 9), 
          status: 'Pending' as const,
          assignedDate: taskForm.assignedDate || new Date().toISOString().split('T')[0]
      } as Task;
      
      addTask(newTask);

      // Auto-send WhatsApp to assignee
      const assignee = teamMembers.find(m => m.id === newTask.assigneeId);
      if (assignee && assignee.phone) {
          const message = `היי ${assignee.name}, הוקצתה לך משימה חדשה במערכת:\n"${newTask.description}"\nדחיפות: ${newTask.priority === 'High' ? 'גבוהה' : 'רגילה'}`;
          const cleanPhone = assignee.phone.replace(/\D/g, '').replace(/^0/, '972');
          window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
      }
    }
    setTaskForm({ description: '', assigneeId: 'faina', priority: 'Medium', assignedDate: new Date().toISOString().split('T')[0] });
  };

  const startEditTask = (task: Task) => {
    setEditingTaskId(task.id);
    setTaskForm(task);
  };

  const cancelEditTask = () => {
    setEditingTaskId(null);
    setTaskForm({ description: '', assigneeId: 'faina', priority: 'Medium', assignedDate: new Date().toISOString().split('T')[0] });
  };

  const sendWhatsApp = (phone: string | undefined, message: string) => {
      if (!phone) return;
      const cleanPhone = phone.replace(/\D/g, '').replace(/^0/, '972');
      const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
      window.open(url, '_blank');
  };

  // --- Course Logic ---
  const sortedCourses = [...courses].sort((a, b) => {
    const dateA = new Date(a.startDate).getTime();
    const dateB = new Date(b.startDate).getTime();
    return sortCoursesAsc ? dateA - dateB : dateB - dateA;
  });

  const getStatusStyle = (status: string) => {
    switch(status) {
      case 'Active': return 'bg-green-100 text-green-800 border-green-200';
      case 'Marketing': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Planning': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'Completed': return 'bg-gray-800 text-white border-gray-900';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCourseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseForm.name) return;

    if (editingCourseId) {
      updateCourse({ ...courseForm, id: editingCourseId } as Course);
      setEditingCourseId(null);
    } else {
      addCourse({ ...courseForm, id: Math.random().toString(36).substr(2, 9) } as Course);
    }
    setCourseForm({ 
      name: '', 
      owner: 'ארינה', 
      status: 'Planning', 
      registrants: 0, 
      maxCapacity: 20,
      startDate: new Date().toISOString().split('T')[0],
      durationWeeks: 4,
      revenue: 0,
      students: [],
      studentColumns: []
    });
  };

  const startEditCourse = (course: Course) => {
    setEditingCourseId(course.id);
    setCourseForm(course);
  };

  const cancelEditCourse = () => {
    setEditingCourseId(null);
    setCourseForm({ 
        name: '', 
        owner: 'ארינה', 
        status: 'Planning', 
        registrants: 0, 
        maxCapacity: 20,
        startDate: new Date().toISOString().split('T')[0],
        durationWeeks: 4,
        revenue: 0,
        students: [],
        studentColumns: []
      });
  };

  // --- Student Logic (Nested) ---
  const handleAddStudent = (courseId: string) => {
    if (!newStudent.name) return;
    
    const course = courses.find(c => c.id === courseId);
    if (!course) return;

    const updatedStudents = [...(course.students || []), { 
        ...newStudent, 
        id: Math.random().toString(36).substr(2, 9) 
    } as Student];

    // Automatically update registrants count
    updateCourse({ 
        ...course, 
        students: updatedStudents,
        registrants: updatedStudents.length 
    });

    setNewStudent({ name: '', phone: '', amountPaid: 0, notes: '', customData: {} });
  };

  const handleDeleteStudent = (courseId: string, studentId: string) => {
    const course = courses.find(c => c.id === courseId);
    if (!course) return;

    const updatedStudents = course.students.filter(s => s.id !== studentId);
    updateCourse({ 
        ...course, 
        students: updatedStudents,
        registrants: updatedStudents.length 
    });
  };

  const handleAddColumn = (courseId: string) => {
    if(!newColumnName) return;
    const course = courses.find(c => c.id === courseId);
    if (!course) return;

    const updatedColumns = [...(course.studentColumns || []), newColumnName];
    updateCourse({ ...course, studentColumns: updatedColumns });
    setNewColumnName('');
    setIsAddingColumn(false);
  };

  // --- Team Logic ---
  const startEditTeam = (member: TeamMember) => {
      setEditingTeamId(member.id);
      setTeamForm(member);
  };

  const handleTeamSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!editingTeamId) return;
      updateTeamMember({ ...teamForm, id: editingTeamId } as TeamMember);
      setEditingTeamId(null);
      setTeamForm({});
  };

  // --- Finance Handlers ---
  const handleFinanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!financeForm.name) return;
    updateFinancialRecord(financeForm as FinancialRecord);
    setFinanceForm({ name: '', revenue: 0, profit: 0 });
    setEditingFinanceName(null);
  };

  const startEditFinance = (record: FinancialRecord) => {
    setEditingFinanceName(record.name);
    setFinanceForm(record);
  };
  
  // --- Backup Logic ---
  const downloadBackup = () => {
      const data = {
          courses,
          tasks,
          teamMembers,
          financialData,
          backupDate: new Date().toISOString()
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `fd_ai_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="bg-brand-900 text-white p-6 rounded-xl shadow-lg flex justify-between items-start">
        <div>
            <h2 className="text-2xl font-bold mb-2">מרכז שליטה וניהול (Admin)</h2>
            <p className="text-brand-100">שליטה מלאה (עריכה, מחיקה, הוספה) בכל נתוני האפליקציה.</p>
        </div>
        <button onClick={downloadBackup} className="flex items-center text-xs bg-brand-800 hover:bg-brand-700 px-3 py-2 rounded-lg transition-colors border border-brand-700">
            <Download size={14} className="ml-2" />
            גיבוי נתונים מלא (Download)
        </button>
      </div>

      <div className="flex space-x-2 space-x-reverse bg-white p-1 rounded-lg border border-gray-200 overflow-x-auto">
        <button onClick={() => setActiveTab('tasks')} className={`flex-1 min-w-[120px] py-2 px-4 rounded-md text-sm font-medium flex items-center justify-center transition-colors ${activeTab === 'tasks' ? 'bg-brand-100 text-brand-700' : 'text-gray-500 hover:text-gray-700'}`}>
          <Check size={16} className="ml-2" /> משימות
        </button>
        <button onClick={() => setActiveTab('courses')} className={`flex-1 min-w-[120px] py-2 px-4 rounded-md text-sm font-medium flex items-center justify-center transition-colors ${activeTab === 'courses' ? 'bg-brand-100 text-brand-700' : 'text-gray-500 hover:text-gray-700'}`}>
          <BookOpen size={16} className="ml-2" /> קורסים
        </button>
        <button onClick={() => setActiveTab('team')} className={`flex-1 min-w-[120px] py-2 px-4 rounded-md text-sm font-medium flex items-center justify-center transition-colors ${activeTab === 'team' ? 'bg-brand-100 text-brand-700' : 'text-gray-500 hover:text-gray-700'}`}>
          <UserPlus size={16} className="ml-2" /> ניהול צוות
        </button>
        <button onClick={() => setActiveTab('finance')} className={`flex-1 min-w-[120px] py-2 px-4 rounded-md text-sm font-medium flex items-center justify-center transition-colors ${activeTab === 'finance' ? 'bg-brand-100 text-brand-700' : 'text-gray-500 hover:text-gray-700'}`}>
          <DollarSign size={16} className="ml-2" /> פיננסים
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        
        {/* TASKS TAB */}
        {activeTab === 'tasks' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 mb-4 items-end bg-gray-50 p-3 rounded-lg border border-gray-100">
                <div className="flex items-center text-gray-500 text-sm font-medium mb-1 md:mb-0 md:ml-2">
                    <Filter size={16} className="ml-1" /> סינון:
                </div>
                <div>
                   <select 
                     value={taskFilterName} onChange={e => setTaskFilterName(e.target.value)} 
                     className="text-xs border rounded p-1 w-32"
                   >
                       <option value="">כל הצוות</option>
                       {teamMembers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                   </select>
                </div>
                <div>
                   <select 
                     value={taskFilterPriority} onChange={e => setTaskFilterPriority(e.target.value)}
                     className="text-xs border rounded p-1 w-24"
                   >
                       <option value="">כל הדחיפויות</option>
                       <option value="High">גבוהה</option>
                       <option value="Medium">בינונית</option>
                       <option value="Low">נמוכה</option>
                   </select>
                </div>
                <div>
                   <input 
                     type="date" 
                     value={taskFilterDate} onChange={e => setTaskFilterDate(e.target.value)}
                     className="text-xs border rounded p-1"
                   />
                </div>
                {(taskFilterName || taskFilterPriority || taskFilterDate) && (
                    <button onClick={() => { setTaskFilterName(''); setTaskFilterPriority(''); setTaskFilterDate(''); }} className="text-xs text-red-500 hover:underline">
                        נקה סינון
                    </button>
                )}
            </div>

            <form onSubmit={handleTaskSubmit} className={`p-4 rounded-lg border ${editingTaskId ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-200'} flex gap-4 items-end flex-wrap`}>
              <div className="flex-1 min-w-[200px]">
                <label className="block text-xs font-medium text-gray-500 mb-1">תיאור המשימה</label>
                <input 
                  type="text" 
                  value={taskForm.description}
                  onChange={e => setTaskForm({...taskForm, description: e.target.value})}
                  className="w-full border border-gray-300 rounded-md p-2 text-sm"
                  placeholder="הכנס משימה חדשה..."
                />
              </div>
              <div className="w-40">
                <label className="block text-xs font-medium text-gray-500 mb-1">אחראי</label>
                <select 
                  value={taskForm.assigneeId}
                  onChange={e => setTaskForm({...taskForm, assigneeId: e.target.value})}
                  className="w-full border border-gray-300 rounded-md p-2 text-sm"
                >
                  {teamMembers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
              <div className="w-40">
                 <label className="block text-xs font-medium text-gray-500 mb-1">תאריך הקצאה</label>
                 <input 
                    type="date"
                    value={taskForm.assignedDate}
                    onChange={e => setTaskForm({...taskForm, assignedDate: e.target.value})}
                    className="w-full border border-gray-300 rounded-md p-2 text-sm"
                 />
              </div>
              <div className="w-32">
                <label className="block text-xs font-medium text-gray-500 mb-1">דחיפות</label>
                <select 
                  value={taskForm.priority}
                  onChange={e => setTaskForm({...taskForm, priority: e.target.value as any})}
                  className="w-full border border-gray-300 rounded-md p-2 text-sm"
                >
                  <option value="High">גבוהה</option>
                  <option value="Medium">בינונית</option>
                  <option value="Low">נמוכה</option>
                </select>
              </div>
              <button type="submit" className={`${editingTaskId ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-blue-600 hover:bg-blue-700'} text-white p-2 rounded-md`}>
                {editingTaskId ? <Check size={20} /> : <Plus size={20} />}
              </button>
              {editingTaskId && (
                <button type="button" onClick={cancelEditTask} className="bg-gray-300 hover:bg-gray-400 text-gray-700 p-2 rounded-md">
                   <X size={20} />
                </button>
              )}
            </form>

            <div className="space-y-2">
              {sortedTasks.length === 0 ? <p className="text-gray-500 text-center py-4">אין משימות מתאימות</p> : null}
              {sortedTasks.map(task => {
                const assignee = teamMembers.find(m => m.id === task.assigneeId);
                return (
                  <div key={task.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => toggleTaskStatus(task.id)}
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${task.status === 'Done' ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 text-transparent hover:border-green-500'}`}
                      >
                        <Check size={14} />
                      </button>
                      <div className={task.status === 'Done' ? 'opacity-50 line-through' : ''}>
                        <p className="font-medium text-gray-800">{task.description}</p>
                        <div className="flex gap-2 text-xs mt-1 items-center">
                          <span className={`${assignee?.color.split(' ')[1]} font-bold`}>{assignee?.name}</span>
                          <span className="text-gray-400">|</span>
                          <span className="text-gray-500">{task.assignedDate}</span>
                          <span className={`px-2 py-0.5 rounded-full ${getPriorityColor(task.priority)} font-medium mr-2`}>
                             {task.priority === 'High' ? 'דחוף' : task.priority === 'Medium' ? 'בינוני' : 'נמוך'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {assignee?.phone && (
                          <button onClick={() => sendWhatsApp(assignee.phone, `היי ${assignee.name}, לגבי המשימה: ${task.description}...`)} className="text-green-500 hover:text-green-600 p-2" title="שלח וואטסאפ לאחראי">
                              <MessageCircle size={18} />
                          </button>
                      )}
                      <button onClick={() => startEditTask(task)} className="text-gray-400 hover:text-brand-500 p-2">
                        <Edit2 size={18} />
                      </button>
                      <button onClick={() => deleteTask(task.id)} className="text-gray-400 hover:text-red-500 p-2">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* COURSES TAB */}
        {activeTab === 'courses' && (
           <div className="space-y-6">
             <form onSubmit={handleCourseSubmit} className={`p-4 rounded-lg border ${editingCourseId ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-200'} grid grid-cols-1 md:grid-cols-4 gap-4 items-end`}>
               {/* Same form as before */}
               <div className="md:col-span-1">
                 <label className="block text-xs font-medium text-gray-500 mb-1">שם הקורס</label>
                 <input type="text" value={courseForm.name} onChange={e => setCourseForm({...courseForm, name: e.target.value})} className="w-full border border-gray-300 rounded-md p-2 text-sm" />
               </div>
               <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">תאריך פתיחה</label>
                  <input type="date" value={courseForm.startDate} onChange={e => setCourseForm({...courseForm, startDate: e.target.value})} className="w-full border border-gray-300 rounded-md p-2 text-sm" />
               </div>
               <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">משך (שבועות)</label>
                  <input type="number" value={courseForm.durationWeeks} onChange={e => setCourseForm({...courseForm, durationWeeks: Number(e.target.value)})} className="w-full border border-gray-300 rounded-md p-2 text-sm" />
               </div>
               <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">הכנסות (₪)</label>
                  <input type="number" value={courseForm.revenue} onChange={e => setCourseForm({...courseForm, revenue: Number(e.target.value)})} className="w-full border border-gray-300 rounded-md p-2 text-sm" />
               </div>
               <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">סטטוס</label>
                  <select value={courseForm.status} onChange={e => setCourseForm({...courseForm, status: e.target.value as any})} className="w-full border border-gray-300 rounded-md p-2 text-sm">
                    <option value="Planning">תכנון</option>
                    <option value="Marketing">שיווק</option>
                    <option value="Active">פעיל</option>
                    <option value="Completed">הסתיים</option>
                  </select>
               </div>
               <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">אחראי</label>
                  <select value={courseForm.owner} onChange={e => setCourseForm({...courseForm, owner: e.target.value})} className="w-full border border-gray-300 rounded-md p-2 text-sm">
                     {teamMembers.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
                  </select>
               </div>
               <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">מספר נרשמים</label>
                  <input type="number" value={courseForm.registrants} onChange={e => setCourseForm({...courseForm, registrants: Number(e.target.value)})} className="w-full border border-gray-300 rounded-md p-2 text-sm" />
               </div>
               
               <div className="flex gap-2">
                 <button type="submit" className={`${editingCourseId ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-blue-600 hover:bg-blue-700'} text-white p-2 rounded-md flex-1 flex items-center justify-center`}>
                   {editingCourseId ? <Check size={20} className="ml-1" /> : <Plus size={20} className="ml-1" />} 
                   {editingCourseId ? 'עדכן' : 'הוסף'}
                 </button>
                 {editingCourseId && (
                    <button type="button" onClick={cancelEditCourse} className="bg-gray-300 hover:bg-gray-400 text-gray-700 p-2 rounded-md">
                       <X size={20} />
                    </button>
                 )}
               </div>
             </form>
             
             <div className="flex justify-between items-center bg-blue-50 p-3 rounded-lg border border-blue-100">
                <div className="flex items-center text-blue-800 text-sm">
                    <DollarSign size={16} className="ml-2" />
                    סנכרון פיננסי אוטומטי
                </div>
                <button 
                    onClick={() => {
                        syncFinancialsWithCourses();
                        alert('נתוני ההכנסות סונכרנו בהצלחה לפי הקורסים הקיימים.');
                    }}
                    className="flex items-center bg-blue-600 text-white text-xs px-3 py-1.5 rounded hover:bg-blue-700 transition-colors"
                >
                    <RefreshCw size={14} className="ml-1.5" />
                    עדכן דוח הכנסות לפי קורסים
                </button>
             </div>

             <div className="overflow-x-auto">
               <table className="min-w-full divide-y divide-gray-200">
                 <thead>
                   <tr>
                     <th className="px-4 py-2 text-right"></th>
                     <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">שם הקורס</th>
                     <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">אחראי</th>
                     <th 
                        className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 flex items-center gap-1"
                        onClick={() => setSortCoursesAsc(!sortCoursesAsc)}
                     >
                        תאריך פתיחה <ArrowUpDown size={12} />
                     </th>
                     <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">סטטוס</th>
                     <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">נרשמים</th>
                     <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">הכנסה</th>
                     <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">פעולות</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-200 bg-white">
                   {sortedCourses.map(course => (
                     <React.Fragment key={course.id}>
                         <tr className="hover:bg-gray-50 transition-colors">
                           <td className="px-4 py-3 text-sm">
                                <button 
                                    onClick={() => setExpandedCourseId(expandedCourseId === course.id ? null : course.id)}
                                    className="text-gray-400 hover:text-brand-600"
                                >
                                    {expandedCourseId === course.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                </button>
                           </td>
                           <td className="px-4 py-3 text-sm text-gray-900 font-medium">{course.name}</td>
                           <td className="px-4 py-3 text-sm text-gray-500">{course.owner}</td>
                           <td className="px-4 py-3 text-sm text-gray-500">{course.startDate}</td>
                           <td className="px-4 py-3 text-sm">
                             <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusStyle(course.status)}`}>
                               {course.status === 'Completed' ? 'הסתיים' : 
                                course.status === 'Active' ? 'פעיל' : 
                                course.status === 'Marketing' ? 'שיווק' : 'תכנון'}
                             </span>
                           </td>
                           <td className="px-4 py-3 text-sm text-gray-900 font-bold">{course.registrants}</td>
                           <td className="px-4 py-3 text-sm text-gray-500">₪{course.revenue.toLocaleString()}</td>
                           <td className="px-4 py-3 text-sm flex gap-2">
                             <button onClick={() => startEditCourse(course)} className="text-gray-400 hover:text-brand-500"><Edit2 size={16} /></button>
                             <button onClick={() => deleteCourse(course.id)} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
                           </td>
                         </tr>
                         
                         {/* Expanded Student Row */}
                         {expandedCourseId === course.id && (
                             <tr className="bg-gray-50">
                                 <td colSpan={8} className="px-4 py-4">
                                     <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-inner">
                                         <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                                             <Users size={16} />
                                             ניהול נרשמים: {course.name}
                                         </h4>
                                         
                                         {/* Add Student Form */}
                                         <div className="flex gap-2 mb-4 bg-gray-50 p-3 rounded border border-gray-100 items-end">
                                            {/* Form Inputs */}
                                            <div>
                                                <label className="text-[10px] text-gray-500">שם מלא</label>
                                                <input type="text" placeholder="שם מלא" value={newStudent.name} onChange={e => setNewStudent({...newStudent, name: e.target.value})} className="border rounded p-1 text-xs w-32" />
                                            </div>
                                            <div>
                                                <label className="text-[10px] text-gray-500">טלפון</label>
                                                <input type="text" placeholder="050..." value={newStudent.phone} onChange={e => setNewStudent({...newStudent, phone: e.target.value})} className="border rounded p-1 text-xs w-28" />
                                            </div>
                                            <div>
                                                <label className="text-[10px] text-gray-500">שולם (₪)</label>
                                                <input type="number" placeholder="0" value={newStudent.amountPaid} onChange={e => setNewStudent({...newStudent, amountPaid: Number(e.target.value)})} className="border rounded p-1 text-xs w-20" />
                                            </div>
                                            <div>
                                                <label className="text-[10px] text-gray-500">הערות</label>
                                                <input type="text" placeholder="..." value={newStudent.notes} onChange={e => setNewStudent({...newStudent, notes: e.target.value})} className="border rounded p-1 text-xs w-32" />
                                            </div>
                                            {course.studentColumns?.map(col => (
                                                <div key={col}>
                                                     <label className="text-[10px] text-gray-500">{col}</label>
                                                     <input 
                                                        type="text" 
                                                        value={newStudent.customData?.[col] || ''} 
                                                        onChange={e => setNewStudent({...newStudent, customData: { ...newStudent.customData, [col]: e.target.value }})}
                                                        className="border rounded p-1 text-xs w-24"
                                                     />
                                                </div>
                                            ))}

                                            <button onClick={() => handleAddStudent(course.id)} className="bg-blue-600 text-white p-1.5 rounded hover:bg-blue-700">
                                                <UserPlus size={16} />
                                            </button>
                                         </div>

                                         <div className="flex justify-end mb-2">
                                            {isAddingColumn ? (
                                                <div className="flex items-center gap-2">
                                                    <input 
                                                        type="text" 
                                                        value={newColumnName} 
                                                        onChange={e => setNewColumnName(e.target.value)} 
                                                        placeholder="שם עמודה חדשה"
                                                        className="border rounded p-1 text-xs"
                                                    />
                                                    <button onClick={() => handleAddColumn(course.id)} className="text-xs bg-green-500 text-white px-2 py-1 rounded">אישור</button>
                                                    <button onClick={() => setIsAddingColumn(false)} className="text-xs text-gray-500 px-2">ביטול</button>
                                                </div>
                                            ) : (
                                                <button onClick={() => setIsAddingColumn(true)} className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                                                    <Plus size={12} /> הוסף עמודה
                                                </button>
                                            )}
                                         </div>

                                         {/* Students Table */}
                                         <table className="min-w-full text-xs divide-y divide-gray-100">
                                             <thead>
                                                 <tr className="bg-gray-100">
                                                     <th className="px-2 py-1 text-right w-10">#</th>
                                                     <th className="px-2 py-1 text-right">שם</th>
                                                     <th className="px-2 py-1 text-right">טלפון</th>
                                                     <th className="px-2 py-1 text-right">שולם</th>
                                                     <th className="px-2 py-1 text-right">הערות</th>
                                                     {course.studentColumns?.map(col => <th key={col} className="px-2 py-1 text-right">{col}</th>)}
                                                     <th className="px-2 py-1"></th>
                                                 </tr>
                                             </thead>
                                             <tbody>
                                                 {course.students?.map((student, index) => (
                                                     <tr key={student.id} className="border-b border-gray-50">
                                                         <td className="px-2 py-1 text-gray-500">{index + 1}</td>
                                                         <td className="px-2 py-1">{student.name}</td>
                                                         <td className="px-2 py-1">{student.phone}</td>
                                                         <td className="px-2 py-1">₪{student.amountPaid}</td>
                                                         <td className="px-2 py-1 text-gray-500">{student.notes}</td>
                                                         {course.studentColumns?.map(col => (
                                                             <td key={col} className="px-2 py-1">{student.customData?.[col]}</td>
                                                         ))}
                                                         <td className="px-2 py-1 text-center">
                                                             <button onClick={() => handleDeleteStudent(course.id, student.id)} className="text-red-400 hover:text-red-600">
                                                                 <X size={12} />
                                                             </button>
                                                         </td>
                                                     </tr>
                                                 ))}
                                                 {(!course.students || course.students.length === 0) && (
                                                     <tr><td colSpan={6 + (course.studentColumns?.length || 0)} className="text-center py-2 text-gray-400 italic">אין נרשמים עדיין</td></tr>
                                                 )}
                                             </tbody>
                                         </table>
                                     </div>
                                 </td>
                             </tr>
                         )}
                     </React.Fragment>
                   ))}
                 </tbody>
               </table>
             </div>
           </div>
        )}

        {/* TEAM TAB */}
        {activeTab === 'team' && (
            <div className="space-y-6">
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100 mb-4 text-sm text-yellow-800">
                    כאן ניתן לעדכן את פרטי הקשר של חברי הצוות כדי לאפשר שליחת הודעות מהירה מהמערכת.
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {teamMembers.map(member => (
                        <div key={member.id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm relative">
                            {editingTeamId === member.id ? (
                                <form onSubmit={handleTeamSubmit} className="space-y-3">
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="font-bold text-gray-900">{member.name}</h3>
                                        <div className="flex gap-1">
                                            <button type="submit" className="text-green-600 hover:bg-green-50 p-1 rounded"><Save size={18} /></button>
                                            <button type="button" onClick={() => setEditingTeamId(null)} className="text-gray-400 hover:bg-gray-50 p-1 rounded"><X size={18} /></button>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500">טלפון</label>
                                        <input 
                                            type="text" 
                                            defaultValue={member.phone} 
                                            onChange={e => setTeamForm({...teamForm, phone: e.target.value})} 
                                            className="w-full border rounded p-1 text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500">מייל</label>
                                        <input 
                                            type="text" 
                                            defaultValue={member.email} 
                                            onChange={e => setTeamForm({...teamForm, email: e.target.value})} 
                                            className="w-full border rounded p-1 text-sm"
                                        />
                                    </div>
                                </form>
                            ) : (
                                <>
                                    <button onClick={() => startEditTeam(member)} className="absolute top-2 left-2 text-gray-300 hover:text-brand-600">
                                        <Edit2 size={16} />
                                    </button>
                                    <h3 className="font-bold text-gray-900 mb-1">{member.name}</h3>
                                    <p className="text-xs text-gray-500 mb-3">{member.roleTitle}</p>
                                    <div className="space-y-1 text-sm">
                                        <div className="flex items-center text-gray-600">
                                            <MessageCircle size={14} className="ml-2" />
                                            {member.phone || <span className="text-gray-300 italic">לא הוזן</span>}
                                        </div>
                                        <div className="flex items-center text-gray-600">
                                            <Mail size={14} className="ml-2" />
                                            {member.email || <span className="text-gray-300 italic">לא הוזן</span>}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* FINANCE TAB */}
        {activeTab === 'finance' && (
           <div className="space-y-6">
              <form onSubmit={handleFinanceSubmit} className={`p-4 rounded-lg border ${editingFinanceName ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-200'} flex gap-4 items-end`}>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-500 mb-1">חודש (שם)</label>
                  <input type="text" disabled={!!editingFinanceName} value={financeForm.name} onChange={e => setFinanceForm({...financeForm, name: e.target.value})} className="w-full border border-gray-300 rounded-md p-2 text-sm disabled:bg-gray-100" placeholder="למשל: אוגוסט" />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-500 mb-1">הכנסות</label>
                  <input type="number" value={financeForm.revenue} onChange={e => setFinanceForm({...financeForm, revenue: Number(e.target.value)})} className="w-full border border-gray-300 rounded-md p-2 text-sm" />
                </div>
                <button type="submit" className={`${editingFinanceName ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-600 hover:bg-green-700'} text-white p-2 rounded-md`}>
                  {editingFinanceName ? <Check size={20} /> : <Plus size={20} />}
                </button>
                {editingFinanceName && (
                    <button type="button" onClick={() => { setEditingFinanceName(null); setFinanceForm({ name: '', revenue: 0, profit: 0 }); }} className="bg-gray-300 hover:bg-gray-400 text-gray-700 p-2 rounded-md">
                       <X size={20} />
                    </button>
                 )}
              </form>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {financialData.map((record, i) => (
                  <div 
                    key={i} 
                    className={`p-4 border rounded-lg text-center shadow-sm relative group ${
                        record.name.includes('2025') ? 'bg-gray-100 text-gray-500 border-gray-200' :
                        (record.name.includes('ינואר') || record.name.includes('פברואר')) ? 'bg-green-50 border-green-200' :
                        'bg-white border-gray-200'
                    }`}
                  >
                    <button 
                        onClick={() => startEditFinance(record)}
                        className="absolute top-2 left-2 text-gray-300 hover:text-brand-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <Edit2 size={14} />
                    </button>
                    <h4 className="font-bold text-gray-900 mb-2">{record.name}</h4>
                    <div className="text-sm text-gray-500">הכנסות: <span className="text-gray-900 font-mono">₪{record.revenue.toLocaleString()}</span></div>
                  </div>
                ))}
              </div>
           </div>
        )}
      </div>
    </div>
  );
};
