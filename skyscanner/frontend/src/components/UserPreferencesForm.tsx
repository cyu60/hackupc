import React, { useState } from "react";

type Preferences = {
  name: string;
  city: string;
  budget: number;
  tags: string[];
};

type Props = {
  onSubmit: (data: Preferences) => void;
};

const TAG_CATEGORIES: { title: string; emoji: string; tags: string[] }[] = [
  {
    title: "Nature & Outdoors",
    emoji: "🌲",
    tags: ["Mountains", "Hiking", "National Parks", "Lakes", "Wildlife", "Stargazing", "Forests", "Camping"],
  },
  {
    title: "Relaxation & Wellness",
    emoji: "💆",
    tags: ["Beach", "Spa", "Hot Springs", "Yoga Retreat", "Meditation", "Scenic Views"],
  },
  {
    title: "Culture & Arts",
    emoji: "🎨",
    tags: ["Museums", "Architecture", "History", "Traditions", "Photography", "Theater"],
  },
  {
    title: "City Life & Night",
    emoji: "🌃",
    tags: ["Nightlife", "Rooftop Views", "Shopping", "Luxury", "Street Food", "Bars"],
  },
  {
    title: "Food & Drink",
    emoji: "🍽️",
    tags: ["Fine Dining", "Coffee Culture", "Wine Tasting", "Local Cuisine", "Food Markets", "Cooking Classes"],
  },
  {
    title: "Events & Fun",
    emoji: "🎉",
    tags: ["Concerts", "Theme Parks", "Trivia Nights", "Street Performers", "Sports Games", "Escape Rooms"],
  },
  {
    title: "Adventure & Action",
    emoji: "⚡",
    tags: ["Surfing", "Skiing", "Paragliding", "Zipline", "Caving", "Road Trip"],
  },
];

export default function UserPreferencesForm({ onSubmit }: Props) {
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [budget, setBudget] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState("");

  const handleTagToggle = (tag: string) => {
    setTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleAddCustomTag = () => {
    const trimmed = customTag.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags(prev => [...prev, trimmed]);
    }
    setCustomTag("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !city || !budget || tags.length === 0) {
      alert("Please fill out all fields.");
      return;
    }
    onSubmit({ name, city, budget: Number(budget), tags });
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow space-y-6">
      <h2 className="text-2xl font-bold text-center">🧳 Travel Preferences</h2>

      <div className="space-y-4">
        <input
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <input
          type="text"
          placeholder="City (from)"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <input
          type="number"
          placeholder="Budget (€)"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>

      <div className="space-y-6">
        {TAG_CATEGORIES.map(({ title, emoji, tags: categoryTags }) => (
          <div key={title}>
            <p className="font-semibold mb-2 text-lg">{emoji} {title}</p>
            <div className="flex flex-wrap gap-2">
              {categoryTags.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleTagToggle(tag)}
                  className={`px-3 py-1 rounded-full border text-sm ${
                    tags.includes(tag) ? "bg-skyscannerDark text-white" : "bg-skyscannerDark text-white"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Custom tag input */}
        <div>
          <p className="font-semibold mb-2"> Add Your Own</p>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. Festivals, Chess Cafes..."
              value={customTag}
              onChange={(e) => setCustomTag(e.target.value)}
              className="flex-1 p-2 border rounded"
            />
            <button
              type="button"
              onClick={handleAddCustomTag}
              className="bg-skyscannerBlue text-white px-4 py-2 rounded hover:bg-skyscannerDark"
            >
              Add
            </button>
          </div>
          {/* Show added custom tags */}
          {tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {tags.map(tag => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-blue-100 border rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <button type="submit" className="w-full bg-skyscannerBlue text-white p-2 rounded hover:bg-skyscannerDark text-lg">
        🚀 Submit Preferences
      </button>
    </form>
  );
}
