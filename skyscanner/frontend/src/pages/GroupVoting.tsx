
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/services/apiService";
import { Card, CardContent } from "@/components/ui/card";
import { Friend, GroupVote, City } from "@/types";
import { Check, Vote } from "lucide-react";

const GroupVoting = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [myVote, setMyVote] = useState<string | null>(null);
  const [groupVotes, setGroupVotes] = useState<GroupVote[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userId] = useState("user-" + Math.random().toString(36).substring(2, 9)); // Generate a random user ID
  
  // Get the selected city from location state
  const selectedCity = location.state?.selectedCity as City | undefined;
  
  // Load friends and votes
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const loadedFriends = await apiService.getFriends();
        setFriends(loadedFriends);
        
        // Load group votes
        const loadedVotes = await apiService.getGroupVotes();
        setGroupVotes(loadedVotes);
      } catch (error) {
        console.error("Error loading data:", error);
        toast({
          title: "Error",
          description: "Failed to load friends data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  // Handle vote submission
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
        
        // Reload group votes after submitting
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

  const handleGoBack = () => {
    navigate('/');
  };

  // Prepare unique city options from friends' top cities and selected city
  const getCityOptions = () => {
    const allCities = [
      ...(selectedCity ? [selectedCity] : []),
      ...friends.map(friend => friend.topCity),
    ];
    
    // Filter out duplicates based on city name
    const uniqueCities = Array.from(
      new Map(allCities.map(city => [city.name, city])).values()
    );
    
    return uniqueCities;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      <div className="container py-10 px-4">
        <Button 
          variant="outline" 
          onClick={handleGoBack}
          className="mb-6"
        >
          ← Back to Mind City Navigator
        </Button>

        <h1 className="text-3xl font-bold text-center text-indigo-900 mb-2">Group Voting</h1>
        <p className="text-center text-gray-600 mb-8">
          Vote for a city that everyone in your group will enjoy visiting together
        </p>

        {isLoading && (
          <div className="flex justify-center items-center my-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-700"></div>
          </div>
        )}

        {!isLoading && (
          <>
            <div className="grid grid-cols-1 gap-8">
              <section>
                <h2 className="text-xl font-semibold mb-4">Your Friends' Top Cities</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {friends.map((friend) => (
                    <Card key={friend.id} className="overflow-hidden">
                      <div className="aspect-video overflow-hidden">
                        <img 
                          src={`${friend.topCity.images[0]}&friend=${friend.id}`} 
                          alt={friend.topCity.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="h-10 w-10 rounded-full overflow-hidden">
                            <img 
                              src={friend.avatar} 
                              alt={friend.name} 
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-medium">{friend.name}</p>
                            <p className="text-sm text-gray-500">{friend.hasVoted ? 'Has voted' : 'Hasn\'t voted yet'}</p>
                          </div>
                        </div>
                        <p className="font-semibold">{friend.topCity.name}</p>
                        <p className="text-sm text-gray-600 line-clamp-2 mt-1">{friend.topCity.vibe}</p>
                      </CardContent>
                    </Card>
                  ))}

                  {selectedCity && (
                    <Card className="overflow-hidden">
                      <div className="aspect-video overflow-hidden">
                        <img 
                          src={`${selectedCity.images[0]}&you=true`} 
                          alt={selectedCity.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                            <span className="text-indigo-700 font-bold">You</span>
                          </div>
                          <div>
                            <p className="font-medium">Your Selection</p>
                            <p className="text-sm text-gray-500">{myVote ? 'Voted' : 'Not voted yet'}</p>
                          </div>
                        </div>
                        <p className="font-semibold">{selectedCity.name}</p>
                        <p className="text-sm text-gray-600 line-clamp-2 mt-1">{selectedCity.vibe}</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </section>

              <section className="mt-8">
                <h2 className="text-xl font-semibold mb-4">Cast Your Vote</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getCityOptions().map((city) => (
                    <Card key={city.name} className={`overflow-hidden ${myVote === city.name ? 'ring-2 ring-indigo-500' : ''}`}>
                      <div className="aspect-video overflow-hidden">
                        <img 
                          src={`${city.images[0]}&vote=true`} 
                          alt={city.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <CardContent className="p-4">
                        <p className="font-semibold">{city.name}</p>
                        <p className="text-sm text-gray-600 line-clamp-2 mt-1">{city.vibe}</p>
                        <Button 
                          className="w-full mt-3 gap-2"
                          variant={myVote === city.name ? "secondary" : "default"}
                          onClick={() => handleVote(city.name)}
                          disabled={isLoading || (myVote !== null && myVote !== city.name)}
                        >
                          {myVote === city.name ? (
                            <>
                              <Check size={16} /> Voted
                            </>
                          ) : (
                            <>
                              <Vote size={16} /> Vote for {city.name}
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>

              <section className="mt-8">
                <h2 className="text-xl font-semibold mb-4">Current Results</h2>
                {groupVotes.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {groupVotes.map((vote) => (
                      <Card key={vote.cityName} className="overflow-hidden">
                        <div className="aspect-video overflow-hidden">
                          <img 
                            src={`${vote.images[0]}&result=true`} 
                            alt={vote.cityName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-center">
                            <p className="font-semibold">{vote.cityName}</p>
                            <div className="bg-indigo-100 text-indigo-800 font-medium px-2 py-1 rounded-full text-sm">
                              {vote.votes} vote{vote.votes !== 1 ? 's' : ''}
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-2 mt-1">{vote.vibe}</p>
                          <div className="mt-3">
                            <p className="text-xs text-gray-500 mb-1">Voters:</p>
                            <div className="flex flex-wrap gap-1">
                              {vote.voters.map((voter, index) => (
                                <span key={index} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                                  {voter}
                                </span>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8">
                    No votes cast yet. Be the first to vote!
                  </p>
                )}
              </section>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default GroupVoting;
