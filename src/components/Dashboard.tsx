import React, { useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { TrendingUp, Users, RussianRuble, ShoppingBag } from 'lucide-react';
import { Order } from '../types';
import { Card } from './UI';

import { View } from '../types';

interface DashboardProps {
  orders: Order[];
  onNavigate: (view: View) => void;
}

export default function Dashboard({ orders, onNavigate }: DashboardProps) {
  const stats = useMemo(() => {
    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
    const totalGuests = orders.reduce((sum, o) => sum + (o.guests || 0), 0);
    const completedOrders = orders.filter(o => o.status === 'completed').length;
    const avgOrder = orders.length > 0 ? totalRevenue / orders.length : 0;
    
    return [
      { label: 'Выручка', value: `${totalRevenue.toLocaleString()} ₽`, icon: RussianRuble, color: 'text-emerald-600', bg: 'bg-emerald-50', target: 'reports' as View },
      { label: 'Заказы', value: orders.length, icon: ShoppingBag, color: 'text-indigo-600', bg: 'bg-indigo-50', target: 'orders' as View },
      { label: 'Ср. чек', value: `${Math.round(avgOrder).toLocaleString()} ₽`, icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-50', target: 'reports' as View },
      { label: 'Посетители', value: totalGuests, icon: Users, color: 'text-rose-600', bg: 'bg-rose-50', target: 'reports' as View },
    ];
  }, [orders]);

  const chartData = useMemo(() => {
    const hourlyData: Record<string, number> = {};
    
    // Инициализируем часы
    for (let i = 9; i <= 22; i++) {
      const hour = `${i.toString().padStart(2, '0')}:00`;
      hourlyData[hour] = 0;
    }

    orders.filter(o => o.status === 'completed').forEach(order => {
      const date = new Date(order.timestamp);
      const hour = `${date.getHours().toString().padStart(2, '0')}:00`;
      if (hourlyData[hour] !== undefined) {
        hourlyData[hour] += order.total;
      }
    });

    return Object.entries(hourlyData).map(([time, value]) => ({
      time,
      продажи: value
    }));
  }, [orders]);

  const categoryData = useMemo(() => {
    const categories: Record<string, number> = {};
    const excludedDishes = ['борщ', 'цезарь', 'стейк'];
    orders.filter(o => o.status === 'completed').forEach(order => {
      order.items.forEach(item => {
        if (!excludedDishes.some(excluded => item.name.toLowerCase().includes(excluded.toLowerCase()))) {
          categories[item.name] = (categories[item.name] || 0) + item.quantity;
        }
      });
    });

    return Object.entries(categories)
      .map(([name, количество]) => ({ name, количество }))
      .sort((a, b) => b.количество - a.количество)
      .slice(0, 5);
  }, [orders]);

  return (
    <div className="space-y-4 sm:space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, i) => (
          <Card 
            key={i} 
            className="p-6 cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all active:scale-95"
            onClick={() => onNavigate(stat.target)}
          >
            <div className="flex items-center gap-4">
              <div className={stat.bg + " p-3 rounded-xl " + stat.color}>
                <stat.icon size={24} />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
        <Card className="p-4 sm:p-6">
          <h3 className="text-lg font-bold mb-4 sm:mb-6">Динамика продаж</h3>
          <div className="h-64 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: any) => [`${value.toLocaleString()} ₽`, 'Продажи']}
                />
                <Line type="monotone" dataKey="продажи" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4, fill: '#4f46e5' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-4 sm:p-6">
          <h3 className="text-lg font-bold mb-4 sm:mb-6">Популярные блюда</h3>
          <div className="h-64 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="количество" fill="#818cf8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
