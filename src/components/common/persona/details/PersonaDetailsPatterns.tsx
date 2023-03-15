import {
  Drawer,
  Title,
  Text,
  Center,
  Button,
  Switch,
  Container,
  Badge,
  Stack,
  Group,
  Box,
  Divider,
  ScrollArea,
  Flex,
  SegmentedControl,
} from "@mantine/core";
import { DataTable, DataTableSortStatus } from "mantine-datatable";
import { useRef, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { faker } from "@faker-js/faker";
import { useQuery } from "react-query";
import { chunk, sortBy } from "lodash";
import { IconBrandLinkedin, IconMail, IconTrashX } from "@tabler/icons";
import { showNotification } from "@mantine/notifications";
import { closeAllModals, openModal } from "@mantine/modals";
import { userTokenState } from "@atoms/userAtoms";
import { logout } from "@auth/core";
import { Archetype, Channel, CTA } from "src/main";
import {
  currentPersonaIdState,
  detailsDrawerOpenState,
} from "@atoms/personaAtoms";
import PatternCard from "./PatternCard";
import ChannelSwitch from "./ChannelSwitch";

const PAGE_SIZE = 20;

export default function PersonaDetailsPatterns() {
  const [currentPersonaId, setCurrentPersonaId] = useRecoilState(
    currentPersonaIdState
  );
  const userToken = useRecoilValue(userTokenState);
  const [channel, setChannel] = useState<Channel>('LINKEDIN');

  const { data, isFetching, refetch } = useQuery({
    queryKey: [
      `query-patterns-data-${currentPersonaId}-${channel}`,
      { channel },
    ],
    queryFn: async ({ queryKey }) => {
      // @ts-ignore
      // eslint-disable-next-line
      const [_key, { channel }] = queryKey;

      const response = await fetch(
        `${process.env.REACT_APP_API_URI}/message_generation/stack_ranked_configuration_priority?generated_message_type=${channel}&archetype_id=${currentPersonaId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );
      if (response.status === 401) {
        logout();
      }
      const res = await response.json();
      return res ?? [];
    },
    refetchOnWindowFocus: false,
    enabled: currentPersonaId !== -1,
  });

  console.log(data);

  return (
    <>
      <Flex direction="row-reverse" gap="sm" pb='xs'>
      <SegmentedControl
        size="sm"
        value={channel}
        onChange={(value) => setChannel(value as Channel)}
        data={[
          {
            value: "LINKEDIN",
            label: (
              <Center>
                <IconBrandLinkedin size="1rem" />
                <Box ml={10}>LinkedIn</Box>
              </Center>
            ),
          },
          {
            value: "EMAIL",
            label: (
              <Center>
                <IconMail size="1rem" />
                <Box ml={10}>Email</Box>
              </Center>
            ),
          },
        ]}
      />
      <Title order={4} lh={2.25}>
        Channel
      </Title>
    </Flex>

      <ScrollArea h="90%">
        <Stack>
          {data?.map((priorityList: any[], index: number) => (
            <Group key={index} noWrap align={"flex-start"}>
              <Container w={30}>
                <Title order={3}>{`${index + 1}.`}</Title>
              </Container>
              <Divider orientation="vertical" size="sm" />
              <Stack style={{ flexGrow: 1 }}>
                {priorityList.map((pattern) => (
                  <PatternCard
                    key={pattern.id}
                    id={pattern.id}
                    name={pattern.name}
                    priority={pattern.priority}
                    type={pattern.configuration_type}
                    channel={pattern.generated_message_type}
                    dataPoints={pattern.research_point_types}
                  />
                ))}
              </Stack>
            </Group>
          ))}
        </Stack>
      </ScrollArea>
    </>
  );
}
