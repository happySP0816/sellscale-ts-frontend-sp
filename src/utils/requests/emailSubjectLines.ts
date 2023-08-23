import { MsgResponse } from "src";
import { processResponse } from "./utils";
import { API_URL } from "@constants/data";

/**
 * Creates an email subject line template
 * @param userToken
 * @param archetypeID
 * @param subjectLine
 * @returns - MsgResponse
 */
export async function createEmailSubjectLineTemplate(userToken: string, archetypID: number, subjectLine: string): Promise<MsgResponse> {

  const response = await fetch(
    `${API_URL}/email_sequence/subject_line`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        subject_line: subjectLine,
        archetype_id: archetypID,
      })
    }
  );
  return await processResponse(response, 'data');

}


/**
 * Gets email subject line templates
 * @param userToken
 * @param archetypeIDS
 * @param activeOnly
 * @returns - MsgResponse
 */
export async function getEmailSubjectLineTemplates(userToken: string, archetypeIDS: number[], activeOnly: boolean): Promise<MsgResponse> {
  const archetype_ids_string = archetypeIDS.join(',');

  const response = await fetch(
    `${API_URL}/email_sequence/subject_line?archetype_ids=${archetype_ids_string}&active_only=${activeOnly}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${userToken}`,
      }
    }
  );
  return await processResponse(response);

}


/**
 * Modifies an email subject line template
 * @param userToken 
 * @param emailSubjectLineID
 * @param subjectLine
 * @returns - MsgResponse
 */
export async function patchEmailSubjectLineTemplate(userToken: string, emailSubjectLineID: number, subjectLine: string): Promise<MsgResponse> {

  const response = await fetch(
    `${API_URL}/email_sequence/subject_line`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email_subject_line_template_id: emailSubjectLineID,
        subject_line: subjectLine,
      })
    }
  );
  return await processResponse(response);

}


/**
 * Deactivates an email subject line template
 * @param userToken 
 * @param emailSubjectLineID
 * @returns - MsgResponse
 */
export async function postEmailSubjectLineTemplateDeactivate(userToken: string, emailSubjectLineID: number): Promise<MsgResponse> {

  const response = await fetch(
    `${API_URL}/email_sequence/subject_line/deactivate`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email_subject_line_template_id: emailSubjectLineID,
      })
    }
  );
  return await processResponse(response);

}


/**
 * Activates an email subject line template
 * @param userToken
 * @param emailSubjectLineID
 * @returns - MsgResponse
 */
export async function postEmailSubjectLineTemplateActivate(userToken: string, emailSubjectLineID: number): Promise<MsgResponse> {
  
    const response = await fetch(
      `${API_URL}/email_sequence/subject_line/activate`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email_subject_line_template_id: emailSubjectLineID,
        })
      }
    );
    return await processResponse(response);
  
  }
  