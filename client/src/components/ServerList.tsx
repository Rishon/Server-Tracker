import { useEffect, useState } from "react";

import Layout from "@/components/Layout";
import ServerGraph from "@/components/ServerGraph";
import { useGraphColor } from "@/contexts/GraphColorContext";
import { useSortBy } from "@/contexts/SortByContext";

import {
  fetchServers,
  Game,
  GAME_LABELS,
  gamePath,
  ServerData,
  serverPath,
} from "@/data/Servers";

export type ServerListProps = {
  game: Game;
  initialServers: ServerData[];
};

export default function ServerList({ game, initialServers }: ServerListProps) {
  const [servers, setServers] = useState(initialServers);

  const { graphColor } = useGraphColor();
  const { sortBy } = useSortBy();

  useEffect(() => {
    const load = async () => {
      const data = await fetchServers();
      if (data) setServers(data[game] ?? []);
    };

    load();

    const intervalId = setInterval(load, 1000 * 10);
    return () => clearInterval(intervalId);
  }, [game]);

  const label = GAME_LABELS[game];
  const heading = `Israeli ${label} Servers`;

  const visibleServers = servers
    .filter((server) => server.name !== "")
    .sort((a, b) => {
      if (a.isOnline !== b.isOnline) {
        return a.isOnline ? -1 : 1;
      }

      switch (sortBy) {
        case "players":
          return b.currentPlayers - a.currentPlayers;
        case "uptime":
          return (b.uptimePercentage || 0) - (a.uptimePercentage || 0);
        default:
          return 0;
      }
    });

  return (
    <Layout
      seo={{
        title: `${heading} – Live Player Counts`,
        description: `Live player counts, MOTDs, 24-hour graphs and uptime for Israeli ${label} servers, refreshed every minute. Find a server and copy its IP in one click.`,
        path: gamePath(game),
      }}
    >
      <main
        className={`items-center transition-all duration-300 pb-28 lg:pb-24 ${
          game === "hytale" ? "pt-56 sm:pt-40" : "pt-36 sm:pt-32"
        }`}
      >
        <h1 className="sr-only">{heading}</h1>

        {visibleServers.length === 0 ? (
          <div className="text-center text-gray-400 py-12">
            No servers to display
          </div>
        ) : (
          <div className="rounded-lg shadow-lg p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {visibleServers.map((server) => (
              <ServerGraph
                key={server.name}
                href={serverPath(server.name)}
                isOnline={server.isOnline}
                image={server.image}
                motd={server.motd}
                name={server.name}
                ipAddress={server.address}
                port={server.port}
                currentPlayers={server.currentPlayers}
                maxPlayers={server.maxPlayers}
                totalPlayers={server.totalPlayers}
                pings={server.pings}
                graphColor={graphColor}
                uptimePercentage={server.uptimePercentage}
                last24hAveragePlayers={server.last24hAveragePlayers}
                allTimeAveragePlayers={server.allTimeAveragePlayers}
                version={server.version}
                zeraphProtected={server.zeraphProtected}
              />
            ))}
          </div>
        )}
      </main>
    </Layout>
  );
}
