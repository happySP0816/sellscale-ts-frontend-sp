import { Channel, MsgResponse } from 'src';
import { processResponse } from './utils';
import { API_URL } from '@constants/data';

/**
 * Gets the ICP Rule Set
 * @param userToken
 * @param client_archetype_id
 * @returns - MsgResponse
 */
export async function getICPRuleSet(
  userToken: string,
  client_archetype_id: number
): Promise<MsgResponse> {
  const response = await fetch(
    `${API_URL}/icp_scoring/get_ruleset?client_archetype_id=${client_archetype_id}`,
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
  included_individual_education_keywords: string[],
  excluded_individual_education_keywords: string[]
): Promise<MsgResponse> {
  const response = await fetch(`${API_URL}/icp_scoring/update_ruleset`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${userToken}`,
      'Content-Type': 'application/json',
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
      included_individual_education_keywords,
      excluded_individual_education_keywords,
    }),
  });
  return await processResponse(response);
}

/**
 * Runs the ICP Scoring
 * @param userToken
 * @param client_archetype_id
 * @param prospects
 * @returns - MsgResponse
 */
export async function runScoringICP(
  userToken: string,
  client_archetype_id: number,
  prospects?: number[]
): Promise<MsgResponse> {
  const response = await fetch(`${API_URL}/icp_scoring/run_on_prospects`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${userToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_archetype_id: client_archetype_id,
      prospect_ids: prospects ?? null,
    }),
  });
  return await processResponse(response);
}

/**
 *
 * @param userToken
 * @param client_archetype_id
 * @param message
 * @returns - MsgResponse
 */
export async function generateNewICPFilters(
  userToken: string,
  client_archetype_id: number,
  message: string
): Promise<MsgResponse> {
  const response = await fetch(`${API_URL}/icp_scoring/generate_new_icp_filters`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${userToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_archetype_id: client_archetype_id,
      message: message,
    }),
  });
  return await processResponse(response, 'data');
}

/**
 *
 * @param userToken
 * @param client_archetype_id
 * @param filters
 * @returns - MsgResponse
 */
export async function updateICPFilters(
  userToken: string,
  client_archetype_id: number,
  filters: any
): Promise<MsgResponse> {
  const response = await fetch(`${API_URL}/icp_scoring/update_icp_filters`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${userToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_archetype_id: client_archetype_id,
      filters: filters,
    }),
  });
  return await processResponse(response, 'data');
}

/**
 *
 * @param userToken
 * @param client_archetype_id
 * @param filters
 * @returns - MsgResponse
 */
export async function updateICPFiltersBySalesNavURL(
  userToken: string,
  client_archetype_id: number,
  sales_nav_url: string
): Promise<MsgResponse> {
  const response = await fetch(`${API_URL}/icp_scoring/update_icp_filters_from_sales_nav_url`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${userToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_archetype_id: client_archetype_id,
      sales_nav_url: sales_nav_url,
    }),
  });
  return await processResponse(response, 'data');
}
