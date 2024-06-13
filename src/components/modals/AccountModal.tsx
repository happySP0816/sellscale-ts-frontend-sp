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
  Card,
  Box,
  Avatar,
  rem,
  Badge,
  Center,
  TextInput,
  ActionIcon,
} from "@mantine/core";
import { ContextModalProps, openContextModal } from "@mantine/modals";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRecoilValue } from "recoil";
import { userDataState, userTokenState } from "@atoms/userAtoms";
import { Archetype, CTA } from "src";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import createCTA, { updateCTA } from "@utils/requests/createCTA";
import { DateInput } from "@mantine/dates";
import CreditsCard from "@common/credits/CreditsCard";
import { valueToColor, nameToInitials, proxyURL } from "@utils/general";
import { IconArrowRight, IconBrandLinkedin, IconCheck, IconCircleCheck, IconLogout, IconMail, IconPencil, IconX } from "@tabler/icons";
import { logout } from "@auth/core";

export default function AccountModal({ context, id, innerProps }: ContextModalProps<{}>) {
  const theme = useMantineTheme();

  const userToken = useRecoilValue(userTokenState);
  const userData = useRecoilValue(userDataState);

  console.log(userData);

  const enabledIcon = (
    <Avatar color="blue" radius="sm">
      <IconCheck size="1.1rem" />
    </Avatar>
  );
  const disabledIcon = (
    <Avatar color="red" radius="sm">
      <IconX size="1.1rem" />
    </Avatar>
  );

  // return (
  //   <Paper
  //     p={0}
  //     style={{
  //       position: 'relative',
  //     }}
  //   >
  //     <Avatar src={proxyURL(userData?.img_url)} alt={`${userData?.sdr_name}'s Profile Picture`} color={valueToColor(theme, userData?.sdr_name)} size={120} radius={120} mx="auto">
  //       {nameToInitials(userData?.sdr_name)}
  //     </Avatar>
  //     <Text ta="center" fz="lg" weight={500} mt="md">
  //       {userData?.sdr_name}
  //     </Text>
  //     <Text ta="center" c="dimmed" fz="sm">
  //       {userData?.sdr_email} • {userData?.sdr_title}
  //     </Text>

  //     <Group position="center" pt='lg'>
  //       <Badge pl={0} size="lg" color={userData?.active ? 'blue' : 'red'} radius="xl" leftSection={userData?.active ? enabledIcon : disabledIcon}>
  //         Active
  //       </Badge>
  //       <Badge pl={0} size="lg" color={userData?.auto_bump ? 'blue' : 'red'} radius="xl" leftSection={userData?.auto_bump ? enabledIcon : disabledIcon}>
  //         Auto Bump
  //       </Badge>
  //       <Badge pl={0} size="lg" color={userData?.auto_calendar_sync ? 'blue' : 'red'} radius="xl" leftSection={userData?.auto_calendar_sync ? enabledIcon : disabledIcon}>
  //         Auto Calendar Sync
  //       </Badge>
  //       <Badge pl={0} size="lg" color={userData?.auto_generate_messages ? 'blue' : 'red'} radius="xl" leftSection={userData?.auto_generate_messages ? enabledIcon : disabledIcon}>
  //         Auto Generate Messages
  //       </Badge>
  //       <Badge pl={0} size="lg" color={userData?.li_connected ? 'blue' : 'red'} radius="xl" leftSection={userData?.li_connected ? enabledIcon : disabledIcon}>
  //         LinkedIn
  //       </Badge>
  //       <Badge pl={0} size="lg" color={userData?.li_voyager_connected ? 'blue' : 'red'} radius="xl" leftSection={userData?.li_voyager_connected ? enabledIcon : disabledIcon}>
  //         LinkedIn Voyager
  //       </Badge>
  //       <Badge pl={0} size="lg" color={userData?.message_generation_captivate_mode ? 'blue' : 'red'} radius="xl" leftSection={userData?.message_generation_captivate_mode ? enabledIcon : disabledIcon}>
  //         Captivate Mode
  //       </Badge>
  //       <Badge pl={0} size="lg" color={userData?.nylas_connected ? 'blue' : 'red'} radius="xl" leftSection={userData?.nylas_connected ? enabledIcon : disabledIcon}>
  //         Nylas Connected
  //       </Badge>
  //       <Badge pl={0} size="lg" color={userData?.onboarded ? 'blue' : 'red'} radius="xl" leftSection={userData?.onboarded ? enabledIcon : disabledIcon}>
  //         Onboarded
  //       </Badge>
  //     </Group>

  //     <CreditsCard />

  //     <Center>
  //       <Button
  //         rightIcon={<IconLogout size="1.1rem" />}
  //         radius="md"
  //         mt="xl"
  //         size="md"
  //         color={theme.colorScheme === 'dark' ? undefined : 'dark'}
  //         onClick={(event) => {
  //           event.preventDefault();
  //           logout(true);
  //         }}
  //       >
  //         Logout
  //       </Button>
  //     </Center>
  //   </Paper>
  // );
  return (
    <Paper>
      <Flex gap={30}>
        <div className="relative">
          <Card shadow="xl" p={2} h={"fit-content"} withBorder>
            <Avatar
              size={120}
              radius={"xs"}
              src={proxyURL(userData?.img_url)}
              alt={`${userData?.sdr_name}'s Profile Picture`}
              color={valueToColor(theme, userData?.sdr_name)}
            />
          </Card>
          <ActionIcon radius={"xl"} bg="black" className="absolute z-10 bottom-2 right-[-4px] hover:bg-black">
            <IconPencil color="white" size={"1.2rem"} />
          </ActionIcon>
        </div>
        <Box>
          <Flex gap={"md"}>
            <TextInput label="First Name" value={userData?.sdr_name.split(" ")[0]} />
            <TextInput label="Last Name" value={userData?.sdr_name.split(" ")[1]} />
          </Flex>
          <TextInput mt={"md"} label="Primary Email" value={userData?.sdr_email} />
        </Box>
      </Flex>
      <Paper mt={"md"} withBorder px={"sm"} py={"xs"} className="flex items-center justify-between">
        <Flex gap={5} align={"center"}>
          <IconBrandLinkedin fill="#228be6" color="white" size={"2rem"} />
          <Text fw={500}>Linkedin Connected</Text>
        </Flex>
        <Flex align={"center"} gap={"sm"}>
          {userData?.li_connected && (
            <Text underline color="red" fw={600} size={"sm"}>
              Disconnect
            </Text>
          )}

          <Button
            color={userData?.li_connected ? "green" : "red"}
            variant="outline"
            leftIcon={userData?.li_connected && <IconCircleCheck size={"1.4rem"} fill="#40c057" color="white" />}
          >
            {userData?.li_connected ? "Connected" : "Disconnected"}
          </Button>
        </Flex>
      </Paper>
      <Paper mt={"md"} withBorder px={"sm"} py={"xs"} className="flex items-center justify-between">
        <Flex gap={5} align={"center"}>
          <IconMail fill="orange" color="white" size={"2rem"} />
          <Text fw={500}>{5} domains active</Text>
        </Flex>
        <Button variant="outline" rightIcon={<IconArrowRight size={"1.2rem"} />}>
          Modify
        </Button>
      </Paper>
      <Flex mt={30} gap={"md"}>
        <Button size="md" color="red" variant="outline" fullWidth>
          Deactivate Account
        </Button>
        <Button
          color="red"
          size="md"
          fullWidth
          rightIcon={<IconLogout size="1.1rem" />}
          onClick={(event) => {
            event.preventDefault();
            logout(true);
          }}
        >
          Logout
        </Button>
      </Flex>
    </Paper>
  );
}
