import RichTextArea from "@common/library/RichTextArea";
import CustomSelect from "@common/persona/ICPFilter/CustomSelect";
import {
  Box,
  Button,
  Center,
  Flex,
  NumberInput,
  Paper,
  SegmentedControl,
  Switch,
  Text,
  TextInput,
  Textarea,
} from "@mantine/core";
import { ContextModalProps } from "@mantine/modals";
import { IconBrandLinkedin, IconMailOpened } from "@tabler/icons";
import { useState } from "react";

export default function CampaignTemplatesModal({
  innerProps,
  context,
  id,
}: ContextModalProps) {
  const [type, setType] = useState("email");
  const [tags, setTags] = useState(["Intro", "Pain Based"]);

  return (
    <Paper>
      <Flex direction={"column"}>
        {/* <Flex p={"lg"} style={{ borderBottom: "1px solid #dee2e6" }}>
          <Text fw={600}>Mass Import Research</Text>
        </Flex> */}
        <Flex direction={"column"} mt={"sm"} gap={"sm"} pb={70}>
          <SegmentedControl
            value={type}
            onChange={(value: any) => {
              setType(value);
            }}
            data={[
              {
                value: "email",
                label: (
                  <Center style={{ gap: 10 }}>
                    <IconMailOpened
                      size={"1.2rem"}
                      fill="orange"
                      color="white"
                    />
                    <Text fw={500}>Email</Text>
                  </Center>
                ),
              },
              {
                value: "linkedin",
                label: (
                  <Center style={{ gap: 10 }}>
                    <IconBrandLinkedin
                      size={"1.4rem"}
                      fill="#3B85EF"
                      color="white"
                    />
                    <Text fw={500}>Linkedin</Text>
                  </Center>
                ),
              },
            ]}
          />
          <Box>
            <CustomSelect
              maxWidth="100%"
              value={tags}
              label="Add Tags"
              placeholder=""
              setValue={setTags}
              data={tags}
              setData={setTags}
            />
            <Text size={"sm"} color="gray" fw={500} mt={"md"}>
              Title
            </Text>
            <Box mt={4}>
              <TextInput placeholder="Title" />
            </Box>
            <Text size={"sm"} color="gray" fw={500} mt={"md"}>
              Template
            </Text>
            <Box mt={4}>
              {type == "email" ? (
                <RichTextArea></RichTextArea>
              ) : (
                <Textarea placeholder="Template" minRows={7} />
              )}
            </Box>
          </Box>
          {/* <Flex direction={"column"} gap={"sm"}>
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
          </Flex> */}
        </Flex>
        <Flex justify={"end"} gap={"lg"}>
          {/* <Button variant="outline" color="gray" fullWidth onClick={() => context.closeModal(id)}>
            Go Back
          </Button> */}
          {/* <Button fullWidth onClick={() => context.closeModal(id)}>
            Generate Assets
          </Button> */}
          <Button
            variant="outline"
            color="gray"
            fullWidth
            onClick={() => context.closeModal(id)}
          >
            Cancel
          </Button>
          <Button fullWidth onClick={() => context.closeModal(id)}>
            Create Template
          </Button>
        </Flex>
      </Flex>
    </Paper>
  );
}
