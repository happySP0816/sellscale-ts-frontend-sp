import { MsgResponse } from "src";
import { processResponse } from "./utils";
import { API_URL } from "@constants/data";

/**
 * Gets prospect by ID
 * @param userToken 
 * @param prospectID
 * @returns - MsgResponse
 */
export async function getProspectByID(userToken: string, prospectID: number): Promise<MsgResponse> {

  const response = await fetch(
    `${API_URL}/prospect/${prospectID}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${userToken}`,
      }
    }
  );
  return processResponse(response, 'prospect_info');

}
