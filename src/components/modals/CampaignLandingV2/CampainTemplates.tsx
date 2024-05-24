import RichTextArea from "@common/library/RichTextArea";
import { Box, Button, Flex, NumberInput, Paper, Switch, Text } from "@mantine/core";
import { ContextModalProps } from "@mantine/modals";

export default function CampaignTemplatesModal({ innerProps, context, id }: ContextModalProps) {
  return (
    <Paper withBorder>
      <Flex direction={"column"}>
        <Flex p={"lg"} style={{ borderBottom: "1px solid #dee2e6" }}>
          <Text fw={600}>Mass Import Research</Text>
        </Flex>
        <Flex direction={"column"} p={"lg"} mt={"sm"} gap={"sm"} style={{ borderBottom: "1px solid #dee2e6" }} pb={70}>
          <Box>
            <Text size={"xs"} fw={500}>
              Raw Data
            </Text>
            <Text size={"xs"} fw={500} color="gray">
              Past in case studies, phrases, email templates, or others.
            </Text>
            <Box mt={4}>
              <RichTextArea height={200} />
            </Box>
          </Box>
          <Flex direction={"column"} gap={"sm"}>
            <Text size={"xs"} fw={500}>
              Asset Extraction (Optional)
            </Text>
            <Flex gap={"xl"} justify={"space-between"}>
              <Flex gap={"sm"} align={"center"} w={"100%"}>
                <Switch
                  labelPosition="left"
                  label={"Value Props"}
                  w={"100%"}
                  styles={{
                    root: {
                      border: "1px solid #D9DEE5",
                      padding: "7px",
                      borderRadius: "4px",
                    },
                    body: {
                      width: "100%",
                      display: "flex",
                      justifyContent: "space-between",
                    },
                  }}
                />
                <NumberInput w={200} placeholder="Amount" />
              </Flex>
              <Flex gap={"sm"} align={"center"} w={"100%"}>
                <Switch
                  labelPosition="left"
                  label={"Offers"}
                  w={"100%"}
                  styles={{
                    root: {
                      border: "1px solid #D9DEE5",
                      padding: "7px",
                      borderRadius: "4px",
                    },
                    body: {
                      width: "100%",
                      display: "flex",
                      justifyContent: "space-between",
                    },
                  }}
                />
                <NumberInput w={200} placeholder="Amount" />
              </Flex>
            </Flex>
            <Flex gap={"xl"} justify={"space-between"}>
              <Flex gap={"sm"} align={"center"} w={"100%"}>
                <Switch
                  labelPosition="left"
                  label={"Pain Points"}
                  w={"100%"}
                  styles={{
                    root: {
                      border: "1px solid #D9DEE5",
                      padding: "7px",
                      borderRadius: "4px",
                    },
                    body: {
                      width: "100%",
                      display: "flex",
                      justifyContent: "space-between",
                    },
                  }}
                />
                <NumberInput w={200} placeholder="Amount" />
              </Flex>
              <Flex gap={"sm"} align={"center"} w={"100%"}>
                <Switch
                  labelPosition="left"
                  label={"Social Proof"}
                  w={"100%"}
                  styles={{
                    root: {
                      border: "1px solid #D9DEE5",
                      padding: "7px",
                      borderRadius: "4px",
                    },
                    body: {
                      width: "100%",
                      display: "flex",
                      justifyContent: "space-between",
                    },
                  }}
                />
                <NumberInput w={200} placeholder="Amount" />
              </Flex>
            </Flex>
          </Flex>
        </Flex>
        <Flex justify={"end"} p={"lg"} gap={"lg"}>
          <Button variant="outline" color="gray" fullWidth onClick={() => context.closeModal(id)}>
            Go Back
          </Button>
          <Button fullWidth onClick={() => context.closeModal(id)}>
            Generate Assets
          </Button>
        </Flex>
      </Flex>
    </Paper>
  );
}
