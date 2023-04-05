import { MsgResponse } from "src/main";
import getResponseJSON, { isMsgResponse } from "./utils";

/**
 * Get a conversation with a prospect
 * @param userToken
 * @param prospectId
 * @returns - MsgResponse
 */
export async function getConversation(
  userToken: string,
  prospectId: number
): Promise<MsgResponse> {
  const response = await fetch(
    `${process.env.REACT_APP_API_URI}/voyager/conversation?prospect_id=${prospectId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    }
  );
  const result = await getResponseJSON("get-linkedin-convo", response);
  if (isMsgResponse(result)) {
    return result;
  }

  return {
    status: "success",
    title: `Success`,
    message: `Sent message`,
    extra: result.data,
  };
}
