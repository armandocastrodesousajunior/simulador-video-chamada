import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function GET() {
  try {
    const media = await prisma.media.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json(media);
  } catch (error) {
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const type = formData.get("type") as string;
    const name = formData.get("name") as string;
    
    let url = "";

    if (type === "URL") {
      url = formData.get("url") as string;
      if (!url) return NextResponse.json({ error: "URL is required" }, { status: 400 });
    } else if (type === "LOCAL") {
      const file = formData.get("file") as File;
      if (!file) return NextResponse.json({ error: "File is required" }, { status: 400 });
      
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      const uploadsDir = join(process.cwd(), "public/uploads");
      if (!existsSync(uploadsDir)) {
        await mkdir(uploadsDir, { recursive: true });
      }

      const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const filePath = join(uploadsDir, fileName);
      await writeFile(filePath, buffer);
      
      url = `/uploads/${fileName}`;
    } else {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    const durationStr = formData.get("duration") as string;
    const duration = durationStr ? parseInt(durationStr, 10) : null;

    const media = await prisma.media.create({
      data: { name, type, url, duration }
    });

    return NextResponse.json(media, { status: 201 });
  } catch (error) {
    console.error("Media error:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
