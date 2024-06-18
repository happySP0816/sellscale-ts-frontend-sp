import { MsgResponse } from 'src';
import { processResponse } from './utils';
import { API_URL } from '@constants/data';

/**
 * Generates value props for sequence
 * @param userToken
 * @param company
 * @param sellingTo
 * @param sellingWhat
 * @param num
 * @returns - MsgResponse
 */
export async function generateValueProps(
  userToken: string,
  company: string,
  sellingTo: string,
  sellingWhat: string,
  num: number
): Promise<MsgResponse> {
  const response = await fetch(`${API_URL}/ml/generate_sequence_value_props`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${userToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      company: company,
      selling_to: sellingTo,
      selling_what: sellingWhat,
      num: num,
    }),
  });
  return await processResponse(response, 'data');
}

export async function getTemplateSuggestion(
  userToken: string,
  templateContent: string,
  archetype_id: number
): Promise<any> {
  const response = await fetch(`${API_URL}/ml/template_suggestion`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${userToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      template_content: templateContent,
      archetype_id: archetype_id
    }),
  });
  return response.json();
}

export async function generateDraft(
  userToken: string,
  valueProps: string[],
  archetypeID: number
): Promise<MsgResponse> {
  const response = await fetch(`${API_URL}/ml/generate_sequence_draft`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${userToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      value_props: valueProps,
      archetype_id: archetypeID,
    }),
  });
  return await processResponse(response, 'data');
}

export async function sendToOutreach(
  userToken: string,
  title: string,
  archetype_id: number,
  steps: { subject: string; body: string }[]
): Promise<MsgResponse> {
  const response = await fetch(`${API_URL}/email_generation/add_sequence`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${userToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: title,
      archetype_id: archetype_id,
      data: steps,
    }),
  });
  return await processResponse(response);
}

export async function generateSequence(
  userToken: string,
  client_id: number,
  archetype_id: number,
  sequence_type: string,
  step_num: number,
  additional_prompting: string
): Promise<MsgResponse> {
  const response = await fetch(`${API_URL}/personas/generate_sequence`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${userToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: client_id,
      archetype_id: archetype_id,
      sequence_type: sequence_type,
      step_num: step_num,
      additional_prompting: additional_prompting,
    }),
  });
  return await processResponse(response, 'data');
}

export async function generateSequencePiece(
  userToken: string,
  client_id: number,
  archetype_id: number,
  gen_type: string,
  additional_prompting: string,
  roomGenId: string
): Promise<MsgResponse> {
  const response = await fetch(`${API_URL}/personas/generate_sequence_piece`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${userToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: client_id,
      archetype_id: archetype_id,
      gen_type: gen_type,
      additional_prompting: additional_prompting,
      room_gen_id: roomGenId,
    }),
  });
  return await processResponse(response, 'data');
}

export async function addSequence(
  userToken: string,
  client_id: number,
  archetype_id: number,
  sequence_type: string,
  subject_lines: { text: string; assets: number[] }[],
  steps: { step_num: number; text: string; assets: number[] }[]
): Promise<MsgResponse> {
  const response = await fetch(`${API_URL}/personas/add_sequence`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${userToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: client_id,
      archetype_id: archetype_id,
      sequence_type: sequence_type,
      subject_lines: subject_lines,
      steps: steps,
      override: false,
    }),
  });
  return await processResponse(response, 'data');
}
