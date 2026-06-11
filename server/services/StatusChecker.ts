// Servers.json data
import serversList from "../servers.json";

// Services
import MongoDB from "./MongoDB";

// Query
import { ProtocolReader } from "../utils/ProtocolReader";
import { query } from "@hytaleone/query";

// Utils
import { getFallbackHytaleImage, getFallbackMCImage } from "../utils/ImageData";

// Interfaces
interface ServerData {
  isOnline?: Boolean;
  currentPlayers: Number;
  image: String;
  motd: String;
  version?: String;
}

interface ServerInfo {
  isOnline?: Boolean;
  address: String;
  port?: Number;
  currentPlayers: Number;
  image: String;
  motd: String;
  version?: String;
}

type ExtraObject = {
  color?: string;
  extra?: (ExtraObject | string)[];
  text?: string;
  bold?: boolean;
  italic?: boolean;
  underlined?: boolean;
  strikethrough?: boolean;
  obfuscated?: boolean;
};

type MotdData = {
  extra?: (ExtraObject | string)[];
  text?: string;
};

type Platform = "minecraft" | "hytale";

const serversData: Record<Platform, ServerInfo[]> = {
  minecraft: [],
  hytale: [],
};

class StatusChecker {
  private async withTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number,
    errorMessage: string,
  ): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(errorMessage));
      }, timeoutMs);

      promise
        .then((value) => {
          clearTimeout(timeoutId);
          resolve(value);
        })
        .catch((error) => {
          clearTimeout(timeoutId);
          reject(error);
        });
    });
  }

  private isFetching: boolean = false;

  private static readonly OFFLINE_THRESHOLD = 3;
  private failureStreak = new Map<string, number>();
  private lastGood = new Map<string, any>();

  public async fetchServersData(platform: Platform) {
    if (this.isFetching) return;
    this.isFetching = true;

    try {
      const startTime = Date.now();
      console.log(`Fetching ${platform} servers data...`);

      const list = serversList[platform] as {
        name: string;
        address: string;
        port: number;
      }[];

      const newServers: ServerInfo[] = [];

      const tasks = list.map((server) =>
        this.fetchSingleServer(server, platform),
      );
      const results = await Promise.allSettled(tasks);

      for (const result of results) {
        if (result.status === "fulfilled" && result.value) {
          newServers.push(result.value);
        }
      }

      serversData[platform] = newServers;

      const endTime = Date.now();
      console.log(`Fetched ${platform} servers in ${endTime - startTime}ms`);
    } finally {
      this.isFetching = false;
    }
  }

  private async fetchSingleServer(
    server: {
      name: string;
      address: string;
      port: number;
    },
    platform: Platform,
  ) {
    const key = server.address;

    try {
      const info =
        platform === "minecraft"
          ? await this.getMinecraftServerInfo(server.address, server.port)
          : await this.getHytaleServerInfo(server.address, server.port);

      if (info.isOnline) {
        this.failureStreak.set(key, 0);
        const result = await this.recordAndBuild(server, platform, info, true);
        if (result) this.lastGood.set(key, result);
        return result;
      }

      const failures = (this.failureStreak.get(key) ?? 0) + 1;
      this.failureStreak.set(key, failures);

      const cached = this.lastGood.get(key);
      if (failures < StatusChecker.OFFLINE_THRESHOLD && cached) {
        console.warn(
          `[${platform}] ${server.name} unreachable ` +
            `(${failures}/${StatusChecker.OFFLINE_THRESHOLD}) - holding last-known-online`,
        );
        const graceInfo: ServerData = {
          isOnline: false,
          currentPlayers: cached.currentPlayers,
          image: cached.image,
          motd: cached.motd,
          version: cached.version,
        };
        try {
          const held = await this.recordAndBuild(
            server,
            platform,
            graceInfo,
            false,
            true,
          );
          return held ?? cached;
        } catch {
          return cached;
        }
      }

      return await this.recordAndBuild(server, platform, info, false);
    } catch (err) {
      console.error(`[${platform}] Failed fetching ${server.name}`, err);

      const failures = (this.failureStreak.get(key) ?? 0) + 1;
      this.failureStreak.set(key, failures);
      const cached = this.lastGood.get(key);
      if (failures < StatusChecker.OFFLINE_THRESHOLD && cached) return cached;
      return cached ? { ...cached, isOnline: false } : null;
    }
  }

  private async recordAndBuild(
    server: { name: string; address: string; port: number },
    platform: Platform,
    info: ServerData,
    recordOnline: boolean,
    displayOnline: boolean = recordOnline,
  ) {
    const image =
      platform === "hytale"
        ? getFallbackHytaleImage()
        : info.image || getFallbackMCImage();

    const motd = info.motd || "";

    await MongoDB.pingServer(
      server.name,
      server.address,
      server.port,
      info.currentPlayers,
      image,
      motd,
      platform,
      recordOnline,
    );

    const mongoServer = await MongoDB.getServerData(server.address);
    if (!mongoServer) return null;

    // Calculate uptime percentage
    const totalChecks = mongoServer.uptimeStats?.totalChecks || 1;
    const successfulChecks = mongoServer.uptimeStats?.successfulChecks || 0;
    const uptimePercentage =
      totalChecks > 0 ? Math.round((successfulChecks / totalChecks) * 100) : 0;

    return {
      ...server,
      platform,
      isOnline: displayOnline,
      currentPlayers: info.currentPlayers,
      maxPlayers: mongoServer.maxPlayers,
      totalPlayers: mongoServer.totalPlayers,
      image: mongoServer.image,
      motd: mongoServer.motd,
      pings: mongoServer.ping,
      uptimePercentage,
      last24hAveragePlayers: mongoServer.last24hAveragePlayers,
      allTimeAveragePlayers: mongoServer.allTimeAveragePlayers,
      dailyMetrics: mongoServer.dailyMetrics,
      version: info.version,
    };
  }

  private async getMinecraftServerInfo(
    address: string,
    port: number = 25565,
  ): Promise<ServerData> {
    const ATTEMPT_TIMEOUT_MS = 1000 * 10;
    const MAX_RETRIES = 3;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const data = await this.withTimeout(
          ProtocolReader.ping(address, port, ATTEMPT_TIMEOUT_MS),
          ATTEMPT_TIMEOUT_MS,
          `Minecraft ping timed out for ${address}:${port}`,
        );

        const descriptionOpt =
          typeof data.description === "object" && data.description !== null
            ? data.description
            : { text: data.description || "" };

        const motd = extractData(descriptionOpt as MotdData);

        return {
          isOnline: true,
          image: data.favicon || "",
          motd: motd,
          currentPlayers: data.players?.online || 0,
          version: data.version?.name || "Unknown",
        };
      } catch {
        if (attempt === MAX_RETRIES) {
          return {
            isOnline: false,
            image: "",
            motd: "",
            currentPlayers: 0,
            version: "Offline",
          };
        }

        await new Promise((r) =>
          setTimeout(r, 400 * attempt + Math.floor(Math.random() * 200)),
        );
      }
    }

    return {
      isOnline: false,
      image: "",
      motd: "",
      currentPlayers: 0,
      version: "Offline",
    };
  }

  private async getHytaleServerInfo(
    address: string,
    port: number = 5520,
  ): Promise<ServerData> {
    const ATTEMPT_TIMEOUT_MS = 1000 * 3;
    const MAX_RETRIES = 2;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const info = await this.withTimeout(
          query(address, port),
          ATTEMPT_TIMEOUT_MS,
          `Hytale query timed out for ${address}:${port}`,
        );

        return {
          isOnline: !!(info.motd || info.currentPlayers),
          image: "", // Hytale does not provide icons yet
          motd: info.motd || "",
          currentPlayers: info.currentPlayers || 0,
          version: "Hytale Beta",
        };
      } catch {
        if (attempt === MAX_RETRIES) {
          return {
            isOnline: false,
            image: "",
            motd: "",
            currentPlayers: 0,
            version: "Offline",
          };
        }

        await new Promise((r) => setTimeout(r, 500));
      }
    }

    return {
      isOnline: false,
      image: "",
      motd: "",
      currentPlayers: 0,
      version: "Offline",
    };
  }

  public async refreshAllServers() {
    await this.fetchServersData("minecraft");
    await this.fetchServersData("hytale");

    const allServers = [...serversList.minecraft, ...serversList.hytale];

    await MongoDB.removeInvalidServers(allServers);
  }

  public getServersData() {
    return serversData;
  }
}

