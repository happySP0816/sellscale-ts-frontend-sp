import {
  Button,
  Text,
  Flex,
  Group,
  Title,
  Card,
  Box,
  TextInput,
  LoadingOverlay,
  Paper,
} from "@mantine/core";
import { CTAGeneratorSuggestedModal } from "@modals/CTAGeneratorSuggestedModal";
import { IconCheck, IconPencil, IconPlus } from "@tabler/icons";
import { useMemo, useState } from "react";
import { useForm } from "@mantine/form";
import { generateCTAs } from "@utils/requests/generateCTAs";
import { showNotification } from "@mantine/notifications";
import { userDataState, userTokenState } from "@atoms/userAtoms";
import { useRecoilValue } from "recoil";
import { currentProjectState } from "@atoms/personaAtoms";

export interface CTA {
  cta: string;
  tag: string;
  enabled: boolean;
}

const CTAGenerator = () => {
  const [isLoading, setLoading] = useState(false);

  const [isOpenCTAGeneratorModal, setOpenCTAGeneratorModal] = useState(false);
  const [isShowingCompanyInput, setShowingCompanyInput] = useState(false);
  const [isShowingPersonaInput, setShowingPersonaInput] = useState(false);
  const [
    isShowingValueAddedPropositionInput,
    setShowingValueAddedPropositionInput,
  ] = useState(false);

  const [generatedCTAs, setGeneratedCTAs] = useState<CTA[]>([]);

  const userData = useRecoilValue(userDataState);
  const currentProject = useRecoilValue(currentProjectState);
  const userToken = useRecoilValue(userTokenState);

  const form = useForm({
    initialValues: {
      company: userData?.client?.company ?? "",
      persona: currentProject?.name ?? "",
      proposition: "",
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
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
      setOpenCTAGeneratorModal(true)
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
    <Card withBorder mb="xs">
      <Flex direction={"column"}>
        <Group mb="xs">
          <Title color="blue.5" order={6} fw="700">
            CTA Generator
          </Title>
        </Group>
        <Paper
          p={0}
          style={{
            position: "relative",
          }}
        >
          <LoadingOverlay visible={isLoading} overlayBlur={2} />
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Box>
              <Flex
                align={"center"}
                justify={"start"}
                sx={{
                  border: "1px solid #E9ECEF",
                  borderRadius: "0.5rem",
                }}
                p="sm"
                gap={"0.5rem"}
                wrap={"wrap"}
              >
                {isShowingCompanyInput ? (
                  <TextInput
                    withAsterisk
                    placeholder="Company"
                    size="xs"
                    radius="xl"
                    required
                    {...form.getInputProps("company")}
                    rightSection={
                      <IconCheck
                        cursor={"pointer"}
                        size={"1rem"}
                        onClick={() => setShowingCompanyInput(false)}
                      />
                    }
                  />
                ) : (
                  <Button
                    radius={"xl"}
                    variant="light"
                    color="blue"
                    h={"1.5rem"}
                    rightIcon={<IconPencil size={"1rem"} />}
                    onClick={() => setShowingCompanyInput(true)}
                  >
                    {form.values.company?.length
                      ? form.values.company
                      : "Company"}
                  </Button>
                )}

                <Flex h={"1.5rem"} align={"center"}>
                  <Text>help</Text>
                </Flex>

                {isShowingPersonaInput ? (
                  <TextInput
                    withAsterisk
                    placeholder="Persona"
                    size="xs"
                    radius="xl"
                    required
                    {...form.getInputProps("persona")}
                    rightSection={
                      <IconCheck
                        cursor={"pointer"}
                        size={"1rem"}
                        onClick={() => setShowingPersonaInput(false)}
                      />
                    }
                  />
                ) : (
                  <Button
                    radius={"xl"}
                    variant="light"
                    color="blue"
                    h={"1.5rem"}
                    rightIcon={<IconPencil size={"1rem"} />}
                    onClick={() => setShowingPersonaInput(true)}
                  >
                    {form.values.persona?.length
                      ? form.values.persona
                      : "Persona"}
                  </Button>
                )}

                <Flex h={"1.5rem"} align={"center"}>
                  <Text>with</Text>
                </Flex>

                {isShowingValueAddedPropositionInput ? (
                  <TextInput
                    withAsterisk
                    placeholder="ex. filling their top of funnel leads."
                    size="xs"
                    radius="xl"
                    w={350}
                    required
                    {...form.getInputProps("proposition")}
                    rightSection={
                      <IconCheck
                        cursor={"pointer"}
                        size={"1rem"}
                        onClick={() =>
                          setShowingValueAddedPropositionInput(false)
                        }
                      />
                    }
                  />
                ) : (
                  <Button
                    radius={"xl"}
                    variant="light"
                    color="blue"
                    h={"1.5rem"}
                    rightIcon={<IconPencil size={"1rem"} />}
                    onClick={() => setShowingValueAddedPropositionInput(true)}
                  >
                    {form.values.proposition?.length
                      ? form.values.proposition
                      : "filling their top of funnel leads."}
                  </Button>
                )}

                <Button
                  radius={"xl"}
                  variant="filled"
                  color="blue"
                  type="submit"
                  h={"1.5rem"}
                  disabled={
                    !form.values.company.length ||
                    !form.values.persona.length ||
                    !form.values.proposition.length
                  }
                  leftIcon={<IconPlus size={"1rem"} />}
                >
                  Generate CTA
                </Button>
              </Flex>
            </Box>
          </form>
        </Paper>
      </Flex>

      <CTAGeneratorSuggestedModal
        generatedCTAs={generatedCTAs}
        modalOpened={isOpenCTAGeneratorModal}
        closeModal={() => setOpenCTAGeneratorModal(false)}
        formValue={{
          company: form.values.company,
          persona: form.values.persona,
          proposition: form.values.proposition,
        }}
      />
    </Card>
  );
};

export default CTAGenerator;
