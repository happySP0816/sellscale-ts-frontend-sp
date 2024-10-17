import React, { useState } from "react";
import {
  Paper,
  Center,
  SegmentedControl,
  Box,
  Select,
  Textarea,
  Text,
  TextInput,
  Button,
  Title,
  Flex,
  Checkbox,
  Switch,
  Loader,
} from "@mantine/core";

import { ContextModalProps } from "@mantine/modals"; // Assuming this is the correct import for openContextModal
import { useRecoilValue } from "recoil";
import { userTokenState } from "@atoms/userAtoms";
import {
  AIFilters,
  ICPScoringRuleset,
} from "@modals/ContactAccountFilterModal";
import { API_URL } from "@constants/data";
import { useQueryClient } from "@tanstack/react-query";
import { showNotification } from "@mantine/notifications";

function QuestionModal({
  innerProps,
  context,
  id,
}: ContextModalProps<{
  campaign_id: number;
  icp_scoring_ruleset_typed: ICPScoringRuleset;
}>) {
  const userToken = useRecoilValue(userTokenState);

  const [ai_title, setAITitle] = useState<string>("");
  const [ai_prompt, setAIPrompt] = useState<string>("");
  const [ai_relevancy, setAIRelevancy] = useState<string>("");
  const [ai_dealbreaker, setAIDealbreaker] = useState<boolean>(false);
  const [ai_personalizer, setAIPersonalizer] = useState<boolean>(false);
  const [ai_use_linkedin, setAIUseLinkedin] = useState<boolean>(false);

  const queryClient = useQueryClient();

  const [loading, setLoading] = useState<boolean>(false);

  const onAddIndividualAIFilters = async (
    title: string,
    prompt: string,
    use_linkedin: boolean,
    relevancy: string
  ) => {
    const key = "aiind_" + title.toLowerCase().split(" ").join("_");
    const newIndividualAIFilters = [
      ...(innerProps.icp_scoring_ruleset_typed.individual_ai_filters ?? []),
      {
        key: key,
        title: title,
        prompt: prompt,
        use_linkedin: use_linkedin,
        relevancy: relevancy,
      },
    ];
    let newDealbreaker = [
      ...(innerProps.icp_scoring_ruleset_typed.dealbreakers ?? []),
    ];
    let newIndividualAIPersonalizer = [
      ...innerProps.icp_scoring_ruleset_typed.individual_personalizers,
    ];

    if (ai_dealbreaker) {
      newDealbreaker = [
        ...(innerProps.icp_scoring_ruleset_typed.dealbreakers ?? []),
        key,
      ];
    }
    if (ai_personalizer) {
      newIndividualAIPersonalizer = [
        ...innerProps.icp_scoring_ruleset_typed.individual_personalizers,
        key,
      ];
    }

    setAITitle("");
    setAIPrompt("");
    setAIDealbreaker(false);
    setAIPersonalizer(false);

    await addAIFilter(
      innerProps.icp_scoring_ruleset_typed.company_ai_filters ?? [],
      newIndividualAIFilters,
      newDealbreaker,
      innerProps.icp_scoring_ruleset_typed.company_personalizers ?? [],
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
      ...(innerProps.icp_scoring_ruleset_typed.company_ai_filters ?? []),
      {
        key: key,
        title: title,
        prompt: prompt,
        use_linkedin: use_linkedin,
        relevancy: relevancy,
      },
    ];

    let newDealbreaker = [
      ...(innerProps.icp_scoring_ruleset_typed.dealbreakers ?? []),
    ];
    let newCompanyAIPersonalizer = [
      ...(innerProps.icp_scoring_ruleset_typed.company_personalizers ?? []),
    ];

    if (ai_dealbreaker) {
      newDealbreaker = [
        ...(innerProps.icp_scoring_ruleset_typed.dealbreakers ?? []),
        key,
      ];
    }
    if (ai_personalizer) {
      newCompanyAIPersonalizer = [
        ...(innerProps.icp_scoring_ruleset_typed.company_personalizers ?? []),
        key,
      ];
    }

    setAITitle("");
    setAIPrompt("");
    setAIRelevancy("");
    setAIDealbreaker(false);
    setAIPersonalizer(false);

    await addAIFilter(
      newCompanyAIFilters,
      innerProps.icp_scoring_ruleset_typed.individual_ai_filters ?? [],
      newDealbreaker,
      newCompanyAIPersonalizer,
      innerProps.icp_scoring_ruleset_typed.individual_personalizers ?? []
    );
  };

  const addAIFilter = async (
    companyAIFilters: AIFilters[],
    individualAIFilters: AIFilters[],
    dealbreakers: string[],
    companyPersonalizers: string[],
    individualPersonalizers: string[]
  ) => {
    setLoading(true);
    const response = await fetch(`${API_URL}/icp_scoring/add_ai_filter`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        archetype_id: innerProps.campaign_id,
        individual_personalizers: individualPersonalizers,
        company_personalizers: companyPersonalizers,
        dealbreakers: dealbreakers,
        individual_ai_filters: individualAIFilters,
        company_ai_filters: companyAIFilters,
      }),
    });

    if (response.status === 200) {
      await queryClient.invalidateQueries([
        "archetypeProspects",
        innerProps.campaign_id,
      ]);
      await queryClient.invalidateQueries([
        "icpScoringRuleset",
        innerProps.campaign_id,
      ]);
      showNotification({
        title: "Success",
        message: "Successfully added AI Filter to the ICP ruleset.",
        color: "blue",
      });

      await queryClient.invalidateQueries([
        `query-get-research-point-types`,
        innerProps.campaign_id,
      ]);
    } else {
      showNotification({
        title: "Error",
        message: "Failed to add AI filters to the ICP ruleset",
        color: "red",
      });
    }

    setLoading(false);
  };

  return (
    <Paper>
      <Flex direction={"column"} gap={"4px"}>
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
          onChange={(event) => setAIRelevancy(event.currentTarget.value)}
        />
        <Checkbox
          label="Is Dealbreaker"
          checked={ai_dealbreaker}
          onChange={(event) => setAIDealbreaker(event.currentTarget.checked)}
        />
        <Checkbox
          label="Personalizer"
          checked={ai_personalizer}
          onChange={(event) => setAIPersonalizer(event.currentTarget.checked)}
        />
        <Switch
          onLabel="Use Linkedin"
          offLabel="Use Search"
          size={"lg"}
          onChange={(event) => setAIUseLinkedin(event.currentTarget.checked)}
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
            const key = "aiind_" + ai_title.toLowerCase().split(" ").join("_");

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
          {loading ? <Loader /> : "Add AI Filter"}
        </Button>
      </Flex>
    </Paper>
  );
}

export default QuestionModal;
