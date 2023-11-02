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
  Image,
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
import { createLiTemplate, detectLiTemplateResearch, updateLiTemplate } from "@utils/requests/linkedinTemplates";
import { currentProjectState } from "@atoms/personaAtoms";
import { PersonalizationSection, RESEARCH_POINTS } from "@common/sequence/SequenceSection";
import { TypeAnimation } from "react-type-animation";
import sellScaleLogo from '../common/sequence/assets/logo.jpg';
import _ from "lodash";
import { useDebouncedValue, useDidUpdate, useTimeout } from "@mantine/hooks";

export default function LiTemplateModal({
  context,
  id,
  innerProps,
}: ContextModalProps<{
  mode: 'CREATE' | 'EDIT';
  editProps?: {
    templateId: number;
    message: string;
    active: boolean;
    humanFeedback: string;
    researchPoints: string[];
  };
}>) {
  const theme = useMantineTheme();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const userToken = useRecoilValue(userTokenState);
  const currentProject = useRecoilValue(currentProjectState);

  const [loadingResearch, setLoadingResearch] = useState(false);
  const [researchPoints, setResearchPoints] = useState<string[]>(innerProps.editProps?.researchPoints ?? []);

  const showUserFeedback = true;

  const form = useForm({
    initialValues: {
      message: innerProps.editProps?.message ?? '',
      active: innerProps.editProps?.active === undefined ? true : innerProps.editProps.active,
      humanFeedback: innerProps.editProps?.humanFeedback ?? '',
    },
  });

  const [debouncedMessage] = useDebouncedValue(form.values.message, 500);

  useDidUpdate(() => {
    (async () => {
      if (!currentProject) return;
      setLoadingResearch(true);
      const response = await detectLiTemplateResearch(
        userToken,
        currentProject.id,
        undefined,
        debouncedMessage
      );
      if (response.status === 'success') {
        console.log(response.data);
        setResearchPoints(response.data);
      }
      setLoadingResearch(false);
    })();
  }, [debouncedMessage]);

  const handleSubmit = async (values: typeof form.values) => {
    if (innerProps.mode === 'CREATE') {
      await createTemplate(values);
    } else {
      await updateTemplate(values);
    }
  };

  const createTemplate = async (values: typeof form.values) => {
    if (!currentProject) return;

    await createLiTemplate(userToken, currentProject.id, values.message, false, researchPoints, values.humanFeedback);

    queryClient.refetchQueries({
      queryKey: [`query-get-li-templates`],
    });
    context.closeModal(id);
  };

  const updateTemplate = async (values: typeof form.values) => {
    if (!currentProject) return;

    await updateLiTemplate(
      userToken,
      currentProject.id,
      innerProps.editProps!.templateId,
      values.message,
      values.active,
      undefined,
      undefined,
      researchPoints,
      values.humanFeedback
    );

    queryClient.refetchQueries({
      queryKey: [`query-get-li-templates`],
    });
    context.closeModal(id);
  };

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
            <Textarea
              minRows={4}
              placeholder='Template outline'
              {...form.getInputProps('message')}
            />
            <Switch label='Active' {...form.getInputProps('active', { type: 'checkbox' })} />

            <Box mih={500} sx={{ position: 'relative' }}>
              {loadingResearch ? (
                <LoadingOverlay visible />
              ) : (
                <PersonalizationSection
                  title='Enabled Research Points'
                  blocklist={_.difference(RESEARCH_POINTS, researchPoints)}
                  onItemsChange={async (items) => {
                    setResearchPoints(items.filter((x) => x.checked).map((x) => x.id));
                  }}
                  onChanged={() => {}}
                />
              )}
            </Box>

            {showUserFeedback && (
              <Card mb='16px'>
                <Card.Section
                  sx={{
                    backgroundColor: '#26241d',
                    flexDirection: 'row',
                    display: 'flex',
                  }}
                  p='sm'
                >
                  <Image src={sellScaleLogo} width={30} height={30} mr='sm' />
                  <Text color='white' mt='4px'>
                    <TypeAnimation
                      sequence={[
                        'Feel free to gvie me', // Types 'One'
                        100, // Waits 1s
                        'Feel free to give me feedback on ', // Deletes 'One' and types 'Two'
                        400, // Waits 2s
                        'Feel free to give me feedback on improving the message', // Types 'Three' without deleting 'Two'
                        () => {
                          console.log('Sequence completed');
                        },
                      ]}
                      speed={50}
                      wrapper='span'
                      cursor={false}
                    />
                  </Text>
                </Card.Section>
                <Card.Section sx={{ border: 'solid 2px #26241d !important' }} p='8px'>
                  <Textarea
                    minRows={5}
                    placeholder='- make it shorter&#10;-use this fact&#10;-mention the value prop'
                    {...form.getInputProps('humanFeedback')}
                  />
                </Card.Section>
              </Card>
            )}

            <Box>
              <Button type='submit'>{innerProps.mode === 'CREATE' ? 'Create' : 'Update'}</Button>
            </Box>
          </Stack>
        </Card>
      </form>
    </Paper>
  );
}
