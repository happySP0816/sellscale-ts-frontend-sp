import { logout } from "@auth/core";
import { showNotification } from "@mantine/notifications";
import { MsgResponse } from "src/main";

export default async function createCTA(userToken: string, personaId: string, cta: string): Promise<MsgResponse> {
  const response = await fetch(
    `${process.env.REACT_APP_API_URI}/message_generation/create_cta`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        archetype_id: personaId,
        text_value: cta,
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
    return { status: 'success', title: `Success`, message: `CTA have been created`, extra: res.cta_id };
  }
}
