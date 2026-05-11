interface RoadmapPromptParams {
  currentScore: number;
  targetScore: number;
  weakTopics: Array<{
    subject: string;
    topic: string;
    accuracy: number;
  }>;
  daysUntilExam: number;
  examLanguage: "ru" | "kz" | "en";
}

export function buildRoadmapPrompt(params: RoadmapPromptParams): string {
  const { currentScore, targetScore, weakTopics, daysUntilExam, examLanguage } = params;
  
  const langInstructions = {
    ru: "Все строки в JSON должны быть на русском языке",
    kz: "Барлық JSON жолдары қазақ тілінде болуы керек",
    en: "All strings in JSON must be in English"
  };

  const weakTopicsFormatted = weakTopics.length > 0 
    ? weakTopics.map(t => `- ${t.subject}: ${t.topic} (точность ${t.accuracy}%)`).join("\n")
    : "Слабых тем не обнаружено (отличный результат!)";

  return `Ты - AI-наставник для подготовки к ЕНТ Казахстана.

ДАННЫЕ УЧЕНИКА:
- Текущий балл: ${currentScore}/140
- Целевой балл: ${targetScore}/140
- Дней до экзамена: ${daysUntilExam}
- Слабые темы:
${weakTopicsFormatted}

ЗАДАЧА: Создай персональный план обучения на 4 недели.

КРИТИЧЕСКИ ВАЖНО:
- Отвечай ТОЛЬКО в формате JSON
- БЕЗ markdown блоков (без \`\`\`json)
- БЕЗ текста до или после JSON
- Начни ответ с { и закончи }
- ${langInstructions[examLanguage]}

СТРУКТУРА ОТВЕТА (строго следуй):
{
  "summary": {
    "feasibility": "easy" | "medium" | "hard" | "very_hard",
    "estimatedScoreGain": число (сколько баллов сможет набрать),
    "recommendedHoursPerDay": число (рекомендуемые часы в день)
  },
  "weeklyPlan": [
    {
      "weekIndex": 1,
      "focus": "Главная тема недели",
      "topics": [
        {
          "id": число,
          "title": "Название темы",
          "objective": "Что нужно изучить и достичь"
        }
      ]
    }
  ],
  "priorityTopics": [
    {
      "topicId": число,
      "reason": "Почему эта тема приоритетна",
      "estimatedHours": число,
      "impactOnScore": число (сколько баллов добавит)
    }
  ],
  "motivationalMessage": "Мотивирующее сообщение для ученика"
}

ТРЕБОВАНИЯ К КАЧЕСТВУ:
- Минимум 4 недели в weeklyPlan
- Минимум 5 priorityTopics
- Реалистичные оценки времени
- Конкретные рекомендации, не общие фразы
- Учитывай слабые темы при планировании
- Если daysUntilExam < 30 - акцент на повторение
- Если daysUntilExam > 60 - акцент на изучение нового`;
}
