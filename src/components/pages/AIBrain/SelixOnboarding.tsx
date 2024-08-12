import { Box, Button, Center, Divider, Flex, Loader, Paper, Stack, Text, Textarea, TextInput, ThemeIcon } from "@mantine/core";
import { IconPoint, IconRefresh, IconRocket } from "@tabler/icons";
import { useEffect, useState } from "react";
import SellScaleAssistant from "./SellScaleAssistant";
import { useRecoilValue } from "recoil";
import { userDataState, userTokenState } from "@atoms/userAtoms";
import { useNavigate } from "react-router-dom";
import { API_URL } from "@constants/data";

export default function SelixOnboarding() {
  const userData = useRecoilValue(userDataState);

  const [tagline, setTagLine] = useState(userData.client.tagline || '');
  const [description, setDescription] = useState(userData.client.description || '');
  const [preFilter, setPreFilter] = useState("");
  const [hasNotGeneratedPreFilter, setHasNotGeneratedPrefilter] = useState(true);
  const navigate = useNavigate();

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
                if (step === 3) {
                  navigate("/selin_ai");
                }
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
        Confirm your company's information below and make any needed updates.
      </Text>
      <TextInput label="Tagline:" value={tagline} onChange={(e: any) => setTagLine(e.target.value)} />
      <Textarea minRows={7} label="Description:" value={description} onChange={(e: any) => setDescription(e.target.value)} />
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

  const userToken = useRecoilValue(userTokenState);
  const [prefilters, setPrefilters] = useState([]);

  const fetchSavedQueries = async () => {
    try {
      const response = await fetch(`${API_URL}/apollo/get_all_saved_queries`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
      });
      const data = await response.json();
      if (data.status === "success") {
        const formattedPrefilters = data.data.map((query: any) => ({
          ...query
        }));
        setPrefilters(formattedPrefilters);
      } else {
        console.error("Failed to fetch saved queries:", data);
      }
    } catch (error) {
      console.error("Error fetching saved queries:", error);
    }
  };

  useEffect(() => {
    fetchSavedQueries();
  }, [userToken]);

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
                Customer description:
              </Text>
            </Box>
            <Text size={"sm"} fw={600}>
              {prefilters?.[0] && (prefilters[0] as any).segment_description ? (prefilters[0] as any).segment_description : <Loader size="sm"/>}
            </Text>
          </Flex>
        </Stack>
      </Paper>
    </Stack>
  );
};
