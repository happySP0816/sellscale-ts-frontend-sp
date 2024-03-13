import {
  ActionIcon,
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  Collapse,
  Container,
  Divider,
  Flex,
  Group,
  HoverCard,
  Loader,
  Modal,
  Paper,
  Popover,
  Stack,
  Text,
  Textarea,
  Title,
  useMantineTheme,
} from "@mantine/core";
import {
  IconBrandLinkedin,
  IconChecks,
  IconChevronDown,
  IconChevronUp,
  IconEdit,
  IconMessages,
  IconNotes,
  IconPencil,
  IconRecordMail,
  IconRocket,
  IconTargetArrow,
  IconUsers,
  IconXboxX,
} from "@tabler/icons";
import { useEffect, useMemo, useState } from "react";
import { useDisclosure } from "@mantine/hooks";
import { TextInput } from "@mantine/core";
import { getRingsIcon, hashString, valueToColor } from "@utils/general";
import { API_URL } from "@constants/data";
import { useRecoilState, useRecoilValue } from "recoil";
import { userDataState, userTokenState } from "@atoms/userAtoms";
import { deterministicMantineColor } from "@utils/requests/utils";
import { postAIRequest } from "@utils/requests/postAIRequest";
import { showNotification } from "@mantine/notifications";
import { useNavigate } from "react-router-dom";
import NewUIEmailSequencing from "@pages/EmailSequencing/NewUIEmailSequencing";
import { CampaignEntityData } from "@pages/CampaignDetail";
import { Carousel } from "@mantine/carousel";
import { useQuery } from "@tanstack/react-query";
import DOMPurify from "dompurify";
import { CtaList, CtaSection } from "@common/sequence/CtaSection";
import PersonaDetailsCTAs from "@common/persona/details/PersonaDetailsCTAs";
import { getPersonasOverview } from "@utils/requests/getPersonas";
import { PersonaOverview } from "src";
import postTogglePersonaActive from "@utils/requests/postTogglePersonaActive";
import { navConfettiState } from "@atoms/navAtoms";
import NewUIEmailSequencingModal from "@modals/NewUIEmailSequencingModal";
import LinkedInSequenceSectionModal from "@modals/LinkedInSequenceSectionModal";

type SequenceProps = {
  campaignOverview: any;
  campaignType: string;
};

export const Sequence = (props: SequenceProps) => {
  let SEQUENCE = props.campaignOverview?.linkedin?.sequence;
  if (props.campaignType === "EMAIL") {
    SEQUENCE = props.campaignOverview?.email?.sequence;
  }

  return (
    <Flex
      direction={"column"}
      p={"lg"}
      style={{ border: "3px solid #0f6cbf" }}
      h={280}
    >
      <Card withBorder>
        <Title order={5}>💡 Review Campaign</Title>
        <Text color="gray" size="sm">
          Review the campaign and provide feedback when necessary for both the
          Contacts and Messaging. The AI will adjust the campaign based on your
          feedback and then launch.
        </Text>
      </Card>

      <Flex mt="md">
        <Card mr="md">
          <Text color="#0f6cbf" size={"lg"} fw={500}>
            # of Contacts:{" "}
            {props.campaignType === "EMAIL"
              ? props.campaignOverview?.overview?.num_prospects_with_emails
              : props.campaignOverview?.overview?.num_prospects}
          </Text>
        </Card>
        <Card>
          <Text color="#0f6cbf" size={"lg"} fw={500}>
            # of steps in sequence: {SEQUENCE?.length} step
            {SEQUENCE?.length > 1 ? "s" : ""}
          </Text>
        </Card>
      </Flex>
    </Flex>
  );
};

type ContactProps = {
  feedback: string;
  onFeedbackChange: (feedback: string) => void;
  campaignOverview?: any;
  campaignId: number;
};

