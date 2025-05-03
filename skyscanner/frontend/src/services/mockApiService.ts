
import { City } from "../types";

// A list of cities with their vibes
const cities: City[] = [
  {
    name: "Kyoto",
    vibe: "tranquil, ancient, spiritual, zen, traditional",
    images: Array(9).fill("https://source.unsplash.com/random/300x300/?kyoto")
  },
  {
    name: "New York City",
    vibe: "fast-paced, vibrant, bustling, energetic, modern",
    images: Array(9).fill("https://source.unsplash.com/random/300x300/?new-york")
  },
  {
    name: "Paris",
    vibe: "romantic, artistic, elegant, historical, cultural",
    images: Array(9).fill("https://source.unsplash.com/random/300x300/?paris")
  },
  {
    name: "Santorini",
    vibe: "serene, stunning, peaceful, picturesque, idyllic",
    images: Array(9).fill("https://source.unsplash.com/random/300x300/?santorini")
  },
  {
    name: "Tokyo",
    vibe: "futuristic, innovative, dynamic, bustling, technologically advanced",
    images: Array(9).fill("https://source.unsplash.com/random/300x300/?tokyo")
  },
  {
    name: "Marrakech",
    vibe: "exotic, colorful, vibrant, historical, aromatic",
    images: Array(9).fill("https://source.unsplash.com/random/300x300/?marrakech")
  },
  {
    name: "Rio de Janeiro",
    vibe: "lively, rhythmic, tropical, festive, vibrant",
    images: Array(9).fill("https://source.unsplash.com/random/300x300/?rio")
  },
  {
    name: "Amsterdam",
    vibe: "laid-back, whimsical, artistic, liberal, charming",
    images: Array(9).fill("https://source.unsplash.com/random/300x300/?amsterdam")
  },
  {
    name: "Reykjavik",
    vibe: "otherworldly, mystical, natural, remote, peaceful",
    images: Array(9).fill("https://source.unsplash.com/random/300x300/?reykjavik")
  },
  {
    name: "Barcelona",
    vibe: "artistic, vibrant, whimsical, architectural, festive",
    images: Array(9).fill("https://source.unsplash.com/random/300x300/?barcelona")
  },
  {
    name: "Venice",
    vibe: "romantic, dreamlike, enchanting, timeless, serene",
    images: Array(9).fill("https://source.unsplash.com/random/300x300/?venice")
  },
  {
    name: "Sydney",
    vibe: "cosmopolitan, sunny, outdoorsy, modern, relaxed",
    images: Array(9).fill("https://source.unsplash.com/random/300x300/?sydney")
  },
  {
    name: "Prague",
    vibe: "fairy-tale, medieval, charming, atmospheric, historic",
    images: Array(9).fill("https://source.unsplash.com/random/300x300/?prague")
  },
  {
    name: "Cape Town",
    vibe: "scenic, diverse, vibrant, adventurous, natural",
    images: Array(9).fill("https://source.unsplash.com/random/300x300/?cape-town")
  },
  {
    name: "Havana",
    vibe: "nostalgic, colorful, musical, vintage, lively",
    images: Array(9).fill("https://source.unsplash.com/random/300x300/?havana")
  },
  {
    name: "Istanbul",
    vibe: "diverse, historical, mystical, bustling, transcontinental",
    images: Array(9).fill("https://source.unsplash.com/random/300x300/?istanbul")
  },
  {
    name: "San Francisco",
    vibe: "eclectic, foggy, hilly, progressive, tech-forward",
    images: Array(9).fill("https://source.unsplash.com/random/300x300/?san-francisco")
  },
  {
    name: "Stockholm",
    vibe: "clean, design-focused, efficient, stylish, water-centric",
    images: Array(9).fill("https://source.unsplash.com/random/300x300/?stockholm")
  },
  {
    name: "Bangkok",
    vibe: "chaotic, flavorful, vibrant, tropical, bustling",
    images: Array(9).fill("https://source.unsplash.com/random/300x300/?bangkok")
  },
  {
    name: "Dubai",
    vibe: "futuristic, luxurious, grand, ambitious, desert",
    images: Array(9).fill("https://source.unsplash.com/random/300x300/?dubai")
  }
];

class MockApiService {
  async getCityBySeedWord(seedWord: string): Promise<City> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Get a random city for now, but in a real implementation this would match the seedWord
    const randomIndex = Math.floor(Math.random() * cities.length);
    return cities[randomIndex];
  }
  
  async getSimilarCity(currentCity: City): Promise<City> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // In a real implementation, this would find a city with a similar vibe
    // For now, just return a different random city
    let randomIndex;
    let attempts = 0;
    
    do {
      randomIndex = Math.floor(Math.random() * cities.length);
      attempts++;
    } while (cities[randomIndex].name === currentCity.name && attempts < 10);
    
    return cities[randomIndex];
  }
  
  async getDifferentCity(currentCity: City): Promise<City> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // In a real implementation, this would find a city with a different vibe
    // For now, just return a different random city
    let randomIndex;
    let attempts = 0;
    
    do {
      randomIndex = Math.floor(Math.random() * cities.length);
      attempts++;
    } while (cities[randomIndex].name === currentCity.name && attempts < 10);
    
    return cities[randomIndex];
  }
  
  async selectFinalCity(city: City): Promise<boolean> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simulate a successful API call
    console.log("Final city selected:", city.name);
    return true;
  }
}

export const mockApiService = new MockApiService();
