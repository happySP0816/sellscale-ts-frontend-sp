import { API_URL } from "@constants/data";
import { showNotification } from "@mantine/notifications";
import { MsgResponse } from "src";
import { processResponse } from "./utils";

/**
 * Edits a Stack Ranked Configuration (Voice) name
 * @param userToken
 * @param configID
 * @param name
 * @returns - MsgResponse
 */
export default async function postEditStackRankedConfigurationName(userToken: string, configID: number, name: string): Promise<MsgResponse> {
  const response = await fetch(
    `${API_URL}/message_generation/edit_stack_ranked_configuration/name`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        configuration_id: configID,
        name: name,
      }),
    }
  );
  return await processResponse(response, 'data');
}
