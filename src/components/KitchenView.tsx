import React from 'react';
import { Clock, CheckCircle2, Play, Check, ChefHat } from 'lucide-react';
import { Order, Dish } from '../types';
import { Card, Button, cn } from './UI';

interface KitchenViewProps {
  orders: Order[];
  updateStatus: (id: string, status: Order['status']) => void;
  dishes: Dish[];
}

export default function KitchenView({ orders, updateStatus, dishes }: KitchenViewProps) {
  const activeOrders = orders.filter(o => ['pending', 'cooking', 'ready'].includes(o.status));

  const getEstimatedTime = (order: Order) => {
    let maxTime = 0;
    order.items.forEach(item => {
      const dish = dishes.find(d => d.id === item.dishId);
      if (dish && dish.prepTime > maxTime) {
        maxTime = dish.prepTime;
      }
    });
    // Добавляем по 2 минуты за каждое дополнительное блюдо в заказе
    return maxTime + (order.items.length - 1) * 2;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
      {activeOrders.map(order => (
        <Card key={order.id} className={cn(
          "flex flex-col border-t-4",
          order.status === 'pending' ? "border-t-amber-400" : 
          order.status === 'cooking' ? "border-t-indigo-500" : "border-t-emerald-500"
        )}>
          <div className="p-4 border-b border-slate-100 flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg">Стол №{order.tableNumber}</h3>
                {order.guests > 0 && (
                  <span className="text-xs text-slate-400 font-medium">({order.guests} чел.)</span>
                )}
                <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                  #{order.orderNumber || '----'}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Clock size={12} />
                  {new Date(order.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                {order.status !== 'ready' && (
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-500 uppercase">
                    <Clock size={10} />
                    Ожидание: ~{getEstimatedTime(order)} мин
                  </div>
                )}
              </div>
            </div>
            <span className={cn(
              "px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider",
              order.status === 'pending' ? "bg-amber-100 text-amber-700" : 
              order.status === 'cooking' ? "bg-indigo-100 text-indigo-700" : "bg-emerald-100 text-emerald-700"
            )}>
              {order.status === 'pending' ? 'Ожидает' : 
               order.status === 'cooking' ? 'Готовится' : 'Готово'}
            </span>
          </div>

          <div className="flex-1 p-4 space-y-3">
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between items-start">
                <div className="flex gap-2">
                  <span className="font-bold text-indigo-600">{item.quantity}x</span>
                  <span className="text-sm font-medium text-slate-700">{item.name}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-100">
            {order.status === 'pending' && (
              <Button className="w-full" onClick={() => updateStatus(order.id, 'cooking')}>
                <Play size={16} fill="currentColor" />
                Начать готовить
              </Button>
            )}
            {order.status === 'cooking' && (
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700" onClick={() => updateStatus(order.id, 'ready')}>
                <CheckCircle2 size={16} />
                Готово
              </Button>
            )}
            {order.status === 'ready' && (
              <Button variant="secondary" className="w-full" onClick={() => updateStatus(order.id, 'completed')}>
                <Check size={16} />
                Выдано
              </Button>
            )}
          </div>
        </Card>
      ))}

      {activeOrders.length === 0 && (
        <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-400 space-y-4">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center">
            <ChefHat size={40} strokeWidth={1.5} />
          </div>
          <p className="text-lg font-medium">Нет активных заказов на кухне</p>
        </div>
      )}
    </div>
  );
}
