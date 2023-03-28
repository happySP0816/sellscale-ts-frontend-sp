import { userTokenState } from "@atoms/userAtoms";
import FlexSeparate from "@common/library/FlexSeparate";
import {
  Text,
  Paper,
  useMantineTheme,
  Divider,
  Stepper,
  TextInput,
  NumberInput,
  Button,
  Center,
  Stack,
  Textarea,
  LoadingOverlay,
  Group,
  Select,
  Input,
  Badge,
  Flex,
  ScrollArea,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { ContextModalProps } from "@mantine/modals";
import { showNotification } from "@mantine/notifications";
import { IconWriting } from "@tabler/icons";
import { valueToColor } from "@utils/general";
import createCTA from "@utils/requests/createCTA";
import { generateCTAs } from "@utils/requests/generateCTAs";
import {
  generateDraft,
  generateValueProps,
  sendToOutreach,
} from "@utils/requests/generateSequence";
import { useState } from "react";
import { useRecoilValue } from "recoil";

interface CTAGeneratorProps extends Record<string, unknown> {
  personaId: string,
  personaName: string
}

export default function CTAGeneratorModal({
  context,
  id,
  innerProps,
}: ContextModalProps<CTAGeneratorProps>) {
  const theme = useMantineTheme();
  const userToken = useRecoilValue(userTokenState);
  const [generatedCTAs, setGeneratedCTAs] = useState<
    { cta: string; tag: string, enabled: boolean }[]
  >([]);
  const [loading, setLoading] = useState(false);

  const surveyForm = useForm({
    initialValues: {
      company: "",
      persona: innerProps.personaName,
      proposition: "",
    },
  });

  const handleSubmit = async (values: typeof surveyForm.values) => {
    setLoading(true);
    const result = await generateCTAs(
      userToken,
      values.company,
      values.persona,
      values.proposition
    );
    setLoading(false);
    if (result.status === "success") {
      setGeneratedCTAs(result.extra.map((cta: any) => ({ ...cta, enabled: true })));
    } else {
      showNotification({
        id: "generate-cta-ideas-error",
        title: "Error",
        message: "Failed to generate CTA ideas",
        color: "red",
        autoClose: false,
      });
    }
  };

  return (
    <Paper
      p={0}
      style={{
        position: "relative",
        backgroundColor: theme.colors.dark[7],
      }}
    >
      <LoadingOverlay visible={loading} overlayBlur={2} />
      <form onSubmit={surveyForm.onSubmit(handleSubmit)}>
        <Stack spacing="xl">
          <Group spacing="xs" position="center">
            <Input
              icon={<IconWriting />}
              variant="unstyled"
              placeholder="Company"
              w={120}
              required
              {...surveyForm.getInputProps("company")}
            />
            <Text>helps</Text>
            <Input
              variant="unstyled"
              placeholder="Target persona"
              w={120}
              required
              {...surveyForm.getInputProps("persona")}
            />
            <Text>with</Text>
            <Input
              variant="unstyled"
              placeholder="Value proposition"
              w={210}
              required
              {...surveyForm.getInputProps("proposition")}
            />
            <Text>.</Text>
          </Group>
          <Center>
            <Button radius="md" type="submit">
              Generate CTA Ideas
            </Button>
          </Center>
          {generatedCTAs.length > 0 && (
            <>
              <Divider />
              <ScrollArea h={400}>
                <Stack>
                {generatedCTAs.map((cta, index) => (
                  <FlexSeparate key={index}>
                    <Badge w={150} mt={10} color={valueToColor(theme, cta.tag)}>
                      {cta.tag.replace('[', '')}-based
                    </Badge>
                    <Textarea
                      w={300}
                      placeholder="Your CTA"
                      value={cta.cta}
                      onChange={(e) => {
                        const newGeneratedCTAs = [...generatedCTAs];
                        newGeneratedCTAs[index] = { enabled: cta.enabled, tag: cta.tag, cta: e.currentTarget.value };
                        setGeneratedCTAs(newGeneratedCTAs);
                      }}
                      required
                      variant="unstyled"
                    />
                    <Button disabled={!cta.enabled} mt={10} onClick={async () => {
                      const response = await createCTA(userToken, innerProps.personaId, cta.cta);
                      if (response.status === "success") {
                        showNotification({
                          id: "create-cta-success",
                          title: "Success",
                          message: `Added CTA to Persona`,
                          color: "green",
                          autoClose: 5000,
                        });

                        // Disable the CTA
                        const newGeneratedCTAs = [...generatedCTAs];
                        newGeneratedCTAs[index] = { enabled: false, tag: cta.tag, cta: cta.cta };
                        setGeneratedCTAs(newGeneratedCTAs);
                      } else {
                        showNotification({
                          id: "create-cta-error",
                          title: "Error",
                          message: "Failed to add CTA to Persona",
                          color: "red",
                          autoClose: false,
                        });
                      }
                    }} variant="light">Use CTA</Button>
                  </FlexSeparate>
                ))}
                </Stack>
              </ScrollArea>
            </>
          )}
        </Stack>
      </form>
    </Paper>
  );
}
