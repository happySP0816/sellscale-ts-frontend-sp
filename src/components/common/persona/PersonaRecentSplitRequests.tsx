import { forwardRef, useEffect, useState } from "react";
import {
  MultiSelect,
  Box,
  Badge,
  Text,
  Title,
  Card,
  Divider,
  Flex,
  Button,
  Loader,
} from "@mantine/core";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRecoilState } from "recoil";
import { userTokenState } from "@atoms/userAtoms";
import { logout } from "@auth/core";
import { API_URL } from "@constants/data";

type PropsType = {
  archetype_id: number;
};

export default function PersonaRecentSplitRequests(props: PropsType) {
  const [userToken] = useRecoilState(userTokenState);
  const queryClient = useQueryClient();

  const [loadingFetchRequests, setLoadingFetchRequests] = useState(false);
  const [fetchedSplitRequests, setFetchedSplitRequests] = useState(false);
  const [fetchRequests, setFetchRequests]: any = useState({});

  const fetchSplitRequests = () => {
    setLoadingFetchRequests(true);
    fetch(
      `${API_URL}/personas/recent_split_requests?source_archetype_id=${props.archetype_id}`,
      {
        headers: {
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
      }
    )
      .then((res) => {
        if (res.status === 401) {
          logout();
        }
        return res.json();
      })
      .then((j) => {
        setFetchRequests(j);
      })
      .finally(() => {
        setLoadingFetchRequests(false);
      });
  };

  useEffect(() => {
    if (!fetchedSplitRequests) {
      fetchSplitRequests();
      setFetchedSplitRequests(true);
    }
  }, []);

  return (
    <Box>
      {fetchRequests?.recent_requests?.length > 0 && (
        <Flex direction="row">
          <Title order={4} mb="sm">
            Recent Split Requests
          </Title>
          <Button
            variant="subtle"
            onClick={() => {
              fetchSplitRequests();
            }}
          >
            Refresh
          </Button>
        </Flex>
      )}
      {loadingFetchRequests && <Loader variant="dots" />}
      {!loadingFetchRequests &&
        fetchRequests?.recent_requests &&
        fetchRequests?.recent_requests.map((entry: any) => {
          var total_prospect_count =
            entry.num_queued +
            entry.num_in_progress +
            entry.num_completed +
            entry.num_no_match +
            entry.num_failed;
          return (
            <Card w="100%" withBorder mt="xs">
              <Badge color="grape">{entry.created_at}</Badge>
              <Text mt="xs">
                Attempted to split {total_prospect_count} prospects into{" "}
                {entry.destination_client_archetype_ids?.length || 0} personas
              </Text>
              <Badge mt="xs" color="yellow" mr="xs" size="xs">
                {entry.num_in_progress} queued
              </Badge>
              <Badge mt="xs" mr="xs" size="xs">
                {entry.num_no_match} not matched
              </Badge>
              <Badge mt="xs" color="green" size="xs">
                {entry.num_completed} completed
              </Badge>{" "}
              <Badge mt="xs" color="red" mr="xs" size="xs">
                {entry.num_failed} failed
              </Badge>
            </Card>
          );
        })}
    </Box>
  );
}
