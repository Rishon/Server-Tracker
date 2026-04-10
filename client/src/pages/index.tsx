// Components
import Layout from "@/components/Layout";
import ServerGraph from "@/components/ServerGraph";
import { useEffect, useState } from "react";

// Cache
import { getCache } from "@/data/Cache";

// Context
import { useGraphColor } from "@/contexts/GraphColorContext";
import { useCurrentList } from "@/contexts/CurrentListContext";
import { useSortBy } from "@/contexts/SortByContext";

type ServerData = {
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
  pings: any[];
  uptimePercentage?: number;
  last24hAveragePlayers?: number;
  allTimeAveragePlayers?: number;
  dailyMetrics?: Array<{
    timestamp: number;
    maxPlayers: number;
    averagePlayers: number;
  }>;
  version?: string;
};

type ServersData = {
  minecraft: ServerData[];
  hytale: ServerData[];
};

export default function Home() {
  const [serversData, setServersData] = useState<ServersData>({
    minecraft: [],
    hytale: [],
  });
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Context
  const { graphColor, setGraphColor } = useGraphColor();
  const { currentList } = useCurrentList();
  const { sortBy } = useSortBy();

  useEffect(() => {
    const cachedGraphColor = getCache("graphColor");
    if (cachedGraphColor) setGraphColor(cachedGraphColor);

    const fetchServers = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/v1/servers`,
        );

        if (!response.ok) {
          throw new Error("Failed to fetch servers");
        }

        const data = await response.json();

        if (data?.data) {
          setServersData(data.data);
          setHasLoadedOnce(true);
        }
      } catch (error) {
        console.error("Error fetching servers:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchServers();

    const intervalId = setInterval(fetchServers, 1000 * 10);
    return () => clearInterval(intervalId);
  }, [setGraphColor]);

  return (
    <Layout>
      <main
        className={`items-center transition-all duration-300 pb-24 ${
          currentList === "hytale" ? "pt-56 sm:pt-40" : "pt-36 sm:pt-32"
        }`}
      >
        {(() => {
          const visibleServers = serversData[currentList]
            .filter((server) => server.name !== "")
            .sort((a, b) => {
              if (a.isOnline !== b.isOnline) {
                return a.isOnline ? -1 : 1;
              }

              switch (sortBy) {
                case "players":
                  return b.currentPlayers - a.currentPlayers;
                case "uptime":
                  const aUptime = a.uptimePercentage || 0;
                  const bUptime = b.uptimePercentage || 0;
                  return bUptime - aUptime;
                default:
                  return 0;
              }
            });

          if (isLoading && !hasLoadedOnce) {
            return (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              </div>
            );
          }

          if (visibleServers.length === 0 && hasLoadedOnce && !isLoading) {
            return (
              <div className="text-center text-gray-400 py-12">
                No servers to display
              </div>
            );
          }

          return (
            <div className="rounded-lg shadow-lg p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {visibleServers.map((server, index) => (
                <ServerGraph
                  key={index}
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
                />
              ))}
            </div>
          );
        })()}
      </main>
    </Layout>
  );
}
