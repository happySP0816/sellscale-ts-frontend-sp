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
  Textarea,
  Button,
  Grid,
  Code,
  Tooltip,
} from "@mantine/core";
import { useRecoilValue } from "recoil";
import { useEffect, useState } from "react";
import displayNotification from "@utils/notificationFlow";

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

  const runAccountResearch = async (): Promise<{
    status: string;
    title: string;
    message: string;
    extra?: any;
  }> => {
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
    return res;
  };

  // const fetchAdditionalProspectEmails = async () => {
  //   setFetchButtonDisabled(true);
  //   const res = await fetch(
  //     `${API_URL}/prospect/pull_emails`,
  //     {
  //       method: "POST",
  //       headers: {
  //         Authorization: `Bearer ${userToken}`,
  //       },
  //     }
  //   );

  //   setTimeout(() => {
  //     setFetchButtonDisabled(false);
  //   }, 10000);
  // };

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
                placeholder="ex. The best sugar donuts in the world!"
                label="Tagline"
                defaultValue={accountResearchInputs.company_tagline}
                withAsterisk
                disabled
              />
              <Textarea
                placeholder="ex. They love sugar!"
                label="Why would this persona buy this product?"
                minRows={3}
                maxRows={6}
                onChange={(e) => {
                  setPersonaValueProp(e.currentTarget.value);
                }}
                disabled={buttonsHidden}
                defaultValue={accountResearchInputs.persona_value_prop}
                withAsterisk
              />
              {buttonsHidden && (
                <Card withBorder mt="md">
                  <Grid>
                    <Grid.Col span={10}>
                      <Text size="sm">
                        Account research is in progress ... check back in on the{" "}
                        <Code>All Contacts</Code> tab in ~5 minutes.
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
