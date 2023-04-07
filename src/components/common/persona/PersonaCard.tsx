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
} from "@mantine/core";
import {
  IconActivityHeartbeat,
  IconAddressBook,
  IconCheck,
  IconChevronDown,
  IconChevronUp,
  IconFileUpload,
  IconHistory,
  IconPower,
  IconPresentationAnalytics,
  IconTool,
  IconUpload,
  IconX,
} from "@tabler/icons";
import { useRecoilState, useRecoilValue } from "recoil";
import { Archetype } from "src/main";
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
import { SCREEN_SIZES } from "@constants/data";
import { useEffect, useState } from "react";
import PullProspectEmailsCard from "@common/credits/PullProspectEmailsCard";
import ComingSoonCard from "@common/library/ComingSoonCard";
import ProspectTable_old from "@common/pipeline/ProspectTable_old";
import { prospectSelectorTypeState } from "@atoms/prospectAtoms";

async function togglePersona(archetype_id: number, userToken: string) {
  const response = await fetch(
    `${process.env.REACT_APP_API_URI}/client/archetype/toggle_active`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_archetype_id: archetype_id,
      }),
    }
  );
  return response;
}

export default function PersonaCard(props: {
  archetype: Archetype;
  refetch: () => void;
}) {
  const theme = useMantineTheme();
  const mdScreenOrLess = useMediaQuery(`(max-width: ${SCREEN_SIZES.MD})`);
  const userToken = useRecoilValue(userTokenState);
  const queryClient = useQueryClient();
  const [unusedProspects, setUnusedProspects] = useState(0);

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
    props.archetype.id === currentPersonaId
  );
  const [selectorType, setSelectorType] = useRecoilState(
    prospectSelectorTypeState
  );

  const fetchNumUnusedProspects = async () => {
    const res = await fetch(
      `${process.env.REACT_APP_API_URI}/client/unused_li_and_email_prospects_count?client_archetype_id=` +
        props.archetype.id,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      }
    );
    const data = await res.json();
    setUnusedProspects(data.unused_linkedin_prospects);
  };

  useEffect(() => {
    if (props.archetype.id === currentPersonaId) {
      open();
    } else {
      close();
    }
    fetchNumUnusedProspects();
  }, [currentPersonaId, fetchNumUnusedProspects]);

  // Temp Fix: Make sure the prospect table selector is set to all when the persona is opened - to prevent ProspectTable bug
  useEffect(() => {
    setSelectorType("all");
  }, [opened]);

  const isUploading =
    props.archetype.uploads &&
    props.archetype.uploads.length > 0 &&
    props.archetype.uploads[0].stats.in_progress > 0;
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

  /*
    const displayTransformers = Object.keys(props.archetype.performance.status_map).some((key) => {
    return key !== "PROSPECTED";
  }) ?? Object.keys(props.archetype.performance.status_map).length > 0;

  const makeActivePersona = () => {
    displayNotification(
      "make-active-persona",
      async () => {
        await temp_delay(1000);
        let result = Math.random() < 0.75;
        if (result) {
          //setActivePersona(props.value);
        }
        return result;
      },
      {
        title: `Activating Persona`,
        message: `Updating persona to ${props.archetype.archetype}...`,
        color: "teal",
      },
      {
        title: `${props.archetype.archetype} is now active 🎉`,
        message: `Some extra description here`,
        color: "teal",
      },
      {
        title: `Error while activating persona!`,
        message: `Test 25% chance of failure!`,
        color: "red",
      }
    );
  };
  */

  /*
  const getStatusPercentage = () => {
    let m = 100 / props.archetype.performance.total_prospects;
    let percentData = [];
    for(let statD in props.archetype.performance.status_map){
      percentData.push({
        value: props.archetype.performance.status_map[statD]*m,
        color: valueToColor(theme, formatToLabel(statD)),
        label: formatToLabel(statD),
        tooltip: `${formatToLabel(statD)} - ${props.archetype.performance.status_map[statD]} prospects`,
      });
    }
    return percentData;
  }
  */

  const WARNING_PERCENTAGE = 25;
  const getStatusUsedPercentage = () => {
    let usedVal = 0;
    let unusedVal = unusedProspects;

    for (let statD in props.archetype.performance?.status_map) {
      if (statD === "PROSPECTED") {
        // unusedVal += props.archetype.performance.status_map[statD];
      } else {
        usedVal += props.archetype.performance?.status_map[statD];
      }
    }

    let m = 100 / props.archetype.performance.total_prospects;
    let percentData = [];
    const label = `Unprocessed, ${Math.round(
      unusedVal * m
    )}% - ${unusedVal} / ${
      props.archetype.performance.total_prospects
    } prospects`;
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

  const getUsedPercentage = () => {
    if (props.archetype.performance.total_prospects === 0) return 0;
    let m = 100 / props.archetype.performance.total_prospects;
    let totalUsed = 0;
    for (let statD in props.archetype.performance.status_map) {
      if (statD !== "PROSPECTED") {
        totalUsed += props.archetype.performance.status_map[statD];
      }
    }
    return Math.round(totalUsed * m);
  };

  const openUploadHistory = () => {
    setProspectUploadDrawerId(
      props.archetype.uploads && props.archetype.uploads[0].id
    );
    setProspectUploadDrawerOpened(true);
  };

  const openUploadProspects = () => {
    setCurrentPersonaId(props.archetype.id);
    setUploadDrawerOpened(true);
  };

  return (
    <Paper withBorder p="xs" my={20} radius="md">
      <FlexSeparate>
        <Group noWrap={true}>
          <Switch
            checked={props.archetype.active}
            onChange={async (event) => {
              const res = await togglePersona(props.archetype.id, userToken);
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
              props.archetype.active ? (
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
          <Group
            noWrap={true}
            spacing={8}
            sx={{ cursor: "pointer" }}
            onClick={() => {
              if (props.archetype.id === currentPersonaId) {
                setCurrentPersonaId(-1);
              } else {
                setCurrentPersonaId(props.archetype.id);
              }
            }}
          >
            <Title order={2} fz={24} fw={400} truncate maw="35vw">
              {props.archetype.archetype}
            </Title>
            {opened ? (
              <IconChevronDown size="2rem" stroke={2} />
            ) : (
              <IconChevronUp size="2rem" stroke={2} />
            )}
          </Group>
        </Group>
        <Flex align="flex-end">
          {props.archetype.uploads && props.archetype.uploads.length > 0 && (
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
        </Flex>
      </FlexSeparate>
      <Progress
        mt={10}
        size={17}
        sections={getStatusUsedPercentage()}
        animate={isUploading}
        opacity={0.8}
      />
      <Collapse in={opened}>
        <Tabs defaultValue="all-contacts" px="xs" color="teal">
          <Tabs.List>
            <Tabs.Tab value="all-contacts" icon={<IconAddressBook size="1.1rem" />}>All Contacts</Tabs.Tab>
            <Tabs.Tab value="pulse" icon={<IconActivityHeartbeat size="1.1rem" />}>Pulse</Tabs.Tab>
            <Tabs.Tab value="tools" icon={<IconTool size="1.1rem" />}>Tools</Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value="all-contacts" pt="xs">
            <ProspectTable_old personaSpecific={props.archetype.id} />
          </Tabs.Panel>
          <Tabs.Panel value="pulse" pt="xs">
            <ComingSoonCard h={400} />
          </Tabs.Panel>
          <Tabs.Panel value="tools" pt="xs" h={600}>
            <PullProspectEmailsCard archetype_id={props.archetype.id} />
          </Tabs.Panel>
        </Tabs>
      </Collapse>
    </Paper>
  );
}
