// pages/FinalDestination.tsx
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { fetchCityImages } from "@/lib/pexels";
import { Button } from "@/components/ui/button";

const FinalDestination = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const finalCity = location.state?.city;

  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadImages = async () => {
      if (!finalCity) return;
      try {
        const result = await fetchCityImages(finalCity);
        setImages(result);
      } catch (e) {
        console.error("Error fetching images:", e);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    loadImages();
  }, [finalCity]);

  if (!finalCity) {
    return (
      <div className="text-center mt-20">
        <p className="text-lg text-red-600">No final city selected.</p>
        <Button onClick={() => navigate("/")}>Go Home</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-10 px-4">
      <h1 className="text-4xl font-bold text-center text-indigo-900 mb-8">
        🌍 Your Final Destination: {finalCity}
      </h1>

      {loading ? (
        <div className="text-center text-gray-500">Loading images...</div>
      ) : error ? (
        <div className="text-center text-red-500">Failed to load images.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((url, index) => (
            <img
              key={index}
              src={url}
              alt={`${finalCity} view ${index}`}
              className="rounded-lg w-full h-64 object-cover"
            />
          ))}
        </div>
      )}

      <div className="mt-10 text-center">
        <Button variant="outline" onClick={() => navigate("/")}>
          ← Back to Start
        </Button>
      </div>
    </div>
  );
};

export default FinalDestination;