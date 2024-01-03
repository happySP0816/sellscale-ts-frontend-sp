import {
  Card,
  Button,
  Divider,
  Flex,
  Text,
  Grid,
  Avatar,
  Badge,
  Box,
  rem,
} from "@mantine/core";
import React from "react";
import { IconArrowRight, IconMessages } from "@tabler/icons";
import { CampaignEntityData } from '@pages/CampaignDetail';
import { useRecoilState, useRecoilValue } from 'recoil';
import { userDataState } from '@atoms/userAtoms';

type PropsType = {
  data: CampaignEntityData | undefined
};

const Linkedin = (props: PropsType) => {
  const userData = useRecoilValue(userDataState);
  const archetype_id = window.location.pathname.split('/')[2];

  return (
    <Card withBorder px={0} pb={0}>
      <Flex justify={"space-between"} px={"sm"}>
        <Text fw={600} fz={'lg'}>{props.data?.linkedin.sequence.length}-Step LinkedIn Sequence</Text>

        <Button 
          compact 
          rightIcon={<IconArrowRight />} 
          radius={"xl"}
          onClick={() => window.location.href = `/setup/linkedin?campaign_id=${archetype_id}`}
        >
          GO TO SEQUENCE
        </Button>
      </Flex>
      <Divider mt={"sm"} />

      {
        props.data?.linkedin.sequence.map((value, index) => {
          const title = value.title;
          const description = value.description;
          
          return <>
            <Grid>
              <Grid.Col span={4}>
                <Flex
                  w={"100%"}
                  h={"100%"}
                  bg={"gray.0"}
                  sx={(theme) => ({
                    borderRight: `1px solid ${theme.colors.gray[4]}`,
                  })}
                  direction={"column"}
                  align={"center"}
                  justify={"center"}
                >
                  <Text
                    c={"gray.6"}
                    fw={500}
                    display={"flex"}
                    sx={{ gap: rem(4), alignItems: "center" }}
                  >
                    <IconMessages size={"0.9rem"} />
                    Step {index + 1}
                  </Text>
                  <Text fw={700} align='center'>{title}</Text>
                </Flex>
              </Grid.Col>

              <Grid.Col span={8}>
                <Box p={"md"}>
                  <Flex justify={"space-between"} align={"center"}>
                    <Flex align={"center"} gap={"xs"}>
                      <Avatar size={"md"} src={userData.img_url}></Avatar>
                      <Text fw={700} fz={"md"}>
                        {userData.sdr_name}
                      </Text>
                    </Flex>

                  </Flex>

                  <Text mt={"sm"} fz={"sm"} c={"gray.6"} fw={500}>
                    {description}
                  </Text>
                </Box>
              </Grid.Col>
            </Grid>
            <Divider />
          </>
        })
      }
      
    </Card>
  );
};

export default Linkedin;
