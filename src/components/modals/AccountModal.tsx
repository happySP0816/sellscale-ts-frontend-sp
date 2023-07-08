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
import { valueToColor, nameToInitials } from "@utils/general";
import { IconCheck, IconLogout, IconX } from "@tabler/icons";
import { logout } from "@auth/core";

export default function AccountModal({
  context,
  id,
  innerProps,
}: ContextModalProps<{ }>) {
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

  return (
    <Paper
      p={0}
      style={{
        position: 'relative',
      }}
    >
      <Avatar src={userData?.img_url} alt={`${userData?.sdr_name}'s Profile Picture`} color={valueToColor(theme, userData?.sdr_name)} size={120} radius={120} mx="auto">
        {nameToInitials(userData?.sdr_name)}
      </Avatar>
      <Text ta="center" fz="lg" weight={500} mt="md">
        {userData?.sdr_name}
      </Text>
      <Text ta="center" c="dimmed" fz="sm">
        {userData?.sdr_email} • {userData?.sdr_title}
      </Text>

      <Group position="center" pt='lg'>
        <Badge pl={0} size="lg" color={userData?.active ? 'blue' : 'red'} radius="xl" leftSection={userData?.active ? enabledIcon : disabledIcon}>
          Active
        </Badge>
        <Badge pl={0} size="lg" color={userData?.auto_bump ? 'blue' : 'red'} radius="xl" leftSection={userData?.auto_bump ? enabledIcon : disabledIcon}>
          Auto Bump
        </Badge>
        <Badge pl={0} size="lg" color={userData?.auto_calendar_sync ? 'blue' : 'red'} radius="xl" leftSection={userData?.auto_calendar_sync ? enabledIcon : disabledIcon}>
          Auto Calendar Sync
        </Badge>
        <Badge pl={0} size="lg" color={userData?.auto_generate_messages ? 'blue' : 'red'} radius="xl" leftSection={userData?.auto_generate_messages ? enabledIcon : disabledIcon}>
          Auto Generate Messages
        </Badge>
        <Badge pl={0} size="lg" color={userData?.li_connected ? 'blue' : 'red'} radius="xl" leftSection={userData?.li_connected ? enabledIcon : disabledIcon}>
          LinkedIn
        </Badge>
        <Badge pl={0} size="lg" color={userData?.li_voyager_connected ? 'blue' : 'red'} radius="xl" leftSection={userData?.li_voyager_connected ? enabledIcon : disabledIcon}>
          LinkedIn Voyager
        </Badge>
        <Badge pl={0} size="lg" color={userData?.message_generation_captivate_mode ? 'blue' : 'red'} radius="xl" leftSection={userData?.message_generation_captivate_mode ? enabledIcon : disabledIcon}>
          Captivate Mode
        </Badge>
        <Badge pl={0} size="lg" color={userData?.nylas_connected ? 'blue' : 'red'} radius="xl" leftSection={userData?.nylas_connected ? enabledIcon : disabledIcon}>
          Nylas Connected
        </Badge>
        <Badge pl={0} size="lg" color={userData?.onboarded ? 'blue' : 'red'} radius="xl" leftSection={userData?.onboarded ? enabledIcon : disabledIcon}>
          Onboarded
        </Badge>
      </Group>

      <CreditsCard />

      <Center>
        <Button
          rightIcon={<IconLogout size="1.1rem" />}
          radius="md"
          mt="xl"
          size="md"
          color={theme.colorScheme === 'dark' ? undefined : 'dark'}
          onClick={(event) => {
            event.preventDefault();
            logout(true);
          }}
        >
          Logout
        </Button>
      </Center>
    </Paper>
  );
}
