import { logout } from "@auth/core";
import { showNotification } from "@mantine/notifications";
import { MsgResponse } from "src";
import getResponseJSON, { isMsgResponse } from "./utils";
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
  const result = await getResponseJSON("get-demo-feedback", response);
  if(isMsgResponse(result)) { return result; }

  return { status: 'success', title: `Success`, message: `Fetched Demo Feedback`, extra: result.data };
}
