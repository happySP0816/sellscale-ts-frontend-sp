import {
  CompanyFilters,
  ICPScoringRuleset,
  IndividualFilters,
  ProspectAccounts,
  ViewMode
} from "@modals/ContactAccountFilterModal";
import {Prospect} from "../../../index";
import {set, sum} from "lodash";
import ItemCollapse from "@common/persona/ICPFilter/Filters/ItemCollapse";
import CustomSelect from "@common/persona/ICPFilter/CustomSelect";
import {Box, Button, Flex, NumberInput, Title} from "@mantine/core";
import React, {useState} from "react";

interface MarketMapFiltersProps {
  prospects: Prospect[],
  prospectAccounts: ProspectAccounts[],
  viewMode: ViewMode,
  icp_scoring_ruleset: ICPScoringRuleset,
}

const MarketMapFilters = function (
  {
    icp_scoring_ruleset,
    prospects,
    prospectAccounts,
    viewMode
  }: MarketMapFiltersProps
) {
  const [
    included_individual_title_keywords,
    setIncludedIndividualTitleKeywords,
  ] = useState<string[]>(icp_scoring_ruleset.included_individual_title_keywords ?? []);
  const [
    excluded_individual_title_keywords,
    setExcludedIndividualTitleKeywords,
  ] = useState<string[]>(icp_scoring_ruleset.excluded_individual_title_keywords ?? []);
  const [
    included_individual_seniority_keywords,
    setIncludedIndividualSeniorityKeywords,
  ] = useState<string[]>(icp_scoring_ruleset.included_individual_seniority_keywords ?? []);
  const [
    excluded_individual_seniority_keywords,
    setExcludedIndividualSeniorityKeywords,
  ] = useState<string[]>(icp_scoring_ruleset.excluded_individual_seniority_keywords ?? []);
  const [
    included_individual_industry_keywords,
    setIncludedIndividualIndustryKeywords,
  ] = useState<string[]>(icp_scoring_ruleset.included_individual_industry_keywords ?? []);
  const [
    excluded_individual_industry_keywords,
    setExcludedIndividualIndustryKeywords,
  ] = useState<string[]>(icp_scoring_ruleset.excluded_individual_industry_keywords ?? []);
  const [
    individual_years_of_experience_start,
    setIndividualYearsOfExperienceStart,
  ] = useState<number>(icp_scoring_ruleset.individual_years_of_experience_start ?? 0);
  const [
    individual_years_of_experience_end,
    setIndividualYearsOfExperienceEnd,
  ] = useState<number>(icp_scoring_ruleset.individual_years_of_experience_end ?? 0);
  const [
    included_individual_skills_keywords,
    setIncludedIndividualSkillsKeywords,
  ] = useState<string[]>(icp_scoring_ruleset.included_individual_skills_keywords ?? []);
  const [
    excluded_individual_skills_keywords,
    setExcludedIndividualSkillsKeywords,
  ] = useState<string[]>(icp_scoring_ruleset.excluded_individual_skills_keywords ?? []);
  const [
    included_individual_locations_keywords,
    setIncludedIndividualLocationsKeywords,
  ] = useState<string[]>(icp_scoring_ruleset.included_individual_locations_keywords ?? []);
  const [
    excluded_individual_locations_keywords,
    setExcludedIndividualLocationsKeywords,
  ] = useState<string[]>(icp_scoring_ruleset.excluded_individual_locations_keywords ?? []);
  const [
    included_individual_generalized_keywords,
    setIncludedIndividualGeneralizedKeywords,
  ] = useState<string[]>(icp_scoring_ruleset.included_individual_generalized_keywords ?? []);
  const [
    excluded_individual_generalized_keywords,
    setExcludedIndividualGeneralizedKeywords,
  ] = useState<string[]>(icp_scoring_ruleset.excluded_individual_generalized_keywords ?? []);
  const [
    included_individual_education_keywords,
    setIncludedIndividualEducationKeywords,
  ] = useState<string[]>(icp_scoring_ruleset.included_individual_education_keywords ?? []);
  const [
    excluded_individual_education_keywords,
    setExcludedIndividualEducationKeywords,
  ] = useState<string[]>(icp_scoring_ruleset.excluded_individual_education_keywords ?? []);
  const [included_company_name_keywords, setIncludedCompanyNameKeywords] =
    useState<string[]>(icp_scoring_ruleset.included_company_name_keywords ?? []);
  const [excluded_company_name_keywords, setExcludedCompanyNameKeywords] =
    useState<string[]>(icp_scoring_ruleset.excluded_company_name_keywords ?? []);
  const [
    included_company_locations_keywords,
    setIncludedCompanyLocationsKeywords,
  ] = useState<string[]>(icp_scoring_ruleset.included_company_locations_keywords ?? []);
  const [
    excluded_company_locations_keywords,
    setExcludedCompanyLocationsKeywords,
  ] = useState<string[]>(icp_scoring_ruleset.excluded_company_locations_keywords ?? []);
  const [company_size_start, setCompanySizeStart] = useState<number>(
    icp_scoring_ruleset.company_size_start ?? 0
  );
  const [company_size_end, setCompanySizeEnd] = useState<number>(
    icp_scoring_ruleset.company_size_end ?? 0
  );
  const [
    included_company_industries_keywords,
    setIncludedCompanyIndustriesKeywords,
  ] = useState<string[]>(icp_scoring_ruleset.included_company_industries_keywords ?? []);
  const [
    excluded_company_industries_keywords,
    setExcludedCompanyIndustriesKeywords,
  ] = useState<string[]>(icp_scoring_ruleset.excluded_company_industries_keywords ?? []);
  const [
    included_company_generalized_keywords,
    setIncludedCompanyGeneralizedKeywords,
  ] = useState<string[]>(icp_scoring_ruleset.included_company_generalized_keywords ?? []);
  const [
    excluded_company_generalized_keywords,
    setExcludedCompanyGeneralizedKeywords,
  ] = useState<string[]>(icp_scoring_ruleset.excluded_company_generalized_keywords ?? []);

  const titleOptions = [
    ...new Set(prospects.map((x) => (x.title ? x.title : ""))),
  ].filter((x) => x);
  const industryOptions = [
    ...new Set(prospects.map((x) => x.industry)),
  ].filter((x) => x);
  const companyOptions = [
    ...new Set(prospects.map((x) => x.company)),
  ].filter((x) => x);

  const sumPersonalOption = sum([
    included_individual_title_keywords.length,
    excluded_individual_title_keywords.length,
    included_individual_seniority_keywords.length,
    excluded_individual_seniority_keywords.length,
    included_individual_industry_keywords.length,
    excluded_individual_industry_keywords.length,
    included_individual_skills_keywords.length,
    excluded_individual_skills_keywords.length,
    included_individual_locations_keywords.length,
    excluded_individual_locations_keywords.length,
    included_individual_generalized_keywords.length,
    excluded_individual_generalized_keywords.length,
    included_individual_education_keywords.length,
    excluded_individual_education_keywords.length,
  ]);
  const sumCompanyOption = sum([
    included_company_name_keywords.length,
    excluded_company_name_keywords.length,
    included_company_locations_keywords.length,
    excluded_company_locations_keywords.length,
    included_company_industries_keywords.length,
    excluded_company_industries_keywords.length,
    included_company_generalized_keywords.length,
    excluded_company_generalized_keywords.length,
  ]);

  return (
    viewMode === "CONTACT" ? (
      <Box
        style={{
          display: "flex",
          gap: "1rem",
          flexDirection: "column",
          width: '200px',
          marginRight: '10px',
        }}
      >
        <Title size={'h4'} color={'purple'}>
          Filters
        </Title>
        <ItemCollapse
          title={"Title"}
          numberOfItem={
            included_individual_title_keywords.length +
            excluded_individual_title_keywords.length
          }
        >
          <CustomSelect
            maxWidth="30vw"
            value={included_individual_title_keywords}
            label="Included"
            placeholder="Select options"
            setValue={setIncludedIndividualTitleKeywords}
            data={included_individual_title_keywords.concat(titleOptions)}
            setData={setIncludedIndividualTitleKeywords}
          />
          <CustomSelect
            maxWidth="30vw"
            color="red"
            value={excluded_individual_title_keywords}
            label="Excluded"
            placeholder="Select options"
            setValue={setExcludedIndividualTitleKeywords}
            data={excluded_individual_title_keywords.concat(titleOptions)}
            setData={setExcludedIndividualTitleKeywords}
          />
        </ItemCollapse>
        <ItemCollapse
          title={"Seniority"}
          numberOfItem={
            included_individual_seniority_keywords.length +
            excluded_individual_seniority_keywords.length
          }
        >
          <CustomSelect
            maxWidth="30vw"
            value={included_individual_seniority_keywords}
            label="Included"
            placeholder="Select options"
            setValue={setIncludedIndividualSeniorityKeywords}
            data={included_individual_seniority_keywords}
            setData={setIncludedIndividualSeniorityKeywords}
          />
          <CustomSelect
            maxWidth="30vw"
            color="red"
            value={excluded_individual_seniority_keywords}
            label="Excluded"
            placeholder="Select options"
            setValue={setExcludedIndividualSeniorityKeywords}
            data={excluded_individual_seniority_keywords}
            setData={setExcludedIndividualSeniorityKeywords}
          />
        </ItemCollapse>

        <ItemCollapse
          title={"Industry"}
          numberOfItem={
            included_individual_industry_keywords.length +
            excluded_individual_industry_keywords.length
          }
        >
          <CustomSelect
            maxWidth="30vw"
            value={included_individual_industry_keywords}
            label="Included"
            placeholder="Select options"
            setValue={setIncludedIndividualIndustryKeywords}
            data={included_individual_industry_keywords.concat(
              industryOptions
            )}
            setData={setIncludedIndividualIndustryKeywords}
          />
          <CustomSelect
            maxWidth="30vw"
            value={excluded_individual_industry_keywords}
            label="Excluded"
            color="red"
            placeholder="Select options"
            setValue={setExcludedIndividualIndustryKeywords}
            data={excluded_individual_industry_keywords.concat(
              industryOptions
            )}
            setData={setExcludedIndividualIndustryKeywords}
          />
        </ItemCollapse>

        <ItemCollapse
          title={"Skills"}
          numberOfItem={
            included_individual_skills_keywords.length +
            excluded_individual_skills_keywords.length
          }
        >
          <CustomSelect
            maxWidth="30vw"
            value={included_individual_skills_keywords}
            label="Included"
            placeholder="Select options"
            setValue={setIncludedIndividualSkillsKeywords}
            data={included_individual_skills_keywords}
            setData={setIncludedIndividualSkillsKeywords}
          />
          <CustomSelect
            maxWidth="30vw"
            value={excluded_individual_skills_keywords}
            label="Excluded"
            color="red"
            placeholder="Select options"
            setValue={setExcludedIndividualSkillsKeywords}
            data={excluded_individual_skills_keywords}
            setData={setExcludedIndividualSkillsKeywords}
          />
        </ItemCollapse>
        <ItemCollapse
          title={"Location"}
          numberOfItem={
            included_individual_locations_keywords.length +
            excluded_individual_locations_keywords.length
          }
        >
          <CustomSelect
            maxWidth="30vw"
            value={included_individual_locations_keywords}
            label="Included"
            placeholder="Select options"
            setValue={setIncludedIndividualLocationsKeywords}
            data={included_individual_locations_keywords.concat([
              "United States",
            ])}
            setData={setIncludedIndividualLocationsKeywords}
          />
          <CustomSelect
            maxWidth="30vw"
            value={excluded_individual_locations_keywords}
            label="Excluded"
            color="red"
            placeholder="Select options"
            setValue={setExcludedIndividualLocationsKeywords}
            data={excluded_individual_locations_keywords.concat([
              "United States",
            ])}
            setData={setExcludedIndividualLocationsKeywords}
          />
        </ItemCollapse>
        <ItemCollapse
          title={"Bio & Jobs Description"}
          numberOfItem={
            included_individual_generalized_keywords.length +
            excluded_individual_generalized_keywords.length
          }
        >
          <CustomSelect
            maxWidth="30vw"
            value={included_individual_generalized_keywords}
            label="Included"
            placeholder="Select options"
            setValue={setIncludedIndividualGeneralizedKeywords}
            data={included_individual_generalized_keywords}
            setData={setIncludedIndividualGeneralizedKeywords}
          />
          <CustomSelect
            maxWidth="30vw"
            value={excluded_individual_generalized_keywords}
            label="Excluded"
            color="red"
            placeholder="Select options"
            setValue={setExcludedIndividualGeneralizedKeywords}
            data={excluded_individual_generalized_keywords}
            setData={setExcludedIndividualGeneralizedKeywords}
          />
        </ItemCollapse>

        <ItemCollapse
          title={"University / College"}
          numberOfItem={
            included_individual_education_keywords.length +
            excluded_individual_education_keywords.length
          }
        >
          <CustomSelect
            maxWidth="30vw"
            value={included_individual_education_keywords}
            label="Included"
            placeholder="Select options"
            setValue={setIncludedIndividualEducationKeywords}
            data={included_individual_education_keywords}
            setData={setIncludedIndividualEducationKeywords}
          />
          <CustomSelect
            maxWidth="30vw"
            value={excluded_individual_education_keywords}
            label="Excluded"
            color="red"
            placeholder="Select options"
            setValue={setExcludedIndividualEducationKeywords}
            data={excluded_individual_education_keywords}
            setData={setExcludedIndividualEducationKeywords}
          />
        </ItemCollapse>
        <ItemCollapse title={"Experience"} numberOfItem={0}>
          <Flex direction="column">
            <Title size={"14px"} fw={"500"}>
              Years of Experience
            </Title>
            <Flex
              justify={"space-between"}
              align={"center"}
              mt={"0.2rem"}
              w={"100%"}
              gap={"xs"}
              maw={"30vw"}
            >
              <NumberInput
                value={individual_years_of_experience_start}
                placeholder="Min"
                hideControls
                onChange={(value) =>
                  setIndividualYearsOfExperienceStart(value || 0)
                }
              />
              <NumberInput
                value={individual_years_of_experience_end}
                placeholder="Max"
                hideControls
                onChange={(value) =>
                  setIndividualYearsOfExperienceEnd(value || 0)
                }
              />
            </Flex>
            <Button
              mt={"0.5rem"}
              size="sm"
              ml={"auto"}
              onClick={() => setIndividualYearsOfExperienceEnd(100)}
            >
              Max
            </Button>
          </Flex>
        </ItemCollapse>
      </Box>
    ) :(
      <Box
        style={{ display: "flex", gap: "1rem", flexDirection: "column", width: '200px',
          marginRight: '10px', }}
      >
        <Title size={'h4'} color={'purple'}>
          Filters
        </Title>
        <ItemCollapse
          title={"Companies Keywords"}
          numberOfItem={
            included_company_name_keywords.length +
            excluded_company_name_keywords.length
          }
        >
          <CustomSelect
            maxWidth="30vw"
            value={included_company_name_keywords}
            label="Included"
            placeholder="Select options"
            setValue={setIncludedCompanyNameKeywords}
            data={included_company_name_keywords.concat(companyOptions)}
            setData={setIncludedCompanyNameKeywords}
          />
          <CustomSelect
            maxWidth="30vw"
            value={excluded_company_name_keywords}
            label="Excluded"
            color="red"
            placeholder="Select options"
            setValue={setExcludedCompanyNameKeywords}
            data={excluded_company_name_keywords.concat(companyOptions)}
            setData={setExcludedCompanyNameKeywords}
          />
        </ItemCollapse>
        <ItemCollapse
          title={"Location"}
          numberOfItem={
            included_company_locations_keywords.length +
            excluded_company_locations_keywords.length
          }
        >
          <CustomSelect
            maxWidth="30vw"
            value={included_company_locations_keywords}
            label="Included"
            placeholder="Select options"
            setValue={setIncludedCompanyLocationsKeywords}
            data={included_company_locations_keywords.concat([
              "United States",
            ])}
            setData={setIncludedCompanyLocationsKeywords}
          />
          <CustomSelect
            maxWidth="30vw"
            value={excluded_company_locations_keywords}
            label="Excluded"
            color="red"
            placeholder="Select options"
            setValue={setExcludedCompanyLocationsKeywords}
            data={excluded_company_locations_keywords.concat([
              "United States",
            ])}
            setData={setExcludedCompanyLocationsKeywords}
          />
        </ItemCollapse>
        <ItemCollapse title="Employee Count" numberOfItem={company_size_start && company_size_end ? 1 : 0}>
          <Flex direction="column" maw={"30vw"}>
            <Box
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "1rem",
                alignItems: "center",
                marginTop: "0.2rem",
              }}
            >
              <NumberInput
                value={company_size_start}
                placeholder="Min"
                hideControls
                onChange={(value) => setCompanySizeStart(value || 0)}
              />
              <NumberInput
                value={company_size_end}
                placeholder="Max"
                hideControls
                onChange={(value) => setCompanySizeEnd(value || 0)}
              />
            </Box>
            <Button
              mt={"0.5rem"}
              size="sm"
              ml={"auto"}
              onClick={() => setCompanySizeEnd(100_000)}
            >
              Max
            </Button>
          </Flex>
        </ItemCollapse>
        <ItemCollapse
          title="Industries"
          numberOfItem={
            included_company_industries_keywords.length +
            excluded_company_industries_keywords.length
          }
        >
          <CustomSelect
            maxWidth="30vw"
            value={included_company_industries_keywords}
            label="Included"
            placeholder="Select options"
            setValue={setIncludedCompanyIndustriesKeywords}
            data={included_company_industries_keywords.concat(
              industryOptions
            )}
            setData={setIncludedCompanyIndustriesKeywords}
          />
          <CustomSelect
            maxWidth="30vw"
            value={excluded_company_industries_keywords}
            label="Excluded"
            color="red"
            placeholder="Select options"
            setValue={setExcludedCompanyIndustriesKeywords}
            data={excluded_company_industries_keywords.concat(
              industryOptions
            )}
            setData={setExcludedCompanyIndustriesKeywords}
          />
        </ItemCollapse>
        <ItemCollapse
          title="Company Description"
          numberOfItem={
            included_company_generalized_keywords.length +
            excluded_company_generalized_keywords.length
          }
        >
          <CustomSelect
            maxWidth="30vw"
            value={included_company_generalized_keywords}
            label="Included"
            placeholder="Select options"
            setValue={setIncludedCompanyGeneralizedKeywords}
            data={included_company_generalized_keywords}
            setData={setIncludedCompanyGeneralizedKeywords}
          />
          <CustomSelect
            maxWidth="30vw"
            value={excluded_company_generalized_keywords}
            label="Excluded"
            color="red"
            placeholder="Select options"
            setValue={setExcludedCompanyGeneralizedKeywords}
            data={excluded_company_generalized_keywords}
            setData={setExcludedCompanyGeneralizedKeywords}
          />
        </ItemCollapse>
      </Box>
    )
  )
};

export default MarketMapFilters;