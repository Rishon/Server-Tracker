import { createContext, useContext, useState, ReactNode } from "react";

type CurrentList = "minecraft" | "hytale";

type CurrentListContextType = {
  currentList: CurrentList;
  setCurrentList: React.Dispatch<React.SetStateAction<CurrentList>>;
};

const CurrentListContext = createContext<CurrentListContextType | undefined>(
  undefined,
);

export const CurrentListProvider = ({ children }: { children: ReactNode }) => {
  const [currentList, setCurrentList] = useState<CurrentList>("minecraft");

  return (
    <CurrentListContext.Provider value={{ currentList, setCurrentList }}>
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
