import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import CityCollage from "@/components/CityCollage";
import { City } from "@/types";

const fetchPexelsImages = async (city: string): Promise<string[]> => {
  const response = await fetch(`https://api.pexels.com/v1/search?query=${city}&per_page=9`, {
    headers: {
      Authorization:"T0PHzhFGnf71JyTlofKzRLFRRQEXVO98Bi40DjVpEE947aKvZpJNLloQ"
    },
  });

  const data = await response.json();
  return data.photos.map((p: any) => p.src.medium);
};

export default function ImagesPage() {
  const { city } = useParams<{ city: string }>();
  const [images, setImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadImages = async () => {
      if (!city) return;
      setIsLoading(true);
      try {
        const imgs = await fetchPexelsImages(city);
        setImages(imgs);
      } catch (err) {
        console.error("Failed to fetch Pexels images:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadImages();
  }, [city]);

  const cityData: City | null = city
    ? {
        name: city,
        vibe: "A beautiful place to explore together.",
        images,
      }
    : null;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <CityCollage city={cityData} isLoading={isLoading} />
    </div>
  );
}
