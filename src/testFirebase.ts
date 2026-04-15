import { db } from './firebase';
import { doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';

export const testFirebase = async () => {
  try {
    console.log('🔄 Тестирование соединения с Firestore...');
    
    // Попытка записи
    const testRef = doc(db, 'system_test', 'connection_check');
    const testData = { 
      timestamp: Date.now(), 
      message: 'Проверка связи с Кафе Мастер' 
    };
    
    await setDoc(testRef, testData);
    console.log('✅ Запись в Firestore успешна');
    
    // Попытка чтения
    const snapshot = await getDoc(testRef);
    if (snapshot.exists()) {
      console.log('✅ Чтение из Firestore успешно:', snapshot.data());
    }
    
    // Очистка теста
    await deleteDoc(testRef);
    console.log('🧹 Тестовые данные удалены');
    
    return true;
  } catch (error: any) {
    console.error('❌ Ошибка Firestore:', error.code, error.message);
    if (error.code === 'permission-denied') {
      console.error('🔒 Ошибка доступа: Проверьте firestore.rules или авторизацию');
    }
    return false;
  }
};
