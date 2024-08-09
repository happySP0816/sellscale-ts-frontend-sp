import {
  AIFilters,
  ICPScoringRuleset, TableHeader,
  ViewMode
} from "@modals/ContactAccountFilterModal";
import {Prospect} from "../../../index";
import ItemCollapse from "@common/persona/ICPFilter/Filters/ItemCollapse";
import CustomSelect from "@common/persona/ICPFilter/CustomSelect";
import {
  Accordion,
  Box,
  Button,
  Flex,
  NumberInput,
  Title,
  Text,
  TextInput,
  Textarea,
  Divider,
  Checkbox, Card, Loader, Switch
} from "@mantine/core";
import React, {useEffect, useState} from "react";
import {useRecoilValue} from "recoil";
import {userTokenState} from "@atoms/userAtoms";
import {API_URL} from "@constants/data";
import {useQueryClient} from "@tanstack/react-query";
import {showNotification} from "@mantine/notifications";

interface MarketMapFiltersProps {
  prospects: Prospect[],
  viewMode: ViewMode,
  icp_scoring_ruleset: ICPScoringRuleset,
  selectedContacts: Set<number>,
  segment_id?: number;
  setUpdatedIndividualColumns: React.Dispatch<React.SetStateAction<Set<string>>>;
  setUpdatedCompanyColumns: React.Dispatch<React.SetStateAction<Set<string>>>;
  setContactTableHeaders: React.Dispatch<React.SetStateAction<TableHeader[]>>;
  setCompanyTableHeaders: React.Dispatch<React.SetStateAction<TableHeader[]>>;
  headerSet: Set<string>;
  setHeaderSet: React.Dispatch<React.SetStateAction<Set<string>>>;
}

