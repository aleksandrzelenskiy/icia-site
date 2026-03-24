"use client";

import Head from "next/head";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Moon,
  Sun,
  X,
} from "lucide-react";
import TelegramIcon from "@mui/icons-material/Telegram";
import YouTubeIcon from "@mui/icons-material/YouTube";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined";
import ApartmentOutlinedIcon from "@mui/icons-material/ApartmentOutlined";
import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import AssignmentAddIcon from "@mui/icons-material/AssignmentAdd";
import AssignmentIndOutlinedIcon from "@mui/icons-material/AssignmentIndOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import AutorenewRoundedIcon from "@mui/icons-material/AutorenewRounded";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import BallotOutlinedIcon from "@mui/icons-material/BallotOutlined";
import BusinessCenterOutlinedIcon from "@mui/icons-material/BusinessCenterOutlined";
import ChatBubbleOutlineRoundedIcon from "@mui/icons-material/ChatBubbleOutlineRounded";
import ChecklistRtlRoundedIcon from "@mui/icons-material/ChecklistRtlRounded";
import DashboardCustomizeOutlinedIcon from "@mui/icons-material/DashboardCustomizeOutlined";
import DevicesIcon from "@mui/icons-material/Devices";
import Diversity3OutlinedIcon from "@mui/icons-material/Diversity3Outlined";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined";
import FolderCopyOutlinedIcon from "@mui/icons-material/FolderCopyOutlined";
import ForumOutlinedIcon from "@mui/icons-material/ForumOutlined";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import GroupAddOutlinedIcon from "@mui/icons-material/GroupAddOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import Groups2OutlinedIcon from "@mui/icons-material/Groups2Outlined";
import HandshakeIcon from "@mui/icons-material/Handshake";
import HubOutlinedIcon from "@mui/icons-material/HubOutlined";
import InsightsOutlinedIcon from "@mui/icons-material/InsightsOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import LooksOneOutlinedIcon from "@mui/icons-material/LooksOneOutlined";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import RateReviewIcon from "@mui/icons-material/RateReview";
import RateReviewOutlinedIcon from "@mui/icons-material/RateReviewOutlined";
import RocketLaunchOutlinedIcon from "@mui/icons-material/RocketLaunchOutlined";
import SyncProblemIcon from "@mui/icons-material/SyncProblem";
import SupportAgentOutlinedIcon from "@mui/icons-material/SupportAgentOutlined";
import ScienceOutlinedIcon from "@mui/icons-material/ScienceOutlined";
import SettingsSuggestOutlinedIcon from "@mui/icons-material/SettingsSuggestOutlined";
import TaskAltOutlinedIcon from "@mui/icons-material/TaskAltOutlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import TipsAndUpdatesOutlinedIcon from "@mui/icons-material/TipsAndUpdatesOutlined";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import Tooltip from "@mui/material/Tooltip";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Stepper from "@mui/material/Stepper";
import { AnimatePresence, motion, useScroll, useSpring, useTransform } from "framer-motion";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  getRegionCoordsByCode,
  getRegionLabelByCode,
  normalizeRegionCode
} from "@/lib/regions";

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
    title: "Подрядчикам",
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
      "Личные задачи, чек-листы и рейтинг качества. Все инструменты для роста, уверенной работы и поддержки сообщества вместе с ICIA.",
    bullets: ["Задачи и геолокации", "Удобное согласование работ", "Доступ ко всем задачам в одном месте", "Прозрачное взаимодействие с закзачиком", "Рейтинг и обучение", "Q&A модуль и поддержка сообщества"]
  }
};

type PresentationSlide = {
  id: number;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  bullets?: string[];
  steps?: string[];
  note: string;
  layout?:
    | "hero"
    | "list"
    | "split-list"
    | "stepper"
    | "pill-list"
    | "feature-list"
    | "compact-list";
};

const platformPresentationSlides: PresentationSlide[] = [
  {
    id: 1,
    eyebrow: "WS ICIA",
    title:
      "Единая цифровая платформа для управления задачами, исполнителями, отчетностью и согласованием результатов",
    subtitle: "От постановки задачи до приемки результата в одной системе",
    layout: "hero",
    note:
      "WS ICIA помогает организации собрать в одной системе проекты, задачи, подрядчиков, фотоотчеты, документы, коммуникации и контроль выполнения."
  },
  {
    id: 2,
    title: "Какую проблему решает платформа",
    subtitle: "Типичные сложности в работе организаций",
    bullets: [
      "Задачи ведутся в нескольких каналах одновременно",
      "Статусы и сроки требуют ручного контроля",
      "Подрядчики и сотрудники работают в разрозненной среде",
      "Фотоотчеты, документы и замечания хранятся в разных местах",
      "Руководству сложно быстро увидеть полную картину по проектам и исполнению"
    ],
    layout: "list",
    note:
      "Когда процессы распределены между чатами, таблицами, почтой и папками, организация теряет скорость, прозрачность и управляемость."
  },
  {
    id: 3,
    title: "Что дает WS ICIA",
    subtitle: "Единая рабочая среда и ключевые функциональные блоки",
    bullets: [
      "Проекты, задачи и исполнители в одном контуре",
      "Контроль сроков, статусов и ответственности",
      "Фотоотчеты и документационое согласование в системе",
      "Замечания, исправления и приемка без потери контекста",
      "Работа как с внутренними командами, так и с подрядчиками",
      "История действий, роли, доступы и уведомления",
      "Встроенные коммуникации, уведомления и административный контроль",
      "Единая платформа вместо набора разрозненных инструментов"
    ],
    layout: "feature-list",
    note:
      "WS ICIA объединяет ключевые функциональные блоки в одной системе и превращает разрозненные процессы в единую управляемую среду."
  },
  {
    id: 4,
    title: "Как устроен процесс работы",
    subtitle: "Сквозной сценарий в системе",
    layout: "stepper",
    steps: [
      "Создается проект",
      "Внутри проекта формируются задачи",
      "Исполнитель назначается или откликается на задачу",
      "Выполнение контролируется по статусам и событиям",
      "Результат сдается через фотоотчет или документы",
      "Ответственный сотрудник проверяет результат",
      "При необходимости оставляет замечания",
      "После исправлений и согласования задача закрывается"
    ],
    note:
      "Важная особенность платформы в том, что весь цикл проходит внутри одной системы, без разрывов между исполнением и приемкой."
  },
  {
    id: 5,
    title: "Работа с исполнителями и подрядчиками",
    subtitle: "Гибкая модель взаимодействия",
    bullets: [
      "Прямое назначение исполнителя",
      "Внутренние конкурсы внутри организации",
      "Публикация задач для подрядчиков",
      "Сбор откликов и заявок в одном окне",
      "Учет специализаций и прозрачный выбор исполнителя"
    ],
    layout: "list",
    note:
      "WS ICIA позволяет работать в одной системе и с внутренней командой, и с подрядчиками, что особенно важно при масштабировании."
  },
  {
    id: 6,
    title: "Контроль результата",
    subtitle: "Фотоотчеты и документы как управляемый процесс",
    bullets: [
      "Исполнитель сдает результат в системе",
      "Ответственный сотрудник проверяет и согласует",
      "Замечания фиксируются структурированно",
      "Исправления загружаются повторно без потери истории",
      "Все материалы хранятся централизованно"
    ],
    layout: "feature-list",
    note:
      "Это делает процесс приемки прозрачным, предсказуемым и удобным как для исполнителя, так и для заказчика."
  },
  {
    id: 7,
    title: "Что получает организация",
    subtitle: "Практический эффект от использования",
    bullets: [
      "Снижение операционного хаоса",
      "Ускорение координации между участниками",
      "Меньше ручного контроля со стороны менеджеров",
      "Прозрачность по задачам, статусам и ответственным",
      "Быстрее приемка и согласование результатов",
      "Более управляемая и масштабируемая рабочая среда"
    ],
    layout: "split-list",
    note:
      "Главная ценность для организации - не просто цифровизация, а повышение управляемости процессов."
  },
  {
    id: 8,
    title: "Начать работу бесплатно",
    subtitle: "Бесплатный пилотный период",
    steps: [
      "Попробуйте начать с 1-2 тестовых проектов",
      "Подключите ключевых сотрудников и исполнителей",
      "Протестируйте платформу на реальных кейсах",
      "Оцените удобство, прозрачность и эффект без обязательств"
    ],
    layout: "stepper",
    note:
      "Мы готовы предложить бесплатный пилотный период, чтобы ваша команда смогла проверить WS ICIA на практике и принять решение уже на основе реального опыта работы."
  }
];

