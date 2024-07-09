import React, { useState, useEffect } from "react";
import {
  Slider,
  Button,
  Flex,
  Text,
  Tooltip,
  Paper,
  Badge,
  Title,
} from "@mantine/core";
import { IconQuestionMark } from "@tabler/icons-react";
import { useRecoilValue } from "recoil";

const MAX_CONTACTS = 2147483647;

interface OutreachSliderProps {
  testingVolume: number;
  setTestingVolume: (value: number) => void;
  totalContacts: number;
  userToken: string;
  id: Number;
  fetchCampaignStats: (token: string, id: number) => Promise<void>;
  setLoadingStats: (loading: boolean) => void;
}

import {
  patchTestingVolume,
  getSentVolumeDuringPeriod,
} from "@utils/requests/campaignOverview";
import { currentProjectState } from "@atoms/personaAtoms";
import { openContextModal } from "@mantine/modals";

const OutreachSlider: React.FC<OutreachSliderProps> = ({
  testingVolume,
  setTestingVolume,
  totalContacts,
  userToken,
  id,
  fetchCampaignStats,
  setLoadingStats,
}) => {
  const [isUnsaved, setIsUnsaved] = useState(false);
  const [totalSentThisWeek, setTotalSentThisWeek] = useState(0);
  const currentProject = useRecoilValue(currentProjectState);

  const today = new Date();
  const dayOfWeek = today.getDay();
  const startOfWeek = new Date(today);

  if (dayOfWeek === 6) {
    // If today is Saturday
    startOfWeek.setDate(today.getDate() + 2); // Set to next Monday
  } else if (dayOfWeek === 0) {
    // If today is Sunday
    startOfWeek.setDate(today.getDate() + 1); // Set to next Monday
  } else {
    startOfWeek.setDate(today.getDate() - dayOfWeek + 1); // Set to this week's Monday
  }

  startOfWeek.setHours(0, 0, 0, 0); // Set to 12:00 AM on Monday

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 4); // Set to Friday of the same week
  endOfWeek.setHours(23, 59, 59, 999); // Set to 11:59:59.999 PM on Friday

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };
  useEffect(() => {
    const fetchSentVolume = async () => {
      const sentVolume = await getSentVolumeDuringPeriod(
        userToken,
        startOfWeek,
        endOfWeek,
        currentProject?.id
      );
      setTotalSentThisWeek(sentVolume);
    };

    fetchSentVolume();
  }, [userToken]);

  return (
    <Paper p="md" withBorder w={"100%"}>
      <Flex justify={"space-between"}>
        <Flex justify={"space-between"}>
          <Text size={"xs"} fw={500}>
            Outreach Volume {}
            <Text component="span" color="gray" size="xs" fw={500}>
              ({formatDate(startOfWeek)} - {formatDate(endOfWeek)})
            </Text>
          </Text>
          <Tooltip
            multiline
            label={
              <Text size="sm">
                SellScale will initiate weekly interactions
                <br />
                with this specified number of contacts,
                <br />
                determined by the imported contacts
                <br /> and the capacity of your account.
                <br></br>
              </Text>
            }
            withArrow
            position="right"
          >
            <Text color="#37414E" size="xs">
              <IconQuestionMark size={"0.75rem"} color="#37414E" />
            </Text>
          </Tooltip>
        </Flex>
        <Text size={"xs"} fw={500}>
          {testingVolume === MAX_CONTACTS ||
          (testingVolume === 1000 && totalContacts < 1000)
            ? "Max/Week"
            : `${testingVolume}/Week`}{" "}
          {isUnsaved && (
            <Text component="span" color="red" size="xs" fw={700} ml={4}>
              (Unsaved)
            </Text>
          )}
          <Text
            component="span"
            underline
            color="#228be6"
            size="xs"
            fw={700}
            ml={4}
            style={{ cursor: "pointer" }}
            onClick={() => {
              openContextModal({
                modal: "analyticModal",
                title: (
                  <Title order={3}>Campaign Analytics</Title>
                ),
                innerProps: {},
                styles: {
                  content: {
                    minWidth: "1100px",
                  },
                },
              });
            }}
          >
            Analytics
          </Text>
        </Text>
      </Flex>
      <Flex w={"100%"} align={"start"} gap={"sm"} mt={"md"}>
        <Flex direction="column" align="center" w="100%">
          <Slider
            w={"100%"}
            value={testingVolume}
            onChange={(value) => {
              setTestingVolume(value);
              setIsUnsaved(true);
            }}
            max={totalContacts > 1000 ? totalContacts : 1000}
            marks={[
              { value: 0, label: "0" },
              {
                value: totalContacts > 1000 ? totalContacts : 1000,
                label: (
                  <div
                    style={{
                      whiteSpace: "nowrap",
                    }}
                  >
                    Max
                  </div>
                ),
              },
            ]}
            label={(value) =>
              totalContacts < 1000 && value === 1000 ? "Max" : value
            }
          ></Slider>
          <Badge
            color="green"
            size="sm"
            style={{
              whiteSpace: "nowrap",
              position: "relative",
              top: "3px",
            }}
          >
            {totalSentThisWeek}/
            {testingVolume === MAX_CONTACTS ? 1000 : testingVolume} Sent
          </Badge>
        </Flex>
        <Button
          onClick={async () => {
            const clientArchetypeId = Number(id);
            const response = await patchTestingVolume(
              userToken,
              clientArchetypeId,
              testingVolume
            );
            if (response) {
              console.log("Testing volume updated successfully", response);
            }
            setLoadingStats(true);
            await fetchCampaignStats(userToken, clientArchetypeId);
            setLoadingStats(false);
            setIsUnsaved(false);
          }}
        >
          Save
        </Button>
      </Flex>
    </Paper>
  );
};

export default OutreachSlider;
