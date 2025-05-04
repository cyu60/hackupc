import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/services/apiService";
import { Card, CardContent } from "@/components/ui/card";
import { GroupVote } from "@/types";
import { Check, Vote } from "lucide-react";
import { useCitySession } from "@/context/CitySessionContext.tsx";
import { useVoteSession } from "@/context/VoteContext";

const GroupVoting = () => {
  const navigate = useNavigate();
  const { cities } = useCitySession();
  const { toast } = useToast();
  const { assignments: contextAssignments } = useVoteSession();

  const assignments = contextAssignments.length > 0 ? contextAssignments : [
    { name: "Yange", budget: 400, assignedCity: "New York City" },
    { name: "Mudi", budget: 800, assignedCity: "London" },
    { name: "Chinat", budget: 300, assignedCity: "Tokyo" },
  ];

  const [myVote, setMyVote] = useState<string | null>(null);
  const [groupVotes, setGroupVotes] = useState<GroupVote[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userId] = useState("user-" + Math.random().toString(36).substring(2, 9));

  // Generate city costs once
  const [cityCosts] = useState<Record<string, number>>(() => {
    const costs: Record<string, number> = {};
    cities.forEach(city => {
      costs[city] = Math.floor(Math.random() * (1200 - 300 + 1)) + 300;
    });
    return costs;
  });

  const mostExpensiveCity = Object.entries(cityCosts).reduce((maxCity, [city, cost]) => {
    return cost > cityCosts[maxCity] ? city : maxCity;
  }, cities[0]);

  const randomFinalCity = cities[Math.floor(Math.random() * cities.length)];

  useEffect(() => {
    const loadVotes = async () => {
      setIsLoading(true);
      try {
        const loadedVotes = await apiService.getGroupVotes();
        setGroupVotes(loadedVotes);
      } catch (error) {
        console.error("Error loading group votes:", error);
        toast({
          title: "Error",
          description: "Failed to load group votes. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadVotes();
  }, []);

  const handleVote = async (cityName: string) => {
    setIsLoading(true);
    try {
      const success = await apiService.submitVote(userId, cityName);
      if (success) {
        setMyVote(cityName);
        toast({
          title: "Vote Submitted",
          description: `You voted for ${cityName}!`,
        });
        const updatedVotes = await apiService.getGroupVotes();
        setGroupVotes(updatedVotes);
      }
    } catch (error) {
      console.error("Error submitting vote:", error);
      toast({
        title: "Error",
        description: "Failed to submit your vote. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      <div className="container py-10 px-4">
        <h1 className="text-3xl font-bold text-center text-indigo-900 mb-2">Group Voting</h1>
        <p className="text-center text-gray-600 mb-8">
          Vote for a city that everyone in your group will enjoy visiting together
        </p>

        {isLoading ? (
          <div className="flex justify-center items-center my-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-700"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8">
            {/* 👥 Group Members */}
            <section>
              <h2 className="text-xl font-semibold mb-4">Group Members</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { name: "Yange", voted: true, img: "/Yange.jpg" },
                  { name: "Mudi", voted: false, img: "/Mudi.jpg" },
                  { name: "Chinat", voted: true, img: "/Chinat.jpg" },
                ].map((member, index) => (
                  <Card key={index} className="overflow-hidden">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={member.img}
                          alt={member.name}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                        <p className="font-medium">{member.name}</p>
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        {member.voted ? (
                          <span role="img" aria-label="voted">✅</span>
                        ) : (
                          <span role="img" aria-label="waiting">⏳</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* 🗳️ Voting Cards */}
            <section className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Cast Your Vote</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {cities.map((cityName) => (
                  <Card
                    key={cityName}
                    className={`overflow-hidden ${myVote === cityName ? "ring-2 ring-indigo-500" : ""}`}
                  >
                    <CardContent className="p-4">
                      <p className="font-semibold">{cityName}</p>
                      <p className="text-sm text-gray-600">
                        Estimated Cost: €{cityCosts[cityName]}
                      </p>
                      {cityName === mostExpensiveCity && (
                        <div className="text-sm text-red-500 mt-1 flex items-center gap-1">
                          ⚠️ This might be out of a friend’s budget
                        </div>
                      )}
                      <Button
                        className="w-full mt-3 gap-2"
                        variant={myVote === cityName ? "secondary" : "default"}
                        onClick={() => handleVote(cityName)}
                        disabled={isLoading || (myVote !== null && myVote !== cityName)}
                      >
                        {myVote === cityName ? (
                          <>
                            <Check size={16} /> Voted
                          </>
                        ) : (
                          <>
                            <Vote size={16} /> Vote for {cityName}
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* 🌍 Final Destination Button */}
            <div className="flex justify-center mt-10">
              <Button
                className="px-6 py-3 text-lg rounded-xl shadow-md bg-indigo-600 text-white hover:bg-indigo-700"
                onClick={() =>
                  navigate("/final-destination", {
                    state: { city: randomFinalCity },
                  })
                }
              >
                🎉 Discover Final Destination
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupVoting;
