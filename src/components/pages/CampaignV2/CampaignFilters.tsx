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
} from "@mantine/core";
import React, { useState } from "react";
import { useRecoilValue } from "recoil";
import { userTokenState } from "@atoms/userAtoms";
import { API_URL } from "@constants/data";
import { useQueryClient } from "@tanstack/react-query";
import { showNotification } from "@mantine/notifications";
import { IconSparkles } from "@tabler/icons-react";
import { IconTrash, IconUser, IconUsers } from "@tabler/icons";

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
}

const CampaignFilters = function({
  icp_scoring_ruleset,
  prospects,
  selectedContacts,
  archetype_id,
  setContactTableHeaders,
  setUpdatedIndividualColumns,
  setHeaderSet,
}: CampaignFiltersProps) {
  const userToken = useRecoilValue(userTokenState);
  const [viewMode, setViewMode] = useState<string | null>("CONTACT");
  const [viewIndividualAIFilters, setViewIndividualAIFilters] =
    useState<boolean>(true);

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

  const [individual_ai_title, setIndividualAITitle] = useState<string>("");
  const [individual_ai_prompt, setIndividualAIPrompt] = useState<string>("");
  const [individual_ai_dealbreaker, setIndividualAIDealbreaker] =
    useState<boolean>(false);
  const [individual_ai_personalizer, setIndividualAIPersonalizer] =
    useState<boolean>(false);
  const [individual_ai_use_linkedin, setIndividualAIUseLinkedin] =
    useState<boolean>(false);

  const [company_ai_title, setCompanyAITitle] = useState<string>("");
  const [company_ai_prompt, setCompanyAIPrompt] = useState<string>("");
  const [company_ai_dealbreaker, setCompanyAIDealbreaker] =
    useState<boolean>(false);
  const [company_ai_personalizer, setCompanyAIPersonalizer] =
    useState<boolean>(false);
  const [company_ai_use_linkedin, setCompanyAIUseLinkedin] =
    useState<boolean>(false);

  const [scoreLoading, setScoreLoading] = useState(false);

  const queryClient = useQueryClient();

  const onAddIndividualAIFilters = (
    title: string,
    prompt: string,
    use_linkedin: boolean
  ) => {
    const key = "aiind_" + title.toLowerCase().split(" ").join("_");
    setIndividualAIFilters([
      ...individual_ai_filters,
      { key: key, title: title, prompt: prompt, use_linkedin: use_linkedin },
    ]);

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
  };

  const onAddCompanyAIFilters = (
    title: string,
    prompt: string,
    use_linkedin: boolean
  ) => {
    const key = "aicomp_" + title.toLowerCase().split(" ").join("_");
    setCompanyAIFilters([
      ...company_ai_filters,
      { key: key, title: title, prompt: prompt, use_linkedin: use_linkedin },
    ]);

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
  const industryOptions = [...new Set(prospects.map((x) => x.industry))].filter(
    (x) => x
  );
  const companyOptions = [...new Set(prospects.map((x) => x.company))].filter(
    (x) => x
  );

  const scoreCampaignFilters = async () => {
    setScoreLoading(true);
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
        <Button
          color={"red"}
          size={"md"}
          onClick={() => scoreCampaignFilters()}
          disabled={scoreLoading}
        >
          {scoreLoading ? <Loader /> : `Score (${selectedContacts.size})`}
        </Button>
        <ScrollArea h={600} m={0}>
          <Accordion defaultValue="individual">
            <Accordion.Item value="ai_filter">
              <Accordion.Control
                icon={<IconSparkles fill={"black"} size={"1.3rem"} />}
              >
                AI Filter
              </Accordion.Control>
              <Accordion.Panel>
                {viewIndividualAIFilters ? (
                  <Flex direction={"column"} gap={"4px"}>
                    <Flex justify={"space-between"} align={"center"}>
                      <Text fz="md">Add AI Filters</Text>
                      <Switch
                        onLabel="Individual"
                        offLabel="Company"
                        checked={viewIndividualAIFilters}
                        onChange={(event) =>
                          setViewIndividualAIFilters(
                            event.currentTarget.checked
                          )
                        }
                        size={"lg"}
                      />
                    </Flex>
                    <TextInput
                      placeholder="Enter Title"
                      value={individual_ai_title}
                      label="Title"
                      description="This will be the title that is displayed as a column"
                      withAsterisk
                      onChange={(event) =>
                        setIndividualAITitle(event.currentTarget.value)
                      }
                    />
                    <Textarea
                      placeholder="Enter AI prompt here. A question to score your list."
                      value={individual_ai_prompt}
                      label="AI Filter"
                      withAsterisk
                      minRows={8}
                      maxRows={8}
                      onChange={(event) =>
                        setIndividualAIPrompt(event.currentTarget.value)
                      }
                    />
                    <Checkbox
                      label="Is Dealbreaker"
                      checked={individual_ai_dealbreaker}
                      onChange={(event) =>
                        setIndividualAIDealbreaker(event.currentTarget.checked)
                      }
                    />
                    <Checkbox
                      label="Personalizer"
                      checked={individual_ai_personalizer}
                      onChange={(event) =>
                        setIndividualAIPersonalizer(event.currentTarget.checked)
                      }
                    />
                    <Switch
                      onLabel="Use Linkedin"
                      offLabel="Use Search"
                      size={"lg"}
                      onChange={(event) =>
                        setIndividualAIUseLinkedin(event.currentTarget.checked)
                      }
                    />
                    <Button
                      disabled={!individual_ai_title || !individual_ai_prompt}
                      onClick={() => {
                        const key =
                          "aiind_" +
                          individual_ai_title
                            .toLowerCase()
                            .split(" ")
                            .join("_");

                        setHeaderSet(
                          (prevState) => new Set([...prevState, key])
                        );
                        setContactTableHeaders((prevState) => {
                          const set = new Set([
                            ...prevState,
                            { key: key, title: individual_ai_title },
                          ]);
                          return [...set];
                        });
                        onAddIndividualAIFilters(
                          individual_ai_title,
                          individual_ai_prompt,
                          individual_ai_use_linkedin
                        );
                      }}
                    >
                      Add AI Filter
                    </Button>
                  </Flex>
                ) : (
                  <Flex direction={"column"} gap={"4px"}>
                    <Flex justify={"space-between"} align={"center"}>
                      <Text fz="md">Add AI Filters</Text>
                      <Switch
                        onLabel="Individual"
                        offLabel="Company"
                        checked={viewIndividualAIFilters}
                        onChange={(event) =>
                          setViewIndividualAIFilters(
                            event.currentTarget.checked
                          )
                        }
                        size={"lg"}
                      />
                    </Flex>
                    <TextInput
                      placeholder="Enter Title"
                      value={company_ai_title}
                      label="Title"
                      description="This will be the title that is displayed as a column"
                      withAsterisk
                      onChange={(event) =>
                        setCompanyAITitle(event.currentTarget.value)
                      }
                    />
                    <Textarea
                      placeholder="Enter AI prompt here. A question to score your list."
                      value={company_ai_prompt}
                      label="AI Filter"
                      withAsterisk
                      minRows={8}
                      maxRows={8}
                      onChange={(event) =>
                        setCompanyAIPrompt(event.currentTarget.value)
                      }
                    />
                    <Checkbox
                      label="Is Dealbreaker"
                      checked={company_ai_dealbreaker}
                      onChange={(event) =>
                        setCompanyAIDealbreaker(event.currentTarget.checked)
                      }
                    />
                    <Checkbox
                      label="Personalizer"
                      checked={company_ai_personalizer}
                      onChange={(event) =>
                        setCompanyAIPersonalizer(event.currentTarget.checked)
                      }
                    />
                    <Switch
                      onLabel="Use Linkedin"
                      offLabel="Use Search"
                      size={"lg"}
                      onChange={(event) =>
                        setCompanyAIUseLinkedin(event.currentTarget.checked)
                      }
                    />
                    <Button
                      disabled={!company_ai_title || !company_ai_prompt}
                      onClick={() => {
                        const key =
                          "aicomp_" +
                          company_ai_title.toLowerCase().split(" ").join("_");

                        setHeaderSet(
                          (prevState) => new Set([...prevState, key])
                        );
                        setContactTableHeaders((prevState) => {
                          const set = new Set([
                            ...prevState,
                            { key: key, title: company_ai_title },
                          ]);
                          return [...set];
                        });
                        onAddCompanyAIFilters(
                          company_ai_title,
                          company_ai_prompt,
                          company_ai_use_linkedin
                        );
                      }}
                    >
                      Add AI Filter
                    </Button>
                  </Flex>
                )}

                <Accordion styles={{ content: { padding: "2px" } }} variant={"filled"}>
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
                                  onClick={() => {
                                    setHeaderSet((prevState) => {
                                      prevState.delete(aiFilter.key);
                                      return new Set([...prevState]);
                                    });
                                    setContactTableHeaders((prevState) =>
                                      prevState.filter(
                                        (item) => item.key !== aiFilter.key
                                      )
                                    );
                                    setDealBreakers((prevState) =>
                                      prevState.filter(
                                        (x) => x !== aiFilter.key
                                      )
                                    );
                                    setIndividualPersonalizers((prevState) =>
                                      prevState.filter(
                                        (x) => x !== aiFilter.key
                                      )
                                    );
                                    setIndividualAIFilters((prevState) =>
                                      prevState.filter(
                                        (item) => item.key !== aiFilter.key
                                      )
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
                                  onClick={() => {
                                    setHeaderSet((prevState) => {
                                      prevState.delete(aiFilter.key);
                                      return new Set([...prevState]);
                                    });
                                    setContactTableHeaders((prevState) =>
                                      prevState.filter(
                                        (item) => item.key !== aiFilter.key
                                      )
                                    );
                                    setDealBreakers((prevState) =>
                                      prevState.filter(
                                        (x) => x !== aiFilter.key
                                      )
                                    );
                                    setCompanyPersonalizers((prevState) =>
                                      prevState.filter(
                                        (x) => x !== aiFilter.key
                                      )
                                    );
                                    setCompanyAIFilters((prevState) =>
                                      prevState.filter(
                                        (item) => item.key !== aiFilter.key
                                      )
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
                Individual
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
          </Accordion>
        </ScrollArea>
      </Box>
    </Flex>
  );
};

export default CampaignFilters;
