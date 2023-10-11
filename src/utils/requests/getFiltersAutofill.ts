import { MsgResponse } from "src";
import { processResponse } from "./utils";
import { API_URL } from "@constants/data";

/**
 * Gets bump frameworks
 * @param userToken 
 * @param clientArchetypeID
 * @returns - MsgResponse
 */
export async function getFiltersAutofill(
  userToken: string,
  clientArchetypeID: number
): Promise<MsgResponse> {
  const response = await fetch(
    `${API_URL}/client/sdr/icp_filters/autofill?archetype_id=${clientArchetypeID}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    }
  );
  return await processResponse(response, "data");
}
