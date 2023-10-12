import {
  Badge,
  Flex,
  Pagination,
  Paper,
  Table,
  Tabs,
  Text,
  Title,
  rem,
  useMantineTheme,
} from "@mantine/core";
import React from "react";
const elements = [
  {
    cta: "Random long text lorem",
    sdr: "Jared Zhao",
    sendOutreach: 1000,
    accepted: 50,
    activeConvos: 50,
    acceptance: "40%",
  },
  {
    cta: "Random long text lorem",
    sdr: "Jared Zhao",
    sendOutreach: 1000,
    accepted: 50,
    activeConvos: 50,
    acceptance: "40%",
  },
  {
    cta: "Random long text lorem",
    sdr: "Jared Zhao",
    sendOutreach: 1000,
    accepted: 50,
    activeConvos: 50,
    acceptance: "40%",
  },
  {
    cta: "Random long text lorem",
    sdr: "Jared Zhao",
    sendOutreach: 1000,
    accepted: 50,
    activeConvos: 50,
    acceptance: "40%",
  },
  {
    cta: "Random long text lorem",
    sdr: "Jared Zhao",
    sendOutreach: 1000,
    accepted: 50,
    activeConvos: 50,
    acceptance: "40%",
  },
];
const Message = () => {
  const theme = useMantineTheme();
  const rows = elements.map((element, idx) => (
    <tr key={idx}>
      <td
        style={{
          textAlign: "center",
          paddingTop: rem(16),
          paddingBottom: rem(16),
        }}
      >
        <Badge variant="light" radius={"xl"} w={"1.25rem"} h={"1.25rem"} p={0}>
          {idx + 1}
        </Badge>
      </td>
      <td
        style={{
          textAlign: "center",
          paddingTop: rem(16),
          paddingBottom: rem(16),
        }}
      >
        <Text color="gray.8" fw={600}>
          {element.cta}
        </Text>
      </td>
      <td
        style={{
          textAlign: "center",
          paddingTop: rem(16),
          paddingBottom: rem(16),
        }}
      >
        <Badge variant="filled">{element.sdr}</Badge>
      </td>
      <td
        style={{
          textAlign: "center",
          paddingTop: rem(16),
          paddingBottom: rem(16),
        }}
      >
        <Text color="gray.8" fw={600}>
          {element.sendOutreach}
        </Text>
      </td>
      <td
        style={{
          textAlign: "center",
          paddingTop: rem(16),
          paddingBottom: rem(16),
        }}
      >
        <Text color="gray.8" fw={600}>
          {element.accepted}
        </Text>
      </td>
      <td
        style={{
          textAlign: "center",
          paddingTop: rem(16),
          paddingBottom: rem(16),
        }}
      >
        <Text color="gray.8" fw={600}>
          {element.activeConvos}
        </Text>
      </td>
      <td
        style={{
          textAlign: "center",
          paddingTop: rem(16),
          paddingBottom: rem(16),
        }}
      >
        <Text color="gray.8" fw={600}>
          {element.acceptance}
        </Text>
      </td>
    </tr>
  ));
  return (
    <Paper radius={"lg"} mt="md" py={"md"}>
      <Tabs
        defaultValue="first"
        placement="right"
        styles={(theme) => ({
          tabRightSection: {
            marginLeft: rem(4),
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          },
          tab: {
            color: theme.colors.blue[theme.fn.primaryShade()],
            padding: `${rem(16)} ${theme.spacing.xs}`,
            cursor: "pointer",
            fontSize: theme.fontSizes.sm,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 0,
            fontWeight: 700,

            "&:disabled": {
              opacity: 0.5,
              cursor: "not-allowed",
            },

            "&[data-active]": {
              backgroundColor: theme.colors.blue[theme.fn.primaryShade()],
              borderColor: theme.colors.blue[theme.fn.primaryShade()],
              color: theme.white,
              borderStartStartRadius: 12,
              borderStartEndRadius: 12,
            },
          },

          tabIcon: {
            marginRight: rem(4),
            display: "flex",
            alignItems: "center",
          },

          tabsList: {
            display: "flex",
            width: "100%",
            borderColor: theme.colors.blue[2],
            justifyContent: "end",
            alignItems: "center",
          },
        })}
      >
        <Tabs.List px={"md"}>
          <Title mr="auto" order={3}>
            CTA Effectiveness
          </Title>
          <Tabs.Tab
            value="first"
            rightSection={
              <Badge
                size="sm"
                color={"blue"}
                sx={{ pointerEvents: "none" }}
                variant="light"
              >
                150
              </Badge>
            }
          >
            SDR Overview
          </Tabs.Tab>
          <Tabs.Tab
            value="second"
            rightSection={
              <Badge
                size="sm"
                color={"blue"}
                sx={{ pointerEvents: "none" }}
                variant="light"
              >
                150
              </Badge>
            }
          >
            Company overview
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="first" py={"md"}>
          <Flex justify={"space-between"} px={"md"} align={"center"}>
            <Flex>
              <Text color="gray.6" fw={700} size={"sm"}>
                Top Active CTAs Across Users:
              </Text>
              <Text fw={700} color="blue" size={"sm"}>
                &nbsp; Vasti
              </Text>
            </Flex>
            <Flex>
              <Text color="gray.6" fw={500} size={"sm"}>
                Goal is to ensure all CTAs have {">"}20% acceptance rate
              </Text>
            </Flex>
          </Flex>

          <Table
            mt={"md"}
            withBorder
            style={{
              borderTopWidth: 0,
              borderLeftWidth: 0,
              borderRightWidth: 0,
            }}
          >
            <thead>
              <tr
                style={{
                  background: theme.colors.blue[1],
                }}
              >
                <th
                  style={{
                    textAlign: "center",
                    paddingTop: rem(8),
                    paddingBottom: rem(8),
                  }}
                >
                  <Text align="center" color="blue.4" fw={700}>
                    #
                  </Text>
                </th>
                <th style={{ textAlign: "center", width: 400 }}>
                  <Text align="center" color="blue.4" fw={700}>
                    CTA
                  </Text>
                </th>
                <th
                  style={{
                    textAlign: "center",
                    paddingTop: rem(8),
                    paddingBottom: rem(8),
                  }}
                >
                  <Text align="center" color="blue.4" fw={700}>
                    SDR
                  </Text>
                </th>
                <th
                  style={{
                    textAlign: "center",
                    paddingTop: rem(8),
                    paddingBottom: rem(8),
                  }}
                >
                  <Text align="center" color="blue.4" fw={700}>
                    SEND OURREACH
                  </Text>
                </th>
                <th
                  style={{
                    textAlign: "center",
                    paddingTop: rem(8),
                    paddingBottom: rem(8),
                  }}
                >
                  <Text align="center" color="blue.4" fw={700}>
                    ACCEPTED
                  </Text>
                </th>
                <th
                  style={{
                    textAlign: "center",
                    paddingTop: rem(8),
                    paddingBottom: rem(8),
                  }}
                >
                  <Text align="center" color="blue.4" fw={700}>
                    ACTIVE CONVOS
                  </Text>
                </th>
                <th
                  style={{
                    textAlign: "center",
                    paddingTop: rem(8),
                    paddingBottom: rem(8),
                  }}
                >
                  <Text align="center" color="blue.4" fw={700}>
                    ACCEPTANCE
                  </Text>
                </th>
              </tr>
            </thead>
            <tbody>{rows}</tbody>
          </Table>

          <Flex px={"md"} justify={"space-between"} mt={"md"}>
            <Text color="gray.7" fw={600}>
              1 - 20/123
            </Text>
            <Pagination total={10} />
          </Flex>
        </Tabs.Panel>
        <Tabs.Panel value="second">Second panel</Tabs.Panel>
      </Tabs>
    </Paper>
  );
};

export default Message;
