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
export async function createProspectFromLinkedinLink(userToken: string, archetypeID: number, url: string): Promise<MsgResponse> {

  const response = await fetch(
    `${API_URL}/prospect/from_link`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        archetype_id: archetypeID,
        url: url,
      })
    }
  );
  return await processResponse(response);

}
