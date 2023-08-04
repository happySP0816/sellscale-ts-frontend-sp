import { API_URL } from "@constants/data";
import { MsgResponse } from "src";
import { processResponse } from "./utils";

/**
 * Edits a demo feedback
 * @param userToken
 * @param demoFeedbackID
 * @param status
 * @param rating
 * @param feedback
 * @param nextDemoDate
 * @returns - MsgResponse
 */
export default async function patchDemoFeedback(userToken: string, demoFeedbackID: number, status: string, rating: string, feedback: string, nextDemoDate?: Date): Promise<MsgResponse> {
  const response = await fetch(
    `${API_URL}/client/demo_feedback`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        feedback_id: demoFeedbackID,
        status: status,
        rating: rating,
        feedback: feedback,
        next_demo_date: nextDemoDate || null
      }),
    }
  );
  return await processResponse(response);
}
