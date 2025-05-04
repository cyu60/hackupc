import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchCityImages } from "@/lib/pexels";
import { useCitySession } from "@/context/CitySessionContext"; // ✅ import context

export default function EEGCitySession() {
  const { city } = useParams<{ city: string }>();
  const navigate = useNavigate();
  const { cities } = useCitySession(); // ✅ get global city list

  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!city) return;
      setLoading(true);
      const imgs = await fetchCityImages(city);
      setImages(imgs);
      setLoading(false);
    };
    load();
  }, [city]);

  const handleScore = (score: number) => {
    console.log(`🧠 Scored ${score} for ${city}`);

    // ✅ Find next city
    const index = cities.findIndex(c => c.toLowerCase() === city?.toLowerCase());
    const nextCity = cities[index + 1];

    if (nextCity) {
      navigate(`/eeg-session/${encodeURIComponent(nextCity.toLowerCase())}`);
    } else {
      navigate("/results"); // or /vote or any final page
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center justify-center">
      <h2 className="text-2xl font-bold mb-4 text-center">🧠 EEG Session: {city}</h2>

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

          <p className="mb-2 text-gray-600">Rate this destination (1-10):</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(score => (
              <button
                key={score}
                onClick={() => handleScore(score)}
                className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
              >
                {score}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
