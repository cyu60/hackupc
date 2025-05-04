import React from "react";
import { useTeam } from "@/context/TeamContext";
import { useNavigate } from "react-router-dom";

export default function Team() {
  const { members } = useTeam();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-center mb-6">👥 Your Team</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {members.map((member, i) => (
          <div key={i} className="bg-white p-4 rounded shadow border">
            <h2 className="text-lg font-semibold">{member.name}</h2>
            <p className="text-sm text-gray-600">From: {member.city}</p>
            <p className="text-sm text-gray-600">Budget: €{member.budget}</p>
            <div className="flex flex-wrap gap-1 mt-2">
              {member.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center mt-8">
        <button
          onClick={() => navigate("/destinations")}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          🌍 Start Destination Discovery
        </button>
      </div>
    </div>
  );
}
