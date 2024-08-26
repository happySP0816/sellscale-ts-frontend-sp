import { currentProjectState } from "@atoms/personaAtoms";
import {
  campaignContactsState,
  emailSequenceState,
  emailSubjectLinesState,
  linkedinSequenceState,
  userTokenState,
} from "@atoms/userAtoms";
import {
  ActionIcon,
  Avatar,
  Button,
  Card,
  Center,
  Flex,
  Group,
  LoadingOverlay,
  Paper,
  SegmentedControl,
  Switch,
  Text,
  Title,
  useMantineTheme,
} from "@mantine/core";
import {
  IconArrowLeft,
  IconArrowRight,
  IconBrandLinkedin,
  IconMailOpened,
  IconPlus,
} from "@tabler/icons";
import { useEffect, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { ProspectShallow, SubjectLineTemplate } from "src";
import { modals, openContextModal } from "@mantine/modals";
import { fetchCampaignSequences } from "@utils/requests/campaignOverview";
import { Contact } from "./ContactsInfiniteScroll";
import { IconSparkles } from "@tabler/icons-react";
import ProspectSelect from "@common/library/ProspectSelect";

export default function SequencesV2() {
  const userToken = useRecoilValue(userTokenState);
  const currentProject = useRecoilValue(currentProjectState);
  const theme = useMantineTheme();
  const campaignContacts = useRecoilValue(campaignContactsState);

  // View Tab
  const [viewTab, setViewTab] = useState<string>("linkedin");

  // Edit Mode
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // Prospects
  const [loadingProspects, setLoadingProspects] = useState(true);
  const [selectedProspect, setSelectedProspect] = useState<Contact | null>(
    null
  );
  const [selectedProspectIndex, setSelectedProspectIndex] = useState(0);

  // Sequences
  const [loadingSequences, setLoadingSequences] = useState(true);
  const [
    emailSequenceGenerationInProgress,
    setEmailSequenceGenerationInProgress,
  ] = useState(false);
  const [
    linkedinSequenceGenerationInProgress,
    setLinkedinSequenceGenerationInProgress,
  ] = useState(false);

  const [linkedinInitialMessageViewing, setLinkedinInitialMessageViewing] =
    useState<any>(0);

  const [emailSequenceViewingArray, setEmailSequenceViewingArray] = useState<
    any[]
  >([]);

  const [linkedinSequenceViewingArray, setLinkedinSequenceViewingArray] =
    useState<any[]>([]);

  const [sequences, setSequences] = useState<any[]>([]);

  // Step number:
  // -1 is initial message
  // starting from 0 we use the bump count
  const [stepNumber, setStepNumber] = useState<number>(-1);

  // Moving message generation into the sequences tab
  const [linkedinSequenceData, setLinkedinSequenceData] = useRecoilState(
    linkedinSequenceState
  );
  const [emailSequenceData, setEmailSequenceData] =
    useRecoilState(emailSequenceState);

  const [linkedinInitialMessages, setLinkedinInitialMessages] = useState<any[]>(
    []
  );

  const [createTemplateBuilder, setCreateTemplateBuilder] = useState(false);

  const [prospectsLoading, setProspectsLoading] = useState(true);

  const [noProspectsFound, setNoProspectsFound] = useState(false);

  const [emailSubjectLines, setEmailSubjectLines] = useRecoilState<
    SubjectLineTemplate[]
  >(emailSubjectLinesState);

  // Default on a sequence tab
  useEffect(() => {
    setViewTab(
      emailSequenceData && emailSequenceData.length > 0
        ? "email"
        : (linkedinSequenceData && linkedinSequenceData.length > 0) ||
          (linkedinInitialMessages && linkedinInitialMessages.length > 0)
          ? "linkedin"
          : "email"
    );
  }, [linkedinSequenceData, emailSequenceData, linkedinInitialMessages]);

  // Load Sequence Data
  useEffect(() => {
    if (currentProject) {
      refetchSequenceData(currentProject?.id);
    }
  }, [currentProject?.id]);

  // Load selected Prospect
  useEffect(() => {
    if (campaignContacts && campaignContacts.length > 0) {
      setSelectedProspect(campaignContacts[selectedProspectIndex]);
      setProspectsLoading(false);
    }
  }, [campaignContacts, selectedProspectIndex]);

  console.log("emailSequenceData: ", emailSequenceData);
  console.log("linkedinSequenceData: ", linkedinSequenceData);
  console.log("sequences: ", sequences);
  console.log("campaignContacts", campaignContacts);
  console.log("selectedProspects: ", selectedProspect);

  const refetchSequenceData = async (clientArchetypeId: number) => {
    setLoadingSequences(true);
    const sequencesPromise = fetchCampaignSequences(
      userToken,
      clientArchetypeId
    );
    sequencesPromise
      .then((sequencesData) => {
        setEmailSequenceGenerationInProgress(
          sequencesData.email_seq_generation_in_progress
        );
        setLinkedinSequenceGenerationInProgress(
          sequencesData.li_seq_generation_in_progress
        );

        setEmailSubjectLines(sequencesData.email_subject_lines);
        setLinkedinInitialMessages(sequencesData.initial_message_templates);
        setLinkedinInitialMessageViewing(
          sequencesData.initial_message_templates?.[0]?.title
        );
        const groupSequencesByBumpedCount = (sequences: any[]) =>
          sequences.reduce((acc: any, sequence: any) => {
            let bumpedCount = sequence.bumped_count || 0;
            const statusAdjustment =
              sequence.overall_status === "PROSPECTED"
                ? 0
                : sequence.overall_status === "ACCEPTED"
                  ? 10
                  : sequence.overall_status === "BUMPED"
                    ? 20
                    : 0;
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
          const orderedGroupedSequences =
            orderGroupedSequences(groupedSequences);
          setSequences(orderedGroupedSequences);
          // setType(type);
          if (type === "linkedin") {
            setLinkedinSequenceViewingArray(
              orderedGroupedSequences.map((group) => group[0].title)
            );
            setLinkedinSequenceData(orderedGroupedSequences);
          } else {
            setEmailSequenceViewingArray(
              orderedGroupedSequences.map((group) => group[0].title)
            );
            setEmailSequenceData(orderedGroupedSequences);
          }
        };

        if (
          sequencesData.linkedin_sequence.length > 0 &&
          sequencesData.email_sequence.length === 0
        ) {
          handleSequences(sequencesData.linkedin_sequence, "linkedin");
        } else if (
          sequencesData.email_sequence.length > 0 &&
          sequencesData.linkedin_sequence.length === 0
        ) {
          handleSequences(sequencesData.email_sequence, "email");
        } else if (
          sequencesData.email_sequence.length > 0 &&
          sequencesData.linkedin_sequence.length > 0
        ) {
          handleSequences(sequencesData.email_sequence, "email");
          setLinkedinSequenceViewingArray(
            orderGroupedSequences(
              groupSequencesByBumpedCount(sequencesData.linkedin_sequence)
            ).map((group) => group[0].title)
          );
          setLinkedinSequenceData(
            orderGroupedSequences(
              groupSequencesByBumpedCount(sequencesData.linkedin_sequence)
            )
          );
        } else {
          setSequences([]);
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

  // prospect selection onchange handler
  const prospectOnChangeHandler = function(
    prospect: ProspectShallow | undefined
  ) {
    if (prospect) {
      const foundProspect = campaignContacts.find((p) => p.id === prospect.id);

      if (foundProspect) {
        const index = campaignContacts.findIndex(
          (p) => p.id === foundProspect.id
        );
        setSelectedProspectIndex(index);
      }
    }
  };
  // We also want to move voice related stuff into this Sequence Widget

  return (
    <Card shadow={"sm"} padding={"md"} radius={"md"} withBorder>
      <Card.Section withBorder inheritPadding py={"xs"}>
        <Group position="apart">
          <Text fw={600} size={16} color="#37414E">
            Sequences
          </Text>
          <Flex align={"center"} gap={"8px"}>
            <SegmentedControl
              value={viewTab}
              onChange={(value: any) => {
                setViewTab(value);
                if (value === "email") {
                  setSequences(emailSequenceData);
                } else {
                  setSequences(linkedinSequenceData);
                }
              }}
              data={[
                {
                  value: "email",
                  label: (
                    <Center style={{ gap: 4 }}>
                      <IconMailOpened
                        size={"1.2rem"}
                        fill="orange"
                        color="white"
                      />
                      <Text fw={500}>Email</Text>
                    </Center>
                  ),
                },
                {
                  value: "linkedin",
                  label: (
                    <Center style={{ gap: 4 }}>
                      <IconBrandLinkedin
                        size={"1.4rem"}
                        fill="#3B85EF"
                        color="white"
                      />
                      <Text fw={500}>Linkedin</Text>
                    </Center>
                  ),
                },
              ]}
            />
            <Button
              leftIcon={<IconPlus size={"0.9rem"} />}
              onClick={() => {
                openContextModal({
                  modal: "campaignTemplateEditModal",
                  title: <Title order={3}>Sequence Builder</Title>,
                  innerProps: {
                    sequenceType: viewTab,
                    linkedinInitialMessages,
                    emailSubjectLines,
                    setEmailSubjectLines,
                    // linkedinSequenceData,
                    // emailSequenceData,
                    campaignId: currentProject?.id,
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
                    const clientArchetypeId = Number(currentProject?.id);
                    refetchSequenceData(clientArchetypeId);
                  },
                });
              }}
            >
              Add
            </Button>
            <Button
              variant="outline"
              radius="md"
              sx={{
                padding: "4px 12px",
                borderColor: theme.colors.blue[4],
                "&:hover": {
                  borderColor: theme.colors.blue[6],
                },
              }}
            >
              <Group spacing="xs" align="center">
                <span
                  style={{
                    color: !isEditing
                      ? theme.colors.blue[6]
                      : theme.colors.gray[7],
                    opacity: !isEditing ? 1 : 0.5,
                  }}
                >
                  Simulate
                </span>
                <Switch
                  size="md"
                  checked={isEditing}
                  onChange={(event) =>
                    setIsEditing(event.currentTarget.checked)
                  }
                  color="blue"
                />
                <span
                  style={{
                    color: isEditing
                      ? theme.colors.blue[6]
                      : theme.colors.gray[7],
                    opacity: isEditing ? 1 : 0.5,
                  }}
                >
                  Edit
                </span>
              </Group>
            </Button>
          </Flex>
        </Group>
      </Card.Section>
      <Card
        withBorder
        py={"sx"}
        radius={"md"}
        mt={"12px"}
        style={{
          borderColor: theme.colors.blue[4],
        }}
      >
        <Card.Section withBorder px={"xs"} py={"xs"}>
          <Flex align={"center"} justify={"space-between"} pos={"relative"}>
            <LoadingOverlay visible={prospectsLoading} />
            <Flex align={"center"} justify={"space-between"} gap={"4px"}>
              <ActionIcon disabled={selectedProspectIndex === 0} radius={"xl"}>
                <IconArrowLeft size={16} />
              </ActionIcon>
              <ProspectSelect
                personaId={currentProject?.id ?? -1}
                selectedProspect={selectedProspect?.id}
                isSequenceV2={true}
                onChange={prospectOnChangeHandler}
              />
              <Button variant={"outline"} size={"xs"}>
                <Flex
                  align={"center"}
                  justify={"space-between"}
                  style={{ width: "fit-content" }}
                  gap={"4px"}
                >
                  <Text size={"xs"} color="#37414E">
                    Prospect:
                  </Text>
                  <Avatar
                    src={selectedProspect?.avatar}
                    radius={"xl"}
                    size={"sm"}
                  />
                  <Text size={"xs"} color={"#37414E"}>
                    {`${selectedProspect?.first_name} ${selectedProspect?.last_name} | ${selectedProspect?.title}, ${selectedProspect?.company}`}
                  </Text>
                </Flex>
              </Button>
              <ActionIcon
                disabled={selectedProspectIndex === campaignContacts.length - 1}
              >
                <IconArrowRight size={16} />
              </ActionIcon>
            </Flex>
            <Button size="xs" color={"grape"} leftIcon={<IconSparkles />}>
              Regenerate
            </Button>
          </Flex>
        </Card.Section>
        <Text>Display</Text>
      </Card>
    </Card>
  );
}
