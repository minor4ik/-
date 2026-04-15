import React from 'react';
import { History, CheckCircle2, Rocket, Zap, Bug } from 'lucide-react';
import { Card } from './UI';

/**
 * Интерфейс для записи в журнале обновлений
 * @version - Номер версии (например, v 1.0)
 * @date - Дата выпуска обновления
 * @type - Тип изменения: feature (новое), fix (исправление), update (обновление)
 * @changes - Список конкретных изменений
 */
interface LogEntry {
  version: string;
  date: string;
  type: 'feature' | 'fix' | 'update';
  changes: string[];
}

/**
 * Статический массив данных с историей изменений системы.
 * Каждая запись соответствует новой версии приложения.
 */
const logs: LogEntry[] = [
  {
    version: 'v 1.3',
    date: '15.04.2026',
    type: 'feature',
    changes: [
      'Реализован чат поддержки с ботом-помощником и переключением на оператора',
      'Добавлена система оценки качества обслуживания по 5-балльной шкале',
      'Внедрена ролевая модель для Бармена: доступ к заказам, кухне и складу',
      'Умная фильтрация уведомлений: персонал видит только релевантные их роли события',
      'Автоматический возврат чата к боту при неактивности пользователя более 10 минут',
      'Оптимизирована статистика: из графика популярных блюд исключены неактуальные позиции'
    ]
  },
  {
    version: 'v 1.2',
    date: '14.04.2026',
    type: 'feature',
    changes: [
      'Внедрена система учета издержек и расчета себестоимости',
      'Обновлено меню: добавлены роллы «Канада», «Дракон», пиццы «Гавайская», «Мясная»',
      'Расширен склад: добавлены огурцы, кунжут, креветки, ветчина, грибы, ананасы и др.',
      'Система уведомлений: колокольчик с оповещениями о заказах и статусах',
      'Редактирование данных: добавлена возможность изменять блюда, персонал и продукты',
      'Интерактивный дашборд: карточки выручки, заказов и др. стали кликабельными для быстрого перехода',
      'История заказов: добавлена нумерация чеков (#0001) и возможность полной очистки истории',
      'Реализован фильтр по датам в разделе "Отчеты"',
      'Добавлено расчетное время ожидания заказа на кухне',
      'График динамики продаж теперь строится на реальных данных',
      'Добавлен блок "Популярные блюда" на главную панель',
      'Обновлена иконка валюты на российский рубль (₽)',
      'Добавлен раздел "Журнал обновлений"'
    ]
  },
  {
    version: 'v 1.1',
    date: '13.04.2026',
    type: 'feature',
    changes: [
      'Добавлен модуль управления персоналом',
      'Реализована расширенная аналитика и отчетность',
      'Исправлена точность отображения веса продуктов на складе',
      'Улучшена навигация и переименованы разделы статистики'
    ]
  },
  {
    version: 'v 1.0',
    date: '13.04.2026',
    type: 'feature',
    changes: [
      'Первый релиз системы Кафе Мастер AIS',
      'Базовая система заказов и управления столами',
      'Кухонный монитор для поваров',
      'Управление меню и складской учет'
    ]
  }
];

/**
 * Компонент Changelog: Визуализирует историю обновлений системы в виде таймлайна.
 * Используется для информирования пользователей о новых функциях и исправлениях.
 */
export default function Changelog() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
          <History size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Журнал обновлений</h2>
          <p className="text-slate-500 text-sm">История изменений и новых функций системы</p>
        </div>
      </div>

      <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
        {logs.map((log, index) => (
          <div key={log.version} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            {/* Icon */}
            <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-100 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
              {log.type === 'feature' && <Rocket size={18} className="text-indigo-600" />}
              {log.type === 'fix' && <Bug size={18} className="text-red-500" />}
              {log.type === 'update' && <Zap size={18} className="text-amber-500" />}
            </div>
            
            {/* Content */}
            <Card className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <div className="font-bold text-slate-900 text-lg">{log.version}</div>
                <time className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
                  {log.date}
                </time>
              </div>
              <ul className="space-y-2">
                {log.changes.map((change, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                    <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                    <span>{change}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}
