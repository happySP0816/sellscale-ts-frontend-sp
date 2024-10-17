import {
  ActionIcon,
  Avatar,
  Badge,
  Box,
  Button,
  Checkbox,
  Divider,
  Title,
  Flex,
  Paper,
  ScrollArea,
  Select,
  Text,
  Textarea,
  Tooltip,
  Loader,
  Modal,
  Center,
  SegmentedControl,
  TextInput,
  Popover,
  LoadingOverlay,
  HoverCard,
} from "@mantine/core";
import { ContextModalProps, openContextModal } from "@mantine/modals";
import {
  IconBrandLinkedin,
  IconBuilding,
  IconBulb,
  IconEdit,
  IconEye,
  IconPlus,
  IconPoint,
  IconQuestionMark,
  IconSearch,
  IconTrash,
} from "@tabler/icons";
import {
  IconLayoutSidebarRightCollapseFilled,
  IconSparkles,
} from "@tabler/icons-react";
import { useRecoilState, useRecoilValue } from "recoil";
import { userDataState, userTokenState } from "@atoms/userAtoms";
import { fetchCampaignContacts } from "@utils/requests/campaignOverview";
import { modals } from "@mantine/modals";
import * as researchers from "@utils/requests/researchers";
import { useState, useEffect } from "react";
import { currentProjectState } from "@atoms/personaAtoms";
import { getFreshCurrentProject } from "@auth/core";
import { showNotification } from "@mantine/notifications";
import useGenerativeRequest from "@utils/requests/GenerativeRequest";
import {
  AIFilters,
  ICPScoringRuleset,
} from "@modals/ContactAccountFilterModal";
import { getResearchPoint } from "@utils/requests/getResearchPointTypes";
import { ResearchPoint } from "@common/sequence/LinkedInSequenceSection";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { API_URL } from "@constants/data";
import { Prospect } from "src";

