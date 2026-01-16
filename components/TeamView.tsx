import React from 'react';
import { TEAM_MEMBERS } from '../data';
import { Shield, Target, AlertCircle, ListTodo, Plus, CheckCircle2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export const TeamView: React.FC = () => {
  const { tasks, addTask, toggleTaskStatus } = useAppContext();

  const handleQuickTask = (memberId: string) => {
    const desc = prompt("הזן תיאור משימה:");
    if (desc) {
      addTask({
        id: Math.random().toString(36).substr(2, 9),
        description: desc,
        assigneeId: memberId,
        priority: 'Medium',
        status: 'Pending'
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-700 border-red-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Low': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {TEAM_MEMBERS.map((member) => {
        const memberTasks = tasks.filter(t => t.assigneeId === member.id);
        const pendingTasks = memberTasks.filter(t => t.status === 'Pending').sort((a, b) => {
            const map = { 'High': 1, 'Medium': 2, 'Low': 3 };
            return map[a.priority] - map[b.priority];
        });
        
        const doneCount = memberTasks.filter(t => t.status === 'Done').length;
        const totalCount = memberTasks.length;
        const progress = totalCount === 0 ? 0 : Math.round((doneCount / totalCount) * 100);

        return (
          <div key={member.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full">
            <div className={`p-4 border-b border-gray-100 flex justify-between items-center ${member.color.split(' ')[0]} bg-opacity-30`}>
              <div>
                <h3 className="text-xl font-bold text-gray-900">{member.name}</h3>
                <p className="text-sm text-gray-600 font-medium">{member.roleTitle}</p>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${member.color}`}>
                {member.type}
              </div>
            </div>
            
            <div className="p-6 space-y-6 flex-1">
              
              {/* Progress Bar */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-gray-500">השלמת משימות</span>
                  <span className="font-bold text-brand-600">{progress}%</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-brand-500 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Tasks Section */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                 <div className="flex justify-between items-center mb-3">
                   <div className="flex items-center text-gray-800 font-bold text-sm">
                     <ListTodo size={16} className="ml-2" />
                     משימות לביצוע ({pendingTasks.length})
                   </div>
                   <button 
                    onClick={() => handleQuickTask(member.id)}
                    className="text-xs bg-white border border-gray-300 text-gray-700 px-2 py-1 rounded hover:bg-gray-100 flex items-center transition-colors"
                   >
                     <Plus size={12} className="ml-1" /> הוסף
                   </button>
                 </div>
                 
                 {pendingTasks.length > 0 ? (
                   <ul className="space-y-2">
                     {pendingTasks.map(t => (
                       <li key={t.id} className="text-sm bg-white p-2 rounded border border-gray-100 shadow-sm flex items-start group">
                         <button 
                            onClick={() => toggleTaskStatus(t.id)}
                            className="mt-0.5 ml-2 text-gray-300 hover:text-green-500 transition-colors"
                         >
                            <CheckCircle2 size={16} />
                         </button>
                         <div className="flex-1">
                            <span className="text-gray-800 block leading-tight">{t.description}</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded border inline-block mt-1 ${getPriorityColor(t.priority)}`}>
                                {t.priority === 'High' ? 'דחוף' : t.priority === 'Medium' ? 'רגיל' : 'נמוך'}
                            </span>
                         </div>
                       </li>
                     ))}
                   </ul>
                 ) : (
                   <p className="text-xs text-gray-400 italic text-center py-2">אין משימות פתוחות 🎉</p>
                 )}
              </div>

              <div>
                <div className="flex items-center mb-2 text-brand-900 font-semibold">
                  <Target size={18} className="ml-2" />
                  <span>מיקוד על (Focus)</span>
                </div>
                <p className="text-gray-700 bg-white border border-gray-100 p-3 rounded-lg text-sm">{member.focus}</p>
              </div>

              <div>
                <div className="flex items-center mb-2 text-gray-800 font-semibold">
                  <Shield size={18} className="ml-2" />
                  <span>תחומי אחריות (Ownership)</span>
                </div>
                <ul className="list-disc list-inside space-y-1">
                  {member.responsibilities.map((resp, i) => (
                    <li key={i} className="text-sm text-gray-600">{resp}</li>
                  ))}
                </ul>
              </div>

              <div className="pt-4 border-t border-gray-100 mt-auto">
                 <h4 className="text-xs font-bold text-gray-400 uppercase mb-3">מדדי הצלחה (KPIs)</h4>
                 <div className="grid grid-cols-2 gap-2">
                   {member.kpis.map((kpi, i) => (
                     <div key={i} className="flex items-center text-xs text-gray-700 bg-white border border-gray-200 p-2 rounded">
                       <div className="w-1.5 h-1.5 rounded-full bg-kpi-green ml-2 flex-shrink-0"></div>
                       {kpi}
                     </div>
                   ))}
                 </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
