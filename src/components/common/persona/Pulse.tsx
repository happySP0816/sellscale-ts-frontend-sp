import {
  Paper,
  Title,
  Text,
  Textarea,
  Button,
  LoadingOverlay,
  Flex,
  Card,
  Tabs,
  Select,
  Group,
  Badge,
  useMantineTheme,
  createStyles,
  Stack,
  Box,
  List,
  Collapse,
  ScrollArea,
  Divider,
  Grid,
  ActionIcon,
  Checkbox,
  Loader,
  ThemeIcon,
  rem,
} from "@mantine/core";
import { openConfirmModal, openContextModal } from "@mantine/modals";
import {
  IconBrain,
  IconBrandLinkedin,
  IconPencil,
  IconPhoto,
  IconTestPipe,
  IconTrash,
} from "@tabler/icons";
import {
  ComponentPropsWithoutRef,
  forwardRef,
  useEffect,
  useRef,
  useState,
} from "react";

import { useRecoilValue } from "recoil";
import { userTokenState } from "@atoms/userAtoms";
import { Archetype, PersonaOverview, ProspectShallow } from "src";

import getICPClassificationPrompt from "@utils/requests/getICPClassificationPrompt";
import { getArchetypeProspects } from "@utils/requests/getArchetypeProspects";
import postRunICPClassification from "@utils/requests/postRunICPClassification";
import { getRandomItems, valueToColor } from "@utils/general";
import { getICPOneProspect } from "@utils/requests/getICPOneProspect";
import { showNotification } from "@mantine/notifications";
import { useDebouncedState } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";
import { getProspects } from "@utils/requests/getProspects";
import _, { set } from "lodash";
import {
  ICPFitPillOnly,
  getIcpFitScoreMap,
  getScoreFromLabel,
  icpFitToLabel,
} from "@common/pipeline/ICPFitAndReason";
import { updateProspect } from "@utils/requests/updateProspect";
import { getProspectsForICP } from "@utils/requests/getProspectsForICP";
import postICPClassificationPromptChange from "@utils/requests/postICPClassificationPromptChange";
import { IconPointFilled } from "@tabler/icons-react";

interface LabelItemProps extends React.ComponentPropsWithoutRef<"div"> {
  icp_fit: number;
}

const LabelSelectItem = forwardRef<HTMLDivElement, LabelItemProps>(
  ({ icp_fit, ...others }: LabelItemProps, ref) => (
    <div ref={ref} {...others}>
      <ICPFitPillOnly icp_fit_score={icp_fit} />
    </div>
  )
);

interface ProspectItemProps extends ComponentPropsWithoutRef<"div"> {
  label: string;
  icpFit: number;
  title: string;
  company: string;
}

const useStyles = createStyles((theme) => ({
  icon: {
    color: theme.colors.gray[6],
  },
}));

export type ProspectICP = {
  id: string;
  company: string;
  full_name: string;
  title: string;
  icp_fit_score: string;
  icp_fit_score_override: string;
  in_icp_sample: string | false;
};

