import {
  ActionIcon,
  Box,
  Button,
  Container,
  Divider,
  Flex,
  Grid,
  Select,
  Text,
} from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import Hook from "./components/Hook";
import ChannelTab from "./components/ChannelTab";
import { useRecoilValue } from 'recoil';
import { userDataState } from '@atoms/userAtoms';
import PersonaSelect from '@common/persona/PersonaSplitSelect';
import { ProjectSelect } from '@nav/old/ProjectSelect';
import { useLoaderData } from 'react-router-dom';

const ChannelsSetupSelector = (props: {selectedChannel: string, setSelectedChannel: (channel: string) => void, hideChannels: boolean}) => {
  const [selectedChildChannel, setSelectedChildChannel] = useState(props.selectedChannel);
  const [isEnabledLinkedin, setEnabledLinkedin] = useState(true);

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

  return (
    <>
        <Box>
          <Container
            size={"xl"}
            sx={{ display: "flex", justifyContent: "center" }}
          >
            <Flex bg={"gray.0"} direction={"column"} pt={"2rem"} w={"100%"}>
              <Grid >
                <Grid.Col xs={12} md={"auto"}>
                  <Flex align={"center"} gap={"0.5rem"}>
                    <ActionIcon
                      variant="outline"
                      color="blue"
                      size={"sm"}
                      onClick={close}
                      sx={{ borderRadius: 999 }}
                      onClickCapture={() => {
                        history.back();
                      }}
                    >
                      <IconArrowLeft size={"0.875rem"} />
                    </ActionIcon>
                    <Text fz={"1rem"} span color="gray.6" mr='xs'>
                      Campaign:
                    </Text>
                   <ProjectSelect />
                  </Flex>
                </Grid.Col>
                <Grid.Col xs={12} md={"auto"}>
                  <Flex align={"center"} justify={{ md: "end" }} gap={"0.5rem"}>
                    <Flex
                      px={"1rem"}
                      align={"center"}
                      gap={"0.5rem"}
                      mih={"2rem"}
                      sx={{
                        borderWidth: "1px",
                        borderStyle: "solid",
                        borderColor: "#E9ECEF",
                        borderRadius: "4px",
                      }}
                    >
                      <Text fz={"0.75rem"} color="gray.6">
                        Linkedin:
                        <Text span color="blue" fw={500} ml='xs'>
                         {userData.weekly_li_outbound_target}/100
                        </Text>
                      </Text>
                      <Divider orientation="vertical" color="#E9ECEF" />
                      <Text fz={"0.75rem"} color="gray.6">
                        Email:{" "}
                        <Text span color="blue" fw={500} ml='xs'>
                          {userData.weekly_email_outbound_target}/100
                        </Text>
                      </Text>
                    </Flex>
                    <Button color="blue" size="xs" onClick={() => {}}>
                      Add More Prospects
                    </Button>
                  </Flex>
                </Grid.Col>
              </Grid>

              <Divider my={"1.5rem"} />

              {!props.hideChannels &&
                <Grid gutter={"0"} px={"2rem"}>
                  <Grid.Col span={3} onClick={() => {
                    props.setSelectedChannel('linkedin')
                    setSelectedChildChannel('linkedin')
                  }}>
                    <ChannelTab
                      type="linkedin"
                      active={selectedChildChannel === 'linkedin'}
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
                  <Grid.Col span={3} onClick={() => {
                    props.setSelectedChannel('email')
                    setSelectedChildChannel('email')
                  }}>
                    <ChannelTab
                      type="email"
                      active={selectedChildChannel === 'email'}
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
                  <Grid.Col span={3} onClick={() => {
                    props.setSelectedChannel('nurture')
                    setSelectedChildChannel('nurture')
                  }}>
                    <ChannelTab
                      type="nurture"
                      active={selectedChildChannel === 'nurture'}
                      enabled={isEnabledNurture}
                      onToggle={setEnabledNurture}
                    />
                  </Grid.Col>
                </Grid>
              }
            </Flex>
          </Container>
        </Box>
    </>
  );
};

export default ChannelsSetupSelector;
