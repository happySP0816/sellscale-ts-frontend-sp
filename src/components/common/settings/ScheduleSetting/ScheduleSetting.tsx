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
} from "@mantine/core";
import { useState } from "react";
import { timezones } from "./ScheduleSetting.constants";
import { TimeInput } from "@mantine/dates";
import { IconClock } from "@tabler/icons";

const ScheduleSetting = () => {
  const [timeZone, setTimeZone] = useState<null | string>(null);

  return (
    <Paper withBorder m="xs" p="md" radius="md">
      <Title order={3}>Schedule Settings</Title>
      <Stack mt={"xs"}>
        <Select
          styles={{
            label: {
              fontWeight: 600,
              fontSize: rem(18),
              marginBottom: rem(16),
            },
          }}
          label="Choose Time Zone"
          value={timeZone}
          onChange={(value) => setTimeZone(value)}
          data={timezones.map((timezone) => ({
            label: timezone.text,
            value: timezone.value,
          }))}
        />

        <Divider my={"md"} />

        <Checkbox.Group
          defaultValue={["react"]}
          label="Send these days"
          styles={{
            label: {
              fontWeight: 600,
              fontSize: rem(18),
              marginBottom: rem(16),
            },
          }}
        >
          <Group position="apart">
            <Checkbox
              styles={{ label: { fontWeight: 500, fontSize: rem(14) } }}
              value="sunday"
              label="Sunday"
            />
            <Checkbox
              styles={{ label: { fontWeight: 500, fontSize: rem(14) } }}
              value="monday"
              label="Monday"
            />
            <Checkbox
              styles={{ label: { fontWeight: 500, fontSize: rem(14) } }}
              value="tuesday"
              label="Tuesday"
            />
            <Checkbox
              styles={{ label: { fontWeight: 500, fontSize: rem(14) } }}
              value="wednesday"
              label="Wednesday"
            />
            <Checkbox
              styles={{ label: { fontWeight: 500, fontSize: rem(14) } }}
              value="thursday"
              label="Thursday"
            />
            <Checkbox
              styles={{ label: { fontWeight: 500, fontSize: rem(14) } }}
              value="friday"
              label="Friday"
            />
            <Checkbox
              styles={{ label: { fontWeight: 500, fontSize: rem(14) } }}
              value="saturday"
              label="Saturday"
            />
          </Group>
        </Checkbox.Group>

        <Divider my={"md"} />

        <Text
          style={{
            fontWeight: 600,
            fontSize: rem(18),
          }}
        >
          Time Period Between Sequences
        </Text>

        <Grid gutter={"xl"}>
          <Grid.Col md={6}>
            <Flex gap={"sm"} align={"end"}>
              <TimeInput
                rightSection={<IconClock></IconClock>}
                label="From"
                style={{ flex: 1 }}
                styles={(theme) => ({
                  label: {
                    color: theme.colors.gray[6],
                  },
                })}
              />
              <Divider w={10} size={"lg"} mb={15} />
              <TimeInput
                rightSection={<IconClock></IconClock>}
                label="To"
                style={{ flex: 1 }}
                styles={(theme) => ({
                  label: {
                    color: theme.colors.gray[6],
                  },
                })}
              />
            </Flex>
          </Grid.Col>
          <Grid.Col md={6}>
            <NumberInput
              label="An email will be sent every"
              hideControls
              rightSection={<Text color="gray.6">minutes</Text>}
              styles={(theme) => ({
                label: {
                  color: theme.colors.gray[6],
                },
                rightSection: {
                  width: 100,
                },
              })}
            />
            <Text color="gray.6" size={"xs"} fw={600} mt={"xs"}>
              27 triggers will be sent / day / sender account
            </Text>
          </Grid.Col>
        </Grid>
      </Stack>
    </Paper>
  );
};

export default ScheduleSetting;
