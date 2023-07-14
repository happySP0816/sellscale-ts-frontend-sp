import { MsgResponse } from "src";
import { processResponse } from "./utils";
import { API_URL } from "@constants/data";

/**
 * Updates a prospect
 * @param userToken 
 * @param prospectId 
 * @returns - MsgResponse
 */
export async function updateProspect(
  userToken: string,
  prospectId: number,
  email?: string
): Promise<MsgResponse> {

  const response = await fetch(
    `${API_URL}/prospect/${prospectId}/update`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
      })
    }
  );

  return await processResponse(response);

}
