import { API_URL } from '@constants/data';
import { MsgResponse } from 'src';
import { processResponse } from './utils';

/**
 * Submits the demo feedback
 * @param userToken
 * @param prospectID
 * @param status
 * @param rating
 * @param feedback
 * @param nextDemoDate
 * @param aiAdjustments
 * @returns - MsgResponse
 */
export default async function postSubmitDemoFeedback(
  userToken: string,
  prospectID: number,
  status: string,
  rating: string,
  feedback: string,
  nextDemoDate?: Date,
  aiAdjustments?: string
): Promise<MsgResponse> {
  const response = await fetch(`${API_URL}/client/demo_feedback`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${userToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prospect_id: prospectID,
      status: status,
      rating: rating,
      feedback: feedback,
      next_demo_date: nextDemoDate || null,
      ai_adjustments: aiAdjustments || null,
    }),
  });
  return await processResponse(response);
}
