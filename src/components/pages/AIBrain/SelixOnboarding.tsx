import { Box, Button, Center, Divider, Flex, Paper, Stack, Text, Textarea, TextInput, ThemeIcon } from "@mantine/core";
import { IconPoint, IconRefresh, IconRocket } from "@tabler/icons";
import { useState } from "react";
import SellScaleAssistant from "./SellScaleAssistant";

export default function SelixOnboarding() {
  const [tagline, setTagLine] = useState("");
  const [description, setDescription] = useState("");
  const [preFilter, setPreFilter] = useState("");
  const [hasNotGeneratedPreFilter, setHasNotGeneratedPrefilter] = useState(true);

  const [step, setStep] = useState(1);

  return (
    <Center p={"lg"} className="flex-col">
      <Flex align={"center"} px={"md"} w={"100%"} justify={"space-between"}>
        <Text fw={600} size={"xl"}>
          Onboarding
        </Text>
        <Button leftIcon={<IconRefresh size={"1rem"} />} size="sm">
          Reset
        </Button>
      </Flex>
      <Flex w={"80%"} direction={"column"} align={"center"} justify={"center"} mt={"md"}>
        <Flex gap={"xs"} align={"center"} w={"70%"}>
          <ThemeIcon color={step >= 1 ? "#228be6" : "gray"} radius={"xl"} size={"xl"}>
            1
          </ThemeIcon>
          <Divider
            w={"100%"}
            color={step >= 2 ? "#228be6" : "gray"}
            size="sm"
            label={<IconPoint fill={step >= 2 ? "#228be6" : "gray"} color={step >= 2 ? "#228be6" : "gray"} />}
            labelPosition="center"
          />
          <ThemeIcon color={step >= 2 ? "blue" : "gray"} radius={"xl"} size={"xl"}>
            2
          </ThemeIcon>
          <Divider
            color={step >= 3 ? "#228be6" : "gray"}
            size="sm"
            w={"100%"}
            label={<IconPoint fill={step >= 3 ? "#228be6" : "gray"} color={step >= 3 ? "#228be6" : "gray"} />}
            labelPosition="center"
          />

          <ThemeIcon color={step >= 3 ? "blue" : "gray"} radius={"xl"} size={"xl"}>
            3
          </ThemeIcon>
        </Flex>
        <Flex align={"center"} justify={"space-between"} w={"80%"} mt={"md"}>
          <Text size={"xs"} fw={step >= 1 ? 600 : 500} color={step >= 1 ? "" : "gray"}>
            Review Company Information
          </Text>
          <Text size={"xs"} fw={step >= 2 ? 600 : 500} color={step >= 2 ? "" : "gray"} mr={70}>
            Identify Core Customers
          </Text>
          <Text size={"xs"} fw={step >= 3 ? 600 : 500} color={step >= 3 ? "" : "gray"} mr={30}>
            Final Review
          </Text>
        </Flex>
        <Paper withBorder radius={"sm"} p={"md"} w={"96%"} mt={"md"} shadow="sm">
          {step === 1 && <ReviewCompanyInfo tagline={tagline} description={description} setTagLine={setTagLine} setDescription={setDescription} />}
          {step === 2 && <CreatePreFilter setHasNotGeneratedPrefilter={setHasNotGeneratedPrefilter} preFilter={preFilter} setPreFilter={setPreFilter} />}
          {step === 3 && <FinalReview tagline={tagline} description={description} preFilter={preFilter} />}
          <Flex gap={"sm"} justify={"end"} w={"100%"} mt={"md"}>
            <Button
              variant="outline"
              onClick={() => {
                if (step > 1) setStep(step - 1);
              }}
              w={200}
            >
              Go Back
            </Button>
            <Button
              disabled={step === 2 && hasNotGeneratedPreFilter}
              leftIcon={step >= 3 && <IconRocket size={"1rem"} />}
              onClick={() => {
                if (step < 3) setStep(step + 1);
              }}
              w={200}
            >
              {step >= 3 ? "Launch" : "Next"}
            </Button>
          </Flex>
        </Paper>
      </Flex>
    </Center>
  );
}

const ReviewCompanyInfo = ({
  tagline,
  description,
  setTagLine,
  setDescription,
}: {
  tagline: string;
  description: string;
  setTagLine: any;
  setDescription: any;
}) => {
  return (
    <Stack spacing={"sm"}>
      <Text size={"sm"} fw={500}>
        Review your company's Information below and ensure that all the data is accurate. Make any edits if necessary.
      </Text>
      <TextInput label="Tagline:" value={tagline} onChange={(e: any) => setTagLine(e.target.value)} />
      <Textarea minRows={2} label="Description:" value={description} onChange={(e: any) => setDescription(e.target.value)} />
    </Stack>
  );
};

const CreatePreFilter = ({ preFilter, setPreFilter, setHasNotGeneratedPrefilter }: { preFilter: string; setPreFilter: any, setHasNotGeneratedPrefilter: any }) => {
  return (
    <Stack spacing={"sm"}>
      <SellScaleAssistant setHasNotGeneratedPrefilter={setHasNotGeneratedPrefilter}/>
    </Stack>
  );
};

const FinalReview = ({ preFilter, tagline, description }: { preFilter: string; tagline: string; description: string }) => {
  return (
    <Stack spacing={"sm"}>
      <Text size={"sm"} fw={500}>
        Review your inputs and press the launch button to get started with Selix AI!
      </Text>
      <Paper withBorder radius={"sm"} p={"md"} bg={"#f5f9ff"} style={{ border: "1px dashed #228be6" }}>
        <Stack spacing={"sm"}>
          <Flex align={"start"} gap={"sm"}>
            <Box>
              <Text w={170} size={"sm"} color="gray" fw={500}>
                Tagline:
              </Text>
            </Box>
            <Text size={"sm"} fw={600}>
              {tagline}
            </Text>
          </Flex>
          <Flex align={"start"} gap={"sm"}>
            <Box>
              <Text w={170} size={"sm"} color="gray" fw={500}>
                Description:
              </Text>
            </Box>
            <Text size={"sm"} fw={600}>
              {description}
            </Text>
          </Flex>
          <Flex align={"start"} gap={"sm"}>
            <Box>
              <Text w={170} size={"sm"} color="gray" fw={500}>
                Describe your pre-filter:
              </Text>
            </Box>
            <Text size={"sm"} fw={600}>
              {preFilter}
            </Text>
          </Flex>
        </Stack>
      </Paper>
    </Stack>
  );
};
