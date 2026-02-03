import nodemailer from "nodemailer";

export const runtime = "nodejs"; // важно, чтобы не пыталось в edge

type Payload = {
    name: string;
    email: string;
    role: string;
    message: string;
    // антиспам поле (honeypot), если захочешь
    company?: string;
};

type RateEntry = { count: number; resetAt: number };

const rateLimitWindowMs = 10 * 60 * 1000;
const rateLimitMax = 5;
const rateLimitStore = new Map<string, RateEntry>();

function requiredEnv(name: string) {
    const v = process.env[name];
    if (!v) throw new Error(`Missing env: ${name}`);
    return v;
}

function getClientIp(req: Request) {
    const forwardedFor = req.headers.get("x-forwarded-for");
    if (forwardedFor) {
        const first = forwardedFor.split(",")[0]?.trim();
        if (first) return first;
    }
    const realIp = req.headers.get("x-real-ip");
    if (realIp) return realIp.trim();
    return "unknown";
}

function isRateLimited(ip: string) {
    const now = Date.now();
    const entry = rateLimitStore.get(ip);
    if (!entry || entry.resetAt <= now) {
        rateLimitStore.set(ip, { count: 1, resetAt: now + rateLimitWindowMs });
        return false;
    }
    if (entry.count >= rateLimitMax) return true;
    entry.count += 1;
    return false;
}

export async function POST(req: Request) {
    try {
        const ip = getClientIp(req);
        if (isRateLimited(ip)) {
            return Response.json(
                { error: "Слишком много запросов. Попробуйте позже." },
                { status: 429 }
            );
        }

        let body: Payload;
        try {
            body = (await req.json()) as Payload;
        } catch {
            return Response.json({ error: "Некорректные данные" }, { status: 400 });
        }

        // Honeypot: если бот заполнил скрытое поле — игнорируем
        if (body.company) {
            return new Response(JSON.stringify({ ok: true }), { status: 200 });
        }

        const name = (body.name ?? "").trim();
        const email = (body.email ?? "").trim();
        const roleInput = (body.role ?? "").trim();
        const message = (body.message ?? "").trim();
        const allowedRoles = new Set(["contractor", "specialist", "operator"]);
        const role = allowedRoles.has(roleInput) ? roleInput : "unknown";

        if (!name) return Response.json({ error: "Введите имя" }, { status: 400 });
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
            return Response.json({ error: "Введите корректный email" }, { status: 400 });
        if (!message) return Response.json({ error: "Добавьте сообщение" }, { status: 400 });
        if (message.length > 4000)
            return Response.json({ error: "Сообщение слишком длинное" }, { status: 400 });

        const host = requiredEnv("CONTACT_EMAIL_HOST");
        const port = Number(requiredEnv("CONTACT_EMAIL_PORT"));
        const user = requiredEnv("CONTACT_EMAIL_USER");
        const pass = requiredEnv("CONTACT_EMAIL_PASS");
        const secure = process.env.CONTACT_EMAIL_SECURE === "true";
        const from = requiredEnv("CONTACT_EMAIL_FROM");
        const to = requiredEnv("CONTACT_EMAIL_TO");

        const transporter = nodemailer.createTransport({
            host,
            port,
            secure,
            auth: { user, pass },
        });

        const subject = `Заявка с сайта ICIA — ${name} (${role || "роль не указана"})`;

        const text = [
            `Имя: ${name}`,
            `Email: ${email}`,
            `Роль: ${role || "-"}`,
            "",
            "Сообщение:",
            message,
        ].join("\n");

        await transporter.sendMail({
            from,
            to,
            subject,
            text,
            replyTo: email, // отвечать можно прямо пользователю
        });

        return Response.json({ ok: true });
    } catch {
        return Response.json({ error: "Ошибка отправки. Попробуйте позже." }, { status: 500 });
    }
}
