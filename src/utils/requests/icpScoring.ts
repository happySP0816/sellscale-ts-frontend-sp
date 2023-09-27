import { Channel, MsgResponse } from "src";
import { processResponse } from "./utils";
import { API_URL } from "@constants/data";

/**
 * Gets the ICP Rule Set
 * @param userToken
 * @param client_archetype_id
 * @returns - MsgResponse
 */
export async function getICPRuleSet(
  userToken: string,
  client_archetype_id: number,
): Promise<MsgResponse> {

  const response = await fetch(
    `${API_URL}/icp_scoring/get_ruleset?client_archetype_id=${client_archetype_id}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    }
  );
  return await processResponse(response);

}


/**
 * Update the ICP Rule Set
 * @param userToken
 * @param contacts
 * @returns - MsgResponse
 */
export async function updateICPRuleSet(
  userToken: string,
  client_archetype_id: number,
  included_individual_title_keywords: string[],
  excluded_individual_title_keywords: string[],
  included_individual_industry_keywords: string[],
  individual_years_of_experience_start: number,
  individual_years_of_experience_end: number,
  included_individual_skills_keywords: string[],
  excluded_individual_skills_keywords: string[],
  included_individual_locations_keywords: string[],
  excluded_individual_locations_keywords: string[],
  included_individual_generalized_keywords: string[],
  excluded_individual_generalized_keywords: string[],
  included_company_name_keywords: string[],
  excluded_company_name_keywords: string[],
  included_company_locations_keywords: string[],
  excluded_company_locations_keywords: string[],
  company_size_start: number,
  company_size_end: number,
  included_company_industries_keywords: string[],
  excluded_company_industries_keywords: string[],
  included_company_generalized_keywords: string[],
  excluded_company_generalized_keywords: string[],
): Promise<MsgResponse> {

  const response = await fetch(
    `${API_URL}/icp_scoring/update_ruleset`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_archetype_id,
        included_individual_title_keywords,
        excluded_individual_title_keywords,
        included_individual_industry_keywords,
        individual_years_of_experience_start,
        individual_years_of_experience_end,
        included_individual_skills_keywords,
        excluded_individual_skills_keywords,
        included_individual_locations_keywords,
        excluded_individual_locations_keywords,
        included_individual_generalized_keywords,
        excluded_individual_generalized_keywords,
        included_company_name_keywords,
        excluded_company_name_keywords,
        included_company_locations_keywords,
        excluded_company_locations_keywords,
        company_size_start,
        company_size_end,
        included_company_industries_keywords,
        excluded_company_industries_keywords,
        included_company_generalized_keywords,
        excluded_company_generalized_keywords,
      })
    }
  );
  return await processResponse(response);

}