const colorCodes: Record<string, string> = {
  black: "0",
  dark_blue: "1",
  dark_green: "2",
  dark_aqua: "3",
  dark_red: "4",
  dark_purple: "5",
  gold: "6",
  gray: "7",
  dark_gray: "8",
  blue: "9",
  green: "a",
  aqua: "b",
  red: "c",
  light_purple: "d",
  yellow: "e",
  white: "f",
  obfuscated: "k",
  bold: "l",
  strikethrough: "m",
  underlined: "n",
  italic: "o",
  reset: "r",
};

type EffectiveStyle = {
  color?: string;
  bold?: boolean;
  italic?: boolean;
  underlined?: boolean;
  strikethrough?: boolean;
  obfuscated?: boolean;
};

const formatKeys = [
  "bold",
  "italic",
  "underlined",
  "strikethrough",
  "obfuscated",
] as const;

function colorToCodes(color?: string): string {
  if (!color) return "";
  if (/^#[0-9a-fA-F]{6}$/.test(color)) {
    return (
      "§x" +
      color
        .substring(1)
        .split("")
        .map((c) => `§${c}`)
        .join("")
    );
  }
  return colorCodes[color] ? `§${colorCodes[color]}` : "";
}

function styleToCodes(style: EffectiveStyle): string {
  let out = "§r" + colorToCodes(style.color);
  for (const key of formatKeys) {
    if (style[key]) out += `§${colorCodes[key]}`;
  }
  return out;
}

function parseInlineCodes(text: string): string {
  return text
    .replace(/(?:&#|<#|<color:#)([0-9a-fA-F]{6})>?/gi, (_match, hex) =>
      "§x" +
      hex
        .split("")
        .map((c: string) => `§${c}`)
        .join(""),
    )
    .replace(/<\/(?:#|color:#)[0-9a-fA-F]{6}>/gi, "")
    .replace(/&([0-9a-fklmnor])/gi, "§$1")
    .replace(/\\n/g, "\n");
}

function extractData(
  obj: ExtraObject | string,
  inherited: EffectiveStyle = {},
): string {
  if (typeof obj === "string") {
    return obj ? styleToCodes(inherited) + parseInlineCodes(obj) : "";
  }

  const eff: EffectiveStyle = { ...inherited };
  if (obj.color) eff.color = obj.color;
  for (const key of formatKeys) {
    if (obj[key] !== undefined) eff[key] = obj[key];
  }

  let result = "";
  if (obj.text) result += styleToCodes(eff) + parseInlineCodes(obj.text);

  if (obj.extra && Array.isArray(obj.extra)) {
    for (const child of obj.extra) {
      result += extractData(child, eff);
    }
  }

  return result;
}

export default StatusChecker;
