import {
  Anchor,
  Button,
  Group,
  Text,
  Paper,
  useMantineTheme,
  Avatar,
  Title,
  Select,
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
} from "@mantine/core";
import { ContextModalProps, openContextModal } from "@mantine/modals";
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
  IconMessage2,
} from "@tabler/icons";
import { DataTable } from "mantine-datatable";
import FileDropAndPreview from "./upload-prospects/FileDropAndPreview";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRecoilValue } from "recoil";
import { userTokenState } from "@atoms/userAtoms";
import { logout } from "@auth/core";
import { Archetype } from "src/main";
import { EMAIL_REGEX } from "@constants/data";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import createCTA from "@utils/requests/createCTA";

export default function CreateNewCTAModel({
  context,
  id,
  innerProps,
}: ContextModalProps<{ personaId: string }>) {
  const theme = useMantineTheme();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const userToken = useRecoilValue(userTokenState);

  const form = useForm({
    initialValues: {
      cta: "",
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);

    const result = await createCTA(userToken, innerProps.personaId, values.cta);

    setLoading(false);

    if (result.status === "success") {
      showNotification({
        id: "new-cta-created",
        title: "CTA successfully created",
        message:
          "Please allow some time for it to propagate through our systems.",
        color: "blue",
        autoClose: 3000,
      });
      queryClient.invalidateQueries({
        queryKey: [`query-cta-data-${innerProps.personaId}`],
      });
    } else {
      showNotification({
        id: "new-cta-created-error",
        title: "Error while creating a new CTA",
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

        <Flex direction='column'>
      
        <Textarea
          mt="md"
          required
          placeholder={`I'd love to connect and learn more about you...`}
          label="Call-to-Action"
          withAsterisk
          autosize
          {...form.getInputProps("cta")}
        />
        <Text size="xs" color={form.getInputProps("cta").value.length <= 120 ? "grey" : "red"}>
          {form.getInputProps("cta").value.length}/{120}
        </Text>
        </Flex>

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

            <Button
              variant="outline"
              radius="md"
              size="xs"
              onClick={() => {
                openContextModal({
                  modal: "ctaGenerator",
                  title: <Title order={3}>CTA Generator</Title>,
                  innerProps: { personaId: innerProps.personaId, personaName: '' },
                });
              }}
            >
              Brainstorm CTAs with AI
            </Button>

            <Button variant="light" radius="md" type="submit" disabled={form.getInputProps("cta").value.length > 120}>
              Create
            </Button>
          </Group>
        }
      </form>
    </Paper>
  );
}
