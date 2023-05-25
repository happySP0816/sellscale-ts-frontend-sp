import { API_URL } from "@constants/data";
import { MsgResponse } from "src";
import { processResponse } from "./utils";

export async function getAutoBumpMessage(userToken: string, prospect_id: number): Promise<MsgResponse> {

  const response = await fetch(
    `${API_URL}/message_generation/auto_bump?prospect_id=${prospect_id}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    }
  );
  return await processResponse(response, 'data', false);

}


export async function deleteAutoBumpMessage(userToken: string, prospect_id: number): Promise<MsgResponse> {

  const response = await fetch(
    `${API_URL}/message_generation/auto_bump`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        "prospect_id": prospect_id,
      }),
    }
  );
  return await processResponse(response, '', false);

}
