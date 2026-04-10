// React
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";

// Cache
import { getCache, setCache } from "@/data/Cache";

type SortBy = "players" | "uptime";

type SortByContextType = {
  sortBy: SortBy;
  setSortBy: (sortBy: SortBy) => void;
};

const SortByContext = createContext<SortByContextType | undefined>(undefined);

export const SortByProvider = ({ children }: { children: ReactNode }) => {
  const [sortBy, setSortByState] = useState<SortBy>("players");

  useEffect(() => {
    const cachedSortBy = getCache("sortBy");
    if (cachedSortBy === "players" || cachedSortBy === "uptime") {
      setSortByState(cachedSortBy);
    }
  }, []);

  const setSortBy = (sort: SortBy) => {
    setCache("sortBy", sort);
    setSortByState(sort);
  };

  return (
    <SortByContext.Provider value={{ sortBy, setSortBy }}>
      {children}
    </SortByContext.Provider>
  );
};

export const useSortBy = () => {
  const context = useContext(SortByContext);
  if (!context) return { sortBy: "players" as SortBy, setSortBy: () => {} };
  return context;
};
