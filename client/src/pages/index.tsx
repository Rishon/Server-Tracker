// Components
import Layout from "@/components/Layout";
import ServerGraph from "@/components/ServerGraph";
import { useEffect, useState } from "react";

// Cache
import { getCache } from "@/data/Cache";

// Context
import { useGraphColor } from "@/contexts/GraphColorContext";

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
};

type ServersData = {
  java: ServerData[];
  bedrock: ServerData[];
};

export default function Home() {
  const [serversData, setServersData] = useState<ServersData>({
    java: [],
    bedrock: [],
  });

  const { graphColor, setGraphColor } = useGraphColor();

  useEffect(() => {
    const cachedGraphColor = getCache("graphColor");
    if (cachedGraphColor) setGraphColor(cachedGraphColor);

    const fetchServers = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/v1/servers`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch servers");
        }
        const data = await response.json();
        setServersData(data.data);
      } catch (error) {
        console.error("Error fetching servers:", error);
      }
    };

    fetchServers();

    const intervalId = setInterval(fetchServers, 1000 * 10);
    return () => clearInterval(intervalId);
  }, [setGraphColor]);

  return (
    <Layout>
      <main className="items-center pt-16 pb-24 ml-4">
        <div className="rounded-lg shadow-lg p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {serversData.java
            .sort((a, b) => {
              if (a.isOnline !== b.isOnline) {
                return a.isOnline ? -1 : 1;
              }

              if (b.currentPlayers !== a.currentPlayers) {
                return b.currentPlayers - a.currentPlayers;
              }

              return b.name.localeCompare(a.name);
            })
            .filter((server) => server.name !== "")
            .map((server, index) => (
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
              />
            ))}
        </div>
      </main>
    </Layout>
  );
}
