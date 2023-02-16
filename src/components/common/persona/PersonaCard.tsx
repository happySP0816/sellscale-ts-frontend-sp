import {
  Button,
  Avatar,
  Title,
  Text,
  Stack,
  Group,
  MantineTheme,
  Switch,
  useMantineTheme,
} from "@mantine/core";
import { IconCheck, IconX } from "@tabler/icons";
import { useRecoilState } from "recoil";
import { temp_delay } from "../../../utils/general";
import displayNotification from "../../../utils/notificationFlow";
import {
  uploadDrawerOpenState,
  linkedInCTAsDrawerOpenState,
} from "../../atoms/personaAtoms";

type PersonaCardProps = {
  value: string;
  name: string;
  active: boolean;
};

export default function PersonaCard(props: PersonaCardProps) {
  const theme = useMantineTheme();
  const [uploadDrawerOpened, setUploadDrawerOpened] = useRecoilState(
    uploadDrawerOpenState
  );
  const [linkedInCTAsDrawerOpened, setLinkedInCTAsDrawerOpened] =
    useRecoilState(linkedInCTAsDrawerOpenState);

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
        message: `Updating persona to ${props.name}...`,
        color: "teal",
      },
      {
        title: `${props.name} is now active 🎉`,
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

  return (
    <Group
      p="xs"
      sx={(theme) => {
        if (props.active) {
          return activeBackgroundSX(theme);
        } else {
          return {};
        }
      }}
    >
      <Stack align="center">
        <Avatar
          size={80}
          radius={80}
          src={`https://ui-avatars.com/api/?background=random&name=${encodeURIComponent(
            props.name
          )}`}
          alt={`${props.name}'s Profile Picture`}
        />
        <Switch
          checked={props.active}
          onChange={(event) => {
            /* setChecked(event.currentTarget.checked) */
          }}
          color="teal"
          size="md"
          onLabel="ON"
          offLabel="OFF"
          thumbIcon={
            props.active ? (
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
      <Stack spacing="xs">
        <Title order={3} ml="sm" mt="md">
          {props.name}
        </Title>
        <Text ml="sm">872 contacts with 68% used. 48 active connections.</Text>
        <Group>
          <Button
            variant="outline"
            color="teal"
            m="sm"
            onClick={() => setUploadDrawerOpened(true)}
          >
            Upload
          </Button>
          <Button
            variant="outline"
            color="teal"
            m="sm"
            onClick={() => setLinkedInCTAsDrawerOpened(true)}
          >
            LinkedIn CTAs
          </Button>
        </Group>
      </Stack>
    </Group>
  );
}
