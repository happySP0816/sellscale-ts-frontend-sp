import {
  ActionIcon,
  Avatar,
  Badge,
  Box,
  Flex,
  Group,
  Progress,
  ScrollArea,
  Tabs,
  Text,
  rem,
} from "@mantine/core";

import { useState } from "react";
import { IconArchive, IconRotate } from "@tabler/icons-react";
import Content from "./Content";
import SideInformation from "./SideInformation";
import { Prospect } from "src";
import { proxyURL } from "@utils/general";
import { ICPFitPillOnly } from "@common/pipeline/ICPFitAndReason";

export type TrainMessage = {
  id: number;
  value: string;
  prospect: Prospect | null;
  meta_data: any;
}

const TrainYourAi = (props: {
  messages: TrainMessage[];
  onComplete: () => void;
}) => {
  const [selectedItem, setSelectedItem] = useState<number | null>(0);

  const tabs = [
    {
      name: "All",
      value: props.messages.length,
      key: "all",
      color: "blue",
    },
    // {
    //   name: "Only",
    //   key: "only_green",
    //   value: 8,
    //   color: "green",
    // },
    // {
    //   name: "Only",
    //   key: "only_red",
    //   value: 8,
    //   color: "red",
    // },
  ];

  const [approvedSet, setApprovedSet] = useState<Set<number>>(new Set());

  return (
    <Flex>
      <Box
        sx={{
          borderRightWidth: "1px",
          borderRightStyle: "dashed",
          borderRightColor: "#E9ECEF",
          position: "relative",
        }}
        h={"calc(100vh - 3.5rem)"}
      >
        <Tabs defaultValue={tabs[0].key} w={"25vw"} miw={300}>
          <Tabs.List sx={{ borderWidth: "1px" }} h={"3rem"}>
            {tabs.map((tab) => (
              <Tabs.Tab value={tab.key} h={"3rem"}>
                <Flex gap={"0.25rem"} align={"center"}>
                  <Text fz={".75rem"}>{tab.name}</Text>
                  <Badge
                    color={tab.color}
                    variant="filled"
                    px={"0.5rem"}
                    size="xs"
                  >
                    {tab.value}
                  </Badge>
                </Flex>
              </Tabs.Tab>
            ))}
          </Tabs.List>

          {tabs.map((tab) => (
            <Tabs.Panel value={tab.key} key={tab.key} bg={"gray.2"}>
              <ScrollArea h={"calc(100vh - 10rem)"}>
                {props.messages.map((item, index) => (
                  <Flex
                    w={"100%"}
                    align={"center"}
                    p={"1rem"}
                    role="button"
                    pos={"relative"}
                    bg={index === selectedItem ? "blue.0" : "#fff"}
                    sx={{
                      cursor: "pointer",
                      borderRight:
                        index === selectedItem ? `2px solid #228be6` : "",
                      borderBottom:
                        index === props.messages.length - 1
                          ? ""
                          : `1px solid #E9ECEF`,
                    }}
                    onClick={() => setSelectedItem(index)}
                  >
                    <Avatar
                      radius="xl"
                      src={proxyURL(item.prospect?.img_url)}
                    />
                    <Flex ml={"0.5rem"} direction={"column"} gap={"0.25rem"}>
                      <Text weight={600} size={"1rem"}>
                        {item.prospect?.full_name}
                      </Text>
                      <Group spacing={10} noWrap>
                        <Text size={"0.75rem"} color="gray.6" weight={600}>
                          ICP Score:
                        </Text>
                        <ICPFitPillOnly icp_fit_score={item.prospect?.icp_fit_score ?? -1} />
                      </Group>
                    </Flex>

                    <Box
                      pos={"absolute"}
                      right={"1rem"}
                      top={"1rem"}
                      w={"0.5rem"}
                      h={"0.5rem"}
                      bg={approvedSet.has(item.id) ? "blue" : "red"}
                      mb={"auto"}
                      ml={"auto"}
                      sx={{
                        borderRadius: 999,
                      }}
                    ></Box>
                  </Flex>
                ))}
              </ScrollArea>
            </Tabs.Panel>
          ))}
        </Tabs>

        <Box
                  sx={{
                    position: "absolute",
                    top: 10,
                    right: 10,
                    zIndex: 10000000,
                    width: 220,
                  }}
        >
        <Progress
          color="blue"
          value={((approvedSet.size+1) / props.messages.length) * 100}
        />
        </Box>

        <Flex
          pos={"absolute"}
          bottom={0}
          h={"3.5rem"}
          bg={"gray.2"}
          w={"100%"}
          justify={"space-between"}
          align={"center"}
          px={"1rem"}
        >
          <Text fz={"0.75rem"} color="gray.6" weight={700}>
            {props.messages.length} Results
          </Text>

          <Flex align={"center"} gap={"0.25rem"}>
            <ActionIcon>
              <IconArchive width={rem(16)} height={rem(16)} />
            </ActionIcon>
            <ActionIcon>
              <IconRotate width={rem(16)} height={rem(16)} />
            </ActionIcon>
          </Flex>
        </Flex>
      </Box>

      <Flex sx={{ overflowX: "auto" }}>
        <Box h={"calc(100vh - 3.5rem)"} miw={600} sx={{ flex: 2 }}>
          <Content messageId={props.messages[selectedItem ?? 0].id} onNext={() => {
            setSelectedItem((prev) => {
              if (prev === null) return null;
              return prev + 1;
            });
            setApprovedSet((prev) => {
              const newSet = new Set(prev);
              newSet.add(props.messages[selectedItem ?? 0].id);
              return newSet;
            });
          }}
          onComplete={props.onComplete}
          complete={selectedItem! >= props.messages.length - 1}
          />
        </Box>
        <Box h={"calc(100vh - 3.5rem)"} miw={300} sx={{ flex: 1 }}>
          <SideInformation message={props.messages[selectedItem ?? 0]} />
        </Box>
      </Flex>
    </Flex>
  );
};

export default TrainYourAi;
