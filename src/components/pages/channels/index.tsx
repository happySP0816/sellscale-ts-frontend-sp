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
import { IconArrowLeft, IconBrain, IconBrandGmail, IconBrandLinkedin, IconFilter, IconMail, IconPencil, IconPlant, IconPlus } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import Hook from "./components/Hook";
import ChannelTab from "./components/ChannelTab";
import { useRecoilValue } from 'recoil';
import { userDataState } from '@atoms/userAtoms';
import { ProjectSelect } from "@common/library/ProjectSelect";
import { currentProjectState } from '@atoms/personaAtoms';
import { useNavigate } from 'react-router-dom';
import { navigateToPage } from '@utils/documentChange';

const ChannelsSetupSelector = (props: {selectedChannel: string, setSelectedChannel: (channel: string) => void, hideChannels: boolean}) => {
  const [selectedChildChannel, setSelectedChildChannel] = useState(props.selectedChannel);
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

  const brainFilled = currentProject?.name && currentProject?.persona_contact_objective && currentProject?.persona_fit_reason && currentProject?.contract_size
  let brainPercentFilled = 0
  let brainAttributes = [
    currentProject?.name,
    currentProject?.persona_contact_objective,
    currentProject?.persona_fit_reason,
    currentProject?.contract_size
  ]
  brainAttributes.forEach((attribute) => {
    if(attribute) {
      brainPercentFilled += 1
    }
  }
  )
  brainPercentFilled = brainPercentFilled / 4 * 100

  const needMoreProspects = currentProject?.num_unused_li_prospects && currentProject?.num_unused_li_prospects < 200

  let avgIcpScoreLabel = ''
  if (currentProject?.avg_icp_fit_score) {
    if (currentProject?.avg_icp_fit_score < 1) {
      avgIcpScoreLabel = 'Very Low'
    } else if (currentProject?.avg_icp_fit_score < 2) {
      avgIcpScoreLabel = 'Low'
    } else if (currentProject?.avg_icp_fit_score < 3) {
      avgIcpScoreLabel = 'Medium'
    } else if (currentProject?.avg_icp_fit_score < 4) {
      avgIcpScoreLabel = 'High'
    } else if (currentProject?.avg_icp_fit_score < 5) {
      avgIcpScoreLabel = 'Very High'
    }
  }
  const avgIcpScoreIsBad = currentProject?.avg_icp_fit_score && currentProject?.avg_icp_fit_score < 2

  let ChannelIcon = () => <IconBrandLinkedin style={{ width: 20, height: 20, marginTop: 9 }} />
  if (selectedChildChannel === 'email') {
    ChannelIcon = () => <IconMail style={{ width: 20, height: 20, marginTop: 9 }} />
  } else if (selectedChildChannel === 'nurture') {
    ChannelIcon = () => <IconPlant style={{ width: 20, height: 20, marginTop: 9 }} />
  }
  
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
                  <Flex align={"center"} gap={"0.5rem"} mb='xs'>
                    <ActionIcon
                      variant="outline"
                      color="blue"
                      size={"sm"}
                      onClick={close}
                      sx={{ borderRadius: 999 }}
                      onClickCapture={() => {
                        history.back();
                      }}
                      mt='xs'
                    >
                      <IconArrowLeft size={"0.875rem"} />
                    </ActionIcon>
                    <Text fz={"1rem"} span color="gray.6" mt='8px'>
                      Go back to Campaigns
                    </Text>
                    {/* <Text fz={"1rem"} span color="gray.6" mt='8px'>
                      Campaign:
                    </Text>
                    <ProjectSelect /> */}
                  </Flex>
                </Grid.Col>
                {currentProject?.id && <Card withBorder w='100%' mb='lg'>
                  <Flex direction='row'>
                    <Card withBorder  w='35%' mr='5%'>
                      <Box>
                        <Tooltip
                          label='Click to edit campaign name or objective'
                          position={'bottom'}
                          >
                          <Button size='xs'  mt='xs' color={'gray'} variant='subtle' 
                            sx={{
                              position: 'absolute',
                              right: '8px',
                              bottom: '8px'
                            }}
                            onClick={
                              () => {
                                navigateToPage(navigate, '/persona/settings');
                              }
                            }>
                            <IconPencil size={'0.9rem'}/>
                          </Button>
                        </Tooltip>
                        <Badge size='xl' mb='xs' leftSection={<ChannelIcon />}>
                          {props.selectedChannel}
                        </Badge>
                        <Title order={2} style={{marginBottom: 0}}>
                          {currentProject?.emoji} {currentProject?.name}
                        </Title>
                        <Text size='xs' mt='md'>
                          <b>Objective:</b> {currentProject?.persona_contact_objective}
                        </Text>
                      </Box>
                    </Card>
                    <Card withBorder w='20%' mr='xs' sx={{textAlign: 'center'}}>
                        <Title order={6} style={{marginBottom: 0}}>
                          Setup {brainPercentFilled}% Filled
                        </Title>
                        <Text sx={{fontSize: '10px'}} h='40px'>
                          {brainFilled ? 'You are ready to go!' : 'You need to complete the setup so the AI can properly conduct outreach.'}
                        </Text>
                        <Button size='xs' leftIcon={<IconBrain size='0.8rem'/>} mt='xs' color={brainFilled ? 'green' : 'red'} onClick={
                          () => {
                            navigateToPage(navigate, '/persona/settings');
                          }
                        }>
                          Go to Setup
                        </Button>
                    </Card>
                    <Card withBorder w='20%' mr='xs'sx={{textAlign: 'center'}}>
                      <Title order={6} style={{marginBottom: 0}}>
                        Contacts: {currentProject?.num_unused_li_prospects} left
                      </Title>
                      <Text sx={{fontSize: '10px'}} h='40px'>
                        {
                          needMoreProspects ? 'You need to add more contacts to this campaign.' : 'You have enough contacts to continue this campaign. Add more to extend.'
                        }
                      </Text>
                      <Button size='xs' leftIcon={<IconPlus size='0.8rem'/>} mt='xs' color={needMoreProspects ? 'red' : 'green'} onClick={
                        () => {
                          navigateToPage(navigate, '/contacts');
                        }
                      }>
                        Add Contacts
                      </Button>
                    </Card>
                    <Card withBorder w='20%' mr='xs'sx={{textAlign: 'center'}}>
                      <Title order={6} style={{marginBottom: 0}}>
                        ICP Fit: {avgIcpScoreLabel} ({Math.round(currentProject?.avg_icp_fit_score * 100) / 100})
                      </Title>
                      <Text sx={{fontSize: '10px'}} h='40px'>
                        {
                          avgIcpScoreIsBad ? 'Your ICP fit score is low. You should adjust your ICP to improve your results.' : 'Your ICP fit score is above average. You can optionally adjust your ICP settings.'
                        }
                      </Text>
                      <Button size='xs' leftIcon={<IconFilter size='0.8rem'/>} mt='xs' color={avgIcpScoreIsBad ? 'red' : 'green'} onClick={
                        () => {
                          navigateToPage(navigate, '/prioritize')
                        }
                      }>
                        Adjust Filters
                      </Button>
                    </Card>
                  </Flex>
                </Card>}
              </Grid>

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
