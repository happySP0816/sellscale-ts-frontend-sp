import { userTokenState } from "@atoms/userAtoms";
import { API_URL } from "@constants/data";
import {
  Title,
  Text,
  Card,
  Flex,
  Container,
  Loader,
  TextInput,
  Divider,
  Box,
  Textarea,
  Button,
  Grid,
  Code,
  Tooltip,
  LoadingOverlay,
} from "@mantine/core";
import { useRecoilValue } from "recoil";
import { useEffect, useState } from "react";
import displayNotification from "@utils/notificationFlow";
import { IconRobot } from "@tabler/icons";
import TextAreaWithAI from "@common/library/TextAreaWithAI";
import { MsgResponse } from "src";

type PropsType = {
  archetype_id: number;
};

export default function RunAccountResearchCard(props: PropsType) {
  const userToken = useRecoilValue(userTokenState);
  const [fetchedData, setFetchedData] = useState(false);
  const [personaValueProp, setPersonaValueProp] = useState("");
  const [showAccountResearchLoader, setShowAccountResearchLoader] = useState(
    false
  );
  const [buttonsHidden, setButtonsHidden] = useState(false);

  const [
    loadingAccountResearchInputs,
    setLoadingAccountResearchInputs,
  ] = useState(false);
  const [accountResearchInputs, setAccountResearchInputs]: any = useState({});

  const fetch_account_research_inputs = async () => {
    setLoadingAccountResearchInputs(true);
    const res = await fetch(
      `${API_URL}/research/account_research_points/inputs?archetype_id=${props.archetype_id}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      }
    );
    const data = await res.json();
    setAccountResearchInputs(data);
    setLoadingAccountResearchInputs(false);
    setPersonaValueProp(data.persona_value_prop);
  };

  useEffect(() => {
    if (!fetchedData) {
      setFetchedData(true);
      fetch_account_research_inputs();
    }
  }, [fetchedData]);

  const savePersonaValueProp = async () => {
    await fetch(
      `${API_URL}/client/archetype/${props.archetype_id}/update_description_and_fit`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          updated_persona_fit_reason: personaValueProp,
        }),
      }
    );

    fetch_account_research_inputs();
  };

  const runAccountResearch = async (): Promise<MsgResponse> => {
    setShowAccountResearchLoader(true);
    setButtonsHidden(true);
    const res = await fetch(
      `${API_URL}/research/account_research_points/generate`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          archetype_id: props.archetype_id,
          hard_refresh: true, // todo(Aakash) make this depend on a toggle
        }),
      }
    )
      .then(async (r) => {
        if (r.status === 200) {
          return {
            status: "success",
            title: `Success`,
            message: `Running account research. Will take some time.`,
          };
        } else {
          return {
            status: "error",
            title: `Error (${r.status})`,
            message: "Error while running account research. Contact engineer.",
          };
        }
      })
      .catch((e) => {
        console.error(e);
        return {
          status: "error",
          title: `Error while running account research. Contact engineer.`,
          message: e.message,
        };
      });
    return res as MsgResponse;
  };

  const [loadingPersonaFitReason, setLoadingPersonaFitReason] = useState(false);

  const fetchPersonaFitReason = async (): Promise<MsgResponse> => {
    setLoadingPersonaFitReason(true);
    const res = await fetch(
      `${API_URL}/client/archetype/${props.archetype_id}/predict_persona_fit_reason`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
      }
    )
      .then(async (r) => {
        if (r.status === 200) {
          return {
            status: "success",
            title: `Success`,
            message: `Generated persona fit reason.`,
            data: await r.json(),
          };
        } else {
          return {
            status: "error",
            title: `Error (${r.status})`,
            message: "Error while running fit generation. Contact engineer.",
            data: {},
          };
        }
      })
      .catch((e) => {
        console.error(e);
        return {
          status: "error",
          title: `Error while running fit generation. Contact engineer.`,
          message: e.message,
          data: {},
        };
      });
    setLoadingPersonaFitReason(false);
    setPersonaValueProp(res.data.reason);
    return res as MsgResponse;
  };

  return (
    <Card pl="sm" pr="sm" mt="md">
      <Flex>
        <Container>
          <Title order={3}>Run Account Research</Title>
          <Text size="sm">
            Use this feature to run account research on your prospects. Account
            Research will use your company's context and combine it with
            relevant details from your prospects' to generate data points that
            can be used for sales development.
          </Text>
          <Divider mt="md" mb="md" />

          {loadingAccountResearchInputs ? (
            <Loader />
          ) : (
            <>
              <TextInput
                placeholder="ex. Donut Co."
                label="Company"
                defaultValue={accountResearchInputs.company}
                withAsterisk
                disabled
              />
              <Textarea
                mt="sm"
                placeholder="ex. The best sugar donuts in the world!"
                label="Tagline"
                defaultValue={accountResearchInputs.company_tagline}
                withAsterisk
                disabled
              />
              <Box maw={400} pos="relative" mt="sm">
                <LoadingOverlay
                  visible={loadingPersonaFitReason}
                  overlayBlur={2}
                />
                <TextAreaWithAI
                  placeholder="ex. They love sugar!"
                  label="Why would this persona buy this product?"
                  description="Describe why this persona would buy this product."
                  minRows={3}
                  maxRows={6}
                  onChange={(e) => {
                    setPersonaValueProp(e.currentTarget.value);
                  }}
                  disabled={buttonsHidden}
                  value={personaValueProp}
                  withAsterisk
                  loadingAIGenerate={loadingPersonaFitReason}
                  onAIGenerateClicked={async () => {
                    await displayNotification(
                      "fetch-persona-fit-reason",
                      fetchPersonaFitReason,
                      {
                        title: `Running persona fit reason generation...`,
                        message: `Working with servers...`,
                        color: "teal",
                      },
                      {
                        title: `Persona fit generated!`,
                        message: `SellScale AI predicted why this persona would buy this product.`,
                        color: "teal",
                      },
                      {
                        title: `Error while running persona fit reason generation`,
                        message: `Please try again later.`,
                        color: "red",
                      }
                    );
                  }}
                />
              </Box>

              {buttonsHidden && (
                <Card withBorder mt="md">
                  <Grid>
                    <Grid.Col span={10}>
                      <Text size="sm">
                        Account research is in progress ... check back in on the{" "}
                        <Code>All Contacts</Code> tab in 30-50 minutes.
                      </Text>
                    </Grid.Col>
                    <Grid.Col span={2}>
                      <Loader mt="sm" />
                    </Grid.Col>
                  </Grid>
                </Card>
              )}
              <Grid hidden={buttonsHidden}>
                <Grid.Col span={3}>
                  <Button
                    mt="md"
                    color="green"
                    onClick={savePersonaValueProp}
                    disabled={
                      personaValueProp ==
                      accountResearchInputs.persona_value_prop
                    }
                  >
                    Save
                  </Button>
                </Grid.Col>
                <Grid.Col span={3} offset={3}>
                  <Tooltip
                    label="This will use account research credits!"
                    position="top"
                  >
                    <Button
                      mt="md"
                      onClick={async () => {
                        await displayNotification(
                          "run-account-research",
                          runAccountResearch,
                          {
                            title: `Running account research...`,
                            message: `Working with servers...`,
                            color: "teal",
                          },
                          {
                            title: `Research is undergoing!`,
                            message: `Your research will be ready in a few minutes.`,
                            color: "teal",
                          },
                          {
                            title: `Error while running account research.`,
                            message: `Please try again later.`,
                            color: "red",
                          }
                        );
                      }}
                      disabled={
                        personaValueProp !==
                        accountResearchInputs.persona_value_prop
                      }
                    >
                      Run Account Research
                    </Button>
                  </Tooltip>
                </Grid.Col>
              </Grid>
            </>
          )}
        </Container>
      </Flex>
    </Card>
  );
}
