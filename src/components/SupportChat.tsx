import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, X, User, Bot, ShieldCheck, Minimize2, Star, CheckCircle2, Headphones, Archive } from 'lucide-react';
import { Staff, Message, Role, ChatSession } from '../types';
import { cn } from './UI';
import { db } from '../firebase';
import { collection, addDoc, onSnapshot, query, orderBy, limit, doc, setDoc, updateDoc, where, getDoc } from 'firebase/firestore';

interface SupportChatProps {
  currentUser: Staff;
}

const FAQ_RESPONSES: Record<string, string> = {
  'как создать заказ': 'Чтобы создать заказ, перейдите в раздел "Заказы", выберите блюда и нажмите "Оформить заказ".',
  'как изменить статус': 'Статус заказа меняется в разделе "Кухня". Нажмите "Начать готовить" или "Готово".',
  'забыл пароль': 'Для сброса пароля обратитесь к главному администратору.',
  'привет': 'Здравствуйте, какой у вас вопрос?',
  'здравствуйте': 'Здравствуйте, какой у вас вопрос?',
  'как дела': 'Я всего лишь бот, но готов помочь вам с работой в системе!',
  'помощь': 'Я могу помочь с заказами, складом или персоналом. Просто опишите вашу проблему.',
};

const INACTIVITY_TIMEOUT = 10 * 60 * 1000; // 10 minutes

