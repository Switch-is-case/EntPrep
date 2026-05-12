# UNT Prep AI

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

**🌐 Тіл / Язык / Language:** 
[🇰🇿 Қазақша](#қазақша) • 
[🇷🇺 Русский](#русский) • 
[🇬🇧 English](#english)

---

## Қазақша

### 📋 Жоба сипаттамасы

**UNT Prep AI** — бұл Қазақстандағы Ұлттық Бірыңғай Тестілеуге (ҰБТ) тиімді дайындалуға арналған инновациялық білім беру платформасы. Жоба заманауи веб-технологиялар мен жасанды интеллект мүмкіндіктерін біріктіріп, дербес оқу процесін жасайды.

Жүйенің негізгі мақсаты — студенттерге бейімделген тестілеу арқылы білімдегі олқылықтарды анықтауға және дайындықтың оңтайлы жолын ұсынуға көмектесу. ЖИ пайдалану жаңа оқу материалдарын автоматты түрде генерациялауға және жеке "оқу карталарын" (roadmaps) құруға мүмкіндік береді, бұл дайындық белсенділігі мен нәтижелілігін айтарлықтай арттырады.

Жоба жоғары балл жинауға және еліміздің жетекші жоғары оқу орындарына түсуге ұмтылатын мектеп түлектеріне арналған, оларға нақты уақыт режимінде прогресті бақылау, өзін-өзі тексеру және тәжірибе жинау құралдарын ұсынады.

### ✨ Негізгі мүмкіндіктер

#### Студенттерге арналған:
- **Тіркелу және профиль**: Email арқылы міндетті верификациямен қауіпсіз авторизация.
- **Диагностикалық тестілеу**: Таңдалған пәндер бойынша білім деңгейін жылдам бағалау.
- **Сынақ емтиханы**: Уақыт шектеулері мен тест құрылымын сақтай отырып, нақты ҰБТ-ны толық имитациялау.
- **Тақырыптық тәжірибе**: Материалды бекіту үшін нақты тақырыптар мен пәндерді пысықтау мүмкіндігі.
- **AI Roadmap**: OpenAI көмегімен тест нәтижелері негізінде дербес оқу жоспарын құру.
- **Прогресс аналитикасы**: Ұпайлар бойынша егжей-тегжейлі статистика, оқу динамикасы және барлық әрекеттер тарихы.
- **Мультітілділік**: Интерфейстің қазақ, орыс және ағылшын тілдерінде (RU/KZ/EN) толық қолдауы.

#### Әкімшілерге арналған:
- **Пайдаланушыларды басқару**: Аккаунттарды модерациялау, бұғаттау (ban) функциялары және қолжетімділік құқықтарын басқару.
- **Контент-менеджмент**: Сұрақтар үшін толық CRUD, математикалық формулалар үшін LaTeX қолдауы және суреттерді жүктеу.
- **ЖИ құралдары**: Нейрондық желілердің көмегімен берілген тақырыптар бойынша жаңа сұрақтарды генерациялау.
- **Жаппай импорт**: JSON файлдары арқылы деректер базасын жылдам толтыру.
- **ЖОО басқару**: Мамандық таңдауға көмектесу үшін университеттер мен білім беру бағдарламаларының деректер базасы.
- **Әрекеттер журналы**: Әкімшілердің барлық әрекеттерін қадағалау (audit logs) және белсенді сессияларды бақылау.

### 🛠 Технологиялар

#### Frontend
- **Next.js 16** (App Router) — React үшін серверлік рендерингі бар заманауи фреймворк.
- **React 19** — пайдаланушы интерфейстерін құруға арналған кітапхана.
- **TypeScript** (strict mode) — кодтың сенімділігін қамтамасыз ету үшін типтеу.
- **Tailwind CSS** — премиум дизайн жасауға арналған утилитарлық CSS-фреймворк.
- **Recharts** — деректерді және прогресті графиктер түрінде визуализациялау.
- **Lucide React** — заманауи белгішелер жиынтығы.

#### Backend
- **Next.js API Routes** — Next.js аясындағы серверлік логика.
- **Drizzle ORM** — дерекқормен жұмыс істеуге арналған өнімді және типті қауіпсіз құрал.
- **Neon PostgreSQL** — бұлттық Serverless дерекқор.
- **Upstash Redis** — кэштеу, сұраныстарды шектеу (rate limiting) және сессиялар.
- **JOSE** — Edge Runtime үшін оңтайландырылған JWT токендерімен жұмыс.
- **bcryptjs** — құпия сөздерді сенімді хеширлеу.

#### AI және Сервистер
- **OpenAI API** (GPT-4o) — сұрақтарды, түсіндірмелерді және оқу жоспарларын генерациялау.
- **Nodemailer / SMTP** — верификация хаттарын жіберуге арналған сервис.

#### DevOps
- **Vercel** — хостинг және CI/CD платформасы.
- **Drizzle Kit** — дерекқор миграцияларын басқару.

### 🏗 Архитектура

Жоба **Clean Architecture** принциптеріне негізделген, бұл қолдаудың қарапайымдылығы мен масштабталуын қамтамасыз етеді:

```
┌─────────────────────────────────────────┐
│  UI қабаты (React Components / Pages)   │
├─────────────────────────────────────────┤
│  API қабаты (Next.js Route Handlers)    │
├─────────────────────────────────────────┤
│  Сервис қабаты (Business Logic)         │
├─────────────────────────────────────────┤
│  Repository қабаты (Data Access)        │
├─────────────────────────────────────────┤
│  Дерекқор қабаты (PostgreSQL+Drizzle)   │
└─────────────────────────────────────────┘
```

#### Ключевые архитектурные решения:

- **Dependency Injection**: Басқаруды инверсиялау үшін тәуелділіктер контейнерін (`src/lib/container.ts`) пайдалану.
- **Repository Pattern**: Нақты дерекқордан тәуелсіздік үшін деректерге қолжетімділікті абстракциялау.
- **Service Pattern**: Бизнес-логиканы сервистерде орталықтандыру.
- **Edge Middleware**: CDN деңгейінде маршруттарды қорғау және авторизацияны тексеру.
- **Session Versioning**: Пайдаланушы бұғатталған кезде сессияларды дереу қайтарып алу механизмі.
- **Audit Logging**: Әкімшілердің барлық маңызды әрекеттерін автоматты түрде жазу.

### 📁 Жоба құрылымы

```
src/
├── app/                    # Next.js маршруттау
│   ├── api/               # API эндпоинттері
│   ├── admin/             # Админ-панель беттері
│   ├── (student)/         # Студенттік интерфейс беттері
│   └── layout.tsx         # Негізгі шаблон
├── components/            # React компоненттері
│   ├── admin/            # Админкаға арналған компоненттер
│   ├── ui/               # Базалық UI элементтері
│   └── shared/           # Ортақ компоненттер
├── services/             # Бизнес-логика қабаты (Services)
├── repositories/         # Деректерге қолжетімділік қабаты (Repositories)
├── lib/                  # Утилиталар мен конфигурациялар
│   ├── auth-checks.ts   # Edge үшін авторизация тексерулері
│   ├── auth.ts          # JWT және сессия логикасы
│   ├── container.ts     # DI Контейнері
│   ├── i18n.ts          # Локализация жүйесі
│   └── ratelimit.ts     # Сұраныстар жиілігін шектеу
├── db/
│   ├── schema.ts        # Дерекқор схемасы (Drizzle)
│   └── migrations/      # SQL миграциялары
├── hooks/                # Кастомдық React хуктары
├── domain/              # Домендік типтер мен интерфейстер
└── middleware.ts        # Edge Middleware (Auth & Security)
```

### 🚀 Орнату және іске қосу

#### Талаптар
- Node.js 20+ 
- npm немесе pnpm
- PostgreSQL дерекқоры (Neon ұсынылады)
- Redis (Upstash ұсынылады)
- Пошта жіберуге арналған SMTP сервері
- OpenAI API Key

#### Орнату қадамдары

1. **Репозиторийді клондау**
```bash
git clone [your-repo-url]
cd ent-prep-development-plan
```

2. **Тәуелділіктерді орнату**
```bash
npm install
```

3. **Ортаны баптау**
```bash
cp .env.example .env
# .env файлын ашып, қажетті айнымалыларды толтырыңыз
```

4. **Дерекқорды дайындау**
```bash
npx drizzle-kit push
```

5. **Әкімші аккаунтын құру**
Сайттағы форма арқылы тіркеліп, bootstrap-скриптін пайдаланыңыз:
```bash
curl -X POST http://localhost:3000/api/admin/make-admin \
  -H "Content-Type: application/json" \
  -d '{"secret":"your-bootstrap-secret","email":"your-email@example.com"}'
```

6. **Әзірлеу режимінде іске қосу**
```bash
npm run dev
```

Қосымша [http://localhost:3000](http://localhost:3000) мекенжайы бойынша қолжетімді болады.

### 🧪 Тестілеу

```bash
npm test              # Барлық тесттерді іске қосу
npm run typecheck     # TypeScript типтерін тексеру
npm run lint          # Код стилін тексеру
```

### 🔐 Қауіпсіздік

- ✅ **JWT Auth**: Токендер қорғалған `httpOnly` кукилерінде сақталады.
- ✅ **Password Hashing**: Оңтайлы күрделілік факторы бар bcryptjs пайдалану.
- ✅ **Rate Limiting**: Upstash Redis арқылы brute-force шабуылдарынан қорғау.
- ✅ **Edge Protection**: Бет коды орындалмай тұрып Middleware-де құқықтарды тексеру.
- ✅ **Audit Logs**: Жүйедегі барлық өзгерістерді қадағалау.
- ✅ **XSS/SQLi Protection**: React және Drizzle ORM пайдалану есебінен қамтамасыз етіледі.
- ✅ **Email Verification**: Тестілеуге тек поштаны растағаннан кейін қол жеткізу.

### 🌍 Локализация

Қосымша үш тілді қолдайды:
- 🇰🇿 **Қазақша**
- 🇷🇺 **Русский**
- 🇬🇧 **English**

Аудармалар `src/lib/i18n.ts` орталықтандырылған файлы арқылы іске асырылған, бұл бетті қайта жүктемей-ақ жылдам ауысуды қамтамасыз етеді.

### 👨‍💻 Автор

**Сейтқазы Казыбек**
**Байдильдаев Бақдаулет**
Software Engineering факультетінің студенті
Astana IT University
2026

**Научный руководитель:** Динара Каибасова Женисбековна

[⬆ Жоғарыға оралу](#unt-prep-ai)

---

## Русский

### 📋 Описание проекта

**UNT Prep AI** — это инновационная образовательная платформа, разработанная для эффективной подготовки абитуриентов к Единому Национальному Тестированию (ЕНТ) в Казахстане. Проект объединяет современные веб-технологии и возможности искусственного интеллекта для создания персонализированного процесса обучения.

Основная цель системы — помочь студентам выявить пробелы в знаниях с помощью адаптивного тестирования и предложить оптимальный путь подготовки. Использование ИИ позволяет автоматически генерировать новые учебные материалы и строить индивидуальные "карты развития" (roadmaps), что значительно повышает вовлеченность и результативность подготовки.

Проект ориентирован на выпускников школ, стремящихся к получению высоких баллов и поступлению в ведущие вузы страны, предоставляя им инструменты для практики, самоконтроля и мониторинга прогресса в режиме реального времени.

### ✨ Основные возможности

#### Для студентов:
- **Регистрация и профиль**: Безопасная авторизация с обязательной верификацией через email.
- **Диагностическое тестирование**: Быстрая оценка текущего уровня знаний по выбранным предметам.
- **Пробный экзамен**: Полная имитация реального ЕНТ с соблюдением временных лимитов и структуры тестов.
- **Тематическая практика**: Возможность отработки конкретных тем и предметов для закрепления материала.
- **AI Roadmap**: Генерация персонального плана обучения на основе результатов тестов с использованием OpenAI.
- **Аналитика прогресса**: Детальная статистика по баллам, динамика обучения и история всех попыток.
- **Мультиязычность**: Полная поддержка интерфейса на казахском, русском и английском языках (RU/KZ/EN).

#### Для администраторов:
- **Управление пользователями**: Модерация аккаунтов, функции блокировки (ban) и управление правами доступа.
- **Контент-менеджмент**: Полноценный CRUD для вопросов, поддержка LaTeX для математических формул и загрузка изображений.
- **Инструменты ИИ**: Генерация новых вопросов по заданным темам с помощью нейросетей.
- **Массовый импорт**: Быстрое наполнение базы данных через JSON-файлы.
- **Управление ВУЗами**: База данных университетов и образовательных программ для помощи в выборе профессии.
- **Журнал действий**: Трассировка всех действий администраторов (audit logs) и мониторинг активных сессий.

### 🛠 Технологии

#### Frontend
- **Next.js 16** (App Router) — современный фреймворк для React с серверным рендерингом.
- **React 19** — библиотека для построения пользовательских интерфейсов.
- **TypeScript** (strict mode) — типизация для обеспечения надежности кода.
- **Tailwind CSS** — утилитарный CSS-фреймворк для создания премиального дизайна.
- **Recharts** — визуализация данных и прогресса в виде графиков.
- **Lucide React** — набор современных иконок.

#### Backend
- **Next.js API Routes** — серверная логика в рамках Next.js.
- **Drizzle ORM** — производительный и типобезопасный инструмент для работы с БД.
- **Neon PostgreSQL** — облачная Serverless база данных.
- **Upstash Redis** — кэширование, ограничение запросов (rate limiting) и сессии.
- **JOSE** — работа с JWT токенами, оптимизированная для Edge Runtime.
- **bcryptjs** — надежное хеширование паролей.

#### AI и Сервисы
- **OpenAI API** (GPT-4o) — генерация вопросов, объяснений и планов обучения.
- **Nodemailer / SMTP** — сервис для отправки писем верификации.

#### DevOps
- **Vercel** — платформа для хостинга и CI/CD.
- **Drizzle Kit** — управление миграциями базы данных.

### 🏗 Архитектура

Проект построен на принципах **Clean Architecture**, что обеспечивает легкость поддержки и масштабируемость:

```
┌─────────────────────────────────────────┐
│  UI Layer (React Components / Pages)    │
├─────────────────────────────────────────┤
│  API Layer (Next.js Route Handlers)     │
├─────────────────────────────────────────┤
│  Service Layer (Business Logic)         │
├─────────────────────────────────────────┤
│  Repository Layer (Data Access)         │
├─────────────────────────────────────────┤
│  Database Layer (PostgreSQL + Drizzle)  │
└─────────────────────────────────────────┘
```

#### Ключевые архитектурные решения:

- **Dependency Injection**: Использование контейнера зависимостей (`src/lib/container.ts`) для инверсии управления.
- **Repository Pattern**: Абстракция доступа к данным для независимости от конкретной БД.
- **Service Pattern**: Централизация бизнес-логики в сервисах.
- **Edge Middleware**: Защита маршрутов и проверка авторизации на уровне CDN.
- **Session Versioning**: Механизм мгновенного отзыва сессий при блокировке пользователя.
- **Audit Logging**: Автоматическая запись всех критических действий администраторов.

### 📁 Структура проекта

```
src/
├── app/                    # Маршрутизация Next.js
│   ├── api/               # API эндпоинты
│   ├── admin/             # Страницы админ-панели
│   ├── (student)/         # Страницы студенческого интерфейса
│   └── layout.tsx         # Корневой шаблон
├── components/            # React компоненты
│   ├── admin/            # Компоненты для админки
│   ├── ui/               # Базовые UI элементы
│   └── shared/           # Общие компоненты
├── services/             # Слой бизнес-логики (Services)
├── repositories/         # Слой доступа к данным (Repositories)
├── lib/                  # Утилиты и конфигурации
│   ├── auth-checks.ts   # Проверки авторизации для Edge
│   ├── auth.ts          # Логика JWT и сессий
│   ├── container.ts     # DI Контейнер
│   ├── i18n.ts          # Система локализации
│   └── ratelimit.ts     # Ограничение частоты запросов
├── db/
│   ├── schema.ts        # Схема базы данных (Drizzle)
│   └── migrations/      # SQL миграции
├── hooks/                # Кастомные React хуки
├── domain/              # Доменные типы и интерфейсы
└── middleware.ts        # Edge Middleware (Auth & Security)
```

### 🚀 Установка и запуск

#### Требования
- Node.js 20+ 
- npm или pnpm
- База данных PostgreSQL (рекомендуется Neon)
- Redis (рекомендуется Upstash)
- SMTP сервер для отправки почты
- OpenAI API Key

#### Шаги установки

1. **Клонирование репозитория**
```bash
git clone [your-repo-url]
cd ent-prep-development-plan
```

2. **Установка зависимостей**
```bash
npm install
```

3. **Настройка окружения**
```bash
cp .env.example .env
# Откройте .env и заполните необходимые переменные
```

4. **Подготовка базы данных**
```bash
npx drizzle-kit push
```

5. **Создание учетной записи администратора**
Зарегистрируйтесь через форму на сайте, затем используйте bootstrap-скрипт:
```bash
curl -X POST http://localhost:3000/api/admin/make-admin \
  -H "Content-Type: application/json" \
  -d '{"secret":"your-bootstrap-secret","email":"your-email@example.com"}'
```

6. **Запуск в режиме разработки**
```bash
npm run dev
```

Приложение будет доступно по адресу [http://localhost:3000](http://localhost:3000)

### 🧪 Тестирование

```bash
npm test              # Запуск всех тестов
npm run typecheck     # Проверка типов TypeScript
npm run lint          # Проверка стиля кода
```

### 🔐 Безопасность

- ✅ **JWT Auth**: Токены хранятся в защищенных `httpOnly` куках.
- ✅ **Password Hashing**: Использование bcryptjs с оптимальным фактором сложности.
- ✅ **Rate Limiting**: Защита от brute-force атак через Upstash Redis.
- ✅ **Edge Protection**: Проверка прав доступа в Middleware до выполнения кода страницы.
- ✅ **Audit Logs**: Трассировка всех изменений в системе.
- ✅ **XSS/SQLi Protection**: Обеспечивается за счет использования React и Drizzle ORM.
- ✅ **Email Verification**: Доступ к тестированию только после подтверждения почты.

### 🌍 Локализация

Приложение поддерживает три языка:
- 🇰🇿 **Қазақша**
- 🇷🇺 **Русский**
- 🇬🇧 **English**

Переводы реализованы через централизованный файл `src/lib/i18n.ts`, обеспечивая мгновенное переключение без перезагрузки страницы.

### 👨‍💻 Автор

**Сейтқазы Казыбек**
**Байдильдаев Бақдаулет**
Студент факультета Software Engineering
Astana IT University
2026

**Научный руководитель:** Динара Каибасова Женисбековна

[⬆ Вернуться наверх](#unt-prep-ai)

---

## English

### 📋 Project Description

**UNT Prep AI** is an innovative educational platform designed for effective preparation for the Unified National Testing (UNT) in Kazakhstan. The project combines modern web technologies and artificial intelligence to create a personalized learning experience.

The main goal of the system is to help students identify knowledge gaps through adaptive testing and suggest the optimal preparation path. Using AI allows for automatic generation of new learning materials and construction of individual "roadmaps", significantly increasing engagement and preparation effectiveness.

The project is aimed at school graduates striving for high scores and admission to the country's leading universities, providing them with tools for practice, self-control, and real-time progress monitoring.

### ✨ Key Features

#### For Students:
- **Registration & Profile**: Secure authorization with mandatory email verification.
- **Diagnostic Testing**: Quick assessment of current knowledge in selected subjects.
- **Mock Exam**: Full simulation of the real UNT with time limits and test structure.
- **Practice Mode**: Topic-specific practice for better retention.
- **AI Roadmap**: Personalized study plans generated by OpenAI based on test results.
- **Progress Analytics**: Detailed score statistics, learning dynamics, and full history.
- **Multilingual Support**: Full interface support in Kazakh, Russian, and English (RU/KZ/EN).

#### For Administrators:
- **User Management**: Account moderation, banning, and access control.
- **Content Management**: Full CRUD for questions, LaTeX support for math formulas, and image uploads.
- **AI Tools**: AI-powered generation of new questions based on given topics.
- **Bulk Import**: Mass data loading via JSON files.
- **University Guide**: Database of universities and educational programs to assist in career choice.
- **Audit Logs**: Tracking of all administrator actions and active session monitoring.

### 🛠 Tech Stack

#### Frontend
- **Next.js 16** (App Router) — Modern React framework with server-side rendering.
- **React 19** — Library for building user interfaces.
- **TypeScript** (strict mode) — Typing for code reliability.
- **Tailwind CSS** — Utility-first CSS framework for premium design.
- **Recharts** — Data and progress visualization via charts.
- **Lucide React** — Set of modern icons.

#### Backend
- **Next.js API Routes** — Server logic within Next.js.
- **Drizzle ORM** — Performant and type-safe tool for database interaction.
- **Neon PostgreSQL** — Cloud Serverless database.
- **Upstash Redis** — Caching, rate limiting, and sessions.
- **JOSE** — JWT token handling optimized for Edge Runtime.
- **bcryptjs** — Secure password hashing.

#### AI & Services
- **OpenAI API** (GPT-4o) — Generation of questions, explanations, and study plans.
- **Nodemailer / SMTP** — Service for sending verification emails.

#### DevOps
- **Vercel** — Platform for hosting and CI/CD.
- **Drizzle Kit** — Database migration management.

### 🏗 Architecture

The project is built on **Clean Architecture** principles, ensuring ease of maintenance and scalability:

```
┌─────────────────────────────────────────┐
│  UI Layer (React Components / Pages)    │
├─────────────────────────────────────────┤
│  API Layer (Next.js Route Handlers)     │
├─────────────────────────────────────────┤
│  Service Layer (Business Logic)         │
├─────────────────────────────────────────┤
│  Repository Layer (Data Access)         │
├─────────────────────────────────────────┤
│  Database Layer (PostgreSQL + Drizzle)  │
└─────────────────────────────────────────┘
```

#### Key Architectural Decisions:

- **Dependency Injection**: Using a dependency container (`src/lib/container.ts`) for inversion of control.
- **Repository Pattern**: Data access abstraction for database independence.
- **Service Pattern**: Centralization of business logic in services.
- **Edge Middleware**: Route protection and auth checks at the CDN level.
- **Session Versioning**: Instant session revocation mechanism when a user is banned.
- **Audit Logging**: Automatic recording of all critical administrator actions.

### 📁 Project Structure

```
src/
├── app/                    # Next.js Routing
│   ├── api/               # API endpoints
│   ├── admin/             # Admin panel pages
│   ├── (student)/         # Student interface pages
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── admin/            # Admin-specific components
│   ├── ui/               # Base UI elements
│   └── shared/           # Shared components
├── services/             # Business logic layer (Services)
├── repositories/         # Data access layer (Repositories)
├── lib/                  # Utilities and configurations
│   ├── auth-checks.ts   # Edge-safe auth checks
│   ├── auth.ts          # JWT and session logic
│   ├── container.ts     # DI Container
│   ├── i18n.ts          # Localization system
│   └── ratelimit.ts     # Rate limiting
├── db/
│   ├── schema.ts        # Database schema (Drizzle)
│   └── migrations/      # SQL migrations
├── hooks/                # Custom React hooks
├── domain/              # Domain types and interfaces
└── middleware.ts        # Edge Middleware (Auth & Security)
```

### 🚀 Installation & Setup

#### Requirements
- Node.js 20+ 
- npm or pnpm
- PostgreSQL database (Neon recommended)
- Redis (Upstash recommended)
- SMTP server for emailing
- OpenAI API Key

#### Installation Steps

1. **Clone the repository**
```bash
git clone [your-repo-url]
cd ent-prep-development-plan
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment**
```bash
cp .env.example .env
# Open .env and fill in the required variables
```

4. **Prepare database**
```bash
npx drizzle-kit push
```

5. **Create administrator account**
Register via the website form, then use the bootstrap script:
```bash
curl -X POST http://localhost:3000/api/admin/make-admin \
  -H "Content-Type: application/json" \
  -d '{"secret":"your-bootstrap-secret","email":"your-email@example.com"}'
```

6. **Launch in development mode**
```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

### 🧪 Testing

```bash
npm test              # Run all tests
npm run typecheck     # TypeScript type checking
npm run lint          # Code style check
```

### 🔐 Security

- ✅ **JWT Auth**: Tokens stored in secure `httpOnly` cookies.
- ✅ **Password Hashing**: Using bcryptjs with optimal cost factor.
- ✅ **Rate Limiting**: Brute-force protection via Upstash Redis.
- ✅ **Edge Protection**: Permission checks in Middleware before page execution.
- ✅ **Audit Logs**: Tracking of all system changes.
- ✅ **XSS/SQLi Protection**: Provided by React and Drizzle ORM.
- ✅ **Email Verification**: Access to testing only after email confirmation.

### 🌍 Localization

The application supports three languages:
- 🇰🇿 **Kazakh**
- 🇷🇺 **Russian**
- 🇬🇧 **English**

Translations are implemented via a centralized `src/lib/i18n.ts` file, ensuring instant switching without page reloads.

### 👨‍💻 Author

**Seitkazy Kazybek**
**Baidildaev Bakdaulet**
Software Engineering student
Astana IT University
2026

**Supervisor:** Dinara Kaibasova Zhenisbekovna

[⬆ Back to top](#unt-prep-ai)
