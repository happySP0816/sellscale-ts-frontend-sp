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
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import Hook from "./components/Hook";
import ChannelTab from "./components/ChannelTab";
import { useRecoilValue } from "recoil";
import { userDataState } from "@atoms/userAtoms";
import { ProjectSelect } from "@common/library/ProjectSelect";
import { currentProjectState } from "@atoms/personaAtoms";
import { useNavigate } from "react-router-dom";
import { navigateToPage } from "@utils/documentChange";

const ChannelsSetupSelector = (props: {
  selectedChannel: string;
  setSelectedChannel: (channel: string) => void;
  hideChannels: boolean;
}) => {
  const [selectedChildChannel, setSelectedChildChannel] = useState(
    props.selectedChannel
  );
  const [isEnabledLinkedin, setEnabledLinkedin] = useState(true);

  const currentProject = useRecoilValue(currentProjectState);
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
    currentProject?.name &&
    currentProject?.persona_contact_objective &&
    currentProject?.persona_fit_reason &&
    currentProject?.contract_size &&
    currentProject?.cta_framework_company &&
    currentProject?.cta_framework_persona &&
    currentProject?.cta_framework_action &&
    currentProject?.use_cases &&
    currentProject?.filters &&
    currentProject?.lookalike_profile_1 &&
    currentProject?.lookalike_profile_2 &&
    currentProject?.lookalike_profile_3 &&
    currentProject?.lookalike_profile_4 &&
    currentProject?.lookalike_profile_5;
  let brainPercentFilled = 0;
  let brainAttributes = [
    currentProject?.name,
    currentProject?.persona_contact_objective,
    currentProject?.persona_fit_reason,
    currentProject?.contract_size,
    currentProject?.cta_framework_company,
    currentProject?.cta_framework_persona,
    currentProject?.cta_framework_action,
    currentProject?.use_cases,
    currentProject?.filters,
    currentProject?.lookalike_profile_1,
    currentProject?.lookalike_profile_2,
    currentProject?.lookalike_profile_3,
    currentProject?.lookalike_profile_4,
  ];
  brainAttributes.forEach((attribute) => {
    if (attribute) {
      brainPercentFilled += 1;
    }
  });
  brainPercentFilled = Math.round((brainPercentFilled / 13) * 100);

  const needMoreProspects =
    currentProject?.num_unused_li_prospects &&
    currentProject?.num_unused_li_prospects < 200;

  let avgIcpScoreLabel = "";
  if (currentProject?.avg_icp_fit_score) {
    if (currentProject?.avg_icp_fit_score < 1) {
      avgIcpScoreLabel = "Very Low";
    } else if (currentProject?.avg_icp_fit_score < 2) {
      avgIcpScoreLabel = "Low";
    } else if (currentProject?.avg_icp_fit_score < 3) {
      avgIcpScoreLabel = "Medium";
    } else if (currentProject?.avg_icp_fit_score < 4) {
      avgIcpScoreLabel = "High";
    } else if (currentProject?.avg_icp_fit_score < 5) {
      avgIcpScoreLabel = "Very High";
    }
  }
  const avgIcpScoreIsBad =
    currentProject?.avg_icp_fit_score && currentProject?.avg_icp_fit_score < 2;

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
      <Flex bg={"gray.0"} direction={"column"} pt={"2rem"} w={"100%"}>
        <Box px={"xl"}>
          <Flex align={"center"} gap={"0.5rem"} mb="xs">
            <ActionIcon
              variant="outline"
              color="blue"
              size={"sm"}
              onClick={close}
              sx={{ borderRadius: 999 }}
              onClickCapture={() => {
                navigateToPage(navigate, "/campaigns");
              }}
              mt="xs"
            >
              <IconArrowLeft size={"0.875rem"} />
            </ActionIcon>
            <Text fz={"1rem"} span color="gray.6" mt="8px">
              Go back to Campaigns
            </Text>
          </Flex>
        </Box>
        <Divider my={"md"} />
        <Box px={"xl"}>
          {currentProject?.id && (
            <Box w="100%" mb="md">
              <Flex direction="row" justify={"space-between"} gap={"md"}>
                <Box>
                  <Tooltip
                    label="Click to edit campaign name or objective"
                    position={"bottom"}
                  >
                    <Button
                      size="xs"
                      mt="xs"
                      color={"gray"}
                      variant="subtle"
                      sx={{
                        position: "absolute",
                        right: "8px",
                        bottom: "8px",
                      }}
                      onClick={() => {
                        navigateToPage(navigate, "/persona/settings");
                      }}
                    >
                      <IconPencil size={"0.9rem"} />
                    </Button>
                  </Tooltip>
                  <Flex>
                    <Title order={2} style={{ marginBottom: 0 }}>
                      {currentProject?.emoji} {currentProject?.name}
                    </Title>
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
                  </Flex>
                </Box>

                <Button
                  size="md"
                  leftIcon={<IconPlus size="0.8rem" />}
                  color={"blue"}
                  onClick={() => {
                    navigateToPage(navigate, "/contacts/find");
                  }}
                >
                  Add Prospects
                </Button>
              </Flex>
            </Box>
          )}

          {!props.hideChannels && (
            <Grid gutter={"0"} px={"2rem"}>
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
