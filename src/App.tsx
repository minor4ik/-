import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import MenuManager from './components/MenuManager';
import OrderSystem from './components/OrderSystem';
import KitchenView from './components/KitchenView';
import Inventory from './components/Inventory';
import StaffManager from './components/StaffManager';
import Reports from './components/Reports';
import Changelog from './components/Changelog';
import Login from './components/Login';
import { useCafeStore } from './store';
import { View, Staff } from './types';
import { testFirebase } from './testFirebase';

export default function App() {
  const [currentView, setView] = useState<View>(() => {
    const saved = localStorage.getItem('cafe_user');
    if (!saved) return 'dashboard';
    const user = JSON.parse(saved) as Staff;
    const role = user.role || (
      user.position === 'Администратор' ? 'admin' : 
      user.position === 'Повар' ? 'chef' : 
      user.position === 'Официант' ? 'waiter' : 
      user.position === 'Бармен' ? 'bartender' : 
      user.position === 'Тех. Поддержка' ? 'tech' : 
      'other'
    );
    if (role === 'chef' || role === 'bartender') return 'kitchen';
    if (role === 'waiter') return 'orders';
    return 'dashboard';
  });
  const [currentUser, setCurrentUser] = useState<Staff | null>(() => {
    const saved = localStorage.getItem('cafe_user');
    if (!saved) return null;
    const user = JSON.parse(saved) as Staff;
    // Миграция: если роль отсутствует (старая сессия), определяем её по должности
    if (!user.role) {
      if (user.position === 'Администратор') user.role = 'admin';
      else if (user.position === 'Повар') user.role = 'chef';
      else if (user.position === 'Официант') user.role = 'waiter';
      else if (user.position === 'Бармен') user.role = 'bartender';
      else if (user.position === 'Тех. Поддержка') user.role = 'tech';
      else user.role = 'other';
    }
    return user;
  });

  useEffect(() => {
    testFirebase();
  }, []);

  const { 
    dishes, 
    setDishes, 
    ingredients, 
    setIngredients, 
    orders, 
    addOrder, 
    updateOrderStatus,
    staff,
    setStaff,
    expenses,
    addExpense,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    clearNotifications,
    clearOrders
  } = useCafeStore();

  const handleLogin = (user: Staff) => {
    setCurrentUser(user);
    localStorage.setItem('cafe_user', JSON.stringify(user));
    
    // Перенаправляем на доступный раздел при входе
    if (user.role === 'chef' || user.role === 'bartender') setView('kitchen');
    else if (user.role === 'waiter') setView('orders');
    else setView('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('cafe_user');
  };

  if (!currentUser) {
    return <Login onLogin={handleLogin} staff={staff} />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard orders={orders} onNavigate={setView} />;
      case 'menu':
        return <MenuManager dishes={dishes} setDishes={setDishes} />;
      case 'orders':
        return <OrderSystem dishes={dishes} addOrder={addOrder} ingredients={ingredients} />;
      case 'kitchen':
        return <KitchenView orders={orders} updateStatus={updateOrderStatus} dishes={dishes} />;
      case 'inventory':
        return <Inventory ingredients={ingredients} setIngredients={setIngredients} addExpense={addExpense} />;
      case 'staff':
        return <StaffManager staff={staff} setStaff={setStaff} />;
      case 'reports':
        return <Reports orders={orders} expenses={expenses} />;
      case 'changelog':
        return <Changelog />;
      default:
        return <Dashboard orders={orders} onNavigate={setView} />;
    }
  };

  return (
    <Layout 
      currentView={currentView} 
      setView={setView}
      notifications={notifications}
      markNotificationRead={markNotificationRead}
      markAllNotificationsRead={markAllNotificationsRead}
      clearNotifications={clearNotifications}
      onLogout={handleLogout}
      currentUser={currentUser}
    >
      {renderView()}
    </Layout>
  );
}