const slideIconMap = {
  1: DevicesIcon,
  2: SyncProblemIcon,
  3: TipsAndUpdatesOutlinedIcon,
  4: Groups2OutlinedIcon,
  5: Diversity3OutlinedIcon,
  6: FactCheckOutlinedIcon,
  7: TrendingUpOutlinedIcon,
  8: RocketLaunchOutlinedIcon,
  10: ApartmentOutlinedIcon,
  11: ChatBubbleOutlineRoundedIcon,
  12: VerifiedOutlinedIcon,
  13: AutorenewRoundedIcon,
  14: Inventory2OutlinedIcon,
  15: SupportAgentOutlinedIcon,
  16: ChecklistRtlRoundedIcon,
  17: AssignmentTurnedInOutlinedIcon
} as const;

type RegionStat = { regionCode: string; label: string; count: number };
type MapMarker = {
  coords: [number, number];
  label: string;
  count: number;
  regionCode: string;
};
type RegionStatInput = {
  regionCode?: unknown;
  code?: unknown;
  count?: unknown;
  users?: unknown;
};

const fallbackRegions: RegionStat[] = [
  { regionCode: "38", label: "Иркутская область", count: 1 }
];
const contractorOverlayImageClass = "w-full rounded-lg object-cover";
const regionGeocodeCache = new Map<string, [number, number]>();
let russiaBoundsCache: [[number, number], [number, number]] | null = null;
const RUSSIA_BOUNDS_FALLBACK: [[number, number], [number, number]] = [
  [41.185353, 19.6389],
  [81.857361, 180]
];
const RUSSIA_MAP_CENTER: [number, number] = [61.524, 99.5];
const RUSSIA_OVERVIEW_MIN_ZOOM_MOBILE = 1.7;
const RUSSIA_OVERVIEW_MIN_ZOOM_DESKTOP = 3.15;
const RUSSIA_OVERVIEW_MAX_ZOOM = 4.1;
const RED_LOCATION_MARKER_ICON =
  "data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A//www.w3.org/2000/svg%27%20viewBox%3D%270%200%2024%2024%27%20fill%3D%27%23ef4444%27%3E%3Cpath%20d%3D%27M12%202.25a7.75%207.75%200%2000-7.75%207.75c0%205.63%206.47%2011.22%207.05%2011.7a1.1%201.1%200%20001.4%200c.58-.48%207.05-6.07%207.05-11.7A7.75%207.75%200%200012%202.25zm0%2010.5a2.75%202.75%200%20110-5.5%202.75%202.75%200%20010%205.5z%27/%3E%3C/svg%3E";

const buildGeocodeQueries = (label: string): string[] => {
  const normalized = label.trim();
  if (!normalized) return [];

  const compact = normalized
    .replace(/\s*\(.*?\)\s*/g, " ")
    .replace(/^Республика\s+/i, "")
    .replace(/^г\.\s*/i, "")
    .replace(/\s+/g, " ")
    .trim();

  const candidates = [
    `${normalized}, Россия`,
    normalized,
    compact ? `${compact}, Россия` : "",
    compact
  ].filter(Boolean);

  return Array.from(new Set(candidates));
};

const fallbackCoordsByRegionCode = (regionCode: string): [number, number] => {
  const numeric = Number.parseInt(regionCode, 10);
  const seed = Number.isFinite(numeric) ? numeric : 0;
  const lat = 43 + ((seed * 17) % 26); // 43..68
  const lon = 30 + ((seed * 29) % 125); // 30..154
  return [lat, lon];
};

const toPositiveInt = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return Math.floor(value);
  }
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed) && parsed > 0) {
      return Math.floor(parsed);
    }
  }
  return null;
};

const normalizeRegionStats = (input: unknown): RegionStat[] => {
  if (!Array.isArray(input)) return [];
  const byCode = new Map<string, number>();

  for (const item of input) {
    if (!item || typeof item !== "object") continue;
    const record = item as RegionStatInput;
    const regionCode = normalizeRegionCode(record.regionCode ?? record.code);
    if (!regionCode) continue;
    const label = getRegionLabelByCode(regionCode);
    if (!label) continue;
    const count = toPositiveInt(record.count) ?? toPositiveInt(record.users) ?? 1;
    byCode.set(regionCode, (byCode.get(regionCode) ?? 0) + count);
  }

  return Array.from(byCode.entries())
    .map(([regionCode, count]) => {
      const label = getRegionLabelByCode(regionCode);
      if (!label) return null;
      return { regionCode, label, count };
    })
    .filter((item): item is RegionStat => item !== null)
    .sort((a, b) => b.count - a.count);
};

