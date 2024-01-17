import { MsgResponse } from 'src';
import { processResponse } from './utils';
import { API_URL } from '@constants/data';

export async function sendEmail(
  userToken: string,
  prospectId: number,
  subject: string,
  body: string,
  aiGenerated: boolean,
  reply_to_message_id?: string,
  is_multichannel_action?: boolean,
  bcc?: string[],
  cc?: string[]
): Promise<MsgResponse> {
  const response = await fetch(`${API_URL}/prospect/${prospectId}/email`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${userToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      subject,
      body,
      ai_generated: aiGenerated,
      reply_to_message_id: reply_to_message_id,
      is_multichannel_action: is_multichannel_action,
      bcc,
      cc,
    }),
  });
  return await processResponse(response, 'data');
}

export async function sendGenericEmail(
  userToken: string,
  from: string,
  to: string[],
  bcc: string[],
  subject: string,
  body: string
): Promise<MsgResponse> {
  const response = await fetch(`${API_URL}/client/send_generic_email`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${userToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from_email: from,
      to_emails: to,
      bcc_emails: bcc,
      subject: subject,
      body: body,
    }),
  });
  return await processResponse(response, 'data');
}
