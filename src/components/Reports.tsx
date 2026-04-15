import React, { useState } from 'react';
import { FileText, Download, Calendar, X, Trash2 } from 'lucide-react';
import { Order, Expense } from '../types';
import { Card, Button, cn } from './UI';
import { TrendingDown, TrendingUp, PieChart as PieIcon } from 'lucide-react';

interface ReportsProps {
  orders: Order[];
  expenses: Expense[];
}

export default function Reports({ orders, expenses }: ReportsProps) {
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const filteredOrders = orders.filter(o => {
    if (o.status !== 'completed') return false;
    // Исключаем заказы на сумму 2450 и 350 по просьбе пользователя
    if (o.total === 2450 || o.total === 350) return false;
    
    const orderDate = new Date(o.timestamp).toISOString().split('T')[0];
    if (dateRange.start && orderDate < dateRange.start) return false;
    if (dateRange.end && orderDate > dateRange.end) return false;
    return true;
  }).sort((a, b) => {
    const numA = parseInt(a.orderNumber) || 0;
    const numB = parseInt(b.orderNumber) || 0;
    return sortOrder === 'asc' ? numA - numB : numB - numA;
  });

  const filteredExpenses = expenses.filter(e => {
    const expenseDate = new Date(e.timestamp).toISOString().split('T')[0];
    if (dateRange.start && expenseDate < dateRange.start) return false;
    if (dateRange.end && expenseDate > dateRange.end) return false;
    return true;
  });

  const totalRevenue = filteredOrders.reduce((sum, o) => sum + o.total, 0);
  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = totalRevenue - totalExpenses;
  const completedCount = filteredOrders.length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative">
        <h2 className="text-xl font-bold">Отчёты</h2>
        <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
          <Button 
            variant={dateRange.start || dateRange.end ? "primary" : "secondary"} 
            className="flex-1 sm:flex-none"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
          >
            <Calendar size={18} />
            {dateRange.start || dateRange.end ? 'Фильтр активен' : 'Период'}
          </Button>
          <Button className="flex-1 sm:flex-none">
            <Download size={18} />
            Экспорт
          </Button>
        </div>

        {isFilterOpen && (
          <Card className="absolute top-full right-0 mt-2 p-4 z-50 w-full sm:w-72 shadow-xl border-indigo-100 animate-in fade-in slide-in-from-top-2">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-bold text-sm">Фильтр по дате</h4>
              <button onClick={() => setIsFilterOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={16} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">От</label>
                <input 
                  type="date" 
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500/20"
                  value={dateRange.start}
                  onChange={e => setDateRange({...dateRange, start: e.target.value})}
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">До</label>
                <input 
                  type="date" 
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500/20"
                  value={dateRange.end}
                  onChange={e => setDateRange({...dateRange, end: e.target.value})}
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button 
                  variant="secondary" 
                  className="flex-1 text-xs py-2" 
                  onClick={() => {
                    setDateRange({ start: '', end: '' });
                    setIsFilterOpen(false);
                  }}
                >
                  Сброс
                </Button>
                <Button 
                  className="flex-1 text-xs py-2"
                  onClick={() => setIsFilterOpen(false)}
                >
                  Применить
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-emerald-600 text-white">
          <h3 className="text-emerald-100 font-medium mb-2">Общая выручка</h3>
          <p className="text-4xl font-bold">{totalRevenue.toLocaleString()} ₽</p>
          <div className="mt-4 flex items-center gap-2 text-emerald-200 text-sm">
            <TrendingUp size={16} />
            На основе {completedCount} заказов
          </div>
        </Card>

        <Card className="p-6 bg-rose-600 text-white">
          <h3 className="text-rose-100 font-medium mb-2">Общие расходы</h3>
          <p className="text-4xl font-bold">{totalExpenses.toLocaleString()} ₽</p>
          <div className="mt-4 flex items-center gap-2 text-rose-200 text-sm">
            <TrendingDown size={16} />
            {expenses.length} записей об издержках
          </div>
        </Card>

        <Card className={cn("p-6 text-white", netProfit >= 0 ? "bg-indigo-600" : "bg-slate-800")}>
          <h3 className="text-indigo-100 font-medium mb-2">Чистая прибыль</h3>
          <p className="text-4xl font-bold">{netProfit.toLocaleString()} ₽</p>
          <div className="mt-4 flex items-center gap-2 text-indigo-200 text-sm">
            <PieIcon size={16} />
            Рентабельность: {totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0}%
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="flex flex-col">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold">История заказов</h3>
            <button 
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors"
            >
              {sortOrder === 'asc' ? 'Сначала старые' : 'Сначала новые'}
            </button>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-4 sm:px-6 py-4 text-sm font-semibold text-slate-600">Чек №</th>
                  <th className="px-4 sm:px-6 py-4 text-sm font-semibold text-slate-600">Дата и время</th>
                  <th className="px-4 sm:px-6 py-4 text-sm font-semibold text-slate-600">Стол</th>
                  <th className="px-4 sm:px-6 py-4 text-sm font-semibold text-slate-600">Гости</th>
                  <th className="px-4 sm:px-6 py-4 text-sm font-semibold text-slate-600">Сумма</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.slice(0, 10).map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/50 transition-colors text-sm">
                    <td className="px-4 sm:px-6 py-4 font-mono text-xs font-bold text-indigo-600">
                      #{order.orderNumber || '----'}
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-slate-600">
                      <div className="font-medium text-slate-900">
                        {new Date(order.timestamp).toLocaleDateString([], { day: '2-digit', month: '2-digit' })}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {new Date(order.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 font-bold text-slate-900">№{order.tableNumber}</td>
                    <td className="px-4 sm:px-6 py-4 text-slate-600">{order.guests || 0} чел.</td>
                    <td className="px-4 sm:px-6 py-4 font-semibold text-slate-900">{order.total} ₽</td>
                  </tr>
                ))}
                {filteredOrders.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-slate-400 italic">Нет заказов за этот период</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="flex flex-col">
          <div className="p-6 border-b border-slate-100">
            <h3 className="font-bold">Последние расходы</h3>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-4 sm:px-6 py-4 text-sm font-semibold text-slate-600">Описание</th>
                  <th className="px-4 sm:px-6 py-4 text-sm font-semibold text-slate-600">Сумма</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredExpenses.slice(0, 10).map((expense) => (
                  <tr key={expense.id} className="hover:bg-slate-50/50 transition-colors text-sm">
                    <td className="px-4 sm:px-6 py-4">
                      <p className="font-medium text-slate-900">{expense.description}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-[10px] text-slate-400 uppercase font-bold">{
                          expense.category === 'inventory' ? 'Склад' : 
                          expense.category === 'staff' ? 'Персонал' : 'Прочее'
                        }</p>
                        <span className="text-[10px] text-slate-300">•</span>
                        <p className="text-[10px] text-slate-400">
                          {new Date(expense.timestamp).toLocaleDateString([], { day: '2-digit', month: '2-digit' })}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 font-semibold text-rose-600">-{expense.amount} ₽</td>
                  </tr>
                ))}
                {filteredExpenses.length === 0 && (
                  <tr>
                    <td colSpan={2} className="px-6 py-10 text-center text-slate-400 italic">Нет записей о расходах</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
