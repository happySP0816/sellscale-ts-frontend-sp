import { logout } from "@auth/core";
import { showNotification } from "@mantine/notifications";
import { MsgResponse } from "src";

export default async function getResponseJSON(key: string, response: Response): Promise<MsgResponse | Record<string, any>> {

  if (response.status === 401) {
    logout();
    return { status: 'error', title: `Not Authorized`, message: 'Please login again.' };
  }
  const res = await response.json().catch((error) => {
    console.error(error);
    showNotification({
      id: key+"-error",
      title: "Error",
      message: `Error: ${error.length > 20 ? 'Issue occurred, please check logs' : error}`,
      color: "red",
      autoClose: false,
    });
  });
  if (!res) {
    return { status: 'error', title: `Error`, message: `See logs for details` };
  }
  if (response.status === 403 && res.message.toLowerCase() === "invalid linkedin cookies") {
    showNotification({
      id: key+"-invalid-li-cookies",
      title: "LinkedIn Disconnected",
      message: `Looks like your LinkedIn account has been disconnected. Please reconnect your LinkedIn account.`,
      color: "red",
      autoClose: false,
    });
    return { status: 'error', title: `LinkedIn Disconnected`, message: `Looks like your LinkedIn account has been disconnected. Please reconnect your LinkedIn account.` };
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

  return res;
}

export function isMsgResponse(value: MsgResponse | any): value is MsgResponse {
  return (value as MsgResponse).status !== undefined;
}