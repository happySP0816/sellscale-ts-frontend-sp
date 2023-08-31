import { openedProspectIdState } from "@atoms/inboxAtoms";
import { currentProjectState } from "@atoms/personaAtoms";
import { userDataState, userTokenState } from "@atoms/userAtoms";
import { isLoggedIn } from "@auth/core";
import PageFrame from "@common/PageFrame";
import EmailQueuedMessages from "@common/emails/EmailQueuedMessages";
import LinkedinQueuedMessages from "@common/messages/LinkedinQueuedMessages";
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
  Tabs,
  Loader,
  Collapse,
} from "@mantine/core";
import { useDisclosure } from '@mantine/hooks';
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
import { IconArrowDown, IconArrowUp, IconFilter, IconLayoutNavbarCollapse, IconMessageCheck } from "@tabler/icons-react";
import { navigateToPage } from "@utils/documentChange";
import {
  convertDateToLocalTime,
  convertDateToShortFormat,
  convertDateToShortFormatWithoutTime,
  formatToLabel,
} from "@utils/general";
import { getSDRGeneralInfo } from "@utils/requests/getClientSDR";
import getPersonas, {
  getPersonasCampaignView,
  getPersonasOverview,
} from "@utils/requests/getPersonas";
import _ from "lodash";
import moment from 'moment';
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

  let filteredProjects = personas.filter((personas) =>
    personas.name.toLowerCase().includes(search.toLowerCase())
  );

  const [loadingPersonas, setLoadingPersonas] = useState<boolean>(true);

  useEffect(() => {
    (async () => {
      if (!isLoggedIn()) return;
      setLoadingPersonas(true);
      const response = await getPersonasCampaignView(userToken);
      const result =
        response.status === "success"
          ? (response.data as CampaignPersona[])
          : [];

      setPersonas(result);
      setLoadingPersonas(false);

      const response2 = await getPersonasOverview(userToken);
      const result2 =
        response2.status === "success"
          ? (response2.data as PersonaOverview[])
          : [];
      setProjects(result2);
    })();
  }, []);

  // sort personas by persona.active then persona.created_at in desc order
  filteredProjects.sort((a, b) => {
    if (a.active && !b.active) return -1;
    if (!a.active && b.active) return 1;
    if (moment(a.created_at).isAfter(moment(b.created_at))) return -1;
    if (moment(a.created_at).isBefore(moment(b.created_at))) return 1;
    return 0;
  });

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
        <Tabs defaultValue="overview">
          <Tabs.List>
            <Tabs.Tab value="overview">Overview</Tabs.Tab>
            <Tabs.Tab value="outreach">Queued for AI Outreach</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="overview" pt="xs">
            <Stack>
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
                      <IconAdjustmentsHorizontal
                        color="#767e85"
                        size="1.0rem"
                      />
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
              <ScrollArea h={'78vh'}>
                <Stack>
                  {
                    loadingPersonas && (
                      <Center h={200}>
                        <Loader />
                      </Center>
                    )
                  }
                  {!loadingPersonas && filteredProjects.map((persona, index) => (
                    <PersonCampaignCard
                      key={index}
                      persona={persona}
                      project={projects.find(
                        (project) => project.id == persona.id
                      )}
                    />
                  ))}
                  {!loadingPersonas && filteredProjects.length === 0 && (
                    <Center h={200}>
                      <Text fs="italic" c="dimmed">
                        No campaigns found.
                      </Text>
                    </Center>
                  )}
                </Stack>
              </ScrollArea>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="outreach" pt="xs">
            <Group position="center" noWrap>
              <LinkedinQueuedMessages all />
              <EmailQueuedMessages all />
            </Group>
          </Tabs.Panel>
        </Tabs>
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

