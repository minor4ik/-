import React, { useState } from 'react';
import { Users, Plus, Trash2, Edit2, X } from 'lucide-react';
import { Staff } from '../types';
import { Card, Button, cn } from './UI';

interface StaffManagerProps {
  staff: Staff[];
  setStaff: React.Dispatch<React.SetStateAction<Staff[]>>;
}

export default function StaffManager({ staff, setStaff }: StaffManagerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingMember, setEditingMember] = useState<Staff | null>(null);
  const [newMember, setNewMember] = useState<Partial<Staff>>({
    name: '',
    position: 'Официант',
    role: 'waiter',
    phone: '',
    login: ''
  });

  const handleAdd = () => {
    if (!newMember.name || !newMember.login) return;
    const member: Staff = {
      id: Math.random().toString(36).substr(2, 9),
      name: newMember.name!,
      position: newMember.position!,
      role: newMember.role as any || 'waiter',
      phone: newMember.phone || '',
      login: newMember.login!,
      password: newMember.password || ''
    };
    setStaff(prev => [...prev, member]);
    setIsAdding(false);
    setNewMember({ name: '', position: 'Официант', role: 'waiter', phone: '', login: '' });
  };

  const handleUpdate = () => {
    if (!editingMember || !editingMember.name || !editingMember.login) return;
    setStaff(prev => prev.map(s => s.id === editingMember.id ? editingMember : s));
    setEditingMember(null);
  };

  const deleteMember = (id: string) => {
    setStaff(prev => prev.filter(s => s.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Управление персоналом</h2>
        <Button onClick={() => setIsAdding(true)}>
          <Plus size={18} />
          Добавить сотрудника
        </Button>
      </div>

      {isAdding && (
        <Card className="p-4 sm:p-6 border-2 border-indigo-100 bg-indigo-50/30">
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <h3 className="text-lg font-bold">Новый сотрудник</h3>
            <button onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-slate-600">
              <X size={20} />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">ФИО</label>
              <input 
                type="text" 
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500/20"
                value={newMember.name}
                onChange={e => setNewMember({...newMember, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Должность</label>
              <select 
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500/20"
                value={newMember.position}
                onChange={e => {
                  const pos = e.target.value;
                  let role = 'other';
                  if (pos === 'Администратор') role = 'admin';
                  else if (pos === 'Повар') role = 'chef';
                  else if (pos === 'Официант') role = 'waiter';
                  else if (pos === 'Бармен') role = 'bartender';
                  else if (pos === 'Тех. Администратор') role = 'tech';
                  setNewMember({...newMember, position: pos, role: role as any});
                }}
              >
                <option>Администратор</option>
                <option>Официант</option>
                <option>Повар</option>
                <option>Бармен</option>
                <option>Тех. Администратор</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Телефон</label>
              <input 
                type="text" 
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500/20"
                value={newMember.phone}
                onChange={e => setNewMember({...newMember, phone: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Логин</label>
              <input 
                type="text" 
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500/20"
                value={newMember.login}
                onChange={e => setNewMember({...newMember, login: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Пароль</label>
              <input 
                type="password" 
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500/20"
                value={newMember.password || ''}
                onChange={e => setNewMember({...newMember, password: e.target.value})}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setIsAdding(false)}>Отмена</Button>
            <Button onClick={handleAdd}>Сохранить</Button>
          </div>
        </Card>
      )}

      {editingMember && (
        <Card className="p-4 sm:p-6 border-2 border-amber-100 bg-amber-50/30">
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <h3 className="text-lg font-bold">Редактировать сотрудника</h3>
            <button onClick={() => setEditingMember(null)} className="text-slate-400 hover:text-slate-600">
              <X size={20} />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">ФИО</label>
              <input 
                type="text" 
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-amber-500/20"
                value={editingMember.name}
                onChange={e => setEditingMember({...editingMember, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Должность</label>
              <select 
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-amber-500/20"
                value={editingMember.position}
                onChange={e => {
                  const pos = e.target.value;
                  let role = 'other';
                  if (pos === 'Администратор') role = 'admin';
                  else if (pos === 'Повар') role = 'chef';
                  else if (pos === 'Официант') role = 'waiter';
                  else if (pos === 'Бармен') role = 'bartender';
                  else if (pos === 'Тех. Администратор') role = 'tech';
                  setEditingMember({...editingMember, position: pos, role: role as any});
                }}
              >
                <option>Администратор</option>
                <option>Официант</option>
                <option>Повар</option>
                <option>Бармен</option>
                <option>Тех. Администратор</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Телефон</label>
              <input 
                type="text" 
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-amber-500/20"
                value={editingMember.phone}
                onChange={e => setEditingMember({...editingMember, phone: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Логин</label>
              <input 
                type="text" 
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-amber-500/20"
                value={editingMember.login}
                onChange={e => setEditingMember({...editingMember, login: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Пароль</label>
              <input 
                type="password" 
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-amber-500/20"
                value={editingMember.password || ''}
                onChange={e => setEditingMember({...editingMember, password: e.target.value})}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setEditingMember(null)}>Отмена</Button>
            <Button onClick={handleUpdate} className="bg-amber-600 hover:bg-amber-700">Обновить</Button>
          </div>
        </Card>
      )}

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-4 sm:px-6 py-4 text-sm font-semibold text-slate-600">ФИО</th>
                <th className="px-4 sm:px-6 py-4 text-sm font-semibold text-slate-600">Должность</th>
                <th className="px-4 sm:px-6 py-4 text-sm font-semibold text-slate-600 hidden sm:table-cell">Телефон</th>
                <th className="px-4 sm:px-6 py-4 text-sm font-semibold text-slate-600 hidden md:table-cell">Логин</th>
                <th className="px-4 sm:px-6 py-4 text-sm font-semibold text-slate-600 text-right">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {staff.map((member) => {
                const getPositionStyles = (position: string) => {
                  switch (position) {
                    case 'Администратор':
                      return 'bg-purple-100 text-purple-700 border-purple-200';
                    case 'Повар':
                      return 'bg-orange-100 text-orange-700 border-orange-200';
                    case 'Официант':
                      return 'bg-blue-100 text-blue-700 border-blue-200';
                    case 'Бармен':
                      return 'bg-emerald-100 text-emerald-700 border-emerald-200';
                    case 'Тех. Администратор':
                    case 'Тех. Поддержка':
                      return 'bg-red-100 text-red-700 border-red-200';
                    default:
                      return 'bg-slate-100 text-slate-700 border-slate-200';
                  }
                };

                return (
                  <tr key={member.id} className="hover:bg-slate-50/50 transition-colors text-sm sm:text-base">
                    <td className="px-4 sm:px-6 py-4 font-medium text-slate-900">{member.name}</td>
                    <td className="px-4 sm:px-6 py-4">
                      <span className={cn(
                        "px-2.5 py-1 rounded-full border text-[11px] font-bold uppercase tracking-wider",
                        getPositionStyles(member.position)
                      )}>
                        {member.position}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-slate-600 hidden sm:table-cell">{member.phone}</td>
                    <td className="px-4 sm:px-6 py-4 text-slate-600 hidden md:table-cell font-mono text-xs">{member.login}</td>
                    <td className="px-4 sm:px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => setEditingMember(member)}
                          className="p-2 text-slate-400 hover:text-indigo-600 transition-colors bg-white rounded-lg border border-slate-100 shadow-sm"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => deleteMember(member.id)}
                          className="p-2 text-slate-400 hover:text-red-600 transition-colors bg-white rounded-lg border border-slate-100 shadow-sm"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
