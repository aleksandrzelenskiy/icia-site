"use client";

import Head from "next/head";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowUpRight,
  BarChart3,
  Camera,
  ChevronRight,
  ClipboardList,
  GraduationCap,
  Moon,
  ShieldCheck,
  Sun,
  X,
  Users
} from "lucide-react";
import TelegramIcon from "@mui/icons-material/Telegram";
import YouTubeIcon from "@mui/icons-material/YouTube";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import Tooltip from "@mui/material/Tooltip";
import { AnimatePresence, motion, useScroll, useSpring, useTransform } from "framer-motion";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } }
};

const mockupContainer = {
  hidden: { opacity: 0, x: 48 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.55, ease: "easeOut", when: "beforeChildren", staggerChildren: 0.12, delayChildren: 0.08 }
  }
};

const mockupItem = {
  hidden: { opacity: 0, x: 30 },
  show: { opacity: 1, x: 0, transition: { duration: 0.45, ease: "easeOut" } }
};

const mockupScreens = {
  contractor: {
    main: "/mockups/contractor-desktop-main.png",
    overlays: [
      "/mockups/contractor-desktop-side-1.png",
      "/mockups/contractor-desktop-side-2.png"
    ]
  },
  specialist: {
    main: "/mockups/specialist-mobile-main.png",
    overlays: [
      "/mockups/specialist-mobile-side-1.png",
      "/mockups/specialist-mobile-side-2.png"
    ]
  }
};

const preventImageContextMenu = (event: React.MouseEvent) => {
  event.preventDefault();
};

const preventImageDragStart = (event: React.DragEvent) => {
  event.preventDefault();
};

const audienceContent = {
  contractor: {
    title: "Панель подрядчика",
    description:
      "Контроль задач, фотоотчётов и статусов работ в реальном времени. Полная прозрачность объектов и затрат.",
    bullets: [
      "Менеджмент проектов и KPI",
      "Отображение задач на карте",
      "Поиск специалистов в разных регионах",
      "Согласование фотоотчётов",
      "Управление бригадами и SLA"
    ]
  },
  specialist: {
    title: "Монтажникам",
    description:
      "Личные задачи, чек-листы и рейтинг качества. Все инструменты для роста и уверенной работы вместе с ICIA.",
    bullets: ["Задачи и геолокации", "Удобное согласование работ", "Доступ ко всем задачам в одном месте", "Прозрачное взаимодействие с закзачиком", "Рейтинг и обучение"]
  }
};

const directions = [
  {
    title: "Управление проектами",
    description: "Сводные панели, SLA, контроль рисков.",
    icon: ClipboardList
  },
  {
    title: "Биржа исполнителей",
    description: "Подбор специалистов по навыкам и рейтингу.",
    icon: Users
  },
  {
    title: "Фотоотчёты",
    description: "Стандартизированные шаблоны и проверка качества.",
    icon: Camera
  },
  {
    title: "Аналитика",
    description: "Сравнение объектов и эффективности команд.",
    icon: BarChart3
  },
  {
    title: "Обучение",
    description: "Модульные программы и сертификация.",
    icon: GraduationCap
  },
  {
    title: "Ассоциация",
    description: "Единые стандарты и поддержка рынка.",
    icon: ShieldCheck
  }
];

type RegionStat = { regionCode: string; label: string; count: number };
type MapMarker = {
  coords: [number, number];
  label: string;
  count: number;
  regionCode: string;
};

const fallbackRegions: RegionStat[] = [
  { regionCode: "38", label: "Иркутская область", count: 1 }
];
const contractorOverlayImageClass = "w-full rounded-lg object-cover";
const regionGeocodeCache = new Map<string, [number, number]>();

