import { emailSequenceState, linkedinSequenceState, userDataState, userTokenState } from "@atoms/userAtoms";
import SubjectDropdown from "@common/campaigns/SubjectDropdown";
import BracketGradientWrapper from "@common/sequence/BracketGradientWrapper";
import { constrainPoint } from "@fullcalendar/core/internal";
import {
  ActionIcon,
  Avatar,
  Badge,
  Box,
  Button,
  Center,
  Collapse,
  Divider,
  Flex,
  Loader,
  Paper,
  SegmentedControl,
  Select,
  Skeleton,
  Text,
  Title,
  Tooltip,
} from "@mantine/core";
import { modals, openContextModal } from "@mantine/modals";
import {
  IconArrowLeft,
  IconArrowRight,
  IconBrandLinkedin,
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronUp,
  IconMail,
  IconMailOpened,
  IconMessages,
  IconPlus,
  IconPoint,
  IconQuestionMark,
} from "@tabler/icons";
import { fetchCampaignSequences } from "@utils/requests/campaignOverview";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useRecoilState, useRecoilValue } from "recoil";
import { SubjectLineTemplate } from "src";

interface linkedinSequence {
  active: boolean;
  assets: any[];
  bump_framework_id: number;
  bumped_count: number;
  description: string;
}

export type linkedinSequencesDataType = Array<Array<linkedinSequence>>;

interface emailSequence {
  active: boolean;
  assets: any[];
  id?: number;
  bump_framework_id: number;
  bumped_count: number;
  description: string;
}

export type emailSequencesDataType = Array<Array<emailSequence>>;

