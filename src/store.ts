import { useState, useEffect, useRef } from 'react';
import { Dish, Ingredient, Order, Staff, Expense, Notification } from './types';
import { db } from './firebase';
import { doc, setDoc, collection, getDocs, writeBatch, query, orderBy } from 'firebase/firestore';

// Initial Mock Data
const initialStaff: Staff[] = [
  { id: 'admin-main', name: 'Главный Администратор', position: 'Администратор', role: 'admin', phone: '+7 (000) 000-00-00', login: 'AdminVIVT', password: 'AdminVIVT' },
  { id: 'admin-secondary', name: 'Администратор (Резерв)', position: 'Администратор', role: 'admin', phone: '+7 (000) 000-00-01', login: 'qwerty123', password: 'qwerty123' },
  { id: 'teh-admin', name: 'Технический Специалист', position: 'Тех. Администратор', role: 'tech', phone: '+7 (999) 111-11-11', login: 'teh123', password: 'teh123' },
  { id: '1', name: 'Иванов Иван', position: 'Администратор', role: 'admin', phone: '+7 (999) 123-45-67', login: 'admin' },
  { id: '2', name: 'Петров Петр', position: 'Официант', role: 'waiter', phone: '+7 (999) 765-43-21', login: 'waiter1' },
  { id: '3', name: 'Сидоров Сидор', position: 'Повар', role: 'chef', phone: '+7 (999) 000-00-00', login: 'chef1' },
  { id: '4', name: 'Александр Петров', position: 'Бармен', role: 'other', phone: '+7 (961) 302-407-23', login: 'bar' },
];

