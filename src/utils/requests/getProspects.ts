import { API_URL } from '@constants/data';
import { MsgResponse, Prospect } from 'src';
import { processResponse } from './utils';
import _ from 'lodash';
import { isWithinLastXDays } from '@utils/general';
import { prospectStatuses } from '@common/inbox/utils';

export async function getProspects(
  userToken: string,
  query?: string,
  channel?: string,
  limit?: number,
  status?: string[],
  show_purgatory?: boolean | 'ALL',
  persona_id?: number,
  shallow_data?: boolean,
  prospect_id?: number,
  icp_fit_score?: number
): Promise<MsgResponse> {
  const response = await fetch(`${API_URL}/prospect/get_prospects`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${userToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: query,
      channel: channel,
      limit: limit,
      status: status,
      show_purgatory: show_purgatory,
      persona_id: persona_id,
      shallow_data: shallow_data,
      prospect_id: prospect_id,
    }),
  });

  const result = await processResponse(response, 'prospects');

  return result;
}

export async function getProspectsForICP(
  userToken: string,
  client_archetype_id: number,
  get_sample: boolean,
  invited_on_linkedin: boolean
): Promise<MsgResponse> {
  const response = await fetch(`${API_URL}/prospect/get_prospect_for_icp`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${userToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_archetype_id: client_archetype_id,
      get_sample: get_sample,
      invited_on_linkedin: invited_on_linkedin,
    }),
  });

  const result = await processResponse(response, 'data');

  return result;
}

export async function getProspectsForInboxRestructure(userToken: string): Promise<MsgResponse> {
  const response = await fetch(`${API_URL}/prospect/inbox_restructure_prospects`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
  });

  return await processResponse(response, 'data');
}

export async function getProspectBucketsForInbox(userToken: string): Promise<MsgResponse> {
  const response = await fetch(`${API_URL}/sight_inbox/details`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
  });

  return await processResponse(response, 'data');
}
