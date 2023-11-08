import { currentProjectState } from "@atoms/personaAtoms";
import { userTokenState } from "@atoms/userAtoms";
import { CTA } from "@common/sequence/CTAGenerator";
import LinkedinInitialMessageTemplate from '@common/sequence/LinkedinInitialMessageTemplate';
import {
  Modal,
  Divider,
  Button,
  ActionIcon,
  Text,
  Flex,
  useMantineTheme,
  Card,
  Badge,
  Input,
  Textarea,
  LoadingOverlay,
  TextInput,
  Box,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import { IconCheck, IconEdit, IconPencil, IconX } from "@tabler/icons";
import { useQueryClient } from "@tanstack/react-query";
import createCTA from "@utils/requests/createCTA";
import { generateCTAs } from "@utils/requests/generateCTAs";
import { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";

export const CTAGeneratorSuggestedModal: React.FC<{
  templateMode?: boolean;
  onTemplateSelected?: (template: LinkedinInitialMessageTemplate) => void;
  generatedCTAs: CTA[];
  modalOpened: boolean;
  closeModal: () => void;
  formValue: {
    company: string;
    persona: string;
    proposition: string;
  };
}> = ({ templateMode, generatedCTAs, modalOpened, closeModal, formValue, onTemplateSelected }) => {
  const theme = useMantineTheme();
  const [isLoading, setLoading] = useState(false);
  const [CTAs, setCTAs] = useState<CTA[]>([]);
  const userToken = useRecoilValue(userTokenState);

  const [isShowingCompanyInput, setShowingCompanyInput] = useState(false);
  const [isShowingPersonaInput, setShowingPersonaInput] = useState(false);
  const [
    isShowingValueAddedPropositionInput,
    setShowingValueAddedPropositionInput,
  ] = useState(false);

  useEffect(() => {
    setCTAs(generatedCTAs);
  }, [generatedCTAs]);

  useEffect(() => {
    form.setValues(formValue);
  }, [formValue]);

  const form = useForm({
    initialValues: {
      company: formValue.company,
      persona: formValue.persona,
      proposition: `${formValue.proposition}`,
    },
  });


  const onCloseModal= () => {
    setCTAs([])
    setShowingCompanyInput(false);
    setShowingPersonaInput(false);
    setShowingValueAddedPropositionInput(false);
    form.reset();
    closeModal()
  }

  const handleReGenerateCTA = async (values: typeof form.values) => {
    setLoading(true);
    const result = await generateCTAs(
      userToken,
      values.company,
      values.persona,
      values.proposition
    );
    setLoading(false);
    if (result.status === "success") {
      console.log(result.data);
      setCTAs(result.data.map((cta: any) => {
        var data = { ...cta, enabled: true }
        // if template mode
        if (templateMode) {
          data['cta'] = "Hi [[first name]], [[personalized first line]] " + data['cta']
        }
        return data
      }));
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
    <Modal.Root
      opened={modalOpened}
      onClose={close}
      size={"xl"}
      closeOnClickOutside
    >
      <Modal.Overlay blur={3} color="gray.2" opacity={0.5} />
      <Modal.Content sx={{ borderRadius: "8px" }}>
        <LoadingOverlay visible={isLoading} overlayBlur={2} />

        <Modal.Header
          md-px={"1.5rem"}
          px={"1rem"}
          sx={{
            background: theme.colors.blue[5],
            display: "flex",
          }}
        >
          <Modal.Title
            fz={"1rem"}
            fw={600}
            sx={{
              color: "#FFFFFF",
            }}
          >
            {templateMode ? 'Template' : 'CTA'} Generator
          </Modal.Title>
          <ActionIcon
            variant="outline"
            size={"sm"}
            onClick={onCloseModal}
            sx={{ borderColor: "#E9ECEF", borderRadius: 999 }}
          >
            <IconX color="#FFFFFF" />
          </ActionIcon>
        </Modal.Header>

        <Modal.Body p={"1rem"}>
          <form onSubmit={form.onSubmit(handleReGenerateCTA)}>
            <>
              <Box>
                <Flex
                  wrap={"wrap"}
                  align={"center"}
                  justify={"start"}
                  sx={{
                    border: "1px solid #E9ECEF",
                    borderRadius: "0.5rem",
                  }}
                  p="sm"
                  my={"1rem"}
                  gap={"0.5rem"}
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
                      h={"2.25rem"}
                      rightIcon={<IconPencil size={"1rem"} />}
                      onClick={() => setShowingCompanyInput(true)}
                    >
                      <Text color="black">
                        {form.values.company?.length
                          ? form.values.company
                          : "Company"}
                      </Text>
                    </Button>
                  )}

                  <Flex h={"2.25rem"} align={"center"}>
                    <Text>helps</Text>
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
                      <Text color="black">
                        {form.values.persona?.length
                          ? form.values.persona
                          : "Persona"}
                      </Text>
                    </Button>
                  )}

                  <Flex h={"2.25rem"} align={"center"}>
                    <Text>with</Text>
                  </Flex>

                  {isShowingValueAddedPropositionInput ? (
                    <TextInput
                      withAsterisk
                      placeholder="ex. filling their top of funnel leads."
                      size="xs"
                      radius="xl"
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
                      <Text color="black">
                        {form.values.proposition?.length
                          ? form.values.proposition
                          : "ex. filling their top of funnel leads."}
                      </Text>
                    </Button>
                  )}
                </Flex>
              </Box>

              <Flex justify={"center"} mb={"2rem"}>
                <Button
                  radius={"xl"}
                  variant="filled"
                  color="blue"
                  h={"2.25rem"}
                  type="submit"
                  disabled={
                    !form.values.company.length ||
                    !form.values.persona.length ||
                    !form.values.proposition.length
                  }
                >
                  Re-Generate {templateMode ? 'Template' : 'CTA'}
                </Button>
              </Flex>
            </>
          </form>

          <Divider
            my="xl"
            role="button"
            style={{ cursor: "pointer" }}
            variant="solid"
            labelPosition="center"
            label={
              <Text fw={700} color="gray.5" size={"sm"}>
                Suggested {templateMode ? 'Templates' : 'CTAs'} ({CTAs.length})
              </Text>
            }
          />

          <Flex direction={"column"} gap={"1rem"}>
            {CTAs.map((e, index) => {
              const onUseCTASuccess = () => {
                const newCTAs = [...CTAs];
                newCTAs[index] = {
                  enabled: false,
                  tag: e.tag,
                  cta: e.cta,
                };
                setCTAs(newCTAs);
              };
              return (
                <CTASuggestOption
                  data={e}
                  key={index}
                  onUseCTASuccess={onUseCTASuccess}
                  templateMode={templateMode}
                  onTemplateSelected={onTemplateSelected}
                  closeModal={closeModal}
                />
              );
            })}
          </Flex>
        </Modal.Body>
      </Modal.Content>
    </Modal.Root>
  );
};

