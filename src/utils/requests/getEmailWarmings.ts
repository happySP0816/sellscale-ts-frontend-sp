import { logout } from "@auth/core";
import { showNotification } from "@mantine/notifications";
import { MsgResponse } from "src";
import { processResponse } from "./utils";
import { API_URL } from "@constants/data";

export default async function getEmailWarmings(userToken: string): Promise<MsgResponse> {
  const response = await fetch(`${API_URL}/smart_email/email_warmings`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
  });
  return await processResponse(response, 'data');
}
