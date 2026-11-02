import { GetStaticProps } from "next";

import ServerList, { ServerListProps } from "@/components/ServerList";
import { getServerListProps } from "@/data/Servers";

export default function Hytale(props: ServerListProps) {
  return <ServerList {...props} />;
}

export const getStaticProps: GetStaticProps<ServerListProps> = () =>
  getServerListProps("hytale");
