import {
  demosDrawerOpenState,
  demosDrawerProspectIdState,
} from "@atoms/dashboardAtoms";
import { userDataState, userTokenState } from "@atoms/userAtoms";
import { API_URL } from "@constants/data";
import DemoFeedbackDrawer from "@drawers/DemoFeedbackDrawer";
import {
  ActionIcon,
  Anchor,
  Avatar,
  Badge,
  Box,
  Button,
  Divider,
  Flex,
  Loader,
  LoadingOverlay,
  Paper,
  Rating,
  Select,
  Text,
  TextInput,
  Tooltip,
} from "@mantine/core";
import { isNativeFetch } from "@sentry/utils";
import {
  IconBriefcase,
  IconCalendar,
  IconEdit,
  IconPlus,
  IconSearch,
  IconTargetArrow,
} from "@tabler/icons";
import { IconArrowRightToArc } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { getClientSDRs } from "@utils/requests/client";
import { getProspects } from "@utils/requests/getProspects";
import { setSourceMapsEnabled } from "process";
import { useMemo, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { ClientSDR, Prospect } from "src";

export default function TopReplies() {
  const userToken = useRecoilValue(userTokenState);

  // Get the prospects that are in Demos, and then active scheduling
  const {
    data: prospects,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: [`query-dash-get-prospects`],
    queryFn: async () => {
      const response = await getProspects(
        userToken,
        undefined,
        "SELLSCALE",
        10000, // TODO: Maybe use pagination method instead
        ["DEMO", "ACTIVE_CONVO"],
        "ALL",
        undefined,
        undefined,
        undefined,
        undefined,
        true
      );
      return response.status === "success" ? (response.data as Prospect[]) : [];
    },
    refetchOnWindowFocus: false,
  });

  console.log("prospects: ", prospects);

  // Get the prospects that are in Demos, and then active scheduling
  const {
    data: demoFeedbacks,
    isFetching: demoFeedbacksIsFetching,
    refetch: demoFeedbacksRefetch,
  } = useQuery({
    queryKey: [`query-get-all-demos`],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/client/demo_feedback_feed`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();

        return data.data;
      }

      return [];
    },
    refetchOnWindowFocus: false,
  });

  const { data: clientSDRs, refetch: refetchSDRs } = useQuery({
    queryKey: [`query-get-org-sdrs`],
    queryFn: async () => {
      const result = await getClientSDRs(userToken);
      return result.status === "success" ? (result.data as ClientSDR[]) : [];
    },
  });

  const userData = useRecoilValue(userDataState);

  console.log("userdata: ", userData);

  const combinedData = useMemo(() => {
    if (!prospects) {
      return [];
    }

    const demos = demoFeedbacks ?? [];

    const filteredProspects = prospects?.filter((p) =>
      ["SCHEDULING", "DEMO_SET", "DEMO_WON", "DEMO_LOST"].includes(
        p.status ?? ""
      )
    );

    let demoCount = 0;
    let schedulingCount = 0;
    let scheduledCount = 0;

    return filteredProspects
      .sort((a, b) => {
        const demoA = demos.find((d: any) => d.prospect_id === a.id);
        const demoB = demos.find((d: any) => d.prospect_id === b.id);

        if (demoA && !demoB) {
          return -1;
        } else if (!demoA && demoB) {
          return 1;
        } else {
          if (a.demo_date && !b.demo_date) {
            return -1;
          } else if (!a.demo_date && b.demo_date) {
            return 1;
          } else {
            return b.icp_fit_score - a.icp_fit_score;
          }
        }
      })
      .map((p) => {
        const demo = demos.find((d: any) => d.prospect_id === p.id);

        const li_last_message_timestamp = p.li_last_message_timestamp;
        const email_last_message_timestamp = p.email_last_message_timestamp;

        // Convert the timestamp strings to Date objects
        const liDate = li_last_message_timestamp
          ? new Date(li_last_message_timestamp)
          : null;
        const emailDate = email_last_message_timestamp
          ? new Date(email_last_message_timestamp)
          : null;

        let latestTime: Date | null = null;

        const clientSDR = clientSDRs
          ? clientSDRs.find((sdr) => sdr.id === p.client_sdr_id)
          : null;

        function formatDateToYYYYMMDD(date: Date) {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0"); // getMonth() is zero-based
          const day = String(date.getDate()).padStart(2, "0");

          return `${year}-${month}-${day}`;
        }

        if (!emailDate) {
          latestTime = liDate;
        } else if (!liDate) {
          latestTime = emailDate;
        } else {
          if (liDate >= emailDate) {
            latestTime = liDate;
          } else {
            latestTime = emailDate;
          }
        }

        const latestDateString = latestTime
          ? formatDateToYYYYMMDD(latestTime)
          : "";

        let icp_score_text = "Very High";
        let color = "green";

        switch (p.icp_fit_score) {
          case 0:
            icp_score_text = "Very Low";
            color = "red";
            break;
          case 1:
            icp_score_text = "Low";
            color = "orange";
            break;
          case 2:
            icp_score_text = "Medium";
            color = "yellow";
            break;
          case 3:
            icp_score_text = "High";
            color = "blue";
            break;
          case 4:
            icp_score_text = "Very High";
            color = "green";
            break;
          default:
            icp_score_text = "Medium";
            color = "yellow";
        }

        if (demo) {
          demoCount += 1;
        } else if (p.demo_date) {
          scheduledCount += 1;
        } else {
          schedulingCount += 1;
        }

        const topText = demo
          ? `Demo #${demoCount} with ${clientSDR ? clientSDR.sdr_name : ""}`
          : p.demo_date
          ? `Scheduled #${scheduledCount} with ${
              clientSDR ? clientSDR.sdr_name : ""
            }`
          : `Scheduling #${schedulingCount} with ${
              clientSDR ? clientSDR.sdr_name : ""
            }`;

        return {
          id: p.id,
          sdr_id: clientSDR ? clientSDR.id : -1,
          userAvatar: p.img_url,
          username: p.full_name,
          title: p.title,
          icp_score: p.icp_fit_score,
          icp_score_text: icp_score_text,
          icp_score_color: color,
          company: p.company,
          archetype_name: p.archetype_name,
          archetype_id: p.archetype_id,
          last_reply: latestDateString,
          last_reply_message: p.linkedin_status
            ? p.li_last_message_from_prospect
            : p.email_last_message_from_prospect,
          replied_username: clientSDR ? clientSDR.sdr_name : "",
          reply_rating: demo ? +demo.demo_rating.split("/")[0] : 0,
          reply_status: demo
            ? "Occured"
            : p.demo_date
            ? "Scheduled"
            : "Scheduling",
          reply_feedback: demo
            ? demo.demo_feedback
            : "Demo did not occured yet.",
          reply_date: demo
            ? demo.demo_date
            : p.demo_date
            ? `Scheduled for ${formatDateToYYYYMMDD(new Date(p.demo_date))}`
            : "-",
          reply_userAvatar: clientSDR ? clientSDR.img_url : "",
          status: p.linkedin_status
            ? p.linkedin_status
            : p.email_status
            ? p.email_status
            : "",
          count: demo
            ? demoCount
            : p.demo_date
            ? scheduledCount
            : schedulingCount,
          top_text: topText,
        };
      });
  }, [prospects, demoFeedbacks]);

  const [searchText, setSearchText] = useState<string>("");

  const [drawerProspectId, setDrawerProspectId] = useRecoilState(
    demosDrawerProspectIdState
  );

  const [demosDrawerOpened, setDemosDrawerOpened] =
    useRecoilState(demosDrawerOpenState);

  return (
    <Box>
      <LoadingOverlay visible={isFetching || demoFeedbacksIsFetching} />
      <Flex align={"center"} justify={"space-between"}>
        <Flex align={"center"} gap={"lg"}>
          <Text size={"lg"} fw={600}>
            Top Replies
          </Text>
          <Badge>{combinedData.length}</Badge>
        </Flex>
        <Flex align={"center"} gap={"sm"}>
          <TextInput
            w={300}
            placeholder="Search by prospect, company, ..."
            rightSection={<IconSearch size={"1rem"} color="gray" />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value ?? "")}
          />
          {/* <Select data={[""]} w={160} /> */}
        </Flex>
      </Flex>
      <Flex direction={"column"} gap={"sm"} mt={"sm"}>
        {combinedData &&
          combinedData
            .filter((item) => {
              return (
                item.company.toLowerCase().includes(searchText.toLowerCase()) ||
                item.username
                  .toLowerCase()
                  .includes(searchText.toLowerCase()) ||
                item.archetype_name
                  .toLowerCase()
                  .includes(searchText.toLowerCase())
              );
            })
            .map((item, index) => {
              return (
                <Flex
                  className="rounded-[4px]"
                  key={index}
                  style={{ border: "1px solid #228be6" }}
                >
                  <Paper
                    w={"100%"}
                    p={"sm"}
                    className="flex flex-col justify-between"
                    withBorder
                  >
                    <Flex align={"center"} gap={"sm"} w={"100%"}>
                      <Avatar src={item.userAvatar} radius={"xl"} size={50} />
                      <Box w={"100%"}>
                        <Flex align={"center"} justify={"space-between"}>
                          <Text fw={500} size={"sm"}>
                            {item.username}
                          </Text>
                          <Tooltip
                            label={
                              item.sdr_id !== userData.id
                                ? "You can only view the prospect inbox on the SDR profile"
                                : ""
                            }
                          >
                            <Anchor
                              href={`/prospects/${item.id}`}
                              target={"_blank"}
                              unselectable={
                                item.sdr_id !== userData.id ? "on" : "off"
                              }
                            >
                              <Text size={"sm"} underline>
                                View Conversion
                              </Text>
                            </Anchor>
                          </Tooltip>
                        </Flex>
                        <Flex align={"center"} gap={"sm"}>
                          <Text size={"xs"} fw={500} color="gray">
                            ICP Score:
                          </Text>
                          <Badge size="sm" color={item.icp_score_color}>
                            {item.icp_score_text}
                          </Badge>
                        </Flex>
                      </Box>
                    </Flex>
                    <Flex align={"center"} gap={4} mt={"sm"}>
                      <IconTargetArrow size={"0.8rem"} color="gray" />{" "}
                      <Anchor
                        href={`/campaign_v2/${item.archetype_id}`}
                        target={"_blank"}
                      >
                        <Text size={"xs"} color="gray" underline>
                          {item.archetype_name}
                        </Text>
                      </Anchor>
                    </Flex>
                    <Flex align={"center"} gap={4}>
                      <IconBriefcase size={"0.8rem"} color="gray" />{" "}
                      <Text size={"xs"} color="gray">
                        {item.title}, {item.company}
                      </Text>
                    </Flex>
                    <Divider my={"sm"} />
                    <Box>
                      <Flex align={"center"} justify={"space-between"}>
                        <Text size={"xs"} fw={500}>
                          Last Message From Prospect:
                        </Text>
                        <Text size={"xs"} color="gray" fw={500}>
                          Last Updated: {item.last_reply}
                        </Text>
                      </Flex>
                      <Paper radius={"sm"} p={"sm"} bg={"#ecf3fe"} mt={4}>
                        <Text size={"sm"} fw={400}>
                          {item.last_reply_message}
                        </Text>
                      </Paper>
                    </Box>
                  </Paper>
                  <Paper w={"100%"} p={"sm"} bg={"transparent"}>
                    <Flex align={"center"} justify={"space-between"}>
                      <Text size={"sm"} fw={400}>
                        Lead Status:
                      </Text>
                      <Badge size="sm">
                        {item.status.split("_").join(" ")}
                      </Badge>
                    </Flex>
                    <Paper p={"sm"} withBorder mt={4}>
                      <Flex align={"center"} justify={"space-between"}>
                        <Flex align={"center"} gap={"sm"}>
                          <Avatar
                            src={item.reply_userAvatar}
                            radius={"xl"}
                            size={50}
                          />
                          <Box>
                            <Text fw={500} size={"sm"}>
                              {item.top_text}
                            </Text>
                            <Text fw={500} color="gray" size={"xs"}>
                              {item.reply_date}
                            </Text>
                          </Box>
                        </Flex>
                        <ActionIcon>
                          <IconEdit size={"1rem"} color="gray" />
                        </ActionIcon>
                      </Flex>
                      <Flex align={"center"} gap={"xs"} mt={"sm"}>
                        <Text size={"xs"} fw={500}>
                          Status:{" "}
                          <span className="text-gray-400 ml-[4px]">
                            {item.reply_status}
                          </span>
                        </Text>
                      </Flex>
                      <Flex align={"center"}>
                        <Text size={"xs"} fw={500}>
                          Rating:
                        </Text>
                        <Rating
                          size="xs"
                          defaultValue={item.reply_rating}
                          ml={4}
                        />
                      </Flex>
                      <Flex align={"center"} gap={"xs"}>
                        <Text size={"xs"} fw={500}>
                          Feedback:{" "}
                          <span className="text-gray-400 ml-[4px]">
                            {item.reply_feedback}
                          </span>
                        </Text>
                      </Flex>
                    </Paper>
                    <Tooltip
                      label={
                        item.reply_status !== "Occured" ||
                        item.sdr_id !== userData.id
                          ? "The demo has not occured yet. If it has, only the SDR that the prospect belong to can add feedback."
                          : ""
                      }
                    >
                      <Box>
                        <Button
                          leftIcon={<IconPlus size={"1rem"} />}
                          fullWidth
                          mt={"xs"}
                          onClick={() => {
                            setDrawerProspectId(item.id);
                            setDemosDrawerOpened(true);
                          }}
                          disabled={
                            item.reply_status !== "Occured" ||
                            item.sdr_id !== userData.id
                          }
                        >
                          Add Demo Feedback
                        </Button>
                      </Box>
                    </Tooltip>
                  </Paper>
                </Flex>
              );
            })}
        <Paper withBorder radius={"sm"}></Paper>
      </Flex>
      <DemoFeedbackDrawer refetch={() => demoFeedbacksRefetch()} />
    </Box>
  );
}
