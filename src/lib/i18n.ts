export type Lang = "kz" | "ru" | "en";

export const translations = {
  // Navigation
  "nav.home": { kz: "Басты бет", ru: "Главная", en: "Home" },
  "nav.tests": { kz: "Тесттер", ru: "Тесты", en: "Tests" },
  "nav.practice": { kz: "Жаттығу", ru: "Практика", en: "Practice" },
  "nav.progress": { kz: "Прогресс", ru: "Прогресс", en: "Progress" },
  "nav.history": { kz: "Тарих", ru: "История", en: "History" },
  "nav.profile": { kz: "Профиль", ru: "Профиль", en: "Profile" },
  "nav.mockExam": { kz: "Пробный ЕНТ", ru: "Пробный ЕНТ", en: "Mock Exam" },
  "nav.roadmap": { kz: "AI Жоспар", ru: "AI План", en: "AI Plan" },
  "nav.career": { kz: "Мансап", ru: "Карьера", en: "Career" },
  "nav.universities": { kz: "Университеттер", ru: "Университеты", en: "Universities" },
  "nav.login": { kz: "Кіру", ru: "Войти", en: "Login" },
  "nav.register": { kz: "Тіркелу", ru: "Регистрация", en: "Register" },
  "nav.logout": { kz: "Шығу", ru: "Выйти", en: "Logout" },
  "nav.student": { kz: "Студент", ru: "Студент", en: "Student" },

  // Admin Navigation
  "admin.nav.dashboard": { kz: "Бақылау тақтасы", ru: "Дашборд", en: "Dashboard" },
  "admin.nav.questions": { kz: "Сұрақтар", ru: "Вопросы", en: "Questions" },
  "admin.nav.users": { kz: "Қолданушылар", ru: "Пользователи", en: "Users" },
  "admin.nav.sessions": { kz: "Сессиялар", ru: "Сессии", en: "Sessions" },
  "admin.nav.universities": { kz: "Университеттер", ru: "Университеты", en: "Universities" },
  "admin.nav.auditLogs": { kz: "Аудит журналы", ru: "Журнал аудита", en: "Audit Logs" },
  "admin.nav.backToSite": { kz: "Сайтқа қайту", ru: "К сайту", en: "Back to site" },

  // Admin Panel - Dashboard
  "admin.dashboard.title": { kz: "Басқару панелі", ru: "Панель управления", en: "Admin Dashboard" },
  "admin.dashboard.welcome": { kz: "Қош келдіңіз", ru: "Добро пожаловать", en: "Welcome" },
  "admin.stats.totalUsers": { kz: "Барлық пайдаланушылар", ru: "Всего пользователей", en: "Total Users" },
  "admin.stats.totalQuestions": { kz: "Барлық сұрақтар", ru: "Всего вопросов", en: "Total Questions" },
  "admin.stats.totalSessions": { kz: "Барлық сессиялар", ru: "Всего сессий", en: "Total Sessions" },
  "admin.stats.totalAnswers": { kz: "Барлық жауаптар", ru: "Всего ответов", en: "Total Answers" },
  "admin.stats.usersInPeriod": { kz: "кезеңдегі жаңа қолданушылар", ru: "новых пользователей за период", en: "new users in period" },
  "admin.stats.sessionsInPeriod": { kz: "кезеңдегі жаңа сессиялар", ru: "новых сессий за период", en: "new sessions in period" },
  "admin.stats.baseContent": { kz: "Мазмұн базасы", ru: "Контент базы", en: "Content base" },
  "admin.stats.dataCollection": { kz: "Деректерді жинау", ru: "Сбор данных", en: "Data collection" },

  // Admin Panel - Charts
  "admin.charts.userRegistrations": { kz: "Пайдаланушыларды тіркеу", ru: "Регистрации пользователей", en: "User Registrations" },
  "admin.charts.userRegistrationsDesc": { kz: "Күн сайынғы жаңа пайдаланушылар", ru: "Новые пользователи по дням", en: "New users by day" },
  "admin.charts.testingActivity": { kz: "Тестілеу белсенділігі", ru: "Активность тестирования", en: "Testing Activity" },
  "admin.charts.testingActivityDesc": { kz: "Басталған сессиялар саны", ru: "Количество начатых сессий", en: "Number of started sessions" },
  "admin.charts.userEngagement": { kz: "Пайдаланушылардың тартылуы", ru: "Вовлечённость пользователей", en: "User Engagement" },
  "admin.charts.subjectPerformance": { kz: "Пәндер бойынша орташа балл", ru: "Средний балл по предметам", en: "Subject Performance" },
  "admin.charts.subjectPerformanceDesc": { kz: "Неғұрлым төмен болса, соғұрлым пән қиын", ru: "Чем ниже — тем сложнее предмет", en: "Lower score means harder subject" },
  "admin.charts.completionRates": { kz: "Тестті аяқтау пайызы", ru: "Процент завершения тестов", en: "Test Completion Rates" },
  "admin.charts.avgScore": { kz: "Орташа балл", ru: "Средний балл", en: "Average Score" },

  // Admin Panel - Engagement Details
  "admin.engagement.verified": { kz: "Расталды", ru: "Верифицированы", en: "Verified" },
  "admin.engagement.unverified": { kz: "Расталмаған", ru: "Не верифицированы", en: "Unverified" },
  "admin.engagement.banned": { kz: "Бұғатталған", ru: "Заблокированы", en: "Banned" },
  "admin.engagement.deleted": { kz: "Жойылған", ru: "Удалены", en: "Deleted" },
  "admin.engagement.active7d": { kz: "Белсенді (7К)", ru: "Активны (7д)", en: "Active (7d)" },
  "admin.engagement.verification": { kz: "Растау", ru: "Верификация", en: "Verification" },
  "admin.engagement.completedOf": { kz: "-дан аяқталды", ru: "из завершено", en: "of completed" },

  // Admin Panel - Recent Activity
  "admin.recent.users": { kz: "Соңғы пайдаланушылар", ru: "Последние пользователи", en: "Recent Users" },
  "admin.recent.sessions": { kz: "Соңғы сессиялар", ru: "Последние сессии", en: "Recent Sessions" },

  // Admin Panel - Periods
  "admin.period.7d": { kz: "7 күн", ru: "7 дней", en: "7 days" },
  "admin.period.30d": { kz: "30 күн", ru: "30 дней", en: "30 days" },
  "admin.period.90d": { kz: "90 күн", ru: "90 дней", en: "90 days" },

  // Admin Panel - Common Labels
  "admin.common.name": { kz: "Аты", ru: "Имя", en: "Name" },
  "admin.common.email": { kz: "Email", ru: "Email", en: "Email" },
  "admin.common.status": { kz: "Мәртебесі", ru: "Статус", en: "Status" },
  "admin.common.date": { kz: "Күні", ru: "Дата", en: "Date" },
  "admin.common.type": { kz: "Түрі", ru: "Тип", en: "Type" },
  "admin.common.score": { kz: "Балл", ru: "Балл", en: "Score" },
  "admin.common.actions": { kz: "Әрекеттер", ru: "Действия", en: "Actions" },
  "admin.common.loading": { kz: "Жүктелуде...", ru: "Загрузка...", en: "Loading..." },
  "admin.common.noData": { kz: "Деректер жоқ", ru: "Нет данных", en: "No data" },
  "admin.common.save": { kz: "Сақтау", ru: "Сохранить", en: "Save" },
  "admin.common.cancel": { kz: "Болдырмау", ru: "Отмена", en: "Cancel" },
  "admin.common.edit": { kz: "Өңдеу", ru: "Редактировать", en: "Edit" },
  "admin.common.delete": { kz: "Жою", ru: "Удалить", en: "Delete" },
  "admin.common.search": { kz: "Іздеу...", ru: "Поиск...", en: "Search..." },
  "admin.common.all": { kz: "Барлығы", ru: "Все", en: "All" },
  "admin.common.add": { kz: "Қосу", ru: "Добавить", en: "Add" },

  // Admin Panel - Statuses
  "admin.status.admin": { kz: "Әкімші", ru: "Админ", en: "Admin" },
  "admin.status.verified": { kz: "Расталды", ru: "Verified", en: "Verified" },
  "admin.status.unverified": { kz: "Расталмаған", ru: "Unverified", en: "Unverified" },
  "admin.status.banned": { kz: "Бұғатталған", ru: "Banned", en: "Banned" },
  "admin.status.completed": { kz: "Аяқталды", ru: "Завершён", en: "Completed" },
  "admin.status.inProgress": { kz: "Жүруде", ru: "В процессе", en: "In Progress" },

  // Admin Panel - Test Types
  "admin.testType.diagnostic": { kz: "Диагностика", ru: "Диагностика", en: "Diagnostic" },
  "admin.testType.practice": { kz: "Тәжірибе", ru: "Практика", en: "Practice" },
  "admin.testType.mock": { kz: "Емтихан", ru: "Экзамен", en: "Mock Exam" },

  // Admin Panel - Access
  "admin.access.denied": { kz: "Қолжетімділік шектелген", ru: "Доступ запрещён", en: "Access Denied" },
  "admin.access.noRights": { kz: "Бұл бетке кіру үшін сізде әкімші құқықтары жоқ.", ru: "У вас нет прав администратора для доступа к этой странице.", en: "You don't have administrator rights to access this page." },
  "admin.access.toHome": { kz: "Басты бетке", ru: "На главную", en: "To Home" },

  // Admin Panel - Users Page
  "admin.users.title": { kz: "Пайдаланушыларды басқару", ru: "Управление пользователями", en: "User Management" },
  "admin.users.searchPlaceholder": { kz: "Аты немесе email бойынша іздеу...", ru: "Поиск по имени или email...", en: "Search by name or email..." },
  "admin.users.filter.all": { kz: "Барлығы", ru: "Все", en: "All" },
  "admin.users.filter.admins": { kz: "Әкімшілер", ru: "Админы", en: "Admins" },
  "admin.users.filter.banned": { kz: "Бұғатталғандар", ru: "Забаненные", en: "Banned" },
  "admin.users.filter.deleted": { kz: "Жойылғандар", ru: "Удаленные", en: "Deleted" },
  "admin.users.filter.unverified": { kz: "Расталмағандар", ru: "Неверифицированные", en: "Unverified" },
  "admin.users.table.user": { kz: "Пайдаланушы", ru: "Пользователь", en: "User" },
  "admin.users.table.subjects": { kz: "Пәндер", ru: "Предметы", en: "Subjects" },
  "admin.users.table.regDate": { kz: "Тіркелген күні", ru: "Дата регистрации", en: "Registration Date" },
  "admin.users.table.you": { kz: "СІЗ", ru: "ВЫ", en: "YOU" },
  "admin.users.table.notSelected": { kz: "Таңдалмаған", ru: "Не выбраны", en: "Not selected" },
  "admin.users.actions.removeAdmin": { kz: "Әкімші құқығын алып тастау", ru: "Снять права админа", en: "Remove Admin Rights" },
  "admin.users.actions.makeAdmin": { kz: "Әкімші ету", ru: "Сделать админом", en: "Make Admin" },
  "admin.users.actions.ban": { kz: "Бұғаттау", ru: "Заблокировать", en: "Ban" },
  "admin.users.actions.unban": { kz: "Бұғаттан шығару", ru: "Разблокировать", en: "Unban" },
  "admin.users.actions.delete": { kz: "Жою", ru: "Удалить", en: "Delete" },
  "admin.users.actions.restore": { kz: "Қалпына келтіру", ru: "Восстановить", en: "Restore" },
  "admin.users.actions.noDeleteAdmin": { kz: "Әкімшіні жоюға болмайды", ru: "Нельзя удалить администратора", en: "Cannot delete administrator" },
  "admin.users.notFound": { kz: "Пайдаланушылар табылмады", ru: "Пользователи не найдены", en: "Users not found" },
  "admin.users.pagination.page": { kz: "Бет", ru: "Страница", en: "Page" },
  "admin.users.pagination.of": { kz: "-дан", ru: "из", en: "of" },
  "admin.users.pagination.prev": { kz: "← Алдыңғы", ru: "← Пред.", en: "← Prev" },
  "admin.users.pagination.next": { kz: "Келесі →", ru: "След. →", en: "Next →" },
  "admin.users.modal.banTitle": { kz: "Пайдаланушыны бұғаттау", ru: "Блокировка пользователя", en: "Ban User" },
  "admin.users.modal.banWarning": { kz: "Бұл әрекет аккаунтқа кіруді бұғаттайды.", ru: "Это действие заблокирует доступ к аккаунту.", en: "This action will block access to the account." },
  "admin.users.modal.banReasonLabel": { kz: "Бұғаттау себебі (кемінде 10 таңба)", ru: "Причина блокировки (минимум 10 символов)", en: "Ban reason (minimum 10 characters)" },
  "admin.users.modal.banReasonPlaceholder": { kz: "Мысалы: Платформа ережелерін бұзу...", ru: "Например: Нарушение правил платформы...", en: "Example: Platform rules violation..." },
  "admin.users.error.ban": { kz: "Пайдаланушыны бұғаттау кезінде қате кетті", ru: "Ошибка при блокировке пользователя", en: "Error banning user" },

  // Admin Panel - Questions Page
  "admin.questions.title": { kz: "Сұрақтар", ru: "Вопросы", en: "Questions" },
  "admin.questions.generateAi": { kz: "AI арқылы генерациялау", ru: "Сгенерировать ИИ", en: "Generate with AI" },
  "admin.questions.bulkImport": { kz: "Жаппай импорт", ru: "Массовый импорт", en: "Bulk Import" },
  "admin.questions.add": { kz: "Сұрақ қосу", ru: "Добавить вопрос", en: "Add Question" },
  "admin.questions.filter.allSubjects": { kz: "Барлық пәндер", ru: "Все предметы", en: "All Subjects" },
  "admin.questions.table.question": { kz: "Сұрақ", ru: "Вопрос", en: "Question" },
  "admin.questions.table.answer": { kz: "Жауап", ru: "Ответ", en: "Answer" },
  "admin.questions.table.difficulty": { kz: "Күрделілігі", ru: "Сложность", en: "Difficulty" },
  "admin.questions.difficulty.easy": { kz: "Оңай", ru: "Легкий", en: "Easy" },
  "admin.questions.difficulty.medium": { kz: "Орташа", ru: "Средний", en: "Medium" },
  "admin.questions.difficulty.hard": { kz: "Қиын", ru: "Сложный", en: "Hard" },
  "admin.questions.modal.new": { kz: "Жаңа сұрақ", ru: "Новый вопрос", en: "New Question" },
  "admin.questions.modal.edit": { kz: "Сұрақты өңдеу", ru: "Редактировать вопрос", en: "Edit Question" },
  "admin.questions.form.subject": { kz: "Пән *", ru: "Предмет *", en: "Subject *" },
  "admin.questions.form.topic": { kz: "Тақырып", ru: "Тема", en: "Topic" },
  "admin.questions.form.topicPlaceholder": { kz: "Алгебра, Геометрия...", ru: "Алгебра, Геометрия...", en: "Algebra, Geometry..." },
  "admin.questions.form.questionRu": { kz: "Сұрақ (RU) *", ru: "Вопрос (RU) *", en: "Question (RU) *" },
  "admin.questions.form.questionKz": { kz: "Сұрақ (KZ)", ru: "Сұрақ (KZ)", en: "Question (KZ)" },
  "admin.questions.form.questionEn": { kz: "Question (EN)", ru: "Question (EN)", en: "Question (EN)" },
  "admin.questions.form.imageLabel": { kz: "Сұраққа сурет (міндетті емес)", ru: "Изображение к вопросу (необязательно)", en: "Question image (optional)" },
  "admin.questions.form.imageHint": { kz: "JPEG, PNG, WebP немесе GIF — максимум 5 МБ", ru: "JPEG, PNG, WebP или GIF — максимум 5 МБ", en: "JPEG, PNG, WebP or GIF — max 5 MB" },
  "admin.questions.form.optionsLabel": { kz: "Жауап нұсқалары (әр тілде 4 нұсқа)", ru: "Варианты ответов (4 варианта на каждом языке)", en: "Options (4 options per language)" },
  "admin.questions.form.correctAnswer": { kz: "Дұрыс жауап", ru: "Правильный ответ", en: "Correct Answer" },
  "admin.questions.form.selectCorrect": { kz: "Дұрыс жауапты таңдау үшін басыңыз", ru: "Нажмите, чтобы выбрать правильный", en: "Click to select correct answer" },
  "admin.questions.form.option": { kz: "Нұсқа", ru: "Вариант", en: "Option" },
  "admin.questions.form.optionImage": { kz: "Жауапқа сурет", ru: "Картинка к ответу", en: "Option image" },
  "admin.questions.form.saving": { kz: "Сақталуда...", ru: "Сохранение...", en: "Saving..." },
  "admin.questions.bulk.title": { kz: "Сұрақтарды жаппай импорттау", ru: "Массовый импорт вопросов", en: "Bulk Import Questions" },
  "admin.questions.bulk.formatHint": { kz: "JSON файлының форматы:", ru: "Формат JSON-файла:", en: "JSON file format:" },
  "admin.questions.bulk.uploadJson": { kz: ".json файлын жүктеу", ru: "Загрузить .json файл", en: "Upload .json file" },
  "admin.questions.bulk.manualLabel": { kz: "немесе JSON-ды қолмен қойыңыз", ru: "или вставьте JSON вручную", en: "or paste JSON manually" },
  "admin.questions.bulk.ready": { kz: "Импортқа дайын: {count} сұрақ", ru: "Готово к импорту: {count} вопросов", en: "Ready to import: {count} questions" },
  "admin.questions.bulk.validationErrors": { kz: "Валидация қателері:", ru: "Ошибки валидации:", en: "Validation errors:" },
  "admin.questions.bulk.importing": { kz: "Импортталуда...", ru: "Импорт...", en: "Importing..." },
  "admin.questions.ai.title": { kz: "AI генераторы", ru: "Генератор ИИ", en: "AI Generator" },
  "admin.questions.ai.hint": { kz: "Генерацияланған сұрақтар Жаппай импорт терезесіне жүктеледі, онда сіз оларды сақтау алдында тексере аласыз.", ru: "Сгенерированные вопросы будут загружены в окно Массового импорта, где вы сможете их проверить и отредактировать перед сохранением.", en: "Generated questions will be loaded into the Bulk Import window, where you can verify and edit them before saving." },
  "admin.questions.ai.promptLabel": { kz: "Тақырып (AI үшін сипаттама) *", ru: "Тема (описание для ИИ) *", en: "Topic (AI description) *" },
  "admin.questions.ai.promptPlaceholder": { kz: "Мысалы: Квадрат теңдеулер, Туындылар...", ru: "Например: Квадратные уравнения, Производные...", en: "Example: Quadratic equations, Derivatives..." },
  "admin.questions.ai.count": { kz: "Саны (макс. 20)", ru: "Количество (макс. 20)", en: "Count (max 20)" },
  "admin.questions.ai.generating": { kz: "Генерациялануда...", ru: "Генерация...", en: "Generating..." },

  // Admin Panel - Sessions Page
  "admin.sessions.title": { kz: "Тестілеу сессиялары", ru: "Тестовые сессии", en: "Test Sessions" },
  "admin.sessions.table.result": { kz: "Нәтиже", ru: "Результат", en: "Result" },
  "admin.sessions.table.details": { kz: "Мәліметтер", ru: "Детали", en: "Details" },
  "admin.sessions.table.time": { kz: "Уақыт", ru: "Время", en: "Time" },
  "admin.sessions.notFound": { kz: "Тестілеу сессиялары табылмады", ru: "Нет тестовых сессий", en: "No test sessions found" },

  // Admin Panel - Universities Page
  "admin.universities.add": { kz: "Университет қосу", ru: "Добавить университет", en: "Add University" },
  "admin.universities.searchPlaceholder": { kz: "Атауы немесе қаласы бойынша іздеу...", ru: "Поиск по названию или городу...", en: "Search by name or city..." },
  "admin.universities.programs": { kz: "Мамандықтар", ru: "Специальности", en: "Programs" },
  "admin.universities.more": { kz: "+{count} тағы", ru: "+{count} еще", en: "+{count} more" },
  "admin.universities.modal.new": { kz: "Университет қосу", ru: "Добавить университет", en: "Add University" },
  "admin.universities.modal.edit": { kz: "Университетті өңдеу", ru: "Редактировать университет", en: "Edit University" },
  "admin.universities.form.nameRu": { kz: "Атауы (RU)*", ru: "Название (RU)*", en: "Name (RU)*" },
  "admin.universities.form.nameKz": { kz: "Атауы (KZ)*", ru: "Название (KZ)*", en: "Name (KZ)*" },
  "admin.universities.form.nameEn": { kz: "Атауы (EN)*", ru: "Название (EN)*", en: "Name (EN)*" },
  "admin.universities.form.cityRu": { kz: "Қала (RU)*", ru: "Город (RU)*", en: "City (RU)*" },
  "admin.universities.form.cityKz": { kz: "Қала (KZ)*", ru: "Город (KZ)*", en: "City (KZ)*" },
  "admin.universities.form.cityEn": { kz: "Қала (EN)*", ru: "Город (EN)*", en: "City (EN)*" },
  "admin.universities.form.description": { kz: "Сипаттамасы", ru: "Описание", en: "Description" },
  "admin.universities.form.programs": { kz: "Бағдарламалар / Мамандықтар", ru: "Программы / Специальности", en: "Programs / Specialties" },
  "admin.universities.form.passingScore": { kz: "Өту балы", ru: "Проходной балл", en: "Passing Score" },
  "admin.universities.form.noPrograms": { kz: "Қосылған бағдарламалар жоқ", ru: "Нет добавленных программ", en: "No programs added" },
  "admin.universities.bulk.title": { kz: "Университеттерді жаппай импорттау", ru: "Массовый импорт университетов", en: "Bulk Import Universities" },

  // Admin Panel - Audit Logs Page
  "admin.audit.title": { kz: "Аудит журналы", ru: "Журнал аудита", en: "Audit Journal" },
  "admin.audit.filter.action": { kz: "Іс-әрекет", ru: "Действие", en: "Action" },
  "admin.audit.filter.entity": { kz: "Субъект түрі", ru: "Тип сущности", en: "Entity Type" },
  "admin.audit.filter.from": { kz: "Бастап", ru: "От", en: "From" },
  "admin.audit.filter.to": { kz: "Дейін", ru: "До", en: "To" },
  "admin.audit.table.admin": { kz: "Админ", ru: "Админ", en: "Admin" },
  "admin.audit.table.entity": { kz: "Субъект", ru: "Сущность", en: "Entity" },
  "admin.audit.table.description": { kz: "Сипаттама", ru: "Описание", en: "Description" },
  "admin.audit.details.oldValue": { kz: "Ескі мән", ru: "Старое значение", en: "Old Value" },
  "admin.audit.details.newValue": { kz: "Жаңа мән", ru: "Новое значение", en: "New Value" },
  "admin.audit.details.noData": { kz: "Мәліметтер жоқ", ru: "Нет данных", en: "No data" },
  "admin.audit.notFound": { kz: "Жазбалар табылмады", ru: "Записи не найдены", en: "No records found" },

  // Home page
  "home.hero.title": {
    kz: "ЕНТ-ге AI көмегімен дайындалыңыз",
    ru: "Подготовка к ЕНТ с помощью AI",
    en: "Prepare for ENT with AI",
  },
  "home.hero.subtitle": {
    kz: "Жасанды интеллект арқылы жеке оқу жоспарын жасаңыз",
    ru: "Создайте персональный учебный план с искусственным интеллектом",
    en: "Create a personalized study plan with artificial intelligence",
  },
  "home.hero.cta": {
    kz: "Тегін бастау",
    ru: "Начать бесплатно",
    en: "Start for free",
  },
  "home.features.diagnostic": {
    kz: "Диагностикалық тест",
    ru: "Диагностический тест",
    en: "Diagnostic Test",
  },
  "home.features.diagnostic.desc": {
    kz: "Білім деңгейіңізді анықтаңыз",
    ru: "Определите свой уровень знаний",
    en: "Determine your knowledge level",
  },
  "home.features.ai": {
    kz: "AI Ұсыныстар",
    ru: "AI Рекомендации",
    en: "AI Recommendations",
  },
  "home.features.ai.desc": {
    kz: "Жеке оқу жоспарын алыңыз",
    ru: "Получите персональный план обучения",
    en: "Get a personalized study plan",
  },
  "home.features.practice": {
    kz: "Жаттығу режимі",
    ru: "Режим практики",
    en: "Practice Mode",
  },
  "home.features.practice.desc": {
    kz: "Пәндер бойынша жаттығыңыз",
    ru: "Практикуйтесь по предметам",
    en: "Practice by subjects",
  },
  "home.features.progress": {
    kz: "Прогресс бақылау",
    ru: "Отслеживание прогресса",
    en: "Progress Tracking",
  },
  "home.features.progress.desc": {
    kz: "Нәтижелеріңізді бақылаңыз",
    ru: "Отслеживайте свои результаты",
    en: "Track your results",
  },

  // Auth
  "auth.email": { kz: "Email", ru: "Email", en: "Email" },
  "auth.password": { kz: "Құпиясөз", ru: "Пароль", en: "Password" },
  "auth.name": { kz: "Аты-жөні", ru: "Имя", en: "Name" },
  "auth.login": { kz: "Кіру", ru: "Войти", en: "Login" },
  "auth.register": { kz: "Тіркелу", ru: "Регистрация", en: "Register" },
  "auth.noAccount": {
    kz: "Аккаунтыңыз жоқ па?",
    ru: "Нет аккаунта?",
    en: "No account?",
  },
  "auth.hasAccount": {
    kz: "Аккаунтыңыз бар ма?",
    ru: "Есть аккаунт?",
    en: "Have an account?",
  },

  // Profile
  "profile.title": { kz: "Профиль", ru: "Профиль", en: "Profile" },
  "profile.subjects": {
    kz: "Профильдік пәндер",
    ru: "Профильные предметы",
    en: "Profile Subjects",
  },
  "profile.subject1": {
    kz: "1-ші профильдік пән",
    ru: "1-й профильный предмет",
    en: "1st Profile Subject",
  },
  "profile.subject2": {
    kz: "2-ші профильдік пән",
    ru: "2-й профильный предмет",
    en: "2nd Profile Subject",
  },
  "profile.language": { kz: "Тіл", ru: "Язык", en: "Language" },
  "profile.save": { kz: "Сақтау", ru: "Сохранить", en: "Save" },
  "profile.saved": { kz: "Сақталды!", ru: "Сохранено!", en: "Saved!" },

  // Subjects
  "subject.math_literacy": {
    kz: "Математикалық сауаттылық",
    ru: "Математическая грамотность",
    en: "Mathematical Literacy",
  },
  "subject.reading_literacy": {
    kz: "Оқу сауаттылығы",
    ru: "Грамотность чтения",
    en: "Reading Literacy",
  },
  "subject.history_kz": {
    kz: "Қазақстан тарихы",
    ru: "История Казахстана",
    en: "History of Kazakhstan",
  },
  "subject.math": { kz: "Математика", ru: "Математика", en: "Mathematics" },
  "subject.physics": { kz: "Физика", ru: "Физика", en: "Physics" },
  "subject.chemistry": { kz: "Химия", ru: "Химия", en: "Chemistry" },
  "subject.biology": { kz: "Биология", ru: "Биология", en: "Biology" },
  "subject.geography": { kz: "География", ru: "География", en: "Geography" },
  "subject.world_history": {
    kz: "Дүниежүзі тарихы",
    ru: "Всемирная история",
    en: "World History",
  },
  "subject.english": {
    kz: "Ағылшын тілі",
    ru: "Английский язык",
    en: "English Language",
  },
  "subject.informatics": {
    kz: "Информатика",
    ru: "Информатика",
    en: "Computer Science",
  },
  "subject.literature": {
    kz: "Әдебиет",
    ru: "Литература",
    en: "Literature",
  },

  // Test
  "test.start": { kz: "Тестті бастау", ru: "Начать тест", en: "Start Test" },
  "test.startDiagnostic": {
    kz: "Диагностикалық тестті бастау",
    ru: "Начать диагностический тест",
    en: "Start Diagnostic Test",
  },
  "test.question": { kz: "Сұрақ", ru: "Вопрос", en: "Question" },
  "test.of": { kz: "/", ru: "из", en: "of" },
  "test.iDontKnow": {
    kz: "Мен білмеймін",
    ru: "Я не знаю",
    en: "I don't know",
  },
  "test.next": { kz: "Келесі", ru: "Далее", en: "Next" },
  "test.prev": { kz: "Алдыңғы", ru: "Назад", en: "Previous" },
  "test.finish": {
    kz: "Тестті аяқтау",
    ru: "Завершить тест",
    en: "Finish Test",
  },
  "test.results": { kz: "Нәтижелер", ru: "Результаты", en: "Results" },
  "test.score": { kz: "Балл", ru: "Балл", en: "Score" },
  "test.correct": { kz: "Дұрыс", ru: "Правильно", en: "Correct" },
  "test.wrong": { kz: "Қате", ru: "Неправильно", en: "Wrong" },
  "test.skipped": { kz: "Өткізілді", ru: "Пропущено", en: "Skipped" },
  "test.totalQuestions": {
    kz: "Барлық сұрақтар",
    ru: "Всего вопросов",
    en: "Total Questions",
  },
  "test.fullTest": {
    kz: "Толық ЕНТ тест (140 сұрақ)",
    ru: "Полный тест ЕНТ (140 вопросов)",
    en: "Full ENT Test (140 questions)",
  },
  "test.fullTestDesc": {
    kz: "Нақты ЕНТ форматында тест тапсырыңыз",
    ru: "Пройдите тест в формате реального ЕНТ",
    en: "Take a test in real ENT format",
  },
  "test.diagnosticDesc": {
    kz: "Білім деңгейіңізді тексеріңіз",
    ru: "Проверьте свой уровень знаний",
    en: "Check your knowledge level",
  },
  "test.timeLeft": {
    kz: "Қалған уақыт",
    ru: "Оставшееся время",
    en: "Time Left",
  },

  // Practice
  "practice.title": { kz: "Жаттығу", ru: "Практика", en: "Practice" },
  "practice.selectSubject": {
    kz: "Пәнді таңдаңыз",
    ru: "Выберите предмет",
    en: "Select a subject",
  },
  "practice.questionsCount": {
    kz: "Сұрақтар саны",
    ru: "Количество вопросов",
    en: "Number of questions",
  },
  "practice.startPractice": {
    kz: "Жаттығуды бастау",
    ru: "Начать практику",
    en: "Start Practice",
  },
  "practice.explanation": {
    kz: "Түсіндірме",
    ru: "Объяснение",
    en: "Explanation",
  },

  // Progress
  "progress.title": { kz: "Прогресс", ru: "Прогресс", en: "Progress" },
  "progress.overall": {
    kz: "Жалпы прогресс",
    ru: "Общий прогресс",
    en: "Overall Progress",
  },
  "progress.bySubject": {
    kz: "Пәндер бойынша",
    ru: "По предметам",
    en: "By Subject",
  },
  "progress.history": {
    kz: "Тест тарихы",
    ru: "История тестов",
    en: "Test History",
  },
  "progress.accuracy": {
    kz: "Дәлдік",
    ru: "Точность",
    en: "Accuracy",
  },
  "progress.attempted": {
    kz: "Тапсырылды",
    ru: "Пройдено",
    en: "Attempted",
  },

  // Common
  "common.loading": { kz: "Жүктелуде...", ru: "Загрузка...", en: "Loading..." },
  "common.error": { kz: "Қате", ru: "Ошибка", en: "Error" },
  "common.success": { kz: "Сәтті", ru: "Успешно", en: "Success" },
  "common.cancel": { kz: "Болдырмау", ru: "Отмена", en: "Cancel" },
  "common.confirm": { kz: "Растау", ru: "Подтвердить", en: "Confirm" },
  "common.back": { kz: "Артқа", ru: "Назад", en: "Back" },
  "common.selectProfile": {
    kz: "Алдымен профильдік пәндерді таңдаңыз",
    ru: "Сначала выберите профильные предметы",
    en: "First select profile subjects",
  },
  "nav.more": { kz: "Тағы", ru: "Ещё", en: "More" },
  "nav.about": { kz: "Платформа туралы", ru: "О платформе", en: "About" },
  "nav.help": { kz: "Көмек", ru: "Помощь", en: "Help" },
  "nav.contact": { kz: "Контактілер", ru: "Контакты", en: "Contacts" },

  // PWA Install
  "nav.download": { kz: "Жүктеу", ru: "Скачать", en: "Download" },
  "install.title": { kz: "Қосымшаны орнату", ru: "Установить приложение", en: "Install App" },
  "install.desc": {
    kz: "Жылдам қол жеткізу, офлайн жұмыс, нағыз қосымша сияқты",
    ru: "быстрый доступ, работа офлайн, как настоящее приложение",
    en: "quick access, offline work, like a real app",
  },
  "install.selectPlatform": {
    kz: "Платформаны таңдаңыз",
    ru: "Выберите платформу",
    en: "Select platform",
  },
  "install.alreadyInstalled": {
    kz: "Қосымша орнатылған ✅",
    ru: "Приложение уже установлено ✅",
    en: "App is already installed ✅",
  },
  "install.alreadyInstalledDesc": {
    kz: "Оны басты экраннан таба аласыз",
    ru: "Вы можете найти его на главном экране",
    en: "You can find it on your home screen",
  },
  "install.ios.step1": {
    kz: "Сайтты Safari-де ашыңыз (Chrome емес!)",
    ru: "Откройте сайт в Safari (не Chrome!)",
    en: "Open the site in Safari (not Chrome!)",
  },
  "install.ios.step2": {
    kz: "«Бөлісу» батырмасын басыңыз (шаршы және жоғары көрсеткі)",
    ru: "Нажмите кнопку «Поделиться» (квадрат со стрелкой вверх)",
    en: "Tap the 'Share' button (square with up arrow)",
  },
  "install.ios.step3": {
    kz: "Төмен айналдырып, «Басты экранға қосу» таңдаңыз",
    ru: "Прокрутите вниз → «На экран Домой»",
    en: "Scroll down → 'Add to Home Screen'",
  },
  "install.ios.step4": {
    kz: "«Қосу» батырмасын басыңыз",
    ru: "Нажмите «Добавить»",
    en: "Tap 'Add'",
  },
  "install.ios.step5": {
    kz: "Дайын! Иконка басты экранда пайда болды",
    ru: "Готово! Иконка на главном экране",
    en: "Done! Icon is on the home screen",
  },
  "install.android.step1": {
    kz: "Сайтты Chrome браузерінде ашыңыз",
    ru: "Откройте сайт в Chrome",
    en: "Open the site in Chrome",
  },
  "install.android.step2": {
    kz: "Жоғарғы оң жақтағы үш нүктені басыңыз",
    ru: "Нажмите три точки в правом верхнем углу",
    en: "Tap the three dots in the top right corner",
  },
  "install.android.step3": {
    kz: "«Қосымшаны орнату» немесе «Басты экранға қосу» таңдаңыз",
    ru: "«Установить приложение» или «Добавить на главный экран»",
    en: "'Install app' or 'Add to Home Screen'",
  },
  "install.android.step4": {
    kz: "«Орнату» батырмасын басыңыз",
    ru: "Нажмите «Установить»",
    en: "Tap 'Install'",
  },
  "install.android.step5": {
    kz: "Дайын! Қосымша орнатылды",
    ru: "Готово!",
    en: "Done!",
  },

  // Email Verification
  "verifyEmail.pending.title": { kz: "Поштаңызды тексеріңіз", ru: "Проверь свою почту", en: "Check your email" },
  "verifyEmail.pending.body": { 
    kz: "Біз {email} поштасына растау сілтемесін жібердік. ENTPrep-ті пайдалануды бастау үшін оны басыңыз.", 
    ru: "Мы отправили ссылку для подтверждения на {email}. Кликни её чтобы начать пользоваться ENTPrep.", 
    en: "We sent a verification link to {email}. Click it to start using ENTPrep." 
  },
  "verifyEmail.pending.resendButton": { kz: "Қайта жіберу", ru: "Отправить заново", en: "Resend email" },
  "verifyEmail.pending.resendSuccess": { kz: "Растау хаты жіберілді!", ru: "Письмо для подтверждения отправлено!", en: "Verification email sent!" },
  "verifyEmail.pending.cooldown": { kz: "{seconds} секунд күтіңіз", ru: "Подожди {seconds} секунд", en: "Wait {seconds} seconds" },
  "verifyEmail.success.title": { kz: "Email расталды!", ru: "Email подтверждён!", en: "Email verified!" },
  "verifyEmail.success.body": { kz: "Керемет! Енді сізде барлық мүмкіндіктер ашылды. Қайта бағытталуда...", ru: "Отлично! Теперь тебе доступны все возможности. Перенаправляем...", en: "Great! Now you have full access. Redirecting..." },
  "verifyEmail.error.expired": { kz: "Сілтеме мерзімі өтіп кеткен. Профильден жаңа хат сұраңыз.", ru: "Ссылка истекла. Запроси новое письмо в профиле.", en: "Link expired. Request a new one in your profile." },
  "verifyEmail.error.invalid": { kz: "Жарамсыз сілтеме.", ru: "Недействительная ссылка.", en: "Invalid link." },
  "verifyEmail.error.alreadyUsed": { kz: "Email бұрын расталған. Аккаунтыңызға кіре аласыз.", ru: "Email уже подтверждён. Можешь войти в аккаунт.", en: "Email already verified. You can log in." },
  "verifyEmail.banner.message": { kz: "Толық қолжетімділік алу үшін email-ді растаңыз", ru: "Подтверди email чтобы получить полный доступ", en: "Verify your email for full access" },
  "verifyEmail.banner.button": { kz: "Растау →", ru: "Подтвердить →", en: "Verify →" },
  "verifyEmail.required.testBlocked": { kz: "Тестті бастау үшін email-ді растаңыз", ru: "Подтверди email чтобы начать тест", en: "Verify email to start the test" },
} as const;

export type TranslationKey = keyof typeof translations;

export function t(key: TranslationKey, lang: Lang): string {
  const entry = translations[key];
  if (!entry) return key;
  return entry[lang] || entry["en"] || key;
}


export const SUBJECT_COLORS: Record<string, string> = {
  math_literacy: "#2563eb",
  reading_literacy: "#8b5cf6",
  history_kz: "#f59e0b",
  math: "#10b981",
  physics: "#ef4444",
  chemistry: "#06b6d4",
  biology: "#84cc16",
  geography: "#f97316",
  world_history: "#ec4899",
  english: "#6366f1",
  informatics: "#14b8a6",
  literature: "#a855f7",
};
