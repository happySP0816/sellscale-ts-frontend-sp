import { MsgResponse } from "src";
import { processResponse } from "./utils";
import { API_URL } from "@constants/data";

/**
 * Creates a prospect using a LinkedInLink
 * @param userToken
 * @param archetypeID
 * @param url
 * @returns - MsgResponse
 */
export async function createProspectFromLinkedinLink(userToken: string, archetypeID: number | null, url: string): Promise<MsgResponse> {
  // If archetypeID is undefined, it will default to the user's unassigned_contact archetype
  const effectiveArchetypeID = archetypeID === null ? -1 : archetypeID; // Assuming -1 is the ID for unassigned_contact archetype

  const response = await fetch(
    `${API_URL}/prospect/upload/linkedin_link`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        archetype_id: effectiveArchetypeID,
        url: url,
        live: true,
      })
    }
  );
  
  return await processResponse(response, "data");
}

export async function createManyProspectsFromLinkedinLinks(userToken: string, urls: string[], markAsChampion: boolean): Promise<MsgResponse> {
  // note this function does not take archetype right now.
  const response = await fetch(
    `${API_URL}/prospect/upload/upload_many_links`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        archetype_id: -1,
        mark_as_champion: markAsChampion,
        urls: urls,
        live: false,
      })
    }
  );

  return await processResponse(response);
}

export async function markProspectsAsChampion(userToken: string, prospectIDs: number[], isChampion: boolean): Promise<MsgResponse> {
    const response = await fetch(
      `${API_URL}/prospect/champion/mark_champions`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prospect_ids: prospectIDs,
          is_champion: isChampion
        })
      }
    );

    return await processResponse(response);
  }
