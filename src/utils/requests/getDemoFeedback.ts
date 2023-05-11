import { logout } from "@auth/core";
import { showNotification } from "@mantine/notifications";
import { MsgResponse } from "src";
import { processResponse } from "./utils";
import { API_URL } from "@constants/data";

export default async function getDemoFeedback(userToken: string): Promise<MsgResponse> {
  const response = await fetch(
    `${API_URL}/client/demo_feedback`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    }
  );
  return processResponse(response, 'data');
}
