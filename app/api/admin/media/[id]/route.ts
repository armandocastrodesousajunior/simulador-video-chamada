import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Verifica se a mídia está sendo usada por alguma central
    const count = await prisma.callCenter.count({
      where: { mediaId: id }
    });
    
    if (count > 0) {
      return NextResponse.json(
        { error: "Não é possível deletar esta mídia, pois ela está vinculada a uma ou mais centrais." },
        { status: 400 }
      );
    }
    
    await prisma.media.delete({
      where: { id }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao deletar mídia:", error);
    return NextResponse.json({ error: "Erro interno ao deletar mídia" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();
    
    const media = await prisma.media.update({
      where: { id },
      data: {
        name: data.name,
        type: data.type,
        url: data.url,
        duration: data.duration ? parseInt(data.duration) : null
      }
    });
    
    return NextResponse.json(media);
  } catch (error) {
    console.error("Erro ao atualizar mídia:", error);
    return NextResponse.json({ error: "Erro interno ao atualizar mídia" }, { status: 500 });
  }
}
