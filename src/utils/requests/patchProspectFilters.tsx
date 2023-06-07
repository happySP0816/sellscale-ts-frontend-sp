import { MsgResponse } from "src";
import { processResponse } from "./utils";
import { API_URL } from "@constants/data";

/**
 * Modifies a persona filter on an Archetype
 * @param userToken 
 * @param archetypeID
 * @returns - MsgResponse
 */
export async function patchProspectFilters(
  userToken: string,
  archetypeID: number,
  currentCompanyNamesInclusion: string[],
  currentCompanyNamesExclusion: string[],
  pastCompanyNamesInclusion: string[],
  pastCompanyNamesExclusion: string[],
  currentJobTitleInclusion: string[],
  currentJobTitleExclusion: string[],
  pastJobTitleInclusion: string[],
  pastJobTitleExclusion: string[],
  currentJobFunctionInclusion: string[],
  currentJobFunctionExclusion: string[],
  seniorityInclusion: string[],
  seniorityExclusion: string[],
  geographyInclusion: string[],
  geographyExclusion: string[],
  industryInclusion: string[],
  industryExclusion: string[],
  yearsInCurrentCompany: string[],
  yearsInCurrentPosition: string[],
  yearsOfExperience: string[],
  annualRevenue: string[],
  headcount: string[],
  headquarterLocationInclusion: string[],
  headquarterLocationExclusion: string[],
  accountIndustryInclusion: string[],
  accountIndustryExclusion: string[],
): Promise<MsgResponse> {

  const response = await fetch(
    `${API_URL}/client/archetype/${archetypeID}/prospect_filter`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        current_company_names_inclusion: currentCompanyNamesInclusion,
        current_company_names_exclusion: currentCompanyNamesExclusion,
        past_company_names_inclusion: pastCompanyNamesInclusion,
        past_company_names_exclusion: pastCompanyNamesExclusion,
        current_job_title_inclusion: currentJobTitleInclusion,
        current_job_title_exclusion: currentJobTitleExclusion,
        past_job_title_inclusion: pastJobTitleInclusion,
        past_job_title_exclusion: pastJobTitleExclusion,
        current_job_function_inclusion: currentJobFunctionInclusion,
        current_job_function_exclusion: currentJobFunctionExclusion,
        seniority_inclusion: seniorityInclusion,
        seniority_exclusion: seniorityExclusion,
        geography_inclusion: geographyInclusion,
        geography_exclusion: geographyExclusion,
        industry_inclusion: industryInclusion,
        industry_exclusion: industryExclusion,
        years_in_current_company: yearsInCurrentCompany,
        years_in_current_position: yearsInCurrentPosition,
        years_of_experience: yearsOfExperience,
        annual_revenue: annualRevenue,
        headcount: headcount,
        headquarter_location_inclusion: headquarterLocationInclusion,
        headquarter_location_exclusion: headquarterLocationExclusion,
        account_industry_inclusion: accountIndustryInclusion,
        account_industry_exclusion: accountIndustryExclusion,
      })
    }
  );

  return await processResponse(response, 'data');

}
