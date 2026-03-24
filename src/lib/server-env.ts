import "server-only";

import path from "node:path";

import { loadEnvConfig } from "@next/env";

let envLoaded = false;

export const ensureServerEnv = () => {
  if (envLoaded) return;

  loadEnvConfig(process.cwd(), process.env.NODE_ENV !== "production", console);
  loadEnvConfig(path.join(process.cwd(), ".."), process.env.NODE_ENV !== "production", console);

  envLoaded = true;
};

export const requiredServerEnv = (name: string) => {
  ensureServerEnv();

  const value = process.env[name];
  if (!value) throw new Error(`Missing env: ${name}`);
  return value;
};
