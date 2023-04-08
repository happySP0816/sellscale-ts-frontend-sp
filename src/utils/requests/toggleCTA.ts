import { logout } from "@auth/core";
import { API_URL } from "@constants/data";
import { showNotification } from "@mantine/notifications";
import { MsgResponse } from "src";

export default async function toggleCTA(userToken: string, cta_id: number): Promise<MsgResponse> {
  const response = await fetch(
    `${API_URL}/message_generation/toggle_cta_active`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        cta_id: cta_id,
      }),
    }
  );
  if (response.status === 401) {
    logout();
    return { status: 'error', title: `Not Authorized`, message: 'Please login again.' };
  }
  if (response.status !== 200) {
    showNotification({
      id: "cta-toggle-not-okay",
      title: "Error",
      message: `Responded with: ${response.status}, ${response.statusText}`,
      color: "red",
      autoClose: false,
    });
    return { status: 'error', title: `Error`, message: `Responded with: ${response.status}, ${response.statusText}` };
  }
  return { status: 'success', title: `Success`, message: `CTA has been toggled` };
}
