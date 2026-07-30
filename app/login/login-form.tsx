"use client";

import { useRouter } from "next/navigation";

export function LoginForm() {
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const button = e.currentTarget.querySelector("button") as HTMLButtonElement;

    button.disabled = true;
    button.textContent = "Entrando...";

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Email ou senha incorretos");
        button.disabled = false;
        button.textContent = "Entrar";
        return;
      }

      localStorage.setItem("token", data.token);
      router.push("/painel");
    } catch (err) {
      alert("Erro ao conectar com o servidor");
      button.disabled = false;
      button.textContent = "Entrar";
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label htmlFor="email">E-mail</label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="seu@email.com"
          required
          className="border rounded px-3 py-2"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="password">Senha</label>
        <input
          id="password"
          name="password"
          type="password"
          placeholder="Sua senha"
          required
          className="border rounded px-3 py-2"
        />
      </div>

      <button type="submit" className="bg-blue-600 text-white py-2 rounded">
        Entrar
      </button>

      <p className="text-sm text-gray-600 text-center">
        Use email e senha para acessar
      </p>
    </form>
  );
}
