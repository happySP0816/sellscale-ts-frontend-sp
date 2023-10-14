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
  const [userData, setUserData] = useRecoilState(userDataState)
  const userToken = useRecoilValue(userTokenState)
  const [loading, setLoading] = useState(false)

  const [timeZone, setTimeZone] = useState<null | string>(null);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const fromTime = useRef<HTMLInputElement>(null);
  const toTime = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!userData) return

    // Calculate timezone
    const time_zone = userData?.emails && userData?.emails[0]?.send_schedule?.time_zone
    if (time_zone) {
      for (let i = 0; i < timezones.length; i++) {
        if (timezones[i].utc.includes(time_zone)) {
          setTimeZone(timezones[i].value)
          break;
        }
      }
    }

    // Calculate selected days
    setSelectedDays(userData?.emails && userData?.emails[0]?.send_schedule?.days.map(String))
  }, [userData])

  const triggerPatchSendSchedule = async () => {
    if (!userToken) return
    setLoading(true)

    // Convert the timezone into UTC
    const utc = timezones.find(tz => tz.value === timeZone)?.utc[0] || null

    // Convert the selected days into numbers
    const days = selectedDays.map(Number)

    // Remove the seconds from the time
    let start_time = fromTime.current?.value as string
    let end_time = toTime.current?.value as string
    if (fromTime.current?.value &&  fromTime.current?.value.length > 5) {
      start_time =  fromTime.current?.value?.slice(0, -3) as string
    }
    if (toTime.current?.value &&  toTime.current?.value.length > 5) {
      end_time =  toTime.current?.value?.slice(0, -3) as string
    }

    const result = await patchSendSchedule(
      userToken,
      utc,
      days,
      start_time,
      end_time
    )
    if (result.status === 'success') {
      showNotification({
        title: 'Success',
        message: 'Schedule updated',
        color: 'green',
      })
      setUserData(
        {
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
              }
            }
          ]
        }
      )
    } else {
      showNotification({
        title: 'Error',
        message: 'Schedule could not be updated',
        color: 'red',
      })
    }

    setLoading(false)
  }

  return (
    <Paper withBorder m="xs" p="md" radius="md">
      <Title order={4}>Email Sending Settings</Title>
      <Stack mt={"xs"}>
        <Select
          searchable
          styles={{
            label: {
              fontWeight: 500,
              fontSize: rem(16),
              marginBottom: rem(6),
            },
          }}
          label="Time Zone"
          value={timeZone}
          onChange={(value) => {
            setTimeZone(value)
          }}
          data={timezones.map((timezone) => ({
            label: timezone.text,
            value: timezone.value,
          }))}
        />

        <Divider mt={"xs"} />

        <Checkbox.Group
          label="Send these days"
          styles={{
            label: {
              fontWeight: 600,
              fontSize: rem(18),
              marginBottom: rem(16),
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
            />
            <Checkbox
              styles={{ label: { fontWeight: 500, fontSize: rem(14) } }}
              value="0"
              label="Monday"
            />
            <Checkbox
              styles={{ label: { fontWeight: 500, fontSize: rem(14) } }}
              value="1"
              label="Tuesday"
            />
            <Checkbox
              styles={{ label: { fontWeight: 500, fontSize: rem(14) } }}
              value="2"
              label="Wednesday"
            />
            <Checkbox
              styles={{ label: { fontWeight: 500, fontSize: rem(14) } }}
              value="3"
              label="Thursday"
            />
            <Checkbox
              styles={{ label: { fontWeight: 500, fontSize: rem(14) } }}
              value="4"
              label="Friday"
            />
            <Checkbox
              styles={{ label: { fontWeight: 500, fontSize: rem(14) } }}
              value="5"
              label="Saturday"
            />
          </Group>
        </Checkbox.Group>

        <Divider mt={"xs"} />

        <Text
          style={{
            fontWeight: 600,
            fontSize: rem(18),
          }}
        >
          Send these times
        </Text>
        <Grid gutter={"xl"}>
          <Grid.Col md={6}>
            <Flex gap={"xs"} align={"end"}>
              <TimeInput
                rightSection={<IconClock></IconClock>}
                label="From"
                style={{ flex: 1 }}
                styles={(theme) => ({
                  label: {
                    color: theme.colors.gray[6],
                  },
                })}
                ref={fromTime}
                defaultValue={userData?.emails && userData?.emails[0]?.send_schedule?.start_time}
              />
              <Divider w={10} size={"lg"} mb={15} />
              <TimeInput
                rightSection={<IconClock />}
                label="To"
                style={{ flex: 1 }}
                styles={(theme) => ({
                  label: {
                    color: theme.colors.gray[6],
                  },
                })}
                ref={toTime}
                defaultValue={userData?.emails && userData?.emails[0]?.send_schedule?.end_time}
              />
            </Flex>
          </Grid.Col>

        </Grid>
        <Button
          variant="light"
          color="blue"
          radius="md"
          loading={loading}
          onClick={triggerPatchSendSchedule}
        >
          Save
        </Button>
      </Stack>
    </Paper>
  );
};

export default ScheduleSetting;
