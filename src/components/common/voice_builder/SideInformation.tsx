import {
  ActionIcon,
  Avatar,
  Box,
  Button,
  Flex,
  ScrollArea,
  Text,
  rem,
} from "@mantine/core";
import {
  IconEdit,
  IconBrandLinkedin,
  IconBulb,
  IconBriefcase,
  IconBuildingStore,
  IconHomeHeart,
  IconExternalLink,
} from "@tabler/icons-react";
import { TrainMessage } from "./TrainYourAi";
import { proxyURL } from "@utils/general";
import _ from "lodash";

const SideInformation = (props: { message: TrainMessage }) => {

  const borderGray = "#E9ECEF";
  const blue = "#228be6";

  const information = [
    {
      content: props.message.prospect?.title,
      icon: <IconBriefcase width={18} stroke="gray.6" />,
      disable: true,
    },
    {
      content: props.message.prospect?.location,
      icon: <IconHomeHeart width={18} stroke="gray.6" />,
      disable: true,
    },
    {
      content: props.message.prospect?.company,
      icon: <IconBuildingStore width={18} stroke="gray.6" />,
      link: props.message.prospect?.company_url,
      disable: true,
    },
    {
      content: props.message.prospect?.company_hq,
      icon: <IconBuildingStore width={18} stroke="gray.6" />,
      disable: true,
    },
    {
      content: props.message.prospect?.linkedin_url,
      icon: <IconBrandLinkedin width={18} stroke="gray.6" />,
      disable: true,
      link: props.message.prospect?.linkedin_url,
    },
  ];

  return (
    <ScrollArea
      sx={{
        borderLeft: `1px solid ${borderGray}`,
        height: `calc(100vh - 3.5rem)`,
      }}
    >
      <Box px={"1rem"} py={"0.5rem"}>
        <Box px={"1.5rem"} py={"0.5rem"} w={"100%"}>
          <Flex align={"center"}>
            <Avatar
              radius="xl"
              w={60}
              h={60}
              src={proxyURL(props.message.prospect?.img_url)}
            />

            <Box ml={"1rem"}>
              <Text weight={700} fz={"1.25rem"}>
                {props.message.prospect?.full_name}
              </Text>

              {/* <Text weight={700} color="blue.5">
                8:60 at New york
              </Text> */}
            </Box>
          </Flex>
        </Box>

        <Flex
          direction={"column"}
          gap={"0.0rem"}
          sx={{ border: `1px solid ${borderGray}`, borderRadius: 12 }}
          p={"1rem"}
          pl={"1.5rem"}
          pos={"relative"}
        >
          {information.map((info, idx) => (
            <Flex h={"100%"} key={idx} align="center">
              <Flex align={"center"}>{info.icon}</Flex>
              <Flex align={"center"} ml={12}>
                <Text
                  fz={rem(14)}
                  weight={600}
                  color={info.disable ? "gray.6" : "#000"}
                >
                  {info.content}
                </Text>

                {info.link && (
                  <ActionIcon>
                    <IconExternalLink width={14} />
                  </ActionIcon>
                )}
              </Flex>
            </Flex>
          ))}

          {/* <ActionIcon
            top={"0.5rem"}
            right={"0.5rem"}
            pos={"absolute"}
            color="gray.6"
          >
            <IconEdit width={16} height={16} />
          </ActionIcon> */}
        </Flex>
      </Box>

      <Box
        sx={{
          borderTop: `1px solid ${borderGray}`,
          borderBottom: `1px solid ${borderGray}`,
        }}
        p={'1rem'}
      >
        <Flex justify={"space-between"}>
          <Text weight={700}>CTA Used</Text>
          <Button variant="light" compact>
            <IconBrandLinkedin width={12} />
            <Text weight={700} ml={".25rem"}>
              Linkedin
            </Text>
          </Button>
        </Flex>

        <Box
          mt={"1rem"}
          p={"1rem"}
          sx={{
            border: `1px dashed ${borderGray}`,
            borderRadius: 12,
          }}
        >
          {props.message.meta_data?.cta?.text_value}
        </Box>
      </Box>

      <Box
        sx={{
          borderTop: `1px solid ${borderGray}`,
        }}
        p={'1rem'}
      >
        <Flex justify={"space-between"}>
          <Text weight={700}>Research Used</Text>
        </Flex>

        <Flex direction={"column"} gap={8}>
          {(props.message.meta_data.research_points as any[]).map((point, idx) => (
            <Box
              key={idx}
              mt={"1rem"}
              sx={{
                border: `1px solid ${borderGray}`,
                borderRadius: 12,
              }}
            >
              <Flex
                bg={"blue.0"}
                px={"1.5rem"}
                w={"100%"}
                py={"0.25rem"}
                align={"center"}
              >
                <IconBulb width={16} color={blue} />
                <Text color="blue" weight={600} fz={".75rem"}>
                  {_.startCase(point.research_point_type.toLowerCase())}
                </Text>
              </Flex>

              <Box p={"1rem"}>
                <Text>
                  {point.value}
                </Text>
              </Box>
            </Box>
          ))}
        </Flex>
      </Box>
    </ScrollArea>
  );
};

export default SideInformation;
