import { useState } from "react";
import { API_URL } from "@constants/data";

export const useStrategiesApi = (userToken: string) => {
  const [isLoading, setIsLoading] = useState(false);

  const getAllSubscriptions = async () => {
    setIsLoading(true);
    const response = await fetch(`${API_URL}/strategies/echo`, {
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

  const postCreateStrategy = async (
    name: string,
    description: string,
    clientArchetypeIds: number[],
    startDate: Date,
    endDate: Date,
  ) => {
    setIsLoading(true);
    const response = await fetch(`${API_URL}/strategies/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        name,
        description,
        client_archetype_ids: clientArchetypeIds,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
      }),
    });
    const data = await response.json();
    setIsLoading(false);
    return data;
  };

  const getStrategy = async (strategyId: number) => {
    setIsLoading(true);
    const response = await fetch(`${API_URL}/strategies/${strategyId}`, {
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

  const patchUpdateStrategy = async (
    strategyId: number,
    newTitle: string,
    newDescription: string,
    newArchetypes: number[],
    newStatus: string,
    startDate: Date,
    endDate: Date,
  ) => {
    setIsLoading(true);
    const response = await fetch(`${API_URL}/strategies/${strategyId}/update`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        new_title: newTitle,
        new_description: newDescription,
        new_status: newStatus,
        new_archetypes: newArchetypes,
        start_date: startDate,
        end_date: endDate,
      }),
    });
    const data = await response.json();
    setIsLoading(false);
    return data;
  };

  const postAddArchetypeMapping = async (
    strategyId: number,
    clientArchetypeId: number
  ) => {
    setIsLoading(true);
    const response = await fetch(
      `${API_URL}/strategies/${strategyId}/add_archetype_mapping`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          client_archetype_id: clientArchetypeId,
        }),
      }
    );
    const data = await response.json();
    setIsLoading(false);
    return data;
  };

  const deleteRemoveArchetypeMapping = async (
    strategyId: number,
    clientArchetypeId: number
  ) => {
    setIsLoading(true);
    const response = await fetch(
      `${API_URL}/strategies/${strategyId}/remove_archetype_mapping`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          client_archetype_id: clientArchetypeId,
        }),
      }
    );
    const data = await response.text();
    setIsLoading(false);
    return data;
  };

  const getAllStrategies = async () => {
    setIsLoading(true);
    const response = await fetch(`${API_URL}/strategies/get_all`, {
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

  return {
    isLoading,
    getAllSubscriptions,
    postCreateStrategy,
    getStrategy,
    patchUpdateStrategy,
    postAddArchetypeMapping,
    deleteRemoveArchetypeMapping,
    getAllStrategies,
  };
};
