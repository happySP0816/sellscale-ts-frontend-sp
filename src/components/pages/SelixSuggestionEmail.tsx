import { Avatar, Box, Button, Center, Divider, Flex, Image, Paper, Stack, Text } from "@mantine/core";
import { LogoFull } from "@nav/Logo";
import { IconBrandLinkedin } from "@tabler/icons";
import { IconSparkles } from "@tabler/icons-react";
import { useState } from "react";
import Logo from "@assets/images/logo.png";

export default function SelixSuggestionEmail() {
  const [data, setData] = useState([
    {
      title: "McKinsey R&I Outreach",
      content: "Contact Research & Intelligence alumni working at F500 companies who used to work at McKinsey before.",
      open: 37,
      lead_count: 80,
      conv: 2,
      profile_to_use: [
        {
          avatar: "",
          name: "Daniel Green",
        },
        {
          avatar: "",
          name: "Emily Ross",
        },
      ],
      linkedin: true,
    },
    {
      title: "McKinsey R&I Outreach",
      content: "Contact Research & Intelligence alumni working at F500 companies who used to work at McKinsey before.",
      open: 37,
      lead_count: 80,
      conv: 2,
      profile_to_use: [
        {
          avatar: "",
          name: "Daniel Green",
        },
        {
          avatar: "",
          name: "Emily Ross",
        },
      ],
      linkedin: true,
    },
  ]);
  return (
    <Center bg={"white"} py={"xl"}>
      <Paper w={"40%"}>
        <Flex align={"center"} gap={"sm"} justify={"center"}>
          <Avatar src={Logo} size={"md"} radius={"xl"} />
          <Text size={40} fw={500}>
            SellScale
          </Text>
        </Flex>
        <Box mt={"xl"}>
          <Text>Hey Aakash,</Text>
          <Text mt={"lg"}>
            In the last two weeks, we ran <span className="font-bold">{7} campaigns</span> and got <span className="font-bold">{2} acceptances</span> out of{" "}
            <span className="font-bold">{12} sent.</span> We had a few more ideas for you to try.
          </Text>
        </Box>
        {data.map((item, index) => {
          return (
            <Paper shadow="sm" mt={"md"} withBorder radius={"sm"} px={"sm"} py={"md"} key={index} bg={"#fcfcfd"}>
              <Flex gap={"xs"} align={"start"}>
                <div className="bg-[#228be6] w-[12px] h-[10px] rounded-full mt-[6px]"></div>
                <Stack spacing={"sm"} pr={"10px"}>
                  <Text size={"md"} fw={600}>
                    {item.title}
                  </Text>
                  <Text size={"xs"} color="gray" fw={500} lineClamp={3}>
                    {item.content}
                  </Text>
                  <Paper withBorder p={"sm"} radius={"sm"} my={4}>
                    <Flex align={"center"} justify={"space-between"}>
                      <Box w={"100%"}>
                        <Text align="center" size={"md"} fw={600}>
                          {item.open}%
                        </Text>
                        <Text size={"xs"} align="center" fw={500} color="gray">
                          Est. Open %
                        </Text>
                      </Box>
                      <Divider orientation="vertical" />
                      <Box w={"100%"}>
                        <Text size={"md"} fw={600} align="center">
                          {item.lead_count}+
                        </Text>
                        <Text size={"xs"} fw={500} color="gray" align="center">
                          Est. Lead Count %
                        </Text>
                      </Box>
                      <Divider orientation="vertical" />
                      <Box w={"100%"}>
                        <Text size={"md"} fw={600} align="center">
                          {item.conv}+
                        </Text>
                        <Text size={"xs"} fw={500} color="gray" align="center">
                          Est. Conv #
                        </Text>
                      </Box>
                    </Flex>
                  </Paper>
                  <Flex align={"center"} justify={"space-between"}>
                    <Box>
                      <Flex align={"center"} gap={"2px"}>
                        <Text size={"xs"} color="gray" fw={500}>
                          Profile to use:
                        </Text>
                        {item.profile_to_use?.map((profileItem, profileIndex) => {
                          return (
                            <Flex align={"center"} key={profileIndex}>
                              <Avatar size={"sm"} radius={"xl"} src={profileItem.avatar} />
                              <Text size={"xs"} fw={500}>
                                {profileItem.name}
                              </Text>
                            </Flex>
                          );
                        })}
                      </Flex>
                    </Box>
                    <Box>
                      <Flex align={"center"} gap={"xs"}>
                        <Text size={"xs"} color="gray" fw={500}>
                          Channels:
                        </Text>
                        <IconBrandLinkedin color="white" fill="#228be6" />
                        <Text size={"xs"} fw={500} ml={-6}>
                          LinkedIn
                        </Text>
                      </Flex>
                    </Box>
                  </Flex>
                  <Button leftIcon={<IconSparkles color="white" />} color="grape">
                    Request via Selix
                  </Button>
                </Stack>
              </Flex>
            </Paper>
          );
        })}
        <Box mt={"xl"}>
          <Text>Best,</Text>
          <Text fw={600}>Selix AI</Text>
        </Box>
      </Paper>
    </Center>
  );
}
