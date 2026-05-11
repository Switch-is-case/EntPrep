import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";
import { eq } from "drizzle-orm";
import dotenv from "dotenv";

dotenv.config();

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

async function seed() {
  console.log("🚀 Starting Expanded Seed V3...");
  const db = drizzle(pool, { schema });

  const allSubjects = await db.query.subjects.findMany();
  const getSubId = (slug: string) => allSubjects.find(s => s.slug === slug)?.id!;

  // 1. Directions
  const directionsData = [
    { code: "it", nameRu: "Информационные технологии", nameKz: "Ақпараттық технологиялар", nameEn: "Information Technology", icon: "💻", color: "blue" },
    { code: "med", nameRu: "Медицина и Здравоохранение", nameKz: "Медицина және Денсаулық сақтау", nameEn: "Medicine & Healthcare", icon: "🏥", color: "rose" },
    { code: "edu", nameRu: "Педагогические науки", nameKz: "Педагогикалық ғылымдар", nameEn: "Education", icon: "🎓", color: "amber" },
    { code: "eng", nameRu: "Инженерные науки", nameKz: "Инженерлік ғылымдар", nameEn: "Engineering", icon: "⚙️", color: "slate" },
    { code: "hum", nameRu: "Гуманитарные науки", nameKz: "Гуманитарлық ғылымдар", nameEn: "Humanities", icon: "📚", color: "emerald" },
  ];
  await db.insert(schema.entDirections).values(directionsData).onConflictDoNothing();
  const directions = await db.query.entDirections.findMany();

  // 2. Combinations
  const combos = [
    { s1: "math", s2: "physics", year: 2025 },
    { s1: "biology", s2: "chemistry", year: 2025 },
    { s1: "math", s2: "informatics", year: 2025 },
    { s1: "world_history", s2: "english", year: 2025 },
    { s1: "geography", s2: "english", year: 2025 },
    { s1: "geography", s2: "math", year: 2025 },
    { s1: "world_history", s2: "geography", year: 2025 },
    { s1: "biology", s2: "geography", year: 2025 },
    { s1: "literature", s2: "english", year: 2025 },
    { s1: "math", s2: "chemistry", year: 2025 },
  ];
  for (const c of combos) {
    await db.insert(schema.subjectCombinations).values({
      subject1Id: getSubId(c.s1),
      subject2Id: getSubId(c.s2),
      entYear: c.year,
    }).onConflictDoNothing();
  }
  const combinations = await db.query.subjectCombinations.findMany();

  // 3. Specialties
  const specialtiesData = [
    { directionId: directions.find(d => d.code === "it")!.id, code: "6B06101", nameRu: "Информатика", nameKz: "Информатика", nameEn: "Computer Science" },
    { directionId: directions.find(d => d.code === "it")!.id, code: "6B06102", nameRu: "Информационные системы", nameKz: "Ақпараттық жүйелер", nameEn: "Information Systems" },
    { directionId: directions.find(d => d.code === "it")!.id, code: "6B06103", nameRu: "Вычислительная техника", nameKz: "Есептеуіш техника", nameEn: "Computer Engineering" },
    { directionId: directions.find(d => d.code === "med")!.id, code: "6B10101", nameRu: "Общая медицина", nameKz: "Жалпы медицина", nameEn: "General Medicine" },
    { directionId: directions.find(d => d.code === "med")!.id, code: "6B10102", nameRu: "Стоматология", nameKz: "Стоматология", nameEn: "Dentistry" },
    { directionId: directions.find(d => d.code === "med")!.id, code: "6B10103", nameRu: "Педиатрия", nameKz: "Педиатрия", nameEn: "Pediatrics" },
    { directionId: directions.find(d => d.code === "edu")!.id, code: "6B01501", nameRu: "Математика (Педагогическая)", nameKz: "Математика (Педагогикалық)", nameEn: "Mathematics Education" },
    { directionId: directions.find(d => d.code === "edu")!.id, code: "6B01502", nameRu: "Физика (Педагогическая)", nameKz: "Физика (Педагогикалық)", nameEn: "Physics Education" },
    { directionId: directions.find(d => d.code === "eng")!.id, code: "6B07101", nameRu: "Машиностроение", nameKz: "Машина жасау", nameEn: "Mechanical Engineering" },
    { directionId: directions.find(d => d.code === "eng")!.id, code: "6B07201", nameRu: "Нефтегазовое дело", nameKz: "Мұнай-газ ісі", nameEn: "Petroleum Engineering" },
  ];
  await db.insert(schema.specialties).values(specialtiesData).onConflictDoNothing();
  const allSpecialties = await db.query.specialties.findMany();

  // 4. Universities (Target: 20+)
  const unisData = [
    { nameRu: "Назарбаев Университет", nameKz: "Назарбаев Университеті", nameEn: "Nazarbayev University", cityRu: "Астана", cityKz: "Астана", cityEn: "Astana" },
    { nameRu: "КБТУ", nameKz: "ҚБТУ", nameEn: "KBTU", cityRu: "Алматы", cityKz: "Алматы", cityEn: "Almaty" },
    { nameRu: "МУИТ", nameKz: "ХАТУ", nameEn: "IITU", cityRu: "Алматы", cityKz: "Алматы", cityEn: "Almaty" },
    { nameRu: "AITU", nameKz: "AITU", nameEn: "AITU", cityRu: "Астана", cityKz: "Астана", cityEn: "Astana" },
    { nameRu: "КазНУ им. аль-Фараби", nameKz: "әл-Фараби атындағы ҚазҰУ", nameEn: "Al-Farabi KazNU", cityRu: "Алматы", cityKz: "Алматы", cityEn: "Almaty" },
    { nameRu: "ЕНУ им. Гумилева", nameKz: "Л.Н. Гумилев атындағы ЕҰУ", nameEn: "L.N. Gumilyov ENU", cityRu: "Астана", cityKz: "Астана", cityEn: "Astana" },
    { nameRu: "Сатбаев Университет", nameKz: "Сәтбаев Университеті", nameEn: "Satbayev University", cityRu: "Алматы", cityKz: "Алматы", cityEn: "Almaty" },
    { nameRu: "СДУ", nameKz: "СДУ", nameEn: "SDU", cityRu: "Каскелен", cityKz: "Қаскелең", cityEn: "Kaskelen" },
    { nameRu: "КИМЭП", nameKz: "КИМЭП", nameEn: "KIMEP", cityRu: "Алматы", cityKz: "Алматы", cityEn: "Almaty" },
    { nameRu: "КазНИТУ", nameKz: "ҚазҰТЗУ", nameEn: "KazNITU", cityRu: "Алматы", cityKz: "Алматы", cityEn: "Almaty" },
    { nameRu: "Медицинский Университет Астана", nameKz: "Астана Медицина Университеті", nameEn: "Astana Medical University", cityRu: "Астана", cityKz: "Астана", cityEn: "Astana" },
    { nameRu: "КазНМУ им. Асфендиярова", nameKz: "С.Ж. Асфендияров атындағы ҚазҰМУ", nameEn: "Asfendiyarov KazNMU", cityRu: "Алматы", cityKz: "Алматы", cityEn: "Almaty" },
    { nameRu: "Нархоз", nameKz: "Нархоз", nameEn: "Narxoz", cityRu: "Алматы", cityKz: "Алматы", cityEn: "Almaty" },
    { nameRu: "Университет Туран", nameKz: "Тұран Университеті", nameEn: "Turan University", cityRu: "Алматы", cityKz: "Алматы", cityEn: "Almaty" },
    { nameRu: "КазАТУ им. Сейфуллина", nameKz: "С.Сейфуллин атындағы ҚазАТЗУ", nameEn: "Seifullin KazATU", cityRu: "Астана", cityKz: "Астана", cityEn: "Astana" },
    { nameRu: "ЖенПУ", nameKz: "ҚыздарПУ", nameEn: "KazWMU", cityRu: "Алматы", cityKz: "Алматы", cityEn: "Almaty" },
    { nameRu: "КазУМОиМЯ им. Абылай хана", nameKz: "Абылай хан атындағы ҚазХҚжӘТУ", nameEn: "Ablai Khan KazUIR&WL", cityRu: "Алматы", cityKz: "Алматы", cityEn: "Almaty" },
    { nameRu: "КарУ им. Букетова", nameKz: "Бөкетов атындағы ҚарУ", nameEn: "Buketov KarU", cityRu: "Караганда", cityKz: "Қарағанды", cityEn: "Karaganda" },
    { nameRu: "ЮКУ им. Ауэзова", nameKz: "Әуезов атындағы ОҚУ", nameEn: "Auezov SKU", cityRu: "Шымкент", cityKz: "Шымкент", cityEn: "Shymkent" },
    { nameRu: "Торайгыров Университет", nameKz: "Торайғыров Университеті", nameEn: "Toraighyrov University", cityRu: "Павлодар", cityKz: "Павлодар", cityEn: "Pavlodar" },
  ];
  await db.insert(schema.universities).values(unisData).onConflictDoNothing();
  const allUnis = await db.query.universities.findMany();

  // 5. Programs & Scores (Target: 100+)
  console.log("Creating Programs (batching)...");
  const mathPhys = combinations.find(c => c.subject1Id === getSubId("math") && c.subject2Id === getSubId("physics"))!;
  
  for (const uni of allUnis) {
    for (const spec of allSpecialties) {
      // Logic to only link relevant specialties to combinations (simplified for seed)
      const program = await db.insert(schema.universityPrograms).values({
        universityId: uni.id,
        specialtyId: spec.id,
        combinationId: mathPhys.id,
        nameRu: `${spec.nameRu} in ${uni.nameRu}`,
        nameKz: `${spec.nameKz} (${uni.nameKz})`,
        nameEn: `${spec.nameEn} at ${uni.nameEn}`,
        language: "kz_ru",
      }).returning();

      await db.insert(schema.programScoreHistory).values({
        programId: program[0].id,
        year: 2024,
        grantScore: 90 + Math.floor(Math.random() * 45),
        minScore: 75,
      });
    }
  }

  // 6. Topics (Target: 50+)
  console.log("Creating 50+ Topics...");
  const subjectsToSeed = ["math", "physics", "chemistry", "biology", "history_kz"];
  const topicsPerSubject = 12;

  for (const sSlug of subjectsToSeed) {
    const sId = getSubId(sSlug);
    const topicsBatch = Array.from({ length: topicsPerSubject }).map((_, i) => ({
      subjectId: sId,
      nameRu: `Тема ${i + 1} по ${sSlug}`,
      nameKz: `${sSlug} бойынша ${i + 1}-тақырып`,
      nameEn: `Topic ${i + 1} for ${sSlug}`,
      orderIndex: i + 1,
    }));
    await db.insert(schema.topics).values(topicsBatch);
  }

  console.log("✅ Expanded Seed V3 Completed!");
  await pool.end();
  process.exit(0);
}

seed().catch(err => {
  console.error("❌ Seed Failed:", err);
  process.exit(1);
});
