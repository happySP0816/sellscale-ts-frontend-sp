import {
  Drawer,
  LoadingOverlay,
  ScrollArea,
  Title,
  Badge,
  Flex,
  useMantineTheme,
  Tabs,
  Divider,
  ActionIcon,
  Card,
  Box,
  Button,
  Tooltip,
  Text,
  Center,
  Paper,
  Loader,
} from "@mantine/core";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  prospectDrawerIdState,
  prospectDrawerOpenState,
  prospectDrawerNotesState,
  prospectChannelState,
  prospectDrawerStatusesState,
} from "@atoms/prospectAtoms";
import { useQuery } from "@tanstack/react-query";
import ProspectDetailsSummary from "../common/prospectDetails/ProspectDetailsSummary";
import ProspectDetailsChangeStatus, {
  channelToIcon,
} from "../common/prospectDetails/ProspectDetailsChangeStatus";
import ProspectDetailsCompany from "../common/prospectDetails/ProspectDetailsCompany";
import ProspectDetailsNotes from "../common/prospectDetails/ProspectDetailsNotes";
import ProspectDetailsViewConversation from "../common/prospectDetails/ProspectDetailsViewConversation";
import { userDataState, userTokenState } from "@atoms/userAtoms";
import { formatToLabel, valueToColor } from "@utils/general";
import { logout } from "@auth/core";
import getChannels, { getChannelOptions } from "@utils/requests/getChannels";
import { useEffect, useRef, useState } from "react";
import { Channel, ProspectShallow } from "src";
import FlexSeparate from "@common/library/FlexSeparate";
import ProspectDetailsViewEmails, {
  openComposeEmailModal,
} from "@common/prospectDetails/ProspectDetailsViewEmails";
import { API_URL } from "@constants/data";
import ProspectDetailsRemove from "@common/prospectDetails/ProspectDetailsRemove";
import ProspectDetailsResearch from "@common/prospectDetails/ProspectDetailsResearch";
import { IconDots, IconEdit, IconPencil } from "@tabler/icons";
import ProspectDetailsOptionsMenu from "@common/prospectDetails/ProspectDetailsOptionsMenu";
import ProspectDetailsCalendarLink from "@common/prospectDetails/ProspectDetailsCalendarLink";
import ProspectDetailsHistory from "@common/prospectDetails/ProspectDetailsHistory";
import ProspectReferralCard from "./ProspectReferralCard";
import { openContextModal } from '@mantine/modals';
import InboxProspectConvo from "@common/inbox/InboxProspectConvo";
import { getProspects } from '@utils/requests/getProspects';
import { openedProspectIdState } from '@atoms/inboxAtoms';
import { IconChartBubble } from '@tabler/icons-react';