const initialDishes: Dish[] = [
  { 
    id: '1', 
    name: 'Филадельфия', 
    category: 'Роллы', 
    price: 550, 
    description: 'Классический ролл с лососем и сливочным сыром', 
    available: true, 
    ingredients: [
      { ingredientId: 'i5', amount: 0.15 }, // Рис
      { ingredientId: 'i6', amount: 0.06 }, // Лосось
      { ingredientId: 'i10', amount: 0.04 }, // Сливочный сыр
      { ingredientId: 'i11', amount: 0.02 }  // Нори
    ], 
    prepTime: 12,
    weight: 220
  },
  { 
    id: '2', 
    name: 'Калифорния', 
    category: 'Роллы', 
    price: 480, 
    description: 'Ролл с крабом, авокадо и икрой тобико', 
    available: true, 
    ingredients: [
      { ingredientId: 'i5', amount: 0.15 }, 
      { ingredientId: 'i12', amount: 0.04 }, // Крабовое мясо
      { ingredientId: 'i13', amount: 0.03 }, // Авокадо
      { ingredientId: 'i14', amount: 0.01 }  // Тобико
    ], 
    prepTime: 10,
    weight: 210
  },
  { 
    id: '3', 
    name: 'Маргарита', 
    category: 'Пицца', 
    price: 650, 
    description: 'Классическая пицца с томатами и моцареллой', 
    available: true, 
    ingredients: [
      { ingredientId: 'i7', amount: 0.25 }, // Тесто
      { ingredientId: 'i8', amount: 0.15 }, // Моцарелла
      { ingredientId: 'i15', amount: 0.1 }   // Томатный соус
    ], 
    prepTime: 15,
    weight: 450
  },
  { 
    id: '4', 
    name: 'Пепперони', 
    category: 'Пицца', 
    price: 750, 
    description: 'Острая пицца с колбасками пепперони', 
    available: true, 
    ingredients: [
      { ingredientId: 'i7', amount: 0.25 }, 
      { ingredientId: 'i8', amount: 0.15 }, 
      { ingredientId: 'i9', amount: 0.08 }, // Пепперони
      { ingredientId: 'i15', amount: 0.1 }
    ], 
    prepTime: 15,
    weight: 480
  },
  { 
    id: '5', 
    name: 'Морс Ягодный', 
    category: 'Напитки', 
    price: 150, 
    description: 'Домашний морс из лесных ягод', 
    available: true, 
    ingredients: [
      { ingredientId: 'i16', amount: 0.05 } // Ягоды
    ], 
    prepTime: 2,
    weight: 300
  },
  { 
    id: '6', 
    name: 'Лимонад Классический', 
    category: 'Напитки', 
    price: 200, 
    description: 'Освежающий лимонад с лимоном и мятой', 
    available: true, 
    ingredients: [
      { ingredientId: 'i17', amount: 0.03 }, // Лимон
      { ingredientId: 'i18', amount: 0.005 } // Мята
    ], 
    prepTime: 5,
    weight: 350
  },
  { 
    id: '7', 
    name: 'Мохито Безалкогольный', 
    category: 'Напитки', 
    price: 250, 
    description: 'Классический мохито с лаймом, мятой и содовой', 
    available: true, 
    ingredients: [
      { ingredientId: 'i19', amount: 0.04 }, // Лайм
      { ingredientId: 'i18', amount: 0.01 },  // Мята
      { ingredientId: 'i20', amount: 0.2 }   // Содовая
    ], 
    prepTime: 5,
    weight: 400
  },
  { 
    id: '8', 
    name: 'Апельсиновый сок', 
    category: 'Напитки', 
    price: 180, 
    description: 'Свежевыжатый апельсиновый сок', 
    available: true, 
    ingredients: [
      { ingredientId: 'i21', amount: 0.3 } // Апельсины
    ], 
    prepTime: 3,
    weight: 250
  },
  { 
    id: '9', 
    name: 'Ролл Дракон', 
    category: 'Роллы', 
    price: 680, 
    description: 'Ролл с угрем, авокадо и соусом унаги', 
    available: true, 
    ingredients: [
      { ingredientId: 'i5', amount: 0.15 }, 
      { ingredientId: 'i22', amount: 0.05 }, // Угорь
      { ingredientId: 'i13', amount: 0.03 }, // Авокадо
      { ingredientId: 'i23', amount: 0.01 }  // Соус Унаги
    ], 
    prepTime: 15,
    weight: 240
  },
  { 
    id: '10', 
    name: 'Пицца Четыре Сыра', 
    category: 'Пицца', 
    price: 800, 
    description: 'Пицца с моцареллой, пармезаном, горгонзолой и чеддером', 
    available: true, 
    ingredients: [
      { ingredientId: 'i7', amount: 0.25 }, 
      { ingredientId: 'i8', amount: 0.08 }, // Моцарелла
      { ingredientId: 'i24', amount: 0.04 }, // Пармезан
      { ingredientId: 'i25', amount: 0.04 }, // Горгонзола
      { ingredientId: 'i26', amount: 0.04 }  // Чеддер
    ], 
    prepTime: 15,
    weight: 460
  },
  { 
    id: '11', 
    name: 'Ролл Канада', 
    category: 'Роллы', 
    price: 720, 
    description: 'Премиум ролл с угрем, сливочным сыром и огурцом', 
    available: true, 
    ingredients: [
      { ingredientId: 'i5', amount: 0.15 }, 
      { ingredientId: 'i22', amount: 0.06 }, // Угорь
      { ingredientId: 'i10', amount: 0.04 }, // Сливочный сыр
      { ingredientId: 'i27', amount: 0.02 }, // Огурец
      { ingredientId: 'i23', amount: 0.01 }  // Унаги
    ], 
    prepTime: 15,
    weight: 250
  },
  { 
    id: '12', 
    name: 'Пицца Гавайская', 
    category: 'Пицца', 
    price: 690, 
    description: 'Тропическое сочетание курицы и ананасов', 
    available: true, 
    ingredients: [
      { ingredientId: 'i7', amount: 0.25 }, 
      { ingredientId: 'i8', amount: 0.15 }, 
      { ingredientId: 'i33', amount: 0.1 },  // Курица
      { ingredientId: 'i37', amount: 0.08 }  // Ананас
    ], 
    prepTime: 15,
    weight: 480
  },
  { 
    id: '13', 
    name: 'Пицца Мясная', 
    category: 'Пицца', 
    price: 850, 
    description: 'Сытная пицца с беконом, ветчиной и пепперони', 
    available: true, 
    ingredients: [
      { ingredientId: 'i7', amount: 0.25 }, 
      { ingredientId: 'i8', amount: 0.12 }, 
      { ingredientId: 'i9', amount: 0.05 },  // Пепперони
      { ingredientId: 'i30', amount: 0.06 }, // Ветчина
      { ingredientId: 'i38', amount: 0.05 }  // Бекон
    ], 
    prepTime: 18,
    weight: 520
  },
];

