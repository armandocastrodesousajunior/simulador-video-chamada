import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";

    const skip = (page - 1) * limit;

    const whereClause: any = {};
    if (search) {
      whereClause.OR = [
        { externalId: { contains: search, mode: "insensitive" } },
        { token: { contains: search, mode: "insensitive" } },
        { id: { contains: search, mode: "insensitive" } },
        { callCenter: { name: { contains: search, mode: "insensitive" } } }
      ];
    }

    const [calls, total] = await Promise.all([
      prisma.call.findMany({
        where: whereClause,
        include: {
          callCenter: {
            select: { 
              name: true,
              media: { select: { duration: true } }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.call.count({ where: whereClause })
    ]);

    const enrichedCalls = calls.map(c => {
      let watchPercentage = 0;
      const mediaDuration = c.callCenter?.media?.duration;
      if (typeof c.watchTime === "number" && mediaDuration && mediaDuration > 0) {
        watchPercentage = Math.min(100, Math.round((c.watchTime / mediaDuration) * 100));
      }
      return { ...c, watchPercentage };
    });

    return NextResponse.json({
      data: enrichedCalls,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
