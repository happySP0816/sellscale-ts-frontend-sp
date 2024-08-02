import { logout } from "@auth/core";
import { showNotification } from "@mantine/notifications";
import { MsgResponse } from "src";
import createCTA from "./createCTA";
import { API_URL } from "@constants/data";
import { ex } from "@fullcalendar/core/internal-common";

export default async function createPersona(
  userToken: string,
  name: string,
  ctas: string[],
  extras: {
    fitReason: string;
    icpMatchingPrompt: string;
    contactObjective: string;
    contractSize: number;
    template_mode: boolean;
    linkedinChecked?: boolean;
    emailChecked?: boolean;
    connectionType?: string;
    purpose?: string;
  },
  autoGenerationPayload?: {
    emailSequenceState?: {
      howItWorks: boolean;
      varyIntroMessages: boolean;
      breakupMessage: boolean;
      uniqueOffer: boolean;
      conferenceOutreach: boolean;
      cityChat: boolean;
      formerWorkAlum: boolean;
      feedbackBased: boolean;
    };
    linkedinSequenceState?: {
      howItWorks: boolean;
      varyIntroMessages: boolean;
      breakupMessage: boolean;
      uniqueOffer: boolean;
      conferenceOutreach: boolean;
      cityChat: boolean;
      formerWorkAlum: boolean;
      feedbackBased: boolean;
    };
  }
): Promise<MsgResponse> {
  const response = await fetch(`${API_URL}/client/archetype`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${userToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      archetype: name,
      disable_ai_after_prospect_engaged: true,
      description: "",
      fit_reason: extras.fitReason,
      icp_matching_prompt: extras.icpMatchingPrompt,
      contact_objective: extras.contactObjective,
      contract_size: extras.contractSize,
      template_mode: extras.template_mode,
      linkedin_active: extras.linkedinChecked,
      email_active: extras.emailChecked,
      email_to_linkedin_connection: extras.connectionType,
      purpose: extras.purpose,
      auto_generation_payload: autoGenerationPayload,
    }),
  });
  if (response.status === 401) {
    logout();
    return {
      status: "error",
      title: `Not Authorized`,
      message: "Please login again.",
    };
  }
  if (response.status !== 200) {
    showNotification({
      id: "persona-create-not-okay",
      title: "Error",
      message: `Responded with: ${response.status}, ${response.statusText}`,
      color: "red",
      autoClose: false,
    });
    return {
      status: "error",
      title: `Error`,
      message: `Responded with: ${response.status}, ${response.statusText}`,
    };
  }
  const res = await response.json().catch((error) => {
    console.error(error);
    showNotification({
      id: "persona-create-error",
      title: "Error",
      message: `Error: ${error}`,
      color: "red",
      autoClose: false,
    });
  });
  if (!res) {
    return { status: "error", title: `Error`, message: `See logs for details` };
  }

  const personaId = res.client_archetype_id;
  for (const cta of ctas) {
    const result = await createCTA(userToken, personaId, cta);
    if (result.status === "error") return result;
  }

  return {
    status: "success",
    title: `Success`,
    message: `Persona and CTAs have been created`,
    data: personaId,
  };
}
