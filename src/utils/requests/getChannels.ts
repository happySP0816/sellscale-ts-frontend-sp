
import { logout } from "@auth/core";
import { showNotification } from "@mantine/notifications";
import { MsgResponse } from "src/main";

export default async function getChannels(userToken: string): Promise<MsgResponse> {

  const response = await fetch(
    `${process.env.REACT_APP_API_URI}/client/sdr/get_available_outbound_channels`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    }
  );
  if (response.status === 401) {
    logout();
    return { status: 'error', title: `Not Authorized`, message: 'Please login again.' };
  }
  if (response.status !== 200) {
    showNotification({
      id: "channels-get-not-okay",
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
      id: "channels-get-error",
      title: "Error",
      message: `Error: ${error}`,
      color: "red",
      autoClose: false,
    });
  });
  if (!res) {
    return { status: 'error', title: `Error`, message: `See logs for details` };
  }

  return { status: 'success', title: `Success`, message: `Gathered available outbound channels`, extra: res.available_outbound_channels };

}

// TODO: Make it return MsgResponse
export async function getChannelOptions(prospectId: number, userToken: string) {
  const response = await fetch(
    `${process.env.REACT_APP_API_URI}/prospect/get_valid_channel_types?prospect_id=${prospectId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    }
  );
  const res = await response.json();
  return res.choices;
}

export async function getChannelStatusOptions(prospectId: number, userToken: string, channelType: string) {
  const response = await fetch(
    `${process.env.REACT_APP_API_URI}/prospect/${prospectId}/get_valid_next_statuses?channel_type=${channelType}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    }
  );
  if (response.status === 401) {
    logout();
    return { status: 'error', title: `Not Authorized`, message: 'Please login again.' };
  }
  if (response.status !== 200) {
    showNotification({
      id: "channels-get-not-okay",
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
      id: "channels-get-error",
      title: "Error",
      message: `Error: ${error}`,
      color: "red",
      autoClose: false,
    });
  });
  if (!res) {
    return { status: 'error', title: `Error`, message: `See logs for details` };
  }

  return { status: 'success', title: `Success`, message: `Gathered next statuses for prospect`, extra: res };
}
