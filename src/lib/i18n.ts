export type Lang = "kz" | "ru" | "en";

export const translations = {
  // Navigation
  "nav.home": { kz: "Басты бет", ru: "Главная", en: "Home" },
  "nav.tests": { kz: "Тесттер", ru: "Тесты", en: "Tests" },
  "nav.practice": { kz: "Жаттығу", ru: "Практика", en: "Practice" },
  "nav.progress": { kz: "Прогресс", ru: "Прогресс", en: "Progress" },
  "nav.history": { kz: "Тарих", ru: "История", en: "History" },
  "nav.profile": { kz: "Профиль", ru: "Профиль", en: "Profile" },
  "nav.universities": { kz: "Университеттер", ru: "Университеты", en: "Universities" },
  "nav.login": { kz: "Кіру", ru: "Войти", en: "Login" },
  "nav.register": { kz: "Тіркелу", ru: "Регистрация", en: "Register" },
  "nav.logout": { kz: "Шығу", ru: "Выйти", en: "Logout" },

  // Admin Navigation
  "admin.nav.dashboard": { kz: "Бақылау тақтасы", ru: "Дашборд", en: "Dashboard" },
  "admin.nav.questions": { kz: "Сұрақтар", ru: "Вопросы", en: "Questions" },
  "admin.nav.users": { kz: "Қолданушылар", ru: "Пользователи", en: "Users" },
  "admin.nav.sessions": { kz: "Тесттер", ru: "Тесты", en: "Tests" },
  "admin.nav.universities": { kz: "Университеттер", ru: "Университеты", en: "Universities" },
  "admin.nav.backToSite": { kz: "Сайтқа қайту", ru: "К сайту", en: "Back to site" },

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