function PersonCampaignCard(props: {
  persona: CampaignPersona;
  project?: PersonaOverview;
}) {
  const navigate = useNavigate();
  const [currentProject, setCurrentProject] =
    useRecoilState(currentProjectState);
  const [openedProspectId, setOpenedProspectId] = useRecoilState(
    openedProspectIdState
  );
  const [opened, { toggle }] = useDisclosure(props.persona.active);


  const userData = useRecoilValue(userDataState);
  console.log(userData);

  const types: ChannelSection[] = [
    {
      id: 1,
      type: "LinkedIn",
      active: !!userData?.weekly_li_outbound_target && props.persona.active,
      icon: <IconBrandLinkedin size="0.925rem" />,
      sends:
        props.persona.li_sent +
        props.persona.li_opened +
        props.persona.li_replied,
      opens: props.persona.li_opened + props.persona.li_replied,
      replies: props.persona.li_replied,
      date: props.persona.created_at,
    },
    {
      id: 2,
      type: "Email",
      active: !!userData?.weekly_email_outbound_target && props.persona.active,
      icon: <IconMail size="0.925rem" />,
      sends:
        props.persona.emails_sent +
        props.persona.emails_opened +
        props.persona.emails_replied,
      opens: props.persona.emails_opened + props.persona.emails_replied,
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
            backgroundColor: props.persona.active ? theme.colors.blue[6] : 'white',
            borderRadius: "0.5rem 0.5rem 0 0",
            border: 'solid 1px ' + theme.colors.gray[2],
          })}
          p="xs"
        >
          <Group>
            <Button 
              sx={{borderRadius: '100px', border: 'solid 1px ' + (props.persona.active ? 'white' : 'gray')}} 
              variant='outline' 
              color={props.persona.active ? 'white' : 'gray'}
              onClick={() => {
                  if (props.project == undefined) return;
                    setOpenedProspectId(-1);
                    setCurrentProject(props.project);
                    navigateToPage(navigate, `/prioritize`);
                  }
                }
              >
              <IconFilter size="1rem" color={props.persona.active ? 'white' : 'gray'}/>
            </Button>
            <Button variant="subtle" color={'white'} radius="xl" size="lg" compact>
              🤖
            </Button>

            <Title order={5} c={props.persona.active ? 'white' : 'blue'}>
              {_.truncate(props.persona.name, { length: 40 })}
            </Title>
          </Group>
          <Group>
            <Button
              w={100}
              radius="xl"
              size="xs"
              variant="outline"
              compact
              sx={(theme) => ({
                borderColor: props.persona.active ? 'white' : theme.colors.blue[6],
                color: props.persona.active ? 'white' : theme.colors.blue[6],
              })}
              onClick={() => {
                if (props.project == undefined) return;
                setOpenedProspectId(-1);
                setCurrentProject(props.project);
                navigateToPage(navigate, `/prioritize`);
              }}
            >
              Contacts
            </Button>
            <Button
                w={60}
                radius="xl"
                size="xs"
                compact
                sx={(theme) => ({
                  backgroundColor: theme.colors.blue[5],
                  //color: theme.colors.blue[2],
                })}
                onClick={() => {
                  if (props.project == undefined) return;
                  setOpenedProspectId(-1);
                  setCurrentProject(props.project);
                  navigateToPage(navigate, `/persona/settings`);
                }}
              >
                Edit
              </Button>
              <Button
                variant='subtle'
                onClick={toggle}
                rightIcon={opened ? (<IconArrowUp size="1rem" color={props.persona.active ? 'white' : 'blue'} />) : <IconArrowDown size="1rem" color={props.persona.active ? 'white' : 'blue'} />}
              >

              </Button>
            </Group>
        </Group>
        <Collapse in={opened}>
            {types.map((section, index) => (
              <Box key={index}>
                {index > 0 && <Divider />}
                <PersonCampaignCardSection section={section} onClick={() => {
                  if (props.project == undefined) return;
                  setOpenedProspectId(-1);
                  setCurrentProject(props.project);
                  navigateToPage(navigate, `/${section.type.toLowerCase()}/setup`);
                }} />
              </Box>
            ))}
        </Collapse>
      </Stack>
    </Paper>
  );
}

function PersonCampaignCardSection(props: { section: ChannelSection, onClick?: () => void }) {
  const theme = useMantineTheme();
  const [checked, setChecked] = useState(props.section.active);

  return (
    <>
      <Group position="apart" p="xs" spacing={0}
        onClick={props.onClick}
        sx={{
          cursor: "pointer",
        }}
      >
        <Box sx={{ flexBasis: "30%" }}>
          <Group spacing={8}>
            <ActionIcon color="blue" radius="xl" variant="light" size="sm">
              {props.section.icon}
            </ActionIcon>
            <Text>{formatToLabel(props.section.type)}</Text>
          </Group>
        </Box>

        <Box sx={{ flexBasis: "30%" }}>
          <Group>
            <Text fz="xs" color='gray' w='90px'>
              <IconSend size="0.8rem" /> Sent: <span style={{color: 'black'}}>{props.section.sends}</span>
            </Text>
            <Text fz="xs" color='gray' w='90px'>
              <IconChecks size="0.8rem" /> Opens: <span style={{color: 'black'}}>{props.section.opens}</span>
            </Text>
            <Text fz="xs" color='gray' w='90px'>
              <IconMessageCheck size="0.8rem" /> Replies: <span style={{color: 'black'}}>{props.section.replies}</span>
            </Text>
          </Group>
        </Box>
        <Box sx={{ flexBasis: "20%", color: 'gray' }}>
          <Text fz="xs" span>
            <IconCalendar size="0.8rem" />{" "}
            {convertDateToShortFormatWithoutTime(new Date(props.section.date))}
          </Text>
        </Box>
        <Box sx={{ flexBasis: "10%" }}>
          <Group>
            <Switch
              checked={checked}
              onChange={(event) => {
                setChecked(event.currentTarget.checked);
              }}
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
