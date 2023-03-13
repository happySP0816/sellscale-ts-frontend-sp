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
} from "@mantine/core";
import {
  IconCheck,
  IconChevronDown,
  IconChevronUp,
  IconFileUpload,
  IconHistory,
  IconPower,
  IconPresentationAnalytics,
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
import { useQueryClient } from "react-query";
import FlexSeparate from "@common/library/FlexSeparate";
import {
  prospectUploadDrawerIdState,
  prospectUploadDrawerOpenState,
} from "@atoms/uploadAtoms";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { SCREEN_SIZES } from "@constants/data";
import PersonaDetailsCTAs from "./details/PersonaDetailsCTAs";
import PersonaDetailsTransformers from "./details/PersonaDetailsTransformers";
import PersonaDetailsPatterns from "./details/PersonaDetailsPatterns";
import { useEffect } from "react";

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
  isOpen?: boolean;
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
  const [opened, { toggle }] = useDisclosure(props.isOpen === true);

  const isUploading =
    props.archetype.uploads &&
    props.archetype.uploads.length > 0 &&
    props.archetype.uploads[0].stats.in_progress > 0;
  const [prospectUploadDrawerOpened, setProspectUploadDrawerOpened] =
    useRecoilState(prospectUploadDrawerOpenState);
  const [prospectUploadDrawerId, setProspectUploadDrawerId] = useRecoilState(
    prospectUploadDrawerIdState
  );

  useEffect(() => {
    if(props.isOpen === true){
      setCurrentPersonaId(props.archetype.id);
    }
  }, []);

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
    let unusedVal = 0;

    for (let statD in props.archetype.performance.status_map) {
      if (statD === "PROSPECTED") {
        unusedVal += props.archetype.performance.status_map[statD];
      } else {
        usedVal += props.archetype.performance.status_map[statD];
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
              setCurrentPersonaId(props.archetype.id);
              toggle();
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
        <Tabs defaultValue="transformers" color="teal">
          <Tabs.List>
            {/* <Tabs.Tab value="overview">Overview</Tabs.Tab> */}
            <Tabs.Tab value="transformers">Transformers</Tabs.Tab>
            <Tabs.Tab value="patterns">Patterns</Tabs.Tab>
            <Tabs.Tab value="ctas">CTAs</Tabs.Tab>
          </Tabs.List>
          {/* 
          <Tabs.Panel value="overview" pt="xs" h={600}>
            TODO
          </Tabs.Panel>
          */}
          <Tabs.Panel value="ctas" pt="xs" h={600}>
            <PersonaDetailsCTAs />
          </Tabs.Panel>
          <Tabs.Panel value="transformers" pt="xs" h={600}>
            <PersonaDetailsTransformers />
          </Tabs.Panel>
          <Tabs.Panel value="patterns" pt="xs" h={600}>
            <PersonaDetailsPatterns />
          </Tabs.Panel>
        </Tabs>
      </Collapse>
    </Paper>
  );

  /*
  return (
    <Paper
      withBorder
      p="xs"
      m="sm"
      radius="md"
      sx={(theme) => ({
        backgroundColor: props.archetype.active
          ? theme.colors.dark[6]
          : undefined,
      })}
    >
      <FlexSeparate>
        <Stack align="center" justify="space-between">
          <Avatar
            size={60}
            radius={60}
            src={`https://ui-avatars.com/api/?background=random&name=${encodeURIComponent(
              props.archetype.archetype
            )}`}
            alt={`${props.archetype.archetype}'s Picture`}
          />
          <Switch
            checked={props.archetype.active}
            onChange={async (event) => {
              const res = await togglePersona(props.archetype.id, userToken);
              if (res.status === 200) {
                props.refetch();
              }
            }}
            color="teal"
            size="md"
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
        </Stack>
        <Stack spacing="xs" mx="md" w={"100%"} justify="space-between">
          <div>
            <Title order={3} ml="sm">
              {props.archetype.archetype}
            </Title>
            <FlexSeparate>
              <Text ml="sm" mt={5}>{`${
                props.archetype.performance.total_prospects
              } prospects with ${getUsedPercentage()}% used.`}</Text>
              {props.archetype.uploads &&
                props.archetype.uploads.length > 0 && (
                  <Button
                    variant="subtle"
                    color="dark"
                    size="xs"
                    onClick={() => {
                      setProspectUploadDrawerId(
                        props.archetype.uploads && props.archetype.uploads[0].id
                      );
                      setProspectUploadDrawerOpened(true);
                    }}
                  >
                    {isUploading ? "Upload in Progress..." : "Latest Upload"}
                  </Button>
                )}
            </FlexSeparate>
          </div>
          <div>
            <Progress
              size={14}
              sections={getStatusUsedPercentage()}
              animate={isUploading}
            />
          </div>
        </Stack>
        <Stack spacing="xs">
          <Button
            size="xs"
            variant="light"
            color="teal"
            leftIcon={<IconFileUpload size={14} />}
            onClick={() => {
              setCurrentPersonaId(props.archetype.id);
              setUploadDrawerOpened(true);
            }}
          >
            Upload
          </Button>
        </Stack>
      </FlexSeparate>
    </Paper>
  );
  */
}
