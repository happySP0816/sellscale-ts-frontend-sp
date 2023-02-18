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
} from "@mantine/core";
import { IconCheck, IconX } from "@tabler/icons";
import { useRecoilState } from "recoil";
import { Archetype } from "src/main";
import { formatToLabel, temp_delay, valueToColor } from "../../../utils/general";
import displayNotification from "../../../utils/notificationFlow";
import {
  uploadDrawerOpenState,
  linkedInCTAsDrawerOpenState,
  currentPersonaIdState,
} from "../../atoms/personaAtoms";

export default function PersonaCard(props: { archetype: Archetype }) {
  const theme = useMantineTheme();
  const [uploadDrawerOpened, setUploadDrawerOpened] = useRecoilState(
    uploadDrawerOpenState
  );
  const [linkedInCTAsDrawerOpened, setLinkedInCTAsDrawerOpened] =
    useRecoilState(linkedInCTAsDrawerOpenState);
  const [currentPersonaId, setCurrentPersonaId] =
    useRecoilState(currentPersonaIdState);

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

  const getUsedPercentage = () => {
    if(props.archetype.performance.total_prospects === 0) return 0;
    let m = 100 / props.archetype.performance.total_prospects;
    let totalUsed = 0;
    for(let statD in props.archetype.performance.status_map){
      if(statD !== 'PROSPECTED') {
        totalUsed += props.archetype.performance.status_map[statD];
      }
    }
    return Math.round(totalUsed*m);
  }

  return (
    <Container
      p="xs"
      style={{ display: 'flex', justifyContent: 'space-between' }}
      sx={(theme) => {
        if (props.archetype.active) {
          return activeBackgroundSX(theme);
        } else {
          return {};
        }
      }}
    >
      <Stack align="center" justify="flex-end">
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
          onChange={(event) => {
            /* setChecked(event.currentTarget.checked) */
          }}
          color="teal"
          size="md"
          onLabel="ON"
          offLabel="OFF"
          sx={(theme) => ({
            track: {
              cursor: "pointer!important", // TODO: fix this
            },
          })}
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
      <Stack spacing="xs" mx='md' w={'100%'}>
        <Title order={3} ml="sm" mt="md">
          {props.archetype.archetype}
        </Title>
        <Text ml="sm">{`${props.archetype.performance.total_prospects} contacts with ${getUsedPercentage()}% used.`}</Text>
        <Progress
          size={14}
          sections={getStatusPercentage()}
        />
      </Stack>
      <Stack spacing="xs">
        <Button
          size="xs"
          variant="outline"
          color="teal"
          onClick={() => {
            setCurrentPersonaId(props.archetype.id);
            setUploadDrawerOpened(true);
          }}
        >
          Upload
        </Button>
        <Button
          size="xs"
          variant="outline"
          color="teal"
          onClick={() => {
            setCurrentPersonaId(props.archetype.id);
            setLinkedInCTAsDrawerOpened(true);
          }}
        >
          LinkedIn CTAs
        </Button>
        <Button
          disabled
          size="xs"
          variant="outline"
          color="teal"
          onClick={() => {}}
        >
          Configuration
        </Button>
      </Stack>
    </Container>
  );
}
