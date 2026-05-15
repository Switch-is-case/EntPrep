interface RoadmapPromptParams {
  currentScore: number;
  targetScore: number;
  weakTopics: Array<{
    subject: string;
    topic: string;
    accuracy: number;
  }>;
  daysUntilExam: number;
  // examLanguage УДАЛЁН — теперь генерируем сразу 3 языка в одном ответе
}

export function buildRoadmapPrompt(params: RoadmapPromptParams): string {
  const { currentScore, targetScore, weakTopics, daysUntilExam } = params;

  const weakTopicsFormatted = weakTopics.length > 0
    ? weakTopics.map(t => `- ${t.subject}: ${t.topic} (accuracy ${t.accuracy}%)`).join("\n")
    : "No weak topics detected (excellent result!)";

  return `You are an AI mentor for Kazakhstan UNT (ЕНТ) exam preparation.

STUDENT DATA:
- Current score: ${currentScore}/140
- Target score: ${targetScore}/140
- Days until exam: ${daysUntilExam}
- Weak topics:
${weakTopicsFormatted}

TASK: Create a personalized 4-week study plan.

🚨 CRITICAL OUTPUT FORMAT REQUIREMENTS 🚨

You MUST return JSON where EVERY text field is a MULTILINGUAL OBJECT with kz, ru, en keys.

WRONG ❌ (will be REJECTED):
"focus": "Литература"
"title": "Math Literacy"
"motivationalMessage": "You can do it!"

CORRECT ✅:
"focus": { "kz": "Әдебиет", "ru": "Литература", "en": "Literature" }
"title": { "kz": "Математикалық сауаттылық", "ru": "Математическая грамотность", "en": "Math Literacy" }
"motivationalMessage": { "kz": "Сіз қол жеткізе аласыз!", "ru": "Ты сможешь!", "en": "You can do it!" }

MULTILINGUAL FIELDS (MUST be { kz, ru, en } objects):
- weeklyPlan[].focus
- weeklyPlan[].topics[].title
- weeklyPlan[].topics[].objective
- priorityTopics[].reason
- motivationalMessage

PRIMITIVE FIELDS (MUST stay as numbers/enums, NOT objects):
- summary.feasibility: "easy" | "medium" | "hard" | "very_hard"
- summary.estimatedScoreGain: number
- summary.recommendedHoursPerDay: number
- weeklyPlan[].weekIndex: number
- weeklyPlan[].topics[].id: number
- priorityTopics[].topicId: number
- priorityTopics[].estimatedHours: number
- priorityTopics[].impactOnScore: number

GENERAL RULES:
- Respond ONLY with JSON
- NO markdown blocks (no \`\`\`json)
- NO text before or after JSON
- Start response with { and end with }
- All translations must be NATURAL, not literal word-by-word
- Use proper terminology for each language

EXAMPLE OF CORRECT RESPONSE:
{
  "summary": {
    "feasibility": "hard",
    "estimatedScoreGain": 80,
    "recommendedHoursPerDay": 6
  },
  "weeklyPlan": [
    {
      "weekIndex": 1,
      "focus": {
        "kz": "Сауаттылық негіздерін игеру",
        "ru": "Освоение основ грамотности",
        "en": "Mastering literacy fundamentals"
      },
      "topics": [
        {
          "id": 1,
          "title": {
            "kz": "Математикалық сауаттылық: Мәтіндік есептер",
            "ru": "Математическая грамотность: Текстовые задачи",
            "en": "Math Literacy: Word Problems"
          },
          "objective": {
            "kz": "Пайыздар мен пропорцияларға арналған есептерді шешуді үйрену",
            "ru": "Научиться решать задачи на проценты и пропорции",
            "en": "Learn to solve percentage and proportion problems"
          }
        },
        {
          "id": 2,
          "title": {
            "kz": "Оқу сауаттылығы: Мәтін құрылымы",
            "ru": "Грамотность чтения: Структура текста",
            "en": "Reading Literacy: Text Structure"
          },
          "objective": {
            "kz": "Кілт сөздерді табу және мәтіннің негізгі идеясын анықтау",
            "ru": "Освоить поиск ключевых слов и определение основной мысли",
            "en": "Master keyword identification and main idea detection"
          }
        }
      ]
    }
  ],
  "priorityTopics": [
    {
      "topicId": 1,
      "estimatedHours": 20,
      "impactOnScore": 15,
      "reason": {
        "kz": "Бұл базалық тақырып, ол басқа бөлімдерге негіз болады",
        "ru": "Это базовая тема, которая является основой для других разделов",
        "en": "This is a foundational topic that serves as the basis for other sections"
      }
    }
  ],
  "motivationalMessage": {
    "kz": "Сіздің мақсатыңыз қол жетімді! Әр күнгі жұмыс — бұл табысқа жетудің кілті. Алға!",
    "ru": "Твоя цель достижима! Ежедневная работа — это ключ к успеху. Вперёд!",
    "en": "Your goal is achievable! Daily work is the key to success. Move forward!"
  }
}

NOW GENERATE A SIMILAR STRUCTURE FOR THIS STUDENT.

QUALITY REQUIREMENTS:
- Minimum 4 weeks in weeklyPlan
- Minimum 5 priorityTopics
- Realistic time estimates
- Specific recommendations, not generic phrases
- Consider weak topics when planning
- If daysUntilExam < 30 — focus on revision
- If daysUntilExam > 60 — focus on learning new material

🚨 FINAL REMINDER: Every text field (focus, title, objective, reason, motivationalMessage) 
MUST be an object with kz, ru, en keys. NO exceptions. If you return plain strings, 
the response will be rejected.`;
}