export default function Pulse(props: { personaOverview: PersonaOverview }) {
  const theme = useMantineTheme();
  const userToken = useRecoilValue(userTokenState);

  const firstLoad = useRef(true);
  const [loading, setLoading] = useState(false);
  const [currentICPPrompt, setCurrentICPPrompt] = useState("");
  const [testSearchValue, setTestSearchValue] = useDebouncedState("", 300);

  const [sampleProspects, setSampleProspects] = useState<ProspectICP[]>([]);
  const [overrideMap, setOverrideMap] = useState<Map<number, string>>(
    new Map()
  );

  const [testingPrompt, setTestingPrompt] = useState(false);
  const [detailsOpened, setDetailsOpened] = useState(false);

  const [optionFilters, setOptionFilters] = useState<{
    prospect_name: boolean;
    prospect_title: boolean;
    prospect_linkedin_bio: boolean;
    prospect_location: boolean;
    prospect_education: boolean;
    company_name: boolean;
    company_size: boolean;
    company_industry: boolean;
    company_location: boolean;
    company_tagline: boolean;
    company_description: boolean;
  }>(// @ts-ignore
    props.personaOverview.icp_matching_option_filters || {
      prospect_name: false,
      prospect_title: false,
      prospect_linkedin_bio: false,
      prospect_location: false,
      prospect_education: false,
      company_name: false,
      company_size: false,
      company_industry: false,
      company_location: false,
      company_tagline: false,
      company_description: false,
    }
  );

  useEffect(() => {
    (async () => {
      const result = await postICPClassificationPromptChange(
        userToken,
        props.personaOverview.id,
        currentICPPrompt,
        optionFilters
      );
    })();
  }, [optionFilters]);

  const {
    data: prospects,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: [`query-isp-fit-prospects`],
    queryFn: async () => {
      const response = await getProspectsForICP(
        userToken,
        props.personaOverview.id
      );
      if (response.status === "error") {
        return [];
      }

      const all_prospects: ProspectICP[] = [];
      all_prospects.push(...response.data.high_data);
      all_prospects.push(...response.data.low_data);
      all_prospects.push(...response.data.medium_data);
      all_prospects.push(...response.data.very_high_data);
      all_prospects.push(...response.data.very_low_data);

      setSampleProspects((prev) => {
        return _.uniqBy(
          [
            ...prev,
            ...all_prospects.filter(
              (prospect) =>
                prospect.in_icp_sample && prospect.in_icp_sample.startsWith("t")
            ),
          ],
          "id"
        );
      });

      firstLoad.current = false;

      return all_prospects;
    },
    refetchOnWindowFocus: false,
    refetchInterval: 10000,
  });

  const ProspectSelectItem = forwardRef<HTMLDivElement, ProspectItemProps>(
    ({ label, icpFit, title, company, ...others }: ProspectItemProps, ref) => (
      <div ref={ref} {...others}>
        <Flex justify={"space-between"}>
          <Text>{label}</Text>
          {icpFit ? (
            <ICPFitPillOnly icp_fit_score={icpFit} />
          ) : (
            <Badge color={valueToColor(theme, "NONE")}>NONE</Badge>
          )}
        </Flex>
        <Text fz="xs">
          {title} @ {company}
        </Text>
      </div>
    )
  );

  const triggerGetICPClassificationPrompt = async () => {
    const result = await getICPClassificationPrompt(
      userToken,
      props.personaOverview.id
    );

    if (result.status === "success") {
      setCurrentICPPrompt(result.data);
    } else {
      setCurrentICPPrompt("");
    }
  };

  // const triggerGetICPOneProspect = async () => {
  //   if (!selectedProspect) {
  //     return;
  //   }

  //   setTestingPrompt(true);

  //   const result = await getICPOneProspect(
  //     userToken,
  //     props.personaOverview.id,
  //     selectedProspect.id
  //   );

  //   if (result.status === "success") {
  //     showNotification({
  //       title: "Success",
  //       message:
  //         "Successfully tested pulse prompt on prospect. Check the updated fit and reason.",
  //       color: "teal",
  //       autoClose: 3000,
  //     });
  //     triggerGetArchetypeProspects();
  //     selectedProspect.icp_fit_reason = result.data.reason;
  //     selectedProspect.icp_fit_score = result.data.fit;
  //   } else {
  //     showNotification({
  //       title: "Error",
  //       message: "Failed to test pulse prompt on prospect. Please try again.",
  //       color: "red",
  //       autoClose: 3000,
  //     });
  //   }

  //   setTestingPrompt(false);
  // };

  const openRunAllModal = () =>
    openConfirmModal({
      title: "Run AI Filter on All Prospects",
      children: (
        <Text size="sm">
          Are you sure you want to run the pulse prompt on all prospects? This
          may take a while and will cost you credits.
        </Text>
      ),
      labels: { confirm: "Confirm", cancel: "Cancel" },
      onCancel: () => {},
      onConfirm: () => triggerPostRunICPClassification(),
    });

  const triggerPostRunICPClassification = async () => {
    const result = await postRunICPClassification(
      userToken,
      props.personaOverview.id
    );

    if (result.status === "success") {
      showNotification({
        title: "Success",
        message:
          "Successfully ran pulse prompt on all prospects. Check the updated fit and reason in a few minutes.",
        color: "teal",
        autoClose: 3000,
      });
      refetch();
    } else {
      showNotification({
        title: "Error",
        message:
          "Failed to run pulse prompt on prospects. Please try again or contact support.",
        color: "red",
        autoClose: 3000,
      });
    }
  };

  useEffect(() => {
    triggerGetICPClassificationPrompt();
  }, []);

  const getScorePercentage = () => {
    let correct = 0;
    let checked = 0;
    for (const prospect of sampleProspects) {
      const overrideLabel = overrideMap.has(+prospect.id)
        ? overrideMap.get(+prospect.id)
        : prospect.icp_fit_score_override
        ? icpFitToLabel(+prospect.icp_fit_score_override)
        : null;
      if (overrideLabel) {
        if (icpFitToLabel(+prospect.icp_fit_score) === overrideLabel) {
          correct++;
        }
        checked++;
      }
    }
    return checked === 0
      ? "Unknown"
      : Math.round((correct / checked) * 100) + "%";
  };

  const getFitLabel = (prospect: ProspectICP) => {
    if (overrideMap.has(+prospect.id)) {
      return overrideMap.get(+prospect.id) + "";
    }
    if (prospect.icp_fit_score_override) {
      return icpFitToLabel(+prospect.icp_fit_score_override);
    }
    return icpFitToLabel(+prospect.icp_fit_score);
  };

  const selectRandomProspects = async (amount: number) => {
    const randomProspects = getRandomItems(prospects || [], amount);
    for (const prospect of randomProspects) {
      setSampleProspects((prev) => {
        return _.uniqBy([...prev, prospect], "id");
      });
      const response = await updateProspect(
        userToken,
        +prospect.id,
        undefined,
        true,
        undefined
      );
    }
  };

  return (
    <Paper withBorder p="xs" my={20} radius="md">
      <Flex>
        <Flex w="50%" direction="column" mr="xs">
          <Textarea
            defaultValue={currentICPPrompt}
            placeholder="No prompt? Send SellScale a prompt request through here."
            label="Describe your ideal customer profile (ICP)"
            description={
              <Box>
                <Text>
                  Filters our AI searches for:
                  <Text
                    pl="xs"
                    c="blue.4"
                    fw="bold"
                    sx={{ cursor: "pointer" }}
                    onClick={() => setDetailsOpened((prev) => !prev)}
                    span
                  >
                    {detailsOpened ? "Hide" : "Show"}
                  </Text>
                </Text>

                <Collapse in={detailsOpened}>
                  <List size="xs">
                    <List.Item>
                      <Checkbox
                        checked={optionFilters.prospect_name}
                        onChange={(event) =>
                          setOptionFilters((prev) => ({
                            ...prev,
                            prospect_name: event?.currentTarget?.checked,
                          }))
                        }
                        label="Prospect Name"
                      />
                    </List.Item>
                    <List.Item>
                      <Checkbox
                        checked={optionFilters.prospect_title}
                        onChange={(event) =>
                          setOptionFilters((prev) => ({
                            ...prev,
                            prospect_title: event?.currentTarget?.checked,
                          }))
                        }
                        label="Prospect Title"
                      />
                    </List.Item>
                    <List.Item>
                      <Checkbox
                        checked={optionFilters.prospect_linkedin_bio}
                        onChange={(event) =>
                          setOptionFilters((prev) => ({
                            ...prev,
                            prospect_linkedin_bio:
                              event?.currentTarget?.checked,
                          }))
                        }
                        label="Prospect LinkedIn Bio"
                      />
                    </List.Item>
                    <List.Item>
                      <Checkbox
                        checked={optionFilters.prospect_location}
                        onChange={(event) =>
                          setOptionFilters((prev) => ({
                            ...prev,
                            prospect_location: event?.currentTarget?.checked,
                          }))
                        }
                        label="Prospect Location"
                      />
                    </List.Item>
                    <List.Item>
                      <Checkbox
                        checked={optionFilters.prospect_education}
                        onChange={(event) =>
                          setOptionFilters((prev) => ({
                            ...prev,
                            prospect_education: event?.currentTarget?.checked,
                          }))
                        }
                        label="Prospect Education"
                      />
                    </List.Item>
                    <List.Item>
                      <Checkbox
                        checked={optionFilters.company_name}
                        onChange={(event) =>
                          setOptionFilters((prev) => ({
                            ...prev,
                            company_name: event?.currentTarget?.checked,
                          }))
                        }
                        label="Company Name"
                      />
                    </List.Item>
                    <List.Item>
                      <Checkbox
                        checked={optionFilters.company_size}
                        onChange={(event) =>
                          setOptionFilters((prev) => ({
                            ...prev,
                            company_size: event?.currentTarget?.checked,
                          }))
                        }
                        label="Company Size"
                      />
                    </List.Item>
                    <List.Item>
                      <Checkbox
                        checked={optionFilters.company_industry}
                        onChange={(event) =>
                          setOptionFilters((prev) => ({
                            ...prev,
                            company_industry: event?.currentTarget?.checked,
                          }))
                        }
                        label="Company Industry"
                      />
                    </List.Item>
                    <List.Item>
                      <Checkbox
                        checked={optionFilters.company_location}
                        onChange={(event) =>
                          setOptionFilters((prev) => ({
                            ...prev,
                            company_location: event?.currentTarget?.checked,
                          }))
                        }
                        label="Company Location"
                      />
                    </List.Item>
                    <List.Item>
                      <Checkbox
                        checked={optionFilters.company_tagline}
                        onChange={(event) =>
                          setOptionFilters((prev) => ({
                            ...prev,
                            company_tagline: event?.currentTarget?.checked,
                          }))
                        }
                        label="Company Tagline"
                      />
                    </List.Item>
                    <List.Item>
                      <Checkbox
                        checked={optionFilters.company_description}
                        onChange={(event) =>
                          setOptionFilters((prev) => ({
                            ...prev,
                            company_description: event?.currentTarget?.checked,
                          }))
                        }
                        label="Company Description"
                      />
                    </List.Item>
                  </List>
                </Collapse>
              </Box>
            }
            minRows={4}
            autosize
            disabled
          />
          <Button
            mt="xs"
            rightIcon={<IconPencil size="1rem" />}
            variant="outline"
            radius="lg"
            color="teal"
            onClick={() => {
              currentICPPrompt
                ? openContextModal({
                    modal: "managePulsePrompt",
                    title: <Title order={3}>Edit AI Filter</Title>,
                    innerProps: {
                      mode: "EDIT",
                      personaOverview: props.personaOverview,
                      backfillICPPrompt: triggerGetICPClassificationPrompt,
                      icpPrompt: currentICPPrompt,
                    },
                  })
                : openContextModal({
                    modal: "managePulsePrompt",
                    title: <Title order={3}>Create AI Filter</Title>,
                    innerProps: {
                      mode: "CREATE",
                      personaOverview: props.personaOverview,
                      backfillICPPrompt: triggerGetICPClassificationPrompt,
                      icpPrompt: currentICPPrompt,
                    },
                  });
            }}
          >
            {currentICPPrompt ? "Edit AI Filter" : "Create New AI Filter"}
          </Button>
        </Flex>
        <Flex w="50%">
          <Paper withBorder p="xs" w="100%" sx={{ position: "relative" }}>
            <LoadingOverlay visible={isFetching && firstLoad.current} />
            <Tabs defaultValue="test" color="teal" h={"100%"}>
              <Tabs.List>
                <Tabs.Tab value="test" icon={<IconTestPipe size="0.8rem" />}>
                  Test & Polish
                </Tabs.Tab>
                <Tabs.Tab value="run" icon={<IconBrain size="0.8rem" />}>
                  Run for All
                </Tabs.Tab>
              </Tabs.List>

              <Tabs.Panel value="test" pt="xs" h={"100%"}>
                <Group
                  noWrap
                  position="apart"
                  sx={{ flexDirection: "column" }}
                  h={"90%"}
                >
                  <Box>
                    <Text fz="sm">
                      Test your pulse prompt on a few prospects to see how well
                      it does.
                    </Text>

                    <Group grow>
                      <Select
                        mt="md"
                        label="Select a prospect"
                        placeholder="Add to sample set"
                        itemComponent={ProspectSelectItem}
                        searchable
                        onSearchChange={(value) => {
                          setTestSearchValue(value);
                        }}
                        clearable
                        nothingFound={
                          loading
                            ? "Grabbing prospects..."
                            : "No prospects found"
                        }
                        value={"-1"}
                        data={
                          prospects
                            ?.filter(
                              (prospect) => !sampleProspects.includes(prospect)
                            )
                            .map((prospect) => {
                              return {
                                value: prospect.id + "",
                                label: prospect.full_name,
                                icpFit: prospect.icp_fit_score,
                                title: prospect.title,
                                company: prospect.company,
                              };
                            }) || []
                        }
                        onChange={async (value) => {
                          const foundProspect = prospects?.find(
                            (prospect) => prospect.id === value
                          );
                          if (foundProspect) {
                            setSampleProspects((prev) => {
                              return _.uniqBy([...prev, foundProspect], "id");
                            });
                            const response = await updateProspect(
                              userToken,
                              +foundProspect.id,
                              undefined,
                              true,
                              undefined
                            );
                          }
                        }}
                      />
                      <Button
                        mt={40}
                        size="xs"
                        onClick={async () => {
                          await selectRandomProspects(10);
                        }}
                      >
                        Add 10 Random Prospects
                      </Button>
                    </Group>

                    <Box>
                      <Grid>
                        <Grid.Col span={1}>
                          <Text fz="xs" c="dimmed"></Text>
                        </Grid.Col>
                        <Grid.Col span={6}>
                          <Text fz="xs" c="dimmed">
                            Prospect
                          </Text>
                        </Grid.Col>
                        <Grid.Col span={2}>
                          <Text fz="xs" c="dimmed">
                            AI Label
                          </Text>
                        </Grid.Col>
                        <Grid.Col span={3}>
                          <Text fz="xs" c="dimmed">
                            Manual Label
                          </Text>
                        </Grid.Col>
                      </Grid>
                    </Box>

                    {sampleProspects
                      .sort((a, b) =>
                        parseInt(a.icp_fit_score) > parseInt(b.icp_fit_score)
                          ? -1
                          : 1
                      )
                      .map((prospect, index) => (
                        <Box key={index} m={5} sx={{ position: "relative" }}>
                          <Divider m={5} />

                          <Grid>
                            <Grid.Col span={1}>
                              <Group noWrap spacing={0}>
                                <ActionIcon
                                  onClick={async () => {
                                    setSampleProspects((prev) => {
                                      return prev.filter(
                                        (p) => p.id !== prospect.id
                                      );
                                    });
                                    const response = await updateProspect(
                                      userToken,
                                      +prospect.id,
                                      undefined,
                                      false,
                                      undefined
                                    );
                                  }}
                                >
                                  <IconTrash size="0.9rem" />
                                </ActionIcon>
                                <ThemeIcon
                                  variant="outline"
                                  color="red"
                                  size={5}
                                  radius={10}
                                >
                                  <IconPointFilled size={rem(14)} />
                                </ThemeIcon>
                              </Group>
                            </Grid.Col>
                            <Grid.Col span={8}>
                              <ProspectSelectItem
                                label={prospect.full_name}
                                icpFit={+prospect.icp_fit_score}
                                title={prospect.title}
                                company={prospect.company}
                              />
                            </Grid.Col>
                            <Grid.Col span={3}>
                              <Select
                                itemComponent={LabelSelectItem}
                                value={getFitLabel(prospect)}
                                data={[...getIcpFitScoreMap(true).values()].map(
                                  (icp) => {
                                    return {
                                      value: icp,
                                      label: icp,
                                      icp_fit: getScoreFromLabel(icp),
                                    };
                                  }
                                )}
                                onChange={async (value) => {
                                  if (!value) return;
                                  setOverrideMap((prev) => {
                                    return new Map(prev).set(
                                      +prospect.id,
                                      value
                                    );
                                  });
                                  const response = await updateProspect(
                                    userToken,
                                    +prospect.id,
                                    undefined,
                                    true,
                                    getScoreFromLabel(value)
                                  );
                                }}
                              />
                            </Grid.Col>
                          </Grid>
                        </Box>
                      ))}

                    {/* {selectedProspect && (
                  <>
                    <ProspectOverview prospect={selectedProspect} />
                    <Flex justify="flex-end">
                      <Button
                        variant="light"
                        color="teal"
                        radius="md"
                        mt="md"
                        loading={testingPrompt}
                        disabled={currentICPPrompt === ""}
                        onClick={() => {
                          triggerGetICPOneProspect();
                        }}
                      >
                        Test Pulse
                      </Button>
                    </Flex>
                  </>
                )} */}
                  </Box>

                  <Group>
                    <Button
                      variant="light"
                      color="teal"
                      radius="md"
                      onClick={async () => {
                        // Reclassify all sample prospects
                        for (const prospect of sampleProspects) {
                          getICPOneProspect(
                            userToken,
                            props.personaOverview.id,
                            +prospect.id
                          );
                        }

                        // Show notification
                        showNotification({
                          title: "Classifying Sample Prospects...",
                          message: "Please coming back in a few minutes.",
                          color: "green",
                        });
                      }}
                    >
                      Reclassify Sample Prospects
                    </Button>
                    <Text fz="sm" c="dimmed">
                      {getScorePercentage()} Score
                    </Text>
                  </Group>
                </Group>
              </Tabs.Panel>

              <Tabs.Panel value="run" pt="xs">
                <Text fz="lg" fw="bold" mt="xs">
                  Run Pulse
                </Text>
                <Text fz="sm">Run your pulse prompt on all prospects.</Text>
                {prospects && (
                  <>
                    <Card mt="md">
                      <Text fz="md">
                        This is a costly operation and will take a while to
                        complete!
                      </Text>
                      <Flex mt="md">
                        <Text fw="bold">Number of Prospects:</Text>
                        <Text ml="xs">{prospects.length}</Text>
                      </Flex>
                      <Flex>
                        <Text fw="bold">Estimated Time:</Text>
                        <Text ml="xs">
                          {((prospects.length * 0.3) / 60).toPrecision(1)}{" "}
                          minutes
                        </Text>
                      </Flex>
                      <Flex>
                        <Text fw="bold">Estimated Cost:</Text>
                        <Text ml="xs">{prospects.length} credits</Text>
                      </Flex>
                    </Card>
                    <Flex justify={"flex-end"}>
                      <Button
                        variant="light"
                        color="teal"
                        radius="md"
                        mt="md"
                        loading={testingPrompt}
                        disabled={currentICPPrompt === ""}
                        onClick={openRunAllModal}
                      >
                        Run Pulse
                      </Button>
                    </Flex>
                  </>
                )}
              </Tabs.Panel>
            </Tabs>

            {isFetching && !firstLoad.current && (
              <Loader
                variant="dots"
                sx={{ position: "absolute", right: 15, bottom: 20 }}
              />
            )}
          </Paper>
        </Flex>
      </Flex>
    </Paper>
  );
}

