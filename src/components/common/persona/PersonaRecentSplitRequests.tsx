import { forwardRef, useEffect } from "react";
import { MultiSelect, Box, Badge, Text, Title, Card } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { useRecoilState } from "recoil";
import { userTokenState } from "@atoms/userAtoms";
import { logout } from "@auth/core";
import { API_URL } from "@constants/data";

type PropsType = {
  archetype_id: number;
};

export default function PersonaRecentSplitRequests(props: PropsType) {
  const [userToken] = useRecoilState(userTokenState);

  const { data, error, isLoading } = useQuery(
    ["personaRecentSplitRequests", props.archetype_id],
    () =>
      fetch(
        `${API_URL}/personas/recent_split_requests?source_archetype_id=${props.archetype_id}`,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
          },
        }
      ).then((res) => {
        if (res.status === 401) {
          logout();
        }
        return res.json();
      })
  );

  return (
    <Box>
      {data?.recent_requests.length > 0 && (
        <Title order={4} mb="sm">
          Recent Split Requests
        </Title>
      )}
      {data?.recent_requests.map((entry: any) => {
        return (
          <Card w="100%" withBorder>
            <Badge>{entry.created_at}</Badge>
            <Text mt="xs">
              Transferred prospects into{" "}
              {entry.destination_client_archetype_ids?.length || 0} personas
            </Text>
          </Card>
        );
      })}
    </Box>
  );
}
