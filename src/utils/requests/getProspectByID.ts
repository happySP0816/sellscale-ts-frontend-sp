import { MsgResponse } from "src";
import getResponseJSON, { isMsgResponse } from "./utils";
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
  const result = await getResponseJSON("get-prospect-by-id", response);
  if(isMsgResponse(result)) { return result; }

  return { status: 'success', title: `Success`, message: `Prospect retrieved`, extra: result.prospect_info.details };

}