export default function CampaignPersonalizersModal({
  innerProps,
  context,
  id,
}: ContextModalProps<{
  id(id: any): number;
  sequences: any;
  ai_researcher_id: number;
  setPersonalizers: Function;
  icp_scoring_ruleset_typed: ICPScoringRuleset;
}>) {
  const generateTextWithBadges = (text: string) => {
    const parts = text?.split(/(\[\[.*?\]\])/)?.filter(Boolean);
    return parts?.map((part, index) => {
      if (part.startsWith("[[") && part.endsWith("]]")) {
        let badgeText = part.slice(2, -2);
        return (
          <Badge key={index} color="gray">
            {badgeText}
          </Badge>
        );
      }
      if (/^[A-Z_]+$/.test(part)) {
        let formattedText = part.toLowerCase().replace(/_/g, " ");
        formattedText =
          formattedText.charAt(0).toUpperCase() + formattedText.slice(1);
        return <span key={index}>{formattedText}</span>;
      }
      return <span key={index}>{part}</span>;
    });
  };

  const [currentProject, setCurrentProject] =
    useRecoilState(currentProjectState);
  const [selectedProspect, setSelectedProspect] = useState<any>(null);
  // const [researching, setResearching] = useState(false);
  //deep copy
  const sequences = Array.isArray(innerProps?.sequences)
    ? [...innerProps.sequences]
    : [];

  const [individual_personalizers, setIndividualPersonalizers] = useState<
    string[]
  >(innerProps.icp_scoring_ruleset_typed.individual_personalizers ?? []);

  const [company_personalizers, setCompanyPersonalizers] = useState<string[]>(
    innerProps.icp_scoring_ruleset_typed.company_personalizers ?? []
  );

  const [dealbreakers, setDealBreakers] = useState<string[]>(
    innerProps.icp_scoring_ruleset_typed.dealbreakers ?? []
  );

  const [individual_ai_filters, setIndividualAIFilters] = useState<AIFilters[]>(
    innerProps.icp_scoring_ruleset_typed.individual_ai_filters ?? []
  );

  const [company_ai_filters, setCompanyAIFilters] = useState<AIFilters[]>(
    innerProps.icp_scoring_ruleset_typed.company_ai_filters ?? []
  );

  //this function provides a state from the generative request, and the ability to override the data with the setter.

  const userToken = useRecoilValue(userTokenState);

  const fetchCurrentProject = async () => {
    const project = await getFreshCurrentProject(userToken, +innerProps.id);
    setCurrentProject(project);
  };

  const queryClient = useQueryClient();

  // const fetchProspects = async () => {
  //   try {
  //     setLoadingProspects(true);
  //     const data = await fetchCampaignContacts(
  //       userToken,
  //       Number(innerProps.id),
  //       0,
  //       10,
  //       "",
  //       false
  //     );
  //     const newProspectData = data.sample_contacts.map(
  //       (contact: {
  //         id: any;
  //         full_name: any;
  //         email: any;
  //         phone: any;
  //         company: any;
  //       }) => ({
  //         value: contact.id,
  //         label: contact.full_name,
  //         ...contact,
  //       })
  //     );
  //     setProspectData(newProspectData);
  //     if (newProspectData[0]?.value) {
  //       setSelectedProspect(newProspectData[0].value);
  //     }
  //   } finally {
  //   }
  // };

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["archetypeProspects", currentProject?.id],
    queryFn: async () => {
      if (currentProject) {
        // Fetch Prospects from the campaign Id
        const response = await fetch(
          `${API_URL}/client/archetype/${currentProject.id}/prospects`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${userToken}`,
            },
          }
        );

        const jsonResponse = await response.json();

        return jsonResponse.prospects;
      } else {
        return null;
      }
    },
    enabled: !!currentProject,
  });

  const prospects = data as Prospect[];

  const [scoreLoading, setScoreLoading] = useState(false);

  useEffect(() => {
    if (prospects && prospects.length > 0 && !selectedProspect) {
      setSelectedProspect(prospects[0].id);
    }
  }, [prospects]);

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
        archetype_id: innerProps.id,
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
        innerProps.id,
      ]);
      await queryClient.invalidateQueries(["icpScoringRuleset", innerProps.id]);
      showNotification({
        title: "Success",
        message: "Successfully added AI Filter to the ICP ruleset.",
        color: "blue",
      });

      await queryClient.invalidateQueries([
        `query-get-research-point-types`,
        id,
      ]);
    } else {
      showNotification({
        title: "Error",
        message: "Failed to add AI filters to the ICP ruleset",
        color: "red",
      });
    }
  };

  // get research points for selected prospect
  // Reserved here in the future for linkedin research
  const { data: researchPoints, refetch: refetchResearchPoints } = useQuery({
    queryKey: [`query-get-research-points`, +selectedProspect],
    queryFn: async () => {
      const response = await getResearchPoint(userToken, +selectedProspect);

      return response.status === "success"
        ? (response.data as ResearchPoint[])
        : [];
    },
    enabled: !!selectedProspect,
  });

  useEffect(() => {
    fetchCurrentProject();
  }, [innerProps.id]);

  const scoreCampaignFilters = async () => {
    setScoreLoading(true);

    const response = await fetch(
      `${API_URL}/client/archetype/${innerProps.id}/score`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          individual_personalizers,
          company_personalizers,
          dealbreakers,
          individual_ai_filters,
          company_ai_filters,
          selectedContacts: Array.from([+selectedProspect]),
          score_ai: true,
        }),
      }
    );

    if (response.status === 200) {
      const data = await response.json();

      await queryClient.invalidateQueries([
        "archetypeProspects",
        innerProps.id,
      ]);
      await queryClient.invalidateQueries(["icpScoringRuleset", innerProps.id]);
      setScoreLoading(false);
      showNotification({
        title: "Success",
        message:
          "Successfully scored the Campaign Prospects with the ICP ruleset. AI Filters will take a while to show up.",
        color: "blue",
      });

      await queryClient.invalidateQueries([
        `query-get-research-point-types`,
        innerProps.id,
      ]);

      refetch();
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
    <>
      <Flex
        mt={"lg"}
        style={{ border: "1px solid #dee2e6", borderRadius: "6px" }}
      >
        <Paper
          p={"md"}
          pr={"xs"}
          w={"40%"}
          display={"flex"}
          style={{ gap: "16px", flexDirection: "column" }}
        >
          <Flex align={"center"} justify={"space-between"}>
            <Text fw={600}>Research Questions</Text>
            <Tooltip
              multiline
              position="right"
              label="SellScale AI will answer these questions by scouring the web, LinkedIn, and other sources to develop a better understanding for each prospect you reach out to for the most relevant and personalized messaging. You can add questions to be asked here."
            >
              <ActionIcon>
                <IconQuestionMark size={"1rem"} />
              </ActionIcon>
            </Tooltip>
          </Flex>
          {/* <Flex> */}
          {/*   {aiResearcherLoading && <Loader size="xs" color="grape" mr="sm" />} */}
          {/*   <Select */}
          {/*     w="100%" */}
          {/*     label="AI Researcher:" */}
          {/*     value={currentAiResearcherId} */}
          {/*     placeholder="+ add researcher name" */}
          {/*     data={aiResearchers.map((x: any) => { */}
          {/*       return { */}
          {/*         value: "" + x.id, */}
          {/*         label: `${x.name}`, */}
          {/*       }; */}
          {/*     })} */}
          {/*     onChange={(value) => { */}
          {/*       connectAiResearcher(Number(value)); */}
          {/*     }} */}
          {/*     creatable */}
          {/*     searchable */}
          {/*     getCreateLabel={(query) => `+ Create ${query}`} */}
          {/*     onCreate={(query) => { */}
          {/*       createAiResearcher(query); */}
          {/*       window.location.reload(); */}
          {/*       return currentAiResearcherId; */}
          {/*     }} */}
          {/*   /> */}
          {/* </Flex> */}
          <Flex>
            {innerProps.icp_scoring_ruleset_typed && (
              <Button
                fullWidth
                leftIcon={<IconPlus size={"0.9rem"} />}
                mr={"md"}
                onClick={() => {
                  modals.openContextModal({
                    modal: "addQuestionModal",
                    title: (
                      <Title order={3}>
                        <span className=" text-gray-500">Add</span> Research
                        Point
                      </Title>
                    ),
                    innerProps: {
                      edit: false,
                      campaign_id: innerProps.id,
                      icp_scoring_ruleset_typed:
                        innerProps.icp_scoring_ruleset_typed,
                    },
                  });
                }}
              >
                Research point
              </Button>
            )}

            <Tooltip position="bottom" label="Coming Soon!">
              <Flex>
                <Button
                  color="gray"
                  fullWidth
                  leftIcon={<IconSparkles size={"0.9rem"} />}
                  mr={"md"}
                  onClick={() => {}}
                  disabled
                >
                  AI Suggest
                </Button>
              </Flex>
            </Tooltip>
          </Flex>
          {/* {generatingResearchPoints && ( */}
          {/*   <Text size={"sm"} color="grape" mt={"sm"} align="center"> */}
          {/*     <Loader size="xs" color="grape" mr="sm" /> Generating research */}
          {/*     points */}
          {/*   </Text> */}
          {/* )} */}
          <ScrollArea h={500} scrollbarSize={8} pr={"md"}>
            {individual_ai_filters?.map((filter, index) => {
              return (
                <Paper key={index} withBorder radius={"sm"} p={"sm"} mt={"xs"}>
                  <Flex direction={"column"} gap="4px" align={"center"}>
                    <Flex justify={"space-between"} align="center">
                      <Badge variant={"filled"} color={"grape"}>
                        Individual
                      </Badge>
                      <ActionIcon
                        onClick={async () => {
                          let newIndividualAIFilters: AIFilters[] = [];
                          let newDealbreaker: string[] = [];
                          let newIndividualAIPersonalizer: string[] = [];

                          setDealBreakers((prevState) => {
                            newDealbreaker = prevState.filter(
                              (x) => x !== filter.key
                            );
                            return prevState.filter((x) => x !== filter.key);
                          });
                          setIndividualPersonalizers((prevState) => {
                            newIndividualAIPersonalizer = prevState.filter(
                              (x) => x !== filter.key
                            );
                            return prevState.filter((x) => x !== filter.key);
                          });
                          setIndividualAIFilters((prevState) => {
                            newIndividualAIFilters = prevState.filter(
                              (item) => item.key !== filter.key
                            );
                            return prevState.filter(
                              (item) => item.key !== filter.key
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
                      {filter.title}
                    </Text>
                    <Textarea
                      fw={500}
                      label={"prompt"}
                      value={filter.prompt}
                      onChange={(event) => {
                        setIndividualAIFilters((prevState) => {
                          return prevState.map((previousAI) => {
                            if (previousAI.key === filter.key) {
                              return {
                                ...filter,
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
                      {filter.prompt}
                    </Textarea>
                    <Textarea
                      fw={500}
                      label={"relevancy"}
                      value={filter.relevancy}
                      onChange={(event) => {
                        setIndividualAIFilters((prevState) => {
                          return prevState.map((previousAI) => {
                            if (previousAI.key === filter.key) {
                              return {
                                ...filter,
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
                      {filter.relevancy}
                    </Textarea>
                    <Flex justify={"start"} align={"start"} gap={"4px"}>
                      <Checkbox
                        checked={dealbreakers.includes(filter.key)}
                        onChange={(event) => {
                          if (event.currentTarget.checked) {
                            setDealBreakers([...dealbreakers, filter.key]);
                          } else {
                            setDealBreakers(
                              dealbreakers.filter((x) => x !== filter.key)
                            );
                          }
                        }}
                        label={"Dealbreaker"}
                        size={"xs"}
                      />
                      <Checkbox
                        checked={individual_personalizers.includes(filter.key)}
                        onChange={(event) => {
                          if (event.currentTarget.checked) {
                            setIndividualPersonalizers([
                              ...individual_personalizers,
                              filter.key,
                            ]);
                          } else {
                            setIndividualPersonalizers(
                              individual_personalizers.filter(
                                (x) => x !== filter.key
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
            {company_ai_filters?.map((filter, index) => {
              return (
                <Paper key={index} withBorder radius={"sm"} p={"sm"} mt={"xs"}>
                  <Flex direction={"column"} gap="4px" align={"center"}>
                    <Flex justify={"space-between"} align="center">
                      <Badge variant={"filled"} color={"blue"}>
                        Company
                      </Badge>
                      <ActionIcon
                        onClick={async () => {
                          let newCompanyAIFilters: AIFilters[] = [];
                          let newDealbreaker: string[] = [];
                          let newCompanyAIPersonalizer: string[] = [];

                          setDealBreakers((prevState) => {
                            newDealbreaker = prevState.filter(
                              (x) => x !== filter.key
                            );
                            return prevState.filter((x) => x !== filter.key);
                          });
                          setCompanyPersonalizers((prevState) => {
                            newCompanyAIPersonalizer = prevState.filter(
                              (x) => x !== filter.key
                            );
                            return prevState.filter((x) => x !== filter.key);
                          });
                          setCompanyAIFilters((prevState) => {
                            newCompanyAIFilters = prevState.filter(
                              (item) => item.key !== filter.key
                            );

                            return prevState.filter(
                              (item) => item.key !== filter.key
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
                      {filter.title}
                    </Text>
                    <Textarea
                      fw={500}
                      label={"prompt"}
                      value={filter.prompt}
                      onChange={(event) => {
                        setCompanyAIFilters((prevState) => {
                          return prevState.map((previousAI) => {
                            if (previousAI.key === filter.key) {
                              return {
                                ...filter,
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
                      {filter.prompt}
                    </Textarea>
                    <Textarea
                      fw={500}
                      label={"relevancy"}
                      value={filter.relevancy}
                      onChange={(event) => {
                        setCompanyAIFilters((prevState) => {
                          return prevState.map((previousAI) => {
                            if (previousAI.key === filter.key) {
                              return {
                                ...filter,
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
                      {filter.relevancy}
                    </Textarea>
                    <Flex
                      direction={"column"}
                      justify={"start"}
                      align={"start"}
                      gap={"4px"}
                    >
                      <Checkbox
                        checked={dealbreakers.includes(filter.key)}
                        onChange={(event) => {
                          if (event.currentTarget.checked) {
                            setDealBreakers([...dealbreakers, filter.key]);
                          } else {
                            setDealBreakers(
                              dealbreakers.filter((x) => x !== filter.key)
                            );
                          }
                        }}
                        label={"Dealbreaker"}
                        size={"xs"}
                        mb={"4px"}
                      />
                      <Checkbox
                        checked={company_personalizers.includes(filter.key)}
                        onChange={(event) => {
                          if (event.currentTarget.checked) {
                            setCompanyPersonalizers([
                              ...company_personalizers,
                              filter.key,
                            ]);
                          } else {
                            setCompanyPersonalizers(
                              company_personalizers.filter(
                                (x) => x !== filter.key
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
            {/* {loadingResearchData ? ( */}
            {/*   <Center h={"100%"}> */}
            {/*     <Loader size="lg" /> */}
            {/*   </Center> */}
            {/* ) : ( */}
            {/*   <> */}
            {/*     <Flex h={"100%"} gap={"xs"} direction={"column"}> */}
            {/*       {researchData.length === 0 ? ( */}
            {/*         <Paper */}
            {/*           withBorder */}
            {/*           px={"lg"} */}
            {/*           py={"xl"} */}
            {/*           mt={"lg"} */}
            {/*           style={{ borderStyle: "dashed" }} */}
            {/*         > */}
            {/*           <Text size={"sm"} color="gray" fw={500} align="center"> */}
            {/*             No research points added yet! */}
            {/*           </Text> */}
            {/*         </Paper> */}
            {/*       ) : ( */}
            {/*         researchData.map( */}
            {/*           (item: any, index: Key | null | undefined) => { */}
            {/*             return ( */}
            {/*               <Paper withBorder p={"md"} key={index}> */}
            {/*                 <Flex align={"start"} justify={"space-between"}> */}
            {/*                   <Text size={"sm"} fw={600} pt={4}> */}
            {/*                     {generateTextWithBadges(item.title)} */}
            {/*                   </Text> */}
            {/*                   <Flex gap={3} align={"center"}> */}
            {/*                     <ActionIcon */}
            {/*                       onClick={() => { */}
            {/*                         openContextModal({ */}
            {/*                           modal: "addQuestionModal", */}
            {/*                           title: ( */}
            {/*                             <Title order={3}> */}
            {/*                               <span className=" text-gray-500"> */}
            {/*                                 Edit */}
            {/*                               </span>{" "} */}
            {/*                               Research Point */}
            {/*                             </Title> */}
            {/*                           ), */}
            {/*                           innerProps: { */}
            {/*                             edit: true, */}
            {/*                             sequences: sequences, */}
            {/*                             question_id: item.id, */}
            {/*                             currentTab: item.type, */}
            {/*                             relevancy: item.content, */}
            {/*                             question: item.title, */}
            {/*                             ai_researcher_id: currentAiResearcherId, */}
            {/*                             campaign_id: innerProps.id, */}
            {/*                             setPersonalizers: */}
            {/*                               innerProps.setPersonalizers, */}
            {/*                           }, */}
            {/*                           centered: true, */}
            {/*                           styles: { */}
            {/*                             content: { */}
            {/*                               minWidth: "500px", */}
            {/*                             }, */}
            {/*                           }, */}
            {/*                         }); */}
            {/*                       }} */}
            {/*                     > */}
            {/*                       <IconEdit color="gray" size={"0.9rem"} /> */}
            {/*                     </ActionIcon> */}
            {/*                     <ActionIcon */}
            {/*                       onClick={async () => { */}
            {/*                         researchers.deleteResearcherQuestion( */}
            {/*                           userToken, */}
            {/*                           Number(item.id) */}
            {/*                         ); */}
            {/*                         setResearchData((prevData: any[]) => */}
            {/*                           prevData.filter( */}
            {/*                             (researchItem) => */}
            {/*                               researchItem.id !== item.id */}
            {/*                           ) */}
            {/*                         ); */}
            {/*                       }} */}
            {/*                     > */}
            {/*                       <IconTrash color="gray" size={"0.9rem"} /> */}
            {/*                     </ActionIcon> */}
            {/*                     <Badge */}
            {/*                       size="sm" */}
            {/*                       radius={"sm"} */}
            {/*                       color={deterministicMantineColor(item.type)} */}
            {/*                     > */}
            {/*                       {item.type} */}
            {/*                     </Badge> */}
            {/*                   </Flex> */}
            {/*                 </Flex> */}
            {/*                 <Text size={"sm"} mt={2}> */}
            {/*                   {item.content} */}
            {/*                 </Text> */}
            {/*               </Paper> */}
            {/*             ); */}
            {/*           } */}
            {/*         ) */}
            {/*       )} */}
            {/*     </Flex> */}
            {/*     {generatedResearchData.length > 0 && ( */}
            {/*       <Divider */}
            {/*         my="sm" */}
            {/*         label="AI Generated Research Points" */}
            {/*         labelPosition="center" */}
            {/*         color="salmon" */}
            {/*       /> */}
            {/*     )} */}
            {/*     <Flex */}
            {/*       h="100%" */}
            {/*       gap="xs" */}
            {/*       direction="column" */}
            {/*       style={{ color: "salmon" }} */}
            {/*     > */}
            {/*       {generatedResearchData.map( */}
            {/*         (item: any, index: Key | null | undefined) => { */}
            {/*           return ( */}
            {/*             <Paper withBorder p={"md"} key={index}> */}
            {/*               <Flex align={"start"} justify={"space-between"}> */}
            {/*                 <Text size={"sm"} fw={600} pt={4}> */}
            {/*                   {generateTextWithBadges(item.Question)} */}
            {/*                 </Text> */}
            {/*                 <Flex gap={3} align={"center"}> */}
            {/*                   <Badge size="sm" radius={"sm"} color="blue"> */}
            {/*                     AI Generated */}
            {/*                   </Badge> */}
            {/*                   <Button */}
            {/*                     size="xs" */}
            {/*                     color="grape" */}
            {/*                     onClick={() => { */}
            {/*                       setGeneratedResearchData((prevData) => */}
            {/*                         prevData.filter( */}
            {/*                           (researchItem) => researchItem !== item */}
            {/*                         ) */}
            {/*                       ); */}
            {/*                       addGeneratedResearchPoint(item); */}
            {/*                     }} */}
            {/*                   > */}
            {/*                     Add */}
            {/*                   </Button> */}
            {/*                 </Flex> */}
            {/*               </Flex> */}
            {/*               <Text size={"sm"} mt={2}> */}
            {/*                 {item.RelevanceReason} */}
            {/*               </Text> */}
            {/*             </Paper> */}
            {/*           ); */}
            {/*         } */}
            {/*       )} */}
            {/*     </Flex> */}
            {/*   </> */}
            {/* )} */}
          </ScrollArea>
        </Paper>
        <Divider orientation="vertical" color="#dee2e6" />
        <Paper w={"66%"} display={"flex"} style={{ flexDirection: "column" }}>
          <Flex
            p={"lg"}
            justify={"space-between"}
            align={"center"}
            gap={"sm"}
            style={{ borderBottom: "1px solid #dee2e6" }}
          >
            <Text fw={600}>Simulate Research</Text>
            {isLoading ? (
              <Loader size="sm" />
            ) : (
              <Flex gap={"sm"} align={"center"}>
                <Text color="gray" size={"sm"}>
                  Select prospect:
                </Text>
                <Select
                  placeholder="-"
                  onChange={(value) => {
                    setSelectedProspect(value);
                  }}
                  data={prospects.map((p) => {
                    return {
                      value: "" + p.id,
                      label: p.full_name,
                      ...p,
                    };
                  })}
                  defaultValue={
                    prospects.length > 0
                      ? {
                          value: "" + prospects[0].id,
                          label: prospects[0].full_name,
                        }.value
                      : null
                  }
                ></Select>
                {selectedProspect &&
                  (scoreLoading ? (
                    <Loader size="sm" />
                  ) : (
                    <Button
                      color="grape"
                      onClick={async () => await scoreCampaignFilters()}
                    >
                      {scoreLoading ? <Loader /> : "Simulate"}
                    </Button>
                  ))}
              </Flex>
            )}
          </Flex>
          <ScrollArea
            h={640}
            scrollbarSize={8}
            px={"md"}
            bg={prospects?.length === 0 ? "#f7f8fa" : ""}
          >
            {!prospects ? (
              <Loader size="sm" />
            ) : (
              <Flex gap={"xs"} direction={"column"}>
                {!prospects ||
                  (!prospects.find((p) => p.id === +selectedProspect) && (
                    <Paper
                      withBorder
                      px={"lg"}
                      py={"xl"}
                      mt={"lg"}
                      style={{ borderStyle: "dashed" }}
                      bg={"transparent"}
                    >
                      <Text size={"sm"} color="gray" fw={500} align="center">
                        Add research points to simulate research here
                      </Text>
                    </Paper>
                  ))}
                {prospects.find((p) => p.id === +selectedProspect)
                  ?.icp_fit_reason_v2 &&
                  Object.keys(
                    prospects.find((p) => p.id === +selectedProspect)!
                      .icp_fit_reason_v2
                  )
                    .filter((key) => {
                      return innerProps.icp_scoring_ruleset_typed.individual_ai_filters
                        .map((v) => v.key)
                        .includes(key);
                    })
                    .map((item, index) => {
                      const title = item
                        .replace("_individual_", "_")
                        .replace("_company_", "_")
                        .replace("aicomp_", "")
                        .replace("aiind_", "")
                        .replace("keywords", "")
                        .split("_")
                        .join(" ");

                      const section = prospects.find(
                        (p) => p.id === +selectedProspect
                      )!.icp_fit_reason_v2[item];

                      return (
                        <>
                          <Paper withBorder p={"lg"} key={index}>
                            <Flex justify={"space-between"}>
                              <Flex>
                                <IconPoint
                                  size={"2rem"}
                                  fill={
                                    section.answer === "YES" ? "#17B26A" : "red"
                                  }
                                  color="white"
                                  className="mt-[-6px] ml-[-12px]"
                                />
                                <Text fw={600} size={"sm"}>
                                  {generateTextWithBadges(
                                    title.toLowerCase().split("_").join(" ")
                                  )}
                                </Text>
                              </Flex>
                              <Badge radius={"sm"} size="sm" color={"green"}>
                                {"LinkedIn"}
                              </Badge>
                            </Flex>
                            <Text size={"sm"} fw={500}>
                              {section.reasoning}
                            </Text>
                            <Flex
                              p={"sm"}
                              className="bg-[#D444F1]/5"
                              gap={4}
                              align={"start"}
                            >
                              <Flex>
                                <IconBulb size={"0.9rem"} color="#D444F1" />
                              </Flex>
                              <Text color="#D444F1" size={"xs"}>
                                {"relevancy coming soon!"}
                              </Text>
                            </Flex>
                            <Flex justify="space-between" align="center">
                              <Popover
                                arrowPosition="center"
                                zIndex={40000000}
                                width={300}
                                position="bottom"
                                withArrow
                                shadow="md"
                              >
                                <Popover.Target>
                                  <Flex
                                    align="center"
                                    style={{ cursor: "pointer" }}
                                  >
                                    <IconEye
                                      size={"1rem"}
                                      style={{ marginRight: "4px" }}
                                    />
                                    <Text size={"xs"} fw={400}>
                                      See Raw Information
                                    </Text>
                                  </Flex>
                                </Popover.Target>

                                <Popover.Dropdown maw={"300px"}>
                                  <Flex direction={"column"} gap={"4px"}>
                                    <Text size="sm">
                                      <span
                                        style={{ fontWeight: "bold" }}
                                      >{`Reason: `}</span>
                                      {section.reasoning}
                                    </Text>
                                    <Divider />
                                    <Text size={"xs"}>
                                      <span style={{ fontWeight: "bold" }}>
                                        {`Source:  `}
                                      </span>
                                      {section.source}
                                    </Text>
                                    {section.question && (
                                      <Text size={"xs"}>
                                        <span style={{ fontWeight: "bold" }}>
                                          {`Question:  `}
                                        </span>
                                        {section.question}
                                      </Text>
                                    )}
                                    {section.last_run && (
                                      <Text size={"xs"}>
                                        <span style={{ fontWeight: "bold" }}>
                                          {`Last Updated:  `}
                                        </span>
                                        {new Date(
                                          section.last_run + " UTC"
                                        ).toLocaleString("en-US", {
                                          year: "numeric",
                                          month: "2-digit",
                                          day: "2-digit",
                                          hour: "2-digit",
                                          minute: "2-digit",
                                          second: "2-digit",
                                          hour12: true,
                                        })}
                                      </Text>
                                    )}
                                  </Flex>
                                </Popover.Dropdown>
                              </Popover>
                            </Flex>
                          </Paper>
                        </>
                      );
                    })}
                {prospects.find((p) => p.id === +selectedProspect)
                  ?.icp_company_fit_reason &&
                  Object.keys(
                    prospects.find((p) => p.id === +selectedProspect)!
                      .icp_company_fit_reason
                  )
                    .filter((key) => {
                      if (
                        !innerProps.icp_scoring_ruleset_typed.company_ai_filters
                      ) {
                        return false;
                      }

                      return innerProps.icp_scoring_ruleset_typed.company_ai_filters
                        .map((v: AIFilters) => v.key)
                        .includes(key);
                    })
                    .map((item, index) => {
                      const title = item
                        .replace("_individual_", "_")
                        .replace("_company_", "_")
                        .replace("aicomp_", "")
                        .replace("aiind_", "")
                        .replace("keywords", "")
                        .split("_")
                        .join(" ");

                      const section = prospects.find(
                        (p) => p.id === +selectedProspect
                      )!.icp_company_fit_reason[item];

                      return (
                        <>
                          <Paper withBorder p={"lg"} key={index}>
                            <Flex justify={"space-between"}>
                              <Flex>
                                <IconPoint
                                  size={"2rem"}
                                  fill={
                                    section.answer === "YES" ? "#17B26A" : "red"
                                  }
                                  color="white"
                                  className="mt-[-6px] ml-[-12px]"
                                />
                                <Text fw={600} size={"sm"}>
                                  {generateTextWithBadges(
                                    title.toLowerCase().split("_").join(" ")
                                  )}
                                </Text>
                              </Flex>
                              <Badge radius={"sm"} size="sm" color={"green"}>
                                {"LinkedIn"}
                              </Badge>
                            </Flex>
                            <Text size={"sm"} fw={500}>
                              {section.reasoning}
                            </Text>
                            <Flex
                              p={"sm"}
                              className="bg-[#D444F1]/5"
                              gap={4}
                              align={"start"}
                            >
                              <Flex>
                                <IconBulb size={"0.9rem"} color="#D444F1" />
                              </Flex>
                              <Text color="#D444F1" size={"xs"}>
                                {"relevancy coming soon!"}
                              </Text>
                            </Flex>
                            <Flex justify="space-between" align="center">
                              <Popover
                                arrowPosition="center"
                                zIndex={40000000}
                                width={300}
                                position="bottom"
                                withArrow
                                shadow="md"
                              >
                                <Popover.Target>
                                  <Flex
                                    align="center"
                                    style={{ cursor: "pointer" }}
                                  >
                                    <IconEye
                                      size={"1rem"}
                                      style={{ marginRight: "4px" }}
                                    />
                                    <Text size={"xs"} fw={400}>
                                      See Raw Information
                                    </Text>
                                  </Flex>
                                </Popover.Target>

                                <Popover.Dropdown maw={"300px"}>
                                  <Flex direction={"column"} gap={"4px"}>
                                    <Text size="sm">
                                      <span
                                        style={{ fontWeight: "bold" }}
                                      >{`Reason: `}</span>
                                      {section.reasoning}
                                    </Text>
                                    <Divider />
                                    <Text size={"xs"}>
                                      <span style={{ fontWeight: "bold" }}>
                                        {`Source:  `}
                                      </span>
                                      {section.source}
                                    </Text>
                                    {section.question && (
                                      <Text size={"xs"}>
                                        <span style={{ fontWeight: "bold" }}>
                                          {`Question:  `}
                                        </span>
                                        {section.question}
                                      </Text>
                                    )}
                                    {section.last_run && (
                                      <Text size={"xs"}>
                                        <span style={{ fontWeight: "bold" }}>
                                          {`Last Updated:  `}
                                        </span>
                                        {new Date(
                                          section.last_run + " UTC"
                                        ).toLocaleString("en-US", {
                                          year: "numeric",
                                          month: "2-digit",
                                          day: "2-digit",
                                          hour: "2-digit",
                                          minute: "2-digit",
                                          second: "2-digit",
                                          hour12: true,
                                        })}
                                      </Text>
                                    )}
                                  </Flex>
                                </Popover.Dropdown>
                              </Popover>
                            </Flex>
                          </Paper>
                        </>
                      );
                    })}
              </Flex>
            )}
          </ScrollArea>
        </Paper>
      </Flex>
      <Flex align={"center"} gap={"md"} mt={"lg"}>
        <Button
          variant="outline"
          color="gray"
          fullWidth
          onClick={() => modals.closeAll()}
        >
          Go Back
        </Button>
        <Button
          onClick={() => {
            modals.closeAll();
            addAIFilter(
              company_ai_filters,
              individual_ai_filters,
              dealbreakers,
              company_personalizers,
              individual_personalizers
            );
          }}
          fullWidth
        >
          Save
        </Button>
      </Flex>
    </>
  );
}
