import { MsgResponse } from 'src';
import { processResponse } from './utils';
import { API_URL } from '@constants/data';

/**
 * Generate Feedback for an Email
 * @param userToken
 * @returns - MsgResponse
 */
export async function generateEmailFeedback(
  userToken: string,
  subject: string,
  body: string,
  tracking_data: any
): Promise<MsgResponse> {
  const response = await fetch(`${API_URL}/email_sequence/grade_email`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${userToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      subject: subject,
      body: body,
      tracking_data: tracking_data,
    }),
  });
  return await processResponse(response, 'data');
}