export const Contact = (props: ContactProps) => {
  const [contactData, setContactData] = useState<any>();
  const [showAll, setShowAll] = useState(true);
  const [filterData, setFilterData] = useState<any>();
  const theme = useMantineTheme();
  const [modalOpened, modalHandlers] = useDisclosure(false); // For the edit messaging modal
  const userToken = useRecoilValue(userTokenState);

  const handleShowAll = () => {
    setShowAll(!showAll);
  };
  useEffect(() => {
    const res = props.campaignOverview?.contacts?.sample_contacts?.map(
      (x: any) => {
        return {
          avatar: x?.img_url,
          username: x?.full_name,
          score: x?.icp_fit_score,
          content: x?.title,
          linkedin_url: x?.linkedin_url,
          icp_fit_reason: x?.icp_fit_reason,
        };
      }
    );
    const res_filter =
      props.campaignOverview?.contacts &&
      Object.keys(props.campaignOverview?.contacts)
        .filter((key: string) => key !== "sample_contacts")
        .map((key: string) => {
          if (
            props.campaignOverview?.contacts[key] &&
            props.campaignOverview?.contacts[key].length === 0
          )
            return null;
          return {
            type: key.replaceAll("_", " "),
            jobs: props.campaignOverview?.contacts[key],
          };
        })
        .filter((x: any) => x !== null);
    setFilterData(res_filter);
    setContactData(res);
  }, []);

  return (
    <>
      <Flex
        p={"sm"}
        style={{ border: "1px solid #e3f0fe", borderRadius: "6px" }}
      >
        {" "}
        <Flex direction={"column"} p={"md"} gap={"sm"} w={"100%"}>
          {filterData?.length == 0 && (
            <Flex align={"center"} justify={"center"} w={"100%"} h={"100%"}>
              <Text color="gray" size={"sm"}>
                No filters are set.
              </Text>
            </Flex>
          )}
          {filterData
            ?.filter((item: any, index: number) => item?.jobs?.length > 0)
            .map((item: any, index: number) => {
              return (
                <Flex direction={"column"}>
                  <Text color="gray" tt={"uppercase"} fw={600} size={"sm"}>
                    {item?.type
                      .replaceAll("included ", "")
                      .replaceAll("excluded ", "")
                      .replaceAll("individual ", "contact ")
                      .replaceAll("keywords ", "")}
                  </Text>
                  <Group mb="md" mt="xs">
                    {item?.jobs?.map((job: string) => {
                      return (
                        <p
                          style={{
                            fontSize: "10px",
                            padding: "2px",
                            paddingLeft: "8px",
                            paddingRight: "8px",
                            margin: 2,
                            borderRadius: "8px",
                            backgroundColor:
                              theme.colors[
                                deterministicMantineColor(item?.type)
                              ][2],
                          }}
                        >
                          {job}
                        </p>
                      );
                    })}
                  </Group>
                </Flex>
              );
            })}
        </Flex>
        <Flex
          direction={"column"}
          p={"md"}
          gap={"xs"}
          bg={"#f4f9ff"}
          w={"100%"}
          style={{
            border: "1px solid #89c3fc",
            borderRadius: "6px",
            borderStyle: "dashed",
          }}
        >
          <Flex align={"center"} gap={"sm"} ml={"sm"}>
            <IconUsers size={"1rem"} color="#228be6" />
            <Text tt={"uppercase"} color="blue" w="60%">
              example contacts
            </Text>
            <Button size="xs" w="30%" onClick={() => modalHandlers.open()}>
              View All
            </Button>
          </Flex>

          <Modal
            opened={modalOpened}
            onClose={() => modalHandlers.close()}
            title="View All Contacts"
            size="1000px"
          >
            <iframe
              src={
                // Editable Retool URL: https://sellscale.retool.com/apps/d472bc28-c6d6-11ee-8cc1-4fd0d3627823/Delete%20Prospects%20from%20Campaign
                "https://sellscale.retool.com/embedded/public/20d97ed1-4602-4513-aa77-97f15a210a9d#authToken=" +
                userToken +
                "&campaignId=" +
                props.campaignId
              }
              frameBorder="0"
              width="100%"
              height="400px" // Adjust the height as needed
              allowFullScreen
            ></iframe>
          </Modal>

          <Flex direction={"column"} gap={3}>
            {contactData?.map((item: any, index: number) => {
              return !showAll || index < 5 ? (
                <Flex key={index} align={"center"} gap={"xs"} mb="md">
                  <Avatar
                    src={
                      "https://ui-avatars.com/api/?background=random&name=" +
                      item?.username.replaceAll(" ", "+")
                    }
                    size={30}
                    radius={"xl"}
                  />
                  <Flex direction={"column"} w={"100%"}>
                    <Flex align={"center"} w={"100%"}>
                      <ActionIcon
                        color="blue"
                        onClick={() =>
                          window.open("https://" + item?.linkedin_url, "_blank")
                        }
                      >
                        <IconBrandLinkedin size={"0.8rem"} />
                      </ActionIcon>
                      <Text fw={500} size={"sm"}>
                        {item?.username}
                      </Text>
                      <Badge
                        ml="auto"
                        size="md"
                        color={
                          item?.score == 0
                            ? "red"
                            : item?.score == 1
                            ? "orange"
                            : item?.score == 2
                            ? "yellow"
                            : item?.score == 3
                            ? "green"
                            : item?.score == 4
                            ? "blue"
                            : "gray"
                        }
                        variant="light"
                      >
                        {item?.score == 0
                          ? "Very Low"
                          : item?.score == 1
                          ? "Low"
                          : item?.score == 2
                          ? "Medium"
                          : item?.score == 3
                          ? "High"
                          : item?.score == 4
                          ? "Very High"
                          : "Not Scored"}
                      </Badge>
                    </Flex>
                    <Text color="gray" size={"xs"} mt={3}>
                      {item?.content}
                    </Text>
                    <Text size="xs" color="gray">
                      {item?.icp_fit_reason
                        ?.split("), (")
                        .map((x: string) =>
                          x.replaceAll("(", "").replaceAll(")", "")
                        )
                        .join(", ")}
                    </Text>
                  </Flex>
                </Flex>
              ) : (
                <></>
              );
            })}
          </Flex>
          <Flex w={"100%"} justify={"end"}>
            {contactData?.length > 5 && (
              <Button
                variant="subtle"
                color="blue"
                onClick={handleShowAll}
                p={0}
              >
                {showAll ? `+${contactData.length - 5} more` : "show less"}
              </Button>
            )}
          </Flex>
        </Flex>
      </Flex>

      <Textarea
        label="Feedback for AI"
        description="Provide feedback to the AI to adjust your contacts prior to launch."
        defaultValue={props.feedback}
        placeholder="ex. I primarily only want to target New Jersey and Canada. Can we focus on those territories? Additionally, VP of Marketing may not be the exact right target for this campaign."
        minRows={4}
        onChange={(event) => props.onFeedbackChange(event.currentTarget.value)}
      />
    </>
  );
};

