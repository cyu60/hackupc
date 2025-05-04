import React, { createContext, useContext, useState } from "react";

export type Member = {
  name: string;
  city: string;
  budget: number;
  tags: string[];
};

type TeamContextType = {
  members: Member[];
  addMember: (member: Member) => void;
};

const TeamContext = createContext<TeamContextType | undefined>(undefined);

export const TeamProvider = ({ children }: { children: React.ReactNode }) => {
  const [members, setMembers] = useState<Member[]>([
    {
      name: "Chinat",
      city: "Hong Kong",
      budget: 800,
      tags: ["Art", "Museums", "Nightlife"],
    },
    {
      name: "Mudi",
      city: "Hamburg",
      budget: 1000,
      tags: ["Food", "Culture", "Local Festivals"],
    },
    {
      name: "Yange",
      city: "Munich",
      budget: 900,
      tags: ["Architecture", "Fine Dining", "Photography"],
    },
  ]);

  const addMember = (member: Member) => {
    setMembers((prev) => [...prev, member]);
  };

  return (
    <TeamContext.Provider value={{ members, addMember }}>
      {children}
    </TeamContext.Provider>
  );
};

export const useTeam = () => {
  const context = useContext(TeamContext);
  if (!context) throw new Error("TeamContext must be used inside TeamProvider");
  return context;
};
