import React from "react";
import {
  Button,
  Avatar,
  Title,
  Text,
  Stack,
  Group,
  Progress,
  MantineTheme,
  Switch,
  useMantineTheme,
  Container,
  Paper,
  ActionIcon,
  Collapse,
  Flex,
  Tabs,
  Center,
  Loader,
  Box,
} from "@mantine/core";
import {
  IconActivityHeartbeat,
  IconAddressBook,
  IconAnalyze,
  IconArrowsSplit,
  IconBrain,
  IconCheck,
  IconChevronDown,
  IconChevronUp,
  IconFileUpload,
  IconFilter,
  IconHistory,
  IconPower,
  IconPresentationAnalytics,
  IconRefresh,
  IconTool,
  IconUpload,
  IconX,
} from "@tabler/icons";
import { useRecoilState, useRecoilValue } from "recoil";
import { Archetype, PersonaOverview } from "src";
import {
  uploadDrawerOpenState,
  currentPersonaIdState,
  detailsDrawerOpenState,
} from "@atoms/personaAtoms";
import { userTokenState } from "@atoms/userAtoms";
import { useQueryClient } from "@tanstack/react-query";
import FlexSeparate from "@common/library/FlexSeparate";
import {
  prospectUploadDrawerIdState,
  prospectUploadDrawerOpenState,
} from "@atoms/uploadAtoms";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { API_URL, SCREEN_SIZES } from "@constants/data";
import { useEffect, useState } from "react";
import ProspectTable_old from "@common/pipeline/ProspectTable_old";
import { prospectSelectorTypeState } from "@atoms/prospectAtoms";
import Pulse from "./Pulse";
import PersonaTools from "./PersonaTools";
import PersonaAnalyze from "./PersonaAnalyze";
import PersonaSplit from "./PersonaSplit";
import PersonaBrain from "./PersonaBrain";
import PersonaFilters from "./PersonaFilters";
import PersonaLearn from "./PersonaLearn";
import PersonaLiSetup from "./PersonaLiSetup";
import PersonaEmailSetup from "./PersonaEmailSetup";

async function togglePersona(archetype_id: number, userToken: string) {
  const response = await fetch(`${API_URL}/client/archetype/toggle_active`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${userToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_archetype_id: archetype_id,
    }),
  });
  return response;
}

