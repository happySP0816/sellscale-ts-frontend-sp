

import { Channel, MsgResponse } from "src";
import { processResponse } from "./utils";
import { API_URL } from "@constants/data";

/**
 * 
 * @param userToken 
 * @param generated_message_type
 * @param instruction
 * @param client_archetype_id
 * @returns - MsgResponse
 */
export async function createVoiceBuilderOnboarding(userToken: string, generated_message_type: Channel, instruction: string, client_archetype_id: number): Promise<MsgResponse> {

  const response = await fetch(
    `${API_URL}/voice_builder/create_onboarding`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        generated_message_type,
        instruction,
        client_archetype_id
      }),
    }
  );
  return await processResponse(response);

}


export async function updateOnboardingInstructions(userToken: string, voice_builder_onboarding_id: number, instruction: string): Promise<MsgResponse> {

  const response = await fetch(
    `${API_URL}/voice_builder/update_instruction`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        voice_builder_onboarding_id,
        instruction,
      }),
    }
  );
  return await processResponse(response);

}


export async function generateSamples(userToken: string, voice_builder_onboarding_id: number, amount: number): Promise<MsgResponse> {

  const response = await fetch(
    `${API_URL}/voice_builder/create_samples`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        voice_builder_onboarding_id,
        n: amount,
      }),
    }
  );
  return await processResponse(response, 'data');

}


export async function updateSample(userToken: string, voice_builder_sample_id: number, updated_text: string): Promise<MsgResponse> {

  const response = await fetch(
    `${API_URL}/voice_builder/edit_sample`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        voice_builder_sample_id,
        updated_text,
      }),
    }
  );
  return await processResponse(response);

}


export async function deleteSample(userToken: string, voice_builder_sample_id: number): Promise<MsgResponse> {

  const response = await fetch(
    `${API_URL}/voice_builder/delete_sample`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        voice_builder_sample_id,
      }),
    }
  );
  return await processResponse(response);

}


export async function getVoiceBuilderDetails(userToken: string, voice_builder_onboarding_id: number): Promise<MsgResponse> {
  
  const response = await fetch(
    `${API_URL}/voice_builder/get_details?voice_builder_onboarding_id=${voice_builder_onboarding_id}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    }
  );
  return await processResponse(response);

}


export async function createVoice(userToken: string, voice_builder_onboarding_id: number): Promise<MsgResponse> {
  
  const response = await fetch(
    `${API_URL}/voice_builder/convert_to_pattern`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        voice_builder_onboarding_id,
      }),
    }
  );
  return await processResponse(response);

}


export async function getVoiceOnboardings(userToken: string, client_archetype_id: number): Promise<MsgResponse> {
  
  const response = await fetch(
    `${API_URL}/voice_builder/onboardings?client_archetype_id=${client_archetype_id}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    }
  );
  return await processResponse(response, 'data');

}