function YandexMap() {
  const [regions, setRegions] = useState<RegionStat[]>(fallbackRegions);
  const mapInstanceRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const fetchRegions = async () => {
      try {
        const response = await fetch("/api/geography/markers", {
          cache: "no-store"
        });
        if (!response.ok) return;

        const payload = await response.json();
        const nextRegions = Array.isArray(payload?.regions) ? payload.regions : [];

        if (!cancelled && nextRegions.length > 0) {
          setRegions(nextRegions);
        }
      } catch {
        // Keep fallback regions when API is unavailable.
      }
    };

    fetchRegions();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const initMap = () => {
      const ymaps = (window as any).ymaps;
      if (!ymaps) return;

      ymaps.ready(async () => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.destroy();
          mapInstanceRef.current = null;
        }

        const mapInstance = new ymaps.Map("icia-map", {
          center: [61.524, 105.318],
          zoom: 3,
          controls: []
        });

        const resolvedMarkers = (
          await Promise.all(
            regions.map(async (region): Promise<MapMarker | null> => {
              const cachedCoords = regionGeocodeCache.get(region.regionCode);
              if (cachedCoords) {
                return {
                  coords: cachedCoords,
                  label: region.label,
                  count: region.count,
                  regionCode: region.regionCode
                };
              }

              try {
                const geocodeResult = await ymaps.geocode(`${region.label}, Россия`, {
                  results: 1
                });
                const first = geocodeResult.geoObjects.get(0);
                const coords = first?.geometry?.getCoordinates?.();
                if (!Array.isArray(coords) || coords.length !== 2) return null;
                const normalized: [number, number] = [coords[0], coords[1]];
                regionGeocodeCache.set(region.regionCode, normalized);
                return {
                  coords: normalized,
                  label: region.label,
                  count: region.count,
                  regionCode: region.regionCode
                };
              } catch {
                return null;
              }
            })
          )
        ).filter((marker): marker is MapMarker => marker !== null);

        resolvedMarkers.forEach((marker) => {
          mapInstance.geoObjects.add(
            new ymaps.Placemark(
              marker.coords,
              {
                iconCaption: `${marker.count}`,
                balloonContent: `${marker.label}: ${marker.count} пользователей`
              },
              { preset: "islands#blueCircleDotIconWithCaption" }
            )
          );
        });

        mapInstanceRef.current = mapInstance;
      });
    };

    const existingScript = document.getElementById("yandex-maps-script") as HTMLScriptElement | null;
    if (!(window as any).ymaps && !existingScript) {
      const yandexMapsApiKey = process.env.NEXT_PUBLIC_YANDEX_MAPS_APIKEY;
      const script = document.createElement("script");
      script.id = "yandex-maps-script";
      script.src =
        `https://api-maps.yandex.ru/2.1/?lang=ru_RU&apikey=${yandexMapsApiKey ?? ""}`;
      script.async = true;
      script.onload = initMap;
      document.body.appendChild(script);
    } else if (existingScript && !(window as any).ymaps) {
      existingScript.addEventListener("load", initMap, { once: true });
    } else {
      initMap();
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.destroy();
        mapInstanceRef.current = null;
      }
    };
  }, [regions]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const active = Boolean(document.fullscreenElement);
      setIsFullscreen(active);
      if (active && mapInstanceRef.current?.container?.fitToViewport) {
        setTimeout(() => mapInstanceRef.current.container.fitToViewport(), 0);
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const toggleFullscreen = async () => {
    const container = mapContainerRef.current as any;
    if (!container) return;

    if (document.fullscreenElement) {
      await document.exitFullscreen();
      return;
    }

    if (container.requestFullscreen) {
      await container.requestFullscreen();
    } else if (container.webkitRequestFullscreen) {
      container.webkitRequestFullscreen();
    }
  };

  return (
    <div
      ref={mapContainerRef}
      className="glass relative h-[420px] w-full max-w-full min-w-0 overflow-hidden rounded-2xl"
    >
      <div id="icia-map" className="h-full w-full" />
      <button
        type="button"
        onClick={toggleFullscreen}
        className="absolute right-3 top-3 z-10 rounded-full border border-white/30 bg-white/80 px-3 py-1 text-xs font-semibold text-slate-900 shadow-sm transition hover:bg-white"
      >
        {isFullscreen ? "Обычный режим" : "На весь экран"}
      </button>
    </div>
  );
}

