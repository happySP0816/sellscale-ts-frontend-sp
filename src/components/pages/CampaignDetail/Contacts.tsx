import {
  Box,
  Button,
  Card,
  Divider,
  Flex,
  Group,
  ScrollArea,
  Stack,
  Text,
} from "@mantine/core";
import { CampaignEntityData } from '@pages/CampaignDetail';
import { IconArrowRight } from "@tabler/icons";
import React, { Fragment, useState } from "react";
const mocksData = [
  "Devops Engineer",
  "Security Engineer",
  "Security Engineer 1",
  "Security Engineer 2",
  "Security Engineer 3",
  "Security Engineer 4",
];

type PropsType = {
  data: CampaignEntityData | undefined
};

const Contacts = (props: PropsType) => {
  const [topStatus, setTopStatus] = useState("");
  const [topAttributeArray, setTopAttributeArray]: any = useState([]);

  return (
    <Card withBorder px={0}>
      <Flex justify={"space-between"} px={"sm"}>
        <Text fw={600} fz={"lg"}>
          524 Contacts
        </Text>

        <Button compact rightIcon={<IconArrowRight />} radius={"xl"}>
          Contacts
        </Button>
      </Flex>
      <Divider my={"sm"} />

      <Box px="sm">
        <Text fw={600}>Selected Filters</Text>

        <Stack mt={"sm"}>
          <Box display={props.data?.contacts.included_individual_title_keywords.length ? "block" : "none"}>
            <Text c={"gray.6"} fz={"sm"}>
              JOB TITLE
            </Text>

            <Flex wrap={"wrap"} gap={"xs"} mt="xs">
              {props.data?.contacts.included_individual_title_keywords.map((i) => (
                <Button
                  color="green.2"
                  sx={{ color: "black", fontWeight: 500 }}
                  compact
                  key={i}
                  radius={"xl"}
                  size="xs"
                >
                  {i}
                </Button>
              ))}
            </Flex>
          </Box>

          <Box display={props.data?.contacts.included_individual_industry_keywords.length ? "block" : "none"}>
            <Text c={"gray.6"} fz={"sm"}>
              INDUSTRY
            </Text>

            <Flex wrap={"wrap"} gap={"xs"} mt="xs">
              {props.data?.contacts.included_individual_industry_keywords.map((i) => (
                <Button
                  color="pink.2"
                  sx={{ color: "black", fontWeight: 500 }}
                  compact
                  key={i}
                  radius={"xl"}
                  size="xs"
                >
                  {i}
                </Button>
              ))}
            </Flex>
          </Box>

          <Box display={props.data?.contacts.included_individual_skills_keywords.length ? "block" : "none"}>
            <Text c={"gray.6"} fz={"sm"}>
              SKILLS
            </Text>

            <Flex wrap={"wrap"} gap={"xs"} mt="xs">
              {props.data?.contacts.included_individual_skills_keywords.map((i) => (
                <Button
                  color="orange.2"
                  sx={{ color: "black", fontWeight: 500 }}
                  compact
                  key={i}
                  radius={"xl"}
                  size="xs"
                >
                  {i}
                </Button>
              ))}
            </Flex>
          </Box>

          <Box display={props.data?.contacts.included_individual_locations_keywords.length ? "block" : "none"}>
            <Text c={"gray.6"} fz={"sm"}>
              LOCATION
            </Text>

            <Flex wrap={"wrap"} gap={"xs"} mt="xs">
              {props.data?.contacts.included_individual_locations_keywords.map((i) => (
                <Button
                  color="blue.2"
                  compact
                  key={i}
                  radius={"xl"}
                  size="xs"
                  sx={{ color: "black", fontWeight: 500 }}
                >
                  {i}
                </Button>
              ))}
            </Flex>
          </Box>

          <Box display={props.data?.contacts.included_company_generalized_keywords.length ? "block" : "none"}>
            <Text c={"gray.6"} fz={"sm"}>
              COMPANY
            </Text>

            <Flex wrap={"wrap"} gap={"xs"} mt="xs">
              {props.data?.contacts.included_company_generalized_keywords.map((i) => (
                <Button
                  color="blue.2"
                  compact
                  key={i}
                  radius={"xl"}
                  size="xs"
                  sx={{ color: "black", fontWeight: 500 }}
                >
                  {i}
                </Button>
              ))}
            </Flex>
          </Box>

          <Box display={props.data?.contacts.included_company_industries_keywords.length ? "block" : "none"}>
            <Text c={"gray.6"} fz={"sm"}>
              COMPANY INDUSTRY
            </Text>

            <Flex wrap={"wrap"} gap={"xs"} mt="xs">
              {props.data?.contacts.included_company_industries_keywords.map((i) => (
                <Button
                  color="pink.2"
                  sx={{ color: "black", fontWeight: 500 }}
                  compact
                  key={i}
                  radius={"xl"}
                  size="xs"
                >
                  {i}
                </Button>
              ))}
            </Flex>
          </Box>

          <Box display={props.data?.contacts.included_company_locations_keywords.length ? "block" : "none"}>
            <Text c={"gray.6"} fz={"sm"}>
              COMPANY LOCATION
            </Text>

            <Flex wrap={"wrap"} gap={"xs"} mt="xs">
              {props.data?.contacts.included_company_locations_keywords.map((i) => (
                <Button
                  color="blue.2"
                  compact
                  key={i}
                  radius={"xl"}
                  size="xs"
                  sx={{ color: "black", fontWeight: 500 }}
                >
                  {i}
                </Button>
              ))}
            </Flex>
          </Box>

          <Box display={props.data?.contacts.included_company_name_keywords.length ? "block" : "none"}>
            <Text c={"gray.6"} fz={"sm"}>
              COMPANY NAME
            </Text>

            <Flex wrap={"wrap"} gap={"xs"} mt="xs">
              {props.data?.contacts.included_company_name_keywords.map((i) => (
                <Button
                  color="blue.2"
                  compact
                  key={i}
                  radius={"xl"}
                  size="xs"
                  sx={{ color: "black", fontWeight: 500 }}
                >
                  {i}
                </Button>
              ))}
            </Flex>
          </Box>


        </Stack>
      </Box>

      <Divider my={"sm"} />

      <Box px={"sm"}>
        <Flex gap={"md"}>
          <Button
            onClick={() => {
              setTopAttributeArray(props.data?.top_attributes.top_titles);
              setTopStatus("title");
            }}
            style={{ flex: 1 }}
            variant={topStatus === "title" ? "filled" : "outline"}
          >
            Top Titles
          </Button>
          <Button
            onClick={() => {
              setTopAttributeArray(props.data?.top_attributes.top_industries);
              setTopStatus("industry");
            }}
            style={{ flex: 1 }}
            variant={topStatus === "industry" ? "filled" : "outline"}
          >
            Top Industries
          </Button>
          <Button
            onClick={() => {
              setTopAttributeArray(props.data?.top_attributes.top_companies);
              setTopStatus("company");
            }}
            style={{ flex: 1 }}
            variant={topStatus === "company" ? "filled" : "outline"}
          >
            Top Companies
          </Button>
        </Flex>

        {topStatus && (
          <ScrollArea
            mt={"sm"}
            h={300}
            px={"md"}
            styles={(theme) => ({
              scrollbar: {
                "&, &:hover": {
                  background:
                    theme.colorScheme === "dark"
                      ? theme.colors.dark[6]
                      : theme.colors.gray[0],
                },

                '&[data-orientation="vertical"] .mantine-ScrollArea-thumb': {
                  backgroundColor: theme.colors.blue[6],
                },
              },

              corner: {
                opacity: 1,
                background:
                  theme.colorScheme === "dark"
                    ? theme.colors.dark[6]
                    : theme.colors.gray[0],
              },
            })}
          >
            <Stack mt={"sm"}>
              {topAttributeArray?.map((entry, idx) => {
                  let i = entry['attribute']
                  let j = entry['count']
                  return <Fragment key={i}>
                    <Box key={i}>
                      <Flex align={"center"} justify={"space-between"}>
                        <Text fw={600} color="gray.8">
                          {i}
                        </Text>
                        <Text fw={600} color="gray.6">
                          {j}
                        </Text>
                      </Flex>
                      {mocksData.length - 1 !== idx && <Divider mt={"sm"} />}
                    </Box>
                  </Fragment>
                }
              )}
            </Stack>
          </ScrollArea>
        )}
      </Box>
    </Card>
  );
};

export default Contacts;
