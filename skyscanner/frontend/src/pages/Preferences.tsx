import React from "react";
import UserPreferencesForm from "@/components/UserPreferencesForm";
import { useTeam } from "@/context/TeamContext";
import { useNavigate } from "react-router-dom";

export default function Preferences() {
  const { addMember } = useTeam();
  const navigate = useNavigate();

  const handleUserSubmit = (userData: {
    name: string;
    city: string;
    budget: number;
    tags: string[];
  }) => {
    try {
      addMember(userData);
      navigate("/team"); // ✅ redirect to Team page
    } catch (error) {
      console.error("Failed to add user:", error);
      alert("Something went wrong.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <UserPreferencesForm onSubmit={handleUserSubmit} />
    </div>
  );
}