export default function Home() {
  const headerRef = useRef<HTMLElement | null>(null);
  const missionRef = useRef<HTMLDivElement | null>(null);
  const platformRef = useRef<HTMLElement | null>(null);
  const { scrollYProgress: missionProgress } = useScroll({
    target: missionRef,
    offset: ["start end", "end start"]
  });
  const missionBgYRaw = useTransform(missionProgress, [0, 1], ["-30%", "30%"]);
  const missionBgY = useSpring(missionBgYRaw, {
    stiffness: 90,
    damping: 26,
    mass: 0.6
  });
  const { scrollYProgress: platformProgress } = useScroll({
    target: platformRef,
    offset: ["start end", "end start"]
  });
  const platformMainYRaw = useTransform(platformProgress, [0, 1], [68, -68]);
  const platformOverlayTopYRaw = useTransform(platformProgress, [0, 1], [96, -96]);
  const platformOverlayTopXRaw = useTransform(platformProgress, [0, 1], [40, -40]);
  const platformOverlayBottomYRaw = useTransform(platformProgress, [0, 1], [-76, 76]);
  const platformOverlayBottomXRaw = useTransform(platformProgress, [0, 1], [-32, 32]);
  const springParallax = { stiffness: 90, damping: 26, mass: 0.45 };
  const platformMainY = useSpring(platformMainYRaw, springParallax);
  const platformOverlayTopY = useSpring(platformOverlayTopYRaw, springParallax);
  const platformOverlayTopX = useSpring(platformOverlayTopXRaw, springParallax);
  const platformOverlayBottomY = useSpring(platformOverlayBottomYRaw, springParallax);
  const platformOverlayBottomX = useSpring(platformOverlayBottomXRaw, springParallax);

  const [audience, setAudience] = useState<"contractor" | "specialist">(
    "contractor"
  );
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    role: "contractor",
    message: ""
  });
  const [company, setCompany] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("light");
  const [menuOpen, setMenuOpen] = useState(false);

  const preview = useMemo(() => audienceContent[audience], [audience]);

  const setDocumentTheme = (nextTheme: "dark" | "light") => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    root.classList.remove("dark", "light");
    root.classList.add(nextTheme);
  };

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    setDocumentTheme(nextTheme);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("icia-theme", nextTheme);
    }
  };

  useEffect(() => {
    const handleContextMenu = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.tagName === "IMG" || target?.closest("img")) {
        event.preventDefault();
      }
    };

    const handleDragStart = (event: DragEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.tagName === "IMG" || target?.closest("img")) {
        event.preventDefault();
      }
    };

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("dragstart", handleDragStart);
    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("dragstart", handleDragStart);
    };
  }, []);

  useEffect(() => {
    const savedTheme =
      typeof window !== "undefined"
        ? window.localStorage.getItem("icia-theme")
        : null;
    if (savedTheme === "light" || savedTheme === "dark") {
      setTheme(savedTheme);
      setDocumentTheme(savedTheme);
    } else {
      setDocumentTheme(theme);
    }
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.style.overflow = menuOpen ? "hidden" : "";
  }, [menuOpen]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const syncAnchorOffset = () => {
      const headerHeight = headerRef.current?.offsetHeight ?? 0;
      const rootStyles = window.getComputedStyle(document.documentElement);
      const anchorGap = Number.parseFloat(
        rootStyles.getPropertyValue("--anchor-gap")
      );
      const topGap = Number.isFinite(anchorGap) ? anchorGap : 10;
      document.documentElement.style.setProperty(
        "--appbar-height",
        `${headerHeight}px`
      );
      document.documentElement.style.setProperty(
        "--anchor-offset",
        `${topGap}px`
      );
    };

    syncAnchorOffset();
    window.addEventListener("resize", syncAnchorOffset);
    return () => window.removeEventListener("resize", syncAnchorOffset);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleAnchorClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const anchor = target?.closest("a[href]") as HTMLAnchorElement | null;
      if (!anchor) return;

      const href = anchor.getAttribute("href") ?? "";
      const isHashOnly = href.startsWith("#");
      const isSamePageHash = href.startsWith("/#");
      if (!isHashOnly && !isSamePageHash) return;

      const hash = isHashOnly ? href : href.slice(1);
      const id = hash.replace(/^#/, "");
      const destination = document.getElementById(id);
      if (!destination) return;

      event.preventDefault();

      const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const rootStyles = window.getComputedStyle(document.documentElement);
      const offset = Number.parseFloat(rootStyles.getPropertyValue("--anchor-offset")) || 0;
      const targetTop = destination.getBoundingClientRect().top + window.scrollY - offset;

      if (prefersReduced) {
        window.scrollTo(0, targetTop);
        return;
      }

      const startTop = window.scrollY;
      const distance = targetTop - startTop;
      const duration = 700;
      const startTime = performance.now();

      const easeInOutCubic = (t: number) =>
        t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

      const step = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = easeInOutCubic(progress);
        window.scrollTo(0, startTop + distance * eased);
        if (progress < 1) requestAnimationFrame(step);
      };

      requestAnimationFrame(step);
    };

    document.addEventListener("click", handleAnchorClick);
    return () => document.removeEventListener("click", handleAnchorClick);
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;
    const nextErrors: Record<string, string> = {};

    if (!formState.name.trim()) nextErrors.name = "Введите имя";
    if (!formState.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      nextErrors.email = "Введите корректный email";
    }
    if (!formState.message.trim()) nextErrors.message = "Добавьте сообщение";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);
    setSubmitted(false);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formState, company })
      });

      if (!response.ok) {
        let errorMessage = "Не удалось отправить сообщение. Попробуйте позже.";
        try {
          const payload = await response.json();
          if (payload?.error) errorMessage = payload.error;
        } catch {
          // ignore invalid JSON
        }
        setErrors({ form: errorMessage });
        return;
      }

      setSubmitted(true);
      setFormState({ name: "", email: "", role: "contractor", message: "" });
      setCompany("");
    } catch {
      setErrors({ form: "Не удалось отправить сообщение. Попробуйте позже." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Head>
        <title>ICIA — Industrial Cellular Installer Association</title>
        <meta
          name="description"
          content="ICIA объединяет подрядчиков и инженеров сотовой связи по всей России: управление проектами, аналитика и обучение."
        />
      </Head>

      <header ref={headerRef} className="fixed inset-x-0 top-0 z-40 border-b border-[var(--appbar-border)] bg-[var(--appbar-bg)] shadow-[var(--appbar-shadow)] backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <a href="/#hero" className="flex items-center" aria-label="На главный экран">
            <Image
              src={theme === "dark" ? "/logo/logo-light.png" : "/logo/logo-dark.png"}
              alt="ICIA"
              width={132}
              height={36}
              className="h-9 w-auto"
              draggable={false}
              onContextMenu={preventImageContextMenu}
              onDragStart={preventImageDragStart}
              priority
            />
          </a>
          <nav className="hidden items-center gap-6 text-sm font-semibold text-[var(--appbar-text)]/80 min-[900px]:flex">
            <a href="/#about" className="transition hover:text-foreground">О ПРОЕКТЕ</a>
            <a href="/#directions" className="transition hover:text-foreground">НАПРАВЛЕНИЯ</a>
            <a href="/#platform" className="transition hover:text-foreground">ПРИЛОЖЕНИЕ</a>
            <a href="/#contact" className="transition hover:text-foreground">КОНТАКТЫ</a>
          </nav>
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={toggleTheme} aria-label="Сменить тему">
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
            <Button asChild size="default" className="hidden min-[900px]:inline-flex">
              <a href="https://ws.icia.pro/" target="_blank" rel="noreferrer">
                Войти
              </a>
            </Button>
            <Button
              variant="ghost"
              className="min-[900px]:hidden"
              aria-label="Открыть меню"
              onClick={() => setMenuOpen(true)}
            >
              <span className="flex h-5 w-6 flex-col items-center justify-between">
                <span className="h-[2px] w-full rounded-full bg-current" />
                <span className="h-[2px] w-full rounded-full bg-current" />
                <span className="h-[2px] w-full rounded-full bg-current" />
              </span>
            </Button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-24"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.button
              className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
              onClick={() => setMenuOpen(false)}
              aria-label="Закрыть меню"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.div
              className="glass relative w-full max-w-sm rounded-2xl p-6"
              initial={{ y: -20, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -10, opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm uppercase tracking-[0.2em] text-mutedForeground">
                  Меню
                </p>
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
                <a href="/#about" onClick={() => setMenuOpen(false)}>О ПРОЕКТЕ</a>
                <a href="/#directions" onClick={() => setMenuOpen(false)}>НАПРАВЛЕНИЯ</a>
                <a href="/#platform" onClick={() => setMenuOpen(false)}>ПРИЛОЖЕНИЕ</a>
                <a href="/#contact" onClick={() => setMenuOpen(false)}>КОНТАКТЫ</a>
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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <section id="hero" className="relative flex h-screen items-center overflow-hidden pt-28">
        <div className="absolute inset-0">
          <video
            className="h-full w-full object-cover opacity-60"
            autoPlay
            loop
            muted
            playsInline
          >
            <source src="/hero.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-white/55 via-white/20 to-white/0 dark:from-[#0b0d11]/70 dark:via-[#151b24]/70 dark:to-[#0c1017]" />
          <div className="absolute inset-0 bg-hero-radial opacity-35" />
        </div>

        <div className="relative mx-auto flex w-full max-w-5xl flex-col items-center justify-center gap-10 px-6 text-center">
          <motion.div
            className="flex flex-col items-center gap-8"
            initial="hidden"
            animate="show"
            variants={stagger}
          >
            <motion.p
              className="text-sm uppercase tracking-[0.2em] text-mutedForeground"
              variants={fadeUp}
            >
              Industrial Cellular Installer Association
            </motion.p>
            <motion.h1
              className="text-4xl font-semibold leading-tight text-foreground sm:text-6xl lg:text-7xl"
              variants={fadeUp}
            >
              Ассоциация<span className="text-gradient"> специалистов сотовой связи</span>
            </motion.h1>
            <motion.p
              className="max-w-2xl text-lg text-black dark:text-mutedForeground"
              variants={fadeUp}
            >
              Платформа для подрядчиков и исполнителей по всей России: единые
              стандарты, контроль качества и аналитика работ в режиме реального
              времени.
            </motion.p>
            <motion.div variants={fadeUp}>
              <Button asChild size="xl">
                <a href="/#about">Узнать больше <ArrowUpRight className="h-4 w-4" /></a>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>
      <motion.section
        id="about"
        className="mx-auto grid w-full max-w-6xl gap-12 px-6 py-24 md:grid-cols-[1.1fr_0.9fr]"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.25 }}
        variants={stagger}
      >
        <motion.div className="space-y-6" variants={fadeUp}>
          <p className="text-sm uppercase tracking-[0.2em] text-mutedForeground">
            О проекте
          </p>
          <h2 className="text-3xl font-semibold leading-tight sm:text-4xl">
            Кто мы?
          </h2>
          <div className="space-y-4 text-base sm:text-lg lg:text-xl text-mutedForeground">
            <p>
              ICIA объединяет подрядчиков, инженеров, операторов, проектировщиков
              объектов связи и специалистов по монтажу сотовой инфраструктуры. Мы
              создаём стандарт качества, цифровую платформу для управления
              проектами и сообщество, которое помогает рынку развиваться эффективнее.
            </p>
            <p>
              Платформа фиксирует каждую задачу, автоматизирует фотоотчёты,
              отслеживает статус объектов и формирует аналитику для руководителей
              проектов.
            </p>
            <p>
             Будем рады видеть Вас с нами!
            </p>
          </div>
          <Button asChild size="lg">
            <a href="https://ws.icia.pro/" target="_blank" rel="noreferrer">
              Присоедениться
            </a>
          </Button>
        </motion.div>
        <motion.div className="space-y-4" variants={fadeUp}>
          {[
            {
              title: "Единые стандарты",
              text: "Чёткие регламенты и прозрачные SLA для всех участников рынка."
            },
            {
              title: "Сильная команда",
              text: "Проверенные исполнители, подтверждение квалификации и системы рейтинга."
            },
            {
              title: "Цифровой контроль",
              text: "Инструменты управления задачами и контроля качества работ."
            },
            {
              title: "Монтажники и Проектировщики",
              text: "Инженеры под любые задачи: инсталляторы и проектировщики."
            }
          ].map((item) => (
            <div
              key={item.title}
              className="glass rounded-2xl p-5"
            >
              <p className="text-lg font-semibold">{item.title}</p>
              <p className="mt-2 text-sm text-mutedForeground">{item.text}</p>
            </div>
          ))}
        </motion.div>
      </motion.section>
      <motion.section
        id="mission"
        ref={missionRef}
        className="relative flex h-screen w-full items-center justify-center overflow-hidden"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
        variants={stagger}
      >
        <motion.div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            y: missionBgY,
            backgroundImage: "url(/mission-bg.jpg)"
          }}
        />
        <div className="absolute inset-0 bg-black/40" />
        <motion.div
          className="relative mx-auto w-full max-w-3xl rounded-2xl px-8 py-16 text-center glass bg-white/3 dark:bg-white/3"
          style={{
            backdropFilter: "blur(3px) saturate(165%)",
            WebkitBackdropFilter: "blur(3px) saturate(165%)"
          }}
          variants={fadeUp}
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.16),transparent_65%)]" />
          <p className="text-sm uppercase tracking-[0.2em] text-mutedForeground">
            Наша миссия
          </p>
          <h2 className="mt-4 text-3xl font-semibold sm:text-4xl">
            Объединить специалистов сотовой связи по всей стране,
            чтобы вместе строить
            <span className="text-gradient"> качественную, надежную и современную инфраструктуру.</span>
          </h2>
          <p className="mt-4 text-base text-mutedForeground">
            Мы стремимся повысить качество работ, обеспечить безопасность и
            создать среду для профессионального развития специалистов во всех регионах.
          </p>
        </motion.div>
      </motion.section>
      <motion.section
        id="directions"
        className="mx-auto w-full max-w-6xl px-6 py-24"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        variants={stagger}
      >
        <motion.div className="flex items-center justify-between" variants={fadeUp}>
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-mutedForeground">
              Направления
            </p>
            <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">
              Направления деятельности ICIA
            </h2>
          </div>

        </motion.div>
        <motion.div
          className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          variants={stagger}
        >
          {directions.map((direction) => (
            <motion.div
              key={direction.title}
              className="glass relative flex h-full flex-col gap-4 overflow-hidden rounded-2xl p-6 text-center"
              variants={fadeUp}
              whileHover={{ y: -6 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <div className="relative z-10 pt-20">
                <p className="text-lg font-semibold">{direction.title}</p>
                <p className="mt-2 text-sm text-mutedForeground">
                  {direction.description}
                </p>
              </div>
              <div className="pointer-events-none absolute left-1/2 top-6 flex h-20 w-20 -translate-x-1/2 items-center justify-center opacity-80">
                <direction.icon
                  className="h-full w-full text-primary/25"
                  strokeWidth={0.9}
                />
              </div>
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-white/70 to-transparent dark:from-black/60" />
            </motion.div>
          ))}
        </motion.div>
      </motion.section>
      <motion.section
        id="geography"
        className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-24 lg:grid-cols-[1fr_1.1fr]"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        variants={stagger}
      >
        <motion.div className="space-y-6" variants={fadeUp}>
          <p className="text-sm uppercase tracking-[0.2em] text-mutedForeground">
            География
          </p>
          <h2 className="text-3xl font-semibold sm:text-4xl">
            ICIA объеденяет специалистов по всей стране
          </h2>
          <p className="text-mutedForeground">
            Мы только начинаем, но уже работаем в нескольких регионах — и
            приглашаем специалистов и подрядчиков со всей России.
          </p>
          <p className="text-mutedForeground">
            Наша цель — создать единую платформу для управления проектами,
            поиска исполнителей и контроля качества от Калининграда до
            Владивостока.
          </p>
          <div className="mt-4">
            <Button asChild size="lg">
              <a href="https://ws.icia.pro/" target="_blank" rel="noreferrer">
                Присоедениться
              </a>
            </Button>
          </div>
        </motion.div>
        <motion.div className="relative" variants={fadeUp}>
          <YandexMap />
        </motion.div>
      </motion.section>
      <motion.section
        id="platform"
        ref={platformRef}
        className="mx-auto w-full max-w-6xl px-6 py-24"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        variants={stagger}
      >
        <motion.div className="flex flex-col gap-4" variants={fadeUp}>
          <p className="text-sm uppercase tracking-[0.2em] text-mutedForeground">
            Платформа
          </p>
          <div className="flex flex-wrap items-center justify-between gap-6">
            <h2 className="text-3xl font-semibold sm:text-4xl">
              Приложение ICIA для всех участников
            </h2>
            <div className="flex items-center gap-3 rounded-2xl border border-black/5 bg-white/70 p-2 dark:border-white/10 dark:bg-white/5">
              <Button
                variant={audience === "contractor" ? "default" : "ghost"}
                onClick={() => setAudience("contractor")}
              >
                Для подрядчика
              </Button>
              <Button
                variant={audience === "specialist" ? "default" : "ghost"}
                onClick={() => setAudience("specialist")}
              >
                Для исполнителя
              </Button>
            </div>
          </div>
        </motion.div>
        <motion.div
          className="mt-10 grid gap-8 lg:grid-cols-[1fr_1.1fr]"
          variants={stagger}
        >
          <motion.div
            className="glass rounded-2xl p-6"
            variants={fadeUp}
          >
            <p className="text-lg font-semibold">{preview.title}</p>
            <p className="mt-3 text-sm text-mutedForeground">
              {preview.description}
            </p>
            <ul className="mt-6 space-y-3 text-sm text-mutedForeground">
              {preview.bullets.map((bullet) => (
                <li key={bullet} className="flex items-center gap-2">
                  <ChevronRight className="h-4 w-4 text-primary" />
                  {bullet}
                </li>
              ))}
            </ul>

            {audience === "specialist" && (
              <div className="mt-8 border-t border-black/10 pt-6 dark:border-white/10">
                <p className="text-lg font-semibold">Проектировщикам</p>
                <p className="mt-3 text-sm text-mutedForeground">
                  Шаблоны документации и прозрачная коммуникация.
                  Всё для эффективной удалённой работы и роста в профессиональном
                  сообществе ICIA.
                </p>
                <ul className="mt-6 space-y-3 text-sm text-mutedForeground">
                  {[
                    "Задания сразу с исходными данными",
                    "Удобная сдача чертежей и документов",
                    "Коммуникация с подрядчиком в одном окне",
                    "Отслеживание статуса согласований",
                    "Доступ к удаленнм задачам в любых регионах"
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <ChevronRight className="h-4 w-4 text-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
          <motion.div
            className="relative flex items-center justify-center"
            variants={fadeUp}
          >
            <AnimatePresence mode="wait">
              {audience === "contractor" ? (
                <motion.div
                  key="contractor-mockup"
                  className="w-full max-w-[560px]"
                  initial="hidden"
                  animate="show"
                  exit={{ opacity: 0, x: 24, transition: { duration: 0.2 } }}
                  variants={mockupContainer}
                  style={{ y: platformMainY }}
                >
                  <div className="rounded-[1.6rem] border border-slate-900/60 bg-slate-950 p-3 shadow-[0_20px_50px_rgba(15,23,42,0.3)]">
                    <div className="rounded-[0.95rem] bg-slate-800 px-4 pb-3 pt-2">
                      <div className="mb-2 flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-full bg-rose-400/70" />
                        <span className="h-2.5 w-2.5 rounded-full bg-amber-300/70" />
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
                      </div>
                      <div className="relative overflow-hidden rounded-[0.8rem] border border-slate-700/80">
                        <img
                          src={mockupScreens.contractor.main}
                          alt="Скриншот интерфейса подрядчика"
                          className="h-full w-full object-cover"
                          draggable={false}
                          onContextMenu={preventImageContextMenu}
                          onDragStart={preventImageDragStart}
                        />
                      </div>
                    </div>
                  </div>
                  <motion.div
                    className="absolute -right-10 top-4 w-56 overflow-hidden rounded-xl border border-slate-300/60 bg-white/95 p-1.5 shadow-lg md:w-60 lg:w-64 dark:border-slate-700/80 dark:bg-slate-900/90"
                    variants={mockupItem}
                    style={{ y: platformOverlayTopY, x: platformOverlayTopX }}
                  >
                    <img
                      src={mockupScreens.contractor.overlays[0]}
                      alt="Дополнительный скриншот подрядчика 1"
                      className={contractorOverlayImageClass}
                      draggable={false}
                      onContextMenu={preventImageContextMenu}
                      onDragStart={preventImageDragStart}
                    />
                  </motion.div>
                  <motion.div
                    className="absolute -bottom-10 right-6 w-60 overflow-hidden rounded-xl border border-slate-300/60 bg-white/95 p-1.5 shadow-lg md:w-64 lg:w-72 dark:border-slate-700/80 dark:bg-slate-900/90"
                    variants={mockupItem}
                    style={{ y: platformOverlayBottomY, x: platformOverlayBottomX }}
                  >
                    <img
                      src={mockupScreens.contractor.overlays[1]}
                      alt="Дополнительный скриншот подрядчика 2"
                      className={contractorOverlayImageClass}
                      draggable={false}
                      onContextMenu={preventImageContextMenu}
                      onDragStart={preventImageDragStart}
                    />
                  </motion.div>
                  <motion.div
                    className="mx-auto h-3 w-[86%] rounded-b-[2rem] bg-slate-300/80 shadow-inner dark:bg-slate-700/90"
                    variants={mockupItem}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="specialist-mockup"
                  className="w-full max-w-[340px]"
                  initial="hidden"
                  animate="show"
                  exit={{ opacity: 0, x: 24, transition: { duration: 0.2 } }}
                  variants={mockupContainer}
                  style={{ y: platformMainY }}
                >
                  <div className="rounded-[2.2rem] border border-slate-900/60 bg-slate-900 p-2 shadow-[0_24px_50px_rgba(15,23,42,0.35)]">
                    <div className="overflow-hidden rounded-[1.8rem] bg-slate-950 p-2">
                      <div className="mx-auto mb-2 h-1.5 w-16 rounded-full bg-slate-700" />
                      <div className="overflow-hidden rounded-[1.45rem] border border-slate-800/80">
                        <img
                          src={mockupScreens.specialist.main}
                          alt="Скриншот интерфейса исполнителя"
                          className="h-full w-full object-cover"
                          draggable={false}
                          onContextMenu={preventImageContextMenu}
                          onDragStart={preventImageDragStart}
                        />
                      </div>
                    </div>
                  </div>
                  <motion.div
                    className="absolute -right-12 top-12 w-44 overflow-hidden rounded-xl border border-slate-300/60 bg-white/95 p-1.5 shadow-lg dark:border-slate-700/80 dark:bg-slate-900/90"
                    variants={mockupItem}
                    style={{ y: platformOverlayTopY, x: platformOverlayTopX }}
                  >
                    <img
                      src={mockupScreens.specialist.overlays[0]}
                      alt="Дополнительный скриншот исполнителя 1"
                      className="w-full rounded-lg object-cover"
                      draggable={false}
                      onContextMenu={preventImageContextMenu}
                      onDragStart={preventImageDragStart}
                    />
                  </motion.div>
                  <motion.div
                    className="absolute -bottom-9 -left-12 w-48 overflow-hidden rounded-xl border border-slate-300/60 bg-white/95 p-1.5 shadow-lg dark:border-slate-700/80 dark:bg-slate-900/90"
                    variants={mockupItem}
                    style={{ y: platformOverlayBottomY, x: platformOverlayBottomX }}
                  >
                    <img
                      src={mockupScreens.specialist.overlays[1]}
                      alt="Дополнительный скриншот исполнителя 2"
                      className="w-full rounded-lg object-cover"
                      draggable={false}
                      onContextMenu={preventImageContextMenu}
                      onDragStart={preventImageDragStart}
                    />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </motion.section>

      <motion.section
        className="mx-auto w-full max-w-6xl px-6 py-20"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        variants={stagger}
      >
        <motion.div
          className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]"
          variants={fadeUp}
        >
          <div className="space-y-6">
            <p className="text-sm uppercase tracking-[0.2em] text-mutedForeground">
              Преимущества для подрядчиков
            </p>
            <h2 className="text-3xl font-semibold sm:text-4xl">
              Контроль, эффективность, аналитика
            </h2>
            <ul className="space-y-3 text-mutedForeground">
              {["Сокращение сроков работ", "Прозрачный контроль качества", "Аналитика по регионам и исполнителям"].map(
                (item) => (
                  <li key={item} className="flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full bg-primary" />
                    {item}
                  </li>
                )
              )}
            </ul>
            <Button asChild size="lg">
              <a href="https://ws.icia.pro/" target="_blank" rel="noreferrer">
                Присоединиться как подрядчик
              </a>
            </Button>
          </div>
          <div className="grid gap-4">
            {[
              {
                title: "Единый контроль объектов",
                description: "Вся информация по задачам и объектам и задачам — в одном месте. Удобно, прозрачно, без лишних чатов.",
              },
              {
                title: "Быстрые отчёты",
                description: "Фотооотчеты, прогресс и планирование задач — в пару кликов. Больше не нужно собирать отчёты вручную.",
              },
              {
                title: "Поиск исполнителей",
                description: "Найди нужную бригаду или инженера-проектировщика в любом регионе — быстро, с проверенным опытом и рейтингом.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="glass rounded-2xl p-5"
              >
                <p className="text-sm font-semibold">{item.title}</p>
                <p className="mt-2 text-xs text-mutedForeground">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.section>

      <motion.section
        className="mx-auto w-full max-w-6xl px-6 py-20"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        variants={stagger}
      >
        <motion.div
          className="grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]"
          variants={fadeUp}
        >
          <div className="order-2 grid gap-4 lg:order-1">
            {[
              {
                title: "Задачи и геолокации",
                description:
                  "Вся информация по работе — что делать, где и к какому сроку. Удобно и понятно. Комфортное взаимодействие с заказчиком.",
              },
              {
                title: "Фотоотчёты и подтверждение работ",
                description:
                  "Загружай фото прямо с объекта — заказчик видит результат, ты быстрее получаешь оплату.",
              },
              {
                title: "Рейтинг и обучение",
                description:
                  "Работай стабильно, прокачивай навыки и повышай рейтинг — тебя будут приглашать чаще.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="glass rounded-2xl p-5"
              >
                <p className="text-sm font-semibold">{item.title}</p>
                <p className="mt-2 text-xs text-mutedForeground">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
          <div className="order-1 space-y-6 lg:order-2">
            <p className="text-sm uppercase tracking-[0.2em] text-mutedForeground">
              Преимущества для исполнителей
            </p>
            <h2 className="text-3xl font-semibold sm:text-4xl">
              Стабильные задачи и рост рейтинга
            </h2>
            <ul className="space-y-3 text-mutedForeground">
              {["Быстрый доступ к задачам", "Поиск публичных заказов", "Прозрачный учёт оплат", "Обучение и повышение квалификации"].map(
                (item) => (
                  <li key={item} className="flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full bg-primary" />
                    {item}
                  </li>
                )
              )}
            </ul>
            <Button asChild size="lg">
              <a href="https://ws.icia.pro/" target="_blank" rel="noreferrer">
                Присоединиться как специалист
              </a>
            </Button>
          </div>
        </motion.div>
      </motion.section>
      <motion.section
        id="contact"
        className="mx-auto w-full max-w-5xl px-6 py-24"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        variants={stagger}
      >
        <motion.div className="text-center" variants={fadeUp}>
          <p className="text-sm uppercase tracking-[0.2em] text-mutedForeground">
            Связаться с ICIA
          </p>
          <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">
            Будем рады ответить Вам
          </h2>
          <p className="mt-3 text-mutedForeground">
            Оставьте вопрос, и мы ответим в течение одного рабочего дня.
          </p>
        </motion.div>

        <motion.form
          onSubmit={handleSubmit}
          className="glass mt-10 grid gap-6 rounded-2xl p-8"
          variants={fadeUp}
        >
          <div className="sr-only" style={{ position: "absolute", left: "-9999px" }} aria-hidden="true">
            <Label htmlFor="company">Компания</Label>
            <Input
              id="company"
              name="company"
              value={company}
              onChange={(event) => setCompany(event.target.value)}
              tabIndex={-1}
              autoComplete="off"
            />
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Имя</Label>
              <Input
                id="name"
                value={formState.name}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, name: event.target.value }))
                }
                placeholder="Иван Петров"
              />
              {errors.name && (
                <p className="text-xs text-red-300">{errors.name}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formState.email}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, email: event.target.value }))
                }
                placeholder="name@company.ru"
              />
              {errors.email && (
                <p className="text-xs text-red-300">{errors.email}</p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Роль</Label>
            <select
              id="role"
              value={formState.role}
              onChange={(event) =>
                setFormState((prev) => ({ ...prev, role: event.target.value }))
              }
              className={cn(
                "h-11 w-full rounded-2xl border border-border bg-transparent px-4 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              )}
            >
              <option value="contractor">Подрядчик</option>
              <option value="specialist">Исполнитель</option>
              <option value="operator">Оператор</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Сообщение</Label>
            <Textarea
              id="message"
              value={formState.message}
              onChange={(event) =>
                setFormState((prev) => ({ ...prev, message: event.target.value }))
              }
              placeholder="Коротко опишите запрос"
            />
            {errors.message && (
              <p className="text-xs text-red-300">{errors.message}</p>
            )}
          </div>
          <Button type="submit" size="lg" disabled={isSubmitting}>
            {isSubmitting ? "Отправка..." : "Отправить"}
          </Button>
          {errors.form && (
            <p className="text-sm text-red-300">{errors.form}</p>
          )}
          {submitted && (
            <Alert className="border-primary/40">
              <AlertTitle>Спасибо!</AlertTitle>
              <AlertDescription>
                Заявка отправлена. Мы свяжемся с вами в ближайшее время.
              </AlertDescription>
            </Alert>
          )}
        </motion.form>
      </motion.section>

      <footer className="border-t border-black/5 bg-white/70 dark:border-white/10 dark:bg-[#0b1224]">
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-6 py-12 md:grid-cols-[1.2fr_1fr_1fr]">
          <div className="space-y-3">
            <p className="text-sm uppercase tracking-[0.2em] text-mutedForeground">
              ICIA
            </p>
            <p className="text-mutedForeground">
              Industrial Cellular Installer Association
            </p>
            <p className="text-xs text-mutedForeground">
              Политика конфиденциальности / 152-ФЗ
            </p>
          </div>
          <div className="space-y-2 text-sm text-mutedForeground">
            <p className="text-xs uppercase tracking-[0.2em]">Меню</p>
            <a href="/#about" className="block hover:text-foreground">О проекте</a>
            <a href="/#platform" className="block hover:text-foreground">Приложение</a>
            <a href="/#contact" className="block hover:text-foreground">Контакты</a>
          </div>
          <div className="space-y-3 text-sm text-mutedForeground">
            <p className="text-xs uppercase tracking-[0.2em]">Присоеденяйтесь</p>
            <div className="flex items-center gap-3">
              <Tooltip title="Телеграм" arrow placement="top">
                <a
                  href="https://t.me/+VbQDQSt8HJFkYjE6"
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 transition hover:text-foreground"
                  aria-label="Телеграм"
                >
                  <TelegramIcon sx={{ fontSize: 35 }} />
                </a>
              </Tooltip>
              <Tooltip title="YouTube" arrow placement="top">
                <a
                  href="#"
                  className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 transition hover:text-foreground"
                  aria-label="YouTube"
                >
                  <YouTubeIcon sx={{ fontSize: 35 }} />
                </a>
              </Tooltip>
              <Tooltip title="LinkedIn" arrow placement="top">
                <a
                  href="#"
                  className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 transition hover:text-foreground"
                  aria-label="LinkedIn"
                >
                  <LinkedInIcon sx={{ fontSize: 35 }} />
                </a>
              </Tooltip>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