type MessagingProps = {
  feedback: string;
  onFeedbackChange: (feedback: string) => void;
  campaignOverview?: CampaignEntityData;
  refetchCampaignOverview?: () => void;
  campaignType: string;
  campaignId: number;
};

export const Messaging = (props: MessagingProps) => {
  const [opened, { toggle }] = useDisclosure(false);
  const [editMessage, setEditMessage] = useState(""); // State to hold the edited message

  const [openid, setOpenId] = useState<number>(0);
  const userData = useRecoilValue(userDataState);
  const userToken = useRecoilValue(userTokenState);

  let SEQUENCE = props.campaignOverview?.linkedin?.sequence;
  if (props.campaignType === "EMAIL") {
    SEQUENCE = props.campaignOverview?.email?.sequence;
  }

  const [
    emailSequencingOpened,
    { open: openEmailSequencing, close: closeEmailSequencing },
  ] = useDisclosure();
  const [
    linkedinSequenceSectionOpened,
    { open: openLinkedinSequenceSection, close: closeLinkedinSequenceSection },
  ] = useDisclosure();

  // const fetchAttachedAssets = () => {
  //   fetch(`${API_URL}/email_sequence/get_all_asset_mapping?sequence_step_id=${sequence_step_id}`, {
  //     method: 'GET',
  //     headers: {
  //       'Content-Type': 'application/json',
  //       Authorization: 'Bearer ' + userToken,
  //     },
  //   })
  //     .then((response) => response.json())
  //     .then((data) => {
  //       setAttachedAssets(data.mappings);
  //     })
  //     .catch((error) => console.error('Failed to fetch attached assets', error));
  // };

  const messageData = SEQUENCE?.map((x) => {
    return {
      step: x?.title,
      avatar: "",
      username: userData?.sdr_name,
      message: x?.description,
      // @ts-ignore
      delay: x?.bump_framework_delay,
      assets: x?.assets,
    };
  });
  const handleToggle = (id: number) => {
    toggle();
    setOpenId(id);
  };
  useEffect(() => {
    toggle();
  }, []);

  const { data: assetIcons } = useQuery({
    queryKey: [`query-asset-icons`],
    queryFn: async () => {
      const assetMap = new Map<string, string>();
      for (const asset of props.campaignOverview?.assets_used ?? []) {
        assetMap.set(
          asset.title,
          await getRingsIcon(
            `${hashString(JSON.stringify(asset), Number.MAX_VALUE)}`
          )
        );
      }
      return assetMap;
    },
    refetchOnWindowFocus: false,
  });

  const { data: persona } = useQuery({
    queryKey: [`query-personas-data`],
    queryFn: async () => {
      const response = await getPersonasOverview(userToken);
      const personas =
        response.status === "success"
          ? (response.data as PersonaOverview[])
          : [];
      return personas.find((persona) => persona.id === props.campaignId);
    },
    refetchOnWindowFocus: false,
  });

  const CAROUSEL_HEIGHT = 200;

  return (
    <>
      {false && (
        <Flex
          p={"md"}
          direction={"column"}
          gap={"md"}
          style={{ border: "1px solid #e3f0fe", borderRadius: "6px" }}
        >
          <Box>
            <Title order={4}>Assets Used</Title>
            <Text>Here are the assets used in this campaign</Text>
          </Box>
          <Carousel slideSize="70%" height={CAROUSEL_HEIGHT} slideGap="md" loop>
            {props.campaignOverview?.assets_used?.map((asset, index) => (
              <Carousel.Slide key={index}>
                <Paper h={CAROUSEL_HEIGHT}>
                  <Stack
                    spacing={5}
                    h={CAROUSEL_HEIGHT}
                    justify="space-between"
                  >
                    <Stack spacing={5}>
                      <Group spacing={5} noWrap>
                        <Avatar
                          m="sm"
                          radius={30}
                          size={30}
                          src={`data:image/svg+xml;utf8,${encodeURIComponent(
                            assetIcons?.get(asset.title) ?? ""
                          )}`}
                          alt={asset.title}
                        />
                        <Title order={5}>{asset.title}</Title>
                      </Group>
                      <Container>
                        <Text color="gray.8" fz="xs" fw={400}>
                          <div
                            dangerouslySetInnerHTML={{
                              __html: DOMPurify.sanitize(asset.value),
                            }}
                          />
                        </Text>
                      </Container>
                    </Stack>
                    <Stack spacing={5} mih={50}>
                      <Divider />
                      <Container>
                        <Text fz="xs" c="dimmed">
                          {asset.reason}
                        </Text>
                      </Container>
                    </Stack>
                  </Stack>
                </Paper>
              </Carousel.Slide>
            ))}
          </Carousel>
        </Flex>
      )}
      <Flex
        p={"md"}
        direction={"column"}
        gap={"md"}
        style={{ border: "1px solid #e3f0fe", borderRadius: "6px" }}
      >
        <Box>
          <Title order={4}>Sequences Generated</Title>
          <Text>The generated sequences from the assets.</Text>
        </Box>

        {messageData?.map((item, index) => {
          return (
            <>
              <Box>
                {item?.delay ? (
                  <Badge color="blue" variant="outline">
                    Wait {item?.delay} days
                  </Badge>
                ) : null}
              </Box>
              <Flex w={"100%"} align={"center"} gap={8}>
                <IconTargetArrow color="gray" size={"1.5rem"} />
                <Flex>
                  <Text
                    tt={"uppercase"}
                    color="gray"
                    className="w-max"
                    fw={500}
                  >
                    step {index + 1}:
                  </Text>
                </Flex>
                <Flex>
                  <Text className="w-max" tt={"uppercase"} fw={500}>
                    {item?.step}
                  </Text>
                </Flex>
                <Divider w={"100%"} />
                <Button
                  tt={"uppercase"}
                  rightIcon={
                    openid === index && opened ? (
                      <IconChevronUp size={"0.9rem"} />
                    ) : (
                      <IconChevronDown size={"0.9rem"} />
                    )
                  }
                  onClick={() => handleToggle(index)}
                  variant="light"
                  size="xs"
                  radius="xl"
                >
                  {openid === index && opened ? "hide" : "show"}
                </Button>
              </Flex>
              {openid === index && (
                <Collapse in={opened}>
                  <Flex
                    direction={"column"}
                    p={"md"}
                    gap={"xs"}
                    bg={"#f4f9ff"}
                    style={{
                      border: "1px solid #89c3fc",
                      borderRadius: "6px",
                      borderStyle: "dashed",
                    }}
                  >
                    <Flex align={"center"} justify={"space-between"}>
                      <Flex align={"center"} gap={"sm"}>
                        <IconMessages color="#228be6" />
                        <Text tt={"uppercase"} color="blue" fw={600}>
                          example message
                        </Text>
                        {item.assets && (
                          <HoverCard
                            width={280}
                            shadow="md"
                            disabled={item.assets.length == 0}
                          >
                            <HoverCard.Target>
                              <Badge color="green">
                                {item.assets.length} used assets
                              </Badge>
                            </HoverCard.Target>
                            <HoverCard.Dropdown>
                              <Text fz="sm" fw="bold">
                                Assets Used:
                              </Text>
                              {item.assets.map((asset, index) => (
                                <Text key={index} fz="sm">
                                  - {asset.asset_key}
                                </Text>
                              ))}
                            </HoverCard.Dropdown>
                          </HoverCard>
                        )}
                      </Flex>
                    </Flex>
                    <Flex align={"center"} gap={"sm"}>
                      <Avatar src={item?.avatar} radius={"xl"} />
                      <Text fw={600} size={"sm"}>
                        {item?.username}
                      </Text>
                    </Flex>
                    <Text size={"xs"} fs="italic" fw={500}>
                      {/* if campaign type is LINKEDIN, show message as is. if email, show html in dangerously set */}
                      {
                        <div
                          dangerouslySetInnerHTML={{
                            __html: item?.message.replaceAll("\n", "<br/>"),
                          }}
                        />
                      }
                    </Text>
                    {!persona?.template_mode &&
                      persona?.linkedin_active &&
                      props.campaignType === "LINKEDIN" && (
                        <CtaList personaId={props.campaignId} />
                      )}
                  </Flex>
                </Collapse>
              )}
            </>
          );
        })}
      </Flex>
      <Button
        onClick={() => {
          if (props.campaignType === "LINKEDIN") {
            openLinkedinSequenceSection();
          } else {
            openEmailSequencing();
          }
          // const campaignType =
          //   props.campaignType === "LINKEDIN" ? "linkedin" : "email";
          // window.open(
          //   "/setup/" + campaignType + "?campaign_id=" + props.campaignId,
          //   "_blank"
          // );
        }}
        mt="md"
        ml="auto"
        mr="auto"
        leftIcon={<IconPencil size={"1rem"} />}
        variant="outline"
        color="grape"
      >
        Edit Messaging in Campaign Editor
      </Button>

      {/* Modals to review the sequencing */}
      {props.campaignType === "LINKEDIN" ? (
        <LinkedInSequenceSectionModal
          opened={linkedinSequenceSectionOpened}
          onClose={closeLinkedinSequenceSection}
          archetypeID={props.campaignId}
          backFunction={props.refetchCampaignOverview}
        />
      ) : (
        <NewUIEmailSequencingModal
          opened={emailSequencingOpened}
          onClose={closeEmailSequencing}
          archetypeID={props.campaignId}
          backFunction={props.refetchCampaignOverview}
        />
      )}

      <Textarea
        label="Feedback for AI"
        description="Provide feedback to the AI to adjust your messaging prior to launch."
        defaultValue={props.feedback}
        placeholder="ex. For bump #1, instead of saying 'I saw you were the VP of Marketing at Acme Corp', can we say 'I saw you were the VP of Marketing at Acme Corp, and I noticed you're hiring for a new marketing manager. I'd love to learn more about the role and see if I can help.' Also, in general, let's add a 👋 emoji to the first message!"
        minRows={4}
        onChange={(event) => props.onFeedbackChange(event.currentTarget.value)}
      />
    </>
  );
};

