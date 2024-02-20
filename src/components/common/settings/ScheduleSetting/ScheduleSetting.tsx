import {
  Checkbox,
  Divider,
  Flex,
  Grid,
  Group,
  NumberInput,
  Paper,
  Select,
  Stack,
  Title,
  rem,
  Text,
  Button,
  LoadingOverlay,
  useMantineTheme,
} from "@mantine/core";
import { useEffect, useRef, useState } from "react";
import { timezones } from "./ScheduleSetting.constants";
import { TimeInput } from "@mantine/dates";
import { IconClock } from "@tabler/icons";
import { userDataState, userTokenState } from "@atoms/userAtoms";
import { useRecoilState, useRecoilValue } from "recoil";
import { patchSendSchedule } from "@utils/requests/patchSendSchedule";
import { showNotification } from "@mantine/notifications";

const ScheduleSetting = () => {
  const [userData, setUserData] = useRecoilState(userDataState);
  const userToken = useRecoilValue(userTokenState);
  const [loading, setLoading] = useState(false);

  const [timeZone, setTimeZone] = useState<null | string>(
    userData.timezone || "America/Los_Angeles"
  );
  const [selectedDays, setSelectedDays] = useState<string[]>(["5"]);
  const fromTime = useRef<HTMLInputElement>(null);
  const toTime = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!userData) return;

    if (userData.timezone) {
      for (let i = 0; i < timezones.length; i++) {
        if (timezones[i].utc.includes(userData.timezone)) {
          setTimeZone(timezones[i].utc[0]);
          break;
        }
      }
    }

    // Calculate selected days
    setSelectedDays(
      (userData?.emails &&
        userData?.emails[0]?.send_schedule?.days.map(String)) || [
        "0",
        "1",
        "2",
        "3",
        "4",
      ]
    );
  }, []);

  const triggerPatchSendSchedule = async () => {
    if (!userToken) return;
    setLoading(true);

    // Convert the timezone into UTC
    const utc = timezones.find((tz) => tz.value === timeZone)?.utc[0] || null;

    // Convert the selected days into numbers
    const days = selectedDays.map(Number);

    // Remove the seconds from the time
    let start_time = fromTime.current?.value as string;
    let end_time = toTime.current?.value as string;
    if (fromTime.current?.value && fromTime.current?.value.length > 5) {
      start_time = fromTime.current?.value?.slice(0, -3) as string;
    }
    if (toTime.current?.value && toTime.current?.value.length > 5) {
      end_time = toTime.current?.value?.slice(0, -3) as string;
    }

    const result = await patchSendSchedule(
      userToken,
      utc,
      days,
      start_time,
      end_time
    );
    if (result.status === "success") {
      showNotification({
        title: "Success",
        message: "Schedule updated",
        color: "green",
      });
      setUserData({
        ...userData,
        emails: [
          {
            ...userData.emails[0],
            send_schedule: {
              ...userData.emails[0].send_schedule,
              time_zone: utc,
              days,
              start_time: fromTime.current?.value as string,
              end_time: toTime.current?.value as string,
            },
          },
        ],
      });
    } else {
      showNotification({
        title: "Error",
        message: "Schedule could not be updated",
        color: "red",
      });
    }

    setLoading(false);
  };
  const theme = useMantineTheme();

  return (
    <Paper withBorder m="xs" p="md" radius="md" bg={"gray.0"}>
      <Title order={4}>Email Sending Settings</Title>

      <Text color="gray.6" mt={"xs"}>
        Emails will be sent out on the following days and times.
      </Text>
      {userData?.timezone && (
        <Text color="gray.9" mt={"xs"}>
          Email send times will match your LinkedIn send times at: {" "}
          <span
            style={{
              whiteSpace: "nowrap",
              fontFamily: "monospace",
              backgroundColor: "#f4f4f4",
              padding: "0.2em 0.4em",
              borderRadius: "4px",
              fontSize: "0.9em",
              color: "red",
            }}
          >
            <IconClock size="0.8rem" /> {userData.timezone}
          </span>
          .
        </Text>
      )}

      <Divider my={"sm"} />

      <Stack mt={"xs"}>
        <Grid gutter={"xl"}>
          <Grid.Col lg={6}>
            <Flex gap={"xs"} align={"end"} wrap={"wrap"}>
              <TimeInput
                rightSection={<IconClock />}
                label="From"
                style={{ flex: 1 }}
                styles={(theme) => ({
                  label: {
                    fontWeight: 500,
                    color: theme.colors.gray[6],
                  },
                })}
                ref={fromTime}
                defaultValue={
                  (userData?.emails &&
                    userData?.emails[0]?.send_schedule?.start_time) ||
                  "09:00"
                }
                disabled
              />
              <Divider w={10} size={"lg"} mb={15} />
              <TimeInput
                rightSection={<IconClock />}
                label="To"
                style={{ flex: 1 }}
                styles={(theme) => ({
                  label: {
                    fontWeight: 500,
                    color: theme.colors.gray[6],
                  },
                })}
                ref={toTime}
                defaultValue={
                  (userData?.emails &&
                    userData?.emails[0]?.send_schedule?.end_time) ||
                  "17:00"
                }
                disabled
              />
            </Flex>
          </Grid.Col>

          <Grid.Col lg={6}>
            <Select
              searchable
              styles={{
                label: {
                  fontWeight: 500,
                  fontSize: rem(16),
                  color: theme.colors.gray[6],
                },
              }}
              label="Time Zone"
              value={timeZone}
              onChange={(value) => {
                setTimeZone(value);
              }}
              data={timezones.map((timezone) => ({
                label: timezone.text,
                value: timezone.utc[0],
              }))}
              disabled
            />
          </Grid.Col>
        </Grid>

        <Checkbox.Group
          label="Days"
          styles={{
            label: {
              fontWeight: 600,
              fontSize: rem(18),
              marginBottom: rem(16),
              color: theme.colors.gray[6],
            },
          }}
          value={selectedDays || []}
          onChange={(value) => {
            setSelectedDays(value);
          }}
        >
          <Group position="left">
            <Checkbox
              styles={{ label: { fontWeight: 500, fontSize: rem(14) } }}
              value="6"
              label="Sunday"
              disabled
            />
            <Checkbox
              styles={{ label: { fontWeight: 500, fontSize: rem(14) } }}
              value="0"
              label="Monday"
              disabled
            />
            <Checkbox
              styles={{ label: { fontWeight: 500, fontSize: rem(14) } }}
              value="1"
              label="Tuesday"
              disabled
            />
            <Checkbox
              styles={{ label: { fontWeight: 500, fontSize: rem(14) } }}
              value="2"
              label="Wednesday"
              disabled
            />
            <Checkbox
              styles={{ label: { fontWeight: 500, fontSize: rem(14) } }}
              value="3"
              label="Thursday"
              disabled
            />
            <Checkbox
              styles={{ label: { fontWeight: 500, fontSize: rem(14) } }}
              value="4"
              label="Friday"
              disabled
            />
            <Checkbox
              styles={{ label: { fontWeight: 500, fontSize: rem(14) } }}
              value="5"
              label="Saturday"
              disabled
            />
          </Group>
        </Checkbox.Group>

        <Button
          variant="light"
          color="blue"
          radius="md"
          loading={loading}
          onClick={triggerPatchSendSchedule}
          disabled
        >
          Save
        </Button>
      </Stack>
    </Paper>
  );
};

export default ScheduleSetting;
