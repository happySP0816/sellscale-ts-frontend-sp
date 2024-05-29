import { userTokenState } from "@atoms/userAtoms";
import { API_URL } from "@constants/data";
import {
  Avatar,
  Badge,
  Box,
  Button,
  CloseButton,
  Flex,
  Group,
  MantineColor,
  LoadingOverlay,
  ScrollArea,
  Stack,
  Text,
  Tooltip,
  useMantineTheme,
} from "@mantine/core";
import { ContextModalProps } from "@mantine/modals";
import { IconBriefcase, IconBuilding, IconCalendar, IconChecks, IconMan, IconMessage, IconSend } from "@tabler/icons";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";

function StatModalDisplay(props: {
  color: MantineColor;
  icon: ReactNode;
  label: string;
  percentcolor: MantineColor;
  total: number;
  percentage: number;
  border: string;
}) {
  return (
    <Stack
      spacing={0}
      py={10}
      style={{
        border: props.border ? `2.8px solid ${props.color}` : "2px solid #e9ecef",
        borderRadius: props.border ? "5px" : "0px",
      }}
    >
      <Group spacing={5} sx={{ justifyContent: "center" }}>
        <Tooltip label={props.percentage + "% conversion"} withArrow withinPortal>
          <Flex gap={8} align={"center"}>
            {props.icon}
            <Text c="gray.7" fz={"16px"}>
              {props.label}:
            </Text>
            <Text color={props.color} fz={"16px"} fw={500}>
              {props.total.toLocaleString()}
            </Text>
            <Text fz={"12px"} color={props.color} bg={props.percentcolor} style={{ borderRadius: "20px" }} px={"10px"}>
              {/* percentage */}
              {props.percentage}%
            </Text>
          </Flex>
        </Tooltip>
      </Group>
    </Stack>
  );
}

