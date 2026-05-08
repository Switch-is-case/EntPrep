import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, questions } from "@/db/schema";
import { getUserIdFromRequest } from "@/lib/auth";
import { eq } from "drizzle-orm";

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

    if (!Array.isArray(body)) {
      return NextResponse.json(
        { error: "Expected an array of questions" },
        { status: 400 }
      );
    }

    if (body.length === 0) {
      return NextResponse.json({ error: "Array is empty" }, { status: 400 });
    }

    if (body.length > 500) {
      return NextResponse.json(
        { error: "Maximum 500 questions per import" },
        { status: 400 }
      );
    }

    const errors: string[] = [];
    const validRows: typeof body = [];

    for (let i = 0; i < body.length; i++) {
      const q = body[i];
      if (!q.subject) errors.push(`Row ${i + 1}: missing "subject"`);
      else if (!q.questionTextRu) errors.push(`Row ${i + 1}: missing "questionTextRu"`);
      else if (!Array.isArray(q.optionsRu) || q.optionsRu.length < 2)
        errors.push(`Row ${i + 1}: "optionsRu" must be an array with at least 2 items`);
      else if (q.correctAnswer === undefined || q.correctAnswer === null)
        errors.push(`Row ${i + 1}: missing "correctAnswer"`);
      else validRows.push(q);
    }

    if (errors.length > 0) {
      return NextResponse.json({ error: "Validation errors", details: errors }, { status: 400 });
    }

    const inserted = await db
      .insert(questions)
      .values(
        validRows.map((q) => ({
          subject: q.subject,
          questionTextRu: q.questionTextRu,
          questionTextKz: q.questionTextKz || q.questionTextRu,
          questionTextEn: q.questionTextEn || q.questionTextRu,
          optionsRu: q.optionsRu,
          optionsKz: q.optionsKz || q.optionsRu,
          optionsEn: q.optionsEn || q.optionsRu,
          correctAnswer: Number(q.correctAnswer),
          difficulty: q.difficulty || "medium",
          topic: q.topic || null,
          imageUrl: q.imageUrl || null,
          optionImages: q.optionImages || null,
        }))
      )
      .returning({ id: questions.id });

    return NextResponse.json({
      imported: inserted.length,
      message: `Successfully imported ${inserted.length} questions`,
    });
  } catch (error) {
    console.error("Bulk import error:", error);
    return NextResponse.json({ error: "Import failed" }, { status: 500 });
  }
}
