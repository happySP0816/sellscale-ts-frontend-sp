import { Box, Button, Container, Flex, Grid, Group, Paper, Stack, Text, Title } from "@mantine/core";
import CampaignSequenceDAG from "./components/CampaignSequenceDAG";
import React, { useEffect, useState } from "react";
import { IconChevronsRight } from "@tabler/icons-react";

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
  sections: any;
  personaId: number,
  unusedProspects: number;
  onChannelClick: (sectionType: string) => void;
}) => {
  const linkedinSection = props.sections.filter((x: any) => x.type == 'LinkedIn');
  const emailSection = props.sections.filter((x: any) => x.type == 'Email');
  const nurtureSection = props.sections.filter((x: any) => x.type == 'Nurture');

  const [isEnabledLinkedin, setEnabledLinkedin] = useState(linkedinSection[0]?.sends > 0);
  const [isActiveLinkedin, setActiveLinkedin] = useState(linkedinSection[0]?.sends > 0);

  const [isEnabledEmail, setEnabledEmail] = useState(emailSection[0]?.sends > 0);
  const [isActiveEmail, setActiveEmail] = useState(emailSection[0]?.sends > 0);

  const [isEnabledNurture, setEnabledNurture] = useState(nurtureSection[0]?.sends > 0);
  const [isActiveNurture, setActiveNurture] = useState(nurtureSection[0]?.sends > 0);

  useEffect(() => {
    setActiveEmail(isEnabledLinkedin);
  }, [isEnabledLinkedin]);

  useEffect(() => {
    setActiveNurture(isEnabledEmail && isActiveEmail);
  }, [isEnabledEmail, isActiveEmail]);

  return (
    <Container size={'xl'} p={'1.5rem'} bg={'white'}>
      <Group align='flex-start' noWrap>
        <Paper p='md' h='100%' withBorder>
          <Title order={4}>Source</Title>
          <Stack>
            <Button
              variant='outline'
              onClick={() => {
                window.location.href = `/contacts?campaign_id=${props.personaId}`;
              }}
            >
              {props.unusedProspects} contacts left
            </Button>
            <Button
              variant='subtle'
              size='sm'
              onClick={() => {
                window.location.href = `/contacts/find?campaign_id=${props.personaId}`;
              }}
              compact
            >
              Add contacts
            </Button>
          </Stack>
          {/* <Button
            radius='xl'
            size='xs'
            variant='outline'
            compact
            color={props.persona.active ? 'white' : 'gray'}
            sx={(theme) => ({
              borderColor: props.persona.active ? 'white' : 'gray',
              color: props.persona.active ? 'white' : 'gray',
            })}
            onClick={() => {
              if (props.project == undefined) return;
              setOpenedProspectId(-1);
              setCurrentProject(props.project);
              navigateToPage(navigate, `/prioritize/${props.persona.id}`);
            }}
            leftIcon={<IconFilter size={'0.7rem'} />}
          >
            Filter Contacts
          </Button> */}
        </Paper>
        <Paper p='md' sx={{ flex: 1 }} withBorder>
          <Title order={4}>Outreach</Title>
          <Group noWrap>
            <Box onClick={() => props.onChannelClick('linkedin')}>
              <CampaignSequenceDAG
                type='linkedin'
                active={isEnabledLinkedin || true} // TODO: Remove || true if we want to disable the LinkedIn section
                enabled={isEnabledLinkedin || true} // TODO: Remove || true if we want to disable the LinkedIn section
                // onToggle={setEnabledLinkedin}
                numbers={[linkedinSection[0]?.sends, linkedinSection[0]?.opens, linkedinSection[0]?.replies]}
              />
            </Box>
            <Box onClick={() => props.onChannelClick('email')}>
              <CampaignSequenceDAG
                type='email'
                active={isEnabledEmail}
                enabled={isEnabledEmail}
                // onToggle={setEnabledEmail}
                numbers={[emailSection[0]?.sends, emailSection[0]?.opens, emailSection[0]?.replies]}
              />
            </Box>
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