export default function CampaignDrilldownModal({
  innerProps,
  context,
  id,
}: ContextModalProps<{
  type: string;
  persona_id: number;
  campaign_name: string;
  statsData: any;
  setType: Function;
}>) {
  const theme = useMantineTheme();
  const userToken = useRecoilValue(userTokenState);
  const [value, setValue] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [campaignList, setCampaignList] = useState<Record<string, any>[]>([]);
  const [campaignName, setCampaignName] = useState("");

  const handleChannelOpen = async (type: string, id: number, campaign_name: string) => {
    setValue(type);
    setCampaignName(campaign_name);
    var myHeaders = new Headers();
    myHeaders.append("Authorization", `Bearer ${userToken}`);

    var requestOptions: any = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow",
    };
    setLoading(true);
    await fetch(`${API_URL}/analytics/get_campaign_drilldown/${id}`, requestOptions)
      .then((response) => response.text())
      .then((result) => {
        setCampaignList(JSON.parse(result).analytics);
        setLoading(false);
      })
      .catch((error) => {
        console.log("error", error);
        setLoading(false);
      });
  };

  const filteredCampaignList = useMemo(() => {
    if (value === "sent") {
      return campaignList?.filter((item: any) => item.to_status === "SENT_OUTREACH");
    } else if (value === "open") {
      return campaignList?.filter((item: any) => item.to_status === "ACCEPTED" || item.to_status === "EMAIL_OPENED");
    } else if (value === "reply") {
      return campaignList?.filter((item: any) => item.to_status === "ACTIVE_CONVO");
    } else if (value === "demo") {
      return campaignList?.filter((item: any) => item.to_status === "DEMO_SET");
    } else if (value === "pos_reply") {
      return campaignList?.filter((item: any) => ["ACTIVE_CONVO_SCHEDULING", "ACTIVE_CONVO_NEXT_STEPS", "ACTIVE_CONVO_QUESTION"].includes(item.to_status));
    }
  }, [value, campaignList]);

  useEffect(() => {
    handleChannelOpen(innerProps.type, innerProps.persona_id, innerProps.campaign_name);
  }, []);

  return (
    <>
      <Flex
        justify={"space-between"}
        w={"100%"}
        align={"center"}
        px={43}
        py={25}
        bg={
          value === "sent"
            ? "#228be6"
            : value === "open"
            ? "#fd4efe"
            : value === "reply"
            ? "orange"
            : value === "demo"
            ? "green"
            : value === "pos_reply"
            ? "purple"
            : ""
        }
      >
        <Text size={"lg"} color="white">
          Outreach for: <span className=" font-semibold text-[20px]"> {campaignName ? campaignName : "Coming soon! ⚠️ - This is all mock data..."}</span>
        </Text>
        <CloseButton
          aria-label="Close modal"
          onClick={() => {
            context.closeModal(id);
            innerProps.setType("");
          }}
          variant="outline"
          radius="xl"
          style={{
            borderColor: "white",
            color: "white",
          }}
        />
      </Flex>
      <Group
        mt={"md"}
        grow
        style={{
          justifyContent: "center",
          gap: "0px",
        }}
      >
        <Box
          w={"100%"}
          onClick={() => {
            setValue("sent");
          }}
        >
          <StatModalDisplay
            color="#228be6"
            icon={<IconSend color={theme.colors.blue[6]} size="20" />}
            label="Sent"
            percentcolor="#e7f5ff"
            total={innerProps.statsData?.num_sent ?? 0}
            border={value === "sent" ? "#228be6" : ""}
            percentage={Math.floor(((innerProps.statsData?.num_sent ?? 0) / (innerProps.statsData?.num_sent || 1)) * 100)}
          />
        </Box>
        <Box
          w={"100%"}
          onClick={() => {
            setValue("open");
          }}
        >
          <StatModalDisplay
            color="#fd4efe"
            icon={<IconChecks color={"#fd4efe"} size="20" />}
            label="Open"
            percentcolor="#ffedff"
            border={value === "open" ? "#fd4efe" : ""}
            total={innerProps.statsData?.num_opens ?? 0}
            percentage={Math.floor(((innerProps.statsData?.num_opens ?? 0) / (innerProps.statsData?.num_sent || 1)) * 100)}
          />
        </Box>
        <Box
          w={"100%"}
          onClick={() => {
            setValue("reply");
          }}
        >
          <StatModalDisplay
            color="#fd7e14"
            icon={<IconMessage color={theme.colors.orange[6]} size="20" />}
            label="Reply"
            percentcolor="#fff5ee"
            border={value === "reply" ? "#fd7e14" : ""}
            total={innerProps.statsData?.num_replies ?? 0}
            percentage={Math.floor(((innerProps.statsData?.num_replies ?? 0) / (innerProps.statsData?.num_opens || 1)) * 100)}
          />
        </Box>
        <Box
          w={"100%"}
          onClick={() => {
            setValue("pos_reply");
          }}
        >
          <StatModalDisplay
            color="#14B887"
            icon={<IconMessage color={theme.colors.teal[6]} size="20" />}
            label="(+)Reply"
            percentcolor="#E8F6F2"
            border={value === "total_pos_replied" ? "#CFF1E7" : ""}
            total={innerProps.statsData?.num_pos_replies ?? 0}
            percentage={Math.floor(((innerProps.statsData?.num_pos_replies ?? 0) / (innerProps.statsData?.num_replies || 1)) * 100)}
          />
        </Box>
        <Box
          w={"100%"}
          onClick={() => {
            setValue("demo");
          }}
        >
          <StatModalDisplay
            color="#40c057"
            icon={<IconCalendar color={theme.colors.green[6]} size="20" />}
            label="Demo"
            percentcolor="#e2f6e7"
            border={value === "demo" ? "#40c057" : ""}
            total={innerProps.statsData?.num_demos ?? 0}
            percentage={Math.floor(((innerProps.statsData?.num_demos ?? 0) / (innerProps.statsData?.num_pos_replies || 1)) * 100)}
          />
        </Box>
      </Group>
      <ScrollArea h={600} scrollbarSize={6}>
        <LoadingOverlay visible={loading} zIndex={1000} overlayBlur={2} />
        <Flex direction={"column"} gap={20} my={20}>
          {filteredCampaignList?.map((item, index) => {
            return (
              <Group
                grow
                style={{
                  justifyContent: "start",
                  gap: "0px",
                }}
                key={index}
              >
                <Flex
                  mx={25}
                  w={"100%"}
                  style={{
                    borderRadius: "10px",
                    border: "3px solid #e9ecef",
                  }}
                >
                  <Box
                    px={15}
                    py={12}
                    style={{
                      borderRight: "3px solid #e9ecef",
                      position: "relative",
                    }}
                    w={"30rem"}
                  >
                    <Flex align={"center"} gap={10} mb={8}>
                      <Avatar src={item.img_url} radius="xl" size="lg" />
                      <Button
                        style={{
                          position: "absolute",
                          top: 15,
                          right: 10,
                        }}
                        size="xs"
                        variant="default"
                        compact
                        component="a"
                        target="_blank"
                        href={`/prospects/${item.prospect_id}`}
                      >
                        Open Convo
                      </Button>
                      <Box>
                        <Flex align={"center"} gap={10}>
                          <Text fw={600}>{item.prospect_name}</Text>
                        </Flex>
                        <Flex align={"center"} gap={10} w={"100%"} mt={3}>
                          <Text>ICP Score: </Text>
                          <Badge
                            color={
                              item.prospect_icp_fit_score == "VERY HIGH"
                                ? "green"
                                : item.prospect_icp_fit_score == "HIGH"
                                ? "blue"
                                : item.prospect_icp_fit_score == "MEDIUM"
                                ? "yellow"
                                : item.prospect_icp_fit_score == "LOW"
                                ? "orange"
                                : item.prospect_icp_fit_score == "VERY LOW"
                                ? "red"
                                : "gray"
                            }
                            fw={600}
                          >
                            {item.prospect_icp_fit_score}
                          </Badge>
                        </Flex>
                      </Box>
                    </Flex>
                    <Flex gap={6}>
                      <div className="mt-1">
                        <IconMan size={20} color="#817e7e" />
                      </div>
                      <Text color="#817e7e" mt={3}>
                        {campaignName}
                      </Text>
                    </Flex>
                    <Flex gap={6}>
                      <div className="mt-1">
                        <IconBriefcase size={20} color="#817e7e" />
                      </div>
                      <Text color="#817e7e" mt={3}>
                        {item.prospect_title}
                      </Text>
                    </Flex>
                    <Flex gap={6}>
                      <div className="mt-1">
                        <IconBuilding size={20} color="#817e7e" />
                      </div>
                      <Text color="#817e7e" mt={3}>
                        {item.prospect_company}
                      </Text>
                    </Flex>
                  </Box>
                  <Box px={15} py={12} w={"100%"}>
                    <Flex justify={"space-between"}>
                      <Text color="#817e7e" fw={600}>
                        Last Message From Prospect:
                      </Text>
                      <Text color="#817e7e">{item.last_message_timestamp}</Text>
                    </Flex>
                    <Box
                      bg={
                        value === "sent"
                          ? "#e7f5ff"
                          : value === "open"
                          ? "#ffedff"
                          : value === "reply"
                          ? "#fff5ee"
                          : value === "pos_reply"
                          ? "#F6E4FF"
                          : "#e2f6e7"
                      }
                      p={20}
                      mt={15}
                      style={{
                        borderRadius: "10px",
                      }}
                    >
                      <Text fw={500}>{item?.last_message_from_prospect}</Text>
                    </Box>
                  </Box>
                </Flex>
              </Group>
            );
          })}
        </Flex>
      </ScrollArea>
    </>
  );
}
