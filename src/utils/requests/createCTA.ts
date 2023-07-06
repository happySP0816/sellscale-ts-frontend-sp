import { logout } from "@auth/core";
import { API_URL } from "@constants/data";
import { showNotification } from "@mantine/notifications";
import { MsgResponse } from "src";
import { processResponse } from "./utils";

export default async function createCTA(userToken: string, personaId: string, cta: string, expirationDate?: Date): Promise<MsgResponse> {
  const response = await fetch(
    `${API_URL}/message_generation/create_cta`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        archetype_id: personaId,
        text_value: cta,
        expiration_date: expirationDate?.toISOString(),
      }),
    }
  );
  if (response.status === 401) {
    logout();
    return { status: 'error', title: `Not Authorized`, message: 'Please login again.' };
  }
  if (response.status !== 200) {
    showNotification({
      id: "cta-create-not-okay",
      title: "Error",
      message: `Responded with: ${response.status}, ${response.statusText}`,
      color: "red",
      autoClose: false,
    });
    return { status: 'error', title: `Error`, message: `Responded with: ${response.status}, ${response.statusText}` };
  }
  const res = await response.json().catch((error) => {
    console.error(error);
    showNotification({
      id: "cta-create-error",
      title: "Error",
      message: `Error: ${error}`,
      color: "red",
      autoClose: false,
    });
  });
  if (res == null) {
    return { status: 'error', title: `Error`, message: `See logs for details` };
  } else {
    return { status: 'success', title: `Success`, message: `CTA have been created`, data: res.cta_id };
  }
}


export async function updateCTA(
  userToken: string,
  cta_id: number,
  text_value: string,
  expirationDate?: Date
): Promise<MsgResponse> {
  const response = await fetch(
    `${API_URL}/message_generation/cta`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        "cta_id": cta_id,
        "text_value": text_value,
        expiration_date: expirationDate?.toISOString(),
      }),
    }
  );
  return await processResponse(response);
}


export async function deleteCTA(
  userToken: string,
  cta_id: number,
): Promise<MsgResponse> {
  const response = await fetch(
    `${API_URL}/message_generation/cta`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        "cta_id": cta_id,
      }),
    }
  );
  return await processResponse(response);
}
