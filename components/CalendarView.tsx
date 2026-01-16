import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { ChevronRight, ChevronLeft, Calendar as CalendarIcon, X, Plus, CheckCircle2 } from 'lucide-react';
import { Task } from '../types';
import { TEAM_MEMBERS } from '../data';

export const CalendarView: React.FC = () => {
  const { courses, tasks, addTask } = useAppContext();
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Modal State
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [newTask, setNewTask] = useState<Partial<Task>>({ description: '', assigneeId: 'faina', priority: 'Medium' });


  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
    'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'
  ];

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Sunday

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleDayClick = (day: number) => {
    const date = new Date(year, month, day);
    setSelectedDate(date);
    setNewTask({ ...newTask, dueDate: date.toISOString().split('T')[0] });
  };

  const handleAddTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.description || !selectedDate) return;
    
    addTask({
        ...newTask,
        id: Math.random().toString(36).substr(2, 9),
        status: 'Pending',
        dueDate: selectedDate.toISOString().split('T')[0]
    } as Task);
    
    setSelectedDate(null);
    setNewTask({ description: '', assigneeId: 'faina', priority: 'Medium' });
  };

  // Helper to check if a course falls on a specific day using exact date calculation
  const getCoursesForDay = (day: number) => {
    // Construct the calendar cell date in "YYYY-MM-DD" local time format to avoid timezone issues
    // We create the date object using the year, month, day
    const cellDateObj = new Date(year, month, day);
    
    // We need to compare specific dates without time components
    // We'll normalize everything to midnight timestamps for calculation
    const cellTime = cellDateObj.setHours(0,0,0,0);

    return courses.filter(course => {
      if (!course.startDate) return false;
      
      const startDateObj = new Date(course.startDate);
      const startTime = startDateObj.setHours(0,0,0,0);
      
      // Course hasn't started yet
      if (cellTime < startTime) return false;

      // Calculate end date based on duration
      // Duration in weeks * 7 days * ms per day
      // Note: If duration is 4 weeks, it means 4 sessions.
      // So the last session is at start + (3 weeks). 
      // But typically "Duration 4 weeks" implies covering a span of 4 weeks.
      // Let's assume durationWeeks = number of sessions.
      const sessionCount = course.durationWeeks || 1;
      const endTime = startTime + ((sessionCount - 1) * 7 * 24 * 60 * 60 * 1000);
      
      if (cellTime > endTime) return false;

      // Check if the difference in days is a multiple of 7
      const diffInMs = cellTime - startTime;
      const diffInDays = Math.round(diffInMs / (1000 * 60 * 60 * 24));
      
      return diffInDays % 7 === 0;
    });
  };

  // Helper to check for tasks on this day
  const getTasksForDay = (day: number) => {
      return tasks.filter(task => {
          if (!task.dueDate && !task.assignedDate) return false;
          // Show task on Due Date primarily, or Assigned Date if no due date
          const dateStr = task.dueDate || task.assignedDate;
          if (!dateStr) return false;
          
          const taskDate = new Date(dateStr);
          return taskDate.getDate() === day && taskDate.getMonth() === month && taskDate.getFullYear() === year;
      });
  };

  // Generate grid cells
  const renderCalendarDays = () => {
    const cells = [];
    
    // Empty cells for days before the 1st of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      cells.push(<div key={`empty-${i}`} className="h-32 bg-gray-50 border border-gray-100"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayCourses = getCoursesForDay(day);
      const dayTasks = getTasksForDay(day);
      const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();

      cells.push(
        <div 
            key={day} 
            onClick={() => handleDayClick(day)}
            className={`h-32 border border-gray-100 p-2 relative group hover:bg-gray-50 transition-colors cursor-pointer overflow-hidden ${isToday ? 'bg-blue-50' : 'bg-white'}`}
        >
          <div className="flex justify-between items-start mb-1">
             <span className={`text-sm font-medium ${isToday ? 'bg-brand-500 text-white w-6 h-6 rounded-full flex items-center justify-center' : 'text-gray-700'}`}>
                {day}
             </span>
             <Plus size={14} className="opacity-0 group-hover:opacity-100 text-gray-400" />
          </div>
          
          <div className="space-y-1 overflow-y-auto max-h-[85px] custom-scrollbar">
            {dayCourses.map(course => {
                // Determine if this is the FIRST session
                const startDateObj = new Date(course.startDate);
                const isStart = startDateObj.getDate() === day && startDateObj.getMonth() === month && startDateObj.getFullYear() === year;
                
                return (
                  <div 
                    key={course.id} 
                    className={`text-[10px] p-1 rounded border truncate leading-tight
                      ${course.status === 'Active' ? 'bg-green-100 text-green-800 border-green-200' : 
                        course.status === 'Marketing' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : 
                        'bg-gray-100 text-gray-800 border-gray-200'}
                    `}
                    title={course.name}
                  >
                    {isStart && <span className="font-bold mr-1 text-xs">🏁</span>}
                    {course.name}
                  </div>
                );
            })}
            {dayTasks.map(task => {
                const assignee = TEAM_MEMBERS.find(m => m.id === task.assigneeId);
                return (
                    <div 
                        key={task.id} 
                        className={`text-[10px] p-1 rounded border truncate flex items-center gap-1
                            ${task.status === 'Done' ? 'bg-gray-100 text-gray-400 line-through' : 'bg-purple-50 text-purple-800 border-purple-100'}
                        `}
                        title={`${task.description} (${assignee?.name})`}
                    >
                        <span className={`w-1.5 h-1.5 rounded-full ${assignee?.color.split(' ')[0]}`}></span>
                        {task.description}
                    </div>
                );
            })}
          </div>
        </div>
      );
    }

    return cells;
  };

  return (
    <>
    <div className="space-y-6">
      <div className="bg-brand-900 text-white p-6 rounded-xl shadow-lg flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-1 flex items-center">
            <CalendarIcon className="ml-2" />
            לוח שנה
          </h2>
          <p className="text-brand-100 text-sm">קורסים ומשימות צוות</p>
        </div>
        <div className="flex items-center space-x-4 space-x-reverse bg-brand-800 rounded-lg p-1">
          <button onClick={handlePrevMonth} className="p-2 hover:bg-brand-700 rounded-md transition-colors">
            <ChevronRight size={20} />
          </button>
          <span className="font-bold text-lg min-w-[100px] text-center">
            {monthNames[month]} {year}
          </span>
          <button onClick={handleNextMonth} className="p-2 hover:bg-brand-700 rounded-md transition-colors">
            <ChevronLeft size={20} />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Days Header */}
        <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
          {['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'].map(day => (
            <div key={day} className="py-3 text-center text-sm font-semibold text-gray-500">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7">
          {renderCalendarDays()}
        </div>
      </div>
      
      <div className="flex gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-green-100 border border-green-200 rounded"></div>
          <span>קורס פעיל</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-yellow-100 border border-yellow-200 rounded"></div>
          <span>בשיווק</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-purple-50 border border-purple-100 rounded"></div>
          <span>משימה</span>
        </div>
      </div>
    </div>

    {/* Add Task Modal */}
    {selectedDate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 relative">
            <button onClick={() => setSelectedDate(null)} className="absolute top-4 left-4 text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
            <h3 className="text-xl font-bold mb-1 text-gray-900">הוסף משימה</h3>
            <p className="text-sm text-gray-500 mb-4">לתאריך: {selectedDate.toLocaleDateString('he-IL')}</p>
            
            <form onSubmit={handleAddTaskSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">תיאור המשימה</label>
                <input 
                  type="text" 
                  value={newTask.description}
                  onChange={e => setNewTask({...newTask, description: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-brand-500 outline-none"
                  placeholder="מה צריך לבצע?"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">אחראי</label>
                <select 
                  value={newTask.assigneeId}
                  onChange={e => setNewTask({...newTask, assigneeId: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg p-2"
                >
                  {TEAM_MEMBERS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">דחיפות</label>
                <select 
                  value={newTask.priority}
                  onChange={e => setNewTask({...newTask, priority: e.target.value as any})}
                  className="w-full border border-gray-300 rounded-lg p-2"
                >
                  <option value="High">גבוהה</option>
                  <option value="Medium">בינונית</option>
                  <option value="Low">נמוכה</option>
                </select>
              </div>
              <button type="submit" className="w-full bg-brand-600 text-white py-2 rounded-lg font-bold hover:bg-brand-700 transition-colors">
                שמור משימה
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
