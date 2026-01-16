import React, { useState } from 'react';
import { STRATEGY_PILLARS } from '../data';
import { Anchor, DollarSign, Users, HeartHandshake, Send, BrainCircuit } from 'lucide-react';
import { askStrategyAdvisor } from '../services/geminiService';

const iconMap: Record<string, any> = {
  Anchor,
  DollarSign,
  Users,
  HeartHandshake
};

export const StrategyView: React.FC = () => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAsk = async () => {
    if (!question.trim()) return;
    setIsLoading(true);
    setAnswer('');
    const response = await askStrategyAdvisor(question);
    setAnswer(response);
    setIsLoading(false);
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-l from-brand-900 to-brand-800 text-white rounded-2xl p-8 shadow-xl">
        <h1 className="text-3xl font-extrabold mb-4">FD AI College</h1>
        <p className="text-xl font-light text-brand-100 max-w-2xl leading-relaxed">
          "להנגיש בינה מלאכותית לאנשים שאינם טכנולוגיים, בצורה פרקטית, פרונטלית ומעשית – כך שתשנה להם בפועל את היכולת לעבוד, להתפרנס ולחשוב."
        </p>
      </div>

      {/* Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {STRATEGY_PILLARS.map((pillar, index) => {
          const Icon = iconMap[pillar.iconName] || Users;
          return (
            <div key={index} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:border-brand-200 transition-colors">
              <div className="w-12 h-12 bg-brand-50 rounded-lg flex items-center justify-center mb-4">
                <Icon className="text-brand-600" size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{pillar.title}</h3>
              <p className="text-gray-600 leading-relaxed">{pillar.description}</p>
            </div>
          );
        })}
      </div>

      {/* AI Advisor Section */}
      <div className="bg-slate-900 text-white rounded-xl p-6 shadow-lg border border-slate-800">
        <div className="flex items-center mb-4">
          <div className="bg-purple-600 p-2 rounded-lg ml-3">
             <BrainCircuit size={24} className="text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold">היועץ האסטרטגי (AI)</h3>
            <p className="text-sm text-slate-400">התייעץ עם המודל העסקי לגבי קבלת החלטות</p>
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg p-4 mb-4 min-h-[100px] text-sm leading-relaxed border border-slate-700">
          {isLoading ? (
            <div className="flex items-center text-slate-400 animate-pulse">
              <span className="w-2 h-2 bg-purple-500 rounded-full ml-2 animate-bounce"></span>
              חושב...
            </div>
          ) : answer ? (
            <div className="whitespace-pre-wrap">{answer}</div>
          ) : (
            <span className="text-slate-500 italic">שאל אותי משהו, למשל: "האם כדאי לפתוח עכשיו קורס למתקדמים?"</span>
          )}
        </div>

        <div className="flex gap-2">
          <input 
            type="text" 
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAsk()}
            placeholder="הקלד שאלה אסטרטגית..."
            className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 transition-colors"
          />
          <button 
            onClick={handleAsk}
            disabled={isLoading}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center"
          >
            <Send size={18} className="ml-2" />
            שאל
          </button>
        </div>
      </div>
    </div>
  );
};
