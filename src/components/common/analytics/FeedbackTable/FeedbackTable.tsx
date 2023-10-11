import React from "react";
import { Badge, Paper, Table, Title, Text, Flex, Box } from "@mantine/core";
import moment from "moment";
const elements = [
  {
    status: "FEEDBACK_NEEDED",
    title: "Staff Software Enginner",
    company: "Airbnb",
    demoDate: new Date(),
    name: "Carbon",
  },
  {
    status: "FEEDBACK_NEEDED",
    title: "Staff Software Enginner",
    company: "Airbnb",
    demoDate: new Date(),
    name: "Nitrogen",
  },
  {
    status: "FEEDBACK_NEEDED",
    title: "Staff Software Enginner",
    company: "Airbnb",
    demoDate: new Date(),
    name: "Yttrium",
  },
  {
    status: "FEEDBACK_NEEDED",
    title: "Staff Software Enginner",
    company: "Airbnb",
    demoDate: new Date(),
    name: "Barium",
  },
  {
    status: "DEMO_HAPPENING_SOON",
    title: "Staff Software Enginner",
    company: "Airbnb",
    demoDate: new Date(),
    name: "Cerium",
  },
];

const FeedbackTable = () => {
  const rows = elements.map((element) => (
    <tr key={element.name}>
      <td>
        <Text
          fw={700}
          align="center"
          style={{ paddingTop: "0.5rem", paddingBottom: "0.5rem" }}
        >
          {element.name}
        </Text>
      </td>
      <td>
        <Text
          fw={700}
          style={{ paddingTop: "0.5rem", paddingBottom: "0.5rem" }}
          align="center"
          color="gray.6"
        >
          {element.title}
        </Text>
      </td>
      <td>
        <Text
          fw={700}
          style={{ paddingTop: "0.5rem", paddingBottom: "0.5rem" }}
          align="center"
          color="gray.6"
        >
          {element.company}
        </Text>
      </td>
      <td>
        <Text
          fw={700}
          style={{ paddingTop: "0.5rem", paddingBottom: "0.5rem" }}
          align="center"
          color="gray.6"
        >
          {element.status === "FEEDBACK_NEEDED" &&
            moment(element.demoDate).format("MMMM Do YYYY, h:mm:ss a")}
        </Text>
      </td>
      <td>
        <Flex
          justify={"center"}
          style={{ paddingTop: "0.5rem", paddingBottom: "0.5rem" }}
        >
          {element.status === "FEEDBACK_NEEDED" ? (
            <Badge fw={700}>Feedback Needed</Badge>
          ) : (
            <Badge color="green" fw={700}>
              Demo happening soon
            </Badge>
          )}
        </Flex>
      </td>
    </tr>
  ));

  return (
    <Paper py={"md"}>
      <Box>
        <Title order={2}>Feedback needed</Title>

        <Text color="gray.6" size={"sm"} fw={700} mt={"xs"}>
          Random text
        </Text>
      </Box>
      <Table mt={"md"}>
        <thead>
          <tr>
            <th>
              <Text
                fw={700}
                align="center"
                color="gray.5"
                size={"lg"}
                style={{ paddingTop: "0.5rem", paddingBottom: "0.5rem" }}
              >
                PROSPECT NAME
              </Text>
            </th>
            <th>
              <Text
                fw={700}
                align="center"
                color="gray.5"
                size={"lg"}
                style={{ paddingTop: "0.5rem", paddingBottom: "0.5rem" }}
              >
                TITLE
              </Text>
            </th>
            <th>
              <Text
                fw={700}
                align="center"
                color="gray.5"
                size={"lg"}
                style={{ paddingTop: "0.5rem", paddingBottom: "0.5rem" }}
              >
                COMPANY
              </Text>
            </th>
            <th>
              <Text
                fw={700}
                align="center"
                color="gray.5"
                size={"lg"}
                style={{ paddingTop: "0.5rem", paddingBottom: "0.5rem" }}
              >
                DEMO DATE
              </Text>
            </th>
            <th>
              <Text
                fw={700}
                align="center"
                color="gray.5"
                size={"lg"}
                style={{ paddingTop: "0.5rem", paddingBottom: "0.5rem" }}
              >
                MESSAGE
              </Text>
            </th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </Table>
    </Paper>
  );
};

export default FeedbackTable;
