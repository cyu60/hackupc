import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/services/apiService";
import { websocketService } from "@/services/websocketService";
import { City, EEGMessage, EEGSummaryData, EEGRealtimeData } from "@/types";
import { analyzeEEGFeedback, getNextActionText } from "@/utils/eegUtils";
import CityCollage from "@/components/CityCollage";
import EEGVisualization from "@/components/EEGVisualization";
import DecisionToast from "@/components/DecisionToast";
import FinalSelection from "@/components/FinalSelection";

const Index = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [seedWord, setSeedWord] = useState("");
  const [currentCity, setCurrentCity] = useState<City | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [eegData, setEEGData] = useState<EEGSummaryData | null>(null);
  const [realtimeData, setRealtimeData] = useState<EEGRealtimeData[]>([]);
  const [decisionMessage, setDecisionMessage] = useState<string | null>(null);
  const [viewedCities, setViewedCities] = useState<City[]>([]);
  const [roundCount, setRoundCount] = useState(0);
  const [topCities, setTopCities] = useState<City[]>([]);
  const [showFinalSelection, setShowFinalSelection] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  // Connect to WebSocket
  useEffect(() => {
    websocketService.connect();
    websocketService.onMessage((message: EEGMessage) => {
      if (message.type === 'summary') {
        setEEGData(message.data as EEGSummaryData);
      } else if (message.type === 'real_time') {
        setRealtimeData(prev => [...prev, message.data as EEGRealtimeData].slice(-30));
      }
    });

    return () => {
      websocketService.disconnect();
    };
  }, []);

  // Handle EEG data updates
  useEffect(() => {
    if (!eegData || !currentCity || !hasStarted) return;

    const handleEEGFeedback = async () => {
      // Check if we've reached the limit of 15 rounds
      if (roundCount >= 15) {
        // Prepare top 3 cities based on those marked as liked
        const likedCities = viewedCities.filter(city => city.liked);
        const uniqueCities = Array.from(
          new Map(likedCities.map(city => [city.name, city])).values()
        );
        
        // If we don't have enough liked cities, add some random ones
        const topThreeCities = uniqueCities.slice(0, 3);
        while (topThreeCities.length < 3 && viewedCities.length > 0) {
          const randomCity = viewedCities[Math.floor(Math.random() * viewedCities.length)];
          if (!topThreeCities.some(city => city.name === randomCity.name)) {
            topThreeCities.push(randomCity);
          }
        }
        
        setTopCities(topThreeCities);
        setShowFinalSelection(true);
        return;
      }

      const { isPositive, reason } = analyzeEEGFeedback(eegData);
      
      // Mark the current city as liked or not based on feedback
      const updatedCity = { ...currentCity, liked: isPositive };
      setViewedCities(prev => [...prev, updatedCity]);

      // Set the decision message for the toast
      const actionText = getNextActionText(isPositive, reason);
      setDecisionMessage(actionText);

      // Small delay before loading the next city
      setTimeout(async () => {
        setIsLoading(true);
        try {
          // Get the next city based on feedback using real API
          const nextCity = isPositive
            ? await apiService.getSimilarCity(currentCity)
            : await apiService.getDifferentCity(currentCity);
            
          setCurrentCity(nextCity);
          setRoundCount(prev => prev + 1);
        } catch (error) {
          console.error("Error getting next city:", error);
          toast({
            title: "Error",
            description: "Failed to get the next city. Please try again.",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      }, 2000);
    };

    // Add a delay to give the user time to see the city before processing feedback
    const timer = setTimeout(() => {
      handleEEGFeedback();
    }, 3000);

    return () => clearTimeout(timer);
  }, [eegData, hasStarted]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!seedWord.trim()) return;

    setIsLoading(true);
    setHasStarted(true);
    setRoundCount(0);
    setViewedCities([]);
    setShowFinalSelection(false);

    try {
      const city = await apiService.getCityBySeedWord(seedWord);
      setCurrentCity(city);
      toast({
        title: "Journey Started",
        description: `Starting your mind journey with ${city.name}`,
      });
    } catch (error) {
      console.error("Error getting city:", error);
      toast({
        title: "Error",
        description: "Failed to get city. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCitySelection = async (city: City) => {
    setIsLoading(true);
    try {
      await apiService.selectFinalCity(city);
      toast({
        title: "Success!",
        description: `You've selected ${city.name} as your dream destination!`,
      });
      // Navigate to the group voting page with the selected city
      navigate('/group-voting', { state: { selectedCity: city } });
    } catch (error) {
      console.error("Error selecting city:", error);
      toast({
        title: "Error",
        description: "Failed to select the city. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const handleRestart = () => {
    setCurrentCity(null);
    setSeedWord("");
    setHasStarted(false);
    setRoundCount(0);
    setViewedCities([]);
    setShowFinalSelection(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      <div className="container py-10 px-4">
        <h1 className="text-4xl font-bold text-center text-indigo-900 mb-2">Mind City Navigator</h1>
        <p className="text-center text-gray-600 mb-8">
          Explore cities guided by your neural feedback
        </p>

        {!showFinalSelection ? (
          <>
            <form onSubmit={handleSubmit} className="max-w-md mx-auto mb-10">
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Enter a seed word (e.g. peaceful, vibrant, exotic)"
                  value={seedWord}
                  onChange={(e) => setSeedWord(e.target.value)}
                  disabled={isLoading || hasStarted}
                  className="bg-white"
                />
                <Button type="submit" disabled={isLoading || hasStarted || !seedWord.trim()}>
                  {hasStarted ? `Round ${roundCount}/15` : "Start"}
                </Button>
              </div>
            </form>

            <CityCollage city={currentCity} isLoading={isLoading} />
            
            {hasStarted && (
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-500">
                  Round {roundCount}/15 • Collecting neural feedback...
                </p>
              </div>
            )}

            <EEGVisualization data={eegData} realtimeData={realtimeData} />
          </>
        ) : (
          <FinalSelection 
            cities={topCities} 
            onSelect={handleCitySelection} 
            onRestart={handleRestart}
          />
        )}
      </div>

      <DecisionToast message={decisionMessage} />
    </div>
  );
};

export default Index;
