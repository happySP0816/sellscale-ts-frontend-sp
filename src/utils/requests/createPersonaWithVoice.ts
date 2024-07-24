import { logout } from "@auth/core";
import { showNotification } from "@mantine/notifications";
import { MsgResponse } from "src";
import { API_URL } from "@constants/data";

export default async function createPersonaWithVoice(
  userToken: string,
  name: string,
  voice_id: number,
  with_cta: boolean,
  with_voice: boolean,
  with_follow_up: boolean,
  context: string,
): Promise<MsgResponse> {
  const response = await fetch(`${API_URL}/client/archetype_from_voice`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${userToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      archetype: name,
      disable_ai_after_prospect_engaged: true,
      voice_id: voice_id,
      with_cta: with_cta,
      with_voice: with_voice,
      with_follow_up: with_follow_up,
      context: context,
    }),
  });
  if (response.status === 401) {
    logout();
    return {
      status: "error",
      title: `Not Authorized`,
      message: "Please login again.",
    };
  }
  if (response.status !== 200) {
    showNotification({
      id: "persona-create-not-okay",
      title: "Error",
      message: `Responded with: ${response.status}, ${response.statusText}`,
      color: "red",
      autoClose: false,
    });
    return {
      status: "error",
      title: `Error`,
      message: `Responded with: ${response.status}, ${response.statusText}`,
    };
  }
  const res = await response.json().catch((error) => {
    console.error(error);
    showNotification({
      id: "persona-create-error",
      title: "Error",
      message: `Error: ${error}`,
      color: "red",
      autoClose: false,
    });
  });
  if (!res) {
    return { status: "error", title: `Error`, message: `See logs for details` };
  }

  const personaId = res.client_archetype_id;

  return {
    status: "success",
    title: `Success`,
    message: `Persona and CTAs have been created`,
    data: personaId,
  };
}
