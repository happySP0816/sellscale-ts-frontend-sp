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
} from "@mantine/core";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  prospectDrawerIdState,
  prospectDrawerOpenState,
  prospectDrawerNotesState,
  prospectChannelState,
} from "@atoms/prospectAtoms";
import { useQuery } from "@tanstack/react-query";
import ProspectDetailsSummary from "../common/prospectDetails/ProspectDetailsSummary";
import ProspectDetailsChangeStatus, {
  channelToIcon,
} from "../common/prospectDetails/ProspectDetailsChangeStatus";
import ProspectDetailsCompany from "../common/prospectDetails/ProspectDetailsCompany";
import ProspectDetailsNotes from "../common/prospectDetails/ProspectDetailsNotes";
import ProspectDetailsViewConversation from "../common/prospectDetails/ProspectDetailsViewConversation";
import { userTokenState } from "@atoms/userAtoms";
import { formatToLabel, valueToColor } from "@utils/general";
import { logout } from "@auth/core";
import getChannels, { getChannelOptions } from "@utils/requests/getChannels";
import { useEffect, useRef, useState } from "react";
import { Channel } from "src";
import FlexSeparate from "@common/library/FlexSeparate";
import ProspectDetailsViewEmails from "@common/prospectDetails/ProspectDetailsViewEmails";
import { API_URL } from "@constants/data";
import ProspectDetailsRemove from "@common/prospectDetails/ProspectDetailsRemove";
import ProspectDetailsAccountResearch from "@common/prospectDetails/ProspectDetailsAccountResearch";

export default function ProspectDetailsDrawer() {
  const theme = useMantineTheme();
  const tableFilterChannel = useRecoilValue(prospectChannelState);
  const [channelType, setChannelType] = useState<Channel | null>(
    tableFilterChannel.length > 0 ? tableFilterChannel : null
  );

  // This component is only rendered if drawerOpened=true - which isn't helpful for the first render
  // So we use actuallyOpened to control when the drawer opens and delay it by 100ms (for the animation to play)
  const [drawerOpened, setDrawerOpened] = useRecoilState(
    prospectDrawerOpenState
  );
  const [actuallyOpened, setActuallyOpened] = useState(false);
  useEffect(() => {
    setTimeout(() => {
      setActuallyOpened(drawerOpened);
    }, 100);
  }, []);

  const [notes, setNotes] = useRecoilState(prospectDrawerNotesState);
  const prospectId = useRecoilValue(prospectDrawerIdState);
  const userToken = useRecoilValue(userTokenState);

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

      return {
        main: res,
        channels: res_channels.status === "success" ? res_channels.extra : {},
        channelTypes: res_valid_channels,
      };
    },
    refetchOnWindowFocus: false,
  });

  console.log(data?.main);

  return (
    <Drawer
      opened={actuallyOpened}
      onClose={() => setDrawerOpened(false)}
      title={
        <FlexSeparate>
          <Title order={3}>
            {data?.main.prospect_info
              ? data.main.prospect_info.details.full_name
              : ""}
          </Title>
          {data && (
            <Badge
              color={valueToColor(
                theme,
                formatToLabel(data.main.prospect_info.details.overall_status)
              )}
              variant="light"
            >
              {`${formatToLabel(
                data.main.prospect_info.details.overall_status
              )}`}
            </Badge>
          )}
        </FlexSeparate>
      }
      padding="xl"
      size="xl"
      position="right"
      styles={{ title: { width: "100%" } }}
    >
      <LoadingOverlay visible={isFetching} overlayBlur={2} />
      {data?.main.prospect_info && !isFetching && (
        <>
          <ProspectDetailsSummary
            fullName={data.main.prospect_info.details.full_name}
            title={data.main.prospect_info.details.title}
            email={data.main.prospect_info.email.email}
            linkedin={data.main.prospect_info.li.li_profile}
            profilePic={data.main.prospect_info.details.profile_pic}
            companyName={data.main.prospect_info.company.name}
            companyURL={data.main.prospect_info.company.url}
          />
          <ScrollArea
            style={{ height: window.innerHeight - 200, overflowY: "hidden" }}
          >
            {data?.channelTypes.length > 0 && (
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
                  <Tabs.List position="center">
                    {data.channelTypes.map(
                      (channel: { label: string; value: Channel }) => (
                        <Tabs.Tab
                          key={channel.value}
                          value={channel.value}
                          icon={channelToIcon(channel.value, 14)}
                        >
                          {`${formatToLabel(channel.label)} Outbound`}
                        </Tabs.Tab>
                      )
                    )}
                  </Tabs.List>

                  {data?.channelTypes.map(
                    (channel: { label: string; value: Channel }) => (
                      <Tabs.Panel
                        key={channel.value}
                        value={channel.value}
                        p="sm"
                        sx={{
                          borderLeft: "1px solid #373A40",
                          borderRight: "1px solid #373A40",
                        }}
                      >
                        <ProspectDetailsChangeStatus
                          prospectId={data.main.prospect_info.details.id}
                          prospectName={
                            data.main.prospect_info.details.full_name
                          }
                          channelData={{
                            data: data.channels[channel.value],
                            value: channel.value,
                            currentStatus:
                              channel.value === "LINKEDIN"
                                ? data.main.prospect_info.details
                                    .linkedin_status
                                : data.main.prospect_info.details.email_status,
                          }}
                        />

                        {channel.value === "LINKEDIN" &&
                          data.main.prospect_info.li
                            ?.li_conversation_thread && (
                            <ProspectDetailsViewConversation
                              conversation_entry_list={
                                data.main.prospect_info.li
                                  .li_conversation_thread
                              }
                              conversation_url={
                                data.main.prospect_info.li.li_conversation_url
                              }
                              prospect_id={data?.main.prospect_info.details.id}
                              overall_status={
                                data.main.prospect_info.details.overall_status
                              }
                            />
                          )}

                        {channel.value === "EMAIL" && (
                          <ProspectDetailsViewEmails
                            prospectId={data.main.prospect_info.details.id}
                          />
                        )}
                      </Tabs.Panel>
                    )
                  )}
                </Tabs>
                <Divider mb="sm" size="sm" />
              </>
            )}
            <ProspectDetailsAccountResearch
              prospectId={data.main.prospect_info.details.id}
            />
            <ProspectDetailsNotes
              currentStatus={data.main.prospect_info.details.overall_status}
              prospectId={data.main.prospect_info.details.id}
            />
            <ProspectDetailsRemove
              prospectId={data.main.prospect_info.details.id}
              prospectStatus={data.main.prospect_info.details.overall_status}
            />
            {
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
