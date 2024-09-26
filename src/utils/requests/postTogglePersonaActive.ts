import { API_URL } from "@constants/data";
import { MsgResponse } from "src";
import { processResponse } from "./utils";
import { showNotification } from "@mantine/notifications";

/**
 * Toggles the snapshot trigger
 * @param userToken
 * @param archetypeID
 * @param type
 * @param active
 * @returns - MsgResponse
 */
export default async function postTogglePersonaActive(userToken: string, archetypeID: number, type: string, active: boolean): Promise<MsgResponse> {

  if (type != "linkedin" && type != "email") {
    showNotification({
      title: "Error",
      message: "Invalid type",
    })
    return {} as MsgResponse;
  }

  try {
    const response = await fetch(
      `${API_URL}/client/archetype/${archetypeID}/${type}/active`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          active: active
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      showNotification({
        title: "Error",
        message: errorData.message || "An error occurred",
        color: "red",
      });
      return {} as MsgResponse;
    }

    return await processResponse(response);
  } catch (error) {
    const errorMessage = (error instanceof Error ? error.message : "An error occurred");
    if (!errorMessage.includes("Unexpected token '<'")) {
      showNotification({
        title: "Error",
        message: errorMessage,
        color: "red",
      });
    }
    return {} as MsgResponse;
  }
}
