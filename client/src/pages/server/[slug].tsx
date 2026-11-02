import { GetStaticPaths, GetStaticProps } from "next";
import Link from "next/link";
import { useEffect, useState } from "react";

import Layout from "@/components/Layout";
import ServerGraph from "@/components/ServerGraph";
import { useGraphColor } from "@/contexts/GraphColorContext";
import {
  fetchServer,
  Game,
  GAME_LABELS,
  GAMES,
  gamePath,
  loadServers,
  REVALIDATE_SECONDS,
  ServerData,
  serverAddress,
  serverPath,
  slugify,
  withoutHistory,
} from "@/data/Servers";

type ServerPageProps = {
  game: Game;
  server: ServerData;
};

const players = (count: number) => `${count} ${count === 1 ? "player" : "players"}`;

export default function ServerPage({
  game,
  server: initialServer,
}: ServerPageProps) {
  const [server, setServer] = useState(initialServer);
  const { graphColor } = useGraphColor();

  useEffect(() => {
    setServer(initialServer);

    const load = async () => {
      const data = await fetchServer(initialServer.name);
      if (data) setServer(data);
    };

    load();

    const intervalId = setInterval(load, 1000 * 10);
    return () => clearInterval(intervalId);
  }, [initialServer]);

  const label = GAME_LABELS[game];
  const address = serverAddress(server);

  const summary = [
    `${server.name} is a ${label} server you can join at ${address}.`,
    server.isOnline
      ? `${players(server.currentPlayers)} online right now, with a 24-hour peak of ${players(server.maxPlayers)}.`
      : "It is offline right now.",
    server.uptimePercentage ? `Uptime: ${server.uptimePercentage}%.` : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Layout
      seo={{
        title: `${server.name} – ${label} Server IP & Player Count`,
        description: summary,
        path: serverPath(server.name),
      }}
    >
      <main
        className={`pb-28 lg:pb-24 ${
          game === "hytale" ? "pt-56 sm:pt-40" : "pt-36 sm:pt-32"
        }`}
      >
        <div className="mx-auto max-w-xl px-4">
          <Link
            href={gamePath(game)}
            className="text-sm text-gray-500 transition-colors hover:text-gray-300"
          >
            ← All {label} servers
          </Link>
          <h1 className="mt-3 text-2xl font-semibold text-gray-100">
            {server.name}
          </h1>
          <p className="mt-2 text-sm text-gray-400">{summary}</p>

          <div className="mt-6">
            <ServerGraph
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
          </div>
        </div>
      </main>
    </Layout>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const data = await loadServers();
  const paths = GAMES.flatMap((game) => data?.[game] ?? [])
    .filter((server) => server.name)
    .map((server) => ({ params: { slug: slugify(server.name) } }));

  return { paths, fallback: "blocking" };
};

export const getStaticProps: GetStaticProps<
  ServerPageProps,
  { slug: string }
> = async ({ params }) => {
  const data = await loadServers();

  for (const game of GAMES) {
    const server = data?.[game]?.find(
      (server) => server.name && slugify(server.name) === params?.slug,
    );
    if (server) {
      return {
        props: { game, server: withoutHistory(server) },
        revalidate: REVALIDATE_SECONDS,
      };
    }
  }

  return { notFound: true, revalidate: REVALIDATE_SECONDS };
};
