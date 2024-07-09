import { useState } from "react";
import { API_URL } from "@constants/data";

export const useTrackApi = (userToken: string) => {
  const [isLoading, setIsLoading] = useState(false);

  const getScript = async () => {
    setIsLoading(true);
    const url = new URL(`${API_URL}/track/get_script`);
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

  const verifySource = async () => {
    setIsLoading(true);
    const url = new URL(`${API_URL}/track/verify_source`);
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
    });
    const data = await response.text();
    setIsLoading(false);
    return data;
  };

  const getMostRecentTrackEvent = async () => {
    setIsLoading(true);
    const url = new URL(`${API_URL}/track/most_recent_track_event`);
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

  const getTrackSourceMetadata = async () => {
    setIsLoading(true);
    const url = new URL(`${API_URL}/track/track_source_metadata`);
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

  const getTrackEventHistory = async (dateRange: number) => {
    setIsLoading(true);
    const url = new URL(
      `${API_URL}/track/get_track_event_history?days=${dateRange}`
    );
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

  const getDeanonomizedContacts = async (days: number = 14) => {
    setIsLoading(true);
    const url = new URL(
      `${API_URL}/track/get_deanonomized_contacts?days=${days}`
    );
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
    });
    const data = await response.json();
    setIsLoading(false);
    return data.contacts;
  };

  return {
    isLoading,
    getTrackSourceMetadata,
    getScript,
    verifySource,
    getMostRecentTrackEvent,
    getTrackEventHistory,
    getDeanonomizedContacts,
  };
};
