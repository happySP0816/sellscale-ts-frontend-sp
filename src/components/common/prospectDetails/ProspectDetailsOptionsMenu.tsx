import { userTokenState } from "@atoms/userAtoms";
import { ActionIcon, Menu, Popover, Text } from "@mantine/core";
import { IconDots, IconTrash, IconAlarm } from "@tabler/icons";
import { QueryClient } from "@tanstack/react-query";
import displayNotification from "@utils/notificationFlow";
import { useRecoilState, useRecoilValue } from "recoil";
import { removeProspectFromContactList } from "./ProspectDetailsRemove";
import { snoozeProspect } from "@utils/requests/snoozeProspect";
import { Calendar, DatePicker } from "@mantine/dates";
import { useState } from "react";
import dayjs from "dayjs";
import { prospectDrawerOpenState } from "@atoms/prospectAtoms";

export default function ProspectDetailsOptionsMenu(props: {
  prospectId: number;
}) {
  const userToken = useRecoilValue(userTokenState);
  const queryClient = new QueryClient();
  const [opened, setOpened] = useRecoilState(prospectDrawerOpenState);

  return (
    <Menu shadow="md" width={200}>
      <Menu.Target>
        <ActionIcon>
          <IconDots size="1.1rem" />
        </ActionIcon>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>Settings</Menu.Label>
        <Menu.Item closeMenuOnClick={false} icon={<IconAlarm size={14} />}>
          <Popover
            width={300}
            trapFocus
            position="right-start"
            withArrow
            shadow="md"
          >
            <Popover.Target>
              <Text>Snooze Outreach</Text>
            </Popover.Target>
            <Popover.Dropdown
              sx={(theme) => ({
                background:
                  theme.colorScheme === "dark"
                    ? theme.colors.dark[7]
                    : theme.white,
              })}
            >
              <Calendar
                minDate={new Date()}
                onDateChange={async (date) => {
                  if(!date){ return; }
                  let timeDiff = date.getTime() - new Date().getTime();
                  let daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
                  await displayNotification(
                    "snooze-prospect",
                    async () => {
                      let result = await snoozeProspect(
                        userToken,
                        props.prospectId,
                        daysDiff
                      );
                      return result;
                    },
                    {
                      title: `Snoozing prospect for ${daysDiff} days...`,
                      message: `Working with servers...`,
                      color: "teal",
                    },
                    {
                      title: `Snoozed!`,
                      message: `Your prospect has been snoozed from outreach for ${daysDiff} days.`,
                      color: "teal",
                    },
                    {
                      title: `Error while snoozing your prospect.`,
                      message: `Please try again later.`,
                      color: "red",
                    }
                  );
                  setOpened(false);
                }}
              />
            </Popover.Dropdown>
          </Popover>
        </Menu.Item>
        <Menu.Divider />

        <Menu.Label>Danger zone</Menu.Label>
        <Menu.Item
          color="red.4"
          icon={<IconTrash size={14} />}
          onClick={async () => {
            await displayNotification(
              "remove-prospect-from-contact-list",
              async () => {
                let result = await removeProspectFromContactList(
                  props.prospectId,
                  userToken
                );

                queryClient.invalidateQueries({
                  queryKey: [`query-prospect-details-${props.prospectId}`],
                });

                return result;
              },
              {
                title: `Removing prospect ...`,
                message: `Working with servers...`,
                color: "teal",
              },
              {
                title: `Removed!`,
                message: `Your prospect has been removed from your contact list.`,
                color: "teal",
              },
              {
                title: `Error while removing prospect from contact list.`,
                message: `Please try again later.`,
                color: "red",
              }
            );
          }}
        >
          Remove Prospect
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}

/* 


onClick={async () => {
          await displayNotification(
            "snooze-prospect",
            async () => {
              let result = await snoozeProspect(
                userToken,
                props.prospectId,
                4
              );

              return result;
            },
            {
              title: `Snoozing prospect ...`,
              message: `Working with servers...`,
              color: "teal",
            },
            {
              title: `Snoozed!`,
              message: `Your prospect has been snoozed from outreach.`,
              color: "teal",
            },
            {
              title: `Error while snoozing your prospect.`,
              message: `Please try again later.`,
              color: "red",
            }
          );
        }}


*/
