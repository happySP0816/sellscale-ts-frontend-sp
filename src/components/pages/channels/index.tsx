import {
  ActionIcon,
  Box,
  Button,
  Card,
  Container,
  Divider,
  Flex,
  Grid,
  Tooltip,
  Text,
  Title,
  Badge,
  Loader,
  Group,
  Stack,
  Anchor,
} from "@mantine/core";
import {
  IconArrowLeft,
  IconBrain,
  IconBrandGmail,
  IconBrandLinkedin,
  IconFilter,
  IconMail,
  IconPencil,
  IconPlant,
  IconPlus,
  IconSparkles,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import Hook from "./components/Hook";
import ChannelTab from "./components/ChannelTab";
import { useRecoilValue } from "recoil";
import { userDataState } from "@atoms/userAtoms";
import { ProjectSelect } from "@common/library/ProjectSelect";
import { useNavigate } from "react-router-dom";
import { navigateToPage } from "@utils/documentChange";
import { PersonaOverview } from "src";

const ChannelsSetupSelector = (props: {
  selectedChannel: string;
  setSelectedChannel: (channel: string) => void;
  hideChannels: boolean;
  campaign?: PersonaOverview;
  setSetupMode: (mode: boolean) => void;
  setupMode: boolean;
  setupWizardFeatureEnabled: boolean;
}) => {
  const [selectedChildChannel, setSelectedChildChannel] = useState(
    props.selectedChannel
  );
  const [isEnabledLinkedin, setEnabledLinkedin] = useState(true);

  const navigate = useNavigate();

  const [isEnabledEmail, setEnabledEmail] = useState(false);
  const [isActiveEmail, setActiveEmail] = useState(false);

  const [isEnabledNurture, setEnabledNurture] = useState(false);
  const [isActiveNurture, setActiveNurture] = useState(false);

  const userData = useRecoilValue(userDataState);

  useEffect(() => {
    setActiveEmail(isEnabledLinkedin);
  }, [isEnabledLinkedin]);

  useEffect(() => {
    setActiveNurture(isEnabledEmail && isActiveEmail);
  }, [isEnabledEmail, isActiveEmail]);

  const brainFilled =
    props.campaign?.name &&
    props.campaign?.persona_contact_objective &&
    props.campaign?.persona_fit_reason &&
    props.campaign?.contract_size &&
    props.campaign?.cta_framework_company &&
    props.campaign?.cta_framework_persona &&
    props.campaign?.cta_framework_action &&
    props.campaign?.use_cases &&
    props.campaign?.filters &&
    props.campaign?.lookalike_profile_1 &&
    props.campaign?.lookalike_profile_2 &&
    props.campaign?.lookalike_profile_3 &&
    props.campaign?.lookalike_profile_4 &&
    props.campaign?.lookalike_profile_5;
  let brainPercentFilled = 0;
  let brainAttributes = [
    props.campaign?.name,
    props.campaign?.persona_contact_objective,
    props.campaign?.persona_fit_reason,
    props.campaign?.contract_size,
    props.campaign?.cta_framework_company,
    props.campaign?.cta_framework_persona,
    props.campaign?.cta_framework_action,
    props.campaign?.use_cases,
    props.campaign?.filters,
    props.campaign?.lookalike_profile_1,
    props.campaign?.lookalike_profile_2,
    props.campaign?.lookalike_profile_3,
    props.campaign?.lookalike_profile_4,
  ];
  brainAttributes.forEach((attribute) => {
    if (attribute) {
      brainPercentFilled += 1;
    }
  });
  brainPercentFilled = Math.round((brainPercentFilled / 13) * 100);

  const needMoreProspects =
    props.campaign?.num_unused_li_prospects &&
    props.campaign?.num_unused_li_prospects < 200;

  let avgIcpScoreLabel = "";
  if (props.campaign?.avg_icp_fit_score) {
    if (props.campaign?.avg_icp_fit_score < 1) {
      avgIcpScoreLabel = "Very Low";
    } else if (props.campaign?.avg_icp_fit_score < 2) {
      avgIcpScoreLabel = "Low";
    } else if (props.campaign?.avg_icp_fit_score < 3) {
      avgIcpScoreLabel = "Medium";
    } else if (props.campaign?.avg_icp_fit_score < 4) {
      avgIcpScoreLabel = "High";
    } else if (props.campaign?.avg_icp_fit_score < 5) {
      avgIcpScoreLabel = "Very High";
    }
  }
  const avgIcpScoreIsBad =
    props.campaign?.avg_icp_fit_score && props.campaign?.avg_icp_fit_score < 2;

  let ChannelIcon = () => (
    <IconBrandLinkedin style={{ width: 20, height: 20, marginTop: 9 }} />
  );
  if (selectedChildChannel === "email") {
    ChannelIcon = () => (
      <IconMail style={{ width: 20, height: 20, marginTop: 9 }} />
    );
  } else if (selectedChildChannel === "nurture") {
    ChannelIcon = () => (
      <IconPlant style={{ width: 20, height: 20, marginTop: 9 }} />
    );
  }

  return (
    <Box sx={{ display: "flex", justifyContent: "center" }}>
      <Flex bg={"gray.0"} direction={"column"} pt={10} w={"100%"}>
        <Box px={"xl"}>
          {
            <Box w="100%" mb="md">
              <Flex direction="row" justify={"space-between"} gap={"md"}>
                <Stack spacing={0}>
                  <Group
                    style={{ position: "relative" }}
                    align="end"
                    spacing={5}
                  >
                    <Title order={2} style={{ marginBottom: 0 }}>
                      {props.campaign?.emoji}{" "}
                      {props.campaign?.name ?? <i>Loading Campaign</i>}
                    </Title>
                    {!props.campaign && (
                      <Loader variant="dots" size="sm" py={7} />
                    )}
                    {/* <Badge
                          size="xl"
                          mb="xs"
                          leftSection={<ChannelIcon />}
                          ml="xs"
                          mt="3px"
                          variant="outline"
                        >
                          {props.selectedChannel}
                        </Badge> */}
                    {props.campaign && (
                      <Tooltip
                        label="Click to edit campaign name or objective"
                        position={"bottom"}
                        openDelay={400}
                      >
                        <Button
                          size="xl"
                          compact
                          color={"gray"}
                          variant="subtle"
                          onClick={() => {
                            navigateToPage(navigate, "/persona/settings");
                          }}
                        >
                          <IconPencil size={"1.2rem"} />
                        </Button>
                      </Tooltip>
                    )}
                  </Group>
                  <Box>
                    <Flex align={"center"} gap={"0.5rem"} mb="xs">
                      <Anchor
                        fz={"0.8rem"}
                        color="gray.6"
                        mt={3}
                        ml={5}
                        onClickCapture={() => {
                          navigateToPage(navigate, "/campaigns");
                        }}
                      >
                        <IconArrowLeft size={"0.5rem"} /> Go back to campaigns
                      </Anchor>
                    </Flex>
                  </Box>
                </Stack>

                {props.setupWizardFeatureEnabled && (
                  <Button
                    ml="auto"
                    leftIcon={
                      props.setupMode ? (
                        <IconArrowLeft size="1rem" />
                      ) : (
                        <IconSparkles size="1rem" />
                      )
                    }
                    color="grape"
                    variant={props.setupMode ? "outline" : "filled"}
                    mt="xs"
                    onClick={() => {
                      props.setSetupMode(!props.setupMode);
                    }}
                  >
                    {props.setupMode
                      ? "Back to Campaign Overview"
                      : "Go to Setup Wizard"}
                  </Button>
                )}
              </Flex>
            </Box>
          }

          {!props.hideChannels && (
            <Grid gutter={"0"} px={"2rem"} mt="md">
              <Grid.Col
                span={3}
                onClick={() => {
                  props.setSelectedChannel("linkedin");
                  setSelectedChildChannel("linkedin");
                }}
              >
                <ChannelTab
                  type="linkedin"
                  active={selectedChildChannel === "linkedin"}
                  enabled={isEnabledLinkedin}
                  onToggle={setEnabledLinkedin}
                />
              </Grid.Col>
              <Grid.Col span={"auto"}>
                <Hook
                  linkedLeft={isEnabledLinkedin}
                  linkedRight={isActiveEmail && isEnabledEmail}
                />
              </Grid.Col>
              <Grid.Col
                span={3}
                onClick={() => {
                  props.setSelectedChannel("email");
                  setSelectedChildChannel("email");
                }}
              >
                <ChannelTab
                  type="email"
                  active={selectedChildChannel === "email"}
                  enabled={isEnabledEmail}
                  onToggle={setEnabledEmail}
                />
              </Grid.Col>
              <Grid.Col span={"auto"}>
                <Hook
                  linkedLeft={isActiveEmail && isEnabledEmail}
                  linkedRight={isActiveNurture && isEnabledNurture}
                />
              </Grid.Col>
              <Grid.Col
                span={3}
                onClick={() => {
                  props.setSelectedChannel("nurture");
                  setSelectedChildChannel("nurture");
                }}
              >
                <ChannelTab
                  type="nurture"
                  active={selectedChildChannel === "nurture"}
                  enabled={isEnabledNurture}
                  onToggle={setEnabledNurture}
                />
              </Grid.Col>
            </Grid>
          )}
        </Box>
      </Flex>
    </Box>
  );
};

export default ChannelsSetupSelector;
