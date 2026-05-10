import { NextRequest, NextResponse } from "next/server";
import { AppError } from "@/lib/errors";

type ApiHandler = (req: NextRequest, ctx?: any) => Promise<NextResponse>;

/**
 * Оборачивает API-роут единым обработчиком ошибок.
 * Избавляет от дублирования try/catch во всех роутах.
 *
 * @example
 * export const POST = withApiHandler(async (req) => {
 *   const data = await someService.doSomething();
 *   return NextResponse.json(data);
 * });
 */
export function withApiHandler(handler: ApiHandler): ApiHandler {
  return async (req: NextRequest, ctx?: any) => {
    try {
      return await handler(req, ctx);
    } catch (error: unknown) {
      if (error instanceof AppError) {
        return NextResponse.json(
          { error: error.message, ...(error.details ? { details: error.details } : {}) },
          { status: error.statusCode }
        );
      }

      console.error("[API Error]", req.method, req.nextUrl.pathname, error);
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 }
      );
    }
  };
}
