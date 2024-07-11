import CustomSelect from "@common/persona/ICPFilter/CustomSelect";
import { Accordion, Box, Button, Checkbox, Flex, Paper, ScrollArea, Select, Stack, Tabs, Text, Textarea } from "@mantine/core";
import { IconArrowRight } from "@tabler/icons";
import { useState } from "react";

export default function ICPRoutingCreateModal() {
  return (
    <Paper>
      <Textarea minRows={3} label="Describe your ICP:" placeholder="Eg. Product managers in chicago" />
      <Box mt={"sm"}>
        <Text size="sm" fw={600}>
          Attributes:
        </Text>
        <Paper withBorder radius={"sm"}>
          <Tabs defaultValue="account">
            <Tabs.List>
              <Tabs.Tab value="account">Account</Tabs.Tab>
              <Tabs.Tab value="company">Company</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="account">
              <ICPAccount />
            </Tabs.Panel>
            <Tabs.Panel value="company">Messages tab content</Tabs.Panel>
          </Tabs>
        </Paper>
      </Box>
      <Select mt={"sm"} data={[""]} placeholder="Select Segment" label="Route to segment:" />
      <Checkbox mt={"sm"} label="Send Slack notifications" />
      <Button mt={"lg"} rightIcon={<IconArrowRight size={"1rem"} />} variant="outline" fullWidth>
        Do an Example Test
      </Button>
      <Flex gap={"lg"} mt={"xl"}>
        <Button fullWidth variant="outline" color="gray">
          Cancel
        </Button>
        <Button fullWidth>Create ICP Routing</Button>
      </Flex>
    </Paper>
  );
}

const ICPAccount = () => {
  const [menu, setMenu] = useState(["Seniority", "Industry", "Skills", "Locations", "Bios & Job Descriptions", "Education", "Experience"]);
  const [included, setIncluded] = useState(["Option ONe", "Option Two"]);
  const [excluded, setExcluded] = useState([""]);

  return (
    <ScrollArea h={250}>
      <Stack spacing={"xs"} px={"lg"}>
        <Accordion
          defaultValue={"job"}
          mt={"sm"}
          styles={{
            control: {
              paddingTop: "3px",
              paddingBottom: "3px",
              paddingLeft: "0px",
              paddingRight: "0px",
            },
            content: {
              paddingLeft: "0px",
              paddingRight: "0px",
            },
          }}
        >
          <Accordion.Item value="job">
            <Accordion.Control>Job Title</Accordion.Control>
            <Accordion.Panel>
              <CustomSelect
                maxWidth="30vw"
                value={included}
                label="Included"
                placeholder="Select options"
                setValue={setIncluded}
                data={included}
                setData={setIncluded}
              />
              <CustomSelect
                maxWidth="30vw"
                value={excluded}
                label="Excluded"
                placeholder="Select options"
                setValue={setExcluded}
                data={excluded}
                setData={setExcluded}
              />
            </Accordion.Panel>
          </Accordion.Item>
          {menu.map((item, index) => {
            return (
              <Accordion.Item value={item.toLowerCase()}>
                <Accordion.Control>{item}</Accordion.Control>
                <Accordion.Panel>{item}</Accordion.Panel>
              </Accordion.Item>
            );
          })}
        </Accordion>
      </Stack>
    </ScrollArea>
  );
};
