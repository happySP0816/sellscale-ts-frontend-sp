import { MsgResponse } from 'src';
import { processResponse } from './utils';
import { API_URL } from '@constants/data';

/**
 * Creates an email sequence step
 * @param userToken
 * @param archetypeID
 * @param overallStatus
 * @param title
 * @param template
 * @param bumpedCount
 * @param setDefault
 * @param substatus
 * @returns - MsgResponse
 */
export async function createEmailSequenceStep(
  userToken: string,
  archetypID: number,
  overallStatus: string,
  title: string,
  template: string,
  bumpedCount: number | null,
  setDefault: boolean,
  substatus: string | null = ''
): Promise<MsgResponse> {
  if (!substatus) {
    substatus = '';
  }

  const response = await fetch(`${API_URL}/email_sequence/step`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${userToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      archetype_id: archetypID,
      overall_status: overallStatus,
      title: title,
      template: template,
      default: setDefault,
      bumped_count: bumpedCount,
      substatus: substatus,
    }),
  });
  return await processResponse(response, 'sequence_step_id');
}

/**
 * Gets email sequence steps
 * @param userToken
 * @param overallStatuses
 * @param substatuses
 * @param archetype_ids
 * @returns - MsgResponse
 */
export async function getEmailSequenceSteps(
  userToken: string,
  overallStatuses: string[],
  substatuses: string[],
  archetype_ids: number[]
): Promise<MsgResponse> {
  const overall_statuses_string = overallStatuses.join(',');
  const substatuses_string = substatuses.join(',');
  const archetype_ids_string = archetype_ids.join(',');

  const response = await fetch(
    `${API_URL}/email_sequence/step?overall_statuses=${overall_statuses_string}&substatuses=${substatuses_string}&archetype_ids=${archetype_ids_string}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    }
  );
  return await processResponse(response);
}

/**
 * Modifies an email sequence step
 * @param userToken
 * @param sequenceStepID
 * @param overallStatus
 * @param title
 * @param template
 * @param bumpedCount
 * @param setDefault
 * @param delayDays
 * @param transformerBlocklist
 * @returns - MsgResponse
 */
export async function patchSequenceStep(
  userToken: string,
  sequenceStepID: number,
  overallStatus: string,
  title: string,
  template: string,
  bumpedCount: number | null,
  setDefault: boolean,
  delayDays?: number | null,
  transformerBlocklist?: string[] | null
): Promise<MsgResponse> {
  const response = await fetch(`${API_URL}/email_sequence/step`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${userToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sequence_step_id: sequenceStepID,
      overall_status: overallStatus,
      title: title,
      template: template,
      default: setDefault,
      sequence_delay_days: delayDays,
      bumped_count: bumpedCount,
      transformer_blocklist: transformerBlocklist,
    }),
  });
  return await processResponse(response);
}

/**
 * Deactivates all Email Sequence Steps that belong to the same group as the provided SequenceStep
 * @param userToken
 * @param sequenceStepID
 * @returns - MsgResponse
 */
export async function postDeactivateAllSequenceSteps(
  userToken: string,
  sequenceStepID: number
): Promise<MsgResponse> {
  const response = await fetch(`${API_URL}/email_sequence/step/deactivate/all`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${userToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sequence_step_id: sequenceStepID,
    }),
  });
  return await processResponse(response);
}

/**
 * Deactivates an Email Sequence Step
 * @param userToken
 * @param sequenceStepID
 * @returns - MsgResponse
 */
export async function postSequenceStepDeactivate(
  userToken: string,
  sequenceStepID: number
): Promise<MsgResponse> {
  const response = await fetch(`${API_URL}/email_sequence/step/deactivate`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${userToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sequence_step_id: sequenceStepID,
    }),
  });
  return await processResponse(response);
}


/**
 * Activates an Email Sequence Step
 * @param userToken
 * @param sequenceStepID
 * @returns - MsgResponse
 */
export async function postSequenceStepActivate(
  userToken: string,
  sequenceStepID: number
): Promise<MsgResponse> {
  const response = await fetch(`${API_URL}/email_sequence/step/activate`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${userToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sequence_step_id: sequenceStepID,
    }),
  });
  return await processResponse(response);
}