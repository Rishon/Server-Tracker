// Components
import Layout from "@/components/Layout";
import ServerGraph from "@/components/ServerGraph";
import { useEffect, useState } from "react";

export default function Home() {
  const initialServerData = {
    name: "",
    address: "",
    platform: "",
    currentPlayers: 0,
    image: "",
    maxPlayers: 0,
    totalPlayers: 0,
    pings: [],
  };

  const [serversData, setServersData] = useState({
    java: [{ ...initialServerData }],
    bedrock: [{ ...initialServerData }],
  });

  useEffect(() => {
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
  }, []);

  return (
    <Layout>
      <main className="items-center pt-16 pb-12 ml-4 lg:ml-64">
        <div className="rounded-lg shadow-lg p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {serversData.java
            .sort((a, b) => b.currentPlayers - a.currentPlayers)
            .map((server, index) => (
              <ServerGraph
                key={index}
                image={server.image}
                name={server.name}
                ipAddress={server.address}
                currentPlayers={server.currentPlayers}
                maxPlayers={server.maxPlayers}
                totalPlayers={server.totalPlayers}
                pings={server.pings}
              />
            ))}
        </div>
      </main>
    </Layout>
  );
}