async function fitMapToRussia(mapInstance: any, ymaps: any) {
  if (!mapInstance || !ymaps) return;

  if (!russiaBoundsCache) {
    try {
      const geocodeResult = await ymaps.geocode("Россия", { results: 1 });
      const first = geocodeResult.geoObjects.get(0);
      const bounds = first?.properties?.get("boundedBy");
      if (Array.isArray(bounds) && bounds.length === 2) {
        russiaBoundsCache = bounds as [[number, number], [number, number]];
      }
    } catch {
      // Fall through to fallback bounds.
    }
  }

  const setBoundsResult = mapInstance.setBounds(russiaBoundsCache ?? RUSSIA_BOUNDS_FALLBACK, {
    checkZoomRange: true,
    zoomMargin: typeof window !== "undefined" && window.innerWidth < 640 ? [10, 4, 10, 4] : [28, 10, 8, 10],
    duration: 200
  });
  if (setBoundsResult && typeof setBoundsResult.then === "function") {
    await setBoundsResult;
  }

  const isMobile = typeof window !== "undefined" && window.innerWidth < 640;
  const currentZoom = mapInstance.getZoom?.();
  if (typeof currentZoom === "number") {
    const minZoom = isMobile ? RUSSIA_OVERVIEW_MIN_ZOOM_MOBILE : RUSSIA_OVERVIEW_MIN_ZOOM_DESKTOP;
    const targetZoom = Math.min(Math.max(currentZoom, minZoom), RUSSIA_OVERVIEW_MAX_ZOOM);
    mapInstance.setCenter(RUSSIA_MAP_CENTER, targetZoom, { duration: 200 });
  }
}

function YandexMap() {
  const [regions, setRegions] = useState<RegionStat[]>([]);
  const mapInstanceRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPseudoFullscreen, setIsPseudoFullscreen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const fetchRegions = async () => {
      try {
        const response = await fetch("/api/geography/markers", {
          cache: "no-store"
        });
        if (!response.ok) {
          if (!cancelled) setRegions(fallbackRegions);
          return;
        }

        const payload = await response.json();
        const nextRegions = normalizeRegionStats(payload?.regions);

        if (!cancelled) {
          setRegions(nextRegions.length > 0 ? nextRegions : fallbackRegions);
        }
      } catch {
        if (!cancelled) setRegions(fallbackRegions);
      }
    };

    fetchRegions();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (regions.length === 0) return;

    const initMap = () => {
      const ymaps = (window as any).ymaps;
      if (!ymaps) return;

      ymaps.ready(async () => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.destroy();
          mapInstanceRef.current = null;
        }

        const mapInstance = new ymaps.Map("icia-map", {
          center: RUSSIA_MAP_CENTER,
          zoom: 3,
          controls: []
        });

        const resolvedMarkers = (
          await Promise.all(
            regions.map(async (region): Promise<MapMarker | null> => {
              const label = getRegionLabelByCode(region.regionCode) ?? region.label;
              const predefinedCoords = getRegionCoordsByCode(region.regionCode);
              if (predefinedCoords) {
                regionGeocodeCache.set(region.regionCode, predefinedCoords);
                return {
                  coords: predefinedCoords,
                  label,
                  count: region.count,
                  regionCode: region.regionCode
                };
              }

              const cachedCoords = regionGeocodeCache.get(region.regionCode);
              if (cachedCoords) {
                return {
                  coords: cachedCoords,
                  label,
                  count: region.count,
                  regionCode: region.regionCode
                };
              }

              try {
                for (const query of buildGeocodeQueries(label)) {
                  const geocodeResult = await ymaps.geocode(query, {
                    results: 1
                  });
                  const first = geocodeResult.geoObjects.get(0);
                  const coords = first?.geometry?.getCoordinates?.();
                  if (!Array.isArray(coords) || coords.length !== 2) {
                    continue;
                  }

                  const normalized: [number, number] = [coords[0], coords[1]];
                  regionGeocodeCache.set(region.regionCode, normalized);
                  return {
                    coords: normalized,
                    label,
                    count: region.count,
                    regionCode: region.regionCode
                  };
                }
              } catch {
                // Fall through to deterministic fallback coordinates.
              }

              const fallbackCoords = fallbackCoordsByRegionCode(region.regionCode);
              regionGeocodeCache.set(region.regionCode, fallbackCoords);
              return {
                coords: fallbackCoords,
                label,
                count: region.count,
                regionCode: region.regionCode
              };
            })
          )
        ).filter((marker): marker is MapMarker => marker !== null);

        const placemarks = resolvedMarkers.map(
          (marker) =>
            new ymaps.Placemark(
              marker.coords,
              {
                balloonContent: `${marker.label}: ${marker.count} пользователей`
              },
              {
                iconLayout: "default#image",
                iconImageHref: RED_LOCATION_MARKER_ICON,
                iconImageSize: [30, 42],
                iconImageOffset: [-15, -42]
              }
            )
        );
        placemarks.forEach((placemark) => mapInstance.geoObjects.add(placemark));
        console.info("[icia-map] regions:", regions.length, "placemarks:", placemarks.length, resolvedMarkers);

        await fitMapToRussia(mapInstance, ymaps);

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
      if (active) {
        setIsPseudoFullscreen(false);
      }

      setTimeout(async () => {
        const mapInstance = mapInstanceRef.current;
        const ymaps = (window as any).ymaps;
        if (!mapInstance) return;

        if (mapInstance.container?.fitToViewport) {
          mapInstance.container.fitToViewport();
        }

        await fitMapToRussia(mapInstance, ymaps);
      }, 100);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    if (isPseudoFullscreen) {
      document.body.style.overflow = "hidden";
    }

    const timer = window.setTimeout(async () => {
      const mapInstance = mapInstanceRef.current;
      const ymaps = (window as any).ymaps;
      if (!mapInstance) return;

      if (mapInstance.container?.fitToViewport) {
        mapInstance.container.fitToViewport();
      }

      await fitMapToRussia(mapInstance, ymaps);
    }, 100);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.clearTimeout(timer);
    };
  }, [isPseudoFullscreen]);

  const toggleFullscreen = async () => {
    const container = mapContainerRef.current as any;
    if (!container) return;

    if (isPseudoFullscreen) {
      setIsPseudoFullscreen(false);
      return;
    }

    if (document.fullscreenElement) {
      await document.exitFullscreen();
      return;
    }

    let enteredNativeFullscreen = false;
    if (container.requestFullscreen) {
      try {
        await container.requestFullscreen();
        enteredNativeFullscreen = true;
      } catch {
        enteredNativeFullscreen = false;
      }
    } else if (container.webkitRequestFullscreen) {
      try {
        container.webkitRequestFullscreen();
        enteredNativeFullscreen = true;
      } catch {
        enteredNativeFullscreen = false;
      }
    }

    if (!enteredNativeFullscreen) {
      setIsPseudoFullscreen(true);
    }
  };

  return (
    <div
      ref={mapContainerRef}
      className={cn(
        "glass relative h-[360px] w-full max-w-full min-w-0 overflow-hidden rounded-none sm:h-[440px] sm:rounded-2xl lg:h-[500px]",
        isPseudoFullscreen && "fixed inset-0 z-[70] h-[100dvh] rounded-none"
      )}
    >
      <div id="icia-map" className="h-full w-full" />
      <button
        type="button"
        onClick={toggleFullscreen}
        className="absolute right-3 top-3 z-10 rounded-full border border-white/30 bg-white/80 px-3 py-1 text-xs font-semibold text-slate-900 shadow-sm transition hover:bg-white"
      >
        {isFullscreen || isPseudoFullscreen ? "Обычный режим" : "На весь экран"}
      </button>
    </div>
  );
}

