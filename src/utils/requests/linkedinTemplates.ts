import { MsgResponse } from "src";
import { processResponse } from "./utils";
import { API_URL } from "@constants/data";

export async function getLiTemplates(userToken: string, archetypeId: number): Promise<MsgResponse> {
  const response = await fetch(`${API_URL}/client/archetype/${archetypeId}/li_template`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
  });
  return await processResponse(response, 'data');
}


export async function updateLiTemplate(
  userToken: string,
  archetypeId: number,
  template_id: number,
  message?: string,
  active?: boolean,
  times_used?: number,
  times_accepted?: number,
): Promise<MsgResponse> {
  const response = await fetch(`${API_URL}/client/archetype/${archetypeId}/li_template`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${userToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      template_id,
      message,
      active,
      times_used,
      times_accepted,
    }),
  });

  return await processResponse(response);
}


export async function createLiTemplate(
  userToken: string,
  archetypeId: number,
  message: string,
  sellscale_generated: boolean,
): Promise<MsgResponse> {
  const response = await fetch(`${API_URL}/client/archetype/${archetypeId}/li_template`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${userToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
      sellscale_generated,
    }),
  });

  return await processResponse(response);
}


export async function deleteLiTemplate(
  userToken: string,
  archetypeId: number,
  template_id: number,
): Promise<MsgResponse> {
  const response = await fetch(`${API_URL}/client/archetype/${archetypeId}/li_template`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${userToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      template_id,
    }),
  });

  return await processResponse(response);
}