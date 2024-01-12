import { Box, Card, Text, Flex, Badge, Stack, Button } from "@mantine/core";
import { IconAlertTriangle, IconExternalLink } from "@tabler/icons";
import { useDisclosure } from "@mantine/hooks";
import CampaignReviewModal from "./CampaignReviewModal/CampaignReviewModal";
import ChangeMessageModal from "./ChangeMessageModal";

const ChangeMessagePriority = () => {
  const [opened, { open, close, toggle }] = useDisclosure(false);

  return (
    <>
      <Box>
        <Card withBorder p={"sm"} py={"sm"}>
          <Flex justify={"space-between"}>
            <Text color="gray.6" fw={600} display={"inline-flex"}>
              Campaign &nbsp;
              <Text color="gray.8" fw={600} component="span">
                Software Engineers
              </Text>
            </Text>

            <Badge
              color="red"
              leftSection={
                <IconAlertTriangle size={"0.8rem"} style={{ marginTop: 4 }} />
              }
            >
              2 errors
            </Badge>
          </Flex>

          <Stack ml={"sm"} mt="sm">
            <Flex justify={"space-between"}>
              <Text color="gray.6" fw={600} display={"inline-flex"} size={"sm"}>
                Step 1: &nbsp;
                <Text color="gray.8" fw={600} component="span" size={"sm"}>
                  Invite Message
                </Text>
              </Text>

              <Flex gap={"xs"}>
                <Text
                  color="gray.6"
                  fw={600}
                  display={"inline-flex"}
                  size={"sm"}
                >
                  60/70 replies
                </Text>
                <Badge
                  color="red"
                  leftSection={
                    <IconAlertTriangle
                      size={"0.8rem"}
                      style={{ marginTop: 4 }}
                    />
                  }
                >
                  2 errors
                </Badge>
              </Flex>
            </Flex>

            <Flex justify={"space-between"}>
              <Text color="gray.6" fw={600} display={"inline-flex"} size={"sm"}>
                Step 1: &nbsp;
                <Text color="gray.8" fw={600} component="span" size={"sm"}>
                  Invite Message
                </Text>
              </Text>

              <Flex gap={"xs"}>
                <Text
                  color="gray.6"
                  fw={600}
                  display={"inline-flex"}
                  size={"sm"}
                >
                  60/70 replies
                </Text>
                <Badge
                  color="red"
                  leftSection={
                    <IconAlertTriangle
                      size={"0.8rem"}
                      style={{ marginTop: 4 }}
                    />
                  }
                >
                  2 errors
                </Badge>
              </Flex>
            </Flex>
          </Stack>
        </Card>
        <Flex mt={"md"} justify={"end"}>
          <Button
            onClick={toggle}
            rightIcon={<IconExternalLink size={"0.8rem"} />}
            size="sm"
            radius={"md"}
          >
            Fix Message
          </Button>
        </Flex>
      </Box>

      <ChangeMessageModal opened={opened} onClose={close} />
    </>
  );
};

export default ChangeMessagePriority;
