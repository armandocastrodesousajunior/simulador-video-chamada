import { NextRequest, NextResponse } from "next/server";
import { cleanExpiredLogs, getLogExpirationDays } from "@/lib/cleanup";

export async function GET(req: NextRequest) {
  try {
    const days = getLogExpirationDays();
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    // Se passar ?run=true na URL, executa a limpeza via GET (ideal para crons/webhooks externos)
    const run = req.nextUrl.searchParams.get("run");
    if (run === "true") {
      const result = await cleanExpiredLogs();
      return NextResponse.json(result);
    }

    return NextResponse.json({
      expirationDays: days,
      cutoffDate,
      message: `Logs e chamadas com mais de ${days} dias são considerados expirados.`
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function POST() {
  try {
    const result = await cleanExpiredLogs();
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
