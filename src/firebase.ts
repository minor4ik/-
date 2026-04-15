import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Инициализация Firebase
const app = initializeApp(firebaseConfig);

// Инициализация Firestore с использованием ID базы данных из конфига
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Инициализация Auth
export const auth = getAuth();
