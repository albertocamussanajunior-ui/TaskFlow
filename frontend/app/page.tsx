"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, Lock, Mail, Moon, Sun } from "lucide-react";
import { useState, type FormEvent } from "react";
import { loginUser } from "@/api/auth/fetches";
import { decodeToken, useAppStore } from "@/lib/store";
import { useTheme } from "@/lib/theme";

export default function LoginPage() {
  const router = useRouter();
  const { setAuthenticated } = useAppStore();
  const { theme, toggleTheme } = useTheme();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");
    const token = await loginUser({ email, password });

    if (!token) {
      setIsSubmitting(false);
      setError("Email ou senha inválidos.");
      return;
    }

    localStorage.setItem("cybercore_token", token);
    setAuthenticated(true, decodeToken(token));
    router.push("/manager/dashboard");
  }

  return (
    <main className="min-h-screen bg-gray-100 dark:bg-[#0f0f0f] flex items-center justify-center p-4 transition-colors duration-300">
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={theme === "dark" ? "Mudar para modo claro" : "Mudar para modo escuro"}
        className="fixed top-4 right-4 flex items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-white/10 shadow-sm hover:bg-gray-50 dark:hover:bg-white/20 transition-colors"
      >
        {theme === "dark" ? (
          <Sun size={18} className="text-white" />
        ) : (
          <Moon size={18} className="text-gray-600" />
        )}
      </button>

      <section className="w-full max-w-sm bg-white dark:bg-black/50 rounded-[28px] p-6 shadow-sm dark:shadow-2xl dark:border dark:border-white/10">
        <div className="flex items-center gap-3 mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">CyberCore</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Gestão de projectos</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="text-sm text-gray-600 dark:text-gray-400">Email</span>
            <div className="mt-2 flex items-center gap-2 rounded-2xl bg-gray-100 dark:bg-white/5 px-4 h-12 transition-all">
              <Mail size={18} className="text-gray-400 dark:text-gray-500 shrink-0" />
              <input  
                type="text"
                name="email"
                placeholder="usuario@fumilar.co.mz"
                required
                className="w-full bg-transparent outline-none text-sm text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600"
              />
            </div>
          </label>

          <label className="block">
            <span className="text-sm text-gray-600 dark:text-gray-400">Senha</span>
            <div className="mt-2 flex items-center gap-2 rounded-2xl bg-gray-100 dark:bg-white/5 px-4 h-12 transition-all">
              <Lock size={18} className="text-gray-400 dark:text-gray-500 shrink-0" />
              <input
                type="password"
                name="password"
                placeholder="Digite a sua senha"
                required
                className="w-full bg-transparent outline-none text-sm text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600"
              />
            </div>
          </label>

          {error && <p className="text-sm text-[#CC1F1F]">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 rounded-2xl bg-black/90 dark:bg-white/10 text-white flex items-center justify-center gap-2 text-sm font-medium hover:bg-black/80 dark:hover:bg-white/20 transition-colors disabled:opacity-70"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                A entrar...
              </>
            ) : (
              <>
                Entrar
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>
      </section>
    </main>
  );
}
