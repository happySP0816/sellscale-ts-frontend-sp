import { userTokenState } from "@atoms/userAtoms";
import { API_URL } from "@constants/data";
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
  LoadingOverlay,
} from "@mantine/core";
import React, { useEffect } from "react";
import { useRecoilValue } from "recoil";

type PropsType = {
  segmentId: number | undefined | null;
  onDownloadHistoryClick: () => void;
};

export default function SegmentAutodownload(props: PropsType) {
  const userToken = useRecoilValue(userTokenState);
  const [numScrapesToRun, setNumScrapesToRun] = React.useState(1);
  const [segment, setSegment] = React.useState({} as any);
  const [fetchingSegment, setFetchingSegment] = React.useState(false);
  const [hardcodedScrapePage, setHardcodedScrapePage] = React.useState(1);
  const [runningScrapeLoading, setRunningScrapeLoading] = React.useState(false);

  const getSegment = (segmentId: number) => {
    setFetchingSegment(true);
    fetch(`${API_URL}/segment/${segmentId}`, {
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setSegment(data);
      })
      .finally(() => setFetchingSegment(false));
  };

  const toggleAutoDownload = () => {
    fetch(`${API_URL}/segment/toggle_segment_auto_scrape`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        segment_id: props.segmentId,
      }),
    }).then(() => props.segmentId && getSegment(props.segmentId));
  };

  const setCurrentScrapePage = () => {
    fetch(`${API_URL}/segment/set_current_scrape_page`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        segment_id: props.segmentId,
        current_scrape_page: hardcodedScrapePage,
      }),
    }).then(() => props.segmentId && getSegment(props.segmentId));
  };

  const runScrapes = () => {
    setRunningScrapeLoading(true);
    fetch(`${API_URL}/segment/run_scrapes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        segment_id: props.segmentId,
        num_scrapes: numScrapesToRun,
      }),
    })
      .then(() => props.segmentId && getSegment(props.segmentId))
      .finally(() => setRunningScrapeLoading(false));
  };

  useEffect(() => {
    if (props.segmentId) getSegment(props.segmentId);
  }, [props.segmentId]);

  const totalPages = Math.ceil(segment?.apollo_query?.num_results / 100);
  const currentPage = Math.min(segment?.current_scrape_page || 0, totalPages);

  const percentComplete = Math.round((currentPage / totalPages) * 100);

  return (
    <>
      <LoadingOverlay visible={fetchingSegment} />
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
        <Text fz="sm">{segment?.segment_title}</Text>

        <Text fz="sm" weight={700} mt="xs">
          Estimated # of prospects:
        </Text>
        <Text fz="sm">{segment?.apollo_query?.num_results} prospects</Text>
      </Box>

      <Card withBorder mt="md">
        <Flex>
          <Badge size="lg" color="blue">
            {segment?.autoscrape_enabled ? "Enabled" : "Disabled"}
          </Badge>
          <Switch
            color="blue"
            size="lg"
            style={{ marginLeft: "auto" }}
            onChange={toggleAutoDownload}
            checked={segment?.autoscrape_enabled}
          />
        </Flex>

        <Text fz="sm" mt="md">
          <b>Current Progress: {percentComplete}%</b> ({currentPage} /{" "}
          {totalPages} pages scraped)
        </Text>
        <Progress
          value={percentComplete}
          color="blue"
          size="xl"
          animate={currentPage !== totalPages}
        />

        <Flex mt="md">
          <Text size="sm" mt="6px">
            Current Page:
          </Text>
          <NumberInput
            ml="auto"
            defaultValue={1}
            min={1}
            max={100}
            onChange={(value: any) => setHardcodedScrapePage(value)}
          />
          <Button
            ml="xs"
            size="sm"
            color="teal"
            variant="outline"
            onClick={setCurrentScrapePage}
          >
            Save
          </Button>
        </Flex>

        <Card m="xs" withBorder>
          <Title order={4}>Run Manually</Title>
          <Text size="xs">
            Manually run up to 10 pages if you want to pull prospects now
          </Text>

          <Flex>
            <NumberInput
              defaultValue={1}
              min={1}
              max={10}
              onChange={(value: any) => setNumScrapesToRun(value)}
            />
            <Button
              ml="xs"
              loading={runningScrapeLoading}
              size="sm"
              color="teal"
              variant="outline"
              onClick={runScrapes}
            >
              Run
            </Button>
          </Flex>
        </Card>
      </Card>

      <Button
        mt="md"
        color="grape"
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
