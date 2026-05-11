import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";
import dotenv from "dotenv";

dotenv.config();

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

async function seedQuestions() {
  console.log("🚀 Seeding 200+ ENT Questions...");
  const db = drizzle(pool, { schema });

  const allSubjects = await db.query.subjects.findMany();
  const getSub = (slug: string) => allSubjects.find(s => s.slug === slug);

  const questionsData: any[] = [];

  // --- 1. History of Kazakhstan (40 questions) ---
  const histId = getSub("history_kz")?.id;
  if (histId) {
    for (let i = 1; i <= 40; i++) {
      questionsData.push({
        subjectId: histId,
        subject: "history_kz",
        questionTextRu: `Когда произошло восстание под предводительством Кенесары Касымова? (Вопрос ${i})`,
        questionTextKz: `Кенесары Қасымұлы бастаған көтеріліс қай жылдары болды? (${i}-сұрақ)`,
        questionTextEn: `When did the uprising led by Kenesary Kasymov take place? (Question ${i})`,
        optionsRu: ["1837-1847", "1824-1830", "1850-1860", "1800-1810"],
        optionsKz: ["1837-1847", "1824-1830", "1850-1860", "1800-1810"],
        optionsEn: ["1837-1847", "1824-1830", "1850-1860", "1800-1810"],
        correctAnswer: 0,
        difficulty: "medium",
      });
    }
  }

  // --- 2. Mathematical Literacy (30 questions) ---
  const mathLitId = getSub("math_literacy")?.id;
  if (mathLitId) {
    for (let i = 1; i <= 30; i++) {
      questionsData.push({
        subjectId: mathLitId,
        subject: "math_literacy",
        questionTextRu: `Если 3 ручки стоят 150 тенге, сколько стоят 7 таких ручек? (Вопрос ${i})`,
        questionTextKz: `Егер 3 қалам 150 теңге тұрса, 7 қалам қанша тұрады? (${i}-сұрақ)`,
        questionTextEn: `If 3 pens cost 150 tenge, how much do 7 pens cost? (Question ${i})`,
        optionsRu: ["350", "300", "400", "450"],
        optionsKz: ["350", "300", "400", "450"],
        optionsEn: ["350", "300", "400", "450"],
        correctAnswer: 0,
        difficulty: "easy",
      });
    }
  }

  // --- 3. Reading Literacy (30 questions) ---
  const readLitId = getSub("reading_literacy")?.id;
  if (readLitId) {
    for (let i = 1; i <= 30; i++) {
      questionsData.push({
        subjectId: readLitId,
        subject: "reading_literacy",
        questionTextRu: `Какова основная мысль текста о важности образования? (Вопрос ${i})`,
        questionTextKz: `Білімнің маңыздылығы туралы мәтіннің негізгі ойы қандай? (${i}-сұрақ)`,
        questionTextEn: `What is the main idea of the text about the importance of education? (Question ${i})`,
        optionsRu: ["Образование - ключ к успеху", "Учиться сложно", "Школа важна", "Книги - лучшие друзья"],
        optionsKz: ["Білім - табыс кілті", "Оқу қиын", "Мектеп маңызды", "Кітап - ең жақсы дос"],
        optionsEn: ["Education is key to success", "Studying is hard", "School is important", "Books are best friends"],
        correctAnswer: 0,
        difficulty: "medium",
      });
    }
  }

  // --- 4. Profile subjects (Math, Physics, Chemistry, Biology, etc. - 100+ more) ---
  const profileSubjects = ["math", "physics", "chemistry", "biology", "geography", "english"];
  for (const slug of profileSubjects) {
    const sId = getSub(slug)?.id;
    if (sId) {
      for (let i = 1; i <= 25; i++) {
        questionsData.push({
          subjectId: sId,
          subject: slug,
          questionTextRu: `Сложный вопрос по предмету ${slug} (Вариант ${i})`,
          questionTextKz: `${slug} пәні бойынша күрделі сұрақ (${i}-нұсқа)`,
          questionTextEn: `Complex question for ${slug} (Option ${i})`,
          optionsRu: ["Вариант А", "Вариант B", "Вариант C", "Вариант D"],
          optionsKz: ["А нұсқасы", "B нұсқасы", "C нұсқасы", "D нұсқасы"],
          optionsEn: ["Option A", "Option B", "Option C", "Option D"],
          correctAnswer: Math.floor(Math.random() * 4),
          difficulty: i % 2 === 0 ? "hard" : "medium",
        });
      }
    }
  }

  // Batch insert
  console.log(`Inserting ${questionsData.length} questions...`);
  const batchSize = 50;
  for (let i = 0; i < questionsData.length; i += batchSize) {
    const batch = questionsData.slice(i, i + batchSize);
    await db.insert(schema.questions).values(batch);
    console.log(`  - Inserted batch ${i / batchSize + 1}`);
  }

  console.log("✅ Seeding Questions Completed!");
  await pool.end();
  process.exit(0);
}

seedQuestions().catch(err => {
  console.error("❌ Seed Failed:", err);
  process.exit(1);
});
