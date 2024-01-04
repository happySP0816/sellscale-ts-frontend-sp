import {
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  Flex,
  Grid,
  Stack,
  Text,
  rem,
} from "@mantine/core";
import { FaLinkedin } from "@react-icons/all-files/fa/FaLinkedin";
import { IconBrandLinkedin, IconExternalLink, IconMail } from "@tabler/icons";
import { OperatorNotification } from '..';
import DOMPurify from 'isomorphic-dompurify';
import { API_URL } from '@constants/data';
import { useRecoilValue } from 'recoil';
import { userTokenState } from '@atoms/userAtoms';
import { showNotification } from '@mantine/notifications';
import { useState } from 'react';

type PropsType = {
  notification: OperatorNotification
}

const HighPriority = (props: PropsType) => {
  const userToken = useRecoilValue(userTokenState)
  const [isLoading, setIsLoading] = useState<boolean>(false);
  return (
    <Box>
      <Grid>
        <Grid.Col span={6}>
          <Stack h={"100%"}>
            <Flex
              p={"xs"}
              sx={(theme) => ({
                border: `1px dashed ${
                  theme.colors.blue[theme.fn.primaryShade()]
                }`,
                borderRadius: rem(12),
              })}
              justify={"space-between"}
            >
              <Flex align={"center"}>
                <Text fz={"xs"}>Multi Step Campaign: &nbsp;</Text>
                <Text fw={700} fz={"xs"}>
                  {props.notification?.data?.campaign_name}
                </Text>
              </Flex>

              {props.notification?.data?.linkedin_active && <IconBrandLinkedin color="#2F98C1" />}
              {props.notification?.data?.email_active && <IconMail color="#2F98C1" />}
            </Flex>
            <Box
              bg={"gray.2"}
              p={"xs"}
              sx={{ borderRadius: rem(12) }}
              h={"100%"}
            >
              <Text transform="uppercase" size={"sm"} fw={700} color="gray.6">
                Example Message
              </Text>

              <Text size={"sm"} mt={"xs"}>
                {
                  props.notification?.data?.render_message_as_html ?
                    (
                      <Text fz='xs'>
                        <div
                          id={props.notification?.data?.example_message}
                          dangerouslySetInnerHTML={{
                            __html: DOMPurify.sanitize(props.notification?.data?.example_message),
                          }}
                        />
                      </Text>
                    ) : (
                      <Text fz={"sm"}>
                        {props.notification?.data?.example_message}
                      </Text>
                    )
                }
              </Text>
            </Box>
          </Stack>
        </Grid.Col>
        <Grid.Col span={6}>
          <Card withBorder radius={"lg"}>
            <Flex justify={"space-between"}>
              <Flex>
                <Text fz={"xs"}>Contacts &nbsp;</Text>
                <Text fw={700} fz={"xs"}>
                  ({props.notification?.data?.num_prospects})
                </Text>
              </Flex>
              <Text fw={700} fz={"xs"} color="gray.6">
                +{props.notification?.data?.num_prospects - props.notification?.data?.random_prospects.length} More
              </Text>
            </Flex>

            <Stack mt={"sm"}>
              {props.notification?.data?.random_prospects.map((prospect: any, idx: number) => (
                <Flex align={"center"} gap={"sm"}>
                  <Avatar size={"lg"} src={prospect.img_url} />

                  <Flex sx={{ flex: 1 }} direction={"column"}>
                    <Flex align={"center"} justify={"space-between"} w={"100%"}>
                      <Flex fw={700} fz={"xs"}>
                        {prospect.full_name}
                      </Flex>

                      <Badge size="xs" color={
                        prospect.icp_fit_score == 0 ? "red" :
                          prospect.icp_fit_score == 1 ? "orange" :
                            prospect.icp_fit_score == 2 ? "yellow" :
                              prospect.icp_fit_score == 3 ? "green" :
                                prospect.icp_fit_score == 4 ? "blue" : "gray"
                      }>{
                        prospect.icp_fit_score == 0 ? "Very Low" :
                          prospect.icp_fit_score == 1 ? "Low" :
                            prospect.icp_fit_score == 2 ? "Medium" :
                              prospect.icp_fit_score == 3 ? "High" :
                                prospect.icp_fit_score == 4 ? "Very High" : "Not Scored"
                      }</Badge>
                    </Flex>
                    <Text fw={500} fz={"xs"} color="gray.6" mt={4}>
                      {prospect.title} @ {prospect.company}
                    </Text>
                  </Flex>
                </Flex>
              ))}
            </Stack>
          </Card>
        </Grid.Col>
      </Grid>

      <Flex w={"100%"} mt={"sm"}>
        <Button rightIcon={<IconExternalLink />} ml={"auto"} radius={"md"} loading={isLoading} onClick={
          () => {
            setIsLoading(true);
            fetch(`${API_URL}/notification/mark_complete/${props.notification?.id}`, {
                method: 'POST',
                headers: {
                  'Authorization': 'Bearer ' + userToken,
                  'Content-Type': 'application/json'
                }
            }).then((response) => {
              if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
              }

              showNotification({
                title: '',
                message: `Marked as complete - redirecting now...`,
                color: 'blue',
              });

               setIsLoading(false);
              
              // window.location.href = `campaigns/${props.notification?.data?.archetype_id}`
              if (props.notification?.data?.render_message_as_html) {
                window.location.href = `setup/email?campaign_id=${props.notification?.data?.archetype_id}`
              } else {
                window.location.href = `setup/linkedin?campaign_id=${props.notification?.data?.archetype_id}`
              }
            }).catch((error) => {
              console.error('Error marking notification as complete', error);
               setIsLoading(false);
            })
          }
        }>
          {props.notification?.cta}
        </Button>
      </Flex>
    </Box>
  );
};

export default HighPriority;
