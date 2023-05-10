import { Anchor, Avatar, Center, Flex, Group, Paper, Text } from "@mantine/core";
import Assistant from "@assets/images/assistant.svg";
import _ from "lodash";

export default function NotificationCard(props: {
  title: string;
  amount: number;
  totalAmount: number;
  noneMsg: string;
  onClickSeeAll: () => void;
  assistantMsg?: string;
  children: React.ReactNode;
}) {
  const numLayers = Math.min(props.amount - 1, 3);
  const layerOffset = 5;

  return (
    <div>
      <Group position="apart">
        <Group spacing={10}>
          <Text fw={500}>{props.title}</Text>
          {props.amount >= 1 && (
            <Avatar
              color="violet"
              radius="xl"
              size={24}
              styles={{
                placeholder: {
                  fontSize: 12,
                },
              }}
            >
              {`${props.amount}`}
            </Avatar>
          )}
        </Group>
        {props.totalAmount >= 1 && ( // props.amount > 1
          <Text fw={300} c="green.3" fz={12} sx={{ cursor: "pointer" }} onClick={props.onClickSeeAll}>
            See all
          </Text>
        )}
      </Group>

      {props.assistantMsg && (
        <Text size="sm" mt={4} c="dimmed" sx={{ display: "flex" }}>
          <Avatar src={Assistant} alt="it's me" size={24} mr={5} />
          {props.assistantMsg}
        </Text>
      )}

      {props.amount > 0 ? (
        <div style={{ position: "relative" }}>
          <>
            {props.amount > 1 && (
              <div
                style={{
                  position: "absolute",
                  bottom: -1 * (layerOffset + numLayers * layerOffset),
                  left: 0,
                  width: "100%",
                }}
              >
                {_.times(numLayers, (i) => (
                  <Paper
                    key={i}
                    withBorder
                    mx={2 * layerOffset * (numLayers - i)}
                    radius="md"
                    mt={-1 * (20 + layerOffset)}
                    h={20}
                    sx={(theme) => ({
                      filter: `brightness(${1 - 0.15 * numLayers + 0.15 * i})`,
                    })}
                  ></Paper>
                ))}
              </div>
            )}
            <Paper
              withBorder
              p="xs"
              radius="md"
              mt={14}
              style={{ position: "relative" }}
            >
              {props.children}
            </Paper>
          </>
        </div>
      ) : (
        <Paper px="xs" radius="md" mt={14}>
          <Center style={{ height: 50 }}>
            {props.totalAmount >= 1 ? (
              <Text fz="sm" fs="italic">
                  Waiting to hear back from
                  <Anchor fs="italic" pl={4} component="button" type="button" color="green.4" onClick={props.onClickSeeAll}>
                    {props.totalAmount} contact{props.totalAmount > 1 ? "s" : ""}
                  </Anchor>...
              </Text>
            ) : (
              <Text fz="sm">{props.noneMsg}</Text>
            )}
          </Center>
        </Paper>
      )}
    </div>
  );
}
