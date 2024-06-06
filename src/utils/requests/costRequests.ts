import { MsgResponse } from 'src';
import { processResponse } from './utils';
import { API_URL } from '@constants/data';

/**
 * Get spending for a client
 * @param userToken
 * @param clientId
 * @returns - MsgResponse
 */
export async function getClientSpending(userToken: string, clientId: number): Promise<MsgResponse> {
  const response = await fetch(`${API_URL}/client/get_spending/${clientId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
  });
  return await processResponse(response, 'data');
}

/**
 * Get list of clients
 * @param userToken
 * @returns - MsgResponse
 */
export async function getClientsList(userToken: string): Promise<MsgResponse> {
  const response = await fetch(`${API_URL}/client/clients_list`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
  });
  return await processResponse(response, 'data');
}

