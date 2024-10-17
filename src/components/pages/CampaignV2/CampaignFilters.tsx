import {
  AIFilters,
  ICPScoringRuleset,
  TableHeader,
} from "@modals/ContactAccountFilterModal";
import { Prospect } from "../../../index";
import ItemCollapse from "@common/persona/ICPFilter/Filters/ItemCollapse";
import CustomSelect from "@common/persona/ICPFilter/CustomSelect";
import {
  Box,
  Button,
  Flex,
  NumberInput,
  Title,
  Text,
  TextInput,
  Textarea,
  Divider,
  Checkbox,
  Card,
  Loader,
  Switch,
  Badge,
  ScrollArea,
  Accordion,
  Paper,
  ActionIcon,
  Progress,
  Select,
} from "@mantine/core";
import React, { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import { userTokenState } from "@atoms/userAtoms";
import { API_URL } from "@constants/data";
import { useQueryClient } from "@tanstack/react-query";
import { showNotification } from "@mantine/notifications";
import { IconSparkles } from "@tabler/icons-react";
import {
  IconChevronLeft,
  IconFilter,
  IconTrash,
  IconUser,
  IconUsers,
} from "@tabler/icons";

interface CampaignFiltersProps {
  prospects: Prospect[];
  icp_scoring_ruleset: ICPScoringRuleset;
  selectedContacts: Set<number>;
  archetype_id?: number;
  setUpdatedIndividualColumns: React.Dispatch<
    React.SetStateAction<Set<string>>
  >;
  setContactTableHeaders: React.Dispatch<React.SetStateAction<TableHeader[]>>;
  setHeaderSet: React.Dispatch<React.SetStateAction<Set<string>>>;
  setProgrammaticUpdates: React.Dispatch<React.SetStateAction<Set<number>>>;
  programmaticUpdates: Set<number>;
  setCollapseFilters: React.Dispatch<React.SetStateAction<boolean>>;
}

const CampaignFilters = function ({
  icp_scoring_ruleset,
  prospects,
  selectedContacts,
  archetype_id,
  setContactTableHeaders,
  setUpdatedIndividualColumns,
  setHeaderSet,
  setProgrammaticUpdates,
  programmaticUpdates,
  setCollapseFilters,
}: CampaignFiltersProps) {
  const userToken = useRecoilValue(userTokenState);
  const [viewIndividualAIFilters, setViewIndividualAIFilters] =
    useState<boolean>(true);

  const [isScoring, setIsScoring] = useState<number>(0);

  const [scoreAI, setScoreAI] = useState<boolean>(true);

  useEffect(() => {
    if (programmaticUpdates.size === 0) {
      setIsScoring(0);
    }
  }, [programmaticUpdates]);

  useEffect(() => {
    fetchSavedQueries();
  }, [userToken]);

  const [
    included_individual_title_keywords,
    setIncludedIndividualTitleKeywords,
  ] = useState<string[]>(
    icp_scoring_ruleset.included_individual_title_keywords ?? []
  );
  const [
    excluded_individual_title_keywords,
    setExcludedIndividualTitleKeywords,
  ] = useState<string[]>(
    icp_scoring_ruleset.excluded_individual_title_keywords ?? []
  );
  const [
    included_individual_seniority_keywords,
    setIncludedIndividualSeniorityKeywords,
  ] = useState<string[]>(
    icp_scoring_ruleset.included_individual_seniority_keywords ?? []
  );
  const [
    excluded_individual_seniority_keywords,
    setExcludedIndividualSeniorityKeywords,
  ] = useState<string[]>(
    icp_scoring_ruleset.excluded_individual_seniority_keywords ?? []
  );
  const [
    included_individual_industry_keywords,
    setIncludedIndividualIndustryKeywords,
  ] = useState<string[]>(
    icp_scoring_ruleset.included_individual_industry_keywords ?? []
  );
  const [
    excluded_individual_industry_keywords,
    setExcludedIndividualIndustryKeywords,
  ] = useState<string[]>(
    icp_scoring_ruleset.excluded_individual_industry_keywords ?? []
  );
  const [
    individual_years_of_experience_start,
    setIndividualYearsOfExperienceStart,
  ] = useState<number | null>(
    icp_scoring_ruleset.individual_years_of_experience_start ?? null
  );
  const [
    individual_years_of_experience_end,
    setIndividualYearsOfExperienceEnd,
  ] = useState<number | null>(
    icp_scoring_ruleset.individual_years_of_experience_end ?? null
  );
  const [
    included_individual_skills_keywords,
    setIncludedIndividualSkillsKeywords,
  ] = useState<string[]>(
    icp_scoring_ruleset.included_individual_skills_keywords ?? []
  );
  const [
    excluded_individual_skills_keywords,
    setExcludedIndividualSkillsKeywords,
  ] = useState<string[]>(
    icp_scoring_ruleset.excluded_individual_skills_keywords ?? []
  );
  const [
    included_individual_locations_keywords,
    setIncludedIndividualLocationsKeywords,
  ] = useState<string[]>(
    icp_scoring_ruleset.included_individual_locations_keywords ?? []
  );
  const [
    excluded_individual_locations_keywords,
    setExcludedIndividualLocationsKeywords,
  ] = useState<string[]>(
    icp_scoring_ruleset.excluded_individual_locations_keywords ?? []
  );
  const [
    included_individual_generalized_keywords,
    setIncludedIndividualGeneralizedKeywords,
  ] = useState<string[]>(
    icp_scoring_ruleset.included_individual_generalized_keywords ?? []
  );
  const [
    excluded_individual_generalized_keywords,
    setExcludedIndividualGeneralizedKeywords,
  ] = useState<string[]>(
    icp_scoring_ruleset.excluded_individual_generalized_keywords ?? []
  );
  const [
    included_individual_education_keywords,
    setIncludedIndividualEducationKeywords,
  ] = useState<string[]>(
    icp_scoring_ruleset.included_individual_education_keywords ?? []
  );
  const [
    excluded_individual_education_keywords,
    setExcludedIndividualEducationKeywords,
  ] = useState<string[]>(
    icp_scoring_ruleset.excluded_individual_education_keywords ?? []
  );
  const [included_company_name_keywords, setIncludedCompanyNameKeywords] =
    useState<string[]>(
      icp_scoring_ruleset.included_company_name_keywords ?? []
    );
  const [excluded_company_name_keywords, setExcludedCompanyNameKeywords] =
    useState<string[]>(
      icp_scoring_ruleset.excluded_company_name_keywords ?? []
    );
  const [
    included_company_locations_keywords,
    setIncludedCompanyLocationsKeywords,
  ] = useState<string[]>(
    icp_scoring_ruleset.included_company_locations_keywords ?? []
  );
  const [
    excluded_company_locations_keywords,
    setExcludedCompanyLocationsKeywords,
  ] = useState<string[]>(
    icp_scoring_ruleset.excluded_company_locations_keywords ?? []
  );
  const [company_size_start, setCompanySizeStart] = useState<number | null>(
    icp_scoring_ruleset.company_size_start
  );
  const [company_size_end, setCompanySizeEnd] = useState<number | null>(
    icp_scoring_ruleset.company_size_end
  );
  const [
    included_company_industries_keywords,
    setIncludedCompanyIndustriesKeywords,
  ] = useState<string[]>(
    icp_scoring_ruleset.included_company_industries_keywords ?? []
  );
  const [
    excluded_company_industries_keywords,
    setExcludedCompanyIndustriesKeywords,
  ] = useState<string[]>(
    icp_scoring_ruleset.excluded_company_industries_keywords ?? []
  );
  const [
    included_company_generalized_keywords,
    setIncludedCompanyGeneralizedKeywords,
  ] = useState<string[]>(
    icp_scoring_ruleset.included_company_generalized_keywords ?? []
  );
  const [
    excluded_company_generalized_keywords,
    setExcludedCompanyGeneralizedKeywords,
  ] = useState<string[]>(
    icp_scoring_ruleset.excluded_company_generalized_keywords ?? []
  );

  const [individual_personalizers, setIndividualPersonalizers] = useState<
    string[]
  >(icp_scoring_ruleset.individual_personalizers ?? []);

  const [company_personalizers, setCompanyPersonalizers] = useState<string[]>(
    icp_scoring_ruleset.company_personalizers ?? []
  );

  const [dealbreakers, setDealBreakers] = useState<string[]>(
    icp_scoring_ruleset.dealbreakers ?? []
  );

  const [individual_ai_filters, setIndividualAIFilters] = useState<AIFilters[]>(
    icp_scoring_ruleset.individual_ai_filters ?? []
  );

  const [company_ai_filters, setCompanyAIFilters] = useState<AIFilters[]>(
    icp_scoring_ruleset.company_ai_filters ?? []
  );

  const [ai_title, setAITitle] = useState<string>("");
  const [prefilters, setPrefilters] = useState<any[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [ai_prompt, setAIPrompt] = useState<string>("");
  const [ai_relevancy, setAIRelevancy] = useState<string>("");
  const [ai_dealbreaker, setAIDealbreaker] = useState<boolean>(false);
  const [ai_personalizer, setAIPersonalizer] = useState<boolean>(false);
  const [ai_use_linkedin, setAIUseLinkedin] = useState<boolean>(false);

  const [scoreLoading, setScoreLoading] = useState(false);

  const queryClient = useQueryClient();

  const onAddIndividualAIFilters = async (
    title: string,
    prompt: string,
    use_linkedin: boolean,
    relevancy: string
  ) => {
    const key = "aiind_" + title.toLowerCase().split(" ").join("_");
    const newIndividualAIFilters = [
      ...individual_ai_filters,
      {
        key: key,
        title: title,
        prompt: prompt,
        use_linkedin: use_linkedin,
        relevancy: relevancy,
      },
    ];
    let newDealbreaker = [...dealbreakers];
    let newIndividualAIPersonalizer = [...individual_personalizers];

    setIndividualAIFilters(newIndividualAIFilters);

    if (ai_dealbreaker) {
      newDealbreaker = [...dealbreakers, key];
      setDealBreakers([...dealbreakers, key]);
    }
    if (ai_personalizer) {
      newIndividualAIPersonalizer = [...individual_personalizers, key];
      setIndividualPersonalizers([...individual_personalizers, key]);
    }

    setAITitle("");
    setAIPrompt("");
    setAIDealbreaker(false);
    setAIPersonalizer(false);

    await addAIFilter(
      company_ai_filters,
      newIndividualAIFilters,
      newDealbreaker,
      company_personalizers,
      newIndividualAIPersonalizer
    );
  };

  const onAddCompanyAIFilters = async (
    title: string,
    prompt: string,
    use_linkedin: boolean,
    relevancy: string
  ) => {
    const key = "aicomp_" + title.toLowerCase().split(" ").join("_");
    const newCompanyAIFilters = [
      ...company_ai_filters,
      {
        key: key,
        title: title,
        prompt: prompt,
        use_linkedin: use_linkedin,
        relevancy: relevancy,
      },
    ];

    let newDealbreaker = [...dealbreakers];
    let newCompanyAIPersonalizer = [...company_personalizers];

    setCompanyAIFilters(newCompanyAIFilters);

    if (ai_dealbreaker) {
      newDealbreaker = [...dealbreakers, key];
      setDealBreakers([...dealbreakers, key]);
    }
    if (ai_personalizer) {
      newCompanyAIPersonalizer = [...company_personalizers, key];
      setCompanyPersonalizers([...company_personalizers, key]);
    }

    setAITitle("");
    setAIPrompt("");
    setAIRelevancy("");
    setAIDealbreaker(false);
    setAIPersonalizer(false);

    await addAIFilter(
      newCompanyAIFilters,
      individual_ai_filters,
      newDealbreaker,
      newCompanyAIPersonalizer,
      individual_personalizers
    );
  };

  const titleOptions = [
    ...new Set(prospects.map((x) => (x.title ? x.title : ""))),
  ].filter((x) => x);
  const industryOptions = [...new Set(prospects.map((x) => x.industry))].filter(
    (x) => x
  );
  const companyOptions = [...new Set(prospects.map((x) => x.company))].filter(
    (x) => x
  );

  const fetchSavedQueries = async () => {
    try {
      const response = await fetch(`${API_URL}/apollo/get_all_saved_queries`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
      });
      const data = await response.json();
      if (data.status === "success") {
        const formattedPrefilters = data.data.map((query: any) => ({
          title: query.custom_name,
          id: query.id,
          prospects: query.num_results,
          status: true, // Assuming all fetched queries are active by default
        }));
        setPrefilters(formattedPrefilters);
      } else {
        console.error("Failed to fetch saved queries:", data);
      }
    } catch (error) {
      console.error("Error fetching saved queries:", error);
    }
  };

  const mergeSavedQueries = async (saved_query_id: number) => {
    setScoreLoading(true);
    if (saved_query_id !== undefined) {
      try {
        const response = await fetch(
          `${API_URL}/apollo/get_saved_query/${saved_query_id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${userToken}`,
            },
          }
        );
        const data = await response.json();
        if (data.status === "success") {
          const queryDetails = data.data;

          const updateState = (
            setter: {
              (value: React.SetStateAction<string[]>): void;
              (value: React.SetStateAction<string[]>): void;
              (value: React.SetStateAction<string[]>): void;
              (value: React.SetStateAction<string[]>): void;
              (value: React.SetStateAction<string[]>): void;
              (value: React.SetStateAction<string[]>): void;
              (arg0: (prevState: any) => any[]): void;
            },
            value: any
          ) => {
            setter((prevState) =>
              Array.from(new Set([...prevState, ...value]))
            );
          };

          updateState(
            setIncludedIndividualTitleKeywords,
            queryDetails.data.person_titles || []
          );
          updateState(
            setIncludedIndividualSeniorityKeywords,
            queryDetails.data.person_seniorities || []
          );
          updateState(
            setExcludedIndividualTitleKeywords,
            queryDetails.data.person_not_titles || []
          );

          const industryBreadcrumbs = queryDetails.results.breadcrumbs.filter(
            (breadcrumb: any) => breadcrumb.label === "Industry"
          );
          if (industryBreadcrumbs.length > 0) {
            const industryNames = industryBreadcrumbs.map(
              (breadcrumb: any) => breadcrumb.display_name
            );
            const industryIds = industryBreadcrumbs.reduce(
              (acc: any, breadcrumb: any) => {
                acc[breadcrumb.display_name] = breadcrumb.value;
                return acc;
              },
              {}
            );

            updateState(setIncludedCompanyIndustriesKeywords, industryNames);
            // updateState(setIndustryOptions, industryNames);
            //   setIndustryOptionsWithIds((prevOptions: any) => ({
            //     ...prevOptions,
            //     ...industryIds,
            //   }));
            // } else {
            updateState(
              setIncludedCompanyIndustriesKeywords,
              queryDetails.data.organization_industry_tag_ids || []
            );
          }

          // setRevenue((prev) => ({
          //   min: queryDetails.data.revenue_range?.min
          //     ? String(queryDetails.data.revenue_range.min)
          //     : prev.min,
          //   max: queryDetails.data.revenue_range?.max
          //     ? String(queryDetails.data.revenue_range.max)
          //     : prev.max,
          // }));

          // setCompanyName((prev) => queryDetails.data.q_person_title || prev);
          setIncludedCompanyNameKeywords(
            (prev) => queryDetails.data.q_organization_keyword_tags || prev
          );

          const companyBreadcrumbs = queryDetails.results.breadcrumbs.filter(
            (breadcrumb: any) => breadcrumb.label === "Companies"
          );
          // if (companyBreadcrumbs.length > 0) {
          //   const companyNames = companyBreadcrumbs.map(
          //     (breadcrumb: any) => breadcrumb.value
          //   );
          //   const companyOptions = companyBreadcrumbs.map(
          //     (breadcrumb: any) => ({
          //       label: breadcrumb.display_name,
          //       value: breadcrumb.value,
          //       logo_url: breadcrumb.logo_url || "",
          //     })
          //   );

          //   updateState(setSelectedCompanies, companyNames);
          //   updateState(setCompanyOptions, companyOptions);
          // } else {
          //   updateState(setSelectedCompanies, queryDetails.data.organization_ids || []);
          // }

          updateState(
            setIncludedIndividualLocationsKeywords,
            queryDetails.data.person_locations || []
          );
          // setExperience((prev) => queryDetails.data.person_seniorities || prev);
          // updateState(setFundraise, queryDetails.data.organization_latest_funding_stage_cd || []);
          // setCompanyDomain((prev) => queryDetails.data.q_organization_search_list_id || prev);
          // setAiPrompt((prev) => prev); // Assuming no change needed
          // updateState(setSelectedNumEmployees, queryDetails.data.organization_num_employees_ranges || []);

          const technologyBreadcrumbs = queryDetails.results.breadcrumbs.filter(
            (breadcrumb: any) => breadcrumb.label === "Use at least one of"
          );
          if (technologyBreadcrumbs.length > 0) {
            const technologyNames = technologyBreadcrumbs.map(
              (breadcrumb: any) => breadcrumb.display_name
            );
            const technologyUids = technologyBreadcrumbs.reduce(
              (acc: any, breadcrumb: any) => {
                acc[breadcrumb.display_name] = breadcrumb.value;
                return acc;
              },
              {}
            );

            // updateState(setTechnology, technologyNames);
            // updateState(setTechnologyOptions, technologyNames);
            // setTechnologyOptionsWithUids((prevOptions: any) => ({
            //   ...prevOptions,
            //   ...technologyUids,
            // }));
          } else {
            // updateState(setTechnology, queryDetails.data.currently_using_any_of_technology_uids || []);
          }

          // updateState(setEventTypes, queryDetails.data.event_categories || []);
          // setDays((prev) =>
          //   queryDetails.data.published_at_date_range
          //     ? parseInt(
          //         queryDetails.data.published_at_date_range.min.replace(
          //           "_days_ago",
          //           ""
          //         ),
          //         10
          //       )
          //     : prev
          // );
          // setRecentNews((prev) => queryDetails.data.q_organization_keyword_tags || prev);
          // setDepartmentMinCount(
          //   (prev) =>
          //     queryDetails.data.organization_department_or_subdepartment_counts
          //       ?.min || prev
          // );
          // setDepartmentMaxCount(
          //   (prev) =>
          //     queryDetails.data.organization_department_or_subdepartment_counts
          //       ?.max || prev
          // );

          // setTotalFound((prev) => prev + (queryDetails.results.pagination.total_entries > 100 ? queryDetails.results.pagination.total_entries : queryDetails.results.people.length) || 0);
          // setProspects([]);
        } else {
          console.error("Failed to fetch saved query:", data);
        }
      } catch (error) {
        console.error("Error fetching saved query:", error);
      }
    }
    setScoreLoading(false);
  };

  const handleApply = async () => {
    if (!selectedFilter) return;
    // innerProps.id = Number(selectedFilter);
    // setShowApplyButton(false);
    // setCurrentSavedQueryId(
    //   prefilters.find((prefilter) => prefilter.id === Number(selectedFilter))
    //     ?.id
    // );
  };

  const addAIFilter = async (
    companyAIFilters: AIFilters[],
    individualAIFilters: AIFilters[],
    dealbreakers: string[],
    companyPersonalizers: string[],
    individualPersonalizers: string[]
  ) => {
    const response = await fetch(`${API_URL}/icp_scoring/add_ai_filter`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        archetype_id: archetype_id,
        individual_personalizers: individualPersonalizers,
        company_personalizers: companyPersonalizers,
        dealbreakers: dealbreakers,
        individual_ai_filters: individualAIFilters,
        company_ai_filters: companyAIFilters,
      }),
    });

    if (response.status === 200) {
      await queryClient.invalidateQueries(["archetypeProspects", archetype_id]);
      await queryClient.invalidateQueries(["icpScoringRuleset", archetype_id]);
      setScoreLoading(false);
      showNotification({
        title: "Success",
        message: "Successfully added AI Filter to the ICP ruleset.",
        color: "blue",
      });

      await queryClient.invalidateQueries([
        `query-get-research-point-types`,
        archetype_id,
      ]);
    } else {
      setScoreLoading(false);
      showNotification({
        title: "Error",
        message: "Failed to add AI filters to the ICP ruleset",
        color: "red",
      });
    }
  };

  const scoreCampaignFilters = async () => {
    setScoreLoading(true);

    if (selectedContacts.size !== 0) {
      setProgrammaticUpdates(new Set(selectedContacts));
      setIsScoring(selectedContacts.size);
    } else {
      setProgrammaticUpdates(new Set(prospects.map((p) => p.id)));
      setIsScoring(prospects.length);
    }

    const response = await fetch(
      `${API_URL}/client/archetype/${archetype_id}/score`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          included_individual_title_keywords,
          excluded_individual_title_keywords,
          included_individual_industry_keywords,
          excluded_individual_industry_keywords,
          individual_years_of_experience_start:
            individual_years_of_experience_end
              ? individual_years_of_experience_start ?? 0
              : individual_years_of_experience_start ?? null,
          individual_years_of_experience_end:
            individual_years_of_experience_start
              ? individual_years_of_experience_end ?? 100
              : individual_years_of_experience_end ?? null,
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
          company_size_start: company_size_end
            ? company_size_start ?? 0
            : company_size_start ?? null,
          company_size_end: company_size_start
            ? company_size_end ?? 1000000
            : company_size_end ?? null,
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
          score_ai: scoreAI,
        }),
      }
    );

    if (response.status === 200) {
      const data = await response.json();

      await queryClient.invalidateQueries(["archetypeProspects", archetype_id]);
      await queryClient.invalidateQueries(["icpScoringRuleset", archetype_id]);
      setScoreLoading(false);
      showNotification({
        title: "Success",
        message:
          "Successfully scored the Campaign Prospects with the ICP ruleset. AI Filters will take a while to show up.",
        color: "blue",
      });

      await queryClient.invalidateQueries([
        `query-get-research-point-types`,
        archetype_id,
      ]);
    } else {
      setScoreLoading(false);
      showNotification({
        title: "Error",
        message: "Failed to score the Campaign Prospects with the ICP ruleset",
        color: "red",
      });
    }
  };

  return (
    <Flex
      direction={"column"}
      gap={"16px"}
      style={{ minWidth: "300px", maxWidth: "300px", padding: "4px" }}
    >
      <Title size={"h4"} color={"purple"}>
        <Flex gap={"4px"} justify={"space-between"} align={"center"}>
          <Text>Filter Contacts</Text>
          <ActionIcon onClick={() => setCollapseFilters(true)}>
            <IconChevronLeft />
          </ActionIcon>
        </Flex>
      </Title>
      <Box
        style={{
          display: "flex",
          gap: "1rem",
          flexDirection: "column",
          maxWidth: "300px",
          minWidth: "300px",
          marginRight: "4px",
        }}
      >
        <Flex
          style={{ maxWidth: "300px", minWidth: "300px" }}
          gap={"4px"}
          align={"center"}
        >
          <Button
            color={"red"}
            size={"md"}
            style={{ width: "65%" }}
            onClick={() => scoreCampaignFilters()}
            disabled={scoreLoading}
          >
            {scoreLoading ? (
              <Loader />
            ) : (
              `Score (${
                selectedContacts.size !== 0
                  ? selectedContacts.size
                  : prospects.length
              })`
            )}
          </Button>
          <Switch
            onLabel={"with AI"}
            size={"lg"}
            offLabel={"without AI"}
            checked={scoreAI}
            onChange={(e) => setScoreAI(e.currentTarget.checked)}
          />
        </Flex>
        {isScoring && isScoring > 0 ? (
          <Progress
            color={"grape"}
            value={((isScoring - programmaticUpdates.size) / isScoring) * 100}
            label={"testing"}
          />
        ) : (
          <></>
        )}
        <ScrollArea h={600} m={0}>
          <Accordion defaultValue="individual">
            <Accordion.Item value="ai_filter">
              <Accordion.Control
                icon={<IconSparkles fill={"black"} size={"1.3rem"} />}
              >
                AI Filter
              </Accordion.Control>
              <Accordion.Panel>
                <Flex direction={"column"} gap={"4px"}>
                  <Flex justify={"space-between"} align={"center"}>
                    <Text fz="md">Add AI Filters</Text>
                  </Flex>
                  <TextInput
                    placeholder="Enter Title"
                    value={ai_title}
                    label="Title"
                    description="This will be the title that is displayed as a column"
                    withAsterisk
                    onChange={(event) => setAITitle(event.currentTarget.value)}
                  />
                  <Textarea
                    placeholder="Enter AI prompt here. A question to score your list. You must include only either [[prospect]] or [[company]] into your list."
                    value={ai_prompt}
                    label="AI Filter"
                    withAsterisk
                    minRows={8}
                    maxRows={8}
                    onChange={(event) => setAIPrompt(event.currentTarget.value)}
                  />
                  <Textarea
                    placeholder="Enter Relevancy here."
                    value={ai_relevancy}
                    label="Relevancy"
                    withAsterisk
                    minRows={8}
                    maxRows={8}
                    onChange={(event) =>
                      setAIRelevancy(event.currentTarget.value)
                    }
                  />
                  <Checkbox
                    label="Is Dealbreaker"
                    checked={ai_dealbreaker}
                    onChange={(event) =>
                      setAIDealbreaker(event.currentTarget.checked)
                    }
                  />
                  <Checkbox
                    label="Personalizer"
                    checked={ai_personalizer}
                    onChange={(event) =>
                      setAIPersonalizer(event.currentTarget.checked)
                    }
                  />
                  <Switch
                    onLabel="Use Linkedin"
                    offLabel="Use Search"
                    size={"lg"}
                    onChange={(event) =>
                      setAIUseLinkedin(event.currentTarget.checked)
                    }
                  />
                  <Button
                    disabled={
                      !ai_title ||
                      !ai_prompt ||
                      (!ai_prompt.includes("[[prospect]]") &&
                        !ai_prompt.includes("[[company]]")) ||
                      !ai_relevancy
                    }
                    onClick={async () => {
                      const key =
                        "aiind_" + ai_title.toLowerCase().split(" ").join("_");

                      setHeaderSet((prevState) => new Set([...prevState, key]));
                      setContactTableHeaders((prevState) => {
                        const set = new Set([
                          ...prevState,
                          { key: key, title: ai_title },
                        ]);
                        return [...set];
                      });

                      if (ai_prompt.includes("[[prospect]]")) {
                        await onAddIndividualAIFilters(
                          ai_title,
                          ai_prompt,
                          ai_use_linkedin,
                          ai_relevancy
                        );
                      } else {
                        await onAddCompanyAIFilters(
                          ai_title,
                          ai_prompt,
                          ai_use_linkedin,
                          ai_relevancy
                        );
                      }
                    }}
                  >
                    Add AI Filter
                  </Button>
                </Flex>
                <Accordion
                  styles={{ content: { padding: "2px" } }}
                  variant={"filled"}
                >
                  <Accordion.Item value="custom_filter">
                    <Accordion.Control className="p-0">
                      Added AI Filters
                    </Accordion.Control>
                    <Accordion.Panel>
                      {individual_ai_filters.map((aiFilter, index) => {
                        return (
                          <Paper
                            key={index}
                            withBorder
                            radius={"sm"}
                            p={"sm"}
                            mt={"xs"}
                          >
                            <Flex
                              direction={"column"}
                              gap="4px"
                              align={"center"}
                            >
                              <Flex
                                style={{ minWidth: "100%" }}
                                justify={"space-between"}
                                align="center"
                              >
                                <Badge variant={"filled"} color={"grape"}>
                                  Individual
                                </Badge>
                                <ActionIcon
                                  onClick={async () => {
                                    let newIndividualAIFilters: AIFilters[] =
                                      [];
                                    let newDealbreaker: string[] = [];
                                    let newIndividualAIPersonalizer: string[] =
                                      [];

                                    setHeaderSet((prevState) => {
                                      prevState.delete(aiFilter.key);
                                      return new Set([...prevState]);
                                    });
                                    setContactTableHeaders((prevState) =>
                                      prevState.filter(
                                        (item) => item.key !== aiFilter.key
                                      )
                                    );
                                    setDealBreakers((prevState) => {
                                      newDealbreaker = prevState.filter(
                                        (x) => x !== aiFilter.key
                                      );
                                      return prevState.filter(
                                        (x) => x !== aiFilter.key
                                      );
                                    });
                                    setIndividualPersonalizers((prevState) => {
                                      newIndividualAIPersonalizer =
                                        prevState.filter(
                                          (x) => x !== aiFilter.key
                                        );
                                      return prevState.filter(
                                        (x) => x !== aiFilter.key
                                      );
                                    });
                                    setIndividualAIFilters((prevState) => {
                                      newIndividualAIFilters = prevState.filter(
                                        (item) => item.key !== aiFilter.key
                                      );
                                      return prevState.filter(
                                        (item) => item.key !== aiFilter.key
                                      );
                                    });

                                    await addAIFilter(
                                      company_ai_filters,
                                      newIndividualAIFilters,
                                      newDealbreaker,
                                      company_personalizers,
                                      newIndividualAIPersonalizer
                                    );
                                  }}
                                >
                                  <IconTrash color={"red"} size={"1rem"} />
                                </ActionIcon>
                              </Flex>

                              <Text fw={600} size={"md"} mt={4}>
                                {aiFilter.title}
                              </Text>
                              <Textarea
                                fw={500}
                                label={"prompt"}
                                value={aiFilter.prompt}
                                onChange={(event) => {
                                  setIndividualAIFilters((prevState) => {
                                    return prevState.map((previousAI) => {
                                      if (previousAI.key === aiFilter.key) {
                                        return {
                                          ...aiFilter,
                                          prompt: event.currentTarget.value,
                                        };
                                      }

                                      return previousAI;
                                    });
                                  });
                                }}
                                autosize
                                minRows={4}
                                maxRows={8}
                              >
                                {aiFilter.prompt}
                              </Textarea>
                              <Textarea
                                fw={500}
                                label={"relevancy"}
                                value={aiFilter.relevancy}
                                onChange={(event) => {
                                  setIndividualAIFilters((prevState) => {
                                    return prevState.map((previousAI) => {
                                      if (previousAI.key === aiFilter.key) {
                                        return {
                                          ...aiFilter,
                                          relevancy: event.currentTarget.value,
                                        };
                                      }

                                      return previousAI;
                                    });
                                  });
                                }}
                                autosize
                                minRows={4}
                                maxRows={8}
                              >
                                {aiFilter.relevancy}
                              </Textarea>
                              <Flex
                                direction={"column"}
                                justify={"start"}
                                align={"start"}
                                gap={"4px"}
                              >
                                <Checkbox
                                  checked={dealbreakers.includes(aiFilter.key)}
                                  onChange={(event) => {
                                    setUpdatedIndividualColumns(
                                      (prevState) =>
                                        new Set([...prevState, aiFilter.key])
                                    );

                                    if (event.currentTarget.checked) {
                                      setDealBreakers([
                                        ...dealbreakers,
                                        aiFilter.key,
                                      ]);
                                    } else {
                                      setDealBreakers(
                                        dealbreakers.filter(
                                          (x) => x !== aiFilter.key
                                        )
                                      );
                                    }
                                  }}
                                  label={"Dealbreaker"}
                                  size={"xs"}
                                />
                                <Checkbox
                                  checked={individual_personalizers.includes(
                                    aiFilter.key
                                  )}
                                  onChange={(event) => {
                                    if (event.currentTarget.checked) {
                                      setIndividualPersonalizers([
                                        ...individual_personalizers,
                                        aiFilter.key,
                                      ]);
                                    } else {
                                      setIndividualPersonalizers(
                                        individual_personalizers.filter(
                                          (x) => x !== aiFilter.key
                                        )
                                      );
                                    }
                                  }}
                                  label={"Personalizer"}
                                  size={"xs"}
                                />
                              </Flex>
                            </Flex>
                          </Paper>
                        );
                      })}
                      {company_ai_filters.map((aiFilter, index) => {
                        return (
                          <Paper
                            key={index}
                            withBorder
                            radius={"sm"}
                            p={"sm"}
                            mt={"xs"}
                          >
                            <Flex
                              direction={"column"}
                              gap="4px"
                              align={"center"}
                            >
                              <Flex justify={"space-between"} align="center">
                                <Badge variant={"filled"} color={"blue"}>
                                  Company
                                </Badge>
                                <ActionIcon
                                  onClick={async () => {
                                    let newCompanyAIFilters: AIFilters[] = [];
                                    let newDealbreaker: string[] = [];
                                    let newCompanyAIPersonalizer: string[] = [];

                                    setHeaderSet((prevState) => {
                                      prevState.delete(aiFilter.key);
                                      return new Set([...prevState]);
                                    });
                                    setContactTableHeaders((prevState) =>
                                      prevState.filter(
                                        (item) => item.key !== aiFilter.key
                                      )
                                    );
                                    setDealBreakers((prevState) => {
                                      newDealbreaker = prevState.filter(
                                        (x) => x !== aiFilter.key
                                      );
                                      return prevState.filter(
                                        (x) => x !== aiFilter.key
                                      );
                                    });
                                    setCompanyPersonalizers((prevState) => {
                                      newCompanyAIPersonalizer =
                                        prevState.filter(
                                          (x) => x !== aiFilter.key
                                        );
                                      return prevState.filter(
                                        (x) => x !== aiFilter.key
                                      );
                                    });
                                    setCompanyAIFilters((prevState) => {
                                      newCompanyAIFilters = prevState.filter(
                                        (item) => item.key !== aiFilter.key
                                      );

                                      return prevState.filter(
                                        (item) => item.key !== aiFilter.key
                                      );
                                    });

                                    await addAIFilter(
                                      newCompanyAIFilters,
                                      individual_ai_filters,
                                      newDealbreaker,
                                      newCompanyAIPersonalizer,
                                      individual_personalizers
                                    );
                                  }}
                                >
                                  <IconTrash color={"red"} size={"1rem"} />
                                </ActionIcon>
                              </Flex>

                              <Text fw={600} size={"md"} mt={4}>
                                {aiFilter.title}
                              </Text>
                              <Textarea
                                fw={500}
                                value={aiFilter.prompt}
                                onChange={(event) => {
                                  setCompanyAIFilters((prevState) => {
                                    return prevState.map((previousAI) => {
                                      if (previousAI.key === aiFilter.key) {
                                        return {
                                          ...aiFilter,
                                          prompt: event.currentTarget.value,
                                        };
                                      }

                                      return previousAI;
                                    });
                                  });
                                }}
                                autosize
                                minRows={4}
                                maxRows={8}
                              >
                                {aiFilter.prompt}
                              </Textarea>
                              <Textarea
                                fw={500}
                                value={aiFilter.relevancy}
                                onChange={(event) => {
                                  setCompanyAIFilters((prevState) => {
                                    return prevState.map((previousAI) => {
                                      if (previousAI.key === aiFilter.key) {
                                        return {
                                          ...aiFilter,
                                          relevancy: event.currentTarget.value,
                                        };
                                      }

                                      return previousAI;
                                    });
                                  });
                                }}
                                autosize
                                minRows={4}
                                maxRows={8}
                              >
                                {aiFilter.relevancy}
                              </Textarea>
                              <Flex
                                direction={"column"}
                                justify={"start"}
                                align={"start"}
                                gap={"4px"}
                              >
                                <Checkbox
                                  checked={dealbreakers.includes(aiFilter.key)}
                                  onChange={(event) => {
                                    setUpdatedIndividualColumns(
                                      (prevState) =>
                                        new Set([...prevState, aiFilter.key])
                                    );

                                    if (event.currentTarget.checked) {
                                      setDealBreakers([
                                        ...dealbreakers,
                                        aiFilter.key,
                                      ]);
                                    } else {
                                      setDealBreakers(
                                        dealbreakers.filter(
                                          (x) => x !== aiFilter.key
                                        )
                                      );
                                    }
                                  }}
                                  label={"Dealbreaker"}
                                  size={"xs"}
                                  mb={"4px"}
                                />
                                <Checkbox
                                  checked={company_personalizers.includes(
                                    aiFilter.key
                                  )}
                                  onChange={(event) => {
                                    if (event.currentTarget.checked) {
                                      setCompanyPersonalizers([
                                        ...company_personalizers,
                                        aiFilter.key,
                                      ]);
                                    } else {
                                      setCompanyPersonalizers(
                                        company_personalizers.filter(
                                          (x) => x !== aiFilter.key
                                        )
                                      );
                                    }
                                  }}
                                  label={"Personalizer"}
                                  size={"xs"}
                                  mb={"4px"}
                                />
                              </Flex>
                            </Flex>
                          </Paper>
                        );
                      })}
                    </Accordion.Panel>
                  </Accordion.Item>
                </Accordion>
              </Accordion.Panel>
            </Accordion.Item>
            <Accordion.Item value="individual">
              <Accordion.Control
                icon={<IconUser fill={"black"} size={"1.3rem"} />}
              >
                Individual{" "}
                <Badge ml="sm" color="gray">
                  {included_individual_title_keywords.length +
                    excluded_individual_title_keywords.length +
                    included_individual_seniority_keywords.length +
                    excluded_individual_seniority_keywords.length +
                    included_individual_industry_keywords.length +
                    excluded_individual_industry_keywords.length +
                    included_individual_skills_keywords.length +
                    excluded_individual_skills_keywords.length +
                    included_individual_locations_keywords.length +
                    excluded_individual_locations_keywords.length +
                    included_individual_generalized_keywords.length +
                    included_individual_education_keywords.length +
                    excluded_individual_education_keywords.length +
                    excluded_individual_generalized_keywords.length}
                </Badge>
              </Accordion.Control>
              <Accordion.Panel>
                <Flex direction={"column"} gap={"4px"}>
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

                        setIncludedIndividualTitleKeywords(valueArray);
                      }}
                      setDataSegment={(value) => {
                        const valueArray = value as string[];

                        setUpdatedIndividualColumns(
                          (prevState) =>
                            new Set([
                              ...prevState,
                              "included_individual_title_keywords",
                            ])
                        );

                        setIncludedIndividualTitleKeywords(valueArray);
                      }}
                      // setValue={setIncludedIndividualTitleKeywords}
                      data={included_individual_title_keywords.concat(
                        titleOptions
                      )}
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
                      data={excluded_individual_title_keywords.concat(
                        titleOptions
                      )}
                      // setData={setExcludedIndividualTitleKeywords}
                      setValueSegment={(value) => {
                        const valueArray = value as string[];

                        setExcludedIndividualTitleKeywords(valueArray);
                      }}
                      setDataSegment={(value) => {
                        const valueArray = value as string[];

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

                        setIncludedIndividualSeniorityKeywords(valueArray);
                      }}
                      setDataSegment={(value) => {
                        const valueArray = value as string[];

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

                        setExcludedIndividualSeniorityKeywords(valueArray);
                      }}
                      setDataSegment={(value) => {
                        const valueArray = value as string[];

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

                        setIncludedIndividualIndustryKeywords(valueArray);
                      }}
                      setDataSegment={(value) => {
                        const valueArray = value as string[];

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

                        setExcludedIndividualIndustryKeywords(valueArray);
                      }}
                      setDataSegment={(value) => {
                        const valueArray = value as string[];

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

                        setIncludedIndividualSkillsKeywords(valueArray);
                      }}
                      setDataSegment={(value) => {
                        const valueArray = value as string[];

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

                        setExcludedIndividualSkillsKeywords(valueArray);
                      }}
                      setValueSegment={(value) => {
                        const valueArray = value as string[];

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

                        setIncludedIndividualLocationsKeywords(valueArray);
                      }}
                      setDataSegment={(value) => {
                        const valueArray = value as string[];

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

                        setExcludedIndividualLocationsKeywords(valueArray);
                      }}
                      setDataSegment={(value) => {
                        const valueArray = value as string[];

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

                        setIncludedIndividualGeneralizedKeywords(valueArray);
                      }}
                      setDataSegment={(value) => {
                        const valueArray = value as string[];

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

                        setExcludedIndividualGeneralizedKeywords(valueArray);
                      }}
                      setDataSegment={(value) => {
                        const valueArray = value as string[];

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

                        setIncludedIndividualEducationKeywords(valueArray);
                      }}
                      setDataSegment={(value) => {
                        const valueArray = value as string[];

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

                        setExcludedIndividualEducationKeywords(valueArray);
                      }}
                      setDataSegment={(value) => {
                        const valueArray = value as string[];

                        setExcludedIndividualEducationKeywords(valueArray);
                      }}
                    />
                  </ItemCollapse>
                </Flex>
              </Accordion.Panel>
            </Accordion.Item>
            <Accordion.Item value="company">
              <Accordion.Control
                icon={<IconUsers fill={"black"} size={"1.3rem"} />}
              >
                Company
                <Badge ml="sm" color="gray">
                  {included_company_name_keywords.length +
                    excluded_company_name_keywords.length +
                    included_company_locations_keywords.length +
                    excluded_company_locations_keywords.length +
                    included_company_industries_keywords.length +
                    excluded_company_industries_keywords.length +
                    included_company_generalized_keywords.length +
                    excluded_company_generalized_keywords.length}
                </Badge>
              </Accordion.Control>
              <Accordion.Panel>
                <Flex direction={"column"} gap={"4px"}>
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
                      data={included_company_name_keywords.concat(
                        companyOptions
                      )}
                      // setData={setIncludedCompanyNameKeywords}
                      setValueSegment={(value) => {
                        const valueArray = value as string[];

                        setIncludedCompanyNameKeywords(valueArray);
                      }}
                      setDataSegment={(value) => {
                        const valueArray = value as string[];

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
                      data={excluded_company_name_keywords.concat(
                        companyOptions
                      )}
                      // setData={setExcludedCompanyNameKeywords}
                      setValueSegment={(value) => {
                        const valueArray = value as string[];

                        setExcludedCompanyNameKeywords(valueArray);
                      }}
                      setDataSegment={(value) => {
                        const valueArray = value as string[];

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

                        setIncludedCompanyLocationsKeywords(valueArray);
                      }}
                      setDataSegment={(value) => {
                        const valueArray = value as string[];

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

                        setExcludedCompanyLocationsKeywords(valueArray);
                      }}
                      setDataSegment={(value) => {
                        const valueArray = value as string[];

                        setExcludedCompanyLocationsKeywords(valueArray);
                      }}
                    />
                  </ItemCollapse>
                  {/* <ItemCollapse */}
                  {/*   title="Employee Count" */}
                  {/*   numberOfItem={ */}
                  {/*     company_size_start && company_size_end ? 1 : 0 */}
                  {/*   } */}
                  {/* > */}
                  {/*   <Flex direction="column" maw={"30vw"} gap={"4px"}> */}
                  {/*     <Box */}
                  {/*       style={{ */}
                  {/*         display: "flex", */}
                  {/*         justifyContent: "space-between", */}
                  {/*         gap: "1rem", */}
                  {/*         alignItems: "center", */}
                  {/*         marginTop: "0.2rem", */}
                  {/*       }} */}
                  {/*     > */}
                  {/*       <NumberInput */}
                  {/*         value={company_size_start ?? ""} */}
                  {/*         placeholder="Min" */}
                  {/*         label={"Min"} */}
                  {/*         hideControls */}
                  {/*         onChange={(value) => { */}
                  {/*           if (value === "") { */}
                  {/*             setCompanySizeStart(null); */}
                  {/*           } else { */}
                  {/*             setCompanySizeStart(+value); */}
                  {/*           } */}
                  {/*         }} */}
                  {/*       /> */}
                  {/*       <NumberInput */}
                  {/*         value={company_size_end ?? ""} */}
                  {/*         placeholder="Max" */}
                  {/*         label={"Max"} */}
                  {/*         hideControls */}
                  {/*         onChange={(value) => { */}
                  {/*           if (value === "") { */}
                  {/*             setCompanySizeEnd(null); */}
                  {/*           } else { */}
                  {/*             setCompanySizeEnd(+value); */}
                  {/*           } */}
                  {/*         }} */}
                  {/*       /> */}
                  {/*     </Box> */}
                  {/*     <Button */}
                  {/*       mt={"0.5rem"} */}
                  {/*       size="sm" */}
                  {/*       ml={"auto"} */}
                  {/*       onClick={() => setCompanySizeEnd(100_000)} */}
                  {/*     > */}
                  {/*       Max */}
                  {/*     </Button> */}
                  {/*   </Flex> */}
                  {/* </ItemCollapse> */}
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

                        setIncludedCompanyIndustriesKeywords(valueArray);
                      }}
                      setDataSegment={(value) => {
                        const valueArray = value as string[];

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

                        setExcludedCompanyIndustriesKeywords(valueArray);
                      }}
                      setDataSegment={(value) => {
                        const valueArray = value as string[];

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

                        setIncludedCompanyGeneralizedKeywords(valueArray);
                      }}
                      setDataSegment={(value) => {
                        const valueArray = value as string[];

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

                        setExcludedCompanyGeneralizedKeywords(valueArray);
                      }}
                      setDataSegment={(value) => {
                        const valueArray = value as string[];

                        setExcludedCompanyGeneralizedKeywords(valueArray);
                      }}
                    />
                  </ItemCollapse>
                </Flex>
              </Accordion.Panel>
            </Accordion.Item>
            <Accordion.Item value="saved_icp_filter">
              <Accordion.Control
                icon={<IconFilter fill={"black"} size={"1.3rem"} />}
              >
                Apply saved ICP filter
              </Accordion.Control>
              <Accordion.Panel>
                <Flex direction={"column"} gap={"4px"} w="500px">
                  <Select
                    w="100%"
                    label="Saved filters"
                    placeholder="Pick one"
                    data={prefilters.map((prefilter) => ({
                      value: prefilter.id,
                      label: prefilter.title,
                    }))}
                    value={selectedFilter}
                    onChange={(value) => {
                      setSelectedFilter(value);
                      const handleApply = async (value: any) => {
                        mergeSavedQueries(Number(value));
                        // if (!value) return;
                        // innerProps.id = Number(value);
                        // setShowApplyButton(false);
                        // setCurrentSavedQueryId(prefilters.find((prefilter) => prefilter.id === Number(value))?.id);
                      };
                      handleApply(value);
                      // setShowApplyButton(true);
                    }}
                    rightSection={
                      false && (
                        <Button
                          onClick={handleApply}
                          size="xs"
                          style={{ marginLeft: "-60px" }}
                        >
                          Apply
                        </Button>
                      )
                    }
                    style={{ width: "50%" }}
                  />
                </Flex>
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion>
        </ScrollArea>
      </Box>
    </Flex>
  );
};

export default CampaignFilters;