export default function PersonaCard(props: {
  personaOverview: PersonaOverview;
  refetch: () => void;
  unassignedPersona: boolean;
  allPersonas: PersonaOverview[];
}) {
  const theme = useMantineTheme();
  const mdScreenOrLess = useMediaQuery(`(max-width: ${SCREEN_SIZES.MD})`);
  const userToken = useRecoilValue(userTokenState);
  const queryClient = useQueryClient();

  const [uploadDrawerOpened, setUploadDrawerOpened] = useRecoilState(
    uploadDrawerOpenState
  );
  const [detailsDrawerOpened, setDetailsDrawerOpened] = useRecoilState(
    detailsDrawerOpenState
  );
  const [currentPersonaId, setCurrentPersonaId] = useRecoilState(
    currentPersonaIdState
  );
  const [opened, { open, close }] = useDisclosure(
    props.personaOverview.id === currentPersonaId
  );
  const [selectorType, setSelectorType] = useRecoilState(
    prospectSelectorTypeState
  );

  /*
  const [unusedProspects, setUnusedProspects] = useState(0);
  const [
    numUnusedProspectsIsLoading,
    setNumUnusedProspectsIsLoading,
  ] = useState(false);
  const [fetchedNumUnusedProspects, setFetchedNumUnusedProspects] = useState(
    false
  );

  const fetchNumUnusedProspects = async () => {
    if (!fetchedNumUnusedProspects) {
      setNumUnusedProspectsIsLoading(true);
      const res = await fetch(
        `${API_URL}/client/unused_li_and_email_prospects_count?client_archetype_id=` +
          props.personaOverview.id,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );
      const data = await res.json();
      setUnusedProspects(data.unused_linkedin_prospects);
      setNumUnusedProspectsIsLoading(false);
      setFetchedNumUnusedProspects(true);
    }
  };
  */

  useEffect(() => {
    if (props.personaOverview.id === currentPersonaId) {
      open();
    } else {
      close();
    }
  }, [currentPersonaId]);

  // Temp Fix: Make sure the prospect table selector is set to all when the persona is opened - to prevent ProspectTable bug
  useEffect(() => {
    setSelectorType("all");
  }, [opened]);

  const isUploading =
    props.personaOverview.uploads &&
    props.personaOverview.uploads.length > 0 &&
    props.personaOverview.uploads[0].stats.in_progress > 0;
  const [
    prospectUploadDrawerOpened,
    setProspectUploadDrawerOpened,
  ] = useRecoilState(prospectUploadDrawerOpenState);
  const [prospectUploadDrawerId, setProspectUploadDrawerId] = useRecoilState(
    prospectUploadDrawerIdState
  );

  const activeBackgroundSX = (theme: MantineTheme) => ({
    border: `1px solid ${
      theme.colorScheme === "dark" ? theme.colors.dark[5] : theme.colors.gray[2]
    }`,
    borderRadius: "8px",
    backgroundColor:
      theme.colorScheme === "dark"
        ? theme.colors.dark[6]
        : theme.colors.gray[1],
  });

  const WARNING_PERCENTAGE = 25;
  const getStatusUsedPercentage = () => {
    let usedEmail =
      props.personaOverview.num_prospects -
      props.personaOverview.num_unused_email_prospects;
    let usedLi =
      props.personaOverview.num_prospects -
      props.personaOverview.num_unused_li_prospects;

    let unusedVal = props.personaOverview.num_prospects - (usedEmail + usedLi);
    let usedVal = props.personaOverview.num_prospects - unusedVal;

    let m = 100 / props.personaOverview.num_prospects;
    let percentData = [];
    const label = `Unprocessed, ${Math.round(
      unusedVal * m
    )}% - ${unusedVal} / ${props.personaOverview.num_prospects} prospects`;
    if (unusedVal * m > 0) {
      percentData.push({
        value: unusedVal * m,
        color:
          unusedVal * m < WARNING_PERCENTAGE
            ? "red.9"
            : unusedVal * m < WARNING_PERCENTAGE * 2
            ? "orange.9"
            : unusedVal * m < WARNING_PERCENTAGE * 3
            ? "yellow.9"
            : "teal.9",
        label: label,
        tooltip: label,
      });
    }
    return percentData;
  };

  const openUploadHistory = () => {
    setProspectUploadDrawerId(
      props.personaOverview.uploads && props.personaOverview.uploads[0].id
    );
    setProspectUploadDrawerOpened(true);
  };

  const openUploadProspects = () => {
    setCurrentPersonaId(props.personaOverview.id);
    setUploadDrawerOpened(true);
  };

  return (
    <Paper withBorder p="xs" my={20} radius="md">
      <FlexSeparate>
        <Group noWrap={true}>
          {!props.unassignedPersona && (
            <Switch
              checked={props.personaOverview.active}
              onChange={async (event) => {
                const res = await togglePersona(
                  props.personaOverview.id,
                  userToken
                );
                if (res.status === 200) {
                  props.refetch();
                }
              }}
              color="teal"
              size="sm"
              onLabel="ON"
              offLabel="OFF"
              styles={{
                track: {
                  cursor: "pointer",
                },
              }}
              thumbIcon={
                props.personaOverview.active ? (
                  <IconCheck
                    size={12}
                    color={theme.colors.teal[theme.fn.primaryShade()]}
                    stroke={3}
                  />
                ) : (
                  <IconX
                    size={12}
                    color={theme.colors.red[theme.fn.primaryShade()]}
                    stroke={3}
                  />
                )
              }
            />
          )}
          <Group
            noWrap={true}
            spacing={8}
            sx={{ cursor: "pointer" }}
            onClick={() => {
              console.log(props.personaOverview.id, currentPersonaId);
              if (props.personaOverview.id === currentPersonaId) {
                setCurrentPersonaId(-1);
              } else {
                setCurrentPersonaId(props.personaOverview.id);
              }
            }}
          >
            <Box>
              <Title order={2} fz={24} fw={400} truncate maw="35vw">
                {props.personaOverview.name}
              </Title>
              {props.unassignedPersona && (
                <Title order={6} fw={200} truncate maw="35vw">
                  Upload new prospects here to auto-distribute
                </Title>
              )}
            </Box>
            {opened ? (
              <IconChevronDown size="2rem" stroke={2} />
            ) : (
              <IconChevronUp size="2rem" stroke={2} />
            )}
          </Group>
        </Group>
        <Flex align="flex-end">
          {props.personaOverview.uploads &&
            props.personaOverview.uploads.length > 0 && (
              <>
                {mdScreenOrLess ? (
                  <ActionIcon
                    radius="xl"
                    variant="light"
                    mx="sm"
                    onClick={openUploadHistory}
                  >
                    <IconHistory size={14} />
                  </ActionIcon>
                ) : (
                  <Button
                    variant="subtle"
                    color="dark"
                    size="xs"
                    onClick={openUploadHistory}
                  >
                    {isUploading ? "Upload in Progress..." : "Latest Upload"}
                  </Button>
                )}
              </>
            )}
          {mdScreenOrLess ? (
            <ActionIcon
              color="teal"
              radius="xl"
              variant="light"
              onClick={openUploadProspects}
            >
              <IconUpload size={14} />
            </ActionIcon>
          ) : (
            <Button
              variant="light"
              color="teal"
              radius="md"
              rightIcon={<IconUpload size={14} />}
              onClick={openUploadProspects}
            >
              Upload Prospects
            </Button>
          )}
          <Button
            variant="subtle"
            color="grape"
            radius="md"
            onClick={() => {
              window.location.reload(); // TODO: remove this
            }}
          >
            <IconRefresh size={14} />
          </Button>
        </Flex>
      </FlexSeparate>
      {false ? (
        <Loader variant="dots" color="green" />
      ) : (
        <Progress
          mt={10}
          size={17}
          sections={getStatusUsedPercentage()}
          animate={isUploading}
          opacity={0.8}
        />
      )}

      <Collapse in={opened}>
        <Tabs defaultValue={props.unassignedPersona ? 'analyze' : 'learn'} px="xs" color="teal">
          <Tabs.List>
            {!props.unassignedPersona && (
              <Tabs.Tab value="learn" icon={1}>
                Learn
              </Tabs.Tab>
            )}
            {!props.unassignedPersona && (
              <Tabs.Tab
                value="prioritize"
                icon={2}
              >
                Prioritize
              </Tabs.Tab>
            )}
            {!props.unassignedPersona && (
              <Tabs.Tab value="li-setup" icon={3}>
                LI Setup
              </Tabs.Tab>
            )}
            {!props.unassignedPersona && (
              <Tabs.Tab value="email-setup" icon={4}>
                Email Setup
              </Tabs.Tab>
            )}

            {props.unassignedPersona && (
              <Tabs.Tab value="analyze" icon={<IconAnalyze size="1.1rem" />}>
                Analyze
              </Tabs.Tab>
            )}
            {props.unassignedPersona &&
              true && ( // todo(Aakash) - remove false
                <Tabs.Tab
                  value="split"
                  icon={<IconArrowsSplit size="1.1rem" />}
                >
                  Split
                </Tabs.Tab>
              )}
          </Tabs.List>
          <Tabs.Panel value="pulse" pt="xs">
            <Pulse personaOverview={props.personaOverview} />
          </Tabs.Panel>
          <Tabs.Panel value="tools" pt="xs">
            <PersonaTools archetype_id={props.personaOverview.id} />
          </Tabs.Panel>
          <Tabs.Panel value="analyze" pt="xs">
            <PersonaAnalyze archetype_id={props.personaOverview.id} />
          </Tabs.Panel>
          <Tabs.Panel value="split" pt="xs">
            <PersonaSplit archetype_id={props.personaOverview.id} />
          </Tabs.Panel>
          <Tabs.Panel value="brain" pt="xs">
            <PersonaBrain archetype_id={props.personaOverview.id} />
          </Tabs.Panel>
          <Tabs.Panel value="filters" pt="xs">
            <PersonaFilters archetype_id={props.personaOverview.id} />
          </Tabs.Panel>

          <Tabs.Panel value="learn" pt="xs">
            <PersonaBrain archetype_id={props.personaOverview.id} />
          </Tabs.Panel>
          <Tabs.Panel value="prioritize" pt="xs">
            <Pulse personaOverview={props.personaOverview} />
          </Tabs.Panel>
          <Tabs.Panel value="li-setup" pt="xs">
            <PersonaLiSetup persona={props.personaOverview} personas={props.allPersonas} />
          </Tabs.Panel>
          <Tabs.Panel value="email-setup" pt="xs">
            <PersonaEmailSetup />
          </Tabs.Panel>
        </Tabs>
      </Collapse>
    </Paper>
  );
}
