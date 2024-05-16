import { Avatar, Divider, Flex, Paper, Radio, Slider, Switch, Text, TextInput } from "@mantine/core";
import { IconBrandLinkedin, IconMailOpened, IconPoint, IconVectorBezierCircle } from "@tabler/icons";
import { IconDiabolo } from "@tabler/icons-react";

export default function CampaignWizardSetupStep() {
  return (
    <Paper display={"flex"} style={{ gap: "24px", flexDirection: "column" }} p={"xs"}>
      <Flex align={"center"} justify={"space-between"}>
        <Text size={"lg"} fw={600}>
          Campaign Setup
        </Text>
        <Paper withBorder display={"flex"} style={{ gap: "24px", alignItems: "center" }} px={"xs"} py={5}>
          <Flex align={"center"} gap={3}>
            <Text color="gray" fw={500} size={"sm"}>
              Rep:
            </Text>
            <Avatar src={""} radius={"xl"} size={"sm"} />
            <Text fw={500} size={"sm"}>
              {"David Wei"}
            </Text>
          </Flex>
          <Divider orientation="vertical" h={"24px"} my={"auto"} />
          <Flex align={"center"}>
            <IconPoint fill="#17B26A" color="white" size={"2rem"} className="mb-[2px]" />
            <Text size={"sm"} fw={500} color="green">
              {2} Active Campaigns
            </Text>
          </Flex>
        </Paper>
      </Flex>
      <TextInput label="Campaign Name" placeholder="Eg. Product managers in chicago" />
      <Radio.Group label="Sequence:">
        <Flex gap={"sm"}>
          <Radio
            value="omnichannel"
            label={
              <Flex gap={3} align={"center"}>
                <IconVectorBezierCircle size={"0.9rem"} color="#17B26A" fill="white" />
                <Text fw={400} size={"sm"}>
                  Omnichannel
                </Text>
              </Flex>
            }
            size="xs"
            styles={{
              root: {
                border: "1px solid #D9DEE5",
                padding: "5px 10px",
                borderRadius: "4px",
              },
              inner: {
                marginTop: "2px",
                marginBottom: "2px",
              },
            }}
            w={"100%"}
          />
          <Radio
            value="svelte"
            label={
              <Flex gap={3} align={"center"}>
                <IconBrandLinkedin size={"1.1rem"} color="white" fill="#3B85EF" />
                <Text fw={400} size={"sm"}>
                  Linkedin Only
                </Text>
              </Flex>
            }
            size="xs"
            styles={{
              root: {
                border: "1px solid #D9DEE5",
                padding: "5px 10px",
                borderRadius: "4px",
              },
              inner: {
                marginTop: "2px",
                marginBottom: "2px",
              },
            }}
            w={"100%"}
          />
          <Radio
            value="ng"
            label={
              <Flex gap={3} align={"center"}>
                <IconMailOpened size={"1.1rem"} fill="orange" color="white" />
                <Text fw={400} size={"sm"}>
                  Email Only
                </Text>
              </Flex>
            }
            size="xs"
            styles={{
              root: {
                border: "1px solid #D9DEE5",
                padding: "5px 10px",
                borderRadius: "4px",
              },
              inner: {
                marginTop: "2px",
                marginBottom: "2px",
              },
            }}
            w={"100%"}
          />
          <Radio
            value="vue"
            label={
              <Flex gap={3} align={"center"}>
                <IconDiabolo size={"0.9rem"} />
                <Text fw={400} size={"sm"}>
                  Voice Only
                </Text>
              </Flex>
            }
            size="xs"
            styles={{
              root: {
                border: "1px solid #D9DEE5",
                padding: "5px 10px",
                borderRadius: "4px",
              },
              inner: {
                marginTop: "2px",
                marginBottom: "2px",
              },
            }}
            w={"100%"}
          />
        </Flex>
      </Radio.Group>
      <Switch labelPosition="left" label="Cycle:" />
      <TextInput
        label="Placing a campaign in this cycle will allow the AI to learn for it next week."
        disabled
        icon={
          <Flex align="center" gap={3}>
            <Text color="gray" weight={400} size={"sm"}>
              {"Cycle 1 -"}
            </Text>
            <Text weight={400} color="black" size={"sm"}>
              Week of 05/14
            </Text>
          </Flex>
        }
        styles={{
          icon: {
            width: "100%",
            justifyContent: "start",
            paddingInlineStart: "12px",
          },
        }}
      />
      <Flex direction={"column"} gap={4}>
        <Text size={"sm"} fw={500}>
          Testing volume per cycle:
        </Text>
        <Text size={"sm"} fw={500} color="gray">
          SellScale will create batches so you don't burn your ICP.
        </Text>
        <Slider
          color="blue"
          marks={[
            { value: 1, label: "1" },
            { value: 30, label: "200/ week(Email)" },
            { value: 70, label: "MAX (DISTRIBUTE)" },
          ]}
        />
      </Flex>
    </Paper>
  );
}
