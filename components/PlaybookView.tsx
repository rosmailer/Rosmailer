import React, { useState } from 'react';
import { PLAYBOOK_STEPS } from '../data';
import { CheckCircle, Circle, ChevronDown, ChevronUp } from 'lucide-react';

export const PlaybookView: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number | null>(1);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-brand-900 text-white p-6 rounded-xl mb-8 shadow-lg">
        <h2 className="text-2xl font-bold mb-2">Playbook: פתיחת קורס חדש</h2>
        <p className="text-brand-100">
          פרוטוקול עבודה מחייב. אין לדלג על שלבים. אין "בערך".
        </p>
      </div>

      <div className="relative">
        <div className="absolute top-0 bottom-0 right-6 w-0.5 bg-gray-200"></div>
        
        <div className="space-y-8">
          {PLAYBOOK_STEPS.map((step) => {
            const isOpen = activeStep === step.step;
            return (
              <div key={step.step} className="relative flex items-start group">
                {/* Step Indicator */}
                <div className={`
                  flex-shrink-0 w-12 h-12 rounded-full border-4 flex items-center justify-center z-10 bg-white
                  ${isOpen ? 'border-brand-500 text-brand-500' : 'border-gray-200 text-gray-400'}
                `}>
                  <span className="font-bold text-lg">{step.step}</span>
                </div>

                {/* Content Card */}
                <div 
                  className={`
                    mr-6 flex-1 bg-white rounded-xl border transition-all duration-300
                    ${isOpen ? 'border-brand-500 shadow-md ring-1 ring-brand-100' : 'border-gray-200 shadow-sm'}
                  `}
                >
                  <div 
                    className="p-5 flex justify-between items-center cursor-pointer"
                    onClick={() => setActiveStep(isOpen ? null : step.step)}
                  >
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{step.title}</h3>
                      <p className="text-sm text-gray-500">Owner: <span className="font-semibold text-brand-600">{step.owner}</span></p>
                    </div>
                    {isOpen ? <ChevronUp className="text-gray-400" /> : <ChevronDown className="text-gray-400" />}
                  </div>

                  {isOpen && (
                    <div className="px-5 pb-5 border-t border-gray-100 pt-4">
                      <div className="mb-4">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">פעולות נדרשות:</h4>
                        <ul className="space-y-2">
                          {step.actions.map((action, idx) => (
                            <li key={idx} className="flex items-start text-gray-600 text-sm">
                              <Circle size={14} className="ml-2 mt-1 text-gray-300" />
                              {action}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="bg-green-50 border border-green-100 rounded-lg p-3">
                        <div className="flex items-center text-green-800 font-bold text-sm mb-1">
                          <CheckCircle size={16} className="ml-2" />
                          תנאי מעבר (Exit Criteria):
                        </div>
                        <p className="text-green-700 text-sm mr-6">{step.exitCriteria}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
