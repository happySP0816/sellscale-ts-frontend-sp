import { logout } from "@auth/core";
import { showNotification } from "@mantine/notifications";
import { MsgResponse } from "src";
import { processResponse } from "./utils";
import { API_URL } from "@constants/data";

export default async function getLiProfile(userToken: string): Promise<MsgResponse> {
  const response = await fetch(
    `${API_URL}/voyager/profile/self`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    }
  );
  return processResponse(response, 'data');
}
