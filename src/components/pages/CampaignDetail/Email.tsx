import {
  Card,
  Button,
  Divider,
  Flex,
  Text,
  Grid,
  Avatar,
  Badge,
  Box,
  rem,
} from "@mantine/core";
import React from "react";
import { IconArrowRight, IconMessages } from "@tabler/icons";

const Email = () => {
  return (
    <Card withBorder px={0} pb={0}>
      <Flex justify={"space-between"} px={"sm"}>
        <Text fw={600} fz={'lg'}>3-Step Email Sequence</Text>

        <Button compact rightIcon={<IconArrowRight />} radius={"xl"}>
          GO TO SEQUENCE
        </Button>
      </Flex>
      <Divider mt={"sm"} />

      <Grid>
        <Grid.Col span={4}>
          <Flex
            w={"100%"}
            h={"100%"}
            bg={"gray.0"}
            sx={(theme) => ({
              borderRight: `1px solid ${theme.colors.gray[4]}`,
            })}
            direction={"column"}
            align={"center"}
            justify={"center"}
          >
            <Text
              c={"gray.6"}
              fw={500}
              display={"flex"}
              sx={{ gap: rem(4), alignItems: "center" }}
            >
              <IconMessages size={"0.9rem"} />
              Step 1:
            </Text>
            <Text fw={700}>Casual Opener</Text>
          </Flex>
        </Grid.Col>

        <Grid.Col span={8}>
          <Box p={"md"}>
            <Flex justify={"space-between"} align={"center"}>
              <Flex align={"center"} gap={"xs"}>
                <Avatar size={"md"} />
                <Text fw={700} fz={"md"}>
                  Adam Meehan
                </Text>
              </Flex>

              <Badge>5 Personal</Badge>
            </Flex>

            <Text mt={"sm"} fz={"sm"} c={"gray.6"} fw={500}>
              Lorem, ipsum dolor sit amet consectetur adipisicing elit. Sint
              accusamus illum rerum ea nihil consectetur dicta, molestias
              possimus labore, perspiciatis quaerat rem quo magni voluptatibus
              similique harum quae a dolorem. Repellat corporis dolorem optio
              magni deserunt! Cupiditate mollitia vel, aut nesciunt quas cum
              modi quos! Voluptatem natus, numquam, quae, tenetur debitis
              molestias ipsum autem accusamus quidem odio culpa beatae mollitia.
            </Text>
          </Box>
        </Grid.Col>
      </Grid>
      <Divider />
      <Grid>
        <Grid.Col span={4}>
          <Flex
            w={"100%"}
            h={"100%"}
            bg={"gray.0"}
            sx={(theme) => ({
              borderRight: `1px solid ${theme.colors.gray[4]}`,
            })}
            direction={"column"}
            align={"center"}
            justify={"center"}
          >
            <Text
              c={"gray.6"}
              fw={500}
              display={"flex"}
              sx={{ gap: rem(4), alignItems: "center" }}
            >
              <IconMessages size={"0.9rem"} />
              Step 2:
            </Text>
            <Text fw={700}>About Us</Text>
          </Flex>
        </Grid.Col>

        <Grid.Col span={8}>
          <Box p={"md"}>
            <Flex justify={"space-between"} align={"center"}>
              <Flex align={"center"} gap={"xs"}>
                <Avatar size={"md"} />
                <Text fw={700} fz={"md"}>
                  Adam Meehan
                </Text>
              </Flex>

              <Badge>5 Personal</Badge>
            </Flex>

            <Text mt={"sm"} fz={"sm"} c={"gray.6"} fw={500}>
              Lorem, ipsum dolor sit amet consectetur adipisicing elit. Sint
              accusamus illum rerum ea nihil consectetur dicta, molestias
              possimus labore, perspiciatis quaerat rem quo magni voluptatibus
              similique harum quae a dolorem. Repellat corporis dolorem optio
              magni deserunt! Cupiditate mollitia vel, aut nesciunt quas cum
              modi quos! Voluptatem natus, numquam, quae, tenetur debitis
              molestias ipsum autem accusamus quidem odio culpa beatae mollitia.
            </Text>
          </Box>
        </Grid.Col>
      </Grid>
      <Divider />
      <Grid>
        <Grid.Col span={4}>
          <Flex
            w={"100%"}
            h={"100%"}
            bg={"gray.0"}
            sx={(theme) => ({
              borderRight: `1px solid ${theme.colors.gray[4]}`,
            })}
            direction={"column"}
            align={"center"}
            justify={"center"}
          >
            <Text
              c={"gray.6"}
              fw={500}
              display={"flex"}
              sx={{ gap: rem(4), alignItems: "center" }}
            >
              <IconMessages size={"0.9rem"} />
              Step 3:
            </Text>
            <Text fw={700}>Break-up Message</Text>
          </Flex>
        </Grid.Col>

        <Grid.Col span={8}>
          <Box p={"md"}>
            <Flex justify={"space-between"} align={"center"}>
              <Flex align={"center"} gap={"xs"}>
                <Avatar size={"md"} />
                <Text fw={700} fz={"md"}>
                  Adam Meehan
                </Text>
              </Flex>

              <Badge>5 Personal</Badge>
            </Flex>

            <Text mt={"sm"} fz={"sm"} c={"gray.6"} fw={500}>
              Lorem, ipsum dolor sit amet consectetur adipisicing elit. Sint
              accusamus illum rerum ea nihil consectetur dicta, molestias
              possimus labore, perspiciatis quaerat rem quo magni voluptatibus
              similique harum quae a dolorem. Repellat corporis dolorem optio
              magni deserunt! Cupiditate mollitia vel, aut nesciunt quas cum
              modi quos! Voluptatem natus, numquam, quae, tenetur debitis
              molestias ipsum autem accusamus quidem odio culpa beatae mollitia.
            </Text>
          </Box>
        </Grid.Col>
      </Grid>
    </Card>
  );
};

export default Email;