const initialIngredients: Ingredient[] = [
  { id: 'i5', name: 'Рис для суши', unit: 'кг', quantity: 15, minStock: 5, costPrice: 120 },
  { id: 'i6', name: 'Лосось', unit: 'кг', quantity: 5, minStock: 1, costPrice: 1800 },
  { id: 'i7', name: 'Тесто для пиццы', unit: 'кг', quantity: 10, minStock: 3, costPrice: 80 },
  { id: 'i8', name: 'Сыр Моцарелла', unit: 'кг', quantity: 7, minStock: 2, costPrice: 750 },
  { id: 'i9', name: 'Пепперони', unit: 'кг', quantity: 4, minStock: 1, costPrice: 950 },
  { id: 'i10', name: 'Сливочный сыр', unit: 'кг', quantity: 5, minStock: 1, costPrice: 600 },
  { id: 'i11', name: 'Нори', unit: 'уп', quantity: 20, minStock: 5, costPrice: 450 },
  { id: 'i12', name: 'Крабовое мясо', unit: 'кг', quantity: 3, minStock: 1, costPrice: 1200 },
  { id: 'i13', name: 'Авокадо', unit: 'кг', quantity: 2, minStock: 0.5, costPrice: 550 },
  { id: 'i14', name: 'Икра Тобико', unit: 'кг', quantity: 1, minStock: 0.2, costPrice: 2500 },
  { id: 'i15', name: 'Томатный соус', unit: 'кг', quantity: 10, minStock: 2, costPrice: 150 },
  { id: 'i16', name: 'Ягоды замороженные', unit: 'кг', quantity: 5, minStock: 1, costPrice: 400 },
  { id: 'i17', name: 'Лимон', unit: 'кг', quantity: 3, minStock: 1, costPrice: 180 },
  { id: 'i18', name: 'Мята свежая', unit: 'кг', quantity: 0.5, minStock: 0.1, costPrice: 1200 },
  { id: 'i19', name: 'Лайм', unit: 'кг', quantity: 2, minStock: 0.5, costPrice: 450 },
  { id: 'i20', name: 'Содовая', unit: 'л', quantity: 10, minStock: 2, costPrice: 60 },
  { id: 'i21', name: 'Апельсины', unit: 'кг', quantity: 10, minStock: 3, costPrice: 150 },
  { id: 'i22', name: 'Угорь копченый', unit: 'кг', quantity: 2, minStock: 0.5, costPrice: 2800 },
  { id: 'i23', name: 'Соус Унаги', unit: 'кг', quantity: 1, minStock: 0.2, costPrice: 850 },
  { id: 'i24', name: 'Сыр Пармезан', unit: 'кг', quantity: 2, minStock: 0.5, costPrice: 1400 },
  { id: 'i25', name: 'Сыр Горгонзола', unit: 'кг', quantity: 1, minStock: 0.3, costPrice: 1600 },
  { id: 'i26', name: 'Сыр Чеддер', unit: 'кг', quantity: 3, minStock: 0.5, costPrice: 900 },
  { id: 'i27', name: 'Огурцы свежие', unit: 'кг', quantity: 10, minStock: 2, costPrice: 150 },
  { id: 'i28', name: 'Кунжут', unit: 'кг', quantity: 2, minStock: 0.5, costPrice: 450 },
  { id: 'i29', name: 'Тигровые креветки', unit: 'кг', quantity: 3, minStock: 1, costPrice: 1600 },
  { id: 'i30', name: 'Ветчина', unit: 'кг', quantity: 5, minStock: 1, costPrice: 550 },
  { id: 'i31', name: 'Шампиньоны', unit: 'кг', quantity: 4, minStock: 1, costPrice: 350 },
  { id: 'i32', name: 'Болгарский перец', unit: 'кг', quantity: 3, minStock: 1, costPrice: 250 },
  { id: 'i33', name: 'Куриное филе', unit: 'кг', quantity: 8, minStock: 2, costPrice: 450 },
  { id: 'i34', name: 'Соевый соус', unit: 'л', quantity: 10, minStock: 2, costPrice: 200 },
  { id: 'i35', name: 'Имбирь маринованный', unit: 'кг', quantity: 3, minStock: 1, costPrice: 350 },
  { id: 'i36', name: 'Васаби', unit: 'кг', quantity: 1, minStock: 0.2, costPrice: 800 },
  { id: 'i37', name: 'Ананасы консерв.', unit: 'кг', quantity: 3, minStock: 1, costPrice: 280 },
  { id: 'i38', name: 'Бекон', unit: 'кг', quantity: 3, minStock: 1, costPrice: 850 },
  { id: 'i39', name: 'Маслины', unit: 'кг', quantity: 2, minStock: 0.5, costPrice: 400 },
  { id: 'i40', name: 'Лук красный', unit: 'кг', quantity: 2, minStock: 0.5, costPrice: 80 },
];