const CTASuggestOption: React.FC<{
  data: CTA;
  onUseCTASuccess: () => void;
  templateMode?: boolean;
  onTemplateSelected?: (template: LinkedinInitialMessageTemplate) => void;
  closeModal: () => void;
}> = ({ data, onUseCTASuccess, templateMode, onTemplateSelected, closeModal }) => {
  const userToken = useRecoilValue(userTokenState);
  const queryClient = useQueryClient();
  const [isLoading, setLoading] = useState(false);
  const [isEditing, setEditing] = useState(false);
  const [CTAValue, setCTAValue] = useState("");
  const currentProject = useRecoilValue(currentProjectState);

  useEffect(() => {
    setCTAValue(data.cta);
  }, [data.cta]);

  const handleUseCTA = async () => {
    
    if (templateMode) {
      onTemplateSelected && onTemplateSelected(
        new LinkedinInitialMessageTemplate({
          active: true,
          human_readable_prompt: "Personalized LinkedIn Intro Message",
          name: data.tag?.replaceAll("[", "").replaceAll("]", "") + "-Based",
          raw_prompt: CTAValue,
          tag: data.tag?.replaceAll("[", "").replaceAll("]", "") + "-Based",
          tone: "professional",
          transformer_blocklist: [],
        })
      )
      showNotification({
        id: "create-template-success",
        title: "Success",
        message: `Added Template to Persona`,
        color: "green",
        autoClose: 5000,
      });
      closeModal()
      return
    }

    if (!currentProject) {
      showNotification({
        id: "create-cta-error",
        title: "Error",
        message: "Current project not found",
        color: "red",
        autoClose: 2000,
      });
      return;
    }
    if (CTAValue.length > 120) {
      showNotification({
        id: "create-cta-error",
        title: "Error",
        message: "CTA must be less than 120 characters",
        color: "red",
        autoClose: 2000,
      });
      return;
    }

    setLoading(true);
    setEditing(false);
    // Create the CTA

    const response = await createCTA(
      userToken,
      currentProject.id,
      CTAValue,
      undefined,
      data.tag?.replaceAll("[", "").replaceAll("]", "") + "-Based"
    );
    queryClient.invalidateQueries({
      queryKey: [`query-cta-data-${currentProject.id}`],
    });
    setLoading(false);
    if (response.status === "success") {
      onUseCTASuccess();

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
  };

  return (
    <Card
      radius={"md"}
      py={"1rem"}
      pos={"relative"}
      sx={(theme) => ({
        border: "1px dashed " + theme.colors.gray[2],
        overflow: "unset",
      })}
    >
      <Flex pos={"absolute"} top={-10} gap={"0.5rem"}>
        <Badge fw={700} color={"green"} variant="light" style={{ zIndex: 10 }}>
          {data.tag?.replaceAll("[", "").replaceAll("]", "")}-Based
        </Badge>
      </Flex>

      <Flex direction={"row"} w={"100%"} gap={"0.75rem"}>
        <Flex wrap={"wrap"} gap={"0.5rem"} align={"center"}></Flex>
        <Flex align={"center"} style={{ flex: 1 }}>
          {isEditing ? (
            <Textarea
              placeholder="Clearable input"
              value={CTAValue}
              onChange={(event) => setCTAValue(event.currentTarget.value)}
              style={{
                width: "100%",
              }}
              rightSection={
                <IconCheck
                  cursor={"pointer"}
                  size={"1rem"}
                  onClick={() => setEditing(false)}
                />
              }
            />
          ) : (
            <Text color={"gray.8"} fw={500}>
              {CTAValue}
              <Button
                size="compact-xs"
                variant="light"
                leftIcon={<IconEdit size={14} />}
                fz="xs"
                radius="lg"
                ml={"0.25rem"}
                disabled={!data.enabled}
                onClick={() => setEditing(true)}
              >
                Edit {templateMode ? 'Template' : 'CTA'}
              </Button>
            </Text>
          )}
        </Flex>
        <Flex gap={"0.5rem"} align={"center"} ml={"auto"}>
          <Button
            disabled={!data.enabled}
            loading={isLoading}
            size="sm"
            variant="light"
            fz="sm"
            radius="lg"
            fw={700}
            onClick={handleUseCTA}
          >
            Use {templateMode ? 'Template' : 'CTA'}
          </Button>
        </Flex>
      </Flex>
    </Card>
  );
};
