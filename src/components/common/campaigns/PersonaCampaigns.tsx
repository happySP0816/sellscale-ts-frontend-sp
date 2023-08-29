import { openedProspectIdState } from "@atoms/inboxAtoms";
import { currentProjectState } from "@atoms/personaAtoms";
import { userDataState, userTokenState } from "@atoms/userAtoms";
import { isLoggedIn } from "@auth/core";
import PageFrame from "@common/PageFrame";
import {
  Stack,
  Group,
  Title,
  Button,
  Divider,
  Box,
  TextInput,
  Select,
  Text,
  Paper,
  ActionIcon,
  Center,
  Badge,
  Switch,
  useMantineTheme,
  ScrollArea,
} from "@mantine/core";
import { openContextModal } from "@mantine/modals";
import {
  IconAdjustments,
  IconAdjustmentsHorizontal,
  IconBrandLinkedin,
  IconCalendar,
  IconCheck,
  IconChecks,
  IconEdit,
  IconMail,
  IconPlus,
  IconSearch,
  IconSeeding,
  IconSend,
  IconX,
} from "@tabler/icons";
import { IconMessageCheck } from "@tabler/icons-react";
import { navigateToPage } from "@utils/documentChange";
import {
  convertDateToLocalTime,
  convertDateToShortFormat,
  formatToLabel,
} from "@utils/general";
import { getSDRGeneralInfo } from "@utils/requests/getClientSDR";
import getPersonas, { getPersonasCampaignView, getPersonasOverview } from "@utils/requests/getPersonas";
import _ from "lodash";
import { ReactNode, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRecoilState, useRecoilValue } from "recoil";
import { PersonaOverview } from "src";

type CampaignPersona = {
  id: number;
  name: string;
  emails_sent: number;
  emails_opened: number;
  emails_replied: number;
  li_sent: number;
  li_opened: number;
  li_replied: number;
  active: boolean;
  created_at: string;
};

export default function PersonaCampaigns() {
  const userToken = useRecoilValue(userTokenState);
  const userData = useRecoilValue(userDataState);

  const [projects, setProjects] = useState<PersonaOverview[]>([]);
  const [personas, setPersonas] = useState<CampaignPersona[]>([]);

  const [search, setSearch] = useState<string>("");

  const filteredProjects = personas.filter((personas) =>
    personas.name.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    (async () => {
      if (!isLoggedIn()) return;
      const response = await getPersonasCampaignView(userToken);
      const result =
        response.status === "success"
          ? (response.data as CampaignPersona[])
          : [];
      setPersonas(result);

      const response2 = await getPersonasOverview(userToken);
      const result2 =
        response2.status === "success"
          ? (response2.data as PersonaOverview[])
          : [];
      setProjects(result2);
    })();
  }, []);

  return (
    <PageFrame>
      <Stack>
        <Group position="apart">
          <Title order={2}>Campaigns</Title>
          <Button
            radius="md"
            leftIcon={<IconPlus size="1rem" />}
            onClick={() => {
              openContextModal({
                modal: "uploadProspects",
                title: <Title order={3}>Create Persona</Title>,
                innerProps: { mode: "CREATE-ONLY" },
              });
            }}
          >
            Create New Campaign
          </Button>
        </Group>
        <Divider />
        <Group position="apart">
          <Group>
            <TextInput
              radius="md"
              placeholder="Search"
              rightSection={<IconSearch color="#767e85" size="1.0rem" />}
              w={250}
              styles={{
                input: {
                  backgroundColor: "transparent",
                },
              }}
              value={search}
              onChange={(event) => setSearch(event.currentTarget.value)}
            />
            <Select
              radius="md"
              placeholder="Sort by"
              data={[]}
              w={100}
              styles={{
                input: {
                  backgroundColor: "transparent",
                },
              }}
            />
            <Button
              variant="outline"
              color="gray"
              radius="md"
              sx={{
                border: "0.0625rem solid #ced4da;",
              }}
              rightIcon={
                <IconAdjustmentsHorizontal color="#767e85" size="1.0rem" />
              }
            >
              <Text fw={400}>Filters</Text>
            </Button>
          </Group>
          <Box>
            <Button.Group>
              <Button
                variant="outline"
                color="gray"
                radius="md"
                sx={{
                  border: "0.0625rem solid #ced4da;",
                }}
              >
                <Text fw={500}>
                  LinkedIn:{" "}
                  <Text c="blue" fw={600} span>
                  {userData.weekly_li_outbound_target}/100
                  </Text>
                </Text>
              </Button>
              <Button
                variant="outline"
                color="gray"
                radius="md"
                sx={{
                  border: "0.0625rem solid #ced4da;",
                }}
              >
                <Text fw={500}>
                  Email:{" "}
                  <Text c="blue" fw={600} span>
                    {userData.weekly_email_outbound_target}/100
                  </Text>
                </Text>
              </Button>
              <Button
                variant="light"
                radius="md"
                leftIcon={<IconPlus size="1rem" />}
                sx={{
                  border: "0.0625rem solid #cbe5ff;",
                }}
              >
                Add Credits
              </Button>
            </Button.Group>
          </Box>
        </Group>
        <ScrollArea h={500}>
          <Stack>
            {filteredProjects.map((persona, index) => (
              <PersonCampaignCard key={index} persona={persona} project={projects.find((project) => project.id == persona.id)} />
            ))}
            {filteredProjects.length === 0 && (
              <Center h={200}>
                <Text fs="italic" c="dimmed">
                  No campaigns found.
                </Text>
              </Center>
            )}
          </Stack>
        </ScrollArea>
      </Stack>
    </PageFrame>
  );
}

