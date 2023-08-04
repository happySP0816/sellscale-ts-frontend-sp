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
} from "@mantine/core";
import { openConfirmModal, openContextModal } from "@mantine/modals";
import {
  IconBrain,
  IconBrandLinkedin,
  IconPencil,
  IconTestPipe,
  IconTrash,
} from "@tabler/icons";
import { forwardRef, useEffect, useState } from "react";

import { useRecoilValue } from "recoil";
import { userTokenState } from "@atoms/userAtoms";
import { Archetype, PersonaOverview, ProspectShallow } from "src";

import getICPClassificationPrompt from "@utils/requests/getICPClassificationPrompt";
import { getArchetypeProspects } from "@utils/requests/getArchetypeProspects";
import postRunICPClassification from "@utils/requests/postRunICPClassification";
import { valueToColor } from "@utils/general";
import { getICPOneProspect } from "@utils/requests/getICPOneProspect";
import { showNotification } from "@mantine/notifications";
import { useDebouncedState } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";
import { getProspects } from "@utils/requests/getProspects";
import _, { set } from "lodash";
import {
  getIcpFitScoreMap,
  getScoreFromLabel,
  icpFitToLabel,
} from "@common/pipeline/ICPFitAndReason";
import { updateProspect } from "@utils/requests/updateProspect";

interface ProspectItemProps extends React.ComponentPropsWithoutRef<"div"> {
  label: string;
  icpFit: number;
  title: string;
  company: string;
}

let icpFitScoreMap = new Map<string, string>([
  ["-3", "QUEUED"],
  ["-2", "CALCULATING"],
  ["-1", "ERROR"],
  ["0", "VERY LOW"],
  ["1", "LOW"],
  ["2", "MEDIUM"],
  ["3", "HIGH"],
  ["4", "VERY HIGH"],
]);

const useStyles = createStyles((theme) => ({
  icon: {
    color: theme.colors.gray[6],
  },
}));

