import {
  Anchor,
  Button,
  Group,
  Text,
  Paper,
  useMantineTheme,
  Avatar,
  Stack,
  Image,
  Collapse,
  Divider,
  Container,
  Center,
  ActionIcon,
  TextInput,
  Flex,
  Textarea,
  FocusTrap,
  LoadingOverlay,
  PasswordInput,
  List,
  ThemeIcon,
} from "@mantine/core";
import { ContextModalProps } from "@mantine/modals";
import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dropzone, DropzoneProps, MIME_TYPES } from "@mantine/dropzone";
import {
  IconUpload,
  IconX,
  IconTrashX,
  IconFileDescription,
  IconChevronDown,
  IconChevronUp,
  IconPencil,
  IconPlus,
  IconUsers,
  IconLock,
  IconUser,
  IconBrandLinkedin,
} from "@tabler/icons";
import { DataTable } from "mantine-datatable";
import FileDropAndPreview from "./upload-prospects/FileDropAndPreview";
import { useQuery } from "@tanstack/react-query";
import { useRecoilValue } from "recoil";
import { userTokenState } from "@atoms/userAtoms";
import { logout } from "@auth/core";
import { Archetype } from "src";
import { API_URL, EMAIL_REGEX } from "@constants/data";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import LinkedInCookieTut from "@assets/images/linkedin-cookie-tut.jpeg";
import FlexSeparate from "@common/library/FlexSeparate";

export default function InstructionsLinkedInCookieModal({
  context,
  id,
  innerProps,
}: ContextModalProps) {
  const theme = useMantineTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const userToken = useRecoilValue(userTokenState);

  const form = useForm({
    initialValues: {
      cookie: "",
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);

    const response = await fetch(
      `${API_URL}/integration/linkedin/send-cookie`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cookie: values.cookie,
        }),
      }
    );
    const res = await response.json();

    setLoading(false);

    if (response.status === 200) {
      showNotification({
        id: "linkedin-cookie-sent",
        title: "Cookie successfully saved",
        message: "It may take up to 24 hours for everything to be connected.",
        color: "blue",
        autoClose: false,
      });
    } else {
      showNotification({
        id: "linkedin-cookie-sent-error",
        title: "Error while saving cookie",
        message: "Please contact an administrator.",
        color: "red",
        autoClose: false,
      });
    }

    context.closeModal(id);
  };

  return (
    <Paper
      p={0}
      style={{
        position: "relative",
        backgroundColor: theme.colors.dark[7],
      }}
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <LoadingOverlay visible={loading} />

        <Text fz="sm" c="dimmed" fs="italic" pb="md">
          The following instructions only work on Chrome, Edge, and Firefox. If
          you have a different browser, you will need to{" "}
          <Anchor
            href="https://www.google.com/search?q=how+to+view+a+website+cookie+on+%7Bmy+browser%7D"
            target="_blank"
          >
            look up specific instructions online
          </Anchor>
          .
        </Text>

        <FlexSeparate>
          <List spacing="xs" size="sm" center>
            <List.Item
              icon={
                <ThemeIcon variant="light" color="blue" size={24} radius="xl">
                  1
                </ThemeIcon>
              }
            >
              Go to{" "}
              <Anchor href="https://www.linkedin.com/" target="_blank">
                LinkedIn
              </Anchor>{" "}
              and sign in.
            </List.Item>
            <List.Item
              icon={
                <ThemeIcon variant="light" color="blue" size={24} radius="xl">
                  2
                </ThemeIcon>
              }
            >
              Open the developer tools (F12) and go to the Application tab.
            </List.Item>
            <List.Item
              icon={
                <ThemeIcon variant="light" color="blue" size={24} radius="xl">
                  3
                </ThemeIcon>
              }
            >
              Open the Cookies tab under Storage. Click on
              "https://www.linkedin.com/" and to the right you'll all the
              various cookies LinkedIn stores.
            </List.Item>
            <List.Item
              icon={
                <ThemeIcon variant="light" color="blue" size={24} radius="xl">
                  4
                </ThemeIcon>
              }
            >
              Copy the "li_at" cookie and paste it into the box below.
            </List.Item>
          </List>
          <Image
            maw={240}
            mx="auto"
            radius="md"
            src={LinkedInCookieTut}
            alt="Random image"
          />
        </FlexSeparate>

        <TextInput
          mt="md"
          required
          placeholder="LinkedIn Cookie"
          label="Cookie"
          icon={<IconUser size={16} stroke={1.5} />}
          {...form.getInputProps("cookie")}
        />

        {error && (
          <Text color="red" size="sm" mt="sm">
            {error}
          </Text>
        )}

        {
          <Group position="apart" mt="xl">
            <Anchor component="button" type="button" color="dimmed" size="sm">
              {/* Need help? */}
            </Anchor>

            <Button variant="light" radius="md" type="submit">
              Complete
            </Button>
          </Group>
        }
      </form>
    </Paper>
  );
}
