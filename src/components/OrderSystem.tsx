import React, { useState } from 'react';
import { Plus, Minus, ShoppingCart, Trash2 } from 'lucide-react';
import { Dish, OrderItem, Order, Ingredient } from '../types';
import { Card, Button } from './UI';

interface OrderSystemProps {
  dishes: Dish[];
  addOrder: (order: Order) => void;
  ingredients: Ingredient[];
}

export default function OrderSystem({ dishes, addOrder, ingredients }: OrderSystemProps) {
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [tableNumber, setTableNumber] = useState(1);

  const addToCart = (dish: Dish) => {
    setCart(prev => {
      const existing = prev.find(item => item.dishId === dish.id);
      if (existing) {
        return prev.map(item => 
          item.dishId === dish.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { dishId: dish.id, name: dish.name, quantity: 1, price: dish.price }];
    });
  };

  const removeFromCart = (dishId: string) => {
    setCart(prev => prev.filter(item => item.dishId !== dishId));
  };

  const updateQuantity = (dishId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.dishId === dishId) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
  const guests = Math.min(4, totalQuantity);

  const handleCheckout = () => {
    if (cart.length === 0) return;
    
    const newOrder: Order = {
      id: Math.random().toString(36).substr(2, 9),
      orderNumber: '', // Будет сгенерирован в store
      tableNumber,
      items: [...cart],
      status: 'pending',
      timestamp: Date.now(),
      total,
      guests
    };

    addOrder(newOrder);
    setCart([]);
    alert('Заказ успешно создан!');
  };

  return (
    <div className="flex flex-col lg:grid lg:grid-cols-3 gap-8">
      {/* Cart / Order Summary - Shown first on mobile */}
      <div className="order-1 lg:order-2 space-y-4 sm:space-y-6">
        <h2 className="text-xl font-bold">Текущий заказ</h2>
        <Card className="flex flex-col h-[400px] lg:h-[600px]">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
                <ShoppingCart size={48} strokeWidth={1.5} />
                <p>Заказ пуст</p>
              </div>
            ) : (
              cart.map(item => (
                <div key={item.dishId} className="flex items-center justify-between gap-4 p-3 rounded-xl bg-slate-50">
                  <div className="flex-1">
                    <p className="font-bold text-sm text-slate-900">{item.name}</p>
                    <p className="text-xs text-indigo-600 font-medium">{item.price * item.quantity} ₽</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); updateQuantity(item.dishId, -1); }}
                      className="w-6 h-6 rounded-md bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                    <button 
                      onClick={(e) => { e.stopPropagation(); updateQuantity(item.dishId, 1); }}
                      className="w-6 h-6 rounded-md bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50"
                    >
                      <Plus size={12} />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); removeFromCart(item.dishId); }}
                      className="ml-2 text-slate-400 hover:text-red-500"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-6 border-t border-slate-100 bg-slate-50/50 space-y-4">
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center text-sm text-slate-500">
                <span>Посетителей:</span>
                <span className="font-bold">{guests} чел.</span>
              </div>
              <div className="flex justify-between items-center text-lg">
                <span className="font-medium text-slate-500">Итого:</span>
                <span className="font-bold text-2xl text-slate-900">{total} ₽</span>
              </div>
            </div>
            <Button 
              className="w-full py-4 text-lg" 
              disabled={cart.length === 0}
              onClick={handleCheckout}
            >
              Оформить заказ
            </Button>
          </div>
        </Card>
      </div>

      {/* Menu Selection - Shown second on mobile */}
      <div className="order-2 lg:order-1 lg:col-span-2 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Выбор блюд</h2>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-slate-500">Стол №</span>
            <input 
              type="number" 
              min="1" 
              className="w-16 px-2 py-1 rounded-lg border border-slate-200 text-center font-bold"
              value={tableNumber}
              onChange={(e) => setTableNumber(parseInt(e.target.value))}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {dishes.map(dish => (
            <Card key={dish.id} className="p-4 flex flex-col justify-between hover:border-indigo-200 transition-colors cursor-pointer group" onClick={() => addToCart(dish)}>
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{dish.name}</h3>
                  <span className="text-indigo-600 font-bold">{dish.price} ₽</span>
                </div>
                <p className="text-sm text-slate-500 line-clamp-2 mb-2">{dish.description}</p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {dish.ingredients.map(ing => {
                    const ingredient = ingredients.find(i => i.id === ing.ingredientId);
                    return ingredient ? (
                      <span key={ing.ingredientId} className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded">
                        {ingredient.name}
                      </span>
                    ) : null;
                  })}
                </div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[10px] font-bold text-indigo-500 uppercase">Вес: {dish.weight}г</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">~{dish.prepTime} мин</span>
                </div>
              </div>
              <Button variant="secondary" className="w-full group-hover:bg-indigo-600 group-hover:text-white transition-all">
                <Plus size={16} />
                Добавить
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
