import { logout } from "@auth/core";
import { showNotification } from "@mantine/notifications";
import { MsgResponse } from "src/main";
import getResponseJSON, { isMsgResponse } from "./utils";

export default async function getLiProfile(userToken: string): Promise<MsgResponse> {
  const response = await fetch(
    `${process.env.REACT_APP_API_URI}/voyager/profile/self`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    }
  );
  const result = await getResponseJSON("get-li-profile-self", response);
  if(isMsgResponse(result)) { return result; }

  return { status: 'success', title: `Success`, message: `Fetched LinkedIn Profile`, extra: result.data };
}
