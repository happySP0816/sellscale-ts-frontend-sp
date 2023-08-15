import { userTokenState } from "@atoms/userAtoms";
import {
  Button,
  Flex,
  Group,
  LoadingOverlay,
  Paper,
  Textarea,
  TextInput,
  useMantineTheme,
  Text,
  Box,
  Checkbox,
  Collapse,
  List
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { ContextModalProps, openConfirmModal } from "@mantine/modals";
import { showNotification } from "@mantine/notifications";
import { IconPencil } from "@tabler/icons";
import postICPClassificationPromptChange from "@utils/requests/postICPClassificationPromptChange";
import postRunICPClassification from "@utils/requests/postRunICPClassification";
import { useEffect, useRef, useState } from "react";
import { useRecoilValue } from "recoil";
import { Archetype, PersonaOverview } from "src";

const defaultHeader =
  "I am a sales researcher. This is the Ideal Customer Profile for my target customer:\n\n";

export default function ManagePulsePrompt({
  context,
  id,
  innerProps,
}: ContextModalProps<{
  mode: "EDIT" | "CREATE";
  personaOverview: PersonaOverview;
  backfillICPPrompt: Function;
  icpPrompt: string;
  icpFilters: any;
}>) {

  console.log(innerProps.icpFilters);

  const theme = useMantineTheme();
  const [currentICPPrompt, setCurrentICPPrompt] = useState(
    innerProps.icpPrompt
  );
  const [loading, setLoading] = useState(false);
  const userToken = useRecoilValue(userTokenState);

  const [detailsOpened, setDetailsOpened] = useState(false);

  const [optionFilters, setOptionFilters] = useState<{
    prospect_name: boolean;
    prospect_title: boolean;
    prospect_linkedin_bio: boolean;
    prospect_location: boolean;
    prospect_education: boolean;
    company_name: boolean;
    company_size: boolean;
    company_industry: boolean;
    company_location: boolean;
    company_tagline: boolean;
    company_description: boolean;
  }>(// @ts-ignore
    innerProps.icpFilters || {
      prospect_name: false,
      prospect_title: false,
      prospect_linkedin_bio: false,
      prospect_location: false,
      prospect_education: false,
      company_name: false,
      company_size: false,
      company_industry: false,
      company_location: false,
      company_tagline: false,
      company_description: false,
    }
  );

  const form = useForm({
    initialValues: {
      seniority: "",
      relevantWork: "",
      tiers: "",
      others: "",
    },
  });

  async function handleFormSubmit(values: typeof form.values) {
    let prompt = defaultHeader;
    prompt += `Seniority: ${values.seniority}\n\n`;
    prompt += `Relevant Work: ${values.relevantWork}\n\n`;
    prompt += `Tiers:\n${values.tiers}\n\n`;
    prompt += `${values.others}`;

    handleSaveChanges(prompt);
  }

  async function handleSaveChanges(prompt: string, runPrompt = false) {
    setLoading(true);

    // if (
    //   innerProps.mode === "EDIT" &&
    //   currentICPPrompt === innerProps.personaOverview.icp_matching_prompt
    // ) {
    //   showNotification({
    //     id: "edit-pulse-prompt-fail-no-changes",
    //     title: "No Changes Detected",
    //     message:
    //       "You have not made any changes to your AI Filter. Please make changes to your AI Filter before requesting to save changes.",
    //     color: "red",
    //     autoClose: 5000,
    //   });

    //   setLoading(false);
    //   return;
    // } else if (currentICPPrompt === "") {
    //   showNotification({
    //     id: "pulse-prompt-request-no-prompt",
    //     title: "No Prompt Detected",
    //     message:
    //       "You have not entered a AI Filter. Please enter a AI Filter before requesting to save changes.",
    //     color: "red",
    //     autoClose: 5000,
    //   });
    // }

    const result = await postICPClassificationPromptChange(
      userToken,
      innerProps.personaOverview.id,
      prompt,
      optionFilters
    );

    setLoading(false);

    if (result.status === "success") {
      if (innerProps.mode === "EDIT") {
        showNotification({
          id: "edit-pulse-prompt",
          title: "AI Filter Edited",
          message: "AI Filter has been edited successfully.",
          color: "teal",
          autoClose: 3000,
        });
        if (runPrompt) {
          const result = await postRunICPClassification(userToken, innerProps.personaOverview.id)
          if (result.status === 'success') {
            showNotification({
              id: "run-pulse-prompt",
              title: "AI Filter Running",
              message: "AI Filter is running on all prospects. This may take a while.",
              color: "teal",
              autoClose: 3000,
            })
          } else {
            showNotification({
              id: "run-pulse-prompt-fail",
              title: "AI Filter Not Ran",
              message: "AI Filter could not be ran. Please contact support, or run manually from the Classify tab.",
              color: "red",
            })
          }
        }
      } else if (innerProps.mode === "CREATE") {
        showNotification({
          id: "create-pulse-prompt",
          title: "AI Filter Created",
          message: "AI Filter has been created successfully.",
          color: "teal",
          autoClose: 3000,
        });
      }
    } else {
      showNotification({
        id: "pulse-prompt-request-fail",
        title: "AI Filter Request Failed",
        message:
          "AI Filter could not be modified. Please try again or contact support.",
      });
    }

    innerProps.backfillICPPrompt();
    setCurrentICPPrompt(prompt);

    context.closeModal(id);
  }

  return (
    <>
      <LoadingOverlay visible={loading} color={theme.colors.blue[5]} />
      <Paper
        p={0}
        style={{
          position: "relative",
          backgroundColor:
            theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.white,
        }}
      >
        {innerProps.mode === "EDIT" ? (
          <>
            <Textarea
              defaultValue={currentICPPrompt}
              label="Your current AI Filter"
              description="Make as many changes as you would like."
              onChange={(e) => setCurrentICPPrompt(e.currentTarget.value)}
              withAsterisk
              autosize
            />

              <Box>
                <Text>
                  Filters our AI searches for:
                  <Text
                    pl="xs"
                    c="blue.4"
                    fw="bold"
                    sx={{ cursor: "pointer" }}
                    onClick={() => setDetailsOpened((prev) => !prev)}
                    span
                  >
                    {detailsOpened ? "Hide" : "Show"}
                  </Text>
                </Text>

                <Collapse in={detailsOpened}>
                  <List size="xs">
                    <List.Item>
                      <Checkbox
                        checked={optionFilters.prospect_name}
                        onChange={(event) => {
                          const state = !!(event?.currentTarget?.checked);
                          setOptionFilters((prev) => ({
                            ...prev,
                            prospect_name: state,
                          }));
                        }}
                        label="Prospect Name"
                      />
                    </List.Item>
                    <List.Item>
                      <Checkbox
                        checked={optionFilters.prospect_title}
                        onChange={(event) => {
                          const state = !!(event?.currentTarget?.checked);
                          setOptionFilters((prev) => ({
                            ...prev,
                            prospect_title: state,
                          }));
                        }}
                        label="Prospect Title"
                      />
                    </List.Item>
                    <List.Item>
                      <Checkbox
                        checked={optionFilters.prospect_linkedin_bio}
                        onChange={(event) => {
                          const state = !!(event?.currentTarget?.checked);
                          setOptionFilters((prev) => ({
                            ...prev,
                            prospect_linkedin_bio: state,
                          }));
                        }}
                        label="Prospect LinkedIn Bio"
                      />
                    </List.Item>
                    <List.Item>
                      <Checkbox
                        checked={optionFilters.prospect_location}
                        onChange={(event) => {
                          const state = !!(event?.currentTarget?.checked);
                          setOptionFilters((prev) => ({
                            ...prev,
                            prospect_location: state,
                          }));
                        }}
                        label="Prospect Location"
                      />
                    </List.Item>
                    <List.Item>
                      <Checkbox
                        checked={optionFilters.prospect_education}
                        onChange={(event) => {
                          const state = !!(event?.currentTarget?.checked);
                          setOptionFilters((prev) => ({
                            ...prev,
                            prospect_education: state,
                          }));
                        }}
                        label="Prospect Education"
                      />
                    </List.Item>
                    <List.Item>
                      <Checkbox
                        checked={optionFilters.company_name}
                        onChange={(event) => {
                          const state = !!(event?.currentTarget?.checked);
                          setOptionFilters((prev) => ({
                            ...prev,
                            company_name: state,
                          }));
                        }}
                        label="Company Name"
                      />
                    </List.Item>
                    <List.Item>
                      <Checkbox
                        checked={optionFilters.company_size}
                        onChange={(event) => {
                          const state = !!(event?.currentTarget?.checked);
                          setOptionFilters((prev) => ({
                            ...prev,
                            company_size: state,
                          }));
                        }}
                        label="Company Size"
                      />
                    </List.Item>
                    <List.Item>
                      <Checkbox
                        checked={optionFilters.company_industry}
                        onChange={(event) => {
                          const state = !!(event?.currentTarget?.checked);
                          setOptionFilters((prev) => ({
                            ...prev,
                            company_industry: state,
                          }));
                        }}
                        label="Company Industry"
                      />
                    </List.Item>
                    <List.Item>
                      <Checkbox
                        checked={optionFilters.company_location}
                        onChange={(event) => {
                          const state = !!(event?.currentTarget?.checked);
                          setOptionFilters((prev) => ({
                            ...prev,
                            company_location: state,
                          }));
                        }}
                        label="Company Location"
                      />
                    </List.Item>
                    <List.Item>
                      <Checkbox
                        checked={optionFilters.company_tagline}
                        onChange={(event) => {
                          const state = !!(event?.currentTarget?.checked);
                          setOptionFilters((prev) => ({
                            ...prev,
                            company_tagline: state,
                          }));
                        }}
                        label="Company Tagline"
                      />
                    </List.Item>
                    <List.Item>
                      <Checkbox
                        checked={optionFilters.company_description}
                        onChange={(event) => {
                          const state = !!(event?.currentTarget?.checked);
                          setOptionFilters((prev) => ({
                            ...prev,
                            company_description: state,
                          }));
                        }}
                        label="Company Description"
                      />
                    </List.Item>
                  </List>
                </Collapse>
              </Box>

            <Button
              mt="xs"
              rightIcon={<IconPencil size="1rem" />}
              variant="outline"
              radius="lg"
              color="teal"
              onClick={() => {
                openConfirmModal({
                  title: 'Run AI Filter on All Prospects',
                  children: (
                    <Text size='sm'>
                      Now that you've edited your AI Filter, would you like to run your prompt on all prospects? This will use credits.
                    </Text>
                  ),
                  labels: { confirm: 'Save & Run', cancel: 'Save' },
                  onCancel: () => handleSaveChanges(currentICPPrompt),
                  onConfirm: () => handleSaveChanges(currentICPPrompt, true),
                });
              }}
            >
              Save Changes
            </Button>
          </>
        ) : (
          <>
            <form onSubmit={form.onSubmit(handleFormSubmit)}>
              <Flex direction="column">
                <TextInput
                  mb="xs"
                  placeholder="Senior Level, Junior Level, etc."
                  label="ICP Seniority"
                  description="Please write the qualitative seniority level of your prospect."
                  withAsterisk
                  required
                  {...form.getInputProps("seniority")}
                />
                <TextInput
                  mb="xs"
                  placeholder="Software Engineering, Fullstack, etc."
                  label="Relevant Work"
                  description="Please rank what type of work or roles your ICP has done."
                  withAsterisk
                  required
                  {...form.getInputProps("relevantWork")}
                />
                <Textarea
                  mb="xs"
                  placeholder="Tier 1: Senior level SWE&#13;&#10;Tier2: Junior level SWE"
                  label="Tiers"
                  description="Please rank the preference of your ICP based on their descriptions."
                  minRows={2}
                  withAsterisk
                  autosize
                  required
                  {...form.getInputProps("tiers")}
                />
                <Textarea
                  mb="xs"
                  placeholder="If the biography mentions Python, this is a positive ideal candidate&#13;&#10;&#13;&#10;Interested in startups"
                  description="Please mention any other notes that may be useful to grab from a LinkedIn Bio."
                  label="Other"
                  minRows={4}
                  withAsterisk
                  autosize
                  required
                  {...form.getInputProps("others")}
                />
              </Flex>
              <Button
                type="submit"
                mt="xs"
                rightIcon={<IconPencil size="1rem" />}
                variant="outline"
                radius="lg"
                color="teal"
              >
                Create New AI Filter
              </Button>
            </form>
          </>
        )}
      </Paper>
    </>
  );
}