interface CampaignFeedback {
  campaign_id: number;
  prospect_feedback: string;
  messaging_feedback: string;
}

function Finalize(props: CampaignFeedback) {
  const [prospectFeedback, setProspectFeedback] = useState(
    props.prospect_feedback
  );
  const [messagingFeedback, setMessagingFeedback] = useState(
    props.messaging_feedback
  );

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <Card>
        <Card withBorder>
          <Title order={4} mb="xs">
            Contacts Feedback
          </Title>
          <Text>
            {prospectFeedback.length > 0 ? (
              <i>{'"' + prospectFeedback + '"'}</i>
            ) : (
              <Text color="gray" size="sm">
                No feedback provided
              </Text>
            )}
          </Text>
        </Card>

        <Card withBorder mt="md">
          <Title order={4} mb="xs">
            Messaging Feedback
          </Title>
          <Text>
            {messagingFeedback.length > 0 ? (
              <i>{'"' + messagingFeedback + '"'}</i>
            ) : (
              <Text color="gray" size="sm">
                No feedback provided
              </Text>
            )}
          </Text>
        </Card>

        <Divider />
        <Flex mt="sm">
          {prospectFeedback.length > 0 || messagingFeedback.length > 0 ? (
            <Text color="gray" size="sm">
              💡 Since feedback was provided, SellScale AI will adjust the
              messaging and notify you once the campaign is ready to launch.
            </Text>
          ) : (
            <Text color="gray" size="sm">
              🚀 No feedback was provided. Your campaign can be launched
              immediately!
            </Text>
          )}
        </Flex>
      </Card>
    </div>
  );
}

