import { NextRequest, NextResponse } from "next/server";
import { registerUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, full_name } = body;

    if (!email || !password || !full_name) {
      return NextResponse.json(
        { error: "Email, senha e nome são obrigatórios" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await registerUser(email, password, full_name);

    if (!existingUser) {
      return NextResponse.json(
        { error: "Erro ao criar usuário" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      user: existingUser,
      message: "Usuário criado com sucesso",
    });
  } catch (error: any) {
    console.error("Register error:", error);

    if (error.code === "23505") {
      return NextResponse.json(
        { error: "Este email já está cadastrado" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Erro ao criar usuário" },
      { status: 500 }
    );
  }
}
