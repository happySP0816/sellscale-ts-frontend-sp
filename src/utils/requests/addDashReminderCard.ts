import { MsgResponse } from 'src';
import { processResponse } from './utils';
import { API_URL } from '@constants/data';

/**
 * Adds a reminder card to the op dashboard
 * @param userToken
 * @param prospectId
 * @param referred_id - ID of the referred prospect
 * @returns - MsgResponse
 */
export async function addDashReminderCard(
  userToken: string,
  prospectId: number,
  reason: string
): Promise<MsgResponse> {
  const response = await fetch(`${API_URL}/operator_dashboard/rep_intervention_needed`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${userToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prospect_id: prospectId,
      reason: reason,
    }),
  });

  return await processResponse(response);
}
