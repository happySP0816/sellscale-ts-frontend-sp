import { MsgResponse } from "src";
import { API_URL } from "@constants/data";

export async function getResearchers(userToken: string): Promise<MsgResponse> {
  const response = await fetch(`${API_URL}/ml/researchers`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
  });
  return response.json();
}

export async function createResearcher(
  userToken: string,
  name: string
): Promise<MsgResponse> {
  const response = await fetch(`${API_URL}/ml/researchers/create`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${userToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name }),
  });
  return response.json();
}

export async function getAiResearchers(
  userToken: string
): Promise<MsgResponse> {
  const response = await fetch(`${API_URL}/ml/researchers`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
  });
  return response.json();
}

export async function getArchetypeQuestions(
  userToken: string,
  id: number
): Promise<MsgResponse> {
  const response = await fetch(
    `${API_URL}/ml/researchers/archetype/${id}/questions`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    }
  );
  return response.json();
}

export async function getResearcherQuestions(
  userToken: string,
  researcherNumber: number
): Promise<MsgResponse> {
  const response = await fetch(
    `${API_URL}/ml/researchers/${researcherNumber}/questions`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    }
  );
  return response.json();
}

export async function createResearcherQuestion(
  userToken: string,
  type: string,
  key: string,
  relevancy: string,
  researcherId: number
): Promise<MsgResponse> {
  const response = await fetch(`${API_URL}/ml/researchers/questions/create`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${userToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      type,
      key,
      relevancy,
      researcher_id: researcherId,
    }),
  });
  return response.json();
}

export async function updateResearcherQuestion(
  userToken: string,
  questionNumber: number,
  key: string,
  relevancy: string,
  type: string
): Promise<MsgResponse> {
  const response = await fetch(
    `${API_URL}/ml/researchers/questions/${questionNumber}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        key,
        type,
        relevancy,
      }),
    }
  );
  return response.json();
}

export async function deleteResearcherQuestion(
  userToken: string,
  questionNumber: number
): Promise<MsgResponse> {
  const response = await fetch(
    `${API_URL}/ml/researchers/questions/${questionNumber}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    }
  );
  return response.json();
}

export async function createResearcherAnswer(
  userToken: string,
  prospectId: Number,
  room_id: String
): Promise<any> {
  const response = await fetch(`${API_URL}/ml/researchers/answers/create`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${userToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prospect_id: prospectId, room_id: room_id }),
  });
  return response;
}

export async function getPersonalization(
  userToken: string,
  prospectId: number,
  emailBody: string
): Promise<any> {
  const response = await fetch(`${API_URL}/ml/researcher/email-personalize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${userToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prospect_id: prospectId, email_body: emailBody }),
  });

  return response.json();
}

export async function getResearcherAnswers(
  userToken: string,
  prospectId: number
): Promise<any> {
  const response = await fetch(`${API_URL}/ml/researchers/answers`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${userToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prospect_id: prospectId }),
  });

  return response.json();
}

export async function aiGenerateResearchPoints(
  userToken: string,
  researcherId: number,
  campaignId: number
): Promise<any> {
  try {
    const response = await fetch(
      `${API_URL}/ml/researchers/questions/generate`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          researcher_id: researcherId,
          campaign_id: campaignId,
        }),
      }
    );
    return response.json();
  } catch (error) {
    console.error("Error generating research points:", error);
  }
}
export async function connectResearcher(
  userToken: string,
  clientArchetypeId: number,
  researcherId: number
): Promise<MsgResponse> {
  const response = await fetch(`${API_URL}/ml/researcher/connect`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${userToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_archetype_id: clientArchetypeId,
      researcher_id: researcherId,
    }),
  });
  return response.json();
}
