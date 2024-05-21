import { useState } from "react";
import { API_URL } from "@constants/data";

export const useChampionApi = (userToken: string) => {
  const [isLoading, setIsLoading] = useState(false);

  const getChampionChanges = async (searchTerm?: string) => {
    setIsLoading(true);
    const url = new URL(`${API_URL}/prospect/champion/get_champion_changes`);
    if (searchTerm) {
      url.searchParams.append("search", searchTerm);
    }
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
    });
    const data = await response.json();
    setIsLoading(false);
    return data;
  };

  const postRefreshChampionJobData = async () => {
    setIsLoading(true);
    const response = await fetch(
      `${API_URL}/prospect/champion/refresh_job_data`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
      }
    );
    const data = await response.json();
    setIsLoading(false);
    return data;
  };

  const getChampionStats = async () => {
    setIsLoading(true);
    const response = await fetch(`${API_URL}/prospect/champion/get_stats`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
    });
    const data = await response.json();
    setIsLoading(false);
    return data;
  };

  const postMarkChampions = async (
    prospectIds: number[],
    isChampion: boolean
  ) => {
    setIsLoading(true);
    const response = await fetch(
      `${API_URL}/prospect/champion/mark_champions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          prospect_ids: prospectIds,
          is_champion: isChampion,
        }),
      }
    );
    const data = await response.json();
    setIsLoading(false);
    return data;
  };

  return {
    isLoading,
    getChampionChanges,
    postRefreshChampionJobData,
    getChampionStats,
    postMarkChampions,
  };
};
