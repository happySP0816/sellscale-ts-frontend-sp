import {
  Box,
  Title,
  Text,
  Divider,
  Flex,
  Card,
  Badge,
  Switch,
  Progress,
  TextInput,
  NumberInput,
  Button,
} from "@mantine/core";
import React from "react";

type PropsType = {
  segmentId: number | undefined | null;
  segmentName: string | undefined;
  segmentNumProspects: number | undefined;
  onDownloadHistoryClick: () => void;
};

export default function SegmentAutodownload(props: PropsType) {
  return (
    <>
      <Box>
        <Title order={3}>Auto Download Segment</Title>
        <Text size="sm" color="gray">
          Set up automatic download to automatically scrape this segment on a
          weekly basis until all the prospects from this segment are downloaded.
        </Text>
      </Box>

      <Divider mt="xs" />

      <Box mt="md">
        <Text fz="sm" weight={700}>
          Segment:
        </Text>
        <Text fz="sm">{props.segmentName}</Text>

        <Text fz="sm" weight={700} mt="xs">
          Estimated # of prospects:
        </Text>
        <Text fz="sm">
          {props.segmentNumProspects?.toLocaleString()} prospects
        </Text>
      </Box>

      <Card withBorder mt="md">
        <Flex>
          <Badge size="lg" color="blue">
            Enabled
          </Badge>
          <Switch color="blue" size="lg" style={{ marginLeft: "auto" }} />
        </Flex>

        <Text fz="sm" mt="md">
          <b>Current Progress: 55%</b> (6,831 prospects downloaded)
        </Text>
        <Progress value={55} color="blue" size="xl" animate />

        <Flex mt="md">
          <Text size="sm" mt="6px">
            Current Page:
          </Text>
          <NumberInput ml="auto" defaultValue={1} min={1} max={100} />
          <Button ml="xs" size="sm" color="teal" variant="outline">
            Save
          </Button>
        </Flex>

        <Card m="xs" withBorder>
          <Title order={4}>Run Manually</Title>
          <Text size="xs">
            Manually run up to 10 pages if you want to pull prospects now
          </Text>

          <Flex>
            <NumberInput defaultValue={1} min={1} max={10} />
            <Button ml="xs" size="sm" color="teal">
              Run
            </Button>
          </Flex>
        </Card>
      </Card>

      <Button
        mt="md"
        color="teal"
        variant="outline"
        size="xs"
        w="100%"
        onClick={() => props.onDownloadHistoryClick()}
      >
        View Download History
      </Button>
    </>
  );
}
