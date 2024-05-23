// These endpoints return the same data as /campaign-stats but they
//break them down into three separate sections so they can be loaded asynchronously.
import { API_URL } from "@constants/data";

export const fetchCampaignPersonalizers = async (
  userToken: string,
  client_archetype_id: number
) => {
  try {
    const response = await fetch(
      `${API_URL}/ml/researchers/archetype/${client_archetype_id}/questions`,
      {
        headers: {
          Authorization: "Bearer " + userToken,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching campaign personalizers", error);
  } finally {
    console.log("Campaign personalizers API call completed");
  }
};

export const fetchCampaignContacts = async (
  userToken: string,
  client_archetype_id: number,
  offset: number,
  limit: number,
  text: string
) => {
  try {
    const response = await fetch(
      `${API_URL}/client/campaign_contacts?client_archetype_id=${client_archetype_id}&offset=${offset}&limit=${limit}&text=${encodeURIComponent(text)}`,
      {
        headers: {
          Authorization: "Bearer " + userToken,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching campaign contacts", error);
  } finally {
    console.log("Campaign contacts API call completed");
  }
};

export const fetchCampaignSequences = async (
  userToken: string,
  client_archetype_id: number
) => {
  try {
    const response = await fetch(
      `${API_URL}/client/campaign_sequences?client_archetype_id=${client_archetype_id}`,
      {
        headers: {
          Authorization: "Bearer " + userToken,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching campaign sequences", error);
  } finally {
    console.log("Campaign sequences API call completed");
  }
};

export const fetchCampaignStats = async (
  userToken: string,
  client_archetype_id: number
) => {
  try {
    const response = await fetch(
      `${API_URL}/client/campaign_stats?client_archetype_id=${client_archetype_id}`,
      {
        headers: {
          Authorization: "Bearer " + userToken,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching campaign stats", error);
  } finally {
    console.log("Campaign stats API call completed");
  }
};
