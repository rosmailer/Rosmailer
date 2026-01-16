import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Link, Copy, Trash2, Plus, ExternalLink } from 'lucide-react';
import { PaymentLink } from '../types';

export const PaymentLinksView: React.FC = () => {
  const { paymentLinks, addPaymentLink, deletePaymentLink } = useAppContext();
  const [newLink, setNewLink] = useState<Partial<PaymentLink>>({ title: '', url: '' });

  const handleAdd = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newLink.title || !newLink.url) return;
      
      addPaymentLink({
          id: Math.random().toString(36).substr(2, 9),
          title: newLink.title,
          url: newLink.url
      } as PaymentLink);
      
      setNewLink({ title: '', url: '' });
  };

  const copyToClipboard = (text: string) => {
      navigator.clipboard.writeText(text).then(() => {
          alert('הלינק הועתק בהצלחה!');
      }).catch(err => {
          console.error('Failed to copy: ', err);
      });
  };

  return (
    <div className="space-y-6">
      <div className="bg-brand-900 text-white p-6 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold mb-2 flex items-center">
            <Link className="ml-2" />
            לינקים לתשלום
        </h2>
        <p className="text-brand-100">ניהול מרוכז של לינקים לתשלום, הרשמה ומקדמות לשימוש מהיר.</p>
      </div>

      {/* Add New Link */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-4">הוסף לינק חדש</h3>
          <form onSubmit={handleAdd} className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1 w-full">
                  <label className="block text-xs font-medium text-gray-500 mb-1">שם הלינק (למשל: תשלום מקדמה קורס ערב)</label>
                  <input 
                    type="text" 
                    value={newLink.title}
                    onChange={e => setNewLink({...newLink, title: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                    placeholder="תיאור הלינק"
                  />
              </div>
              <div className="flex-1 w-full">
                  <label className="block text-xs font-medium text-gray-500 mb-1">כתובת הלינק (URL)</label>
                  <input 
                    type="text" 
                    value={newLink.url}
                    onChange={e => setNewLink({...newLink, url: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm text-left focus:ring-2 focus:ring-brand-500 outline-none"
                    placeholder="https://..."
                    dir="ltr"
                  />
              </div>
              <button type="submit" className="bg-brand-600 text-white p-2.5 rounded-lg hover:bg-brand-700 transition-colors flex items-center justify-center w-full md:w-auto">
                  <Plus size={20} className="ml-2" />
                  הוסף לרשימה
              </button>
          </form>
      </div>

      {/* Links List */}
      <div className="grid grid-cols-1 gap-4">
          {paymentLinks.length === 0 ? (
              <p className="text-center text-gray-400 py-8">אין לינקים שמורים כרגע.</p>
          ) : (
              paymentLinks.map(link => (
                  <div key={link.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-3 overflow-hidden w-full md:w-auto">
                          <div className="bg-blue-50 p-2 rounded-lg text-brand-600">
                              <Link size={20} />
                          </div>
                          <div className="truncate">
                              <h4 className="font-bold text-gray-800">{link.title}</h4>
                              <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-xs text-gray-400 hover:text-brand-500 truncate block dir-ltr text-left flex items-center">
                                  {link.url} <ExternalLink size={10} className="ml-1" />
                              </a>
                          </div>
                      </div>
                      
                      <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                          <button 
                            onClick={() => copyToClipboard(link.url)}
                            className="flex items-center text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg transition-colors"
                          >
                              <Copy size={16} className="ml-2" />
                              העתק
                          </button>
                          <button 
                            onClick={() => deletePaymentLink(link.id)}
                            className="text-red-400 hover:bg-red-50 p-2 rounded-lg transition-colors"
                          >
                              <Trash2 size={18} />
                          </button>
                      </div>
                  </div>
              ))
          )}
      </div>
    </div>
  );
};