type CampaignReviewLinkedinProps = {
  onTaskComplete?: () => void;
  campaignId: number;
  campaignType: string;
};

export default function CampaignReview(props: CampaignReviewLinkedinProps) {
  const [opened, { open, close }] = useDisclosure(true);
  const [steps, setSteps] = useState("sequence");

  const [contactFeedback, setContactFeedback] = useState("");
  const [messagingFeedback, setMessagingFeedback] = useState("");

  const [finalizingFeedback, setFinalizingFeedback] = useState(false);
  const userToken = useRecoilValue(userTokenState);

  const [campaignOverview, setCampaignOverview] =
    useState<CampaignEntityData>();
  const [fetchingCampaign, setFetchingCampaign] = useState<boolean>(false);

  const navigate = useNavigate();

  const submitFeedbackHandler = () => {
    setFinalizingFeedback(true);

    // Submit AI Request
    const campaign_name = campaignOverview?.overview?.archetype_name;
    postAIRequest(
      userToken,
      `Please address the feedback for the campaign titled ${campaign_name} then launch it.\n\nContact Feedback: ${contactFeedback}\nMessaging Feedback: ${messagingFeedback}`
    ).then((res) => {
      props.onTaskComplete && props.onTaskComplete();
      setFinalizingFeedback(false);

      showNotification({
        title: "Feedback Requested",
        message:
          "SellScale AI will make the necessary adjustments to the campaign based on your feedback. You will be notified once the campaign is ready to launch.",
        color: "green",
        icon: <IconRocket size="1.5rem" />,
      });
    });
  };

  const launchCampaignHandler = () => {
    setFinalizingFeedback(true);

    // Launch the campaign
    const campaign_name = campaignOverview?.overview?.archetype_name;

    postTogglePersonaActive(
      userToken,
      props.campaignId,
      props.campaignType.toLowerCase(),
      true
    ).then((res) => {
      props.onTaskComplete && props.onTaskComplete();
      setFinalizingFeedback(false);

      const [_confetti, dropConfetti] = useRecoilState(navConfettiState);
      dropConfetti(300);

      showNotification({
        title: "Campaign Launched!",
        message:
          "The campaign has been successfully launched. Outbound will start soon and you will be notified once the campaign has been completed.",
        color: "green",
        icon: <IconRocket size="1.5rem" />,
      });
    });
  };

  const getCampaignOverview = async () => {
    setFetchingCampaign(true);

    let return_raw_prompts = false;
    if (props.campaignType === "EMAIL") {
      return_raw_prompts = true;
    }

    const response = await fetch(
      `${API_URL}/client/campaign_overview?client_archetype_id=${props.campaignId}&return_raw_prompts=${return_raw_prompts}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    setFetchingCampaign(false);

    const data = await response.json();
    setCampaignOverview(data);

    console.log(data);
  };

  useEffect(() => {
    getCampaignOverview();
  }, [props.campaignId]);

  const handleGoBack = () => {
    if (steps === "sequence") return;
    if (steps === "contact") setSteps("sequence");
    if (steps === "messaging") setSteps("contact");
    if (steps === "finalize") setSteps("messaging");
  };

  const handleGoNext = () => {
    if (steps === "sequence") setSteps("contact");
    if (steps === "contact") setSteps("messaging");
    if (steps === "messaging") setSteps("finalize");
    if (steps === "finalize") return;
  };

  if (fetchingCampaign) {
    return (
      <div
        style={{
          display: "flex",
          paddingTop: "40px",
          width: "900px",
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        <Card
          w="900px"
          withBorder
          pb="100px"
          pt="60px"
          sx={{ justifyContent: "center", alignItems: "center" }}
        >
          <Flex align="center" justify={"center"} w="100%" direction="column">
            <Text size="xl" align="center" fw="bold" mb="4px">
              Fetching campaign data...
            </Text>
            <Text mt="xs">
              Please wait while we fetch the campaign data. This can take
              anywhere from 20-60 seconds.
            </Text>
            <Loader size="xl" mt="xl" />
          </Flex>
        </Card>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        paddingTop: "40px",
        width: "900px",
        marginLeft: "auto",
        marginRight: "auto",
      }}
    >
      <Flex direction={"column"} gap={"md"} w="900px">
        <Flex align={"center"} gap={"sm"}>
          <Text fw={600}>
            {campaignOverview?.overview?.emoji}{" "}
            {campaignOverview?.overview?.archetype_name}
          </Text>
          {props.campaignType === "LINKEDIN" ? (
            <Badge
              color="blue"
              variant="filled"
              size="md"
              leftSection={
                <IconBrandLinkedin size="0.8rem" style={{ marginTop: "4px" }} />
              }
            >
              LinkedIn
            </Badge>
          ) : (
            <Badge
              color="blue"
              variant="filled"
              size="md"
              leftSection={
                <IconRecordMail size="0.8rem" style={{ marginTop: "4px" }} />
              }
            >
              Email
            </Badge>
          )}
        </Flex>
        <Flex align={"center"} gap={"md"}>
          <Badge color="blue" w={"100%"} variant="filled" size="lg">
            1. Sequence
          </Badge>
          <Divider
            w={"100%"}
            size={2}
            color={
              steps === "contact" ||
              steps === "messaging" ||
              steps === "finalize"
                ? "#89c3fc"
                : "#ced4da"
            }
          />
          <Badge
            color="blue"
            w={"100%"}
            variant={
              steps === "contact" ||
              steps === "messaging" ||
              steps === "finalize"
                ? "filled"
                : "outline"
            }
            size="lg"
          >
            2. Contacts
          </Badge>
          <Divider
            w={"100%"}
            size={2}
            color={
              steps === "messaging" || steps === "finalize"
                ? "#89c3fc"
                : "#ced4da"
            }
          />
          <Badge
            color="blue"
            w={"100%"}
            variant={
              steps === "messaging" || steps === "finalize"
                ? "filled"
                : "outline"
            }
            size="lg"
          >
            3. Messaging
          </Badge>
          <Divider
            w={"100%"}
            size={2}
            color={steps === "finalize" ? "#89c3fc" : "#ced4da"}
          />
          <Badge
            color="blue"
            w={"100%"}
            variant={steps === "finalize" ? "filled" : "outline"}
            size="lg"
          >
            4. Complete
          </Badge>
        </Flex>
        {steps === "sequence" ? (
          <Sequence
            campaignOverview={campaignOverview}
            campaignType={props.campaignType}
          />
        ) : steps === "contact" ? (
          <Contact
            feedback={contactFeedback}
            onFeedbackChange={setContactFeedback}
            campaignOverview={campaignOverview}
            campaignId={props.campaignId}
          />
        ) : steps === "messaging" ? (
          <Messaging
            feedback={messagingFeedback}
            onFeedbackChange={setMessagingFeedback}
            campaignOverview={campaignOverview}
            refetchCampaignOverview={getCampaignOverview}
            campaignType={props.campaignType}
            campaignId={props.campaignId}
          />
        ) : (
          <Finalize
            campaign_id={1}
            prospect_feedback={contactFeedback}
            messaging_feedback={messagingFeedback}
          />
        )}
        <Flex align={"center"} justify={"space-between"} w="900px">
          <Flex align={"center"} gap={"sm"} ml="auto">
            <Button
              onClick={handleGoBack}
              disabled={steps === "sequence"}
              w={180}
              ml="xs"
              mr="xs"
            >
              Go back
            </Button>
            {steps === "finalize" ? (
              <>
                {contactFeedback.length > 0 || messagingFeedback.length > 0 ? (
                  <Button
                    variant="filled"
                    color="orange"
                    leftIcon={<IconNotes size={"0.9rem"} />}
                    px={40}
                    onClick={submitFeedbackHandler}
                    loading={finalizingFeedback}
                  >
                    Give Feedback
                  </Button>
                ) : (
                  <Button
                    variant="filled"
                    color="green"
                    leftIcon={<IconRocket size={"0.9rem"} />}
                    px={40}
                    onClick={launchCampaignHandler}
                    loading={finalizingFeedback}
                  >
                    Launch Campaign
                  </Button>
                )}
              </>
            ) : (
              <Button onClick={handleGoNext} w={180}>
                Next
              </Button>
            )}
          </Flex>
        </Flex>
      </Flex>
    </div>
  );
}
