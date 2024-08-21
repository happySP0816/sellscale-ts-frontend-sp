import {
  Avatar,
  Box,
  Button,
  Center,
  Divider,
  Flex,
  Loader,
  Modal,
  Paper,
  Stack,
  Text,
  Textarea,
  TextInput,
  ThemeIcon,
  Image,
  Card,
} from "@mantine/core";
import {
  IconCalendarEvent,
  IconPoint,
  IconRefresh,
  IconRocket,
} from "@tabler/icons";
import { useEffect, useRef, useState } from "react";
import SellScaleAssistant from "./SellScaleAssistant";
import { useRecoilValue } from "recoil";
import { userDataState, userTokenState } from "@atoms/userAtoms";
import { useNavigate } from "react-router-dom";
import posthog from "posthog-js";
import Logo2 from "@assets/images/icon.svg";
import { API_URL } from "@constants/data";

export default function SelixOnboarding() {
  const userData = useRecoilValue(userDataState);

  const [tagline, setTagLine] = useState(userData.client?.tagline || "");
  const [description, setDescription] = useState(
    userData.client?.description || ""
  );
  const navigate = useNavigate();
  const [prefilter, setPreFilter] = useState<{ segment_description: string }>({
    segment_description: "",
  });
  const [showInfoModal, setShowInfoModal] = useState(true);
  const prefilterIDref = useRef<number>(-1);

  const clientDomain = userData.client?.domain.split("/")[2].split(":")[0];
  const [step, setStep] = useState(1);

  const userToken = useRecoilValue(userTokenState);

  const [showCalendly, setShowCalendly] = useState(false);
  const [showCalendlyModal, setShowCalendlyModal] = useState(false);

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
          ...query,
        }));
        const most_recent_prefilter = formattedPrefilters.sort(
          (a: any, b: any) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )[0];
        setPreFilter(most_recent_prefilter);
        prefilterIDref.current = most_recent_prefilter.id;
        console.log("most_recent_prefilter", most_recent_prefilter);
      } else {
        console.error("Failed to fetch saved queries:", data);
      }
    } catch (error) {
      console.error("Error fetching saved queries:", error);
    }
  };

  const update_prefilter_description = async (
    id: number,
    segment_description: string
  ) => {
    try {
      const response = await fetch(
        `${API_URL}/apollo/update_segment_description/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
          body: JSON.stringify({ segment_description: segment_description }),
        }
      );
      const res = await response.json();
      if (res.status === "success") {
        console.log("Updated prefilter:", res);
      } else {
        console.error("Failed to update prefilter:", res);
      }
    } catch (error) {
      console.error("Error updating prefilter:", error);
    }
  };

  useEffect(() => {
    posthog.onFeatureFlags(function () {
      if (posthog.isFeatureEnabled("show-calendly-for-signup")) {
        setShowCalendly(true);
      }
    });
  }, []);

  useEffect(() => {
    fetchSavedQueries();
  }, [userToken]);

  if (showCalendly) {
    return (
      <Center style={{ height: "100%", backgroundColor: "#f0f4f8" }}>
        <Paper
          withBorder
          shadow="lg"
          p="xl"
          radius="lg"
          style={{
            maxWidth: 500,
            backgroundColor: "#ffffff",
            position: "relative",
          }}
        >
          <Flex direction="column" align="center" gap="md">
            <Image src={Logo2} alt="Selix Logo" width={100} mb="md" />
            <Text align="center" size="xl" weight={700} color="teal" mb="md">
              Welcome to Selix!
            </Text>
            <Text align="center" size="md" color="gray" mb="md">
              We are currently experiencing high demand. Please schedule a time
              to get started with Selix AI. 🚀
            </Text>
            <Button
              fullWidth
              mt="md"
              size="lg"
              radius="md"
              style={{ backgroundColor: "#1e90ff", color: "white" }}
              leftIcon={<IconCalendarEvent size={18} />}
              onClick={() => setShowCalendlyModal(true)}
            >
              Get Started with Selix
            </Button>
          </Flex>
        </Paper>

        {/* <link href="https://assets.calendly.com/assets/external/widget.css" rel="stylesheet"> */}
        <Modal
          opened={showCalendlyModal}
          onClose={() => setShowCalendlyModal(false)}
          size="xl"
        >
          <iframe
            src="https://calendly.com/ishan-sellscaleai/sellscale-demo"
            style={{ minWidth: "100%", height: "1000px", border: "none" }}
          ></iframe>
        </Modal>
        <script
          src="https://assets.calendly.com/assets/external/widget.js"
          type="text/javascript"
          async
        ></script>
      </Center>
    );
  }

  return (
    <Center p={"lg"} className="flex-col">
      <Modal
        opened={showInfoModal}
        onClose={() => setShowInfoModal(false)}
        size="lg"
        // title="Welcome to Selix AI"
      >
        <Card
          withBorder
          shadow="md"
          p="lg"
          radius="md"
          style={{ backgroundColor: "#ffffff" }}
        >
          <Text size="lg" weight={700} mb="md" color="teal">
            Welcome! 🚀
          </Text>
          <Text size="md" color="gray" mb="md">
            {
              "Selix AI is your automated assistant for creating AI outreach campaigns, specifically designed for B2B applications."
            }
          </Text>
          <Text size="md" color="gray" mb="md">
            {
              "Provide your details to let Selix AI enhance your outreach. Here's how Selix AI can assist you:"
            }
          </Text>

          <ul style={{ paddingLeft: "20px", color: "gray" }}>
            <li style={{ marginBottom: "10px" }}>
              <Text size="md" weight={500}>
                Automate LinkedIn and Email Campaigns
              </Text>
              <Text size="sm">
                Effortlessly draft and manage your outreach campaigns on
                LinkedIn and via email.
              </Text>
            </li>
            <li style={{ marginBottom: "10px" }}>
              <Text size="md" weight={500}>
                Create Effective Strategies
              </Text>
              <Text size="sm">
                Leverage AI to develop strategies that maximize your campaign's
                impact.
              </Text>
            </li>
            <li style={{ marginBottom: "10px" }}>
              <Text size="md" weight={500}>
                Guided Campaign Creation
              </Text>
              <Text size="sm">
                Follow step-by-step guidance to create a successful SellScale
                campaign.
              </Text>
            </li>
            <li style={{ marginBottom: "10px" }}>
              <Text size="md" weight={500}>
                Target Customer Insights
              </Text>
              <Text size="sm">
                Describe your target customer and let Selix AI optimize your
                outreach.
              </Text>
            </li>
            <li style={{ marginBottom: "10px" }}>
              <Text size="md" weight={500}>
                Reach Out to an Accounts List
              </Text>
              <Text size="sm">
                Upload your accounts list, and Selix AI will seamlessly direct
                your outreach campaigns to the right contacts.
              </Text>
            </li>
          </ul>
          <Button
            fullWidth
            mt="md"
            size="lg"
            radius="md"
            style={{ backgroundColor: "#1e90ff", color: "white" }}
            onClick={() => setShowInfoModal(false)}
          >
            Get Started
          </Button>
        </Card>
      </Modal>
      <Flex align={"center"} px={"md"} w={"100%"} justify={"space-between"}>
        <Text fw={600} size={"xl"}>
          Onboarding
        </Text>

        <Flex direction="column" align="center" ml="md">
          <Avatar
            radius="xl"
            size="lg"
            src={"https://logo.clearbit.com/" + clientDomain}
            alt="Client Avatar"
          />
          <Text fw={600} size="md">
            {userData?.client_name}
          </Text>
          <Text size="sm" color="blue">
            <a
              href={`https://${clientDomain}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {clientDomain}
            </a>
          </Text>
        </Flex>
        {/* <Button leftIcon={<IconRefresh size={"1rem"} />} size="sm">
          Reset
        </Button> */}
      </Flex>
      <Flex
        w={"80%"}
        direction={"column"}
        align={"center"}
        justify={"center"}
        mt={"md"}
      >
        <Flex gap={"xs"} align={"center"} w={"70%"}>
          <ThemeIcon
            color={step >= 1 ? "#228be6" : "gray"}
            radius={"xl"}
            size={"xl"}
          >
            1
          </ThemeIcon>
          <Divider
            w={"100%"}
            color={step >= 2 ? "#228be6" : "gray"}
            size="sm"
            label={
              <IconPoint
                fill={step >= 2 ? "#228be6" : "gray"}
                color={step >= 2 ? "#228be6" : "gray"}
              />
            }
            labelPosition="center"
          />
          <ThemeIcon
            color={step >= 2 ? "blue" : "gray"}
            radius={"xl"}
            size={"xl"}
          >
            2
          </ThemeIcon>
          <Divider
            color={step >= 3 ? "#228be6" : "gray"}
            size="sm"
            w={"100%"}
            label={
              <IconPoint
                fill={step >= 3 ? "#228be6" : "gray"}
                color={step >= 3 ? "#228be6" : "gray"}
              />
            }
            labelPosition="center"
          />

          <ThemeIcon
            color={step >= 3 ? "blue" : "gray"}
            radius={"xl"}
            size={"xl"}
          >
            3
          </ThemeIcon>
        </Flex>
        <Flex align={"center"} justify={"space-between"} w={"80%"} mt={"md"}>
          <Text
            size={"xs"}
            fw={step >= 1 ? 600 : 500}
            color={step >= 1 ? "" : "gray"}
          >
            Review Company Information
          </Text>
          <Text
            size={"xs"}
            fw={step >= 2 ? 600 : 500}
            color={step >= 2 ? "" : "gray"}
            mr={70}
          >
            Identify Core Customers
          </Text>
          <Text
            size={"xs"}
            fw={step >= 3 ? 600 : 500}
            color={step >= 3 ? "" : "gray"}
            mr={30}
          >
            Final Review
          </Text>
        </Flex>
        <Paper
          withBorder
          radius={"sm"}
          p={"md"}
          w={"96%"}
          mt={"md"}
          shadow="sm"
        >
          {step === 1 && (
            <ReviewCompanyInfo
              tagline={tagline}
              description={description}
              setTagLine={setTagLine}
              setDescription={setDescription}
            />
          )}
          {step === 2 && (
            <Flex direction="column" align="center" w="100%" p="lg">
              <Text size="lg" fw={600} align="center" mb="md">
                Does this accurately represent your ideal customer profile?
              </Text>
              <Textarea
                defaultValue={prefilter?.segment_description}
                onChange={(e) =>
                  setPreFilter({
                    ...prefilter,
                    segment_description: e.target.value,
                  })
                }
                minRows={20}
                w="80%"
              />
            </Flex>
          )}
          {step === 3 && (
            <FinalReview
              tagline={tagline}
              description={description}
              preFilter={prefilter?.segment_description}
            />
          )}
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
              // disabled={step === 2 && hasNotGeneratedPreFilter}
              leftIcon={step >= 3 && <IconRocket size={"1rem"} />}
              onClick={() => {
                if (step === 3) {
                  update_prefilter_description(
                    prefilterIDref.current,
                    prefilter?.segment_description
                  );
                  navigate("/selix");
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
        Please confirm or edit this information for our AI brain.
      </Text>
      <TextInput
        label="Tagline:"
        value={tagline}
        onChange={(e: any) => setTagLine(e.target.value)}
      />
      <Textarea
        minRows={13}
        label="Description:"
        value={description}
        onChange={(e: any) => setDescription(e.target.value)}
      />
    </Stack>
  );
};

const FinalReview = ({
  preFilter,
  tagline,
  description,
}: {
  preFilter: string;
  tagline: string;
  description: string;
}) => {
  return (
    <Stack spacing={"sm"}>
      <Text size={"sm"} fw={500}>
        Review your inputs and press the launch button to get started with Selix
        AI!
      </Text>
      <Paper
        withBorder
        radius={"sm"}
        p={"md"}
        bg={"#f5f9ff"}
        style={{ border: "1px dashed #228be6" }}
      >
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
            <Text size={"sm"} fw={600} style={{ whiteSpace: "pre-line" }}>
              {preFilter}
            </Text>
          </Flex>
        </Stack>
      </Paper>
    </Stack>
  );
};
