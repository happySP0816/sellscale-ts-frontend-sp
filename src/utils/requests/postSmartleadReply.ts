import { API_URL } from '@constants/data';
import { MsgResponse } from 'src';
import { processResponse } from './utils';

/**
 * Replies to a prospect using smartlead
 * @param userToken
 * @param prospectID
 * @param emailBody
 * @returns - MsgResponse
 */
export default async function postSmartleadReply(
  userToken: string,
  prospectID: number,
  emailBody: string,
  scheduledSendDate?: Date,
  cc_emails?: string[]
): Promise<MsgResponse> {
  const response = await fetch(`${API_URL}/smartlead/prospect/conversation`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${userToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prospect_id: prospectID,
      email_body: emailBody,
      scheduled_send_date: scheduledSendDate,
      cc_emails: cc_emails,
    }),
  });
  return await processResponse(response);
}
