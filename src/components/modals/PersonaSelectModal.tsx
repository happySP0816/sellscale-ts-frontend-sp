import {
  Anchor,
  Button,
  Group,
  Text,
  Paper,
  useMantineTheme,
  Title,
  Flex,
  Textarea,
  LoadingOverlay,
  Menu,
  Container,
  Box,
  ActionIcon,
  Stack,
  ScrollArea,
  Badge,
  Center,
  ThemeIcon,
  Divider,
} from "@mantine/core";
import { ContextModalProps, openContextModal } from "@mantine/modals";
import { ReactNode, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRecoilState, useRecoilValue } from "recoil";
import { userTokenState } from "@atoms/userAtoms";
import { Archetype, PersonaOverview } from "src";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import createCTA from "@utils/requests/createCTA";
import CTAGeneratorExample from "@common/cta_generator/CTAGeneratorExample";
import { DateInput } from "@mantine/dates";
import { currentProjectState } from "@atoms/personaAtoms";
import { isLoggedIn, saveCurrentPersonaId } from "@auth/core";
import { getPersonasOverview } from "@utils/requests/getPersonas";
import { useNavigate } from "react-router-dom";
import {
  IconArrowsLeftRight,
  IconCopy,
  IconDots,
  IconMessageCircle,
  IconPhoto,
  IconPower,
  IconSearch,
  IconSettings,
  IconStack3,
  IconTrash,
} from "@tabler/icons";
import { useHover } from "@mantine/hooks";
import { navigateToPage } from "@utils/documentChange";
import _ from "lodash";
import { openedProspectIdState } from "@atoms/inboxAtoms";
import { getSDRGeneralInfo } from "@utils/requests/getClientSDR";

export default function PersonaSelectModal({
  context,
  id,
  innerProps,
}: ContextModalProps<{ onClick?: (persona: PersonaOverview) => void }>) {
  const theme = useMantineTheme();

  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [_, setCurrentProject] = useRecoilState(currentProjectState);
  const userToken = useRecoilValue(userTokenState);
  const [projects, setProjects] = useState<PersonaOverview[]>([]);
  const [projectStatMap, setProjectStatMap] = useState(new Map());
  const [openedProspectId, setOpenedProspectId] = useRecoilState(
    openedProspectIdState
  );

  useEffect(() => {
    (async () => {
      if (!isLoggedIn()) return;
      const response = await getPersonasOverview(userToken);
      const result =
        response.status === "success"
          ? (response.data as PersonaOverview[])
          : [];
      setProjects(result);

      // const firstActiveProject = result.find((project) => project.active);
      // if (firstActiveProject && !window.location.href.includes("/all")) {
      //   setCurrentProject(firstActiveProject);
      // }

      const info_response = await getSDRGeneralInfo(userToken);
      if (info_response.status === "success") {
        const notifMap = new Map();
        for (const d of info_response.data) {
          const total = d.sellscale_needs_to_clear + d.sdr_needs_to_clear;
          notifMap.set(d.client_archetype_id, total > 0 ? total : 0);
        }
        setProjectStatMap(notifMap);
      }

      setLoading(false);
    })();
  }, []);

  const unassignedPersona = projects.find(
    (project) => project.is_unassigned_contact_archetype
  );

  return (
    <Paper
      p={0}
      h={"70vh"}
      style={{
        position: "relative",
      }}
    >
      <LoadingOverlay visible={loading} />
      <Group position="apart" sx={{ flexDirection: "column", height: "100%" }}>
        <ScrollArea h="60vh" w="100%">
          <Stack py={4} spacing={0}>
            {projects
              .filter((project) => !project.is_unassigned_contact_archetype)
              .map((project, index) => (
                <PersonaOption
                  key={index}
                  persona={project}
                  inboxNotifs={projectStatMap.get(project.id)}
                  onClick={() => {
                    setOpenedProspectId(-1);
                    setCurrentProject(project);
                    if (innerProps.onClick) {
                      innerProps.onClick(project);
                    } else {
                      navigateToPage(navigate, `/inbox`);
                    }
                    context.closeModal(id);
                  }}
                  onSettingsClick={() => {
                    navigateToPage(navigate, `/persona/settings`);
                    context.closeModal(id);
                  }}
                  onCloneClick={() => {
                    openContextModal({
                      modal: "clonePersona",
                      title: (
                        <Title order={3}>Clone Persona: {project.name}</Title>
                      ),
                      innerProps: { persona: project },
                    });
                  }}
                />
              ))}
          </Stack>
        </ScrollArea>
        {unassignedPersona && (
          <Box w='100%'>
            <PersonaOption
              persona={unassignedPersona}
              inboxNotifs={projectStatMap.get(unassignedPersona.id)}
              onClick={() => {
                setOpenedProspectId(-1);
                setCurrentProject(unassignedPersona);
                if (innerProps.onClick) {
                  innerProps.onClick(unassignedPersona);
                } else {
                  navigateToPage(navigate, `/inbox`);
                }
                context.closeModal(id);
              }}
              isUnassigned
            />
          </Box>
        )}
      </Group>
    </Paper>
  );
}

function PersonaOption(props: {
  persona: PersonaOverview;
  inboxNotifs: number;
  isUnassigned?: boolean;
  onClick?: () => void;
  onSettingsClick?: () => void;
  onCloneClick?: () => void;
  onActivateClick?: () => void;
}) {
  const theme = useMantineTheme();
  const currentProject = useRecoilValue(currentProjectState);

  const { hovered, ref } = useHover();

  return (
    <Box>
      {props.isUnassigned && <Divider m={0} />}
      <Box
        py={10}
        sx={{
          backgroundColor:
            hovered || currentProject?.id === props.persona.id
              ? theme.colors.gray[1]
              : "transparent",
        }}
      >
        <Flex ref={ref} gap={10} wrap="nowrap" w={"100%"} h={30}>
          <Box sx={{ flexBasis: "15%" }}>
            <Center>
              {!props.isUnassigned && (
                <Badge color={props.persona.active ? "teal" : "red"}>
                  {props.persona.active ? "Active" : "Inactive"}
                </Badge>
              )}
            </Center>
          </Box>
          <Box
            sx={{
              flexBasis: "58%",
              cursor: "pointer",
            }}
            onClick={() => {
              props.onClick && props.onClick();
            }}
          >
            <Text
              fz="lg"
              span
              p={4}
              sx={{
                borderRadius: 10,
              }}
            >
              {_.truncate(props.persona.name, { length: 45 })}
            </Text>
            {props.inboxNotifs > 0 && <Badge>{props.inboxNotifs}</Badge>}
          </Box>
          <Box
            sx={{
              flexBasis: "20%",
            }}
          >
            <Text fz={10} c="dimmed" fs="italic">
              {props.persona.num_prospects} prospects
            </Text>
          </Box>
          <Box sx={{ flexBasis: "7%" }}>
            {!props.isUnassigned && (
              <Menu shadow="md" width={200}>
                <Menu.Target>
                  <ActionIcon radius="xl">
                    <IconDots size="1.125rem" />
                  </ActionIcon>
                </Menu.Target>

                <Menu.Dropdown>
                  <Menu.Item
                    onClick={props.onSettingsClick}
                    icon={<IconSettings size={14} />}
                  >
                    Settings
                  </Menu.Item>
                  <Menu.Item
                    onClick={props.onCloneClick}
                    icon={<IconCopy size={14} />}
                  >
                    Clone
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            )}
          </Box>
        </Flex>
      </Box>
      <Divider m={0} />
    </Box>
  );
}
