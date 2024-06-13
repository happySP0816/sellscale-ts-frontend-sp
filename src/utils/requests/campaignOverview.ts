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

export const patchTestingVolume = async (
  userToken: string,
  client_archetype_id: number,
  testing_volume: number
) => {
  try {
    const response = await fetch(
      `${API_URL}/client/archetype/${client_archetype_id}/testing_volume`,
      {
        method: "PATCH",
        headers: {
          Authorization: "Bearer " + userToken,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ testing_volume, client_archetype_id }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error patching testing volume", error);
  } finally {
    console.log("Testing volume patch API call completed");
  }
};

export const getSentVolumeDuringPeriod = async (
  userToken: string,
  startDate: Date,
  endDate: Date
): Promise<number> => {
  try {
    const response = await fetch(
      `${API_URL}/client/sent_volume_during_period`,
      {
        method: "POST",
        headers: {
          Authorization: "Bearer " + userToken,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ start_date: startDate.toISOString(), end_date: endDate.toISOString() }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.sent_emails_count;
  } catch (error) {
    console.error("Error fetching sent volume during period", error);
    return 0;
  } finally {
    console.log("Sent volume during period API call completed");
  }
};

export const fetchTotalContacts = async (
  userToken: string,
  client_archetype_id: number
) => {
  try {
    const response = await fetch(
      `${API_URL}/client/total_contacts?client_archetype_id=${client_archetype_id}`,
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
    return data.total_contacts.num_prospects;
  } catch (error) {
    console.error("Error fetching total contacts", error);
  } finally {
    console.log("Total contacts API call completed");
  }
};


export const fetchCampaignContacts = async (
  userToken: string,
  client_archetype_id: number,
  offset: number,
  limit: number,
  text: string,
  include_analytics: boolean
) => {
  try {
    const response = await fetch(
      `${API_URL}/client/campaign_contacts?client_archetype_id=${client_archetype_id}&offset=${offset}&limit=${limit}&text=${encodeURIComponent(text)}&include_analytics=${include_analytics}`,
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

export const fetchCampaignAnalytics = async (
  userToken: string,
  client_archetype_id: number
) => {
  try {
    const response = await fetch(
      `${API_URL}/client/campaign_analytics?client_archetype_id=${client_archetype_id}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
        mode: "cors",
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching campaign analytics", error);
  } finally {
    console.log("Campaign analytics API call completed");
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
