import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback, useRef } from "react";
import { fetchCityImages } from "@/lib/pexels";
import { useCitySession } from "@/context/CitySessionContext";

// WebSocket server settings (adjust according to your environment)
const WS_HOST = "localhost";
const WS_PORT = 8765;

export default function EEGCitySession() {
  const { city } = useParams<{ city: string }>();
  const navigate = useNavigate();
  const { cities } = useCitySession();

  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessionStartTime, setSessionStartTime] = useState<number>(0);
  const sessionStartTimeRef = useRef<number>(0);
  const handleScoreRef = useRef<(score: number) => void>(() => {});

  // Update session start time ref when state changes
  useEffect(() => {
    sessionStartTimeRef.current = sessionStartTime;
  }, [sessionStartTime]);

  // Fetch city images and set session start time
  useEffect(() => {
    const load = async () => {
      if (!city) return;
      setLoading(true);
      const imgs = await fetchCityImages(city);
      setImages(imgs);
      setLoading(false);
      setSessionStartTime(Date.now());
    };
    load();
  }, [city]);

  // Score calculation logic
  const computeScore = useCallback((metrics: any): number => {
    const {
      engagement_index,
      mindfulness_index,
      frustration_index,
      arousal_index
    } = metrics;

    // Example composite score calculation (adjust weights based on research)
    const rawScore = (engagement_index * 0.4) +
                     (mindfulness_index * 0.4) +
                     (arousal_index * 0.2) -
                     (frustration_index * 0.3);

    // Normalize to 1-10 scale (adjust ranges based on your data observations)
    const minExpected = -1;
    const maxExpected = 2;
    const clamped = Math.max(minExpected, Math.min(rawScore, maxExpected));
    const normalized = ((clamped - minExpected) / (maxExpected - minExpected)) * 9 + 1;
    return Math.round(Math.min(10, Math.max(1, normalized)));
  }, []);

  // Navigation handler
  const handleScore = useCallback((score: number) => {
    console.log(`🧠 Computed EEG score ${score} for ${city}`);

    const index = cities.findIndex(c => c.toLowerCase() === city?.toLowerCase());
    const nextCity = cities[index + 1];

    if (nextCity) {
      navigate(`/eeg-session/${encodeURIComponent(nextCity.toLowerCase())}`);
    } else {
      navigate("/results");
    }
  }, [city, cities, navigate]);

  // Update handleScore ref
  useEffect(() => {
    handleScoreRef.current = handleScore;
  }, [handleScore]);

  // WebSocket connection
  useEffect(() => {
    const ws = new WebSocket(`ws://${WS_HOST}:${WS_PORT}`);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "summary") {
          const messageTimestamp = data.timestamp * 1000; // Convert to milliseconds

          if (messageTimestamp > sessionStartTimeRef.current) {
            const metrics = data.metrics;
            const score = computeScore(metrics);
            handleScoreRef.current(score);
          }
        }
      } catch (error) {
        console.error("Error processing WebSocket message:", error);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };
  }, [computeScore]);

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center justify-center">
      <h2 className="text-2xl font-bold mb-4 text-center">
        🧠 EEG Session: {city}
      </h2>

      {loading ? (
        <p className="text-gray-500">Loading images...</p>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-2 max-w-md mb-6">
            {images.map((img, i) => (
              <img
                key={i}
                src={img}
                alt={`${city} ${i + 1}`}
                className="w-full h-28 object-cover rounded shadow"
              />
            ))}
          </div>

          <div className="text-center">
            <p className="text-gray-600 text-lg mb-2">
              ⏳ Analyzing your brain activity...
            </p>
            <p className="text-sm text-gray-500">
              This typically takes 20-30 seconds. Please stay relaxed.
            </p>
          </div>
        </>
      )}
    </div>
  );
}