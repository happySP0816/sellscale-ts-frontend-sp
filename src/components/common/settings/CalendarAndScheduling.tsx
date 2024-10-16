import {
  Card,
  Paper,
  TextInput,
  Input,
  Text,
  Title,
  ActionIcon,
  Flex,
  Button,
  LoadingOverlay,
  Notification,
  Select,
  Badge,
  Divider,
  Avatar,
  Anchor,
  Overlay,
  AspectRatio,
  Box,
  Stack,
  ScrollArea,
} from "@mantine/core";
import {
  IconCheck,
  IconCircleCheck,
  IconCopy,
  IconEdit,
  IconExternalLink,
  IconInfoCircle,
  IconLetterT,
  IconLink,
  IconPencil,
  IconPlus,
  IconX,
} from "@tabler/icons";
import { useEffect, useState } from "react";

import { patchSchedulingLink } from "@utils/requests/patchSchedulingLink";
import { useRecoilState, useRecoilValue } from "recoil";
import { userDataState, userTokenState } from "@atoms/userAtoms";
import { showNotification } from "@mantine/notifications";
import { API_URL } from "@constants/data";
import {
  IconCalendarShare,
  IconCircleCheckFilled,
  IconInfoHexagon,
  IconInfoTriangle,
  IconPointFilled,
} from "@tabler/icons-react";
import { DataGrid } from "mantine-data-grid";

const urlRegex: RegExp = /^(?:(?:https?|ftp):\/\/)?(?:www\.)?[a-z0-9\-]+(?:\.[a-z]{2,})+(?:\/[\w\-\.\?\=\&]*)*$/i;

const REDIRECT_URI = `https://app.sellscale.com/authcalendly`;
const CALENDLY_CLIENT_ID = "SfpOyr5Hq4QrjnZwoKtM0n_vOW_hZ6ppGpxHgmnW70U";

