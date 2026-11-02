import { createContext, useContext, ReactNode } from "react";
import { useRouter } from "next/router";

import { Game, gamePath } from "@/data/Servers";

type CurrentListContextType = {
  currentList: Game;
  setCurrentList: (list: Game) => void;
};

const CurrentListContext = createContext<CurrentListContextType | undefined>(
  undefined,
);

export const CurrentListProvider = ({
  game,
  children,
}: {
  game?: Game;
  children: ReactNode;
}) => {
  const router = useRouter();

  const setCurrentList = (list: Game) => {
    const path = gamePath(list);
    if (router.asPath !== path) router.push(path);
  };

  return (
    <CurrentListContext.Provider
      value={{ currentList: game ?? "minecraft", setCurrentList }}
    >
      {children}
    </CurrentListContext.Provider>
  );
};

export const useCurrentList = () => {
  const context = useContext(CurrentListContext);
  if (!context) {
    throw new Error("useCurrentList must be used within a CurrentListProvider");
  }
  return context;
};