export default function Sequences(props: any) {
  const id = Number(useParams().id);
  const userToken = useRecoilValue(userTokenState);

  const [loadingSequences, setLoadingSequences] = useState(true);
  const [linkedinInitialMessageViewing, setLinkedinInitialMessageViewing] = useState<any>(0);
  const [sequences, setSequences] = useState<any[]>([]);
  const [type, setType] = useState("email");
  const [linkedinSequenceViewingArray, setLinkedinSequenceViewingArray] = useState<any[]>([]);
  const [emailSequenceViewingArray, setEmailSequenceViewingArray] = useState<any[]>([]);
  const [createTemplateBuilder, setCreateTemplateBuilder] = useState(false);
  const emailSubjectLines = props.emailSubjectLines;
  const setEmailSubjectLines = props.setEmailSubjectLines;
  const setLinkedinInitialMessages = props.setLinkedinInitialMessages;
  const linkedinInitialMessages = props.linkedinInitialMessages;

  const [linkedinSequenceData, setLinkedinSequenceData] = useRecoilState(linkedinSequenceState);
  const [emailSequenceData, setEmailSequenceData] = useRecoilState(emailSequenceState);

  const [selectStep, setSelectStep] = useState<number | null>(null);
  const [opened, setOpened] = useState(false);

  const clientArchetypeId = Number(id);
  const userData = useRecoilValue(userDataState);

  const refetchSequenceData = async (clientArchetypeId: number) => {
    setLoadingSequences(true);
    const sequencesPromise = fetchCampaignSequences(userToken, clientArchetypeId);
    sequencesPromise
      .then((sequencesData) => {
        setEmailSubjectLines(sequencesData.email_subject_lines);
        setLinkedinInitialMessages(sequencesData.initial_message_templates);
        setLinkedinInitialMessageViewing(sequencesData.initial_message_templates?.[0]?.title);
        const groupSequencesByBumpedCount = (sequences: any[]) =>
          sequences.reduce((acc: any, sequence: any) => {
            let bumpedCount = sequence.bumped_count || 0;
            const statusAdjustment =
              sequence.overall_status === "PROSPECTED" ? 0 : sequence.overall_status === "ACCEPTED" ? 10 : sequence.overall_status === "BUMPED" ? 20 : 0;
            bumpedCount += statusAdjustment;
            if (!acc[bumpedCount]) acc[bumpedCount] = [];
            acc[bumpedCount].push(sequence);
            return acc;
          }, {});

        const orderGroupedSequences = (groupedSequences: any) =>
          Object.keys(groupedSequences)
            .sort((a, b) => Number(a) - Number(b))
            .map((key) => groupedSequences[key]);

        const handleSequences = (sequences: any[], type: string) => {
          const groupedSequences = groupSequencesByBumpedCount(sequences);
          const orderedGroupedSequences = orderGroupedSequences(groupedSequences);
          setSequences(orderedGroupedSequences);
          props.setSequences(orderedGroupedSequences);
          console.log("orderedGroupedSequences", orderedGroupedSequences);
          setType(type);
          if (type === "linkedin") {
            setLinkedinSequenceViewingArray(orderedGroupedSequences.map((group) => group[0].title));
            setLinkedinSequenceData(orderedGroupedSequences);
          } else {
            setEmailSequenceViewingArray(orderedGroupedSequences.map((group) => group[0].title));
            setEmailSequenceData(orderedGroupedSequences);
          }
        };

        if (sequencesData.linkedin_sequence.length > 0 && sequencesData.email_sequence.length === 0) {
          handleSequences(sequencesData.linkedin_sequence, "linkedin");
        } else if (sequencesData.email_sequence.length > 0 && sequencesData.linkedin_sequence.length === 0) {
          handleSequences(sequencesData.email_sequence, "email");
        } else if (sequencesData.email_sequence.length > 0 && sequencesData.linkedin_sequence.length > 0) {
          handleSequences(sequencesData.email_sequence, "email");
          setLinkedinSequenceViewingArray(orderGroupedSequences(groupSequencesByBumpedCount(sequencesData.linkedin_sequence)).map((group) => group[0].title));
          setLinkedinSequenceData(orderGroupedSequences(groupSequencesByBumpedCount(sequencesData.linkedin_sequence)));
          console.log("linkedin is", orderGroupedSequences(groupSequencesByBumpedCount(sequencesData.linkedin_sequence)));
          console.log("emailSequenceData", orderGroupedSequences(groupSequencesByBumpedCount(sequencesData.email_sequence)));
        } else {
          setSequences([]);
          props.setSequences([]);
          setType("email");
          setEmailSequenceData([]);
          setLinkedinSequenceData([]);
          setEmailSequenceViewingArray([]);
          setLinkedinSequenceViewingArray([]);
        }
        setLoadingSequences(false);
      })
      .catch((error) => {
        console.error("Error fetching sequences", error);
        setLoadingSequences(false);
      });
  };

  const handleToggle = (key: number) => {
    if (selectStep === key) {
      setOpened(!opened);
    } else {
      setOpened(true);
      setSelectStep(key);
    }
    setSelectStep(key);
  };

  useEffect(() => {
    refetchSequenceData(clientArchetypeId);
  }, []);

  //keep the recoil state in sync with the local state
  // useEffect(() => {
  //   setLinkedinSequenceData(linkedinSequenceData);
  //   setEmailSequenceData(emailSequenceData);
  // }, [linkedinSequenceData, emailSequenceData]);

  return (
    <Paper data-tour="sequences" withBorder>
      <Flex align={"center"} justify={"space-between"} p={"md"} style={{ borderBottom: "1px solid #ECEEF1" }}>
        <Flex align="center" gap="xs">
          <Text fw={600} size={20} color="#37414E">
            Sequences
          </Text>
          <Tooltip
            label={
              <Text size="sm">
                Generate or manually create custom sequences to guide your outreach strategy.
                <br></br>
              </Text>
            }
            withArrow
            position="right"
          >
            <Text color="#37414E" size="xs">
              <IconQuestionMark size={"1rem"} color="#37414E" />
            </Text>
          </Tooltip>
          {/* {sequences && sequences.length > 0 && ( */}
          {sequences && (
            <SegmentedControl
              value={type}
              onChange={(value: any) => {
                setType(value);
                if (value === "email") {
                  setSequences(emailSequenceData);
                  props.setSequences(emailSequenceData);
                } else {
                  setSequences(linkedinSequenceData);
                  props.setSequences(linkedinSequenceData);
                }
              }}
              data={[
                {
                  value: "email",
                  label: (
                    <Center style={{ gap: 4 }}>
                      <IconMailOpened size={"1.2rem"} fill="orange" color="white" />
                      <Text fw={500}>Email</Text>
                    </Center>
                  ),
                },
                {
                  value: "linkedin",
                  label: (
                    <Center style={{ gap: 4 }}>
                      <IconBrandLinkedin size={"1.4rem"} fill="#3B85EF" color="white" />
                      <Text fw={500}>Linkedin</Text>
                    </Center>
                  ),
                },
              ]}
            />
          )}
        </Flex>
        {/* {sequences && sequences.length > 0 ? ( */}
        {sequences ? (
          <Flex gap={"sm"}>
            <Button
              leftIcon={<IconPlus size={"0.9rem"} />}
              onClick={() => {
                openContextModal({
                  modal: "campaignTemplateEditModal",
                  title: <Title order={3}>Sequence Builder</Title>,
                  innerProps: {
                    sequenceType: type,
                    linkedinInitialMessages,
                    emailSubjectLines,
                    linkedinSequenceData,
                    emailSequenceData,
                    campaignId: id,
                    createTemplateBuilder,
                    refetchSequenceData,
                    setCreateTemplateBuilder,
                    // setSequences,
                  },
                  centered: true,
                  styles: {
                    content: {
                      minWidth: "1100px",
                    },
                  },
                  onClose: () => {
                    const clientArchetypeId = Number(id);
                    refetchSequenceData(clientArchetypeId);
                  },
                });
              }}
            >
              Add
            </Button>
            {/* {type === "linkedin" && ( */}
            <Button
              variant="outline"
              rightIcon={<IconArrowRight size={"0.9rem"} />}
              // onClick={() => {
              //   setShowLinkedInConvoSimulatorModal(true);
              // }}
              onClick={() => {
                window.open(`/setup/${type}/${id}`, "_blank");
              }}
            >
              Edit & Simulate
            </Button>
            {/* )} */}
            {/* <Button
                    onClick={() => {
                      openContextModal({
                        modal: "campaignTemplateModal",
                        title: <Title order={3}>{createTemplateBuilder ? "Template Builder" : "Template"}</Title>,
                        innerProps: {
                          campaignId: id,
                          createTemplateBuilder,
                          setCreateTemplateBuilder,
                          setSequences,
                        },
                        centered: true,
                        styles: {
                          content: {
                            minWidth: "1100px",
                          },
                        },
                        onClose: () => {
                          const clientArchetypeId = Number(id);
                          refetchSequenceData(clientArchetypeId);
                        },
                      });
                    }}
                  >
                    Edit
                  </Button> */}
          </Flex>
        ) : (
          <Button
            leftIcon={<IconPlus size={"0.9rem"} />}
            onClick={() => {
              openContextModal({
                modal: "campaignTemplateModal",
                title: <Title order={3}>{createTemplateBuilder ? "Template Builder" : "Template"}</Title>,
                innerProps: {
                  campaignId: id,
                  createTemplateBuilder,
                  setCreateTemplateBuilder,
                  setSequences,
                },
                centered: true,
                styles: {
                  content: {
                    minWidth: "1100px",
                  },
                },
              });
            }}
          >
            Add
          </Button>
        )}
      </Flex>
      <Flex h={"20%"} mt={"md"}>
        {loadingSequences ? (
          <Flex direction="column" align="center" justify="center" m="auto" mt="sm">
            <Skeleton height={30} radius="xl" width="80%" />
            <Skeleton height={20} radius="xl" width="60%" mt="sm" />
            <Skeleton height={20} radius="xl" width="60%" mt="sm" />
            <Flex align="center" gap="sm" mt="sm">
              <Loader color="gray" variant="dots" size="md" />
              <Text color="gray" size="md" className="loading-animation">
                Loading sequences...
              </Text>
            </Flex>
          </Flex>
        ) : (sequences && sequences.length > 0) || (linkedinInitialMessages?.length > 0 && type === "linkedin") ? (
          <Flex direction={"column"} h={"fit-content"} w={"100%"}>
            <Flex w={"100%"} gap={"md"} direction={"column"} p={"lg"}>
              {type === "linkedin" && linkedinInitialMessages && linkedinInitialMessages.length > 0 && (
                <Box
                  style={{
                    border: "1px solid #ced4da",
                    borderRadius: "8px",
                    marginBottom: "1rem",
                  }}
                >
                  <Flex align={"center"} justify={"space-between"} px={"sm"} py={"xs"}>
                    <Flex mx="lg" align={"center"} gap={"xs"}>
                      <IconMessages color="#228be6" size={"0.9rem"} />
                      <Text color="gray" fw={500} size={"xs"}>
                        Initial Message:
                      </Text>
                      <Select
                        defaultValue={linkedinInitialMessages[0].title}
                        onChange={(value) => setLinkedinInitialMessageViewing(value)}
                        data={linkedinInitialMessages.map((option: any) => ({
                          value: option.title,
                          label: option.title,
                        }))}
                        size="xs"
                        styles={{
                          root: { marginLeft: "-5px" },
                          input: { fontWeight: 600 },
                        }}
                      />
                    </Flex>
                  </Flex>
                  <Collapse in={true}>
                    <Flex gap={"sm"} p={"sm"} style={{ borderTop: "1px solid #ced4da" }}>
                      <Avatar size={"md"} radius={"xl"} src={userData.img_url} />
                      <Box>
                        <Text fw={600} size={"sm"}>
                          {linkedinInitialMessages[0]?.name}
                        </Text>
                        <Text fw={500} size={"xs"}>
                          <BracketGradientWrapper>
                            {linkedinInitialMessages.find((msg: any) => msg.title === linkedinInitialMessageViewing)?.message.replace(/\n/g, "<br/>")}
                          </BracketGradientWrapper>
                        </Text>
                      </Box>
                    </Flex>
                  </Collapse>
                </Box>
              )}
              {sequences.map((item: any, index: number) => {
                return (
                  <VariantSelect
                    item={item}
                    index={index}
                    selectStep={selectStep}
                    handleToggle={handleToggle}
                    opened={opened}
                    type={type}
                    userData={userData}
                    emailSubjectLines={emailSubjectLines}
                    emailSequenceViewingArray={emailSequenceViewingArray}
                    linkedinSequenceViewingArray={linkedinSequenceViewingArray}
                    setLinkedinSequenceViewingArray={setLinkedinSequenceViewingArray}
                    setEmailSequenceViewingArray={setEmailSequenceViewingArray}
                  />
                );
              })}
            </Flex>
          </Flex>
        ) : (
          <Flex
            mb="xl"
            direction="column"
            align="center"
            justify="center"
            m="auto"
            sx={(theme) => ({
              border: "2px dotted gray",
              borderRadius: "15px",
              padding: "10px", // Reduced padding to make the area less height
              cursor: "pointer",
              transition: "transform 0.2s, background-color 0.2s",
              "&:hover": {
                transform: "scale(1.05)",
                backgroundColor: theme.colors.gray[0],
              },
            })}
            onClick={() => {
              openContextModal({
                modal: "campaignTemplateEditModal",
                title: <Title order={3}>Sequence Builder</Title>,
                innerProps: {
                  sequenceType: type,
                  linkedinInitialMessages,
                  emailSubjectLines,
                  linkedinSequenceData,
                  emailSequenceData,
                  campaignId: id,
                  createTemplateBuilder,
                  setCreateTemplateBuilder,
                  setSequences,
                },
                centered: true,
                styles: {
                  content: {
                    minWidth: "1100px",
                  },
                },
                onClose: () => {
                  const clientArchetypeId = Number(id);
                  refetchSequenceData(clientArchetypeId);
                },
              });
            }}
          >
            <Flex align="center" gap="xs">
              <Text color="gray" fw={400} size={"sm"}>
                There are no sequences here. Add one to get started.
              </Text>
              <ActionIcon>
                <IconPlus size={"1.2rem"} />
              </ActionIcon>
            </Flex>
          </Flex>
        )}
      </Flex>
    </Paper>
  );
}

