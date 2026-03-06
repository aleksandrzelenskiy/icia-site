"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, Moon, Sun, X } from "lucide-react";

import { Button } from "@/components/ui/button";

const NAV_LINKS = [
  { href: "/#hero", label: "ГЛАВНАЯ" },
  { href: "/#about", label: "О ПРОЕКТЕ" },
  { href: "/#directions", label: "НАПРАВЛЕНИЯ" },
  { href: "/#geography", label: "ГЕОГРАФИЯ" },
  { href: "/#platform", label: "ПРИЛОЖЕНИЕ" },
  { href: "/#contact", label: "КОНТАКТЫ" }
];

const THEME_STORAGE_KEY = "icia-theme";

const applyTheme = (theme: "dark" | "light") => {
  const root = document.documentElement;
  root.classList.remove("dark", "light");
  root.classList.add(theme);
};

export default function BlogSiteHeader() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const savedTheme =
      typeof window !== "undefined"
        ? window.localStorage.getItem(THEME_STORAGE_KEY)
        : null;

    if (savedTheme === "light" || savedTheme === "dark") {
      setTheme(savedTheme);
      applyTheme(savedTheme);
      return;
    }

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const systemTheme: "dark" | "light" = media.matches ? "dark" : "light";
    setTheme(systemTheme);
    applyTheme(systemTheme);

    const onSystemThemeChange = (event: MediaQueryListEvent) => {
      const hasSavedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
      if (hasSavedTheme) return;
      const next: "dark" | "light" = event.matches ? "dark" : "light";
      setTheme(next);
      applyTheme(next);
    };

    media.addEventListener("change", onSystemThemeChange);
    return () => media.removeEventListener("change", onSystemThemeChange);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
    window.localStorage.setItem(THEME_STORAGE_KEY, next);
  };

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40 border-b border-[var(--appbar-border)] bg-[var(--appbar-bg)] shadow-[var(--appbar-shadow)] backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/#hero" className="flex items-center" aria-label="На главную">
            <Image
              src={theme === "dark" ? "/logo/logo-light.png" : "/logo/logo-dark.png"}
              alt="ICIA"
              width={132}
              height={36}
              className="h-9 w-auto"
              priority
            />
          </Link>

          <nav className="hidden items-center gap-6 text-sm font-semibold text-[var(--appbar-text)]/80 min-[900px]:flex">
            {NAV_LINKS.map((item) => (
              <a key={item.href} href={item.href} className="transition hover:text-foreground">
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={toggleTheme} aria-label="Сменить тему">
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button asChild size="default" className="hidden min-[900px]:inline-flex">
              <a href="https://ws.icia.pro/" target="_blank" rel="noreferrer">
                Войти
              </a>
            </Button>
            <Button
              variant="ghost"
              className="min-[900px]:hidden"
              onClick={() => setMenuOpen(true)}
              aria-label="Открыть меню"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-24">
          <button
            className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
            onClick={() => setMenuOpen(false)}
            aria-label="Закрыть меню"
          />
          <div className="glass relative z-10 w-full max-w-sm rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm uppercase tracking-[0.2em] text-mutedForeground">Меню</p>
              <Button
                variant="ghost"
                size="default"
                onClick={() => setMenuOpen(false)}
                aria-label="Закрыть меню"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="mt-6 flex flex-col gap-4 text-base font-semibold text-foreground">
              {NAV_LINKS.map((item) => (
                <a key={item.href} href={item.href} onClick={() => setMenuOpen(false)}>
                  {item.label}
                </a>
              ))}
            </div>
            <div className="mt-6">
              <Button asChild size="lg" className="w-full">
                <a
                  href="https://ws.icia.pro/"
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setMenuOpen(false)}
                >
                  Войти
                </a>
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
