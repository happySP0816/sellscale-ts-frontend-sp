import { API_URL } from "@constants/data";
import { MsgResponse, Prospect } from "src";
import { processResponse } from "./utils";

export async function getProspectsForIncomePipeline(userToken: string): Promise<MsgResponse> {

  const response = await fetch(
    `${API_URL}/prospect/income_pipeline`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    }
  );

  return await processResponse(response, 'data');

}