const MarketMapFilters = function (
  {
    icp_scoring_ruleset,
    prospects,
    viewMode,
    selectedContacts,
    segment_id,
    setUpdatedCompanyColumns,
    setContactTableHeaders,
    setCompanyTableHeaders,
    setUpdatedIndividualColumns,
    headerSet,
    setHeaderSet,
  }: MarketMapFiltersProps
) {
  const userToken = useRecoilValue(userTokenState);

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
  ] = useState<number | null>(icp_scoring_ruleset.individual_years_of_experience_start ?? null);
  const [
    individual_years_of_experience_end,
    setIndividualYearsOfExperienceEnd,
  ] = useState<number | null>(icp_scoring_ruleset.individual_years_of_experience_end ?? null);
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
  const [company_size_start, setCompanySizeStart] = useState<number | null>(
    icp_scoring_ruleset.company_size_start
  );
  const [company_size_end, setCompanySizeEnd] = useState<number | null>(
    icp_scoring_ruleset.company_size_end
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

  const [
    individual_personalizers,
    setIndividualPersonalizers,
  ] = useState<string[]>(icp_scoring_ruleset.individual_personalizers ?? []);

  const [
    company_personalizers,
    setCompanyPersonalizers,
  ] = useState<string[]>(icp_scoring_ruleset.individual_personalizers ?? []);

  const [
   dealbreakers,
    setDealBreakers,
  ] = useState<string[]>(icp_scoring_ruleset.dealbreakers ?? []);

  const [
    individual_ai_filters,
    setIndividualAIFilters,
  ] = useState<AIFilters[]>(icp_scoring_ruleset.individual_ai_filters ?? []);

  const [
    company_ai_filters,
    setCompanyAIFilters,
  ] = useState<AIFilters[]>(icp_scoring_ruleset.company_ai_filters ?? []);

  const [individual_ai_title, setIndividualAITitle] = useState<string>("");
  const [individual_ai_prompt, setIndividualAIPrompt] = useState<string>("");
  const [individual_ai_dealbreaker, setIndividualAIDealbreaker] = useState<boolean>(false);
  const [individual_ai_personalizer, setIndividualAIPersonalizer] = useState<boolean>(false);
  const [individual_ai_use_linkedin, setIndividualAIUseLinkedin] = useState<boolean>(false);

  const [company_ai_title, setCompanyAITitle] = useState<string>("");
  const [company_ai_prompt, setCompanyAIPrompt] = useState<string>("");
  const [company_ai_dealbreaker, setCompanyAIDealbreaker] = useState<boolean>(false);
  const [company_ai_personalizer, setCompanyAIPersonalizer] = useState<boolean>(false);
  const [company_ai_use_linkedin, setCompanyAIUseLinkedin] = useState<boolean>(false);

  useEffect(() => {
        if (included_individual_title_keywords.length === 0) {
          setContactTableHeaders(prevState => prevState.filter(item => item.key !== "included_individual_title_keywords"))
        }
        if (excluded_individual_title_keywords.length === 0) {
        setContactTableHeaders(prevState => prevState.filter(item => item.key !== "excluded_individual_title_keywords"))}
        if (included_individual_industry_keywords.length === 0) {
        setContactTableHeaders(prevState => prevState.filter(item => item.key !== "included_individual_industry_keywords"))}
        if (excluded_individual_industry_keywords.length === 0) {
        setContactTableHeaders(prevState => prevState.filter(item => item.key !== "excluded_individual_industry_keywords"))}
        if ((!individual_years_of_experience_start && individual_years_of_experience_start !== 0) && (!individual_years_of_experience_end && individual_years_of_experience_end !== 0)) {
        setContactTableHeaders(prevState => prevState.filter(item => item.key !== "individual_years_of_experience"))}
        if (included_individual_skills_keywords.length === 0) {
        setContactTableHeaders(prevState => prevState.filter(item => item.key !== "included_individual_skills_keywords"))}
        if (excluded_individual_skills_keywords.length === 0) {
        setContactTableHeaders(prevState => prevState.filter(item => item.key !== "excluded_individual_skills_keywords"))}
        if (included_individual_locations_keywords.length === 0) {
        setContactTableHeaders(prevState => prevState.filter(item => item.key !== "included_individual_locations_keywords"))}
        if (excluded_individual_locations_keywords.length === 0) {
        setContactTableHeaders(prevState => prevState.filter(item => item.key !== "excluded_individual_locations_keywords"))}
        if (included_individual_generalized_keywords.length === 0) {
        setContactTableHeaders(prevState => prevState.filter(item => item.key !== "included_individual_generalized_keywords"))}
        if (excluded_individual_generalized_keywords.length === 0) {
        setContactTableHeaders(prevState => prevState.filter(item => item.key !== "excluded_individual_generalized_keywords"))}
        if (included_individual_education_keywords.length === 0) {
        setContactTableHeaders(prevState => prevState.filter(item => item.key !== "included_individual_education_keywords"))}
        if (excluded_individual_education_keywords.length === 0) {
        setContactTableHeaders(prevState => prevState.filter(item => item.key !== "excluded_individual_education_keywords"))}
        if (included_individual_seniority_keywords.length === 0) {
        setContactTableHeaders(prevState => prevState.filter(item => item.key !== "included_individual_seniority_keywords"))}
        if (excluded_individual_seniority_keywords.length === 0) {
        setContactTableHeaders(prevState => prevState.filter(item => item.key !== "excluded_individual_seniority_keywords"))}
        if (included_company_name_keywords.length === 0) {
        setCompanyTableHeaders(prevState => prevState.filter(item => item.key !== "included_company_name_keywords"))}
        if (excluded_company_name_keywords.length === 0) {
        setCompanyTableHeaders(prevState => prevState.filter(item => item.key !== "excluded_company_name_keywords"))}
        if (included_company_locations_keywords.length === 0) {
        setCompanyTableHeaders(prevState => prevState.filter(item => item.key !== "included_company_locations_keywords"))}
        if (excluded_company_locations_keywords.length === 0) {
        setCompanyTableHeaders(prevState => prevState.filter(item => item.key !== "excluded_company_locations_keywords"))}
        if ((!company_size_start && company_size_start !== 0)  && (!company_size_end && company_size_end !== 0)) {
        setCompanyTableHeaders(prevState => prevState.filter(item => item.key !== "company_size"))}
        if (included_company_industries_keywords.length === 0) {
        setCompanyTableHeaders(prevState => prevState.filter(item => item.key !== "included_company_industries_keywords"))}
        if (excluded_company_industries_keywords.length === 0) {
        setCompanyTableHeaders(prevState => prevState.filter(item => item.key !== "excluded_company_industries_keywords"))}
        if (included_company_generalized_keywords.length === 0) {
        setCompanyTableHeaders(prevState => prevState.filter(item => item.key !== "included_company_generalized_keywords"))}
        if (excluded_company_generalized_keywords.length === 0) {
        setCompanyTableHeaders(prevState => prevState.filter(item => item.key !== "excluded_company_generalized_keywords"))}
  },
[
    included_individual_title_keywords,
    excluded_individual_title_keywords,
    included_individual_industry_keywords,
    excluded_individual_industry_keywords,
    individual_years_of_experience_start,
    individual_years_of_experience_end,
    included_individual_skills_keywords,
    excluded_individual_skills_keywords,
    included_individual_locations_keywords,
    excluded_individual_locations_keywords,
    included_individual_generalized_keywords,
    excluded_individual_generalized_keywords,
    included_individual_education_keywords,
    excluded_individual_education_keywords,
    included_individual_seniority_keywords,
    excluded_individual_seniority_keywords,
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
    individual_personalizers,
    company_personalizers,
    dealbreakers,
    individual_ai_filters,
    company_ai_filters,
    ]);

  const [scoreLoading, setScoreLoading] = useState(false);

  const queryClient = useQueryClient();

  const onAddIndividualAIFilters = (title: string, prompt: string, use_linkedin: boolean) => {
    const key = "aiind_" + title.toLowerCase().split(" ").join("_");
    setIndividualAIFilters(
      [...individual_ai_filters, {key: key, title: title, prompt: prompt, use_linkedin: use_linkedin}]);

    if (individual_ai_dealbreaker) {
      setDealBreakers([...dealbreakers, key]);
    }
    if (individual_ai_personalizer) {
      setIndividualPersonalizers([...individual_personalizers, key]);
    }

    setIndividualAITitle("");
    setIndividualAIPrompt("");
    setIndividualAIDealbreaker(false);
    setIndividualAIPersonalizer(false);
  }

  const onAddCompanyAIFilters = (title: string, prompt: string, use_linkedin: boolean) => {
    const key = "aicomp_" + title.toLowerCase().split(" ").join("_");
    setCompanyAIFilters(
      [...company_ai_filters, {key: key, title: title, prompt: prompt, use_linkedin: use_linkedin}]);

    if (company_ai_dealbreaker) {
      setDealBreakers([...dealbreakers, key]);
    }
    if (company_ai_personalizer) {
      setCompanyPersonalizers([...company_personalizers, key]);
    }

    setCompanyAITitle("");
    setCompanyAIPrompt("");
    setCompanyAIDealbreaker(false);
    setCompanyAIPersonalizer(false);
  };

  const titleOptions = [
    ...new Set(prospects.map((x) => (x.title ? x.title : ""))),
  ].filter((x) => x);
  const industryOptions = [
    ...new Set(prospects.map((x) => x.industry)),
  ].filter((x) => x);
  const companyOptions = [
    ...new Set(prospects.map((x) => x.company)),
  ].filter((x) => x);

  const scoreMarketMap = async () => {
    setScoreLoading(true);
    const response = await fetch(`${API_URL}/segment/${segment_id}/score`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        included_individual_title_keywords,
        excluded_individual_title_keywords,
        included_individual_industry_keywords,
        excluded_individual_industry_keywords,
        individual_years_of_experience_start: individual_years_of_experience_end ? (individual_years_of_experience_start ?? 0) : (individual_years_of_experience_start ?? null),
        individual_years_of_experience_end: individual_years_of_experience_start ? (individual_years_of_experience_end ?? 100) : (individual_years_of_experience_end ?? null),
        included_individual_skills_keywords,
        excluded_individual_skills_keywords,
        included_individual_locations_keywords,
        excluded_individual_locations_keywords,
        included_individual_generalized_keywords,
        excluded_individual_generalized_keywords,
        included_individual_education_keywords,
        excluded_individual_education_keywords,
        included_individual_seniority_keywords,
        excluded_individual_seniority_keywords,
        included_company_name_keywords,
        excluded_company_name_keywords,
        included_company_locations_keywords,
        excluded_company_locations_keywords,
        company_size_start: company_size_end ? (company_size_start ?? 0) : (company_size_start ?? null),
        company_size_end: company_size_start ? (company_size_end ?? 1000000) : (company_size_end ?? null),
        included_company_industries_keywords,
        excluded_company_industries_keywords,
        included_company_generalized_keywords,
        excluded_company_generalized_keywords,
        individual_personalizers,
        company_personalizers,
        dealbreakers,
        individual_ai_filters,
        company_ai_filters,
        selectedContacts: Array.from(selectedContacts),
      }),
    });

    if (response.status === 200) {
      const data = await response.json();

      await queryClient.invalidateQueries(['segmentProspects', segment_id]);
      await queryClient.invalidateQueries(['icpScoringRuleset', segment_id]);
      setScoreLoading(false);
      showNotification({
        title: "Success",
        message: "Successfully scored the market map with the ICP ruleset. AI Filters will take a while to show up.",
        color: "blue",
      })
    } else {
      setScoreLoading(false);
      showNotification({
        title: "Error",
        message: "Failed to score the market map with the ICP ruleset",
        color: "red",
      });
    }
  }

  return (
    viewMode === "CONTACT" ? (
      <Box
        style={{
          display: "flex",
          gap: "1rem",
          flexDirection: "column",
          maxWidth: '250px',
          minWidth: '250px',
          marginRight: '10px',
        }}
      >
        <Title size={'h4'} color={'purple'}>
          Individual Filters
        </Title>
        <Button color={'red'}
                size={'md'}
                onClick={() => scoreMarketMap()}
                disabled={scoreLoading}
        >
          {scoreLoading ? <Loader /> : "Score"}
        </Button>
        <Accordion multiple={true}>
          <Accordion.Item value="individual-filters-programmatic">
            <Accordion.Control>Programmatic Filters</Accordion.Control>
            <Accordion.Panel>
              <Flex direction={'column'} gap={'4px'}>
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
                    setValueSegment={(value) => {
                      const valueArray = value as string[];

                      setUpdatedIndividualColumns(prevState =>
                        new Set([...prevState, 'included_individual_title_keywords']));

                      if (included_individual_title_keywords.length === 0) {

                        if (!headerSet.has("included_individual_title_keywords")) {
                          setContactTableHeaders(prevState => {
                            const set = new Set([...prevState, {key: 'included_individual_title_keywords', title: 'included title'}]);
                            return [...set];
                          })
                          setHeaderSet(new Set([...headerSet, "included_individual_title_keywords"]));
                        }
                      }
                      else if (included_individual_title_keywords.length !== 0 && valueArray.length === 0) {
                        setHeaderSet(prevState => {
                          prevState.delete("included_individual_title_keywords")
                          return new Set([...prevState]);
                        });
                      }

                      setIncludedIndividualTitleKeywords(valueArray);
                    }}
                    setDataSegment={(value) => {
                      const valueArray = value as string[];

                      setUpdatedIndividualColumns(prevState =>
                        new Set([...prevState, 'included_individual_title_keywords']));

                      setIncludedIndividualTitleKeywords(valueArray);
                    }}
                    // setValue={setIncludedIndividualTitleKeywords}
                    data={included_individual_title_keywords.concat(titleOptions)}
                    // setData={setIncludedIndividualTitleKeywords}
                  />
                  <Divider />
                  <CustomSelect
                    maxWidth="30vw"
                    color="red"
                    value={excluded_individual_title_keywords}
                    label="Excluded"
                    placeholder="Select options"
                    // setValue={setExcludedIndividualTitleKeywords}
                    data={excluded_individual_title_keywords.concat(titleOptions)}
                    // setData={setExcludedIndividualTitleKeywords}
                    setValueSegment={(value) => {
                      const valueArray = value as string[];

                      setUpdatedIndividualColumns(prevState =>
                        new Set([...prevState, 'excluded_individual_title_keywords']));

                      if (excluded_individual_title_keywords.length === 0) {
                        if (!headerSet.has("excluded_individual_title_keywords")) {
                          setContactTableHeaders(prevState => {
                            const set = new Set([...prevState, {key: 'excluded_individual_title_keywords', title: 'excluded title'}]);
                            return [...set];
                          })
                          setHeaderSet(new Set([...headerSet, "excluded_individual_title_keywords"]));
                        }
                      }
                      else if (excluded_individual_title_keywords.length !== 0 && valueArray.length === 0) {
                        setHeaderSet(prevState => {
                          prevState.delete("excluded_individual_title_keywords")
                          return new Set([...prevState]);
                        });
                        setContactTableHeaders(prevState => prevState.filter(item => item.key !== "excluded_individual_title_keywords"))
                      }

                      setExcludedIndividualTitleKeywords(valueArray);
                    }}
                    setDataSegment={(value) => {
                      const valueArray = value as string[];

                      setUpdatedIndividualColumns(prevState =>
                        new Set([...prevState, 'excluded_individual_title_keywords']));

                      setExcludedIndividualTitleKeywords(valueArray);
                    }}
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
                    // setValue={setIncludedIndividualSeniorityKeywords}
                    data={included_individual_seniority_keywords}
                    // setData={setIncludedIndividualSeniorityKeywords}
                    setValueSegment={(value) => {
                      const valueArray = value as string[];

                      setUpdatedIndividualColumns(prevState =>
                        new Set([...prevState, 'included_individual_seniority_keywords']));

                      if (included_individual_seniority_keywords.length === 0) {
                        if (!headerSet.has("included_individual_seniority_keywords")) {
                          setContactTableHeaders(prevState => {
                            const set = new Set([...prevState, {key: 'included_individual_seniority_keywords', title: 'included seniority'}]);
                            return [...set];
                          })
                          setHeaderSet(new Set([...headerSet, "included_individual_seniority_keywords"]));
                        }
                      }
                      else if (included_individual_seniority_keywords.length !== 0 && valueArray.length === 0) {
                        setHeaderSet(prevState => {
                          prevState.delete("included_individual_seniority_keywords")
                          return new Set([...prevState]);
                        });
                        setContactTableHeaders(prevState => prevState.filter(item => item.key !== "included_individual_seniority_keywords"))
                      }

                      setIncludedIndividualSeniorityKeywords(valueArray);
                    }}
                    setDataSegment={(value) => {
                      const valueArray = value as string[];

                      setUpdatedIndividualColumns(prevState =>
                        new Set([...prevState, 'included_individual_seniority_keywords']));

                      setIncludedIndividualSeniorityKeywords(valueArray);
                    }}
                  />
                  <Divider />
                  <CustomSelect
                    maxWidth="30vw"
                    color="red"
                    value={excluded_individual_seniority_keywords}
                    label="Excluded"
                    placeholder="Select options"
                    // setValue={setExcludedIndividualSeniorityKeywords}
                    data={excluded_individual_seniority_keywords}
                    // setData={setExcludedIndividualSeniorityKeywords}
                    setValueSegment={(value) => {
                      const valueArray = value as string[];

                      setUpdatedIndividualColumns(prevState =>
                        new Set([...prevState, 'excluded_individual_seniority_keywords']));

                      if (excluded_individual_seniority_keywords.length === 0) {
                        if (!headerSet.has("excluded_individual_seniority_keywords")) {
                          setContactTableHeaders(prevState => {
                            const set = new Set([...prevState, {key: 'excluded_individual_seniority_keywords', title: 'excluded seniority'}]);
                            return [...set];
                          })
                          setHeaderSet(new Set([...headerSet, "excluded_individual_seniority_keywords"]));
                        }
                      }
                      else if (excluded_individual_seniority_keywords.length !== 0 && valueArray.length === 0) {
                        setHeaderSet(prevState => {
                          prevState.delete("excluded_individual_seniority_keywords")
                          return new Set([...prevState]);
                        });
                        setContactTableHeaders(prevState => prevState.filter(item => item.key !== "excluded_individual_seniority_keywords"))
                      }

                      setExcludedIndividualSeniorityKeywords(valueArray);
                    }}
                    setDataSegment={(value) => {
                      const valueArray = value as string[];

                      setUpdatedIndividualColumns(prevState =>
                        new Set([...prevState, 'excluded_individual_seniority_keywords']));

                      setExcludedIndividualSeniorityKeywords(valueArray);
                    }}
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
                    // setValue={setIncludedIndividualIndustryKeywords}
                    data={included_individual_industry_keywords.concat(
                      industryOptions
                    )}
                    // setData={setIncludedIndividualIndustryKeywords}
                    setValueSegment={(value) => {
                      const valueArray = value as string[];

                      setUpdatedIndividualColumns(prevState =>
                        new Set([...prevState, 'included_individual_industry_keywords']));

                      if (included_individual_industry_keywords.length === 0) {
                        if (!headerSet.has("included_individual_industry_keywords")) {
                          setContactTableHeaders(prevState => {
                            const set = new Set([...prevState, {key: 'included_individual_industry_keywords', title: 'included industry'}]);
                            return [...set];
                          })
                          setHeaderSet(new Set([...headerSet, "included_individual_industry_keywords"]));
                        }
                      }
                      else if (included_individual_industry_keywords.length !== 0 && valueArray.length === 0) {
                        if (headerSet.has("included_individual_industry_keywords")) {
                          setHeaderSet(prevState => {
                            prevState.delete("included_individual_industry_keywords")
                            return new Set([...prevState]);
                          });
                        }

                        setContactTableHeaders(prevState => prevState.filter(item => item.key !== "included_individual_industry_keywords"))
                      }

                      setIncludedIndividualIndustryKeywords(valueArray);
                    }}
                    setDataSegment={(value) => {
                      const valueArray = value as string[];

                      setUpdatedIndividualColumns(prevState =>
                        new Set([...prevState, 'included_individual_industry_keywords']));

                      setIncludedIndividualIndustryKeywords(valueArray);
                    }}
                  />
                  <Divider />
                  <CustomSelect
                    maxWidth="30vw"
                    value={excluded_individual_industry_keywords}
                    label="Excluded"
                    color="red"
                    placeholder="Select options"
                    // setValue={setExcludedIndividualIndustryKeywords}
                    data={excluded_individual_industry_keywords.concat(
                      industryOptions
                    )}
                    // setData={setExcludedIndividualIndustryKeywords}
                    setValueSegment={(value) => {
                      const valueArray = value as string[];

                      setUpdatedIndividualColumns(prevState =>
                        new Set([...prevState, 'excluded_individual_industry_keywords']));

                      if (excluded_individual_industry_keywords.length === 0) {
                        if (!headerSet.has("excluded_individual_industry_keywords")) {
                          setContactTableHeaders(prevState => {
                            const set = new Set([...prevState, {key: 'excluded_individual_industry_keywords', title: 'excluded industry'}]);
                            return [...set];
                          })
                          setHeaderSet(new Set([...headerSet, "excluded_individual_industry_keywords"]));
                        }
                      }
                      else if (excluded_individual_industry_keywords.length !== 0 && valueArray.length === 0) {
                        if (headerSet.has("excluded_individual_industry_keywords")) {
                          setHeaderSet(prevState => {
                            prevState.delete("excluded_individual_industry_keywords")
                            return new Set([...prevState]);
                          });
                        }
                        setContactTableHeaders(prevState => prevState.filter(item => item.key !== "excluded_individual_industry_keywords"))
                      }

                      setExcludedIndividualIndustryKeywords(valueArray);
                    }}
                    setDataSegment={(value) => {
                      const valueArray = value as string[];

                      setUpdatedIndividualColumns(prevState =>
                        new Set([...prevState, 'excluded_individual_industry_keywords']));

                      setExcludedIndividualIndustryKeywords(valueArray);
                    }}
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
                    // setValue={setIncludedIndividualSkillsKeywords}
                    data={included_individual_skills_keywords}
                    // setData={setIncludedIndividualSkillsKeywords}
                    setValueSegment={(value) => {
                      const valueArray = value as string[];

                      setUpdatedIndividualColumns(prevState =>
                        new Set([...prevState, 'included_individual_skills_keywords']));

                      if (included_individual_skills_keywords.length === 0) {
                        if (!headerSet.has("included_individual_skills_keywords")) {
                          setContactTableHeaders(prevState => {
                            const set = new Set([...prevState, {key: 'included_individual_skills_keywords', title: 'included skills'}]);
                            return [...set];
                          })
                          setHeaderSet(new Set([...headerSet, "included_individual_skills_keywords"]));
                        }
                      }
                      else if (included_individual_skills_keywords.length !== 0 && valueArray.length === 0) {
                        if (headerSet.has("included_individual_skills_keywords")) {
                          setHeaderSet(prevState => {
                            prevState.delete("included_individual_skills_keywords")
                            return new Set([...prevState]);
                          });
                        }
                        setContactTableHeaders(prevState => prevState.filter(item => item.key !== "included_individual_skills_keywords"))
                      }

                      setIncludedIndividualSkillsKeywords(valueArray);
                    }}
                    setDataSegment={(value) => {
                      const valueArray = value as string[];

                      setUpdatedIndividualColumns(prevState =>
                        new Set([...prevState, 'included_individual_skills_keywords']));

                      setIncludedIndividualSkillsKeywords(valueArray);
                    }}
                  />
                  <Divider />
                  <CustomSelect
                    maxWidth="30vw"
                    value={excluded_individual_skills_keywords}
                    label="Excluded"
                    color="red"
                    placeholder="Select options"
                    // setValue={setExcludedIndividualSkillsKeywords}
                    data={excluded_individual_skills_keywords}
                    // setData={setExcludedIndividualSkillsKeywords}
                    setDataSegment={(value) => {
                      const valueArray = value as string[];

                      setUpdatedIndividualColumns(prevState =>
                        new Set([...prevState, 'excluded_individual_skills_keywords']));

                      setExcludedIndividualSkillsKeywords(valueArray);
                    }}
                    setValueSegment={(value) => {
                      const valueArray = value as string[];

                      setUpdatedIndividualColumns(prevState =>
                        new Set([...prevState, 'excluded_individual_skills_keywords']));

                      if (excluded_individual_skills_keywords.length === 0) {
                        if (!headerSet.has("excluded_individual_skills_keywords")) {
                          setContactTableHeaders(prevState => {
                            const set = new Set([...prevState, {key: 'excluded_individual_skills_keywords', title: 'excluded skills'}]);
                            return [...set];
                          })
                          setHeaderSet(new Set([...headerSet, "excluded_individual_skills_keywords"]));
                        }
                      }
                      else if (excluded_individual_skills_keywords.length !== 0 && valueArray.length === 0) {
                        if (headerSet.has("excluded_individual_skills_keywords")) {
                          setHeaderSet(prevState => {
                            prevState.delete("excluded_individual_skills_keywords")
                            return new Set([...prevState]);
                          });
                        }
                        setContactTableHeaders(prevState => prevState.filter(item => item.key !== "excluded_individual_skills_keywords"))
                      }

                      setExcludedIndividualSkillsKeywords(valueArray);
                    }}
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
                    // setValue={setIncludedIndividualLocationsKeywords}
                    data={included_individual_locations_keywords.concat([
                      "United States",
                    ])}
                    // setData={setIncludedIndividualLocationsKeywords}
                    setValueSegment={(value) => {
                      const valueArray = value as string[];

                      setUpdatedIndividualColumns(prevState =>
                        new Set([...prevState, 'included_individual_locations_keywords']));

                      if (included_individual_locations_keywords.length === 0) {
                        if (!headerSet.has("included_individual_locations_keywords")) {
                          setContactTableHeaders(prevState => {
                            const set = new Set([...prevState, {key: 'included_individual_locations_keywords', title: 'included locations'}]);
                            return [...set];
                          })
                          setHeaderSet(new Set([...headerSet, "included_individual_locations_keywords"]));
                        }
                      }
                      else if (included_individual_locations_keywords.length !== 0 && valueArray.length === 0) {
                        if (headerSet.has("included_individual_locations_keywords")) {
                          setHeaderSet(prevState => {
                            prevState.delete("included_individual_locations_keywords")
                            return new Set([...prevState]);
                          });
                        }
                        setContactTableHeaders(prevState => prevState.filter(item => item.key !== "included_individual_locations_keywords"))
                      }

                      setIncludedIndividualLocationsKeywords(valueArray);
                    }}
                    setDataSegment={(value) => {
                      const valueArray = value as string[];

                      setUpdatedIndividualColumns(prevState =>
                        new Set([...prevState, 'included_individual_locations_keywords']));

                      setIncludedIndividualLocationsKeywords(valueArray);
                    }}
                  />
                  <Divider />
                  <CustomSelect
                    maxWidth="30vw"
                    value={excluded_individual_locations_keywords}
                    label="Excluded"
                    color="red"
                    placeholder="Select options"
                    // setValue={setExcludedIndividualLocationsKeywords}
                    data={excluded_individual_locations_keywords.concat([
                      "United States",
                    ])}
                    // setData={setExcludedIndividualLocationsKeywords}
                    setValueSegment={(value) => {
                      const valueArray = value as string[];

                      setUpdatedIndividualColumns(prevState =>
                        new Set([...prevState, 'excluded_individual_locations_keywords']));

                      if (excluded_individual_locations_keywords.length === 0) {
                        if (!headerSet.has("excluded_individual_locations_keywords")) {
                          setContactTableHeaders(prevState => {
                            const set = new Set([...prevState, {key: 'excluded_individual_locations_keywords', title: 'excluded locations'}]);
                            return [...set];
                          })
                          setHeaderSet(new Set([...headerSet, "excluded_individual_locations_keywords"]));
                        }
                      }
                      else if (excluded_individual_locations_keywords.length !== 0 && valueArray.length === 0) {
                        if (headerSet.has("excluded_individual_locations_keywords")) {
                          setHeaderSet(prevState => {
                            prevState.delete("excluded_individual_locations_keywords")
                            return new Set([...prevState]);
                          });
                        }
                        setContactTableHeaders(prevState => prevState.filter(item => item.key !== "excluded_individual_locations_keywords"))
                      }

                      setExcludedIndividualLocationsKeywords(valueArray);
                    }}
                    setDataSegment={(value) => {
                      const valueArray = value as string[];

                      setUpdatedIndividualColumns(prevState =>
                        new Set([...prevState, 'excluded_individual_locations_keywords']));

                      setExcludedIndividualLocationsKeywords(valueArray);
                    }}
                  />
                </ItemCollapse>
                <ItemCollapse
                  title={"Descriptions"}
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
                    // setValue={setIncludedIndividualGeneralizedKeywords}
                    data={included_individual_generalized_keywords}
                    // setData={setIncludedIndividualGeneralizedKeywords}
                    setValueSegment={(value) => {
                      const valueArray = value as string[];

                      setUpdatedIndividualColumns(prevState =>
                        new Set([...prevState, 'included_individual_generalized_keywords']));

                      if (included_individual_generalized_keywords.length === 0) {
                        if (!headerSet.has("included_individual_generalized_keywords")) {
                          setContactTableHeaders(prevState => {
                            const set = new Set([...prevState, {key: 'included_individual_generalized_keywords', title: 'included generalized'}]);
                            return [...set];
                          })
                          setHeaderSet(new Set([...headerSet, "included_individual_generalized_keywords"]));
                        }
                      }
                      else if (included_individual_generalized_keywords.length !== 0 && valueArray.length === 0) {
                        if (headerSet.has("included_individual_generalized_keywords")) {
                          setHeaderSet(prevState => {
                            prevState.delete("included_individual_generalized_keywords")
                            return new Set([...prevState]);
                          });
                        }
                        setContactTableHeaders(prevState => prevState.filter(item => item.key !== "included_individual_generalized_keywords"))
                      }

                      setIncludedIndividualGeneralizedKeywords(valueArray);
                    }}
                    setDataSegment={(value) => {
                      const valueArray = value as string[];

                      setUpdatedIndividualColumns(prevState =>
                        new Set([...prevState, 'included_individual_generalized_keywords']));

                      setIncludedIndividualGeneralizedKeywords(valueArray);
                    }}
                  />
                  <Divider />
                  <CustomSelect
                    maxWidth="30vw"
                    value={excluded_individual_generalized_keywords}
                    label="Excluded"
                    color="red"
                    placeholder="Select options"
                    // setValue={setExcludedIndividualGeneralizedKeywords}
                    data={excluded_individual_generalized_keywords}
                    // setData={setExcludedIndividualGeneralizedKeywords}
                    setValueSegment={(value) => {
                      const valueArray = value as string[];

                      setUpdatedIndividualColumns(prevState =>
                        new Set([...prevState, 'excluded_individual_generalized_keywords']));

                      if (excluded_individual_generalized_keywords.length === 0) {
                        if (!headerSet.has("excluded_individual_generalized_keywords")) {
                          setContactTableHeaders(prevState => {
                            const set = new Set([...prevState, {key: 'excluded_individual_generalized_keywords', title: 'excluded generalized'}]);
                            return [...set];
                          })
                          setHeaderSet(new Set([...headerSet, "excluded_individual_generalized_keywords"]));
                        }
                      }
                      else if (excluded_individual_generalized_keywords.length !== 0 && valueArray.length === 0) {
                        if (headerSet.has("excluded_individual_generalized_keywords")) {
                          setHeaderSet(prevState => {
                            prevState.delete("excluded_individual_generalized_keywords")
                            return new Set([...prevState]);
                          });
                        }
                        setContactTableHeaders(prevState => prevState.filter(item => item.key !== "excluded_individual_generalized_keywords"))
                      }

                      setExcludedIndividualGeneralizedKeywords(valueArray);
                    }}
                    setDataSegment={(value) => {
                      const valueArray = value as string[];

                      setUpdatedIndividualColumns(prevState =>
                        new Set([...prevState, 'excluded_individual_generalized_keywords']));

                      setExcludedIndividualGeneralizedKeywords(valueArray);
                    }}
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
                    // setValue={setIncludedIndividualEducationKeywords}
                    data={included_individual_education_keywords}
                    // setData={setIncludedIndividualEducationKeywords}
                    setValueSegment={(value) => {
                      const valueArray = value as string[];

                      setUpdatedIndividualColumns(prevState =>
                        new Set([...prevState, 'included_individual_education_keywords']));

                      if (included_individual_education_keywords.length === 0) {
                        if (!headerSet.has("included_individual_education_keywords")) {
                          setContactTableHeaders(prevState => {
                            const set = new Set([...prevState, {key: 'included_individual_education_keywords', title: 'included education'}]);
                            return [...set];
                          })
                          setHeaderSet(new Set([...headerSet, "included_individual_education_keywords"]));
                        }
                      }
                      else if (included_individual_education_keywords.length !== 0 && valueArray.length === 0) {
                        if (headerSet.has("included_individual_education_keywords")) {
                          setHeaderSet(prevState => {
                            prevState.delete("included_individual_education_keywords")
                            return new Set([...prevState]);
                          });
                        }
                        setContactTableHeaders(prevState => prevState.filter(item => item.key !== "included_individual_education_keywords"))
                      }

                      setIncludedIndividualEducationKeywords(valueArray);
                    }}
                    setDataSegment={(value) => {
                      const valueArray = value as string[];

                      setUpdatedIndividualColumns(prevState =>
                        new Set([...prevState, 'included_individual_education_keywords']));

                      setIncludedIndividualEducationKeywords(valueArray);
                    }}
                  />
                  <Divider />
                  <CustomSelect
                    maxWidth="30vw"
                    value={excluded_individual_education_keywords}
                    label="Excluded"
                    color="red"
                    placeholder="Select options"
                    // setValue={setExcludedIndividualEducationKeywords}
                    data={excluded_individual_education_keywords}
                    // setData={setExcludedIndividualEducationKeywords}
                    setValueSegment={(value) => {
                      const valueArray = value as string[];

                      setUpdatedIndividualColumns(prevState =>
                        new Set([...prevState, 'excluded_individual_education_keywords']));

                      if (excluded_individual_education_keywords.length === 0) {
                        if (!headerSet.has("excluded_individual_education_keywords")) {
                          setContactTableHeaders(prevState => {
                            const set = new Set([...prevState, {key: 'excluded_individual_education_keywords', title: 'excluded education'}]);
                            return [...set];
                          })
                          setHeaderSet(new Set([...headerSet, "excluded_individual_education_keywords"]));
                        }
                      }
                      else if (excluded_individual_education_keywords.length !== 0 && valueArray.length === 0) {
                        if (headerSet.has("excluded_individual_education_keywords")) {
                          setHeaderSet(prevState => {
                            prevState.delete("excluded_individual_education_keywords")
                            return new Set([...prevState]);
                          });
                        }
                        setContactTableHeaders(prevState => prevState.filter(item => item.key !== "excluded_individual_education_keywords"))
                      }

                      setExcludedIndividualEducationKeywords(valueArray);
                    }}
                    setDataSegment={(value) => {
                      const valueArray = value as string[];

                      setUpdatedIndividualColumns(prevState =>
                        new Set([...prevState, 'excluded_individual_education_keywords']));

                      setExcludedIndividualEducationKeywords(valueArray);
                    }}
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
                      direction={'column'}
                    >
                      <NumberInput
                        value={individual_years_of_experience_start ?? ""}
                        label={"min"}
                        placeholder="Min"
                        hideControls
                        onChange={(value) => {
                          if ((value === 0 || value === "") && (individual_years_of_experience_end === null || individual_years_of_experience_end === 0)) {
                            if (headerSet.has("individual_years_of_experience")) {
                              setHeaderSet(prevState => {
                                prevState.delete("individual_years_of_experience")
                                return new Set([...prevState]);
                              });
                            }
                            setContactTableHeaders(prevState => prevState.filter(item => item.key !== "individual_years_of_experience"))
                          }
                          else if (value !== 0 && value !== "") {
                            if (!headerSet.has("individual_years_of_experience")) {
                              setContactTableHeaders(prevState => [...prevState, {
                                key: 'individual_years_of_experience',
                                title: 'years of experience'
                              }]);
                              setHeaderSet(prevState => new Set([...prevState, "individual_years_of_experience"]));
                            }
                          }

                          if (value === "") {
                            setIndividualYearsOfExperienceStart(null)
                          }
                          else {
                            setIndividualYearsOfExperienceStart(+value)
                          }
                        }}
                      />
                      <NumberInput
                        value={individual_years_of_experience_end ?? ""}
                        label={"max"}
                        placeholder="Max"
                        hideControls
                        onChange={(value) => {
                          if ((value === 0 || value === "") && (individual_years_of_experience_start === null || individual_years_of_experience_start === 0)) {
                            setHeaderSet(prevState => {
                              prevState.delete("individual_years_of_experience")
                              return new Set([...prevState]);
                            });
                            setContactTableHeaders(prevState => prevState.filter(item => item.key !== "individual_years_of_experience"))
                          }
                          else if (value !== 0 && value !== "") {
                            if (!headerSet.has("individual_years_of_experience")) {
                              setContactTableHeaders(prevState => [...prevState, {
                                key: 'individual_years_of_experience',
                                title: 'years of experience'
                              }]);
                              setHeaderSet(prevState => new Set([...prevState, "individual_years_of_experience"]));
                            }
                          }
                          if (value === "") {
                            setIndividualYearsOfExperienceEnd(null)
                          }
                          else {
                            setIndividualYearsOfExperienceEnd(+value)
                          }
                        }}
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
              </Flex>
            </Accordion.Panel>
          </Accordion.Item>
          <Accordion.Item value="individual-filters-ai">
            <Accordion.Control>AI Filters</Accordion.Control>
            <Accordion.Panel>
              <Flex direction={'column'} gap={'6px'}>
                <Text fz="md">Add AI Filters</Text>
                <TextInput
                  placeholder="Enter Title"
                  value={individual_ai_title}
                  label="Title"
                  description="This will be the title that is displayed as a column"
                  withAsterisk
                  onChange={(event) => setIndividualAITitle(event.currentTarget.value)}
                />
                <Textarea
                  placeholder="Enter AI prompt here. A question to score your list."
                  value={individual_ai_prompt}
                  label="AI Filter"
                  withAsterisk
                  minRows={8}
                  maxRows={8}
                  onChange={(event) => setIndividualAIPrompt(event.currentTarget.value)}
                />
                <Checkbox
                  label="Is Dealbreaker"
                  checked={individual_ai_dealbreaker}
                  onChange={(event) => setIndividualAIDealbreaker(event.currentTarget.checked)}
                />
                <Checkbox
                  label="Personalizer"
                  checked={individual_ai_personalizer}
                  onChange={(event) => setIndividualAIPersonalizer(event.currentTarget.checked)}
                />
                <Switch
                  onLabel="Use Linkedin"
                  offLabel="Use Search"
                  size={'lg'}
                  onChange={(event) => setIndividualAIUseLinkedin(event.currentTarget.checked)}
                />
                <Button
                  disabled={!individual_ai_title || !individual_ai_prompt}
                  onClick={() => {
                    const key = "aiind_" + individual_ai_title.toLowerCase().split(" ").join("_");

                    setHeaderSet(prevState => new Set([...prevState, key]));
                    setContactTableHeaders(prevState => {
                      const set = new Set([...prevState, {key: key, title: individual_ai_title}]);
                      return [...set];
                    });
                    onAddIndividualAIFilters(individual_ai_title, individual_ai_prompt, individual_ai_use_linkedin);
                  }}
                >
                  Add AI Filter
                </Button>
                <Divider />
                <Text fz="md">Current AI Filters</Text>
                {individual_ai_filters.map((aiFilter, index) => {
                  return (
                    <Card
                      key={index}
                      shadow={"sm"}
                      padding={"lg"}
                      radius={"md"}
                      withBorder
                    >
                      <Title order={6}>
                        {aiFilter.title}
                      </Title>
                      <Divider />
                      <Text size={"xs"}>
                        {aiFilter.prompt}
                      </Text>
                      <Checkbox
                        checked={dealbreakers.includes(aiFilter.key)}
                        onChange={(event) => {
                          setUpdatedIndividualColumns(prevState => new Set([...prevState, aiFilter.key]));

                          if (event.currentTarget.checked) {
                            setDealBreakers([...dealbreakers, aiFilter.key])
                          }
                          else {
                            setDealBreakers(dealbreakers.filter(x => x !== aiFilter.key))
                          }
                        }}
                        label={"Dealbreaker"}
                        size={'xs'}
                        mb={'4px'}
                      />
                      <Checkbox
                        checked={individual_personalizers.includes(aiFilter.key)}
                        onChange={(event) => {
                          if (event.currentTarget.checked) {
                            setIndividualPersonalizers([...individual_personalizers, aiFilter.key])
                          }
                          else {
                            setIndividualPersonalizers(individual_personalizers.filter(x => x !== aiFilter.key))
                          }
                        }}
                        label={"Personalizer"}
                        size={'xs'}
                        mb={'4px'}
                      />
                      <Button
                        color={'red'}
                        onClick={() => {
                          setHeaderSet(prevState => {
                            prevState.delete(aiFilter.key);
                            return new Set([...prevState]);
                          });
                          setContactTableHeaders(prevState => prevState.filter(item => item.key !== aiFilter.key));
                          setDealBreakers(prevState => prevState.filter(x => x !== aiFilter.key));
                          setIndividualPersonalizers(prevState => prevState.filter(x => x !== aiFilter.key));
                          setIndividualAIFilters(prevState => prevState.filter(item => item.key !== aiFilter.key))
                        }}>
                        Delete
                      </Button>
                    </Card>
                  )
                })}
              </Flex>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>

      </Box>
    ) :(
      <Box
        style={{ display: "flex",
          gap: "1rem",
          flexDirection: "column",
          minWidth: '250px',
          maxWidth:'250px',
          marginRight: '10px',
        }}
      >
        <Title size={'h4'} color={'purple'}>
          Company Filters
        </Title>
        <Button color={'red'}
                size={'md'}
                onClick={() => scoreMarketMap()}
                disabled={scoreLoading}
        >
          {scoreLoading ? <Loader /> : "Score"}
        </Button>
        <Accordion
          multiple={true}
         >
          <Accordion.Item value={'company-filters-programmatic'}>
            <Accordion.Control>Programmatic Filters</Accordion.Control>
            <Accordion.Panel>
              <Flex direction={'column'} gap={'4px'}>
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
                    // setValue={setIncludedCompanyNameKeywords}
                    data={included_company_name_keywords.concat(companyOptions)}
                    // setData={setIncludedCompanyNameKeywords}
                    setValueSegment={(value) => {
                      const valueArray = value as string[];

                      setUpdatedCompanyColumns(prevState =>
                        new Set([...prevState, 'included_company_name_keywords']));

                      if (included_company_name_keywords.length === 0) {
                        if (!headerSet.has("included_company_name_keywords")) {
                          setCompanyTableHeaders(prevState => {
                            const set = new Set([...prevState, {key: 'included_company_name_keywords', title: 'included name'}]);
                            return [...set];
                          })
                          setHeaderSet(new Set([...headerSet, "included_company_name_keywords"]));
                        }
                      }
                      else if (included_company_name_keywords.length !== 0 && valueArray.length === 0) {
                        if (headerSet.has("included_company_name_keywords")) {
                          setHeaderSet(prevState => {
                            prevState.delete("included_company_name_keywords")
                            return new Set([...prevState]);
                          });
                        }
                        setCompanyTableHeaders(prevState => prevState.filter(item => item.key !== "included_company_name_keywords"))
                      }

                      setIncludedCompanyNameKeywords(valueArray);
                    }}
                    setDataSegment={(value) => {
                      const valueArray = value as string[];

                      setUpdatedCompanyColumns(prevState =>
                        new Set([...prevState, 'included_company_name_keywords']));

                      setIncludedCompanyNameKeywords(valueArray);
                    }}
                  />
                  <Divider />
                  <CustomSelect
                    maxWidth="30vw"
                    value={excluded_company_name_keywords}
                    label="Excluded"
                    color="red"
                    placeholder="Select options"
                    // setValue={setExcludedCompanyNameKeywords}
                    data={excluded_company_name_keywords.concat(companyOptions)}
                    // setData={setExcludedCompanyNameKeywords}
                    setValueSegment={(value) => {
                      const valueArray = value as string[];

                      setUpdatedCompanyColumns(prevState =>
                        new Set([...prevState, 'excluded_company_name_keywords']));

                      if (excluded_company_name_keywords.length === 0) {
                        if (!headerSet.has("excluded_company_name_keywords")) {
                          setCompanyTableHeaders(prevState => {
                            const set = new Set([...prevState, {key: 'excluded_company_name_keywords', title: 'excluded name'}]);
                            return [...set];
                          })
                          setHeaderSet(new Set([...headerSet, "excluded_company_name_keywords"]));
                        }
                      }
                      else if (excluded_company_name_keywords.length !== 0 && valueArray.length === 0) {
                        if (headerSet.has("excluded_company_name_keywords")) {
                          setHeaderSet(prevState => {
                            prevState.delete("excluded_company_name_keywords")
                            return new Set([...prevState]);
                          });
                        }
                        setCompanyTableHeaders(prevState => prevState.filter(item => item.key !== "excluded_company_name_keywords"))
                      }

                      setExcludedCompanyNameKeywords(valueArray);
                    }}
                    setDataSegment={(value) => {
                      const valueArray = value as string[];

                      setUpdatedCompanyColumns(prevState =>
                        new Set([...prevState, 'excluded_company_name_keywords']));

                      setExcludedCompanyNameKeywords(valueArray);
                    }}
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
                    // setValue={setIncludedCompanyLocationsKeywords}
                    data={included_company_locations_keywords.concat([
                      "United States",
                    ])}
                    // setData={setIncludedCompanyLocationsKeywords}
                    setValueSegment={(value) => {
                      const valueArray = value as string[];

                      setUpdatedCompanyColumns(prevState =>
                        new Set([...prevState, 'included_company_locations_keywords']));

                      if (included_company_locations_keywords.length === 0) {
                        if (!headerSet.has("included_company_locations_keywords")) {
                          setCompanyTableHeaders(prevState => {
                            const set = new Set([...prevState, {key: 'included_company_locations_keywords', title: 'included locations'}]);
                            return [...set];
                          })
                          setHeaderSet(new Set([...headerSet, "included_company_locations_keywords"]));
                        }
                      }
                      else if (included_company_locations_keywords.length !== 0 && valueArray.length === 0) {
                        if (headerSet.has("included_company_locations_keywords")) {
                          setHeaderSet(prevState => {
                            prevState.delete("included_company_locations_keywords")
                            return new Set([...prevState]);
                          });
                        }
                        setCompanyTableHeaders(prevState => prevState.filter(item => item.key !== "included_company_locations_keywords"))
                      }

                      setIncludedCompanyLocationsKeywords(valueArray);
                    }}
                    setDataSegment={(value) => {
                      const valueArray = value as string[];

                      setUpdatedCompanyColumns(prevState =>
                        new Set([...prevState, 'included_company_locations_keywords']));

                      setIncludedCompanyLocationsKeywords(valueArray);
                    }}
                  />
                  <Divider />
                  <CustomSelect
                    maxWidth="30vw"
                    value={excluded_company_locations_keywords}
                    label="Excluded"
                    color="red"
                    placeholder="Select options"
                    // setValue={setExcludedCompanyLocationsKeywords}
                    data={excluded_company_locations_keywords.concat([
                      "United States",
                    ])}
                    // setData={setExcludedCompanyLocationsKeywords}
                    setValueSegment={(value) => {
                      const valueArray = value as string[];

                      setUpdatedCompanyColumns(prevState =>
                        new Set([...prevState, 'excluded_company_locations_keywords']));

                      if (excluded_company_locations_keywords.length === 0) {
                        if (!headerSet.has("excluded_company_locations_keywords")) {
                          setCompanyTableHeaders(prevState => {
                            const set = new Set([...prevState, {key: 'excluded_company_locations_keywords', title: 'excluded locations'}]);
                            return [...set];
                          })
                          setHeaderSet(new Set([...headerSet, "excluded_company_locations_keywords"]));
                        }
                      }
                      else if (excluded_company_locations_keywords.length !== 0 && valueArray.length === 0) {
                        setCompanyTableHeaders(prevState => prevState.filter(item => item.key !== "excluded_company_locations_keywords"))
                      }

                      setExcludedCompanyLocationsKeywords(valueArray);
                    }}
                    setDataSegment={(value) => {
                      const valueArray = value as string[];

                      setUpdatedCompanyColumns(prevState =>
                        new Set([...prevState, 'excluded_company_locations_keywords']));

                      setExcludedCompanyLocationsKeywords(valueArray);
                    }}
                  />
                </ItemCollapse>
                <ItemCollapse title="Employee Count" numberOfItem={company_size_start && company_size_end ? 1 : 0}>
                  <Flex direction="column" maw={"30vw"} gap={'4px'}>
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
                        value={company_size_start ?? ""}
                        placeholder="Min"
                        label={"Min"}
                        hideControls
                        onChange={(value) => {
                          if ((value === 0 || value === "") && (!company_size_end || company_size_end === 0)) {
                            if (headerSet.has("company_size")) {
                              setHeaderSet(prevState => {
                                prevState.delete("company_size")
                                return new Set([...prevState]);
                              });
                            }
                            setCompanyTableHeaders(prevState => prevState.filter(item => item.key !== "company_size"))
                          }
                          else if (value !== 0 && value !== "") {
                            if (!headerSet.has("company_size")) {
                              setCompanyTableHeaders(prevState => {
                                const set = new Set([...prevState, {key: 'company_size', title: 'company size'}]);
                                return [...set];
                              });
                              setHeaderSet(prevState => new Set([...prevState, "company_size"]));
                            }
                          }

                          if (value === "") {
                            setCompanySizeStart(null);
                          }
                          else {
                            setCompanySizeStart(+value)
                          }
                        }}
                      />
                      <NumberInput
                        value={company_size_end ?? ""}
                        placeholder="Max"
                        label={"Max"}
                        hideControls
                        onChange={(value) => {
                          if ((value === "" || value === 0) && (company_size_start === null || company_size_start === 0)) {
                            setHeaderSet(prevState => {
                              prevState.delete("company_size")
                              return new Set([...prevState]);
                            });
                            setCompanyTableHeaders(prevState => prevState.filter(item => item.key !== "company_size"))
                          }
                          else if (value !== 0 && value !== "") {
                            if (!headerSet.has("company_size")) {
                              setCompanyTableHeaders(prevState => {
                                const set = new Set([...prevState, {key: 'company_size', title: 'company size'}]);
                                return [...set];
                              });
                              setHeaderSet(prevState => new Set([...prevState, "company_size"]));
                            }
                          }

                          if (value === "") {
                            setCompanySizeEnd(null);
                          }
                          else {
                            setCompanySizeEnd(+value);
                          }
                        }}
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
                    // setValue={setIncludedCompanyIndustriesKeywords}
                    data={included_company_industries_keywords.concat(
                      industryOptions
                    )}
                    // setData={setIncludedCompanyIndustriesKeywords}
                    setValueSegment={(value) => {
                      const valueArray = value as string[];

                      setUpdatedCompanyColumns(prevState =>
                        new Set([...prevState, 'included_company_industries_keywords']));

                      if (included_company_industries_keywords.length === 0) {
                        if (!headerSet.has("included_company_industries_keywords")) {
                          setCompanyTableHeaders(prevState => {
                            const set = new Set([...prevState, {key: 'included_company_industries_keywords', title: 'included industries'}]);
                            return [...set];
                          })
                          setHeaderSet(new Set([...headerSet, "included_company_industries_keywords"]));
                        }
                      }
                      else if (included_company_industries_keywords.length !== 0 && valueArray.length === 0) {
                        if (headerSet.has("included_company_industries_keywords")) {
                          setHeaderSet(prevState => {
                            prevState.delete("included_company_industries_keywords")
                            return new Set([...prevState]);
                          });
                        }
                        setCompanyTableHeaders(prevState => prevState.filter(item => item.key !== "included_company_industries_keywords"))
                      }

                      setIncludedCompanyIndustriesKeywords(valueArray);
                    }}
                    setDataSegment={(value) => {
                      const valueArray = value as string[];

                      setUpdatedCompanyColumns(prevState =>
                        new Set([...prevState, 'included_company_industries_keywords']));

                      setIncludedCompanyIndustriesKeywords(valueArray);
                    }}
                  />
                  <Divider />
                  <CustomSelect
                    maxWidth="30vw"
                    value={excluded_company_industries_keywords}
                    label="Excluded"
                    color="red"
                    placeholder="Select options"
                    // setValue={setExcludedCompanyIndustriesKeywords}
                    data={excluded_company_industries_keywords.concat(
                      industryOptions
                    )}
                    // setData={setExcludedCompanyIndustriesKeywords}
                    setValueSegment={(value) => {
                      const valueArray = value as string[];

                      setUpdatedCompanyColumns(prevState =>
                        new Set([...prevState, 'excluded_company_industries_keywords']));

                      if (excluded_company_industries_keywords.length === 0) {
                        if (!headerSet.has("excluded_company_industries_keywords")) {
                          setCompanyTableHeaders(prevState => {
                            const set = new Set([...prevState, {key: 'excluded_company_industries_keywords', title: 'excluded industries'}]);
                            return [...set];
                          })
                          setHeaderSet(new Set([...headerSet, "excluded_company_industries_keywords"]));
                        }
                      }
                      else if (excluded_company_industries_keywords.length !== 0 && valueArray.length === 0) {
                        if (headerSet.has("excluded_company_industries_keywords")) {
                          setHeaderSet(prevState => {
                            prevState.delete("excluded_company_industries_keywords")
                            return new Set([...prevState]);
                          });
                        }
                        setCompanyTableHeaders(prevState => prevState.filter(item => item.key !== "excluded_company_industries_keywords"))
                      }

                      setExcludedCompanyIndustriesKeywords(valueArray);
                    }}
                    setDataSegment={(value) => {
                      const valueArray = value as string[];

                      setUpdatedCompanyColumns(prevState =>
                        new Set([...prevState, 'excluded_company_industries_keywords']));

                      setExcludedCompanyIndustriesKeywords(valueArray);
                    }}
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
                    // setValue={setIncludedCompanyGeneralizedKeywords}
                    data={included_company_generalized_keywords}
                    // setData={setIncludedCompanyGeneralizedKeywords}
                    setValueSegment={(value) => {
                      const valueArray = value as string[];

                      setUpdatedCompanyColumns(prevState =>
                        new Set([...prevState, 'included_company_generalized_keywords']));

                      if (included_company_generalized_keywords.length === 0) {
                        if (!headerSet.has("included_company_generalized_keywords")) {
                          setCompanyTableHeaders(prevState => {
                            const set = new Set([...prevState, {key: 'included_company_generalized_keywords', title: 'included generalized'}]);
                            return [...set];
                          })
                          setHeaderSet(new Set([...headerSet, "included_company_generalized_keywords"]));
                        }
                      }
                      else if (included_company_generalized_keywords.length !== 0 && valueArray.length === 0) {
                        if (headerSet.has("included_company_generalized_keywords")) {
                          setHeaderSet(prevState => {
                            prevState.delete("included_company_generalized_keywords")
                            return new Set([...prevState]);
                          });
                        }
                        setCompanyTableHeaders(prevState => prevState.filter(item => item.key !== "included_company_generalized_keywords"))
                      }

                      setIncludedCompanyGeneralizedKeywords(valueArray);
                    }}
                    setDataSegment={(value) => {
                      const valueArray = value as string[];

                      setUpdatedCompanyColumns(prevState =>
                        new Set([...prevState, 'included_company_generalized_keywords']));

                      setIncludedCompanyGeneralizedKeywords(valueArray);
                    }}
                  />
                  <Divider />
                  <CustomSelect
                    maxWidth="30vw"
                    value={excluded_company_generalized_keywords}
                    label="Excluded"
                    color="red"
                    placeholder="Select options"
                    // setValue={setExcludedCompanyGeneralizedKeywords}
                    data={excluded_company_generalized_keywords}
                    // setData={setExcludedCompanyGeneralizedKeywords}
                    setValueSegment={(value) => {
                      const valueArray = value as string[];

                      setUpdatedCompanyColumns(prevState =>
                        new Set([...prevState, 'excluded_company_generalized_keywords']));

                      if (excluded_company_generalized_keywords.length === 0) {
                        if (!headerSet.has("excluded_company_generalized_keywords")) {
                          setCompanyTableHeaders(prevState => {
                            const set = new Set([...prevState, {key: 'excluded_company_generalized_keywords', title: 'excluded generalized'}]);
                            return [...set];
                          })
                          setHeaderSet(new Set([...headerSet, "excluded_company_generalized_keywords"]));
                        }
                      }
                      else if (excluded_company_generalized_keywords.length !== 0 && valueArray.length === 0) {
                        if (headerSet.has("excluded_company_generalized_keywords")) {
                          setHeaderSet(prevState => {
                            prevState.delete("excluded_company_generalized_keywords")
                            return new Set([...prevState]);
                          });
                        }
                        setCompanyTableHeaders(prevState => prevState.filter(item => item.key !== "excluded_company_generalized_keywords"))
                      }

                      setExcludedCompanyGeneralizedKeywords(valueArray);
                    }}
                    setDataSegment={(value) => {
                      const valueArray = value as string[];

                      setUpdatedCompanyColumns(prevState =>
                        new Set([...prevState, 'excluded_company_generalized_keywords']));

                      setExcludedCompanyGeneralizedKeywords(valueArray);
                    }}
                  />
                </ItemCollapse>
              </Flex>
            </Accordion.Panel>
          </Accordion.Item>
          <Accordion.Item value="company-filters-ai">
            <Accordion.Control>AI Filters</Accordion.Control>
            <Accordion.Panel>
              <Flex direction={'column'} gap={'6px'}>
                <Text fz="md">Add AI Filters</Text>
                <TextInput
                  placeholder="Enter Title"
                  value={company_ai_title}
                  label="Title"
                  description="This will be the title that is displayed as a column"
                  withAsterisk
                  onChange={(event) => setCompanyAITitle(event.currentTarget.value)}
                />
                <Textarea
                  placeholder="Enter AI prompt here. A question to score your contact list."
                  value={company_ai_prompt}
                  label="AI Filter"
                  withAsterisk
                  minRows={8}
                  maxRows={8}
                  onChange={(event) => setCompanyAIPrompt(event.currentTarget.value)}
                />
                <Checkbox
                  label="Is Dealbreaker"
                  checked={company_ai_dealbreaker}
                  onChange={(event) => setCompanyAIDealbreaker(event.currentTarget.checked)}
                />
                <Checkbox
                  label="Personalizer"
                  checked={company_ai_personalizer}
                  onChange={(event) => setCompanyAIPersonalizer(event.currentTarget.checked)}
                />
                <Button
                  disabled={!company_ai_title || !company_ai_prompt}
                  onClick={() => {
                    const key = "aicomp_" + company_ai_title.toLowerCase().split(" ").join("_");

                    if (!headerSet.has(key)) {
                      setHeaderSet(prevState => new Set([...prevState, key]));
                    }

                    setCompanyTableHeaders(prevState => {
                      const set = new Set([...prevState, {key: key, title: company_ai_title}]);
                      return [...set];
                    });
                    onAddCompanyAIFilters(company_ai_title, company_ai_prompt, company_ai_use_linkedin);
                  }}
                >
                  Add AI Filter
                </Button>
                <Divider />
                <Text fz="md">Current AI Filters</Text>
                {company_ai_filters.map((aiFilter, index) => {
                  return (
                    <Card
                      key={index}
                      shadow={"sm"}
                      padding={"lg"}
                      radius={"md"}
                      withBorder
                    >
                      <Title order={6}>
                        {aiFilter.title}
                      </Title>
                      <Divider />
                      <Text>
                        {aiFilter.prompt}
                      </Text>
                      <Checkbox
                        checked={dealbreakers.includes(aiFilter.key)}
                        onChange={(event) => {
                          setUpdatedCompanyColumns(prevState => new Set([...prevState, aiFilter.key]));
                          if (event.currentTarget.checked) {
                            setDealBreakers([...dealbreakers, aiFilter.key])
                          }
                          else {
                            setDealBreakers(dealbreakers.filter(x => x !== aiFilter.key))
                          }
                        }}
                        label={"Dealbreaker"}
                        size={'xs'}
                        mb={'4px'}
                      />
                      <Checkbox
                        checked={company_personalizers.includes(aiFilter.key)}
                        onChange={(event) => {
                          if (event.currentTarget.checked) {
                            setCompanyPersonalizers([...company_personalizers, aiFilter.key])
                          }
                          else {
                            setCompanyPersonalizers(company_personalizers.filter(x => x !== aiFilter.key))
                          }
                        }}
                        label={"Personalizer"}
                        size={'xs'}
                        mb={'4px'}
                      />
                      <Button
                        color={'red'}
                        onClick={() => {
                          setHeaderSet(prevState => {
                            prevState.delete(aiFilter.key);
                            return new Set([...prevState]);
                          });
                          setCompanyTableHeaders(prevState => prevState.filter(item => item.key !== aiFilter.key));
                          setDealBreakers(prevState => prevState.filter(x => x !== aiFilter.key));
                          setCompanyPersonalizers(prevState => prevState.filter(x => x !== aiFilter.key));
                          setCompanyAIFilters(prevState => prevState.filter(item => item.key !== aiFilter.key))
                        }}>
                        Delete
                      </Button>
                    </Card>
                  )
                })}
              </Flex>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
      </Box>
    )
  )
};

export default MarketMapFilters;