export default function CalendarAndScheduling() {
  const userToken = useRecoilValue(userTokenState);
  const [userData, setUserData] = useRecoilState(userDataState);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const [updated, setUpdated] = useState<boolean>(false);

  const [timeZone, setTimeZone] = useState<string>(userData.timezone);

  const [schedulingLink, setSchedulingLink] = useState<string>(
    userData.scheduling_link || ""
  );

  const [sdrSchedulingLinks, setSdrSchedulingLinks] = useState<{ label: string; value: string }[]>([
  ]);

  const get_all_sdr_scheduling_links = async () => {
    try {
      const response = await fetch(
        `${API_URL}/client/sdr/scheduling_links?all=true`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
        }
      );

      const result = await response.json();

      if (response) {
        setSdrSchedulingLinks(result.data);
        console.log('setting links to', result.data);

        setTeam(result.data.map((item: any) => ({
          fullname: item.label,
          avatar: "",
          job: "",
          id: item.id,
          calendar_link: item.value || null
        })));

      } else {
        setSdrSchedulingLinks([]);
      }
    } catch (error) {
      setSdrSchedulingLinks([]);
    }
  }

  useEffect(() => {
    get_all_sdr_scheduling_links();
    if (timeZone && timeZone !== userData.timezone) {
      (async () => {
        const response = await fetch(`${API_URL}/client/sdr/timezone`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            timezone: timeZone,
          }),
        });
        setUserData({ ...userData, timezone: timeZone });
        showNotification({
          id: "change-sdr-timezone",
          title: "Time Zone Updated",
          message: `Your time zone has been updated.`,
          color: "green",
          autoClose: 2000,
        });
      })();
    }
  }, [timeZone]);

  function handleUrlChange(event: React.ChangeEvent<HTMLInputElement>): void {
    const value = event.target.value;
    setSchedulingLink(value);

    if (value && !urlRegex.test(value)) {
      setError("Please enter a valid URL");
    } else {
      setError("");
    }
  }

  const triggerPatchSchedulingLink = async () => {
    setIsLoading(true);

    if (error) {
      showNotification({
        title: "Error",
        message: "Please enter a valid URL",
        color: "red",
        autoClose: 3000,
      });
      setIsLoading(false);
      return;
    } else if (!schedulingLink) {
      showNotification({
        title: "Error",
        message: "Please enter a URL",
        color: "red",
        autoClose: 3000,
      });
      setIsLoading(false);
      return;
    } else if (schedulingLink === userData.scheduling_link) {
      showNotification({
        title: "Error",
        message: "Please enter a different URL",
        color: "red",
        autoClose: 3000,
      });
      setIsLoading(false);
      return;
    }

    const response = await patchSchedulingLink(userToken, schedulingLink);
    setIsLoading(false);

    if (response.status === "success") {
      showNotification({
        title: "Success",
        message: "Scheduling link updated successfully",
        color: "teal",
        autoClose: 3000,
      });
      setUserData({ ...userData, scheduling_link: schedulingLink });
      setUpdated(true);
      setIsEditing(false);
    } else {
      showNotification({
        title: "Error",
        message:
          "Could not update scheduling link, please try again or contact support",
        color: "red",
        autoClose: 3000,
      });
    }
  };

  const [team, setTeam] = useState([
  ]);

  return (
    <Paper withBorder m="xs" p="md" radius="md">
      <Card mt="md" padding="lg" radius="md" withBorder>
        <LoadingOverlay visible={isLoading} />
        <Flex gap={4} align={"center"}>
          <Text fz="lg" fw="bold">
            Scheduling Link
          </Text>
          {updated && <IconCircleCheck color="green" size={"1.2rem"} />}
        </Flex>
        <Text mt="sm" fz="sm">
          Whenever SellScale AI detects a high propensity prospect who is
          interested in scheduling a time with you, the AI will use this link to
          book on your calendar. Needs to be a valid URL (Calendly, Chron,
          Hubspot, etc).
        </Text>
        <Divider mt={"sm"} />
        <Flex align={"end"} gap={"sm"} justify={"space-between"} w={"100%"}>
          <Input.Wrapper
            label={
              <Text color="gray" tt={"uppercase"}>
                calendar link
              </Text>
            }
            error={error}
            mt="sm"
            w={"100%"}
          >
            <Input
              placeholder="https://calendly.com/yourname"
              value={schedulingLink}
              disabled={!isEditing}
              onChange={handleUrlChange}
              rightSection={<IconCopy size={"1rem"} />}
              // withAsterisk
            />
          </Input.Wrapper>
          <Button
            leftIcon={<IconPencil size={"0.9rem"} />}
            onClick={() => setIsEditing(true)}
          >
            Edit
          </Button>
        </Flex>
        {/* {!isEditing && (
          <Flex justify='flex-end' mt='xs'>
            <ActionIcon color='dark' variant='transparent' onClick={() => setIsEditing(true)}>
              <IconEdit size='1.125rem' />
            </ActionIcon>
          </Flex>
          )} */}

        {isEditing && (
          <Flex justify="space-between" mt="sm">
            <Button
              variant="light"
              color="red"
              onClick={() => {
                setIsEditing(false);
                setError("");
                setSchedulingLink(userData.scheduling_link || "");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="light"
              color="green"
              onClick={triggerPatchSchedulingLink}
            >
              Save
            </Button>
          </Flex>
        )}
        <Flex direction={"column"} gap={2} mt={"sm"}>
          <Text color="gray" tt={"uppercase"}>
            example message
          </Text>
          <Flex
            style={{ border: "1px solid #dee2e6", borderRadius: "8px" }}
            align={"center"}
            justify={"center"}
          >
            <Box pos="relative">
              <LoadingOverlay
                visible={!userData.scheduling_link}
                zIndex={1000}
                overlayBlur={2}
                loader={
                  <Notification
                    withCloseButton={false}
                    icon={<IconInfoTriangle size="0.8rem" />}
                    title="Scheduling link is not set"
                    color="red"
                    withBorder
                    bg={"#fff6f5"}
                    style={{ border: "1px solid #f9c5c4" }}
                    w={"fit-content"}
                    fw={500}
                  >
                    <Text size={"xs"}>
                      Integrate Calendar to schedule meetings using SellScale
                      AI.
                    </Text>
                  </Notification>
                }
              />
              <Flex p={"sm"} gap={"sm"}>
                <Avatar src={userData.img_url} radius={"xl"} size={"lg"} />
                <Flex direction={"column"} gap={"sm"}>
                  <Text
                    fw={"700"}
                    size={"sm"}
                    style={{ display: "flex", gap: 5, alignItems: "center" }}
                  >
                    {userData.sdr_name}
                    <Text color="gray" fw={500}>
                      <IconPointFilled
                        size={"0.5rem"}
                        style={{ marginRight: "5" }}
                      />
                      {"5:04 PM"}
                    </Text>
                  </Text>
                  <Text size={"sm"} color="gray" fw={500}>
                    {"Hi Brandon"}
                  </Text>
                  <Text size={"sm"} color="gray" fw={500}>
                    {
                      "Hope you're doing great! Just wanted to quickly check in and see if you might have a few minutes to chat about some cool stuff we're working on."
                    }
                  </Text>
                  <Text
                    size={"sm"}
                    style={{ display: "flex", gap: 5 }}
                    color="gray"
                    fw={500}
                  >
                    You can pick a time that works for your here:{" "}
                    <Anchor
                      href={userData.scheduling_link}
                      target="_blank"
                      fw={500}
                    >
                      {userData.scheduling_link}
                    </Anchor>
                  </Text>
                  <Text size={"sm"} color="gray" fw={500}>
                    Looking forward to it!
                  </Text>
                </Flex>
              </Flex>
            </Box>
          </Flex>
        </Flex>
      </Card>
      <Card mt="md" padding="lg" radius="md" withBorder bg={"#fcfcfd"}>
        <Flex align={"center"} justify={"space-between"}>
          <Box>
            <Title order={3}>Teamwide Calendar Integration</Title>
            <Text mt="sm" fz="sm">
              Add your team's calendars to refernece when scheduling, or have
              the AI pull a certain rep's time
            </Text>
          </Box>
          {/* <Button leftIcon={<IconPlus size={"0.9rem"} />}>Add New</Button> */}
        </Flex>
        <ScrollArea h={300}>
        <DataGrid
          data={[...team.filter((member: { id: string }) => member.id.toString() === userData.id.toString()), ...team.filter((member: { id: string }) => member.id.toString() !== userData.id.toString())]}
          mt={"sm"}
          withBorder
          withColumnBorders
          columns={[
            {
              accessorKey: "name",
              header: () => (
                <Flex align={"center"} gap={"3px"}>
                  <IconLetterT color="gray" size={"0.9rem"} />
                  <Text color="gray">Name</Text>
                </Flex>
              ),
              maxSize: 250,
              minSize: 250,
              cell: (cell) => {
                const { avatar, fullname }: any = cell.row.original;

                return (
                  <Flex gap={"xs"} w={"100%"} h={"100%"} align={"center"}>
                    <Avatar src={avatar} size={"md"} radius={"xl"} />
                    <Text fw={500}>{fullname}</Text>
                  </Flex>
                );
              },
            },
            // {
            //   accessorKey: "title",
            //   maxSize: 250,
            //   minSize: 250,
            //   header: () => (
            //     <Flex align={"center"} gap={"3px"}>
            //       <IconLetterT color="gray" size={"0.9rem"} />
            //       <Text color="gray">Title</Text>
            //     </Flex>
            //   ),

            //   enableResizing: true,
            //   cell: (cell) => {
            //     const { job } = cell.row.original;

            //     return (
            //       <Flex align={"center"} gap={"xs"} w={"100%"} h={"100%"}>
            //         <Text fw={500}>{job}</Text>
            //       </Flex>
            //     );
            //   },
            // },
            {
              accessorKey: "calendar",
              header: () => (
                <Flex align={"center"} gap={"3px"}>
                  <IconLink color="gray" size={"0.9rem"} />
                  <Text color="gray">Calendar Link</Text>
                </Flex>
              ),
              cell: (cell) => {
                const { calendar_link, id } = cell.row.original;
                const [isEditing, setIsEditing] = useState(false);
                const [newCalendarLink, setNewCalendarLink] = useState<string>(calendar_link);

                const handleEditClick = async () => {
                  if (isEditing) {
                    try {
                      const response = await fetch(`${API_URL}/client/sdr/update_calendar`, {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                          Authorization: `Bearer ${userToken}`,
                        },
                        body: JSON.stringify({
                          sdr_id: id,
                          calendar_link: newCalendarLink,
                        }),
                      });

                      if (response.ok) {
                        showNotification({
                          title: "Success",
                          message: "Calendar link updated successfully",
                          color: "teal",
                          autoClose: 3000,
                        });
                        setTeam((prev: Array<{ id: string; calendar_link: string }>) =>
                          prev.map((item) => {
                            if (item.id === id) {
                              return { ...item, calendar_link: newCalendarLink };
                            }
                            return item;
                          }) as never[] );
                     
                        

                      } else {
                        throw new Error("Failed to update calendar link");
                      }
                    } catch (error : any) {
                      showNotification({
                        title: "Error",
                        message: error.message,
                        color: "red",
                        autoClose: 3000,
                      });
                    }
                  }
                  setIsEditing(!isEditing);
                };

                return (
                  <Flex
                    gap={"xs"}
                    w={"100%"}
                    h={"100%"}
                    align={"center"}
                    justify={"space-between"}
                  >
                    <Flex align={"center"} justify={"space-between"} w={"100%"}>
                      {isEditing ? (
                        <Input
                          value={newCalendarLink}
                          onChange={(e) => setNewCalendarLink(() => e.target.value)}
                          w={"100%"}
                        />
                      ) : (
                        <Text fw={500} lineClamp={2} >
                          {calendar_link}
                        </Text>
                      )}
                      <ActionIcon onClick={handleEditClick}>
                        {isEditing ? <IconCheck size={"1rem"} /> : <IconEdit size={"1rem"} />}
                      </ActionIcon>
                    </Flex>
                  </Flex>
                );
              },
            },
          ]}
          styles={{
            dataCellContent: {
              marginBlock: "auto",
              width: "100%",
            },
          }}
        />
        </ScrollArea>
        {/* <Stack spacing={"sm"} mt={"sm"}>
          {team.map((item, index) => {
            return (
              <Box key={index}>
                <Flex align={"center"} gap={"sm"}>
                  <Avatar radius={"xl"} size={50} />
                  <Box>
                    <Text size={"lg"} fw={600}>
                      {item.fullname}
                    </Text>
                    <Text size={"sm"} fw={500} color="gray">
                      {item.job}
                    </Text>
                  </Box>
                </Flex>
                <Flex gap={"sm"} my={"xs"} align={"end"}>
                  <TextInput label="CALENDAR_LINK:" placeholder={item.calendar_link} w={"100%"} />
                  <Button leftIcon={<IconEdit size={"0.9rem"} />}>Edit</Button>
                </Flex>
                {index < team.length - 1 && <Divider mt={"md"} />}
              </Box>
            );
          })}
        </Stack> */}
      </Card>
      {/* <Card>
        <Text fz='lg' fw='bold'>
          Calendly Integration
        </Text>
        <Text my='sm' fz='sm'>
          Using Calendly, SellScale AI will automatically book meetings on your calendar.
        </Text>
        {userData.calendly_connected ? (
          <Badge size='xl' variant='filled' color='blue' styles={{ root: { textTransform: 'initial' } }}>
            Calendly Connected
          </Badge>
        ) : (
          <Button
            w={300}
            mx='auto'
            component='a'
            target='_blank'
            rel='noopener noreferrer'
            href={`https://auth.calendly.com/oauth/authorize?client_id=${CALENDLY_CLIENT_ID}&response_type=code&redirect_uri=${REDIRECT_URI}`}
            my={20}
            variant='outline'
            size='md'
            color='blue'
            rightIcon={<IconCalendarShare size='1rem' />}
          >
            Connect to Calendly
          </Button>
        )}
      </Card> */}

      <Card>
        <Text fz="lg" fw="bold">
          Time Zone
        </Text>
        <Text mt="sm" fz="sm">
          This time zone should be set to the time zone for the majority of your
          prospects.
        </Text>
        <Select
          mt="md"
          withinPortal
          /* @ts-ignore */
          data={Intl.supportedValuesOf("timeZone")}
          placeholder={Intl.DateTimeFormat().resolvedOptions().timeZone}
          searchable
          clearable
          nothingFound="Time zone not found"
          value={timeZone}
          onChange={(value) => setTimeZone(value as string)}
        />
      </Card>
    </Paper>
  );
}
