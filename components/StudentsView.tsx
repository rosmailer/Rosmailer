import React from 'react';
import { useAppContext } from '../context/AppContext';
import { MessageCircle, Mail, Copy } from 'lucide-react';
import { Student } from '../types';

export const StudentsView: React.FC = () => {
    const { courses } = useAppContext();
    const allStudents = courses.flatMap(c => c.students.map(s => ({ ...s, courseName: c.name })));

    const sendWhatsApp = (phone: string | undefined, message: string) => {
        if (!phone) return;
        const cleanPhone = phone.replace(/\D/g, '').replace(/^0/, '972');
        const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };
  
    const handleManyChatBroadcast = (students: Student[]) => {
        const phones = students
          .map(s => s.phone?.replace(/\D/g, '').replace(/^0/, '972'))
          .filter(Boolean);
        
        if (phones.length === 0) return alert('אין מספרי טלפון תקינים');
        
        // 1. Copy to clipboard
        const csvContent = phones.join(',');
        navigator.clipboard.writeText(csvContent).then(() => {
            // 2. Alert user
            const proceed = window.confirm(
                `הועתקו ${phones.length} מספרי טלפון ללוח.\n\nהאם לעבור לאתר ManyChat כדי להדביק את הרשימה ולשלוח הודעה?`
            );
            
            // 3. Open ManyChat
            if (proceed) {
                window.open('https://manychat.com/', '_blank');
            }
        }).catch(err => {
            alert('שגיאה בהעתקת המספרים: ' + err);
        });
    };
  
    const sendBulkGmail = (students: Student[]) => {
        const emails = students.map(s => {
            const key = Object.keys(s.customData || {}).find(k => k.toLowerCase().includes('mail') || k.includes('מייל'));
            // Also check for explicit 'email' field on team members if this was reused, but for students check customData
            return key ? s.customData[key] : null;
        }).filter(Boolean);
  
        if (emails.length === 0) return alert('לא נמצאו כתובות מייל');

        // Construct Gmail specific URL
        const recipientString = emails.join(',');
        const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(recipientString)}`;
        
        window.open(gmailUrl, '_blank');
    };

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">מאגר נרשמים כולל</h2>
                        <p className="text-sm text-gray-500 mt-1">סה"כ נרשמים בכל הקורסים: <span className="font-bold text-brand-600">{allStudents.length}</span></p>
                    </div>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => handleManyChatBroadcast(allStudents)}
                            className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg flex items-center text-sm"
                            title="העתק מספרים ופתח ManyChat"
                        >
                            <MessageCircle size={16} className="ml-2" />
                            וואטסאף לכולם (ManyChat)
                        </button>
                        <button 
                            onClick={() => sendBulkGmail(allStudents)}
                            className="bg-brand-500 hover:bg-brand-600 text-white px-3 py-2 rounded-lg flex items-center text-sm"
                            title="פתח Gmail עם כל הנמענים"
                        >
                            <Mail size={16} className="ml-2" />
                            מייל לכולם (Gmail)
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">שם</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">טלפון</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">קורס</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">הערות</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">פעולות</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {allStudents.map((s, i) => (
                                <tr key={i} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">{s.name}</td>
                                    <td className="px-4 py-3 text-sm text-gray-500">{s.phone}</td>
                                    <td className="px-4 py-3 text-sm text-gray-500">{s.courseName}</td>
                                    <td className="px-4 py-3 text-sm text-gray-500">{s.notes}</td>
                                    <td className="px-4 py-3 text-sm">
                                        <button onClick={() => sendWhatsApp(s.phone, '')} className="text-green-500 hover:text-green-600 p-1 bg-green-50 rounded-full">
                                            <MessageCircle size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {allStudents.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="text-center py-8 text-gray-400">לא נמצאו סטודנטים במערכת</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
