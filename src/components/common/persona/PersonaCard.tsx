import {
  Badge,
  Button,
  Card,
  Image,
  Container,
  Text,
  Avatar,
  Title,
  Stack,
  Group,
  MantineTheme,
  Drawer,
  Center,
} from "@mantine/core";
import { forwardRef, useImperativeHandle, useState } from "react";

type PersonaCardProps = {
  name: string,
  active?: boolean,
};

export default function PersonaCard(props: PersonaCardProps) {

  const activeBackgroundSX = (theme: MantineTheme) => ({
    border: `1px solid ${
      theme.colorScheme === "dark"
        ? theme.colors.dark[5]
        : theme.colors.gray[2]
    }`,
    borderRadius: "8px",
    backgroundColor:
      theme.colorScheme === "dark"
        ? theme.colors.dark[6]
        : theme.colors.gray[1],
  });

  // TODO, change this to a context
  const [openedUploadDrawer, setOpenedUploadDrawer] = useState(false);
  const [openedLinkedInCTAsDrawer, setOpenedLinkedInCTAsDrawer] = useState(false);

  return (
    <Group
      p='xs'
      sx={(theme) => {
        if (props.active) {
          return activeBackgroundSX(theme);
        } else {
          return {};
        }
      }}>
      <Stack align="center">
        <Avatar size={80} radius={80} src="avatar.png" alt="it's me" />
        {!props.active && (
          <Button variant="light" color="teal" size="xs" compact>
            Make Active
          </Button>
        )}
      </Stack>
      <Stack spacing="xs">
        <Title order={2} m="sm" mt="md">
          {props.name}
        </Title>
        <Group grow>
          <Button variant="outline" color="teal" m="sm" onClick={() => setOpenedUploadDrawer(true)}>
            Upload
          </Button>
          <Button variant="outline" color="teal" m="sm" onClick={() => setOpenedLinkedInCTAsDrawer(true)}>
            LinkedIn CTAs
          </Button>
        </Group>
      </Stack>

      <Drawer
        opened={openedUploadDrawer}
        onClose={() => setOpenedUploadDrawer(false)}
        title={<Title order={2}>Upload Persona</Title>}
        padding="xl"
        size="xl"
        position="right"
      >
        <Text pb='xs'><span className="font-bold">LinkedIn: </span><span>220/400 prospects available</span></Text>
        <Text pb='xs'><span className="font-bold">Email: </span><span>220/400 prospects available</span></Text>

        <Center my='xs'>
          <Button variant="outline" color="teal">
            Upload Now
          </Button>
        </Center>

        <Text align="center" pb='xs' c="dimmed" fs="italic" fz="sm">CSV of Email + LinkedIn</Text>
        
      </Drawer>
      <Drawer
        opened={openedLinkedInCTAsDrawer}
        onClose={() => setOpenedLinkedInCTAsDrawer(false)}
        title="LinkedIn CTAs"
        padding="xl"
        size="xl"
        position="right"
      >
        
      </Drawer>

    </Group>
  );
};