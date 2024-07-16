import { Box, Button, Flex, Text } from "@mantine/core";
import {ContextModalProps} from "@mantine/modals";
import {useEffect, useMemo, useState} from "react";
import {useRecoilValue} from "recoil";
import {userTokenState} from "@atoms/userAtoms";
import {API_URL} from "@constants/data";
import {IconLoader} from "@tabler/icons";

export default function ResetSegmentModal({
  context,
  id,
  innerProps,
}: ContextModalProps<{
  currentSegment: { segment_id: number, segment_title: string };
  onClick: (segment_id: number, segment_title: string) => void;
}>) {
  const [loading, setLoading] = useState(false);
  const userToken = useRecoilValue(userTokenState);
  const [numNoActiveConvo, setNumNoActiveConvo] = useState(0);

  const resetTitle = useMemo(() => {
    const currentDate = new Date();
    const currentMonth = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const currentDay = currentDate.getDate();

    return `[Reset] ${innerProps.currentSegment.segment_title} - ${currentMonth}/${currentDay}`;

    }, [innerProps.currentSegment.segment_title]
  )

  const getNumberOfNoActiveConvo = async (segment_id: number) => {
    setLoading(true);
    const response = await fetch(`${API_URL}/segment/${segment_id}/count_no_active_convo`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      }});

    const result = await response.json();

    setLoading(false);
    return result.count_not_in_active_convo;
  }

  useEffect(() => {
    getNumberOfNoActiveConvo(innerProps.currentSegment.segment_id).then((result) => {
      setNumNoActiveConvo(result);
    });
  }, [innerProps.currentSegment.segment_id]);

  return (
    <Box>
      <Text color="gray" fw={600} size={"sm"}>
        {numNoActiveConvo} contacts <span className="font-normal">will be removed from their campaign and this segment, and will be moved into a new segment called</span>
      </Text>
      <Text mt={"xs"} fw={600} size={"sm"} color="gray">
        {resetTitle}
      </Text>
      <Flex mt={"xl"} gap={"xl"}>
        <Button fullWidth variant="outline" color="gray" disabled={loading}>
          Cancel
        </Button>
        <Button color="red" fullWidth
                onClick={() => {
                  innerProps.onClick(innerProps.currentSegment.segment_id, resetTitle)
                  setLoading(true);
                  }
                }
                loading={loading}
                disabled={loading}
        >
          Confirm Reset
        </Button>
      </Flex>
    </Box>
  );
}
