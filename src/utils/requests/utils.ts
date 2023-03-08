import { logout } from "@auth/core";
import { showNotification } from "@mantine/notifications";
import { MsgResponse } from "src/main";

export default async function getResponseJSON(key: string, response: Response): Promise<MsgResponse | any> {

  if (response.status === 401) {
    logout();
    return { status: 'error', title: `Not Authorized`, message: 'Please login again.' };
  }
  if (response.status !== 200) {
    showNotification({
      id: key+"-not-okay",
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
      id: key+"-error",
      title: "Error",
      message: `Error: ${error}`,
      color: "red",
      autoClose: false,
    });
  });
  if (!res) {
    return { status: 'error', title: `Error`, message: `See logs for details` };
  }

  return res;
}

export function isMsgResponse(value: MsgResponse | any): value is MsgResponse {
  return (value as MsgResponse).status !== undefined;
}