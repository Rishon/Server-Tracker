import { PHASE_PRODUCTION_BUILD } from "next/constants";

export type Game = "minecraft" | "hytale";

export type Ping = { currentPlayers: number; timestamp: number };

export type ServerData = {
  name: string;
  address: string;
  port: number;
  platform: string;
  currentPlayers: number;
  image: string;
  isOnline: boolean;
  motd: string;
  maxPlayers: number;
  totalPlayers: number;
  pings: Ping[];
  uptimePercentage?: number;
  last24hAveragePlayers?: number;
  allTimeAveragePlayers?: number;
  dailyMetrics?: Array<{
    timestamp: number;
    maxPlayers: number;
    averagePlayers: number;
  }>;
  version?: string;
  zeraphProtected?: boolean;
};

export type ServersData = Record<Game, ServerData[]>;

export const GAMES: Game[] = ["minecraft", "hytale"];

export const GAME_LABELS: Record<Game, string> = {
  minecraft: "Minecraft",
  hytale: "Hytale",
};

export const REVALIDATE_SECONDS = 60;

const API_URL =
  (typeof window === "undefined" && process.env.API_URL_INTERNAL) ||
  process.env.NEXT_PUBLIC_API_URL;

export function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
}

export const gamePath = (game: Game) => (game === "hytale" ? "/hytale" : "/");

export const serverPath = (name: string) => `/server/${slugify(name)}`;

export const serverAddress = ({ address, port }: ServerData) =>
  `${address}${port ? `:${port}` : ""}`;

async function getData<T>(path: string): Promise<T | null> {
  try {
    const response = await fetch(`${API_URL}${path}`);
    if (!response.ok) return null;
    const json = await response.json();
    return json?.data ?? null;
  } catch (error) {
    console.error(`Error fetching ${path}:`, error);
    return null;
  }
}

export const fetchServers = () => getData<ServersData>("/v1/servers");

export const fetchServer = (name: string) =>
  getData<ServerData>(`/v1/servers/${encodeURIComponent(name)}`);

let cachedServers: { at: number; data: Promise<ServersData | null> } | null =
  null;

export async function loadServers() {
  if (!cachedServers || Date.now() - cachedServers.at > 5000) {
    cachedServers = { at: Date.now(), data: fetchServers() };
  }

  const data = await cachedServers.data;
  if (!data && process.env.NEXT_PHASE !== PHASE_PRODUCTION_BUILD) {
    throw new Error("Failed to fetch servers");
  }
  return data;
}

export function withoutHistory({
  dailyMetrics: _dailyMetrics,
  ...server
}: ServerData): ServerData {
  return { ...server, pings: [] };
}

export async function getServerListProps(game: Game) {
  const data = await loadServers();
  return {
    props: {
      game,
      initialServers: (data?.[game] ?? [])
        .filter((server) => server.name)
        .map(withoutHistory),
    },
    revalidate: REVALIDATE_SECONDS,
  };
}
