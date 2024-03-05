import { MsgResponse } from 'src';
import { processResponse } from './utils';
import { API_URL } from '@constants/data';

export async function getEmailAccounts(
  userToken: string,
  archetype_id: number
): Promise<MsgResponse> {
  const response = await fetch(
    `${API_URL}/smartlead/archetype_emails?archetype_id=${archetype_id}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    }
  );
  return await processResponse(response, 'data');
}

export async function toggleEmailAccounts(
  userToken: string,
  archetype_id: number,
  email_account_ids: string[],
  active: boolean
): Promise<MsgResponse> {
  const response = await fetch(`${API_URL}/smartlead/toggle_email_accounts`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${userToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      archetype_id,
      email_account_ids,
      active,
    }),
  });
  return await processResponse(response, 'data');
}
