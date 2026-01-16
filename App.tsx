import React, { useState } from 'react';
import { LayoutDashboard, Users, BookOpen, Target, Menu, LogOut, TrendingUp, Settings, Calendar as CalendarIcon, GraduationCap, CreditCard, Save } from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { TeamView } from './components/TeamView';
import { PlaybookView } from './components/PlaybookView';
import { StrategyView } from './components/StrategyView';
import { ControlPanel } from './components/ControlPanel';
import { CalendarView } from './components/CalendarView';
import { StudentsView } from './components/StudentsView';
import { PaymentLinksView } from './components/PaymentLinksView';
import { AppProvider, useAppContext } from './context/AppContext';

type View = 'dashboard' | 'strategy' | 'team' | 'playbook' | 'pnl' | 'admin' | 'calendar' | 'students' | 'payment-links';

const AppContent = () => {
  const { saveAllData } = useAppContext();
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const NavItem = ({ view, label, icon: Icon }: { view: View; label: string; icon: any }) => (
    <button
      onClick={() => {
        setCurrentView(view);
        setIsMobileMenuOpen(false);
      }}
      className={`w-full flex items-center px-6 py-3.5 text-sm font-medium transition-colors duration-200
        ${currentView === view 
          ? 'bg-brand-800 text-white border-r-4 border-brand-500' 
          : 'text-gray-400 hover:bg-brand-900 hover:text-white'
        }`}
    >
      <Icon size={20} className="ml-3" />
      {label}
    </button>
  );

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard': return <Dashboard />;
      case 'strategy': return <StrategyView />;
      case 'team': return <TeamView />;
      case 'playbook': return <PlaybookView />;
      case 'pnl': return <Dashboard />; 
      case 'admin': return <ControlPanel />;
      case 'calendar': return <CalendarView />;
      case 'students': return <StudentsView />;
      case 'payment-links': return <PaymentLinksView />;
      default: return <Dashboard />;
    }
  };

  const getPageTitle = () => {
    switch (currentView) {
      case 'dashboard': return 'מבט על (Dashboard)';
      case 'strategy': return 'חזון ואסטרטגיה';
      case 'team': return 'מבנה ארגוני ומשימות';
      case 'playbook': return 'פרוטוקול עבודה (Playbook)';
      case 'pnl': return 'פיננסים (P&L)';
      case 'admin': return 'מרכז שליטה וניהול';
      case 'calendar': return 'לוח שנה (קורסים)';
      case 'students': return 'מאגר נרשמים (Students)';
      case 'payment-links': return 'לינקים לתשלום';
      default: return '';
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden text-right" dir="rtl">
      
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 right-0 z-30 w-64 bg-brand-950 text-white shadow-xl transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0
        ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}
        flex flex-col
      `}>
        <div className="h-20 flex items-center px-6 border-b border-brand-800 flex-shrink-0">
          <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center ml-3">
            <span className="font-bold text-white text-lg">FD</span>
          </div>
          <span className="text-xl font-bold tracking-tight">FD AI Management</span>
        </div>

        <div className="mt-6 flex flex-col gap-1 flex-1 overflow-y-auto">
          <NavItem view="dashboard" label="דשבורד" icon={LayoutDashboard} />
          <NavItem view="calendar" label="לוח שנה" icon={CalendarIcon} />
          <NavItem view="students" label="כל הסטודנטים" icon={GraduationCap} />
          <NavItem view="payment-links" label="לינקים לתשלום" icon={CreditCard} />
          <NavItem view="admin" label="מרכז שליטה (Admin)" icon={Settings} />
          <NavItem view="strategy" label="אסטרטגיה וחזון" icon={Target} />
          <NavItem view="pnl" label="פיננסים (P&L)" icon={TrendingUp} />
          <NavItem view="team" label="צוות ומשימות" icon={Users} />
          <NavItem view="playbook" label="קורסים ו-Playbook" icon={BookOpen} />
        </div>

        {/* Save Button & User Profile */}
        <div className="p-4 border-t border-brand-800 bg-brand-950 flex-shrink-0">
          <button 
             onClick={saveAllData}
             className="w-full mb-4 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 text-white py-2.5 rounded-lg transition-colors text-sm font-bold shadow-lg"
          >
             <Save size={18} />
             שמור הכל (Save)
          </button>

          <div className="flex items-center text-gray-400 text-sm">
            <div className="w-8 h-8 rounded-full bg-brand-800 flex items-center justify-center ml-3">
              <span className="font-bold">R</span>
            </div>
            <div>
              <p className="text-white font-medium">רוסלן</p>
              <p className="text-xs">מנכ״ל (CEO)</p>
            </div>
            <LogOut size={16} className="mr-auto cursor-pointer hover:text-white" />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-6 md:px-8 flex-shrink-0">
          <div className="flex items-center">
             <button 
              className="md:hidden ml-4 text-gray-500"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={24} />
            </button>
            <h2 className="text-2xl font-bold text-gray-800">{getPageTitle()}</h2>
          </div>
          
          <div className="hidden md:flex items-center space-x-4 space-x-reverse">
            <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
              מצב: ולידציה + מזומן
            </span>
            <span className="text-sm text-gray-500">עדכון אחרון: היום, 09:41</span>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-6xl mx-auto">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
}

const App = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;