export default function SupportChat({ currentUser }: SupportChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [rating, setRating] = useState<number>(0);
  const [showArchive, setShowArchive] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isAdmin = currentUser.role === 'admin';
  const isTech = currentUser.role === 'tech';
  const mySessionId = currentUser.id;

  // Listen for messages
  useEffect(() => {
    const q = query(
      collection(db, 'messages'),
      orderBy('timestamp', 'asc'),
      limit(200)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs: Message[] = [];
      snapshot.forEach((doc) => {
        msgs.push({ id: doc.id, ...doc.data() } as Message);
      });
      setMessages(msgs);
      setTimeout(scrollToBottom, 100);
    });

    return () => unsubscribe();
  }, []);

  // Listen for sessions
  useEffect(() => {
    let q;
    if (isAdmin) {
      // Admins see all active sessions (operator, tech) or closed if showArchive is true
      q = query(collection(db, 'chatSessions'), where('status', 'in', showArchive ? ['closed'] : ['operator', 'tech']));
    } else if (isTech) {
      // Tech support see sessions assigned to them
      q = query(collection(db, 'chatSessions'), where('status', '==', 'tech'));
    } else {
      // Users see only theirs
      q = query(collection(db, 'chatSessions'), where('id', '==', mySessionId));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const sess: ChatSession[] = [];
      snapshot.forEach((doc) => {
        sess.push({ id: doc.id, ...doc.data() } as ChatSession);
      });
      setSessions(sess);
      
      if (!isAdmin && !isTech && sess.length > 0) {
        setActiveSessionId(mySessionId);
      }
    });

    return () => unsubscribe();
  }, [isAdmin, isTech, mySessionId, showArchive]);

  // Inactivity check (for users)
  useEffect(() => {
    if (isAdmin || isTech) return;

    const interval = setInterval(async () => {
      const sessionDoc = await getDoc(doc(db, 'chatSessions', mySessionId));
      if (sessionDoc.exists()) {
        const data = sessionDoc.data() as ChatSession;
        if ((data.status === 'operator' || data.status === 'tech') && Date.now() - data.lastActivity > INACTIVITY_TIMEOUT) {
          await updateDoc(doc(db, 'chatSessions', mySessionId), {
            status: 'bot',
            lastActivity: Date.now()
          });
          
          await addDoc(collection(db, 'messages'), {
            senderId: 'system',
            senderName: 'Система',
            senderRole: 'other',
            text: 'Чат переведен обратно на бота из-за неактивности.',
            timestamp: Date.now(),
            isBot: true,
            targetUserId: mySessionId
          });
        }
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [isAdmin, isTech, mySessionId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const currentSession = sessions.find(s => s.id === (isAdmin || isTech ? activeSessionId : mySessionId));

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const text = inputText.trim();
    const targetId = (isAdmin || isTech) ? activeSessionId : mySessionId;
    
    const userMessage = {
      senderId: currentUser.id,
      senderName: isAdmin ? 'Команда Кафе Мастер' : (isTech ? 'Техническая Поддержка Кафе' : currentUser.name),
      senderRole: currentUser.role,
      text: text,
      timestamp: Date.now(),
      isBot: false,
      targetUserId: targetId
    };

    try {
      await addDoc(collection(db, 'messages'), userMessage);
      setInputText('');

      if (targetId) {
        await setDoc(doc(db, 'chatSessions', targetId), {
          id: targetId,
          userName: (isAdmin || isTech) ? (currentSession?.userName || 'Пользователь') : currentUser.name,
          status: currentSession?.status || 'bot',
          lastActivity: Date.now()
        }, { merge: true });
      }

      if (!isAdmin && !isTech && (!currentSession || currentSession.status === 'bot')) {
        const lowerText = text.toLowerCase();
        
        if (lowerText === 'позови оператора') {
          await setDoc(doc(db, 'chatSessions', mySessionId), {
            id: mySessionId,
            userName: currentUser.name,
            status: 'operator',
            lastActivity: Date.now()
          });

          await addDoc(collection(db, 'notifications'), {
            id: Math.random().toString(36).substr(2, 9),
            title: 'Новый запрос в чат',
            message: `Сотрудник ${currentUser.name} ожидает ответа оператора`,
            type: 'chat',
            timestamp: Date.now(),
            read: false,
            targetRoles: ['admin']
          });

          setTimeout(async () => {
            await addDoc(collection(db, 'messages'), {
              senderId: 'system',
              senderName: 'Система',
              senderRole: 'other',
              text: 'Вы были переведены на оператора, оператор ответит в течении небольшого времени как освободится',
              timestamp: Date.now(),
              isBot: true,
              targetUserId: mySessionId
            });
          }, 500);
        } else {
          let found = false;
          for (const [key, value] of Object.entries(FAQ_RESPONSES)) {
            if (lowerText.includes(key)) {
              setTimeout(async () => {
                await addDoc(collection(db, 'messages'), {
                  senderId: 'bot',
                  senderName: 'Бот-помощник',
                  senderRole: 'other',
                  text: value,
                  timestamp: Date.now(),
                  isBot: true,
                  targetUserId: mySessionId
                });
              }, 1000);
              found = true;
              break;
            }
          }
          
          if (!found) {
            setTimeout(async () => {
              await addDoc(collection(db, 'messages'), {
                senderId: 'bot',
                senderName: 'Бот-помощник',
                senderRole: 'other',
                text: 'Извините, я не понял ваш вопрос. Попробуйте переформулировать или напишите "позови оператора".',
                timestamp: Date.now(),
                isBot: true,
                targetUserId: mySessionId
              });
            }, 1000);
          }
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleCloseChat = async () => {
    if (!activeSessionId) return;
    await updateDoc(doc(db, 'chatSessions', activeSessionId), {
      status: 'closed',
      lastActivity: Date.now()
    });
    
    await addDoc(collection(db, 'messages'), {
      senderId: 'system',
      senderName: 'Система',
      senderRole: 'other',
      text: 'Чат закрыт оператором. Пожалуйста, оцените качество обслуживания.',
      timestamp: Date.now(),
      isBot: true,
      targetUserId: activeSessionId
    });
    
    if (isAdmin || isTech) setActiveSessionId(null);
  };

  const handleTransferToTech = async () => {
    if (!activeSessionId) return;
    await updateDoc(doc(db, 'chatSessions', activeSessionId), {
      status: 'tech',
      lastActivity: Date.now()
    });

    await addDoc(collection(db, 'notifications'), {
      id: Math.random().toString(36).substr(2, 9),
      title: 'Перевод на тех. поддержку',
      message: `Чат пользователя ${currentSession?.userName} переведен на вас`,
      type: 'chat',
      timestamp: Date.now(),
      read: false,
      targetRoles: ['tech']
    });

    await addDoc(collection(db, 'messages'), {
      senderId: 'system',
      senderName: 'Система',
      senderRole: 'other',
      text: 'Вы были переведены на Технического специалиста, ожидайте ответа.',
      timestamp: Date.now(),
      isBot: true,
      targetUserId: activeSessionId
    });

    if (isAdmin) setActiveSessionId(null);
  };

  const handleRate = async (value: number) => {
    setRating(value);
    await updateDoc(doc(db, 'chatSessions', mySessionId), {
      rating: value,
      status: 'bot'
    });
    
    await addDoc(collection(db, 'messages'), {
      senderId: 'system',
      senderName: 'Система',
      senderRole: 'other',
      text: `Спасибо за вашу оценку: ${value} звезд!`,
      timestamp: Date.now(),
      isBot: true,
      targetUserId: mySessionId
    });
  };

  const filteredMessages = messages.filter(m => 
    m.senderId === 'bot' || 
    m.senderId === 'system' || 
    ((isAdmin || isTech) ? (m.targetUserId === activeSessionId || m.senderId === activeSessionId) : (m.targetUserId === mySessionId || m.senderId === mySessionId))
  );

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 w-14 h-14 rounded-full bg-indigo-600 text-white shadow-2xl flex items-center justify-center hover:scale-110 transition-all z-[100] group",
          isOpen && "scale-0 opacity-0"
        )}
      >
        <MessageCircle size={28} />
        {(isAdmin || isTech) && sessions.length > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white text-[10px] flex items-center justify-center font-bold">
            {sessions.length}
          </span>
        )}
      </button>

      <div className={cn(
        "fixed bottom-6 right-6 w-[350px] sm:w-[500px] h-[600px] bg-white rounded-2xl shadow-2xl border border-slate-100 flex z-[100] transition-all duration-300 origin-bottom-right overflow-hidden",
        !isOpen && "scale-0 opacity-0 pointer-events-none"
      )}>
        {/* Sidebar for Admins/Tech */}
        {(isAdmin || isTech) && (
          <div className="w-1/3 border-r border-slate-100 bg-slate-50 flex flex-col">
            <div className="p-4 border-b border-slate-100 bg-white flex items-center justify-between">
              <h3 className="font-bold text-[10px] text-slate-400 uppercase tracking-wider">
                {showArchive ? 'Архив' : 'Активные'}
              </h3>
              {isAdmin && (
                <button 
                  onClick={() => setShowArchive(!showArchive)}
                  className={cn("p-1.5 rounded-lg transition-colors", showArchive ? "bg-indigo-100 text-indigo-600" : "text-slate-400 hover:bg-slate-200")}
                  title={showArchive ? "Вернуться к активным" : "Показать архив"}
                >
                  <Archive size={14} />
                </button>
              )}
            </div>
            <div className="flex-1 overflow-y-auto">
              {sessions.length === 0 ? (
                <div className="p-4 text-center text-slate-400 text-[10px]">Нет {showArchive ? 'архивных' : 'активных'} чатов</div>
              ) : (
                sessions.map(s => (
                  <button
                    key={s.id}
                    onClick={() => setActiveSessionId(s.id)}
                    className={cn(
                      "w-full p-3 text-left hover:bg-white transition-colors border-b border-slate-100",
                      activeSessionId === s.id && "bg-white border-l-4 border-l-indigo-600"
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-bold text-xs text-slate-900 truncate">{s.userName}</p>
                      {s.status === 'tech' && <Headphones size={10} className="text-red-500" />}
                    </div>
                    <p className="text-[9px] text-slate-500">
                      {new Date(s.lastActivity).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="p-4 bg-indigo-600 text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                {isAdmin ? <ShieldCheck size={24} /> : (isTech ? <Headphones size={24} /> : <Bot size={24} />)}
              </div>
              <div>
                <h3 className="font-bold text-sm truncate">
                  {(isAdmin || isTech) ? (activeSessionId ? sessions.find(s => s.id === activeSessionId)?.userName : 'Выберите чат') : 'Поддержка'}
                </h3>
                <p className="text-[10px] text-indigo-100 uppercase font-bold tracking-wider">
                  {isAdmin ? 'Администратор' : (isTech ? 'Тех. Поддержка' : (currentSession?.status === 'operator' || currentSession?.status === 'tech' ? 'Специалист на связи' : 'Бот-помощник'))}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {isAdmin && activeSessionId && !showArchive && (
                <>
                  <button 
                    onClick={handleTransferToTech}
                    title="Перевести на тех. поддержку"
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors text-indigo-100 hover:text-white"
                  >
                    <Headphones size={18} />
                  </button>
                  <button 
                    onClick={handleCloseChat}
                    title="Закрыть чат"
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors text-indigo-100 hover:text-white"
                  >
                    <CheckCircle2 size={18} />
                  </button>
                </>
              )}
              {isTech && activeSessionId && (
                <button 
                  onClick={handleCloseChat}
                  title="Закрыть чат"
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors text-indigo-100 hover:text-white"
                >
                  <CheckCircle2 size={18} />
                </button>
              )}
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <Minimize2 size={18} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
            {(isAdmin || isTech) && !activeSessionId ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center p-8">
                <MessageCircle size={48} className="mb-4 opacity-20" />
                <p className="text-sm">Выберите {showArchive ? 'архивную' : 'активную'} сессию в списке слева</p>
              </div>
            ) : (
              <>
                {filteredMessages.map((msg) => {
                  const isMe = msg.senderId === currentUser.id;
                  const isSystem = msg.senderId === 'system';
                  const isTechMsg = msg.senderRole === 'tech';
                  
                  return (
                    <div key={msg.id} className={cn(
                      "flex flex-col",
                      isMe ? "items-end" : "items-start"
                    )}>
                      <div className={cn(
                        "max-w-[85%] rounded-2xl p-3 text-sm shadow-sm",
                        isMe 
                          ? "bg-indigo-600 text-white rounded-tr-none" 
                          : isSystem
                            ? "bg-slate-200 text-slate-600 text-center mx-auto rounded-lg text-xs"
                            : isTechMsg
                              ? "bg-red-50 border border-red-100 text-slate-800 rounded-tl-none"
                              : msg.senderRole === 'admin'
                                ? "bg-amber-50 border border-amber-100 text-slate-800 rounded-tl-none"
                                : "bg-white border border-slate-200 text-slate-800 rounded-tl-none"
                      )}>
                        {!isMe && !isSystem && (
                          <p className={cn(
                            "text-[10px] font-bold uppercase mb-1",
                            isTechMsg ? "text-red-600" : (msg.senderRole === 'admin' ? "text-amber-600" : "text-slate-400")
                          )}>
                            {msg.senderName}
                          </p>
                        )}
                        <p className="leading-relaxed">{msg.text}</p>
                        {!isSystem && (
                          <p className={cn(
                            "text-[9px] mt-1 text-right opacity-60",
                            isMe ? "text-indigo-100" : "text-slate-400"
                          )}>
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}

                {!isAdmin && !isTech && currentSession?.status === 'closed' && rating === 0 && (
                  <div className="bg-white border-2 border-indigo-100 rounded-2xl p-6 text-center space-y-4 animate-in fade-in slide-in-from-bottom-4">
                    <p className="font-bold text-slate-900">Оцените качество ответа</p>
                    <div className="flex justify-center gap-2">
                      {[1, 2, 3, 4, 5].map((val) => (
                        <button
                          key={val}
                          onClick={() => handleRate(val)}
                          className="p-2 hover:scale-125 transition-transform text-amber-400"
                        >
                          <Star size={24} fill={rating >= val ? "currentColor" : "none"} />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-slate-100">
            <div className="relative">
              <input
                type="text"
                disabled={((isAdmin || isTech) && !activeSessionId) || (currentSession?.status === 'closed' && !isAdmin)}
                placeholder={((isAdmin || isTech) && !activeSessionId) ? "Выберите чат..." : "Напишите сообщение..."}
                className="w-full pl-4 pr-12 py-3 bg-slate-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all disabled:opacity-50"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
              <button
                type="submit"
                disabled={!inputText.trim() || ((isAdmin || isTech) && !activeSessionId) || (currentSession?.status === 'closed' && !isAdmin)}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-indigo-600 text-white rounded-lg flex items-center justify-center hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors"
              >
                <Send size={16} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
