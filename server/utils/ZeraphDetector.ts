import { isIP } from "net";
import { resolveCname, resolveSrv } from "dns/promises";

const INGRESS_PATTERN = /(^|\.)ingress(-[a-z0-9]+)?\.zeraph\.app$/;
const NO_RECORD_CODES = new Set(["ENODATA", "ENOTFOUND"]);
const CACHE_TTL_MS = 1000 * 60 * 10;
const MAX_HOPS = 10;

const cache = new Map<string, { isProtected: boolean; checkedAt: number }>();

async function lookup<T>(promise: Promise<T[]>): Promise<T[]> {
  try {
    return await promise;
  } catch (err: any) {
    if (NO_RECORD_CODES.has(err?.code)) return [];
    throw err;
  }
}

async function pointsToZeraphIngress(domain: string): Promise<boolean> {
  const queue: string[] = [domain];
  const visited = new Set<string>();

  while (queue.length > 0 && visited.size < MAX_HOPS) {
    const current = queue.shift()!.toLowerCase().replace(/\.$/, "");
    if (visited.has(current)) continue;
    visited.add(current);

    if (INGRESS_PATTERN.test(current)) return true;

    const [cnames, srvs] = await Promise.all([
      lookup(resolveCname(current)),
      lookup(resolveSrv(`_minecraft._tcp.${current}`)),
    ]);

    queue.push(...cnames, ...srvs.map((srv) => srv.name));
  }

  return false;
}

export async function isZeraphProtected(address: string): Promise<boolean> {
  const key = address.toLowerCase();
  if (isIP(key)) return false;

  const cached = cache.get(key);
  if (cached && Date.now() - cached.checkedAt < CACHE_TTL_MS)
    return cached.isProtected;

  try {
    const isProtected = await pointsToZeraphIngress(key);
    cache.set(key, { isProtected, checkedAt: Date.now() });
    return isProtected;
  } catch (err) {
    console.warn(`Zeraph DNS check failed for ${address}`, err);
    return cached?.isProtected ?? false;
  }
}
