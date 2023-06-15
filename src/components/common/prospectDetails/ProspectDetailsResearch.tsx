import GeneratedByAI from "@common/library/GeneratedByAI";
import { userTokenState } from "@atoms/userAtoms";
import { API_URL } from "@constants/data";
import {
  Card,
  Text,
  Group,
  Table,
  Button,
  Loader,
  Tabs,
  Flex,
} from "@mantine/core";
import { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import { IconReload, IconRobot, IconUser } from "@tabler/icons";
import displayNotification from "@utils/notificationFlow";
import { generateResearchPoints } from "@utils/requests/generateResearchPoints";
import { getResearchPointsHeuristic } from "@utils/requests/getResearchPointsHeuristic";

type PropsType = {
  prospectId: number;
};

export default function ProspectDetailsResearch(props: PropsType) {
  const userToken = useRecoilValue(userTokenState);
  const [accountResearchArray, setAccountResearchArray]: any = useState([]);
  const [heuristicResearchArray, setHeuristicResearchArray]: any = useState([]);
  const [fetched, setFetched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAccountResearchLoading, setIsAccountResearchLoading] = useState(
    false
  );

  const fetchAccountResearch = () => {
    const res = fetch(
      `${API_URL}/research/account_research_points?prospect_id=` +
        props.prospectId,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      }
    )
      .then((res) => res.json())
      .then((res) => {
        setAccountResearchArray(res);
        setIsLoading(false);
      })
      .catch((err) => {
        setIsLoading(false);
      });
  };

  const triggerGetResearchPointsHeuristic = async () => {
    setIsLoading(true);
    const result = await getResearchPointsHeuristic(
      userToken,
      props.prospectId
    );
    setHeuristicResearchArray(result.data);
    setIsLoading(false);
  };

  useEffect(() => {
    if (!fetched) {
      setIsLoading(true);
      setFetched(true);
      fetchAccountResearch();
      triggerGetResearchPointsHeuristic();
    }
  }, [fetched]);

  return (
    <Card shadow="sm" p="lg" radius="md" mt="md" withBorder>
      <Text weight={700} size="lg">
        Research
      </Text>
      <Text mt="xs" fz="sm">
        SellScale performs research on your prospects so our AI can write the
        best messages possible.
      </Text>
      <Text my="sm" fz="sm">
        You can view the research points below.
      </Text>
      <Tabs defaultValue="personalResearchPoints">
        <Tabs.List>
          {" "}
          <Tabs.Tab
            value="personalResearchPoints"
            icon={<IconUser size="1.25rem" />}
          >
            Personal
          </Tabs.Tab>
          <Tabs.Tab value="aiFitReasons" icon={<IconRobot size="1.25rem" />}>
            AI Fit Reasons
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="aiFitReasons" pl="xs" mih={"200px"}>
          <Flex justify={"flex-end"} align="center">
            {accountResearchArray.length > 0 ? (
              <Text my="xs" fz="sm" c="dimmed">
                This information has been synthesized by SellScale AI.
              </Text>
            ) : (
              <div>
                <Text my="xs" fz="sm" c="dimmed">
                  No account research points found. Please reattempt.
                </Text>
              </div>
            )}
            <Button
              variant="light"
              size="xs"
              mb="xs"
              rightIcon={<IconReload size="0.975rem" />}
              onClick={async () => {
                setIsAccountResearchLoading(true);
                await displayNotification(
                  "regenerate-research-points",
                  async () => {
                    let result = await generateResearchPoints(
                      userToken,
                      props.prospectId,
                      true
                    );
                    return result;
                  },
                  {
                    title: `Generating Account Research...`,
                    message: `Working with servers...`,
                    color: "teal",
                  },
                  {
                    title: `Account Research has been generated.`,
                    message: `You can now view the research points.`,
                    color: "teal",
                  },
                  {
                    title: `Account Research could not be generated.`,
                    message: `Please try again later.`,
                    color: "red",
                  }
                );
                fetchAccountResearch();
                setIsAccountResearchLoading(false);
              }}
            >
              Reattempt Research
            </Button>
          </Flex>

          {isLoading && <Loader variant="dots" />}
          {accountResearchArray.length > 0 && (
            <Table striped highlightOnHover withBorder withColumnBorders>
              <thead>
                <tr>
                  <th>Source</th>
                  <th>Reason</th>
                </tr>
              </thead>
              <tbody>
                {accountResearchArray.map((item: any, index: any) => {
                  return (
                    <tr key={item.title}>
                      <td>{item.title}</td>
                      <td>{item.reason}</td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          )}
          {isAccountResearchLoading && <Loader variant="dots" />}
          {accountResearchArray.length > 0 && <GeneratedByAI />}
        </Tabs.Panel>

        <Tabs.Panel value="personalResearchPoints" pl="xs" mih={"200px"}>
          {heuristicResearchArray.length > 0 ? (
            <Text my="xs" fz="sm" c="dimmed">
              This information is scraped from the web.
            </Text>
          ) : (
            <div>
              <Text my="xs" fz="sm" c="dimmed">
                No personal research points found. These are usually shown after
                a message has been sent.
              </Text>
            </div>
          )}

          {isLoading && <Loader variant="dots" />}
          {heuristicResearchArray.length > 0 && (
            <Table striped highlightOnHover withBorder withColumnBorders>
              <thead>
                <tr>
                  <th>Source</th>
                  <th>Reason</th>
                </tr>
              </thead>
              <tbody>
                {heuristicResearchArray.map((item: any, index: any) => {
                  let source = item.research_point_type
                    ?.split("_")
                    .join(" ")
                    .toLowerCase()
                    .replace(/(?:^|\s)\w/g, function (match: any) {
                      return match.toUpperCase();
                    });
                  let value = item.value;

                  if (item.research_point_type === "CUSTOM") {
                    const customData = JSON.parse(item.value);
                    source = customData.label;
                    value = customData.value;
                  }
                  return (
                    <tr key={item.research_point_type}>
                      <td>{source}</td>
                      <td>{value}</td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          )}
        </Tabs.Panel>
      </Tabs>
    </Card>
  );
}
