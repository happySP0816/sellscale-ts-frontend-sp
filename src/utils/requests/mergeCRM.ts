import { MsgResponse } from 'src';
import { processResponse } from './utils';
import { API_URL } from '@constants/data';

export async function getSyncCRM(userToken: string): Promise<MsgResponse> {
  const response = await fetch(`${API_URL}/merge_crm/crm_sync`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
  });
  return await processResponse(response, 'data');
}


export async function getOperationAvailableCRM(
  userToken: string,
  operation: string
): Promise<MsgResponse> {
  const response = await fetch(
    `${API_URL}/merge_crm/crm_operation_available?operation=${operation}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    }
  );
  return await processResponse(response, 'data');
}
