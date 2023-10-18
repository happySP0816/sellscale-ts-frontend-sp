import { MsgResponse } from "src";
import { processResponse } from "./utils";
import { API_URL } from "@constants/data";

export default async function getIndividuals(userToken: string, archetypeId: number, limit: number, offset: number): Promise<MsgResponse> {
  const response = await fetch(`${API_URL}/individual/?archetype_id=${archetypeId}&limit=${limit}&offset=${offset}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
  });
  return await processResponse(response, 'data');
}
