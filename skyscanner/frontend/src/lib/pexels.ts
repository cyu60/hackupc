// lib/pexels.ts
export const fetchCityImages = async (city: string, pages=9): Promise<string[]> => {
    const PEXELS_API_KEY = "T0PHzhFGnf71JyTlofKzRLFRRQEXVO98Bi40DjVpEE947aKvZpJNLloQ";
  
    const response = await fetch(`https://api.pexels.com/v1/search?query=${city}&per_page=${pages}`, {
      headers: {
        Authorization: PEXELS_API_KEY,
      },
    });
  
    const data = await response.json();
    return data.photos.map((p: any) => p.src.medium);
  };
  