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
  useMantineTheme,
} from "@mantine/core";
import React from "react";
import { IconArrowRight, IconMessages, IconRobot } from "@tabler/icons";
import { CampaignEntityData } from '@pages/CampaignDetail';
import { useRecoilState, useRecoilValue } from 'recoil';
import { userDataState } from '@atoms/userAtoms';
import { EmailBodyItem } from '@pages/EmailSequencing/DetailEmailSequencing';
import { deterministicMantineColor } from '@utils/requests/utils';
import { isValidUrl } from '@utils/general';
import ReactDOMServer from 'react-dom/server';
import DOMPurify from 'isomorphic-dompurify';


type PropsType = {
  data: CampaignEntityData | undefined
};

// const theme = useMantineTheme();
const formatedSequence = (newText: string) => {
  if (newText) {
      newText.match(/\[\[(.*?)]\]/g)?.forEach((v) => {
        const content = v.replace('[[', '').replace(']]', '');

        // Add 'https://' to urls that don't have a 'https://'
        for (const word of content.trim().split(/\s/)) {
          if (isValidUrl(word) && !word.startsWith('https://')) {
            content.replace(word, 'https://' + word);
          }
        }

        newText = newText?.replace(
          v,
          ReactDOMServer.renderToString(
            <Text
              style={{
                backgroundColor: 'rgb(0, 132, 255)',
                width: 'fit-content',
                color: 'white',
                borderRadius: 12,
                padding: '0.25rem',
                fontWeight: 700,
                marginLeft: '0.25rem',
                paddingLeft: '12px',
                paddingRight: '12px',
                cursor: 'pointer',
              }}
              component='span'
            >
              <IconRobot size='1.1rem' color='white' style={{ paddingTop: '4px' }}></IconRobot>
              {content}
            </Text>
          )
        );
      });
    }

    return newText;
}
    

const Email = (props: PropsType) => {
  const userData = useRecoilValue(userDataState);
  const archetype_id = window.location.pathname.split('/')[2];

  return (
    <Card withBorder px={0} pb={0}>
      <Flex justify={"space-between"} px={"sm"}>
        <Text fw={600} fz={'lg'}>{props.data?.email.sequence.length}-Step Email Sequence</Text>

        <Button 
          compact 
          rightIcon={<IconArrowRight />} 
          radius={"xl"}
          onClick={() => window.location.href = `/setup/email/${archetype_id}`}
        >
          GO TO SEQUENCE
        </Button>
      </Flex>
      <Divider mt={"sm"} />

      {
        props.data?.email.sequence.map((value, index) => {
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

                  <Card withBorder mt='md'>
                    {/* {formatedSequence(description)} */}
                    <Text fz='xs'>
                      <div
                        dangerouslySetInnerHTML={{
                          __html: DOMPurify.sanitize(formatedSequence(description)),
                        }}
                      />
                    </Text>
                  </Card>
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

export default Email;
