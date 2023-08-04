import { API_URL } from "@constants/data";
import { MsgResponse, Prospect } from "src";
import { processResponse } from "./utils";

export async function getProspectsForICP(userToken: string,
  persona_id: number,
): Promise<MsgResponse> {

  const response = await fetch(
    `${API_URL}/prospect/icp_fit?archetype_id=${persona_id}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    }
  );

  return await processResponse(response, 'data');

}