type ChannelSection = {
  id: number;
  type: string;
  active: boolean;
  icon: ReactNode;
  sends: number;
  opens: number;
  replies: number;
  date: string;
};

function PersonCampaignCard(props: { persona: CampaignPersona, project?: PersonaOverview }) {
  const navigate = useNavigate();
  const [currentProject, setCurrentProject] =
    useRecoilState(currentProjectState);
  const [openedProspectId, setOpenedProspectId] = useRecoilState(
    openedProspectIdState
  );

  const types: ChannelSection[] = [
    {
      id: 1,
      type: "LinkedIn",
      active: true,
      icon: <IconBrandLinkedin size="0.925rem" />,
      sends: props.persona.li_sent+props.persona.li_opened+props.persona.li_replied,
      opens: props.persona.li_opened+props.persona.li_replied,
      replies: props.persona.li_replied,
      date: props.persona.created_at,
    },
    {
      id: 2,
      type: "Email",
      active: true,
      icon: <IconMail size="0.925rem" />,
      sends: props.persona.emails_sent+props.persona.emails_opened+props.persona.emails_replied,
      opens: props.persona.emails_opened+props.persona.emails_replied,
      replies: props.persona.emails_replied,
      date: props.persona.created_at,
    },
    {
      id: 3,
      type: "Nurture",
      active: false,
      icon: <IconSeeding size="0.925rem" />,
      sends: 0,
      opens: 0,
      replies: 0,
      date: props.persona.created_at,
    },
  ];

  return (
    <Paper radius="md">
      <Stack spacing={0}>
        <Group
          position="apart"
          sx={(theme) => ({
            backgroundColor: theme.colors.blue[6],
            borderRadius: "0.5rem 0.5rem 0 0",
          })}
          p="xs"
        >
          <Group>
            <Title order={5} c="gray.0">
              {_.truncate(props.persona.name, { length: 40 })}
            </Title>
            <Button
              w={60}
              radius="xl"
              size="xs"
              compact
              sx={(theme) => ({
                backgroundColor: theme.colors.blue[5],
                //color: theme.colors.blue[2],
              })}
            >
              Edit
            </Button>
          </Group>
          <Button
            w={100}
            radius="xl"
            size="xs"
            variant="outline"
            compact
            sx={(theme) => ({
              borderColor: theme.colors.blue[0],
              color: theme.colors.blue[0],
            })}
            onClick={() => {
              if (props.project == undefined) return;
              setOpenedProspectId(-1);
              setCurrentProject(props.project);
              navigateToPage(navigate, `/contacts/view`);
            }}
          >
            Contacts
          </Button>
        </Group>
        <Box>
          {types.map((section, index) => (
            <Box key={index}>
              {index > 0 && <Divider />}
              <PersonCampaignCardSection section={section} />
            </Box>
          ))}
        </Box>
      </Stack>
    </Paper>
  );
}

function PersonCampaignCardSection(props: { section: ChannelSection }) {
  const theme = useMantineTheme();
  const [checked, setChecked] = useState(props.section.active);

  return (
    <>
      <Group position="apart" p="xs" spacing={0}>
        <Box sx={{ flexBasis: "30%" }}>
          <Group spacing={8}>
            <ActionIcon color="blue" radius="xl" variant="light" size="sm">
              {props.section.icon}
            </ActionIcon>
            <Text>{formatToLabel(props.section.type)}</Text>
          </Group>
        </Box>
        <Box sx={{ flexBasis: "20%" }}>
          <Center>
            <Badge color={props.section.active ? "teal" : "red"}>
              {props.section.active ? "Active" : "Inactive"}
            </Badge>
          </Center>
        </Box>
        <Box sx={{ flexBasis: "20%" }}>
          <Group>
            <Text fz="xs" span>
              <IconSend size="0.8rem" /> {props.section.sends}
            </Text>
            <Text fz="xs" span>
              <IconChecks size="0.8rem" /> {props.section.opens}
            </Text>
            <Text fz="xs" span>
              <IconMessageCheck size="0.8rem" /> {props.section.replies}
            </Text>
          </Group>
        </Box>
        <Box sx={{ flexBasis: "20%" }}>
          <Text fz="xs" span>
            <IconCalendar size="0.8rem" />{" "}
            {convertDateToShortFormat(new Date(props.section.date))}
          </Text>
        </Box>
        <Box sx={{ flexBasis: "10%" }}>
          <Group>
            <Switch
              checked={checked}
              onChange={(event) => setChecked(event.currentTarget.checked)}
              color="teal"
              size="xs"
              thumbIcon={
                checked ? (
                  <IconCheck
                    size="0.6rem"
                    color={theme.colors.teal[theme.fn.primaryShade()]}
                    stroke={3}
                  />
                ) : (
                  <IconX
                    size="0.6rem"
                    color={theme.colors.red[theme.fn.primaryShade()]}
                    stroke={3}
                  />
                )
              }
            />
            <ActionIcon size="sm" radius="xl">
              <IconEdit size="0.875rem" />
            </ActionIcon>
          </Group>
        </Box>
      </Group>
    </>
  );
}
