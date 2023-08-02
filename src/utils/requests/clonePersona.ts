import { MsgResponse } from "src";
import { processResponse } from "./utils";
import { API_URL } from "@constants/data";

/**
 * Clones a persona
 * @param userToken
 * @param archetypeID
 * @param bumpFrameworkID
 * @returns - MsgResponse
 */
export async function clonePersona(
  userToken: string,
  personaId: number,
  basicInfo: {
    personaName: string;
    personaFitReason: string;
    personaICPMatchingInstructions: string;
    personaContactObjective: string;
  },
  cloneOptions: {
    ctas: boolean;
    bumpFrameworks: boolean;
    voices: boolean;
    emailBlocks: boolean;
  }
): Promise<MsgResponse> {

  const response = await fetch(
    `${API_URL}/client/archetype/${personaId}/clone`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        persona_name: basicInfo.personaName || '',
        persona_fit_reason: basicInfo.personaFitReason || '',
        persona_icp_matching_instructions: basicInfo.personaICPMatchingInstructions || '',
        persona_contact_objective: basicInfo.personaContactObjective || '',
        option_ctas: cloneOptions.ctas,
        option_bump_frameworks: cloneOptions.bumpFrameworks,
        option_voices: cloneOptions.voices,
        option_email_blocks: cloneOptions.emailBlocks,
      })
    }
  );
  return await processResponse(response, 'data');

}