export default function ProspectDetailsDrawer(props: { zIndex?: number }) {
  const userData = useRecoilValue(userDataState);
  const theme = useMantineTheme();
  const tableFilterChannel = useRecoilValue(prospectChannelState);
  const [channelType, setChannelType] = useState<Channel | null>(
    'LINKEDIN'
  );

  const [drawerOpened, setDrawerOpened] = useRecoilState(
    prospectDrawerOpenState
  );

  const [notes, setNotes] = useRecoilState(prospectDrawerNotesState);
  const [prospectId, setProspectId] = useRecoilState(prospectDrawerIdState);
  const [openedProspectId, setOpenedProspectId] = useRecoilState(openedProspectIdState);
  const userToken = useRecoilValue(userTokenState);
  const [prospectDrawerStatuses, setProspectDrawerStatuses] = useRecoilState(
    prospectDrawerStatusesState
  );
  const persona_id = useRef(-1);
  const [prospect, setProspect] = useState<ProspectShallow | undefined>(undefined);

  // useEffect(() => {
  //   if (prospectId !== openedProspectId) {
  //     setOpenedProspectId(prospectId);
  //   }
  // }, []);

  const { data, isFetching, refetch } = useQuery({
    queryKey: [`query-prospect-details-${prospectId}`],
    queryFn: async () => {
      if (prospectId === -1) {
        return null;
      }

      const response = await fetch(`${API_URL}/prospect/${prospectId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });
      if (response.status === 401) {
        logout();
      }
      const res = await response.json();
      const res_channels = await getChannels(userToken);
      const res_valid_channels = await getChannelOptions(prospectId, userToken);

      setNotes(res.prospect_info.details.notes);

      persona_id.current = res.prospect_info.details.persona_id

      return {
        main: res,
        channels: res_channels.status === "success" ? res_channels.data : {},
        channelTypes: res_valid_channels,
      };
    },
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    const response = getProspects(
      userToken,
      undefined,
      "SELLSCALE",
      10000, // TODO: Maybe use pagination method instead
      ['ACCEPTED', 'BUMPED', 'ACTIVE_CONVO', 'DEMO', 'REMOVED'],
      'ALL',
      undefined,
      true,
      prospectId
    ).then((res) => {
      const prospects = res.data as ProspectShallow[];
      const prospectTemp: ProspectShallow | undefined = prospects?.find((prospect) => prospect.id === prospectId);
      setProspect(prospectTemp);
      setOpenedProspectId(prospectTemp?.id ?? -1);
    }).catch((err) => {
      console.log(err)
    });
  }, [drawerOpened]);


  useEffect(() => {
    if (!data) {
      return;
    }
    setProspectDrawerStatuses({
      overall: data.main.prospect_info.details.overall_status,
      linkedin: data.main.prospect_info.details.linkedin_status,
      email: data.main.prospect_info.details.email_status,
    });
  }, [data]);

  return (
    <Drawer
      opened={drawerOpened}
      keepMounted={false}
      onClose={() => {
        setDrawerOpened(false);
        setProspectId(-1);
      }}
      title={
        <FlexSeparate>
          <Title order={3}>
            {data?.main.prospect_info
              ? data.main.prospect_info.details.full_name
              : ""}
          </Title>
          <div style={{ display: "flex" }}>
            {data && (
              <>
                <Badge
                  color={valueToColor(
                    theme,
                    formatToLabel(prospectDrawerStatuses.overall)
                  )}
                  variant="outline"
                  mr={20}
                  mt={5}
                >
                  {`${formatToLabel(prospectDrawerStatuses.overall)}`}
                </Badge>
                <ProspectDetailsOptionsMenu
                  prospectId={data.main.prospect_info.details.id}
                  archetypeId={data.main.prospect_info.details.persona_id}
                  aiEnabled={data.main.prospect_info.details.ai_enabled}
                  refetch={refetch}
                />
              </>
            )}
          </div>
        </FlexSeparate>
      }
      padding="xl"
      size="lg"
      position="right"
      styles={(theme) => ({
        title: {
          width: "100%",
          marginRight: 0,
          color:
            theme.colorScheme === "dark" ? undefined : theme.colors.gray[2],
        },
        header: {
          backgroundColor:
            theme.colorScheme === "dark" ? undefined : theme.colors.dark[8],
          paddingTop: 12,
          paddingBottom: 12,
        },
        body: {
          marginTop: 10,
        },
      })}
      zIndex={props.zIndex}
    >
      <LoadingOverlay visible={isFetching} overlayBlur={2} />
      {data?.main.prospect_info && !isFetching && (
        <>
          <div style={{ position: "relative" }}>
            <Flex w="100%" mt="md">
              <ProspectDetailsSummary
                fullName={data.main.prospect_info.details.full_name}
                prospectID={data.main.prospect_info.details.id}
                aiEnabled={
                  !data.main.prospect_info.details.ai_responses_disabled
                }
                refetch={refetch}
                title={data.main.prospect_info.details.title}
                email={data.main.prospect_info.email.email}
                linkedin={data.main.prospect_info.li.li_profile}
                profilePic={data.main.prospect_info.details.profile_pic}
                location={data.main.prospect_info.data.location}
                companyName={data.main.prospect_info.company.name}
                companyURL={data.main.prospect_info.company.url}
                companyHQ={data.main.prospect_info.data.company_hq}
                persona={data.main.prospect_info.details.persona}
                email_store={data.main.prospect_info.data.email_store}
                icp_score={data.main.prospect_info.details.icp_fit_score}
                icp_reason={data.main.prospect_info.details.icp_fit_reason}
                contractSize={data.main.prospect_info.data.contract_size}
              />
            </Flex>
            {data.main.prospect_info.email.email && (
              <Center>
                <Button
                  size="xs"
                  variant="light"
                  leftIcon={<IconEdit size="1rem" />}
                  disabled={!userData.nylas_connected}
                  onClick={() => {
                    openComposeEmailModal(
                      userToken,
                      prospectId,
                      data.main.prospect_info.details.persona_id,
                      prospectDrawerStatuses.email,
                      prospectDrawerStatuses.overall,
                      data.main.prospect_info.email.email,
                      userData.sdr_email,
                      "",
                      "",
                      ""
                    );
                  }}
                >
                  Compose Email
                </Button>
                <Text size="xs" w="40%" ml="sm" sx={{ fontSize: "70%" }}>
                  {userData.nylas_connected
                    ? ""
                    : "Email integration not connected. Connect via Settings."}
                </Text>
              </Center>
            )}
            {data.main.prospect_info.referrals.length > 0 && (
              <ProspectReferralCard
                prospects={data.main.prospect_info.referrals}
              />
            )}
            <Flex direction="row">
              {data.main.prospect_info.referred.length > 0 && (
                <ProspectReferralCard
                  prospects={data.main.prospect_info.referred}
                  referredBy
                />
              )}
            </Flex>
          </div>

          <ScrollArea
            style={{ height: window.innerHeight - 200, overflowY: "hidden" }}
            mt="sm"
          >
            {data?.channelTypes.length > 0 &&
              prospectDrawerStatuses.overall !== "PROSPECTED" && (
                <>
                  <Tabs
                    value={
                      channelType === null || channelType === "SELLSCALE"
                        ? data.channelTypes[0].value
                        : channelType
                    }
                    onTabChange={(value) => {
                      setChannelType(value as Channel | null);
                    }}
                  >
                    <Tabs.List position="center" display={"none"}>
                      <Tabs.Tab
                        key="conversation"
                        value="conversation"
                        icon={<IconChartBubble size={14} />}
                      >
                        Conversation
                      </Tabs.Tab>
                    </Tabs.List>

                    {data?.channelTypes.map(
                      (channel: { label: string; value: Channel }) => {
                        if (channel.value !== channelType) {
                          return null;
                        }
                        return (
                          <>
                            <ProspectDetailsChangeStatus
                              prospectId={data.main.prospect_info.details.id}
                              prospectName={
                                data.main.prospect_info.details.full_name
                              }
                              prospectDemoDate={
                                data.main.prospect_info.details.demo_date
                              }
                              channelData={{
                                data: data.channels[channel.value],
                                value: channel.value,
                                currentStatus:
                                  channel.value === "LINKEDIN"
                                    ? prospectDrawerStatuses.linkedin
                                    : prospectDrawerStatuses.email,
                              }}
                            />

                            {userData.scheduling_link &&
                              prospectDrawerStatuses.linkedin ===
                                "ACTIVE_CONVO_SCHEDULING" && (
                                <ProspectDetailsCalendarLink
                                  calendarLink={userData.scheduling_link}
                                />
                              )}
                          </>
                        );
                      }
                    )}

                    {/* {fetchingProspect ? 
                        <Card withBorder mt='xs'>
                          <Loader />
                        </Card>
                        : null 
                    } */}
                    {prospect &&
                      prospect.overall_status !== "PROSPECTED" &&
                      prospect.overall_status !== "SENT_OUTREACH" && (
                        <Card withBorder mt="xs">
                          <Title order={4} mb="xs">
                            Conversation
                          </Title>
                          {
                            <InboxProspectConvo
                              prospects={[prospect]}
                              onTabChange={(value) => {
                                setChannelType(value as Channel | null);
                              }}
                              openConvoBox
                              hideTitle
                            />
                          }
                        </Card>
                      )}

                    {data?.channelTypes.map(
                      (channel: { label: string; value: Channel }) => (
                        <>
                          {channel.value === "LINKEDIN" && (
                            <Card
                              shadow="sm"
                              p="lg"
                              radius="md"
                              mt="md"
                              withBorder
                            >
                              <Title order={4}>Prospect History</Title>
                              <ScrollArea h={500}>
                                <ProspectDetailsHistory
                                  prospectId={
                                    data.main.prospect_info.details.id
                                  }
                                  forceRefresh={false}
                                />
                              </ScrollArea>
                            </Card>
                          )}
                        </>
                      )
                    )}
                  </Tabs>
                  <Divider mb="sm" size="sm" />
                </>
              )}
            <ProspectDetailsResearch
              prospectId={data.main.prospect_info.details.id}
            />
            <ProspectDetailsNotes
              currentStatus={prospectDrawerStatuses.overall}
              prospectId={data.main.prospect_info.details.id}
            />
            {
              // <ProspectDetailsRemove
              //   prospectId={data.main.prospect_info.details.id}
              //   prospectStatus={prospectDrawerStatuses.overall}
              // />
              //
              // data.main.prospect_info.company.name && (
              // <ProspectDetailsCompany
              //   logo={data.main.prospect_info.company.logo}
              //   company_name={data.main.prospect_info.company.name}
              //   location={data.main.prospect_info.company.location}
              //   description={data.main.prospect_info.company.description}
              //   employee_count={data.main.prospect_info.company.employee_count}
              //   tagline={data.main.prospect_info.company.tagline}
              //   tags={data.main.prospect_info.company.tags}
              //   website_url={data.main.prospect_info.company.url}
              // />
              // )
            }
          </ScrollArea>
        </>
      )}
    </Drawer>
  );
}
