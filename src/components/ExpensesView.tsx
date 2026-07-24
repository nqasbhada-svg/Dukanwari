import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Trash2, Calendar, IndianRupee, FileText, LayoutDashboard, Search } from 'lucide-react';
import { Expense } from '../types';

interface ExpensesViewProps {
  expenses: Expense[];
  onAddExpense: (exp: Omit<Expense, 'id'>) => void;
  onDeleteExpense: (id: string) => void;
  isMr: boolean;
  darkMode: boolean;
}

const EXPENSE_CATEGORIES = [
  'Electricity Bill',
  'Rent',
  'Salary',
  'Contingency',
  'Tea & Hospitality',
  'Marketing',
  'Maintenance',
  'Other'
];

const EXPENSE_CATEGORIES_MR = [
  'वीज बिल',
  'भाडे',
  'पगार',
  'आकस्मिक खर्च',
  'चहापाणी',
  'मार्केटिंग',
  'देखभाल',
  'इतर'
];

export const ExpensesView: React.FC<ExpensesViewProps> = ({ expenses, onAddExpense, onDeleteExpense, isMr, darkMode }) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [amount, setAmount] = useState<number | ''>('');
  const [description, setDescription] = useState('');
  const [search, setSearch] = useState('');
  const [paidBy, setPaidBy] = useState('Owner');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;

    onAddExpense({
      date,
      category,
      amount: Number(amount),
      description,
      paidBy
    });

    setAmount('');
    setDescription('');
  };

  const filteredExpenses = expenses
    .filter(e => 
      e.category.toLowerCase().includes(search.toLowerCase()) || 
      e.description.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalFiltered = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black font-display tracking-tight text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <IndianRupee className="text-rose-500" />
            {isMr ? 'खर्च आणि देयके' : 'Shop Expenses'}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            {isMr ? 'दुकानाचा रोजचा खर्च नोंदवा (उदा. वीज बिल, चहापाणी)' : 'Track daily shop expenses to calculate actual profit'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm sticky top-6">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
              <Plus size={18} className="text-indigo-500" />
              {isMr ? 'नवीन खर्च जोडा' : 'Add New Expense'}
            </h3>
            
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">{isMr ? 'दिनांक' : 'Date'}</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-2.5 text-slate-400" size={16} />
                  <input 
                    type="date" 
                    required
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 focus:border-indigo-400 focus:bg-white dark:focus:bg-slate-900 rounded-xl text-sm font-medium outline-none transition text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">{isMr ? 'खर्चाचा प्रकार' : 'Category'}</label>
                <div className="relative">
                  <LayoutDashboard className="absolute left-3 top-2.5 text-slate-400" size={16} />
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 focus:border-indigo-400 focus:bg-white dark:focus:bg-slate-900 rounded-xl text-sm font-medium outline-none transition text-slate-800 dark:text-slate-100 appearance-none"
                  >
                    {(isMr ? EXPENSE_CATEGORIES_MR : EXPENSE_CATEGORIES).map((cat, i) => (
                      <option key={cat} value={EXPENSE_CATEGORIES[i]}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">{isMr ? 'रक्कम (₹)' : 'Amount (₹)'}</label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-2.5 text-slate-400" size={16} />
                  <input 
                    type="number"
                    required
                    min="1"
                    placeholder="0"
                    value={amount}
                    onChange={e => setAmount(e.target.value ? Number(e.target.value) : '')}
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 focus:border-indigo-400 focus:bg-white dark:focus:bg-slate-900 rounded-xl text-sm font-bold outline-none transition text-rose-600 dark:text-rose-400"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">{isMr ? 'तपशील' : 'Description'}</label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 text-slate-400" size={16} />
                  <textarea 
                    rows={2}
                    placeholder={isMr ? "खर्चाबद्दल थोडक्यात माहिती..." : "Brief detail about this expense..."}
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 focus:border-indigo-400 focus:bg-white dark:focus:bg-slate-900 rounded-xl text-sm font-medium outline-none transition text-slate-800 dark:text-slate-100 resize-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">{isMr ? 'कोणी दिले?' : 'Paid By'}</label>
                <input 
                  type="text"
                  placeholder={isMr ? "उदा. मालक, मॅनेजर" : "e.g. Owner, Manager"}
                  value={paidBy}
                  onChange={e => setPaidBy(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 focus:border-indigo-400 focus:bg-white dark:focus:bg-slate-900 rounded-xl text-sm font-medium outline-none transition text-slate-800 dark:text-slate-100"
                />
              </div>

              <button 
                type="submit"
                className="w-full py-3 mt-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition flex items-center justify-center gap-2 shadow-sm"
              >
                <Plus size={18} />
                {isMr ? 'खर्च नोंदवा' : 'Save Expense'}
              </button>
            </form>
          </div>
        </div>

        {/* List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder={isMr ? 'खर्च शोधा...' : 'Search expenses...'}
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 focus:border-indigo-400 rounded-lg text-sm font-medium outline-none transition text-slate-800 dark:text-slate-100"
              />
            </div>
            <div className="text-right ml-4 shrink-0">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                {isMr ? 'एकूण खर्च' : 'Total Filtered'}
              </span>
              <span className="text-lg font-black text-rose-600 dark:text-rose-400">
                ₹{totalFiltered.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            {filteredExpenses.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <IndianRupee size={48} className="mx-auto mb-4 opacity-20" />
                <p>{isMr ? 'कोणताही खर्च आढळला नाही' : 'No expenses found'}</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800/50 max-h-[600px] overflow-y-auto">
                {filteredExpenses.map((exp) => (
                  <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    key={exp.id}
                    className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0">
                        <IndianRupee size={18} />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                          {isMr && EXPENSE_CATEGORIES.includes(exp.category) 
                            ? EXPENSE_CATEGORIES_MR[EXPENSE_CATEGORIES.indexOf(exp.category)] 
                            : exp.category}
                        </h4>
                        <div className="flex items-center gap-2 text-xs mt-0.5 text-slate-500">
                          <span className="flex items-center gap-1 font-mono">
                            <Calendar size={12} />
                            {new Date(exp.date).toLocaleDateString()}
                          </span>
                          {exp.description && (
                            <>
                              <span>•</span>
                              <span className="truncate max-w-[200px]">{exp.description}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="block font-black text-slate-800 dark:text-slate-100">
                          ₹{exp.amount.toLocaleString()}
                        </span>
                        {exp.paidBy && (
                          <span className="text-[10px] text-slate-400">
                            By {exp.paidBy}
                          </span>
                        )}
                      </div>
                      <button 
                        onClick={() => onDeleteExpense(exp.id)}
                        className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 flex items-center justify-center transition opacity-0 group-hover:opacity-100 shrink-0"
                        title="Delete expense"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
