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

export async function updateSyncCRM(
  userToken: string,
  sync_type?: string,
  status_mapping?: Record<string, any>,
  event_handlers?: Record<string, any>
): Promise<MsgResponse> {
  const response = await fetch(`${API_URL}/merge_crm/update_crm_sync`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${userToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sync_type,
      status_mapping,
      event_handlers,
    }),
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
