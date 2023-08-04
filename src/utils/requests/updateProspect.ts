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
  email?: string,
  in_icp_sample?: boolean,
  icp_fit_score_override?: number,
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
        in_icp_sample: in_icp_sample,
        icp_fit_score_override: icp_fit_score_override,
      })
    }
  );

  return await processResponse(response);

}
