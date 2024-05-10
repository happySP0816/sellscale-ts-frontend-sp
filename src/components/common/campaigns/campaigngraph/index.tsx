import {
  Box,
  Button,
  Container,
  Flex,
  Grid,
  Group,
  Paper,
  Select,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import CampaignSequenceDAG from "./components/CampaignSequenceDAG";
import React, { useEffect, useState } from "react";
import { IconChevronsRight } from "@tabler/icons-react";
import postTogglePersonaActive from "@utils/requests/postTogglePersonaActive";
import { showNotification } from "@mantine/notifications";
import { useRecoilValue } from "recoil";
import { userTokenState } from "@atoms/userAtoms";
import { API_URL } from "@constants/data";
import { PersonaOverview } from "src";

const Hook: React.FC<{ linkedLeft: boolean; linkedRight: boolean }> = ({
  linkedLeft,
  linkedRight,
}) => {
  return (
    <Flex
      align={"center"}
      justify={"center"}
      h={"100%"}
      sx={{ position: "relative" }}
    >
      <Flex
        align={"center"}
        justify={"center"}
        bg={linkedLeft || linkedRight ? "#228BE6" : "#E9ECEF"}
        w={32}
        h={32}
        sx={{ borderRadius: 999, zIndex: 10 }}
      >
        <IconChevronsRight size={"1.25rem"} color="#FFFFFF" />
      </Flex>
      <Box
        h={"0.125rem"}
        w={"50%"}
        sx={{ position: "absolute", zIndex: 1 }}
        bg={linkedLeft ? "#228BE6" : "#E9ECEF"}
        left={0}
      />

      <Box
        h={"0.125rem"}
        w={"50%"}
        sx={{ position: "absolute" }}
        bg={linkedRight ? "#228BE6" : "#E9ECEF"}
        right={0}
      />
    </Flex>
  );
};

const CampaignGraph = (props: {
  emailToLinkedinConnectionType?: string;
  sections: any;
  personaId: number;
  unusedProspects: string;
  onChannelClick: (sectionType: string) => void;
}) => {
  const userToken = useRecoilValue(userTokenState);
  const linkedinSection = props.sections.filter(
    (x: any) => x.type == "LinkedIn"
  );
  const emailSection = props.sections.filter((x: any) => x.type == "Email");
  const nurtureSection = props.sections.filter((x: any) => x.type == "Nurture");

  const [isEnabledLinkedin, setEnabledLinkedin] = useState(
    linkedinSection[0].active
  );
  const [isActiveLinkedin, setActiveLinkedin] = useState(
    linkedinSection[0].active
  );

  const [isEnabledEmail, setEnabledEmail] = useState(emailSection[0].active);
  const [isActiveEmail, setActiveEmail] = useState(emailSection[0].active);

  const [isEnabledNurture, setEnabledNurture] = useState(
    nurtureSection[0]?.sends > 0
  );
  const [isActiveNurture, setActiveNurture] = useState(
    nurtureSection[0]?.sends > 0
  );
  const [selectedConnectionType, setSelectedConnectionType] = useState(
    props.emailToLinkedinConnectionType
  );

  const updateConnectionType = (newConnectionType: string) => {
    const archetypeId = props.personaId;
    fetch(
      `${API_URL}/client/archetype/${archetypeId}/update_email_to_linkedin_connection`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          email_to_linkedin_connection: newConnectionType,
        }),
      }
    ).then((response) => {
      if (response.ok) {
        console.log("Connection type updated");
      }
      showNotification({
        title: "Connection Type Updated",
        message: "Connection type has been updated.",
      });
    });
  };

  useEffect(() => {
    setActiveEmail(isEnabledLinkedin);
  }, [isEnabledLinkedin]);

  useEffect(() => {
    setActiveNurture(isEnabledEmail && isActiveEmail);
  }, [isEnabledEmail, isActiveEmail]);

  useEffect(() => {
    setSelectedConnectionType(props.emailToLinkedinConnectionType);
  }, [props.emailToLinkedinConnectionType]);

  return (
    <Container size={"xl"} p={"1.5rem"} bg={"white"}>
      <Group align="flex-start" noWrap>
        {/* <Paper p="md" h="100%" withBorder>
          <Title order={4}>Source</Title>
          <Stack>
            <Button
              variant="outline"
              onClick={() => {
                window.location.href = `/contacts?campaign_id=${props.personaId}`;
              }}
            >
              {props.unusedProspects} contacts left
            </Button>
            <Button
              variant="subtle"
              size="sm"
              onClick={() => {
                window.location.href = `/contacts/find?campaign_id=${props.personaId}`;
              }}
              compact
            >
              Add contacts
            </Button>
          </Stack>
          
        </Paper> */}
        <Paper
          p="md"
          sx={{
            flex: 1,
            justifyContent: "space-between",
            textAlign: "center",
            // make background a grid of dots
            backgroundImage:
              "radial-gradient(#00000022 .05em, transparent .05em)",
            backgroundSize: "20px 20px",
          }}
          withBorder
        >
          <Group noWrap sx={{ flex: 1, justifyContent: "center" }}>
            <CampaignSequenceDAG
              type="email"
              active={isEnabledEmail}
              enabled={isEnabledEmail}
              onToggle={async () => {
                const result = await postTogglePersonaActive(
                  userToken,
                  props.personaId,
                  "email",
                  !isEnabledEmail
                );

                if (result.status == "success") {
                  setEnabledEmail(!isEnabledEmail);
                  if (!isEnabledEmail) {
                    showNotification({
                      title: "✅ Enabled",
                      message:
                        "Email outbound has been toggled on, new messages will be sent.",
                    });
                    showNotification({
                      title: "📧 Fetching emails...",
                      message:
                        "We are fetching emails for your contacts. This may take a few minutes.",
                      color: "blue",
                      autoClose: 15000,
                    });
                  } else {
                    showNotification({
                      title: "🔴 Disabled",
                      message:
                        "Email outbound has been toggled, no new messages will be sent.",
                    });
                  }
                }
              }}
              onChannelClick={() => props.onChannelClick("email")}
              numbers={[
                emailSection[0]?.sends,
                emailSection[0]?.opens,
                emailSection[0]?.replies,
              ]}
            />
            <Hook
              linkedLeft={isEnabledEmail}
              linkedRight={isActiveEmail && isEnabledEmail}
            />
            {/* </Box> */}
            <Select
              label="Connect Sequences"
              size="xs"
              value={selectedConnectionType}
              w="250px"
              onChange={(value) => {
                console.log(value);
                setSelectedConnectionType(value || "");
                updateConnectionType(value || "");
              }}
              data={[
                {
                  label: "[❌] No Connection",
                  value: "RANDOM",
                },
                {
                  label: "[📧 → 🤝] Contact After Email Sent",
                  value: "ALL_PROSPECTS",
                },
                {
                  label: "[👀 → 🤝] Send to Opened Only",
                  value: "OPENED_EMAIL_PROSPECTS_ONLY",
                },
                {
                  label: "[⚡️ → 🤝] Send to Clicked Only",
                  value: "CLICKED_LINK_PROSPECTS_ONLY",
                },
              ]}
              placeholder="Select an event"
            />
            <Hook
              linkedLeft={isEnabledLinkedin}
              linkedRight={isActiveEmail && isEnabledEmail}
            />
            <CampaignSequenceDAG
              type="linkedin"
              active={isEnabledLinkedin}
              enabled={isEnabledLinkedin}
              onToggle={async () => {
                const result = await postTogglePersonaActive(
                  userToken,
                  props.personaId,
                  "linkedin",
                  !isEnabledLinkedin
                );

                if (result.status == "success") {
                  setEnabledLinkedin(!isEnabledLinkedin);
                  if (!isEnabledLinkedin) {
                    showNotification({
                      title: "Success",
                      message:
                        "LinkedIn outbound has been toggled on, new messages will be sent.",
                    });
                  } else {
                    showNotification({
                      title: "Success",
                      message:
                        "LinkedIn outbound has been toggled, no new messages will be sent.",
                    });
                  }
                }
              }}
              onChannelClick={() => props.onChannelClick("linkedin")}
              numbers={[
                linkedinSection[0]?.sends,
                linkedinSection[0]?.opens,
                linkedinSection[0]?.replies,
              ]}
            />
          </Group>
        </Paper>
        {/* 
        <Grid.Col>
          <Grid.Col xs={12} md={3} onClick={() => props.onChannelClick('linkedin')} sx={{ cursor: 'pointer' }}>
            <CampaignSequenceDAG
              type='linkedin'
              active={isEnabledLinkedin || true} // TODO: Remove || true if we want to disable the LinkedIn section
              enabled={isEnabledLinkedin || true} // TODO: Remove || true if we want to disable the LinkedIn section
              // onToggle={setEnabledLinkedin}
              numbers={[linkedinSection[0]?.sends, linkedinSection[0]?.opens, linkedinSection[0]?.replies]}
            />
          </Grid.Col>
          <Grid.Col
            xs={12}
            md={1.5}
            sx={{
              transform: isEnabledLinkedin ? '' : 'scale(0.7)',
              opacity: isEnabledEmail ? 1 : 0,
            }}
          >
            <Hook linkedLeft={isEnabledLinkedin} linkedRight={isActiveEmail && isEnabledEmail} />
          </Grid.Col>
          <Grid.Col
            xs={12}
            md={3}
            onClick={() => props.onChannelClick('email')}
            sx={{ cursor: 'pointer', transform: isEnabledEmail ? '' : 'scale(0.7)' }}
          >
            <CampaignSequenceDAG
              type='email'
              active={isEnabledEmail}
              enabled={isEnabledEmail}
              // onToggle={setEnabledEmail}
              numbers={[emailSection[0]?.sends, emailSection[0]?.opens, emailSection[0]?.replies]}
            />
          </Grid.Col>
          <Grid.Col
            xs={12}
            md={1.5}
            sx={{
              transform: isEnabledEmail ? '' : 'scale(0.7)',
              opacity: isEnabledNurture ? 1 : 0,
            }}
          >
            <Hook linkedLeft={isActiveEmail && isEnabledEmail} linkedRight={isActiveNurture && isEnabledNurture} />
          </Grid.Col>
        </Grid.Col> */}

        {/* <Grid.Col
          xs={12}
          md={3}
          onClick={() => {}}
          sx={{ cursor: 'not-allowed', transform: isEnabledNurture ? '' : 'scale(0.7)' }}
        >
          <CampaignSequenceDAG
            type='nurture'
            active={isEnabledNurture}
            enabled={isEnabledNurture}
            // onToggle={setEnabledNurture}
            numbers={[nurtureSection[0]?.sends, nurtureSection[0]?.opens, nurtureSection[0]?.replies]}
          />
        </Grid.Col> */}
      </Group>
    </Container>
  );
};

export default CampaignGraph;