export function useCafeStore() {
  const [dishes, setDishes] = useState<Dish[]>(() => {
    const saved = localStorage.getItem('cafe_dishes');
    return saved ? JSON.parse(saved) : initialDishes;
  });

  const [ingredients, setIngredients] = useState<Ingredient[]>(() => {
    const saved = localStorage.getItem('cafe_ingredients');
    return saved ? JSON.parse(saved) : initialIngredients;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('cafe_orders');
    return saved ? JSON.parse(saved) : [];
  });

  const [staff, setStaff] = useState<Staff[]>(() => {
    const saved = localStorage.getItem('cafe_staff');
    return saved ? JSON.parse(saved) : initialStaff;
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem('cafe_expenses');
    return saved ? JSON.parse(saved) : [];
  });

  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem('cafe_notifications');
    return saved ? JSON.parse(saved) : [];
  });

  const lastSavedRef = useRef<number>(Date.now());

  // Функция для сохранения данных в Firebase
  const saveToFirebase = async () => {
    try {
      console.log('Начало автосохранения в Firebase...');
      const batch = writeBatch(db);

      // Сохранение блюд
      dishes.forEach(dish => {
        batch.set(doc(db, 'dishes', dish.id), dish);
      });

      // Сохранение ингредиентов
      ingredients.forEach(ing => {
        batch.set(doc(db, 'ingredients', ing.id), ing);
      });

      // Сохранение заказов
      orders.forEach(order => {
        batch.set(doc(db, 'orders', order.id), order);
      });

      // Сохранение персонала
      staff.forEach(member => {
        batch.set(doc(db, 'staff', member.id), member);
      });

      // Сохранение издержек
      expenses.forEach(expense => {
        batch.set(doc(db, 'expenses', expense.id), expense);
      });

      await batch.commit();
      lastSavedRef.current = Date.now();
      console.log('Автосохранение успешно завершено');
    } catch (error) {
      console.error('Ошибка при автосохранении в Firebase:', error);
    }
  };

  // Эффект для локального сохранения и запуска таймера автосохранения
  useEffect(() => {
    localStorage.setItem('cafe_dishes', JSON.stringify(dishes));
    localStorage.setItem('cafe_ingredients', JSON.stringify(ingredients));
    localStorage.setItem('cafe_orders', JSON.stringify(orders));
    localStorage.setItem('cafe_staff', JSON.stringify(staff));
    localStorage.setItem('cafe_expenses', JSON.stringify(expenses));
    localStorage.setItem('cafe_notifications', JSON.stringify(notifications));

    // Настройка интервала автосохранения (2 минуты)
    const interval = setInterval(() => {
      saveToFirebase();
    }, 2 * 60 * 1000);

    return () => clearInterval(interval);
  }, [dishes, ingredients, orders, staff, expenses]);

  // Загрузка данных из Firebase при инициализации
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('🔄 Загрузка из Firestore...');
        
        // Загрузка блюд
        const dishesSnap = await getDocs(collection(db, 'dishes'));
        if (!dishesSnap.empty) {
          let loadedDishes = dishesSnap.docs.map(d => d.data() as Dish);
          
          // Принудительно убираем Борщ, Цезарь, Стейк, если они остались в БД
          const forbiddenNames = ['Борщ', 'Цезарь', 'Стейк'];
          const filteredLoaded = loadedDishes.filter(d => !forbiddenNames.includes(d.name));
          
          if (filteredLoaded.length !== loadedDishes.length) {
            console.log('🧹 Обнаружены удаленные блюда в БД, очищаем...');
            const batch = writeBatch(db);
            dishesSnap.docs.forEach(docSnap => {
              const data = docSnap.data() as Dish;
              if (forbiddenNames.includes(data.name)) {
                batch.delete(docSnap.ref);
              }
            });
            await batch.commit();
            loadedDishes = filteredLoaded;
          }

          // Проверка на наличие новых блюд
          const missingDishes = initialDishes.filter(initial => 
            !loadedDishes.some(loaded => loaded.id === initial.id)
          );

          if (missingDishes.length > 0) {
            console.log(`📝 Добавляем ${missingDishes.length} новых блюд в Firestore...`);
            for (const item of missingDishes) {
              await setDoc(doc(db, 'dishes', item.id), item);
            }
            const finalDishes = [...loadedDishes, ...missingDishes];
            setDishes(finalDishes);
          } else {
            setDishes(loadedDishes);
          }
          console.log('✅ Блюда загружены и синхронизированы');
        } else {
          console.log('📝 Сохраняем начальные блюда в Firestore...');
          for (const item of initialDishes) {
            await setDoc(doc(db, 'dishes', item.id), item);
          }
          setDishes(initialDishes);
          console.log('✅ Блюда сохранены в Firestore');
        }

        // Загрузка ингредиентов
        const ingSnap = await getDocs(collection(db, 'ingredients'));
        if (!ingSnap.empty) {
          const loadedIng = ingSnap.docs.map(d => d.data() as Ingredient);
          
          // Проверка на наличие новых ингредиентов из initialIngredients, которых нет в БД
          const missingIng = initialIngredients.filter(initial => 
            !loadedIng.some(loaded => loaded.id === initial.id)
          );

          if (missingIng.length > 0) {
            console.log(`📝 Добавляем ${missingIng.length} новых ингредиентов в Firestore...`);
            for (const item of missingIng) {
              await setDoc(doc(db, 'ingredients', item.id), item);
            }
            const finalIng = [...loadedIng, ...missingIng];
            setIngredients(finalIng);
          } else {
            setIngredients(loadedIng);
          }
          console.log('✅ Ингредиенты загружены и синхронизированы');
        } else {
          console.log('📝 Сохраняем начальные ингредиенты в Firestore...');
          for (const item of initialIngredients) {
            await setDoc(doc(db, 'ingredients', item.id), item);
          }
          setIngredients(initialIngredients);
          console.log('✅ Ингредиенты сохранены в Firestore');
        }

        // Загрузка персонала
        const staffSnap = await getDocs(collection(db, 'staff'));
        if (!staffSnap.empty) {
          const loadedStaff = staffSnap.docs.map(d => d.data() as Staff);
          
          // Проверка на наличие новых сотрудников из initialStaff, которых нет в БД
          const missingStaff = initialStaff.filter(initial => 
            !loadedStaff.some(loaded => loaded.login === initial.login)
          );

          if (missingStaff.length > 0) {
            console.log(`📝 Добавляем ${missingStaff.length} новых сотрудников в Firestore...`);
            for (const item of missingStaff) {
              await setDoc(doc(db, 'staff', item.id), item);
            }
            const finalStaff = [...loadedStaff, ...missingStaff];
            setStaff(finalStaff);
          } else {
            setStaff(loadedStaff);
          }
          console.log('✅ Персонал загружен и синхронизирован');
        } else {
          console.log('📝 Сохраняем начальный персонал в Firestore...');
          for (const item of initialStaff) {
            await setDoc(doc(db, 'staff', item.id), item);
          }
          setStaff(initialStaff);
          console.log('✅ Персонал сохранен в Firestore');
        }

        // Загрузка заказов
        const ordersSnap = await getDocs(collection(db, 'orders'));
        if (!ordersSnap.empty) {
          const loadedOrders = ordersSnap.docs.map(d => d.data() as Order);
          setOrders(loadedOrders);
          console.log('✅ Заказы загружены из Firestore');
        }

        // Загрузка расходов
        const expensesSnap = await getDocs(query(collection(db, 'expenses'), orderBy('timestamp', 'desc')));
        if (!expensesSnap.empty) {
          const loadedExpenses = expensesSnap.docs.map(d => d.data() as Expense);
          setExpenses(loadedExpenses);
          console.log('✅ Расходы загружены из Firestore');
        }

        console.log('🎉 Все данные успешно синхронизированы с Firestore');
      } catch (error: any) {
        console.error('❌ Ошибка Firestore:', error.code, error.message);
        console.log('📂 Используются локальные данные (localStorage)');
      }
    };
    loadData();
  }, []);

  const addNotification = (notif: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotif: Notification = {
      ...notif,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const clearOrders = async () => {
    setOrders([]);
    localStorage.removeItem('cafe_orders');
    try {
      const ordersSnap = await getDocs(collection(db, 'orders'));
      const batch = writeBatch(db);
      ordersSnap.docs.forEach(d => {
        batch.delete(d.ref);
      });
      await batch.commit();
      console.log('История заказов очищена в Firestore');
    } catch (error) {
      console.error('Ошибка при очистке истории заказов:', error);
    }
  };

  const addOrder = (order: Order) => {
    const orderWithNumber: Order = {
      ...order,
      orderNumber: `${(orders.length + 1).toString().padStart(4, '0')}`
    };
    setOrders(prev => [orderWithNumber, ...prev]);
    
    addNotification({
      title: 'Новый заказ',
      message: `Поступил заказ №${orderWithNumber.orderNumber} для стола №${order.tableNumber} на сумму ${order.total} ₽`,
      type: 'order',
      targetRoles: ['admin', 'chef', 'bartender', 'waiter']
    });

    // Deduct ingredients
    setIngredients(prev => prev.map(ing => {
      let usedAmount = 0;
      order.items.forEach(item => {
        const dish = dishes.find(d => d.id === item.dishId);
        const recipeItem = dish?.ingredients.find(ri => ri.ingredientId === ing.id);
        if (recipeItem) {
          usedAmount += recipeItem.amount * item.quantity;
        }
      });
      const newQuantity = Number(Math.max(0, ing.quantity - usedAmount).toFixed(3));
      if (newQuantity <= ing.minStock && ing.quantity > ing.minStock) {
        addNotification({
          title: 'Критический остаток',
          message: `Продукт "${ing.name}" заканчивается. Остаток: ${newQuantity} ${ing.unit}`,
          type: 'inventory',
          targetRoles: ['admin', 'chef', 'bartender']
        });
      }
      return { ...ing, quantity: newQuantity };
    }));
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders(prev => {
      const updated = prev.map(o => o.id === orderId ? { ...o, status } : o);
      const order = updated.find(o => o.id === orderId);
      if (order) {
        let statusText = '';
        switch(status) {
          case 'cooking': statusText = 'начал готовиться'; break;
          case 'ready': statusText = 'готов к выдаче'; break;
          case 'completed': statusText = 'завершен'; break;
          case 'cancelled': statusText = 'отменен'; break;
        }
        addNotification({
          title: 'Статус заказа изменен',
          message: `Заказ для стола №${order.tableNumber} ${statusText}`,
          type: 'status',
          targetRoles: ['admin', 'chef', 'bartender', 'waiter']
        });
      }
      return updated;
    });
  };

  const addExpense = (expense: Expense) => {
    setExpenses(prev => [expense, ...prev]);
    addNotification({
      title: 'Новый расход',
      message: `Зарегистрирован расход: ${expense.description} на сумму ${expense.amount} ₽`,
      type: 'inventory',
      targetRoles: ['admin', 'chef', 'bartender']
    });
  };

  return {
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
  };
}
