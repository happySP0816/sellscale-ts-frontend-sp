import {
  Button,
  Card,
  Divider,
  Flex,
  Paper,
  Select,
  Text,
} from "@mantine/core";
import { IconArrowsExchange } from "@tabler/icons";
import { useState } from "react";

export default function CRMUserMapping() {
  const [users, setUsers] = useState([
    "Johnny S.",
    "Sarah D.",
    "Emilia Z.",
    "Gibso L.",
  ]);
  const [crmUsers, setCrmUsers] = useState([
    "Johnny Samol",
    "Sarah P. Dwane",
    "Emilia M. PhD Zhukov",
    "Gibson L.",
  ]);
  return (
    <Paper withBorder mt="md" p="lg" radius="md" bg={"#fcfcfd"}>
      <Flex align={"center"} justify={"space-between"}>
        <Flex direction={"column"} mb={"md"}>
          <Text fw={600} size={20}>
            CRM User Mapping (Coming Soon ⚠️)
          </Text>
          <Text color="gray" size={"sm"}>
            Last updated: 04/11/2024 14:52 PM
          </Text>
        </Flex>
        <Button variant="outline">Save</Button>
      </Flex>
      <Divider />
      <Flex direction={"column"} gap={"sm"} mt={"md"}>
        {users.map((item, index) => {
          return (
            <Flex gap={"sm"} align={"center"}>
              <Select
                w={"100%"}
                label={index === 0 && <Text color="gray">SellScale User</Text>}
                placeholder="Pick value"
                data={users}
                value={item}
              />
              <Flex>
                <IconArrowsExchange
                  color="gray"
                  style={{ marginTop: `${index === 0 ? "26px" : "0px"}` }}
                />
              </Flex>
              <Select
                w={"100%"}
                label={index === 0 && <Text color="gray">CRM User</Text>}
                placeholder="Pick value"
                data={crmUsers}
                value={crmUsers[index]}
              />
            </Flex>
          );
        })}
      </Flex>
    </Paper>
  );
}
