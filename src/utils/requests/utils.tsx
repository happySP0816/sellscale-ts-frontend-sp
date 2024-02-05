import { logout } from "@auth/core";
import { API_URL } from "@constants/data";
import { hideNotification, showNotification } from "@mantine/notifications";
import { hashString } from "@utils/general";
import { MsgResponse } from "src";
import { ActionIcon, Button, Group, Text } from "@mantine/core";
import { IconPlugConnected } from "@tabler/icons";

/**
 * A helper function to process the response from the server.
 * @param response - The response object
 * @param resultProperty - A specific property to return from the response JSON, default is the whole JSON
 * @returns - A MsgResponse object
 */
export async function processResponse(
  response: Response,
  resultProperty = "",
  showNotif = true
): Promise<MsgResponse> {
  // First stage of processing the response & we get a unqiue key from the response URL
  const result = await getResponseJSON(
    `response--${hashString(response.url, 9999999999)}`,
    response,
    showNotif
  );
  // If the response is a MsgResponse, we know it's an error and can just return it
  if (isMsgResponse(result)) {
    return result;
  }

  return {
    status: "success",
    title: `Success`,
    message: result.message ? result.message : `Success`,
    data: resultProperty ? result[resultProperty] : result,
  };
}

/**
 * A helper function to handle errors from the various responses we might get from the server.
 * @param key - A unique key to identify the response, used for the notification ID
 * @param response - The response object
 * @returns - Will return a MsgResponse object if the response is an error, otherwise will return the JSON object
 */
async function getResponseJSON(
  key: string,
  response: Response,
  showNotif: boolean
): Promise<MsgResponse | Record<string, any>> {
  if (response.status === 401) {
    logout();
    return {
      status: "error",
      title: `Not Authorized`,
      message: "Please login again.",
    };
  }

  let errMsg = "";
  let res = null;
  try {
    res = await response.json();
  } catch (e) {
    errMsg = "Failed to parse response as JSON";

    if ((response.status + "").startsWith("2")) {
      return {
        status: "success",
        title: `Success`,
        message: "Success",
        data: {},
      };
    }
  }

  if (!res) {
    errMsg = "Unknown error";
  }
  if (
    response.status === 403 &&
    res &&
    res.message.toLowerCase() === "invalid linkedin cookies"
  ) {
    // if (showNotif) {
    //   hideNotification("inactive-linkedin");
    //   showNotification({
    //     id: "inactive-linkedin",
    //     title: (
    //       <Group>
    //         <Text fz='md'>LinkedIn Disconnected</Text>
    //         <Button leftIcon={<IconPlugConnected size='0.9rem' />} variant="light" color="red" size="xs" radius="xl" compact
    //           onClick={() => {
    //             window.location.href = "/settings/linkedin";
    //           }}
    //         >Go to Reconnect</Button>
    //       </Group>
    //     ),
    //     message: `Looks like your LinkedIn account has been disconnected. Please reconnect.`,
    //     color: "red",
    //     autoClose: false,
    //   });
    // }
    return {
      status: "error",
      title: `LinkedIn Disconnected`,
      message: `Looks like your LinkedIn account has been disconnected. Please reconnect.`,
    };
  }

  if (!(response.status + "").startsWith("2")) {
    errMsg = `Responded with: ${response.status}, ${
      response.statusText
    } \n Res: ${JSON.stringify(res)}`;
  }

  if (errMsg) {
    // if(showNotif){
    //   showNotification({
    //     id: key+"-error",
    //     title: "Error",
    //     message: `An error occurred, our engineers have been notified. Please try again later.`,
    //     color: "red",
    //     autoClose: false,
    //   });
    // }

    const userToken = localStorage.getItem("user-token");
    if (userToken && showNotif) {
      fetch(`${API_URL}/client/submit-error`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          error: errMsg,
          user_agent: navigator.userAgent.toLowerCase(),
        }),
      });
    }

    return { status: "error", title: `Error`, message: errMsg };
  }

  if (!res) {
    return { status: "error", title: `Error`, message: errMsg };
  }

  return res;
}

/**
 * A helper function to check if a variable is a MsgResponse object
 * @param value - The variable to check
 * @returns - If it's a MsgResponse object
 */
export function isMsgResponse(value: MsgResponse | any): value is MsgResponse {
  return (
    (value as MsgResponse).status !== undefined &&
    (value as MsgResponse).title !== undefined &&
    (value as MsgResponse).message !== undefined
  );
}

/**
 * Helper function that, given a string, returns a Mantine color from the options:
 * - gray, red, pink, grape, violet, indigo, blue, teal, green, lime, yellow, orange
 */
export function deterministicMantineColor(str: string): string {
  const colors = [
    "gray",
    "red",
    "pink",
    "grape",
    "violet",
    "indigo",
    "blue",
    "teal",
    "green",
    "lime",
    "yellow",
    "orange",
  ];
  return colors[Math.abs(hashString(str, colors.length))];
}