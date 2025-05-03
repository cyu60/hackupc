
import { City, EEGMessage, Friend, GroupVote } from "../types";

const API_URL = "http://localhost:5000";

export const apiService = {
  /**
   * Fetches a city based on a seed word.
   * @param seedWord - A word describing a location, vibe, etc.
   * @returns {Promise<City>} - A promise that resolves to a City object:
   * {
   *   name: string,
   *   images: string[],
   *   vibe: string,
   *   liked?: boolean
   * }
   */
  async getCityBySeedWord(seedWord: string): Promise<City> {
    const response = await fetch(`${API_URL}/city?seed=${encodeURIComponent(seedWord)}`);
    if (!response.ok) {
      throw new Error(`Failed to get city: ${response.statusText}`);
    }
    return await response.json();
  },
  
  /**
   * Fetches a city with a similar vibe to the current city.
   * @param currentCity - The current city object to find similarities to.
   * @returns {Promise<City>} - A promise that resolves to a similar City object:
   * {
   *   name: string,
   *   images: string[],
   *   vibe: string,
   *   liked?: boolean
   * }
   */
  async getSimilarCity(currentCity: City): Promise<City> {
    const response = await fetch(`${API_URL}/city/similar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ city: currentCity })
    });
    if (!response.ok) {
      throw new Error(`Failed to get similar city: ${response.statusText}`);
    }
    return await response.json();
  },
  
  /**
   * Fetches a city with a different vibe from the current city.
   * @param currentCity - The current city object to find differences from.
   * @returns {Promise<City>} - A promise that resolves to a different City object:
   * {
   *   name: string,
   *   images: string[],
   *   vibe: string,
   *   liked?: boolean
   * }
   */
  async getDifferentCity(currentCity: City): Promise<City> {
    const response = await fetch(`${API_URL}/city/different`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ city: currentCity })
    });
    if (!response.ok) {
      throw new Error(`Failed to get different city: ${response.statusText}`);
    }
    return await response.json();
  },
  
  /**
   * Submits the final city selection to the backend.
   * @param city - The selected city object.
   * @returns {Promise<boolean>} - A promise that resolves to a boolean indicating success.
   */
  async selectFinalCity(city: City): Promise<boolean> {
    const response = await fetch(`${API_URL}/city/select`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ city })
    });
    if (!response.ok) {
      throw new Error(`Failed to select city: ${response.statusText}`);
    }
    return await response.json();
  },
  
  /**
   * Fetches a list of friends and their city preferences.
   * @returns {Promise<Friend[]>} - A promise that resolves to an array of Friend objects:
   * {
   *   id: string,
   *   name: string,
   *   avatar: string,
   *   topCity: City,
   *   hasVoted: boolean,
   *   vote?: string
   * }
   */
  async getFriends(): Promise<Friend[]> {
    const response = await fetch(`${API_URL}/friends`);
    if (!response.ok) {
      throw new Error(`Failed to get friends: ${response.statusText}`);
    }
    return await response.json();
  },
  
  /**
   * Submits a vote for a specific city by a user.
   * @param userId - The ID of the user voting.
   * @param cityName - The name of the city being voted for.
   * @returns {Promise<boolean>} - A promise that resolves to a boolean indicating success.
   */
  async submitVote(userId: string, cityName: string): Promise<boolean> {
    const response = await fetch(`${API_URL}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, cityName })
    });
    if (!response.ok) {
      throw new Error(`Failed to submit vote: ${response.statusText}`);
    }
    return await response.json();
  },
  
  /**
   * Fetches the current group voting results.
   * @returns {Promise<GroupVote[]>} - A promise that resolves to an array of GroupVote objects:
   * {
   *   cityName: string,
   *   votes: number,
   *   voters: string[],
   *   images: string[],
   *   vibe: string
   * }
   */
  async getGroupVotes(): Promise<GroupVote[]> {
    const response = await fetch(`${API_URL}/votes`);
    if (!response.ok) {
      throw new Error(`Failed to get group votes: ${response.statusText}`);
    }
    return await response.json();
  }
};