export default function Home() {
  const headerRef = useRef<HTMLElement | null>(null);
  const heroRef = useRef<HTMLElement | null>(null);
  const missionRef = useRef<HTMLDivElement | null>(null);
  const platformRef = useRef<HTMLElement | null>(null);
  const presentationContentRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ["start end", "end start"]
  });
  const heroBgYRaw = useTransform(heroProgress, [0, 1], ["-24%", "24%"]);
  const heroBgY = useSpring(heroBgYRaw, {
    stiffness: 90,
    damping: 24,
    mass: 0.55
  });
  const { scrollYProgress: missionProgress } = useScroll({
    target: missionRef,
    offset: ["start end", "end start"]
  });
  const missionBgYRaw = useTransform(missionProgress, [0, 1], ["-60%", "60%"]);
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
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [menuOpen, setMenuOpen] = useState(false);
  const [isPresentationOpen, setIsPresentationOpen] = useState(false);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [presentationContentHeight, setPresentationContentHeight] = useState(0);

  const preview = useMemo(() => audienceContent[audience], [audience]);
  const activeSlide = platformPresentationSlides[activeSlideIndex];
  const isFirstSlide = activeSlideIndex === 0;
  const isLastSlide = activeSlideIndex === platformPresentationSlides.length - 1;
  const ActiveSlideIcon = slideIconMap[activeSlide.id as keyof typeof slideIconMap];
  const bulletColumnsClass =
    activeSlide.layout === "split-list"
      ? "mt-8 grid gap-x-10 gap-y-4 sm:grid-cols-2"
      : activeSlide.layout === "compact-list"
        ? "mt-8 grid gap-x-8 gap-y-3 sm:grid-cols-2"
        : "mt-8 space-y-4";

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
    document.body.style.overflow = menuOpen || isPresentationOpen ? "hidden" : "";
  }, [isPresentationOpen, menuOpen]);

  useEffect(() => {
    if (typeof window === "undefined" || !isPresentationOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsPresentationOpen(false);
        return;
      }
      if (event.key === "ArrowRight") {
        setActiveSlideIndex((prev) =>
          Math.min(prev + 1, platformPresentationSlides.length - 1)
        );
      }
      if (event.key === "ArrowLeft") {
        setActiveSlideIndex((prev) => Math.max(prev - 1, 0));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPresentationOpen]);

  useEffect(() => {
    if (typeof window === "undefined" || !isPresentationOpen) return;

    const updatePresentationContentHeight = () => {
      const nextHeight = presentationContentRef.current?.offsetHeight ?? 0;
      setPresentationContentHeight(nextHeight);
    };

    updatePresentationContentHeight();

    const animationFrame = window.requestAnimationFrame(updatePresentationContentHeight);
    window.addEventListener("resize", updatePresentationContentHeight);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", updatePresentationContentHeight);
    };
  }, [activeSlideIndex, isPresentationOpen]);

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
        <title>WS ICIA — Industrial workspace для подрядчиков, исполнителей и организаций</title>
        <meta
          name="description"
          content="WS ICIA — международная цифровая платформа для управления задачами, подрядчиками, исполнителями, фотоотчетами и согласованием результатов. Развивается внутри ICIA — Industrial Cellular Installers Association."
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
            <a href="/#about" className="transition hover:text-foreground">О ПЛАТФОРМЕ</a>
            <a href="/#geography" className="transition hover:text-foreground">ГЕОГРАФИЯ</a>
            <a href="/#platform" className="transition hover:text-foreground">ПЛАТФОРМА</a>
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
                <a href="/#about" onClick={() => setMenuOpen(false)}>О ПЛАТФОРМЕ</a>
                <a href="/#geography" onClick={() => setMenuOpen(false)}>ГЕОГРАФИЯ</a>
                <a href="/#platform" onClick={() => setMenuOpen(false)}>ПЛАТФОРМА</a>
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

      <section
        id="hero"
        ref={heroRef}
        className="relative isolate flex min-h-screen items-center overflow-hidden pt-28"
      >
        <div className="pointer-events-none absolute inset-0 -z-10">
          <motion.div
            className="absolute inset-x-0 -top-[16%] -bottom-[16%]"
            style={{ y: heroBgY, willChange: "transform" }}
          >
            <div className="absolute inset-0">
              <Image
                src="/hero-parallax.jpg"
                alt=""
                fill
                priority
                sizes="100vw"
                className="object-cover object-center opacity-100"
                draggable={false}
                onContextMenu={preventImageContextMenu}
                onDragStart={preventImageDragStart}
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.74),rgba(255,255,255,0.44)_46%,rgba(255,255,255,0.16)),radial-gradient(circle_at_18%_22%,rgba(255,255,255,0.22),transparent_34%),linear-gradient(90deg,rgba(15,23,42,0.08),rgba(15,23,42,0.02))] dark:bg-[linear-gradient(180deg,rgba(2,6,10,0.84),rgba(4,9,14,0.66)_48%,rgba(6,12,18,0.38)),radial-gradient(circle_at_18%_22%,rgba(6,12,20,0.42),transparent_38%),linear-gradient(90deg,rgba(1,4,10,0.34),rgba(1,4,10,0.14))]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(14,165,233,0.14),transparent_38%)] dark:bg-[radial-gradient(circle_at_center,rgba(14,165,233,0.16),transparent_40%)]" />
              <div className="absolute inset-0 bg-hero-radial opacity-24 dark:opacity-56" />
            </div>
          </motion.div>
        </div>

        <div className="relative z-10 flex min-h-[calc(100vh-7rem)] w-full items-center">
          <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-center gap-10 px-6 text-center">
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
                Workspace Industrial Cellular Installers Association
              </motion.p>
              <motion.h1
                className="text-4xl font-semibold leading-tight text-foreground sm:text-6xl lg:text-7xl"
                variants={fadeUp}
              ><span className="text-gradient">Платформа для организаций и специалистов в телеком</span>
              </motion.h1>
              <motion.p
                className="max-w-2xl text-lg text-black dark:text-mutedForeground"
                variants={fadeUp}
              >
                Цифровая система для управления задачами, подрядчиками,
                исполнителями, фотоотчетами, документами и приемкой результата в
                единой рабочей среде для строителства и обслуживания объектов связи.
              </motion.p>
              <motion.div variants={fadeUp}>
                <div className="flex flex-col items-center gap-3 sm:flex-row">
                  <Button asChild size="xl">
                    <a href="/#about">Поднобнее<ArrowUpRight className="h-4 w-4" /></a>
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          </div>
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
            Что это?
          </h2>
          <div className="space-y-4 text-base sm:text-lg lg:text-xl text-mutedForeground">
            <p>
              ICIA — Industrial Cellular Installers Association. Мы стремися объеденить специалистов развития и обслуживания телеком-отрасли в единую IT-экосистему, наша платформа опирается не только на
              бизес-логику процессов, но и на профессиональную экспертизу рынка.
            </p>
            <p>
              WS ICIA (Workspace) — это операционная цифровая платформа для организаций,
              подрядчиков и исполнителей задач в телекоммуникационной отрасли. Платформа помогает вести проекты,
              распределять задачи, контролировать сроки и принимать результаты в
              одном рабочем контуре.
            </p>
          </div>
          <Button asChild size="lg">
            <a href="/#platform">
              Посмотреть возможности
            </a>
          </Button>
        </motion.div>
        <motion.div className="space-y-4" variants={fadeUp}>
          {[
            {
              title: "One Workspace",
              text: "Проекты, задачи, исполнители, фотоотчеты и документы — в одной цифровой системе."
            },
            {
              title: "Экосистема ICIA",
              text: "Профессиональная ассоциация формирует доверительную среду для организаций, подрядчиков и специалистов."
            },
            {
              title: "Операционный контроль",
              text: "Статусы, сроки, приемка результата и история действий в управляемом цифровом контуре."
            },
            {
              title: "Сообщество специалистов",
              text: "Платформа создает возможность профессиональной поддержки специалситов отралсевым сообществом"
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
            Экосистема ICIA
          </p>
          <h2 className="mt-4 text-3xl font-semibold sm:text-4xl">
            WS ICIA — Workspace
            <span className="text-gradient"> Industrial Cellular Installers Association.</span>
          </h2>
          <p className="mt-4 text-base text-mutedForeground">
            ICIA объединяет организации, подрядчиков и исполнителей в общей
            профессиональной среде. WS ICIA становится рабочим инструментом этой
            экосистемы: для задач, координации, контроля качества и
            масштабирования процессов в строительстве и эксплуатации объектов связи.
          </p>
        </motion.div>
      </motion.section>
      <motion.section
        id="geography"
        className="mx-auto w-full max-w-6xl px-6 py-24"
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
            WS ICIA создается как платформа для глобального рынка телеком-задач
          </h2>
          <p className="text-mutedForeground">
            Уже сегодня к проекту присоеденись организации и специалисты из разных регионов России. Мы будем рады видеть Вас среди участников проекта!
          </p>
        </motion.div>
        <motion.div className="relative mt-10 -mx-6 sm:mx-0" variants={fadeUp}>
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
              WS ICIA для организаций, подрядчиков и исполнителей
            </h2>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
              <div className="flex items-stretch gap-2 rounded-2xl border border-black/5 bg-white/70 p-2 sm:items-center sm:gap-3 dark:border-white/10 dark:bg-white/5">
                <Button
                  variant={audience === "contractor" ? "default" : "ghost"}
                  onClick={() => setAudience("contractor")}
                  className="h-auto min-w-0 flex-1 basis-0 whitespace-normal px-3 py-2 text-center leading-tight sm:flex-none sm:basis-auto sm:whitespace-nowrap"
                >
                  Для подрядчика
                </Button>
                <Button
                  variant={audience === "specialist" ? "default" : "ghost"}
                  onClick={() => setAudience("specialist")}
                  className="h-auto min-w-0 flex-1 basis-0 whitespace-normal px-3 py-2 text-center leading-tight sm:flex-none sm:basis-auto sm:whitespace-nowrap"
                >
                  Для исполнителя
                </Button>
              </div>
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
                  контуре ICIA с поддержкой через Q&A.
                </p>
                <ul className="mt-6 space-y-3 text-sm text-mutedForeground">
                  {[
                    "Задания сразу с исходными данными",
                    "Удобная сдача чертежей и документов",
                    "Коммуникация с подрядчиком в одном окне",
                    "Отслеживание статуса согласований",
                    "Доступ к удаленным задачам в любых регионах",
                    "Q&A: ответы коллег и экспертов по сложным кейсам"
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <ChevronRight className="h-4 w-4 text-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {audience === "contractor" && (
              <div className="mt-8 border-t border-black/10 pt-6 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    setActiveSlideIndex(0);
                    setIsPresentationOpen(true);
                  }}
                  className="group relative w-full overflow-hidden rounded-[1.5rem] border border-sky-300/45 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(219,234,254,0.92)_45%,rgba(191,219,254,0.95)_100%)] p-4 text-left shadow-[0_24px_60px_rgba(37,99,235,0.18)] transition hover:-translate-y-0.5 hover:shadow-[0_30px_80px_rgba(37,99,235,0.24)] dark:border-sky-400/20 dark:bg-[linear-gradient(135deg,rgba(14,25,44,0.98),rgba(16,57,110,0.86)_55%,rgba(10,132,255,0.42)_100%)]"
                >
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.9),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.22),transparent_45%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(125,211,252,0.18),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.2),transparent_45%)]" />
                  <div className="relative flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-700 dark:text-sky-200/80">
                        WS ICIA
                      </p>
                      <p className="mt-2 max-w-sm text-base font-semibold leading-6 text-slate-950 dark:text-white">
                        Подробнее о платформе
                      </p>
                    </div>
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-950 text-white transition group-hover:scale-105 dark:bg-white dark:text-slate-950">
                      <ArrowUpRight className="h-4 w-4" />
                    </div>
                  </div>
                </button>
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

      <AnimatePresence>
        {isPresentationOpen && (
          <motion.div
            className="fixed inset-0 z-[80] overflow-y-auto bg-[rgba(240,244,251,0.72)] px-4 py-4 backdrop-blur-2xl dark:bg-[rgba(4,8,18,0.82)] sm:px-6 sm:py-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.button
              type="button"
              className="absolute inset-0"
              onClick={() => setIsPresentationOpen(false)}
              aria-label="Закрыть презентацию"
            />
            <motion.div
              className="relative mx-auto my-8 flex w-full max-w-7xl flex-col overflow-hidden rounded-[2rem] border border-white/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(243,247,252,0.92))] shadow-[0_32px_120px_rgba(15,23,42,0.24)] dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(9,14,24,0.96),rgba(10,17,30,0.92))]"
              initial={{ y: 24, opacity: 0, scale: 0.985 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 20, opacity: 0, scale: 0.985 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
            >
              <div className="relative overflow-hidden border-b border-black/5 px-5 py-4 dark:border-white/10 sm:px-8">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.18),transparent_30%),radial-gradient(circle_at_top_right,rgba(14,165,233,0.14),transparent_28%)]" />
                <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-mutedForeground">
                      WS ICIA Presentation
                    </p>
                    <p className="mt-2 text-lg font-semibold text-foreground sm:text-xl">
                      Операционная платформа для управления задачами
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="rounded-full border border-black/5 bg-white/70 px-4 py-2 text-xs font-semibold text-mutedForeground dark:border-white/10 dark:bg-white/5">
                      Слайд {activeSlide.id} / {platformPresentationSlides.length}
                    </div>
                    <Button
                      variant="ghost"
                      onClick={() => setIsPresentationOpen(false)}
                      className="h-11 w-11 rounded-full p-0"
                      aria-label="Закрыть презентацию"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="relative lg:pr-[340px]">
                <div
                  ref={presentationContentRef}
                  className="relative flex flex-col justify-between overflow-hidden px-5 py-6 sm:px-8 sm:py-8"
                >
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_18%,rgba(37,99,235,0.12),transparent_26%),radial-gradient(circle_at_85%_16%,rgba(56,189,248,0.14),transparent_22%),linear-gradient(180deg,rgba(255,255,255,0.55),rgba(255,255,255,0))] dark:bg-[radial-gradient(circle_at_20%_18%,rgba(37,99,235,0.18),transparent_28%),radial-gradient(circle_at_85%_16%,rgba(34,211,238,0.12),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0))]" />
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeSlide.id}
                      className="relative flex flex-col"
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -18 }}
                      transition={{ duration: 0.24, ease: "easeOut" }}
                    >
                      <div className="max-w-4xl shrink-0">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="rounded-full border border-black/5 bg-white/75 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-mutedForeground dark:border-white/10 dark:bg-white/5">
                            Слайд {activeSlide.id}
                          </span>
                          {activeSlide.eyebrow && (
                            <span className="rounded-full border border-primary/15 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
                              {activeSlide.eyebrow}
                            </span>
                          )}
                        </div>
                        <div className="mt-6 max-w-4xl">
                          <h3 className="flex flex-wrap items-start gap-x-4 gap-y-3 text-3xl font-semibold leading-tight text-foreground sm:text-5xl sm:leading-[1.05]">
                            <span className="max-w-3xl">{activeSlide.title}</span>
                            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[1rem] border border-black/5 bg-white/75 text-slate-700 shadow-[0_16px_30px_rgba(15,23,42,0.07)] dark:border-white/10 dark:bg-white/[0.05] dark:text-slate-100 sm:h-14 sm:w-14 sm:rounded-[1.2rem]">
                              <ActiveSlideIcon sx={{ fontSize: 28 }} />
                            </span>
                          </h3>
                        </div>
                        {activeSlide.subtitle && (
                          <p className="mt-5 max-w-2xl text-base leading-7 text-mutedForeground sm:text-xl">
                            {activeSlide.subtitle}
                          </p>
                        )}
                      </div>

                      {activeSlide.id === 1 && (
                        <div className="mt-8">
                          <div className="relative overflow-hidden rounded-[2rem] border border-black/5 bg-[linear-gradient(135deg,rgba(255,255,255,0.92),rgba(232,241,252,0.92))] p-5 shadow-[0_24px_60px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-[linear-gradient(135deg,rgba(255,255,255,0.04),rgba(37,99,235,0.08))]">
                            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.14),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(125,211,252,0.12),transparent_26%)]" />
                            <div className="relative rounded-[1.5rem] border border-slate-300/60 bg-white/80 px-6 py-7 shadow-[0_18px_40px_rgba(15,23,42,0.12)] dark:border-white/10 dark:bg-white/[0.03] sm:px-8 sm:py-9">
                              <p className="whitespace-pre-line text-base leading-7 text-mutedForeground sm:text-xl">
                                {"Добро пожаловать в WS ICIA.\nПокажем, как вся работа собирается в одной системе."}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {activeSlide.bullets && activeSlide.layout === "pill-list" && (
                        <div className="mt-8 flex flex-wrap gap-3">
                          {activeSlide.bullets.map((bullet) => (
                            <span
                              key={bullet}
                              className="inline-flex items-center gap-2 rounded-full border border-black/8 bg-white/72 px-4 py-2 text-sm font-medium text-slate-700 shadow-[0_12px_24px_rgba(15,23,42,0.06)] dark:border-white/10 dark:bg-white/[0.045] dark:text-slate-200"
                            >
                              <AssignmentTurnedInOutlinedIcon sx={{ fontSize: 18 }} />
                              {bullet}
                            </span>
                          ))}
                        </div>
                      )}

                      {activeSlide.bullets && activeSlide.layout === "feature-list" && (
                        <div className="mt-8 grid gap-4 sm:grid-cols-2">
                          {activeSlide.bullets.map((bullet, index) => (
                            <div
                              key={bullet}
                              className="rounded-[1.35rem] border border-black/5 bg-white/60 px-4 py-4 shadow-[0_14px_30px_rgba(15,23,42,0.05)] dark:border-white/10 dark:bg-white/[0.04]"
                            >
                              <div className="flex items-start gap-3">
                                <div
                                  className={cn(
                                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                                    activeSlide.id === 3 || activeSlide.id === 5 || activeSlide.id === 8
                                      ? "bg-[rgba(59,130,246,0.12)] text-[rgb(37,99,235)] dark:bg-[rgba(56,189,248,0.14)] dark:text-[rgb(125,211,252)]"
                                      : activeSlide.id === 6
                                        ? "border border-black/5 bg-white/70 text-slate-700 shadow-[0_10px_24px_rgba(15,23,42,0.06)] dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-100"
                                      : "bg-slate-950 text-white dark:bg-white dark:text-slate-950"
                                  )}
                                >
                                  {activeSlide.id === 3 ? (
                                    <>
                                      {index === 0 && <AssignmentIndIcon sx={{ fontSize: 18 }} />}
                                      {index === 1 && <PendingActionsIcon sx={{ fontSize: 18 }} />}
                                      {index === 2 && <FolderOpenIcon sx={{ fontSize: 18 }} />}
                                      {index === 3 && <RateReviewIcon sx={{ fontSize: 18 }} />}
                                      {index === 4 && <HandshakeIcon sx={{ fontSize: 18 }} />}
                                      {index === 5 && <ManageAccountsIcon sx={{ fontSize: 18 }} />}
                                      {index === 6 && <ForumOutlinedIcon sx={{ fontSize: 18 }} />}
                                      {index === 7 && <DashboardCustomizeOutlinedIcon sx={{ fontSize: 18 }} />}
                                    </>
                                  ) : activeSlide.id === 5 ? (
                                    <>
                                      {index === 0 && <AssignmentIndOutlinedIcon sx={{ fontSize: 18 }} />}
                                      {index === 1 && <BallotOutlinedIcon sx={{ fontSize: 18 }} />}
                                      {index === 2 && <AssignmentAddIcon sx={{ fontSize: 18 }} />}
                                      {index === 3 && <FactCheckOutlinedIcon sx={{ fontSize: 18 }} />}
                                      {index === 4 && <BadgeOutlinedIcon sx={{ fontSize: 18 }} />}
                                    </>
                                  ) : activeSlide.id === 6 ? (
                                    <>
                                      {index === 0 && <FileUploadOutlinedIcon sx={{ fontSize: 18 }} />}
                                      {index === 1 && <TaskAltOutlinedIcon sx={{ fontSize: 18 }} />}
                                      {index === 2 && <RateReviewOutlinedIcon sx={{ fontSize: 18 }} />}
                                      {index === 3 && <HistoryOutlinedIcon sx={{ fontSize: 18 }} />}
                                      {index === 4 && <FolderCopyOutlinedIcon sx={{ fontSize: 18 }} />}
                                    </>
                                  ) : activeSlide.id === 8 ? (
                                    <>
                                      {index === 0 && <LooksOneOutlinedIcon sx={{ fontSize: 18 }} />}
                                      {index === 1 && <GroupAddOutlinedIcon sx={{ fontSize: 18 }} />}
                                      {index === 2 && <ScienceOutlinedIcon sx={{ fontSize: 18 }} />}
                                      {index === 3 && <InsightsOutlinedIcon sx={{ fontSize: 18 }} />}
                                    </>
                                  ) : (
                                    <>
                                      {index % 5 === 0 && <VerifiedOutlinedIcon sx={{ fontSize: 18 }} />}
                                      {index % 5 === 1 && <ChecklistRtlRoundedIcon sx={{ fontSize: 18 }} />}
                                      {index % 5 === 2 && <Groups2OutlinedIcon sx={{ fontSize: 18 }} />}
                                      {index % 5 === 3 && <InsightsOutlinedIcon sx={{ fontSize: 18 }} />}
                                      {index % 5 === 4 && <RocketLaunchOutlinedIcon sx={{ fontSize: 18 }} />}
                                    </>
                                  )}
                                </div>
                                <p className="pt-1 text-sm leading-6 text-slate-700 dark:text-slate-200">
                                  {bullet}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {activeSlide.bullets &&
                        activeSlide.layout !== "pill-list" &&
                        activeSlide.layout !== "feature-list" &&
                        activeSlide.layout !== "hero" && (
                          <ul className={bulletColumnsClass}>
                            {activeSlide.bullets.map((bullet, index) => (
                              <li
                                key={bullet}
                                className={cn(
                                  "text-slate-700 dark:text-slate-200",
                                  activeSlide.layout === "compact-list"
                                    ? "flex items-start gap-3 rounded-[1.1rem] border border-black/5 bg-white/55 px-4 py-3 text-sm leading-6 dark:border-white/10 dark:bg-white/[0.035]"
                                    : "flex items-center gap-4 text-base leading-7"
                                )}
                              >
                                <span
                                  className={cn(
                                    "flex shrink-0 items-center justify-center rounded-full",
                                    activeSlide.layout === "compact-list"
                                      ? "mt-0.5 h-7 w-7 bg-slate-950 text-white dark:bg-white dark:text-slate-950"
                                      : "h-9 w-9 border border-black/5 bg-white/70 text-slate-700 shadow-[0_10px_24px_rgba(15,23,42,0.06)] dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-100"
                                  )}
                                >
                                  {activeSlide.id === 2 ? (
                                    <ErrorOutlineIcon
                                      sx={{ fontSize: activeSlide.layout === "compact-list" ? 16 : 18 }}
                                    />
                                  ) : activeSlide.id === 7 ? (
                                    <>
                                      {index === 0 && <AccountTreeOutlinedIcon sx={{ fontSize: activeSlide.layout === "compact-list" ? 16 : 18 }} />}
                                      {index === 1 && <GroupsOutlinedIcon sx={{ fontSize: activeSlide.layout === "compact-list" ? 16 : 18 }} />}
                                      {index === 2 && <SettingsSuggestOutlinedIcon sx={{ fontSize: activeSlide.layout === "compact-list" ? 16 : 18 }} />}
                                      {index === 3 && <VisibilityOutlinedIcon sx={{ fontSize: activeSlide.layout === "compact-list" ? 16 : 18 }} />}
                                      {index === 4 && <TaskAltOutlinedIcon sx={{ fontSize: activeSlide.layout === "compact-list" ? 16 : 18 }} />}
                                      {index === 5 && <HubOutlinedIcon sx={{ fontSize: activeSlide.layout === "compact-list" ? 16 : 18 }} />}
                                    </>
                                  ) : (
                                    <>
                                      {index % 6 === 0 && <VerifiedOutlinedIcon sx={{ fontSize: activeSlide.layout === "compact-list" ? 16 : 18 }} />}
                                      {index % 6 === 1 && <Groups2OutlinedIcon sx={{ fontSize: activeSlide.layout === "compact-list" ? 16 : 18 }} />}
                                      {index % 6 === 2 && <AssignmentOutlinedIcon sx={{ fontSize: activeSlide.layout === "compact-list" ? 16 : 18 }} />}
                                      {index % 6 === 3 && <ChatBubbleOutlineRoundedIcon sx={{ fontSize: activeSlide.layout === "compact-list" ? 16 : 18 }} />}
                                      {index % 6 === 4 && <InsightsOutlinedIcon sx={{ fontSize: activeSlide.layout === "compact-list" ? 16 : 18 }} />}
                                      {index % 6 === 5 && <BusinessCenterOutlinedIcon sx={{ fontSize: activeSlide.layout === "compact-list" ? 16 : 18 }} />}
                                    </>
                                  )}
                                </span>
                                <span>{bullet}</span>
                              </li>
                            ))}
                          </ul>
                        )}

                      {activeSlide.steps && (
                        <div className="mt-8 max-w-3xl">
                          <Stepper
                            orientation="vertical"
                            activeStep={activeSlide.steps.length}
                            sx={{
                              ".MuiStepConnector-line": {
                                borderColor: "rgba(148, 163, 184, 0.28)"
                              },
                              ".MuiStepLabel-label": {
                                color: "inherit",
                                fontSize: "1rem",
                                lineHeight: 1.75,
                                fontWeight: 500
                              },
                              ".MuiStepIcon-root": {
                                color: "rgba(37, 99, 235, 0.22)"
                              },
                              ".MuiStepIcon-root.Mui-active, .MuiStepIcon-root.Mui-completed": {
                                color: "rgb(37, 99, 235)"
                              }
                            }}
                          >
                            {activeSlide.steps.map((step, index) => (
                              <Step key={step} completed>
                                <StepLabel
                                  icon={
                                    activeSlide.id === 8 ? (
                                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[rgba(59,130,246,0.12)] text-[rgb(37,99,235)] dark:bg-[rgba(56,189,248,0.14)] dark:text-[rgb(125,211,252)]">
                                        {index === 0 && <LooksOneOutlinedIcon sx={{ fontSize: 18 }} />}
                                        {index === 1 && <GroupAddOutlinedIcon sx={{ fontSize: 18 }} />}
                                        {index === 2 && <ScienceOutlinedIcon sx={{ fontSize: 18 }} />}
                                        {index === 3 && <InsightsOutlinedIcon sx={{ fontSize: 18 }} />}
                                      </span>
                                    ) : undefined
                                  }
                                  sx={
                                    activeSlide.id === 4
                                      ? {
                                          ".MuiStepLabel-iconContainer": {
                                            paddingRight: "10px"
                                          },
                                          ".MuiStepIcon-root": {
                                            fontSize: "1.35rem"
                                          }
                                        }
                                      : undefined
                                  }
                                >
                                  {step}
                                </StepLabel>
                              </Step>
                            ))}
                          </Stepper>
                          {activeSlide.id === 8 && (
                            <div className="mt-8">
                              <Button
                                asChild
                                size="lg"
                                className="rounded-full px-8"
                              >
                                <a href="https://ws.icia.pro/" target="_blank" rel="noreferrer">
                                  Начать бесплатно
                                </a>
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>

                  <div className="relative mt-8 flex flex-col gap-4 border-t border-black/5 pt-6 dark:border-white/10 sm:flex-row sm:items-end sm:justify-between">
                    <div className="max-w-2xl">
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-mutedForeground">
                        Ключевой тезис
                      </p>
                      <p className="mt-3 text-sm leading-7 text-mutedForeground sm:text-base">
                        {activeSlide.note}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button
                        variant="ghost"
                        onClick={() =>
                          setActiveSlideIndex((prev) => Math.max(prev - 1, 0))
                        }
                        disabled={isFirstSlide}
                        className="h-12 rounded-full px-5"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Назад
                      </Button>
                      <Button
                        onClick={() => {
                          if (isLastSlide) {
                            setIsPresentationOpen(false);
                            return;
                          }

                          setActiveSlideIndex((prev) =>
                            Math.min(prev + 1, platformPresentationSlides.length - 1)
                          );
                        }}
                        className="h-12 rounded-full px-5"
                      >
                        {isLastSlide ? "Закрыть" : "Далее"}
                        {!isLastSlide && <ChevronRight className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </div>

                <aside className="flex flex-col border-t border-black/5 bg-black/[0.02] px-5 py-6 dark:border-white/10 dark:bg-white/[0.025] lg:absolute lg:right-0 lg:top-0 lg:w-[340px] lg:border-l lg:border-t-0 sm:px-6">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-foreground">
                      Все слайды
                    </p>
                    <p className="text-xs uppercase tracking-[0.18em] text-mutedForeground">
                      {platformPresentationSlides.length} экранов
                    </p>
                  </div>
                  <div
                    className="mt-5 grid gap-2 overflow-y-auto pr-1"
                    style={
                      presentationContentHeight > 0
                        ? { maxHeight: Math.max(presentationContentHeight - 72, 240) }
                        : undefined
                    }
                  >
                    {platformPresentationSlides.map((slide, index) => (
                      <button
                        key={slide.id}
                        type="button"
                        onClick={() => setActiveSlideIndex(index)}
                        className={cn(
                          "relative rounded-[1.35rem] border px-4 py-3 text-left transition",
                          index === activeSlideIndex
                            ? "border-primary/40 bg-[linear-gradient(135deg,rgba(255,255,255,1),rgba(219,234,254,0.95))] text-foreground shadow-[0_18px_40px_rgba(37,99,235,0.18)] dark:bg-[linear-gradient(135deg,rgba(37,99,235,0.2),rgba(255,255,255,0.08))]"
                            : "border-black/5 bg-white/55 text-mutedForeground hover:bg-white/80 dark:border-white/10 dark:bg-white/[0.035] dark:hover:bg-white/[0.06]"
                        )}
                      >
                        {index === activeSlideIndex && (
                          <span className="absolute inset-y-3 left-0 w-1 rounded-r-full bg-primary" />
                        )}
                        <p
                          className={cn(
                            "text-xs font-semibold uppercase tracking-[0.2em]",
                            index === activeSlideIndex
                              ? "text-primary"
                              : "text-mutedForeground"
                          )}
                        >
                          {String(slide.id).padStart(2, "0")}
                        </p>
                        <p
                          className={cn(
                            "mt-2 text-sm font-medium leading-5",
                            index === activeSlideIndex
                              ? "text-foreground"
                              : "text-inherit"
                          )}
                        >
                          {slide.title}
                        </p>
                      </button>
                    ))}
                  </div>
                </aside>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
            <p className="inline-flex rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.24em] text-primary shadow-[0_10px_24px_rgba(37,99,235,0.08)]">
              Преимущества для подрядчиков
            </p>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
              Больше контроля, меньше ручной координации
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
                Подключиться как подрядчик
              </a>
            </Button>
          </div>
          <div className="grid gap-4">
            {[
              {
                title: "Единый контроль объектов",
                description: "Вся информация по задачам, объектам и статусам — в одной системе без разрыва между постановкой, выполнением и приемкой.",
              },
              {
                title: "Быстрые отчёты",
                description: "Фотоотчеты, прогресс и согласование результата происходят внутри платформы, а не в разрозненных каналах.",
              },
              {
                title: "Поиск исполнителей",
                description: "Подключайте исполнителей и подрядчиков в рамках экосистемы ICIA и работайте с ними в одном операционном контуре.",
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
              {
                title: "Q&A и поддержка сообщества",
                description:
                  "Задавай вопросы по монтажу, проектированию и согласованиям, получай быстрые ответы внутри профессиональной среды ICIA.",
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
            <p className="inline-flex rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.24em] text-primary shadow-[0_10px_24px_rgba(37,99,235,0.08)]">
              Преимущества для исполнителей
            </p>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
              Прозрачные задачи и понятный рабочий контур
            </h2>
            <ul className="space-y-3 text-mutedForeground">
              {["Быстрый доступ к задачам", "Поиск публичных заказов", "Прозрачный учёт оплат", "Обучение и повышение квалификации", "Q&A и поддержка сообщества"].map(
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
                Подключиться как исполнитель
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
            Есть вопросы?
          </p>
          <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">
            Свяжитесь с нами
          </h2>
          <p className="mt-3 text-mutedForeground">
            Оставьте заявку, и мы покажем платформу, обсудим ваш процесс и
            предложим формат пилотного запуска.
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
                Сообщение отправлено. Мы свяжемся с вами в ближайшее время.
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
              ICIA — Industrial Cellular Installers Association
            </p>
            <p className="text-xs text-mutedForeground">
              Политика конфиденциальности / 152-ФЗ
            </p>
          </div>
          <div className="space-y-2 text-sm text-mutedForeground">
            <p className="text-xs uppercase tracking-[0.2em]">Меню</p>
            <a href="/#about" className="block hover:text-foreground">О проекте</a>
            <a href="/#platform" className="block hover:text-foreground">Платформа</a>
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