export default function Pulse(props: { personaOverview: PersonaOverview }) {
  const theme = useMantineTheme();
  const userToken = useRecoilValue(userTokenState);

  const [loading, setLoading] = useState(false);
  const [currentICPPrompt, setCurrentICPPrompt] = useState("");
  const [testSearchValue, setTestSearchValue] = useDebouncedState("", 300);

  const [sampleProspects, setSampleProspects] = useState<ProspectShallow[]>([]);
  const [overrideMap, setOverrideMap] = useState<Map<number, string>>(
    new Map()
  );

  const [testingPrompt, setTestingPrompt] = useState(false);
  const [detailsOpened, setDetailsOpened] = useState(false);

  const {
    data: prospects,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: [`query-isp-fit-prospects`],
    queryFn: async () => {
      const response = await getProspects(
        userToken,
        undefined,
        "SELLSCALE",
        10000, // TODO: Maybe use pagination method instead
        undefined,
        "ALL",
        props.personaOverview.id,
        true
      );
      const prospects =
        response.status === "success"
          ? (response.data as ProspectShallow[])
          : [];

      setSampleProspects((prev) => {
        return _.uniqBy(
          [...prev, ...prospects.filter((prospect) => prospect.in_icp_sample)],
          "id"
        );
      });
      return prospects;
    },
    refetchOnWindowFocus: false,
  });

  const ProspectSelectItem = forwardRef<HTMLDivElement, ProspectItemProps>(
    ({ label, icpFit, title, company, ...others }: ProspectItemProps, ref) => (
      <div ref={ref} {...others}>
        <Flex justify={"space-between"}>
          <Text>{label}</Text>
          {icpFit ? (
            <Badge
              color={valueToColor(
                theme,
                icpFitScoreMap.get(icpFit.toString()) || "NONE"
              )}
            >
              {icpFitScoreMap.get(icpFit.toString())}
            </Badge>
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
      console.log(
        prospect.icp_fit_score_override,
        overrideMap.get(prospect.id),
        prospect.icp_fit_score
      );

      const overrideLabel = overrideMap.has(prospect.id)
        ? overrideMap.get(prospect.id)
        : prospect.icp_fit_score_override
        ? icpFitToLabel(prospect.icp_fit_score_override)
        : null;
      if (overrideLabel) {
        if (icpFitToLabel(prospect.icp_fit_score) === overrideLabel) {
          correct++;
        }
        checked++;
      }
    }
    return checked === 0
      ? "Unknown"
      : Math.round((correct / checked) * 100) + "%";
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
                      <Text fz="xs" c="dimmed">
                        Prospect Name
                      </Text>
                    </List.Item>
                    <List.Item>
                      <Text fz="xs" c="dimmed">
                        Prospect Title
                      </Text>
                    </List.Item>
                    <List.Item>
                      <Text fz="xs" c="dimmed">
                        Prospect LinkedIn Bio
                      </Text>
                    </List.Item>
                    <List.Item>
                      <Text fz="xs" c="dimmed">
                        Prospect Location
                      </Text>
                    </List.Item>
                    <List.Item>
                      <Text fz="xs" c="dimmed">
                        Prospect Education
                      </Text>
                    </List.Item>
                    <List.Item>
                      <Text fz="xs" c="dimmed">
                        Company Name
                      </Text>
                    </List.Item>
                    <List.Item>
                      <Text fz="xs" c="dimmed">
                        Company Size
                      </Text>
                    </List.Item>
                    <List.Item>
                      <Text fz="xs" c="dimmed">
                        Company Industry
                      </Text>
                    </List.Item>
                    <List.Item>
                      <Text fz="xs" c="dimmed">
                        Company Location
                      </Text>
                    </List.Item>
                    <List.Item>
                      <Text fz="xs" c="dimmed">
                        Company Tagline
                      </Text>
                    </List.Item>
                    <List.Item>
                      <Text fz="xs" c="dimmed">
                        Company Description
                      </Text>
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
            <LoadingOverlay visible={isFetching} />
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
                        loading ? "Grabbing prospects..." : "No prospects found"
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
                          (prospect) =>
                            prospect.id === (parseInt(value || "") || -1)
                        );
                        if (foundProspect) {
                          setSampleProspects((prev) => {
                            return _.uniqBy([...prev, foundProspect], "id");
                          });
                          const response = await updateProspect(
                            userToken,
                            foundProspect.id,
                            undefined,
                            true,
                            undefined
                          );
                        }
                      }}
                    />

                    <Box>
                      <Grid>
                        <Grid.Col span={1}>
                          <Text fz="xs" c="dimmed"></Text>
                        </Grid.Col>
                        <Grid.Col span={8}>
                          <Text fz="xs" c="dimmed">
                            Prospect
                          </Text>
                        </Grid.Col>
                        <Grid.Col span={3}>
                          <Text fz="xs" c="dimmed">
                            Override ICP Fit
                          </Text>
                        </Grid.Col>
                      </Grid>
                    </Box>

                    {sampleProspects.map((prospect, index) => (
                      <Box key={index} m={5} sx={{ position: "relative" }}>
                        <Divider m={5} />

                        <Grid>
                          <Grid.Col span={1}>
                            <ActionIcon
                              onClick={async () => {
                                setSampleProspects((prev) => {
                                  return prev.filter(
                                    (p) => p.id !== prospect.id
                                  );
                                });
                                const response = await updateProspect(
                                  userToken,
                                  prospect.id,
                                  undefined,
                                  false,
                                  undefined
                                );
                              }}
                            >
                              <IconTrash size="0.9rem" />
                            </ActionIcon>
                          </Grid.Col>
                          <Grid.Col span={8}>
                            <ProspectSelectItem
                              label={prospect.full_name}
                              icpFit={prospect.icp_fit_score}
                              title={prospect.title}
                              company={prospect.company}
                            />
                          </Grid.Col>
                          <Grid.Col span={3}>
                            <Select
                              value={
                                overrideMap.get(prospect.id) ||
                                icpFitToLabel(prospect.icp_fit_score)
                              }
                              data={[...getIcpFitScoreMap(true).values()].map(
                                (icp) => {
                                  return {
                                    value: icp,
                                    label: icp,
                                  };
                                }
                              )}
                              onChange={async (value) => {
                                if (!value) return;
                                setOverrideMap((prev) => {
                                  return new Map(prev).set(prospect.id, value);
                                });
                                const response = await updateProspect(
                                  userToken,
                                  prospect.id,
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
                            prospect.id
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
            <Badge
              color={valueToColor(
                theme,
                icpFitScoreMap.get(selectedProspect.icp_fit_score.toString()) ||
                  "NONE"
              )}
            >
              {icpFitScoreMap.get(selectedProspect.icp_fit_score.toString())}
            </Badge>
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
