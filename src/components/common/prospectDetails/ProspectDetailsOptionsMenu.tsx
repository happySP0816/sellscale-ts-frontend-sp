import { userTokenState } from "@atoms/userAtoms";
import { ActionIcon, Box, Menu, Popover, Text, Title } from "@mantine/core";
import {
  IconDots,
  IconTrash,
  IconAlarm,
  IconRobot,
  IconUserPlus,
} from "@tabler/icons";
import { QueryClient } from "@tanstack/react-query";
import displayNotification from "@utils/notificationFlow";
import { useRecoilState, useRecoilValue } from "recoil";
import { removeProspectFromContactList } from "./ProspectDetailsRemove";
import { snoozeProspect } from "@utils/requests/snoozeProspect";
import { Calendar, DatePicker } from "@mantine/dates";
import { useState } from "react";
import dayjs from "dayjs";
import { prospectDrawerOpenState } from "@atoms/prospectAtoms";
import { Tooltip } from "@mantine/core";
import { openedProspectIdState } from "@atoms/inboxAtoms";
import { patchProspectAIEnabled } from "@utils/requests/patchProspectAIEnabled";
import { showNotification } from "@mantine/notifications";
import { openContextModal } from "@mantine/modals";
export default function ProspectDetailsOptionsMenu(props: {
  prospectId: number;
  archetypeId: number;
  aiEnabled?: boolean;
  refetch: () => void;
}) {
  const userToken = useRecoilValue(userTokenState);
  const queryClient = new QueryClient();
  const [opened, setOpened] = useRecoilState(prospectDrawerOpenState);
  const [openedProspectId, setOpenedProspectId] = useRecoilState(
    openedProspectIdState
  );

  const [aiEnabled, setAIEnabled] = useState<boolean>(props.aiEnabled || true);

  const triggerAIEnableToggle = async () => {
    const result = await patchProspectAIEnabled(userToken, props.prospectId);

    if (result.status === "success") {
      showNotification({
        title: "Success",
        message: "AI Enabled status updated.",
        color: "green",
        autoClose: 3000,
      });
    } else {
      showNotification({
        title: "Error",
        message: "Something went wrong. Please try again later.",
        color: "red",
        autoClose: 5000,
      });
    }

    props.refetch();
  };

  return (
    <>
      {/* <Menu shadow="md" width={200} withArrow>
        <Menu.Target>
          <ActionIcon color="gray.8" radius="xl" variant="default">
            <IconDots size="1.125rem" />
          </ActionIcon>
        </Menu.Target> */}

        {/* <Menu.Dropdown>
          <Menu.Label>Settings</Menu.Label> */}

          {/* {props.aiEnabled !== undefined && (
            <Menu.Item
              icon={<IconRobot size={14} />}
              onClick={async () => {
                setAIEnabled(!aiEnabled);
                triggerAIEnableToggle();
              }}
            >
              {aiEnabled ? "Disable AI" : "Enable AI"}
            </Menu.Item> */}
          {/* )} */}

          {/* <Menu.Item
            icon={<IconUserPlus size={14} />}
            onClick={async () => {
              openContextModal({
                modal: "addProspect",
                title: <Title order={3}>Add Referred Prospect</Title>,
                innerProps: {
                  archetypeId: props.archetypeId,
                  sourceProspectId: props.prospectId,
                },
              });
            }}
          >
            Add Referred Prospect
          </Menu.Item> */}

          {/* TODO(Aakash) - Remove if not used after Jan 31, 2024 */}
          {/* <Menu.Item closeMenuOnClick={false} icon={<IconAlarm size={14} />}>
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
                <DatePicker
                  minDate={new Date()}
                  onChange={async (date) => {
                    if (!date) {
                      return;
                    }
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
                    location.reload();
                  }}
                />
              </Popover.Dropdown>
            </Popover>
          </Menu.Item> */}

          {/* TODO(Aakash) - remove if not needed after Jan 31, 2024 */}
          {/* <Menu.Item
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
          </Menu.Item> */}
        {/* </Menu.Dropdown>
      </Menu> */}
    </>
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

{
  /* <Popover
width={300}
trapFocus
position="right-start"
withArrow
shadow="md"
>
<Popover.Target>
  <Tooltip label='Snooze prospect' position='bottom'>
    <Box sx={{cursor: 'pointer'}} pt='xs'>
      <IconAlarm color='gray'/>
    </Box>
  </Tooltip>
</Popover.Target>
<Popover.Dropdown
  sx={(theme) => ({
    background:
      theme.colorScheme === "dark"
        ? theme.colors.dark[7]
        : theme.white,
  })}
>
  
</Popover.Dropdown>  
</Popover> */
}
