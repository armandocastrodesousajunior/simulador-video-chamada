import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const callId = resolvedParams.id;
    if (!callId) {
      return NextResponse.json({ error: "Call ID is required" }, { status: 400 });
    }

    // Check if the call exists
    const call = await prisma.call.findUnique({
      where: { id: callId }
    });

    if (!call) {
      return NextResponse.json({ error: "Call not found" }, { status: 404 });
    }

    // Delete CallEvents first to avoid foreign key constraint violation
    await prisma.callEvent.deleteMany({
      where: { callId }
    });

    // Delete the call
    await prisma.call.delete({
      where: { id: callId }
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting call:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
