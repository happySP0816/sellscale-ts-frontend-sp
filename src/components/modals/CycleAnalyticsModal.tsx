import { Box, Button, Divider, Flex, Image, List, Paper, Text } from "@mantine/core";
import { IconDownload, IconExclamationMark } from "@tabler/icons";
import { IconSparkles } from "@tabler/icons-react";
import { Bar, Pie } from "react-chartjs-2";
import Linkedin1 from "../../assets/images/linkedin_1.jpg";
import Linkedin2 from "../../assets/images/linkedin_2.jpg";
import Linkedin3 from "../../assets/images/linkedin_3.jpg";
import Linkedin4 from "../../assets/images/linkedin_4.jpg";

export default function CycleAnalyticsModal() {
  const spendingData = {
    labels: ["Not Personalized", "Medium Personalized", "High Personalized"],
    datasets: [
      {
        label: "Opened",
        data: [65, 59, 80],
        fill: false,
        borderColor: "#10b981",
        backgroundColor: "#10b981",
        stack: "Stack 0",
      },
      {
        label: "Total",
        data: [230, 402, 201],
        fill: false,
        borderColor: "#ff00ff",
        backgroundColor: "#ff00ff",
        stack: "Stack 0",
      },
    ],
  };
  const rateData = {
    labels: ["data syncs", "fellow founder reaching out", "[ai personalizer]", "common cto problem"],
    datasets: [
      {
        label: "Opened",
        data: [65, 59, 80, 200],
        fill: false,
        borderColor: "#10b981",
        backgroundColor: "#10b981",
      },
      {
        label: "Total",
        data: [130, 20, 201, 90],
        fill: false,
        borderColor: "#ff00ff",
        backgroundColor: "#ff00ff",
      },
    ],
  };
  const aiData = {
    labels: ["Includes Research", "Template"],
    datasets: [
      {
        data: [30, 70],
        backgroundColor: ["#ff00ff", "#10b981"],
      },
    ],
  };
  const aiData1 = {
    labels: ["AI Generated (Research or Subject Line)", "Static"],
    datasets: [
      {
        data: [30, 70],
        backgroundColor: ["#ff00ff", "#10b981"],
      },
    ],
  };
  const Spendingoptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          usePointStyle: true,
          padding: 20,
        },
      },
    },
    scales: {
      x: {
        grid: {
          borderDash: [5, 5],
        },
      },
      y: {
        grid: {
          borderDash: [5, 5],
        },
      },
    },
  };

  const piechartOption: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "top" as "top",
        labels: {
          usePointStyle: true,
        },
      },
    },
    animation: {
      animateScale: true,
      animateRotate: true,
    },
  };
  return (
    <Paper withBorder p={"md"}>
      <Flex align={"center"} justify={"space-between"}>
        <Flex align={"center"} gap={"xs"}>
          <IconSparkles color="#d444f1" size={"1.2rem"} />
          <Text size={"lg"} fw={600}>
            AI Report
          </Text>
        </Flex>
        <Button color="green" leftIcon={<IconDownload size={"0.9rem"} />}>
          Download as PDF
        </Button>
      </Flex>
      <Flex direction={"column"} gap={"md"} mt={"sm"}>
        <Text size={"lg"} fw={600} mb={"-sm"}>
          General Stats
        </Text>
        <List ml={"sm"}>
          <List.Item>
            <Text fw={600} color="#7c7c7c" size={"sm"}>
              <span className="text-black font-bold">{51}</span>/{205}
              were opened ({25}%)
            </Text>
          </List.Item>
          <List.Item>
            <Text fw={600} size={"sm"} color="#7c7c7c">
              <span className="text-black font-bold">{51}</span>/{205} were opened ({25}%)
            </Text>
          </List.Item>
          <List.Item>
            <Text fw={600} size={"sm"} color="#7c7c7c">
              <span className="text-black font-bold">{35}</span>/{143} emails that had personalizers received a response leading to a {25}% open rate for ({25}
              %)
            </Text>
          </List.Item>
        </List>
        <Paper withBorder p={"sm"}>
          <Box h={300}>
            <Bar data={spendingData} options={Spendingoptions} />
          </Box>
        </Paper>
        <List ml={"sm"}>
          <List.Item>
            <Text fw={600} size={"sm"} color="#7c7c7c">
              Not Personalized email intro's closely follow the provided template.
            </Text>
          </List.Item>
          <List.Item>
            <Text fw={600} size={"sm"} color="#7c7c7c">
              Medium Personalized template intro's begin with, <br />
              <span className="text-black">
                "Do you guys at [<span className="text-[#7c7c7c]">Company</span>] need to sync data to or from a data warehouse? ... Or from both into apps like
                [<span className="text-[#7c7c7c]">app that they use</span>]?"
              </span>
            </Text>
          </List.Item>
          <List.Item>
            <Text fw={600} size={"sm"} color="#7c7c7c">
              Highly Personalized email intro's: I watched your recent talk on digital identity and off-chain ZKP with on-chain anchoring.
            </Text>
          </List.Item>
        </List>
        <Flex px={"md"} py={"sm"} bg={"#fee4e2"} align={"center"} className="rounded-md">
          <IconExclamationMark color="red" size={"1.2rem"} className="mt-[-3px]" />
          <Text size={"sm"} fw={500}>
            Continue using personalized - especially highly personalized.
          </Text>
        </Flex>
        <Flex justify={"center"}>
          <Divider w={"90%"} />
        </Flex>
        <Text size={"lg"} fw={600}>
          Subject Line Open Rates
        </Text>
        <List ml={"sm"}>
          <List.Item>
            <Text fw={600} size={"sm"} color="#7c7c7c">
              Data syncs: <span className="text-black">{13}%</span>
            </Text>
          </List.Item>
          <List.Item>
            <Text fw={600} size={"sm"} color="#7c7c7c">
              Fellow founder reaching out: <span className="text-black">{23}%</span>
            </Text>
          </List.Item>
          <List.Item>
            <Text fw={600} size={"sm"} color="#7c7c7c">
              Common cto problem: <span className="text-black">{28}%</span>
            </Text>
          </List.Item>
        </List>
        <Flex px={"md"} py={"sm"} bg={"#fee4e2"} align={"center"} className="rounded-md">
          <IconExclamationMark color="red" size={"1.2rem"} className="mt-[-3px]" />
          <Text size={"sm"} fw={500}>
            Deactivate the data syncs one.
          </Text>
        </Flex>
        <Paper withBorder p={"sm"}>
          <Box h={300}>
            <Bar data={rateData} options={Spendingoptions} />
          </Box>
        </Paper>
        <List ml={"sm"}>
          <List.Item>
            <Text fw={600} size={"sm"} color="#7c7c7c">
              Based on the data the ai personalized subject lines had a higher open counts and performed the second best in terms of open rate.
            </Text>
          </List.Item>
        </List>
        <Paper withBorder p={"sm"}>
          <Box h={300}>
            <Pie data={aiData} options={piechartOption} />
          </Box>
        </Paper>
        <List ml={"sm"}>
          <List.Item>
            <Text fw={600} size={"sm"} color="#7c7c7c">
              <span className="text-black">{68.6}%</span> of all opened email had relevant research that was used to personalize the email.
            </Text>
          </List.Item>
        </List>
        <Paper withBorder p={"sm"}>
          <Box h={300}>
            <Pie data={aiData} options={piechartOption} />
          </Box>
        </Paper>
        <Flex px={"md"} py={"sm"} bg={"#fee4e2"} align={"center"} className="rounded-md">
          <IconExclamationMark color="red" size={"1.2rem"} className="mt-[-3px]" />
          <Text size={"sm"} fw={500}>
            Inconclusive but ai personalizer helps.
          </Text>
        </Flex>
        <List ml={"sm"}>
          <List.Item>
            <Text fw={600} size={"sm"} color="#7c7c7c">
              <span className="text-black">{78.4}%</span> of all opened email had some type of personalizer (either including reserach or an AI generated
              subject line)
            </Text>
          </List.Item>
        </List>
        <Paper withBorder radius={"sm"}>
          <Image src={Linkedin1} w={"100%"} h={"auto"} />
        </Paper>
        <Paper withBorder radius={"sm"}>
          <Image src={Linkedin2} w={"100%"} h={"auto"} />
        </Paper>
        <Paper withBorder radius={"sm"}>
          <Image src={Linkedin3} w={"100%"} h={"auto"} />
        </Paper>
        <Paper withBorder radius={"sm"}>
          <Image src={Linkedin4} w={"100%"} h={"auto"} />
        </Paper>
      </Flex>
    </Paper>
  );
}
