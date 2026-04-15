import React, { useState } from 'react';
import { AlertTriangle, Plus, ArrowDown, ArrowUp, X, Edit2 } from 'lucide-react';
import { Ingredient, Expense } from '../types';
import { Card, Button, cn } from './UI';

interface InventoryProps {
  ingredients: Ingredient[];
  setIngredients: React.Dispatch<React.SetStateAction<Ingredient[]>>;
  addExpense: (expense: Expense) => void;
}

export default function Inventory({ ingredients, setIngredients, addExpense }: InventoryProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);
  const [supply, setSupply] = useState({ ingredientId: '', amount: 0, cost: 0 });

  const handleSupply = () => {
    if (!supply.ingredientId || supply.amount <= 0) return;
    
    const ingredient = ingredients.find(i => i.id === supply.ingredientId);
    if (!ingredient) return;

    // Обновляем склад
    setIngredients(prev => prev.map(ing => 
      ing.id === supply.ingredientId 
        ? { ...ing, quantity: Number((ing.quantity + supply.amount).toFixed(3)) } 
        : ing
    ));

    // Добавляем издержку
    addExpense({
      id: Math.random().toString(36).substr(2, 9),
      description: `Поставка: ${ingredient.name} (${supply.amount} ${ingredient.unit})`,
      amount: supply.cost || (ingredient.costPrice * supply.amount),
      category: 'inventory',
      timestamp: Date.now()
    });

    setIsAdding(false);
    setSupply({ ingredientId: '', amount: 0, cost: 0 });
  };

  const handleUpdateIngredient = () => {
    if (!editingIngredient || !editingIngredient.name) return;
    setIngredients(prev => prev.map(ing => ing.id === editingIngredient.id ? editingIngredient : ing));
    setEditingIngredient(null);
  };

  const adjustStock = (id: string, delta: number) => {
    setIngredients(prev => prev.map(ing => 
      ing.id === id ? { ...ing, quantity: Number(Math.max(0, ing.quantity + delta).toFixed(3)) } : ing
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Учёт продуктов</h2>
        <Button onClick={() => setIsAdding(true)}>
          <Plus size={18} />
          Новая поставка
        </Button>
      </div>

      {isAdding && (
        <Card className="p-4 sm:p-6 border-2 border-indigo-100 bg-indigo-50/30">
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <h3 className="text-lg font-bold">Оформление поставки</h3>
            <button onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-slate-600">
              <X size={20} />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Ингредиент</label>
              <select 
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500/20"
                value={supply.ingredientId}
                onChange={e => setSupply({...supply, ingredientId: e.target.value})}
              >
                <option value="">Выберите продукт...</option>
                {ingredients.map(ing => (
                  <option key={ing.id} value={ing.id}>{ing.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Количество</label>
              <input 
                type="number" 
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500/20"
                value={supply.amount}
                onChange={e => setSupply({...supply, amount: Number(e.target.value)})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Стоимость закупки (₽)</label>
              <input 
                type="number" 
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500/20"
                placeholder="Оставьте 0 для авторасчета"
                value={supply.cost}
                onChange={e => setSupply({...supply, cost: Number(e.target.value)})}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setIsAdding(false)}>Отмена</Button>
            <Button onClick={handleSupply}>Принять</Button>
          </div>
        </Card>
      )}

      {editingIngredient && (
        <Card className="p-4 sm:p-6 border-2 border-amber-100 bg-amber-50/30">
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <h3 className="text-lg font-bold">Редактировать продукт</h3>
            <button onClick={() => setEditingIngredient(null)} className="text-slate-400 hover:text-slate-600">
              <X size={20} />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Название</label>
              <input 
                type="text" 
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-amber-500/20"
                value={editingIngredient.name}
                onChange={e => setEditingIngredient({...editingIngredient, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Ед. измерения</label>
              <input 
                type="text" 
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-amber-500/20"
                value={editingIngredient.unit}
                onChange={e => setEditingIngredient({...editingIngredient, unit: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Мин. остаток</label>
              <input 
                type="number" 
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-amber-500/20"
                value={editingIngredient.minStock}
                onChange={e => setEditingIngredient({...editingIngredient, minStock: Number(e.target.value)})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Себестоимость (₽)</label>
              <input 
                type="number" 
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-amber-500/20"
                value={editingIngredient.costPrice}
                onChange={e => setEditingIngredient({...editingIngredient, costPrice: Number(e.target.value)})}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setEditingIngredient(null)}>Отмена</Button>
            <Button onClick={handleUpdateIngredient} className="bg-amber-600 hover:bg-amber-700">Обновить</Button>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {ingredients.map(ing => {
          const isLow = ing.quantity <= ing.minStock;
          return (
            <Card key={ing.id} className={cn(
              "p-4 sm:p-6 border-l-4",
              isLow ? "border-l-red-500" : "border-l-emerald-500"
            )}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-slate-900">{ing.name}</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Себест.: {ing.costPrice} ₽/{ing.unit}</p>
                </div>
                <div className="flex gap-2">
                  {isLow && (
                    <div className="text-red-500 animate-pulse">
                      <AlertTriangle size={20} />
                    </div>
                  )}
                  <button 
                    onClick={() => setEditingIngredient(ing)}
                    className="p-1 text-slate-400 hover:text-indigo-600 transition-colors"
                  >
                    <Edit2 size={16} />
                  </button>
                </div>
              </div>

              <div className="flex items-end justify-between">
                <div>
                  {/* Округление до 2 знаков для корректного отображения веса (фикс проблемы 9.600000000000001) */}
                  <p className="text-3xl font-bold text-slate-900">
                    {Number(ing.quantity.toFixed(2))}
                  </p>
                  <p className="text-xs text-slate-500">Мин. остаток: {ing.minStock}</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => adjustStock(ing.id, -1)}
                    className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                  >
                    <ArrowDown size={16} />
                  </button>
                  <button 
                    onClick={() => adjustStock(ing.id, 1)}
                    className="p-2 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
                  >
                    <ArrowUp size={16} />
                  </button>
                </div>
              </div>

              {isLow && (
                <div className="mt-4 p-2 rounded-lg bg-red-50 text-red-700 text-[10px] font-bold uppercase text-center">
                  Требуется закупка
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

