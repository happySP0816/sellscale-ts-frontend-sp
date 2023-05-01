import { MsgResponse } from "src";
import getResponseJSON, { isMsgResponse } from "./utils";
import { API_URL } from "@constants/data";

/**
 * Gets / Triggers an ICP Classification Job on a single prospect
 * @param userToken 
 * @param archetypeID
 * @param prospectID
 * @returns - MsgResponse
 */
export async function getICPOneProspect(userToken: string, archetypeID: number, prospectID: number): Promise<MsgResponse> {

  const response = await fetch(
    `${API_URL}/ml/icp_classification/${archetypeID}/prospect/${prospectID}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${userToken}`,
      }
    }
  );
  const result = await getResponseJSON("get-icp-classification-one-prospect", response);
  if(isMsgResponse(result)) { return result; }

  return { status: 'success', title: `Success`, message: `ICP classification retrieved`, extra: {'fit': result.fit, 'reason': result.reason} };

}
