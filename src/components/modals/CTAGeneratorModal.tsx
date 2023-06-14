import { userDataState, userTokenState } from "@atoms/userAtoms";
import CTAGeneratorExample from "@common/cta_generator/CTAGeneratorExample";
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
  Container,
  createStyles,
  Autocomplete,
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
import { Archetype, PersonaOverview } from "src";

interface CTAGeneratorProps extends Record<string, unknown> {
  personaId: string;
  personaName: string;
  personas?: PersonaOverview[];
}

const useStyles = createStyles((theme) => ({
  root: {
    position: "relative",
  },

  input: {
    height: 54,
    paddingTop: 18,
  },

  label: {
    position: "absolute",
    pointerEvents: "none",
    fontSize: theme.fontSizes.xs,
    paddingLeft: theme.spacing.sm,
    paddingTop: `calc(${theme.spacing.sm} / 2)`,
    zIndex: 1,
  },
}));

export default function CTAGeneratorModal({
  context,
  id,
  innerProps,
}: ContextModalProps<CTAGeneratorProps>) {
  const theme = useMantineTheme();
  const { classes } = useStyles();

  const userToken = useRecoilValue(userTokenState);
  const userData = useRecoilValue(userDataState);

  const [generatedCTAs, setGeneratedCTAs] = useState<
    { cta: string; tag: string; enabled: boolean }[]
  >([]);
  const [loading, setLoading] = useState(false);

  const surveyForm = useForm({
    initialValues: {
      company: userData?.client?.company ?? "",
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
      setGeneratedCTAs(
        result.data.map((cta: any) => ({ ...cta, enabled: true }))
      );
    } else {
      showNotification({
        id: "generate-cta-ideas-error",
        title: "Generation Failed",
        message: "Failed to generate CTA ideas. Please try again!",
        color: "red",
        autoClose: 5000,
      });
    }
  };

  return (
    <Paper
      p={0}
      style={{
        position: "relative",
      }}
    >
      <Text size="sm" mb="md">
        Fill in the form below to generate 6 personalized CTAs.
      </Text>

      <LoadingOverlay visible={loading} overlayBlur={2} />
      <form onSubmit={surveyForm.onSubmit(handleSubmit)}>
        <Stack spacing="xl">
          <Container m={0}>
            <TextInput
              label="Company"
              placeholder="Company"
              classNames={classes}
              {...surveyForm.getInputProps("company")}
              required
            />

            <Autocomplete
              mt="md"
              label="Which persona?"
              placeholder="ex. VP of Sales, Head of HR"
              data={
                innerProps.personas
                  ? innerProps.personas.map((p) => p.name)
                  : []
              }
              classNames={classes}
              {...surveyForm.getInputProps("persona")}
              required
            />

            <TextInput
              mt="md"
              label="Value Proposition"
              placeholder="What benefits or economic value do you provide to them?"
              classNames={classes}
              {...surveyForm.getInputProps("proposition")}
              required
            />
          </Container>
          <Center>
            <Button radius="md" type="submit">
              Generate CTA Ideas
            </Button>
          </Center>
          {generatedCTAs.length > 0 && (
            <>
              <Divider />
              <Text>Edit and select the CTAs below.</Text>
            </>
          )}
          {generatedCTAs.length > 0 && (
            <div>
              <ScrollArea h={400}>
                <Stack>
                  {generatedCTAs.map((cta, index) => (
                    <Flex key={index}>
                      <Container m={0} p={0}>
                        <Badge
                          w={150}
                          mt={10}
                          color={valueToColor(theme, cta.tag)}
                        >
                          {cta.tag.replace("[", "")}-based
                        </Badge>
                        <CTAGeneratorExample
                          ctaText={cta.cta}
                        ></CTAGeneratorExample>
                      </Container>
                      <Flex direction="column" mx={8}>
                        <Textarea
                          w={300}
                          placeholder="Your CTA"
                          value={cta.cta}
                          px={8}
                          sx={{
                            border: "solid 1px #333",
                          }}
                          onChange={(e) => {
                            const newGeneratedCTAs = [...generatedCTAs];
                            newGeneratedCTAs[index] = {
                              enabled: cta.enabled,
                              tag: cta.tag,
                              cta: e.currentTarget.value,
                            };
                            setGeneratedCTAs(newGeneratedCTAs);
                          }}
                          required
                          variant="unstyled"
                          autosize
                        />
                        <Text
                          size="xs"
                          color={cta.cta.length <= 120 ? "grey" : "red"}
                          ta="right"
                        >
                          {cta.cta.length}/{120}
                        </Text>
                      </Flex>
                      <Button
                        disabled={!cta.enabled}
                        mt={10}
                        radius="md"
                        onClick={async () => {
                          if (cta.cta.length > 120) {
                            showNotification({
                              id: "create-cta-error",
                              title: "Error",
                              message: "CTA must be less than 120 characters",
                              color: "red",
                              autoClose: 2000,
                            });
                            return;
                          }

                          // Create the CTA
                          const response = await createCTA(
                            userToken,
                            innerProps.personaId,
                            cta.cta
                          );
                          if (response.status === "success") {
                            // Disable the CTA
                            const newGeneratedCTAs = [...generatedCTAs];
                            newGeneratedCTAs[index] = {
                              enabled: false,
                              tag: cta.tag,
                              cta: cta.cta,
                            };
                            setGeneratedCTAs(newGeneratedCTAs);

                            showNotification({
                              id: "create-cta-success",
                              title: "Success",
                              message: `Added CTA to Persona`,
                              color: "green",
                              autoClose: 5000,
                            });
                          } else {
                            showNotification({
                              id: "create-cta-error",
                              title: "Error",
                              message: "Failed to add CTA to Persona",
                              color: "red",
                              autoClose: false,
                            });
                          }
                        }}
                        variant="light"
                      >
                        Use CTA
                      </Button>
                    </Flex>
                  ))}
                </Stack>
              </ScrollArea>
            </div>
          )}
        </Stack>
      </form>
    </Paper>
  );
}
