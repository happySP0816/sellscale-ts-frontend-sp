import { logout } from "@auth/core";
import { API_URL } from "@constants/data";
import { showNotification } from "@mantine/notifications";
import { MsgResponse } from "src";

export default async function getResponseJSON(key: string, response: Response): Promise<MsgResponse | Record<string, any>> {

  if (response.status === 401) {
    logout();
    return { status: 'error', title: `Not Authorized`, message: 'Please login again.' };
  }

  let errMsg = '';
  const res = await response.json().catch((error) => {
    errMsg = error;
  });
  if (!res) {
    errMsg = 'Unknown error';
  }
  if (response.status === 403 && res && res.message.toLowerCase() === "invalid linkedin cookies") {
    showNotification({
      id: key+"-invalid-li-cookies",
      title: "LinkedIn Disconnected",
      message: `Looks like your LinkedIn account has been disconnected. Please reconnect your LinkedIn account.`,
      color: "red",
      autoClose: false,
    });
    return { status: 'error', title: `LinkedIn Disconnected`, message: `Looks like your LinkedIn account has been disconnected. Please reconnect your LinkedIn account.` };
  }

  if (!(response.status+'').startsWith('2')) {
    errMsg = `Responded with: ${response.status}, ${response.statusText} \n Res: ${JSON.stringify(res)}`;
  }

  if (errMsg) {
    showNotification({
      id: key+"-error",
      title: "Error",
      message: `An error occurred, our engineers have been notified. Please try again later.`,
      color: "red",
      autoClose: false,
    });

    const userToken = localStorage.getItem("user-token");
    if(userToken){
      await fetch(
        `${API_URL}/client/submit-error`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            "error": errMsg,
            "user_agent": navigator.userAgent.toLowerCase()
          }),
        }
      );
    }

  }

  return res;
}

export function isMsgResponse(value: MsgResponse | any): value is MsgResponse {
  return (value as MsgResponse).status !== undefined;
}