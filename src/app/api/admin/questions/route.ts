import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, questions } from "@/db/schema";
import { getUserIdFromRequest } from "@/lib/auth";
import { eq, desc, ilike, or, sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const userId = getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const subject = searchParams.get("subject") || "";
  const search = searchParams.get("search") || "";

  try {
    let query = db.select().from(questions);

    const conditions = [];
    if (subject) {
      conditions.push(eq(questions.subject, subject));
    }
    if (search) {
      conditions.push(
        or(
          ilike(questions.questionTextRu, `%${search}%`),
          ilike(questions.questionTextKz, `%${search}%`),
          ilike(questions.questionTextEn, `%${search}%`)
        )
      );
    }

    if (conditions.length > 0) {
      // Apply conditions manually for all
      if (conditions.length === 1) {
        query = query.where(conditions[0]) as typeof query;
      } else {
        query = query.where(sql`${conditions[0]} AND ${conditions[1]}`) as typeof query;
      }
    }

    const allQuestions = await query
      .orderBy(desc(questions.id))
      .limit(limit)
      .offset((page - 1) * limit);

    const [totalCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(questions);

    return NextResponse.json({
      questions: allQuestions,
      total: Number(totalCount.count),
      page,
      limit,
      totalPages: Math.ceil(Number(totalCount.count) / limit),
    });
  } catch (error) {
    console.error("Admin questions error:", error);
    return NextResponse.json(
      { error: "Failed to load questions" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const userId = getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const {
      subject,
      questionTextRu,
      questionTextKz,
      questionTextEn,
      optionsRu,
      optionsKz,
      optionsEn,
      correctAnswer,
      difficulty,
      topic,
    } = body;

    if (!subject || !questionTextRu || !optionsRu || correctAnswer === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const [newQuestion] = await db
      .insert(questions)
      .values({
        subject,
        questionTextRu,
        questionTextKz: questionTextKz || questionTextRu,
        questionTextEn: questionTextEn || questionTextRu,
        optionsRu,
        optionsKz: optionsKz || optionsRu,
        optionsEn: optionsEn || optionsRu,
        correctAnswer,
        difficulty: difficulty || "medium",
        topic: topic || null,
      })
      .returning();

    return NextResponse.json({ question: newQuestion });
  } catch (error) {
    console.error("Create question error:", error);
    return NextResponse.json(
      { error: "Failed to create question" },
      { status: 500 }
    );
  }
}
