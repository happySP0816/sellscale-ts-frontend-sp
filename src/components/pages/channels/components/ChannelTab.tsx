import { Card, Flex, Switch, Text } from "@mantine/core";
import { IconLeaf } from "@tabler/icons-react";
import { FaLinkedin } from "@react-icons/all-files/fa/FaLinkedin";
import { MdEmail } from "@react-icons/all-files/md/MdEmail";
import React, { useEffect, useMemo, useState } from "react";
import { useHover } from '@mantine/hooks';
import { useRecoilValue } from 'recoil';
import { currentProjectState } from '@atoms/personaAtoms';
import { getPersonasCampaignView } from '@utils/requests/getPersonas';
import { userTokenState } from '@atoms/userAtoms';
import {CampaignPersona} from '@common/campaigns/PersonaCampaigns'

const blue = "#228be6";

const ChannelTab: React.FC<{
  type: "linkedin" | "email" | "nurture";
  enabled: boolean;
  active: boolean;
  onToggle: (value: boolean) => void;
}> = ({ type = "linkedin", enabled = true, active = true, onToggle }) => {
  const {hovered, ref} = useHover();
  const userToken = useRecoilValue(userTokenState);
  const currentProject = useRecoilValue(currentProjectState);
  const [personas, setPersonas] = useState<CampaignPersona[]>([]);
  const [fetchedProjectId, setFetchedProjectId] = useState(-1);

  const getPersonas = async () => {
    const response = await getPersonasCampaignView(userToken);
      const result =
        response.status === "success"
          ? (response.data)
          : [];

      setPersonas(result.filter((x: any) => x.id == currentProject?.id) as CampaignPersona[]);
  }

  useEffect(() => {
    if (fetchedProjectId !== currentProject?.id && currentProject) {
      getPersonas();
      setFetchedProjectId(currentProject.id);
    }
  }, [currentProject, fetchedProjectId]);

  const linkedinActive = personas[0]?.li_sent > 0
  const emailActive = personas[0]?.emails_sent > 0
  const nurtureActive = false // todo(Aakash) once Nurture is live, change this to something real
  
  const renderLabel = useMemo(() => {
    if (type === "linkedin") {
      return (
        <Flex align={"center"} gap={"0.25rem"} ml={"-0.25rem"}>
          <FaLinkedin color={linkedinActive ? blue : "#868E96"} size={"1.25rem"} />
          <Text fw={"700"} fz={"1rem"} color={linkedinActive ? "blue.6" : "gray.6"}>
            Linkedin
          </Text>
        </Flex>
      );
    }
    if (type === "email") {
      return (
        <Flex align={"center"} gap={"0.25rem"} ml={"-0.25rem"}>
          <MdEmail color={emailActive ? blue : "#868E96"} size={"1.25rem"} />
          <Text fw={"700"} fz={"1rem"} color={emailActive ? "blue.6" : "gray.6"}>
            Email
          </Text>
        </Flex>
      );
    }
    if (type === "nurture") {
      return (
        <Flex align={"center"} gap={"0.25rem"} ml={"-0.25rem"}>
          <IconLeaf color={nurtureActive ? blue : "#868E96"} size={"1.25rem"} />
          <Text fw={"700"} fz={"1rem"} color={nurtureActive ? "blue.6" : "gray.6"}>
            Nurture
          </Text>
        </Flex>
      );
    }
  }, [type, active]);

  const switchChecked = type === "linkedin" ? linkedinActive : type === "email" ? emailActive : nurtureActive;

  return (
    <Card
      p={"1rem"}
      radius={8}
      ref={ref}
      sx={{
        borderWidth: "1px",
        borderBottomWidth: 0,
        borderRadius: "8px",
        borderBottomLeftRadius: "0",
        borderBottomRightRadius: "0",
        borderStyle: "solid",
        borderColor: active ? blue : "#E9ECEF",
        cursor: 'pointer',
        backgroundColor: hovered ? '#ccffff22' : 'white'
      }}
    >
      {/* {fetchedProjectId} {linkedinActive ? '✅' : '❌'} {emailActive ? '✅' : '❌'} {nurtureActive ? '✅' : '❌'} */}
      <Flex align={"center"} justify={"space-between"} gap={"0.5rem"}>
        {renderLabel}
        <Switch
          checked={switchChecked}
          size="xs"
          onChange={({ currentTarget: { checked } }) => onToggle(checked)}
        />
      </Flex>
    </Card>
  );
};

export default ChannelTab;
