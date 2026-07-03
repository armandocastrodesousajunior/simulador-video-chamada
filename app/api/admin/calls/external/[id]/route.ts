import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const externalId = params.id;
    
    if (!externalId) {
      return NextResponse.json({ error: "ID externo não fornecido" }, { status: 400 });
    }

    const calls = await prisma.call.findMany({
      where: { externalId },
      include: {
        callCenter: {
          select: { 
            name: true,
            media: {
              select: { duration: true }
            }
          }
        },
        Events: true
      },
      orderBy: { createdAt: 'desc' }
    });

    const enrichedCalls = calls.map(c => {
      let watchPercentage = 0;
      const mediaDuration = c.callCenter?.media?.duration;
      
      if (typeof c.watchTime === "number" && mediaDuration && mediaDuration > 0) {
        watchPercentage = Math.min(100, Math.round((c.watchTime / mediaDuration) * 100));
      }
      
      return { ...c, watchPercentage };
    });

    return NextResponse.json(enrichedCalls);
  } catch (error) {
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