const VariantSelect = (props: any) => {
  const {
    item,
    index,
    selectStep,
    handleToggle,
    opened,
    userData,
    type,
    emailSubjectLines,
    emailSequenceViewingArray,
    linkedinSequenceViewingArray,
    setEmailSequenceViewingArray,
    setLinkedinSequenceViewingArray,
  } = props;
  const [variant, setVariant] = useState<number>(1);

  const updateSequenceArray = (value: string) => {
    if (type === "email") {
      setEmailSequenceViewingArray((prevArray: any) => {
        const newArray = [...prevArray];
        newArray[index] = value;
        console.log(newArray);
        return newArray;
      });
    } else if (type === "linkedin") {
      setLinkedinSequenceViewingArray((prevArray: any) => {
        const newArray = [...prevArray];
        newArray[index] = value;
        console.log(newArray);
        return newArray;
      });
    }
  };

  return (
    <Box
      style={{
        border: selectStep === index ? "1px solid #228be6" : "1px solid #ced4da",
        borderRadius: "8px",
      }}
    >
      <Flex align={"center"} justify={"space-between"} px={"sm"} py={"xs"}>
        <Flex mx="lg" align={"center"} gap={"xs"}>
          <IconMessages color="#228be6" size={"0.9rem"} />
          <Text color="gray" fw={500} size={"xs"}>
            {`Step #${index + 1}:`}
          </Text>
          {type === "email" ? <IconMail size={"0.9rem"} color="#228be6" /> : <IconBrandLinkedin size={"0.9rem"} color="#228be6" />}
        </Flex>
        {/* <Select
          value={type === "email" ? emailSequenceViewingArray[index] : linkedinSequenceViewingArray[index]}
          onChange={(value) => {
            if (type === "email") {
              setEmailSequenceViewingArray((prevArray: any) => {
                const newArray = [...prevArray];
                newArray[index] = value;
                console.log(newArray);
                return newArray;
              });
            } else if (type === "linkedin") {
              setLinkedinSequenceViewingArray((prevArray: any) => {
                const newArray = [...prevArray];
                newArray[index] = value;
                console.log(newArray);
                return newArray;
              });
            }
          }}
          data={
            Array.isArray(item)
              ? item.map((option: any) => ({
                  value: option.title,
                  label: option.title,
                }))
              : []
          }
          size="xs"
          styles={{
            root: { marginLeft: "-5px" },
            input: { fontWeight: 600 },
          }}
        /> */}
        <Flex align={"center"} gap={"sm"}>
          <ActionIcon
            variant="filled"
            size={"sm"}
            bg={"#dee2e6"}
            className="hover:bg-[#dee2e6]"
            radius={"xl"}
            onClick={() => {
              const newVariant = variant === 1 ? item.length : variant - 1;
              setVariant(newVariant);
              updateSequenceArray(item[newVariant - 1].title);
            }}
          >
            <IconChevronLeft size={"0.9rem"} color="gray" />
          </ActionIcon>
          <Text fw={500} size={"sm"}>
            <span className="text-gray-400 mr-2">
              Variant {variant}/{item.length}:
            </span>
            {variant ? item[variant - 1].title : 0}
          </Text>
          <ActionIcon
            variant="filled"
            size={"sm"}
            radius={"xl"}
            bg={"#dee2e6"}
            className="hover:bg-[#dee2e6]"
            onClick={() => {
              const newVariant = variant === item.length ? 1 : variant + 1;
              setVariant(newVariant);
              updateSequenceArray(item[newVariant - 1].title);
            }}
          >
            <IconChevronRight size={"0.9rem"} color="gray" />
          </ActionIcon>
        </Flex>
        <Flex gap={1} align={"center"}>
          <Badge variant="outline" leftSection={<IconPoint fill="green" color="white" className="mt-1" />}>
            active
          </Badge>
          <ActionIcon
            onClick={() => {
              handleToggle(index);
            }}
          >
            {selectStep === index && opened ? <IconChevronUp size={"0.9rem"} /> : <IconChevronDown size={"0.9rem"} />}
          </ActionIcon>
        </Flex>
      </Flex>
      <Collapse in={selectStep === index && opened} key={index}>
        <Flex gap={"sm"} p={"sm"} style={{ borderTop: "1px solid #ced4da" }}>
          <Avatar size={"md"} radius={"xl"} src={userData.img_url} />
          <Box>
            {type === "email" && index === 0 && emailSubjectLines && <SubjectDropdown emailSubjectLines={emailSubjectLines} />}
            <Text fw={600} size={"sm"}>
              {item?.name}
            </Text>
            <Text fw={500} size={"xs"}>
              {type === "email" ? (
                <BracketGradientWrapper>
                  {Array.isArray(item) && item.find((i: any) => i.title === emailSequenceViewingArray[index])?.description}
                </BracketGradientWrapper>
              ) : (
                <BracketGradientWrapper>
                  {Array.isArray(item) && item.find((i: any) => i.title === linkedinSequenceViewingArray[index])?.description.replace(/\n/g, "<br/>")}
                </BracketGradientWrapper>
              )}
            </Text>
          </Box>
        </Flex>
        <Divider variant="dashed" w={"100%"} />
        <Flex p={"lg"} justify={"space-between"}>
          <Flex gap={"sm"}>
            {/* <Badge color="grape">{item.point_used} Research Points Used</Badge> */}
            {item.assets && item.assets.length > 0 && <Badge color="grape">{item.assets.length} Assets Used</Badge>}
          </Flex>
          {/* <Flex gap={"sm"}>
                                  <Badge
                                    variant="outline"
                                    color="gray"
                                    leftSection={<IconCircleCheck size={"0.9rem"} fill="green" color="white" className="mt-1" />}
                                  >
                                    Opened: {item.opened}%
                                  </Badge>
                                  <Badge
                                    variant="outline"
                                    color="gray"
                                    leftSection={<IconCircleCheck size={"0.9rem"} fill="green" color="white" className="mt-1" />}
                                  >
                                    Replied: {item.replied}%
                                  </Badge>
                                </Flex> */}
        </Flex>
      </Collapse>
    </Box>
  );
};
