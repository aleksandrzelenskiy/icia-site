"use client";

import { FormEvent, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [invalidLink, setInvalidLink] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setInvalidLink(params.get("error") === "invalid_link");
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setStatus("");
    setError("");

    try {
      const response = await fetch("/api/admin/auth/request-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });

      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(data.error || "Не удалось отправить ссылку");
        return;
      }

      setStatus(
        "Если email есть в списке администраторов, мы отправили ссылку для входа."
      );
      setEmail("");
    } catch {
      setError("Не удалось отправить ссылку. Попробуйте позже.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-xl items-center px-6 py-20">
      <div className="glass w-full rounded-2xl p-8">
        <h1 className="text-2xl font-semibold">Вход в админку</h1>
        <p className="mt-2 text-sm text-mutedForeground">
          Введите email администратора. Мы отправим одноразовую ссылку для входа.
        </p>

        {invalidLink && (
          <p className="mt-4 text-sm font-medium text-red-500">
            Ссылка недействительна или уже использована.
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-3">
          <Input
            type="email"
            placeholder="admin@domain.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Отправка..." : "Отправить ссылку"}
          </Button>
        </form>

        {status && <p className="mt-4 text-sm text-emerald-600 dark:text-emerald-400">{status}</p>}
        {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
      </div>
    </div>
  );
}
