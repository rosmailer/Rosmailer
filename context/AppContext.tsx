import React, { createContext, useContext, useState, ReactNode, PropsWithChildren } from 'react';
import { Course, FinancialRecord, Task, TeamMember, PaymentLink } from '../types';
import { MOCK_COURSES, INITIAL_FINANCIAL_DATA, INITIAL_TASKS, TEAM_MEMBERS, INITIAL_PAYMENT_LINKS } from '../data';

interface AppContextType {
  courses: Course[];
  financialData: FinancialRecord[];
  tasks: Task[];
  teamMembers: TeamMember[];
  paymentLinks: PaymentLink[];
  addCourse: (course: Course) => void;
  updateCourse: (course: Course) => void;
  deleteCourse: (id: string) => void;
  updateFinancialRecord: (record: FinancialRecord) => void;
  syncFinancialsWithCourses: () => void;
  addTask: (task: Task) => void;
  updateTask: (task: Task) => void;
  deleteTask: (id: string) => void;
  toggleTaskStatus: (id: string) => void;
  updateTeamMember: (member: TeamMember) => void;
  addPaymentLink: (link: PaymentLink) => void;
  deletePaymentLink: (id: string) => void;
  saveAllData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const getInitialState = <T,>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') return fallback;
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch (e) {
    console.error('Error loading from localStorage', e);
    return fallback;
  }
};

export const AppProvider: React.FC<PropsWithChildren<{}>> = ({ children }) => {
  const [courses, setCourses] = useState<Course[]>(() => getInitialState('fd_courses', MOCK_COURSES));
  const [financialData, setFinancialData] = useState<FinancialRecord[]>(() => getInitialState('fd_financial', INITIAL_FINANCIAL_DATA));
  const [tasks, setTasks] = useState<Task[]>(() => getInitialState('fd_tasks', INITIAL_TASKS));
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(() => getInitialState('fd_team', TEAM_MEMBERS));
  const [paymentLinks, setPaymentLinks] = useState<PaymentLink[]>(() => getInitialState('fd_payment_links', INITIAL_PAYMENT_LINKS));

  const addCourse = (course: Course) => {
    setCourses([...courses, course]);
  };

  const updateCourse = (updatedCourse: Course) => {
    setCourses(prev => prev.map(c => c.id === updatedCourse.id ? updatedCourse : c));
  };

  const deleteCourse = (id: string) => {
    setCourses(courses.filter(c => c.id !== id));
  };

  // Maps ISO date month index to Hebrew name
  const getMonthName = (dateStr: string) => {
    const date = new Date(dateStr);
    const monthNames = [
      'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
      'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'
    ];
    if (dateStr.includes('2025') && date.getMonth() === 10) return 'נובמבר 2025';
    if (dateStr.includes('2025') && date.getMonth() === 11) return 'דצמבר 2025';

    return monthNames[date.getMonth()];
  };

  const syncFinancialsWithCourses = () => {
    const revenueByMonth: Record<string, number> = {};
    
    courses.forEach(course => {
      const month = getMonthName(course.startDate);
      if (!revenueByMonth[month]) revenueByMonth[month] = 0;
      revenueByMonth[month] += course.revenue;
    });

    setFinancialData(prev => {
        // Explicitly type the map entries as [string, FinancialRecord] to ensure the Map key/value types are correct.
        // This prevents 'existing' from being inferred as a union type that includes primitives, which causes the spread error.
        const financialMap = new Map<string, FinancialRecord>(
            prev.map(item => [item.name, item] as [string, FinancialRecord])
        );
        
        Object.entries(revenueByMonth).forEach(([monthName, totalRevenue]) => {
            const existing = financialMap.get(monthName);
            if (existing) {
                financialMap.set(monthName, {
                    ...existing,
                    revenue: totalRevenue
                });
            } else {
                financialMap.set(monthName, {
                    name: monthName,
                    revenue: totalRevenue,
                    profit: Math.round(totalRevenue * 0.3)
                });
            }
        });

        return Array.from(financialMap.values());
    });
  };

  const updateFinancialRecord = (record: FinancialRecord) => {
    setFinancialData(prev => {
      const index = prev.findIndex(p => p.name === record.name);
      if (index >= 0) {
        const newData = [...prev];
        newData[index] = record;
        return newData;
      }
      return [...prev, record];
    });
  };

  const addTask = (task: Task) => {
    setTasks([...tasks, task]);
  };

  const updateTask = (updatedTask: Task) => {
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const toggleTaskStatus = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, status: t.status === 'Pending' ? 'Done' : 'Pending' } : t));
  };

  const updateTeamMember = (updatedMember: TeamMember) => {
    setTeamMembers(prev => prev.map(m => m.id === updatedMember.id ? updatedMember : m));
  };

  const addPaymentLink = (link: PaymentLink) => {
      setPaymentLinks(prev => [...prev, link]);
  };

  const deletePaymentLink = (id: string) => {
      setPaymentLinks(prev => prev.filter(l => l.id !== id));
  };

  const saveAllData = () => {
      try {
          localStorage.setItem('fd_courses', JSON.stringify(courses));
          localStorage.setItem('fd_financial', JSON.stringify(financialData));
          localStorage.setItem('fd_tasks', JSON.stringify(tasks));
          localStorage.setItem('fd_team', JSON.stringify(teamMembers));
          localStorage.setItem('fd_payment_links', JSON.stringify(paymentLinks));
          alert('כל השינויים נשמרו בהצלחה! (נשמר בזיכרון הדפדפן)');
      } catch (e) {
          console.error(e);
          alert('שגיאה בשמירת הנתונים');
      }
  };

  return (
    <AppContext.Provider value={{ 
      courses, 
      financialData, 
      tasks, 
      teamMembers,
      paymentLinks,
      addCourse, 
      updateCourse, 
      deleteCourse,
      updateFinancialRecord,
      syncFinancialsWithCourses,
      addTask,
      updateTask,
      deleteTask,
      toggleTaskStatus,
      updateTeamMember,
      addPaymentLink,
      deletePaymentLink,
      saveAllData
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};