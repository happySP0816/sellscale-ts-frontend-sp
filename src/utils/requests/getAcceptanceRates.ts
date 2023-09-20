import { MsgResponse } from "src";
import { processResponse } from "./utils";
import { API_URL } from "@constants/data";


export async function getAcceptanceRates(userToken: string): Promise<MsgResponse> {

  const response = await fetch(
    `${API_URL}/research/acceptance_rates`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    }
  );
  return await processResponse(response, 'data');
}
