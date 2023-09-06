import { MsgResponse } from "src";
import { processResponse } from "./utils";
import { API_URL } from "@constants/data";

/**
 * Generates an initial email message
 * @param userToken
 * @param prospectID
 * @param templateID
 * @param testTemplate
 * @param subjectLineTemplateID
 * @param subjectLineTemplateString
 * @returns - MsgResponse
 */
export async function postGenerateInitialEmail(userToken: string, prospectID: number, templateID: number, testTemplate: string | null, subjectLineTemplateID: number | null, subjectLineTemplateString: string | null): Promise<MsgResponse> {

  const response = await fetch(
    `${API_URL}/message_generation/email/initial_email`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prospect_id: prospectID,
        template_id: templateID,
        test_template: testTemplate,
        subject_line_template_id: subjectLineTemplateID,
        subject_line_template: subjectLineTemplateString
      })
    }
  );
  return await processResponse(response, 'data');

}


/**
 * Generates a follow up email message
 * @param userToken
 * @param prospectID
 * @param threadID
 * @param overrideSequenceID
 * @param overrideTemplate
 * @returns - MsgResponse
 */
 export async function postGenerateFollowupEmail(userToken: string, prospectID: number, threadID: string | null, overrideSequenceID: number | null, overrideTemplate: string | null): Promise<MsgResponse> {

  const response = await fetch(
    `${API_URL}/message_generation/email/followup_email`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prospect_id: prospectID,
        thread_id: threadID,
        override_sequence_id: overrideSequenceID,
        override_template: overrideTemplate
      })
    }
  );
  return await processResponse(response, 'data');

 }