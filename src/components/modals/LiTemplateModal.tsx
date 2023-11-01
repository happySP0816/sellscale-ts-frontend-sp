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
  Container,
  Box,
  Select,
  Switch,
  Stack,
} from "@mantine/core";
import { ContextModalProps, openContextModal } from "@mantine/modals";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRecoilValue } from "recoil";
import { userTokenState } from "@atoms/userAtoms";
import { Archetype, PersonaOverview } from "src";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import createCTA from "@utils/requests/createCTA";
import CTAGeneratorExample from "@common/cta_generator/CTAGeneratorExample";
import { DateInput } from "@mantine/dates";
import { API_URL } from "@constants/data";
import { createLiTemplate, updateLiTemplate } from "@utils/requests/linkedinTemplates";
import { currentProjectState } from "@atoms/personaAtoms";

export default function LiTemplateModal({ context, id, innerProps }: ContextModalProps<{ mode: 'CREATE' | 'EDIT', editProps?: {
  templateId: number,
  message: string,
  active: boolean,
} }>) {
  const theme = useMantineTheme();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const userToken = useRecoilValue(userTokenState);
  const currentProject = useRecoilValue(currentProjectState);

  const form = useForm({
    initialValues: {
      message: innerProps.editProps?.message ?? '',
      active: innerProps.editProps?.active === undefined ? true : innerProps.editProps.active,
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    if (innerProps.mode === 'CREATE') {
      await createTemplate(values);
    } else {
      await updateTemplate(values);
    }
  }

  const createTemplate = async (values: typeof form.values) => {
    if (!currentProject) return;

    await createLiTemplate(userToken, currentProject.id, values.message, false);

    queryClient.refetchQueries({
      queryKey: [`query-get-li-templates`],
    });
    context.closeModal(id);
  }

  const updateTemplate = async (values: typeof form.values) => {
    if (!currentProject) return;

    await updateLiTemplate(userToken, currentProject.id, innerProps.editProps!.templateId, values.message, values.active)

    queryClient.refetchQueries({
      queryKey: [`query-get-li-templates`],
    });
    context.closeModal(id);
  }

  return (
    <Paper
      p={0}
      style={{
        position: 'relative',
      }}
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <LoadingOverlay visible={loading} />

        <Card withBorder>
          <Stack>
            <Textarea placeholder='Template outline' {...form.getInputProps('message')} />
            <Switch label='Active' {...form.getInputProps('active', { type: 'checkbox' })} />
            <Box>
              <Button type='submit'>{innerProps.mode === 'CREATE' ? 'Create' : 'Update'}</Button>
            </Box>
          </Stack>
        </Card>
      </form>
    </Paper>
  );
}