export function ProspectOverview(props: { prospect: ProspectShallow }) {
  const { classes } = useStyles();
  const theme = useMantineTheme();
  const selectedProspect = props.prospect;

  return (
    <>
      <Card mt="md">
        <Text fz="lg" fw="bold">
          {selectedProspect.full_name}
        </Text>
        <Text fz="sm">
          {selectedProspect.title} @ {selectedProspect.company}
        </Text>

        {selectedProspect.li_public_id && (
          <Group noWrap spacing={10} mt={5}>
            <IconBrandLinkedin
              stroke={1.5}
              size={16}
              className={classes.icon}
            />
            <Text
              size="xs"
              color="dimmed"
              component="a"
              target="_blank"
              rel="noopener noreferrer"
              href={`https://www.linkedin.com/in/${selectedProspect.li_public_id}`}
            >
              linkedin.com/in/{selectedProspect.li_public_id}
            </Text>
          </Group>
        )}

        <Flex mt="md">
          <Text fz="sm" fw="bold" mr="xs">
            Fit:
          </Text>
          {selectedProspect.icp_fit_score ? (
            <ICPFitPillOnly icp_fit_score={selectedProspect.icp_fit_score} />
          ) : (
            <Badge color={valueToColor(theme, "NONE")}>None</Badge>
          )}
          {/* <Badge
                          color={valueToColor(theme, icpFitScoreMap.get(selectedProspect.icp_fit_score.toString()) || 'NONE')}
                        >
                          {icpFitScoreMap.get(selectedProspect.icp_fit_score.toString())}
                        </Badge> */}
        </Flex>

        <Flex mt="md">
          <Text fz="sm" fw="bold" mr="xs">
            Reason:
          </Text>
          <Text fz="sm">{selectedProspect.icp_fit_reason || "None"}</Text>
        </Flex>
      </Card>
    </>
  );
}
