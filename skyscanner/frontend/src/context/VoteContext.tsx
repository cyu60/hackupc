import React, { createContext, useContext, useState } from "react";
import { Member } from "@/context/TeamContext";

export type AssignedMember = Member & {
  assignedCity: string;
  budgetWarning?: boolean; // optional warning flag
};

type VoteContextType = {
  assignments: AssignedMember[];
  setAssignments: (value: AssignedMember[]) => void;
};

const VoteContext = createContext<VoteContextType>({
  assignments: [],
  setAssignments: () => {},
});

export const VoteProvider = ({ children }: { children: React.ReactNode }) => {
  const [assignments, setAssignments] = useState<AssignedMember[]>([]);

  return (
    <VoteContext.Provider value={{ assignments, setAssignments }}>
      {children}
    </VoteContext.Provider>
  );
};

export const useVoteSession = () => useContext(VoteContext);