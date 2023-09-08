import { API_URL } from "@constants/data";
import { MsgResponse } from "src";
import { processResponse } from "./utils";


export async function createLiConvoSim(
  userToken: string,
  archetype_id: number,
  prospect_id: number,
): Promise<MsgResponse> {
  const response = await fetch(`${API_URL}/simulation/li_convo`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${userToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      archetype_id: archetype_id,
      prospect_id: prospect_id,
    }),
  });
  return await processResponse(response, 'data');
}


export async function getLiConvoSim(
  userToken: string,
  simulation_id?: number,
  prospect_id?: number,
): Promise<MsgResponse> {
  const response = await fetch(`${API_URL}/simulation/li_convo?${simulation_id ? `simulation_id=${simulation_id}` : `prospect_id=${prospect_id}`}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
  });
  return await processResponse(response, 'data');
}


export async function generateInitialMessageForLiConvoSim(
  userToken: string,
  simulation_id: number
): Promise<MsgResponse> {
  const response = await fetch(`${API_URL}/simulation/li_convo/generate_initial_message`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${userToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      simulation_id: simulation_id,
    }),
  });
  return await processResponse(response);
}


export async function generateResponseForLiConvoSim(
  userToken: string,
  simulation_id: number
): Promise<MsgResponse> {
  const response = await fetch(`${API_URL}/simulation/li_convo/generate_response`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${userToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      simulation_id: simulation_id,
    }),
  });
  return await processResponse(response);
}


export async function updateLiConvoSim(
  userToken: string,
  simulation_id: number
): Promise<MsgResponse> {
  const response = await fetch(`${API_URL}/simulation/li_convo/update`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${userToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      simulation_id: simulation_id,
    }),
  });
  return await processResponse(response);
}


export async function sendMessageForLiConvoSim(
  userToken: string,
  simulation_id: number,
  message: string,
): Promise<MsgResponse> {
  const response = await fetch(`${API_URL}/simulation/li_convo/send_message`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${userToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      simulation_id: simulation_id,
      message: message,
    }),
  });
  return await processResponse(response);
}
