import { ActionIcon, Avatar, Box, Button, Checkbox, Flex, Paper, ScrollArea, Text, Textarea } from "@mantine/core";
import { IconBuilding, IconEdit, IconPlus, IconPoint } from "@tabler/icons";

export default function CampaignPersonalizersModal() {
  return (
    <>
      <Paper withBorder w={"100%"}>
        <Box p={"lg"} style={{ borderBottom: "1px solid #dee2e6" }}>
          <Text size={"lg"} fw={600}>
            Example Contact
          </Text>
          <Flex justify={"space-between"} style={{ border: "1px solid #3B85EF", borderRadius: "6px", padding: "12px" }}>
            <Box>
              <Flex gap={10}>
                <Avatar src={""} size={"xl"} radius={"100%"} />
                <Box>
                  <Text fw={600} size={"xl"}>
                    {"Aaron Cessar"}
                  </Text>
                  <Text fw={400} size={"xs"}>
                    {"Founding Software Engineer @ SellScale"}
                  </Text>
                  <Text fw={400} color="gray" size={"xs"}>
                    {"San Francisco, CA"}
                  </Text>
                  <Flex gap={3} align={"center"} mt={4}>
                    <IconBuilding size={"0.9rem"} color="gray" />
                    <Text fw={400} color="gray" size={"xs"}>
                      {"SellScale, Wanderer's Guide, and 7 more"}
                    </Text>
                  </Flex>
                </Box>
              </Flex>
            </Box>
            <ActionIcon>
              <IconEdit />
            </ActionIcon>
          </Flex>
        </Box>
        <ScrollArea h={400} scrollbarSize={8} mt={"sm"}>
          <Box p={"lg"}>
            <Text size={"lg"} fw={600}>
              Personalizations
            </Text>
            <Box mt={"xs"}>
              <Flex align={"center"} gap={4}>
                <IconPoint size={"2rem"} fill="#3B85EF" color="white" className="ml-[-8px]" />
                <Text size={"sm"} fw={500} color="#3B85EF">
                  Account Research
                </Text>
              </Flex>
              <Paper withBorder p={"xs"}>
                <Checkbox label="Are they hiring for SDRs on any job boards?" />
                <Textarea mt={"sm"} label="Explain how this is relevant:" placeholder="Job boards mean they need more top of funnel." minRows={3} />
              </Paper>
              <Checkbox
                label="Does their website mention anything about a login button?"
                styles={{
                  root: {
                    border: "1px solid #dee2e6",
                    borderRadius: "4px",
                    paddingInline: "12px",
                    paddingBlock: "8px",
                  },
                }}
                mt={"sm"}
              />
              <Button
                mt={"sm"}
                leftIcon={<IconPlus size={"0.9rem"} />}
                w={"100%"}
                variant="outline"
                styles={{
                  root: {
                    display: "flex",
                    justifyContent: "start",
                  },
                }}
              >
                Add research point
              </Button>
            </Box>
            <Box mt={"xs"}>
              <Flex align={"center"} gap={4}>
                <IconPoint size={"2rem"} fill="#17b26a" color="white" className="ml-[-8px]" />
                <Text size={"sm"} fw={500} color="#17b26a">
                  Account Level Personalization
                </Text>
              </Flex>
              <Checkbox.Group>
                <Flex direction={"column"} gap={"sm"}>
                  <Checkbox
                    value="company_news"
                    label="Company News"
                    styles={{
                      root: {
                        border: "1px solid #dee2e6",
                        borderRadius: "4px",
                        paddingInline: "12px",
                        paddingBlock: "8px",
                      },
                    }}
                  />
                  <Checkbox
                    value="company_tools"
                    label="Company Tools"
                    styles={{
                      root: {
                        border: "1px solid #dee2e6",
                        borderRadius: "4px",
                        paddingInline: "12px",
                        paddingBlock: "8px",
                      },
                    }}
                  />
                  <Checkbox
                    value="company_website"
                    label="Company Websit"
                    styles={{
                      root: {
                        border: "1px solid #dee2e6",
                        borderRadius: "4px",
                        paddingInline: "12px",
                        paddingBlock: "8px",
                      },
                    }}
                  />
                </Flex>
              </Checkbox.Group>
            </Box>
            <Box mt={"xs"}>
              <Flex align={"center"} gap={4}>
                <IconPoint size={"2rem"} fill="#d444f1" color="white" className="ml-[-8px]" />
                <Text size={"sm"} fw={500} color="#d444f1">
                  Prospect Level Personalization
                </Text>
              </Flex>
              <Paper withBorder p={"xs"}>
                <Checkbox label="Linkedin Bio" />
                <Textarea
                  mt={"sm"}
                  label="Explain how this is relevant:"
                  placeholder="For eg. `If bio mentions data, that means they're likely involved in data pipelines`"
                  minRows={3}
                />
              </Paper>
              <Checkbox
                label="Linkedin Current Experience"
                styles={{
                  root: {
                    border: "1px solid #dee2e6",
                    borderRadius: "4px",
                    paddingInline: "12px",
                    paddingBlock: "8px",
                  },
                }}
                mt={"sm"}
              />
            </Box>
          </Box>
        </ScrollArea>
      </Paper>
      <Flex gap={"md"} mt={"md"}>
        <Button fullWidth variant="outline" color="gray">
          Go Back
        </Button>
        <Button fullWidth>Save</Button>
      </Flex>
    </>
  );
}
