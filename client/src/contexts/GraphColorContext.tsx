// React
import { createContext, useState, useContext, ReactNode } from "react";

type GraphColorContextType = {
  graphColor: string;
  setGraphColor: (color: string) => void;
};

const GraphColorContext = createContext<GraphColorContextType | undefined>(
  undefined,
);

/**
 * Provide the graph color context
 * @param children The children components
 * @returns The graph color provider
 */
export const GraphColorProvider = ({ children }: { children: ReactNode }) => {
  const [graphColor, setGraphColor] = useState("#32D67A");

  return (
    <GraphColorContext.Provider value={{ graphColor, setGraphColor }}>
      {children}
    </GraphColorContext.Provider>
  );
};

/**
 * Get the graph color context
 * @returns The graph color context
 */
export const useGraphColor = () => {
  const context = useContext(GraphColorContext);
  if (!context) return { graphColor: "#32D67A", setGraphColor: () => {} };
  return context;
};
