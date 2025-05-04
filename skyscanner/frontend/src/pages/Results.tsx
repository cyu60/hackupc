import { useCitySession } from "@/context/CitySessionContext";
import { useTeam } from "@/context/TeamContext";
import { useVoteSession } from "@/context/VoteContext"; 
import { useNavigate } from "react-router-dom";

function assignMembersToCitiesRandomly(members, cities) {
  return members.map(member => ({
    ...member,
    assignedCity: cities[Math.floor(Math.random() * cities.length)]
  }));
}

export default function ResultsPage() {
  const { cities } = useCitySession();
  const { members } = useTeam();
  const { setAssignments } = useVoteSession(); // ✅ store assignment
  const navigate = useNavigate();

  const handleProceedToVote = () => {
    const assignments = assignMembersToCitiesRandomly(members, cities.slice(0, 3));
    setAssignments(assignments);
    navigate('/vote');
  };

  return (
    <div className="min-h-screen bg-white px-6 py-10">
      <h1 className="text-3xl font-bold text-center mb-4">🧠 Your Brain’s Top Picks</h1>
      <p className="text-center text-gray-600 mb-6">
        These destinations scored highest based on your real-time brain responses. 
        No guessing — your brain made the call.
      </p>

      <ul className="max-w-xl mx-auto space-y-2 text-lg">
        {cities.slice(0, 3).map((city, i) => (
          <li key={city} className="bg-gray-100 rounded p-4 shadow text-center">
            <strong>{i + 1}. {city}</strong>
          </li>
        ))}
      </ul>

      <div className="mt-8 flex justify-center">
        <button
          className="bg-purple-600 text-white px-6 py-3 rounded text-lg hover:bg-purple-700"
          onClick={handleProceedToVote}
        >
          🗳️ Proceed to Group Voting
        </button>
      </div>
    </div>
  );
}
