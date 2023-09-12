import { Box, Container, Flex, Grid, Text } from "@mantine/core";
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

const CampaignGraph = (props: {sections: any, onChannelClick: (sectionType: string) => void}) => {

  const linkedinSection = props.sections.filter((x: any) => x.type == 'LinkedIn')
  const emailSection = props.sections.filter((x: any) => x.type == 'Email')
  const nurtureSection = props.sections.filter((x: any) => x.type == 'Nurture')

  const [isEnabledLinkedin, setEnabledLinkedin] = useState(linkedinSection[0]?.sends > 0);
  const [isActiveLinkedin, setActiveLinkedin] = useState(linkedinSection[0]?.sends > 0);

  const [isEnabledEmail, setEnabledEmail] = useState(emailSection[0]?.sends > 0);
  const [isActiveEmail, setActiveEmail] = useState(emailSection[0]?.sends > 0);

  const [isEnabledNurture, setEnabledNurture] = useState(nurtureSection[0]?.sends > 0);
  const [isActiveNurture, setActiveNurture] = useState(nurtureSection[0]?.sends > 0);

  console.log(props.sections)

  useEffect(() => {
    setActiveEmail(isEnabledLinkedin);
  }, [isEnabledLinkedin]);

  useEffect(() => {
    setActiveNurture(isEnabledEmail && isActiveEmail);
  }, [isEnabledEmail, isActiveEmail]);

  return (
    <Container size={"xl"} p={"1.5rem"} bg={"white"}>
      <Grid gutter={"0"}>
        <Grid.Col xs={12} md={3} onClick={() => props.onChannelClick('linkedin')} sx={{cursor: 'pointer'}}>
          <CampaignSequenceDAG
            type="linkedin"
            active={isEnabledLinkedin}
            enabled={isEnabledLinkedin}
            // onToggle={setEnabledLinkedin}
            numbers={[linkedinSection[0]?.sends, linkedinSection[0]?.opens, linkedinSection[0]?.replies,]}
          />
        </Grid.Col>
        <Grid.Col xs={12} md={1.5}>
          <Hook
            linkedLeft={isEnabledLinkedin}
            linkedRight={isActiveEmail && isEnabledEmail}
          />
        </Grid.Col>
        <Grid.Col xs={12} md={3} onClick={() => props.onChannelClick('email')} sx={{cursor: 'pointer'}}>
          <CampaignSequenceDAG
            type="email"
            active={isEnabledEmail}
            enabled={isEnabledEmail}
            // onToggle={setEnabledEmail}
            numbers={[emailSection[0]?.sends, emailSection[0]?.opens, emailSection[0]?.replies,]}
          />
        </Grid.Col>
        <Grid.Col xs={12} md={1.5}>
          <Hook
            linkedLeft={isActiveEmail && isEnabledEmail}
            linkedRight={isActiveNurture && isEnabledNurture}
          />
        </Grid.Col>
        <Grid.Col xs={12} md={3} onClick={() => {}} sx={{cursor: 'not-allowed'}}>
          <CampaignSequenceDAG
            type="nurture"
            active={isEnabledNurture}
            enabled={isEnabledNurture}
            // onToggle={setEnabledNurture}
            numbers={[nurtureSection[0]?.sends, nurtureSection[0]?.opens, nurtureSection[0]?.replies,]}
          />
        </Grid.Col>
      </Grid>
    </Container>
  );
};

export default CampaignGraph;
