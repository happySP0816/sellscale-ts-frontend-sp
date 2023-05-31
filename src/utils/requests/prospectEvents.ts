import { MsgResponse } from "src";
import { processResponse } from "./utils";
import { API_URL } from "@constants/data";


export async function getProspectEvents(userToken: string, prospectId?: number): Promise<MsgResponse> {

  const response = await fetch(
    `${API_URL}/client/sdr/find_events${prospectId ? `?prospect_id=${prospectId}` : ''}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    }
  );
  return await processResponse(response, 'data');
}
