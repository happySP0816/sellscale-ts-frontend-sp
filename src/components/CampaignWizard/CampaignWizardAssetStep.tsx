import { Avatar, Box, Button, Divider, Flex, NumberInput, Paper, Radio, Slider, Switch, Text, TextInput } from "@mantine/core";
import { IconArrowRight, IconBrandLinkedin, IconMailOpened, IconPoint, IconSearch, IconVectorBezierCircle } from "@tabler/icons";
import { IconDiabolo } from "@tabler/icons-react";
import RichTextArea from "@common/library/RichTextArea";

export default function CampaignWizardAssetStep() {
  return (
    <Paper>
      <Text size={"lg"} fw={600}>
        Messaging
      </Text>
      <Flex gap={"md"} mt={"lg"}>
        <Paper withBorder p={"lg"} display={"flex"} style={{ gap: "16px", flexDirection: "column" }}>
          <Text fw={600}>Attach Assets</Text>
          <TextInput variant="filled" placeholder="Search" icon={<IconSearch size={"0.9rem"} color="gray" />} />
          <Flex direction={"column"} gap={"xs"}>
            <Divider
              label={
                <Flex align={"center"}>
                  <IconPoint fill="#EB8231" color="white" size={"2rem"} className="mb-[2px]" />
                  <Text tt={"uppercase"}>case study</Text>
                </Flex>
              }
              labelPosition="left"
            />
            <Switch
              labelPosition="left"
              label={"43% pf SDRs turn out within the first year."}
              styles={{
                root: {
                  border: "1px solid #D9DEE5",
                  padding: "12px",
                  borderRadius: "4px",
                },
              }}
            />
            <Switch
              labelPosition="left"
              label={"43% pf SDRs turn out within the first year."}
              styles={{
                root: {
                  border: "1px solid #D9DEE5",
                  padding: "12px",
                  borderRadius: "4px",
                },
              }}
            />
          </Flex>
          <Flex direction={"column"} gap={"xs"}>
            <Divider
              label={
                <Flex align={"center"}>
                  <IconPoint fill="#3B85EF" color="white" size={"2rem"} className="mb-[2px]" />
                  <Text tt={"uppercase"}>value props</Text>
                </Flex>
              }
              labelPosition="left"
            />
            <Switch
              labelPosition="left"
              label={"43% pf SDRs turn out within the first year."}
              styles={{
                root: {
                  border: "1px solid #D9DEE5",
                  padding: "12px",
                  borderRadius: "4px",
                },
              }}
            />
            <Switch
              labelPosition="left"
              label={"43% pf SDRs turn out within the first year."}
              styles={{
                root: {
                  border: "1px solid #D9DEE5",
                  padding: "12px",
                  borderRadius: "4px",
                },
              }}
            />
          </Flex>
          <Flex direction={"column"} gap={"xs"}>
            <Divider
              label={
                <Flex align={"center"}>
                  <IconPoint fill="#E74B41" color="white" size={"2rem"} className="mb-[2px]" />
                  <Text tt={"uppercase"}>offers</Text>
                </Flex>
              }
              labelPosition="left"
            />
            <Switch
              labelPosition="left"
              label={"43% pf SDRs turn out within the first year."}
              styles={{
                root: {
                  border: "1px solid #D9DEE5",
                  padding: "12px",
                  borderRadius: "4px",
                },
              }}
            />
            <Switch
              labelPosition="left"
              label={"43% pf SDRs turn out within the first year."}
              styles={{
                root: {
                  border: "1px solid #D9DEE5",
                  padding: "12px",
                  borderRadius: "4px",
                },
              }}
            />
          </Flex>
        </Paper>
        <Paper withBorder p={"lg"} display={"flex"} style={{ gap: "16px", flexDirection: "column" }}>
          <Text fw={600}>Mass Import Research</Text>
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
              <Flex gap={"sm"} align={"center"}>
                <Switch
                  labelPosition="left"
                  label={"Value Props"}
                  miw={200}
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
                <NumberInput w={120} placeholder="Amount" />
              </Flex>
              <Flex gap={"sm"} align={"center"}>
                <Switch
                  labelPosition="left"
                  label={"Offers"}
                  miw={200}
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
                <NumberInput w={120} placeholder="Amount" />
              </Flex>
            </Flex>
            <Flex gap={"xl"} justify={"space-between"}>
              <Flex gap={"sm"} align={"center"}>
                <Switch
                  labelPosition="left"
                  label={"Pain Points"}
                  miw={200}
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
                <NumberInput w={120} placeholder="Amount" />
              </Flex>
              <Flex gap={"sm"} align={"center"}>
                <Switch
                  labelPosition="left"
                  label={"Social Proof"}
                  miw={200}
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
                <NumberInput w={120} placeholder="Amount" />
              </Flex>
            </Flex>
          </Flex>
          <Flex justify={"end"}>
            <Button rightIcon={<IconArrowRight size={"0.9rem"} />}>Generate Assets</Button>
          </Flex>
        </Paper>
      </Flex>
    </Paper>
  );
}
