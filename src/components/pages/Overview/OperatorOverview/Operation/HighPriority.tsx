import {
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  Flex,
  Grid,
  Stack,
  Text,
  rem,
} from "@mantine/core";
import { FaLinkedin } from "@react-icons/all-files/fa/FaLinkedin";
import { IconExternalLink } from "@tabler/icons";

const HighPriority = () => {
  return (
    <Box>
      <Grid>
        <Grid.Col span={6}>
          <Stack h={"100%"}>
            <Flex
              p={"xs"}
              sx={(theme) => ({
                border: `1px dashed ${
                  theme.colors.blue[theme.fn.primaryShade()]
                }`,
                borderRadius: rem(12),
              })}
              justify={"space-between"}
            >
              <Flex align={"center"}>
                <Text fz={"xs"}>3-Step Campaign: &nbsp;</Text>
                <Text fw={700} fz={"xs"}>
                  Executive Decision Makers
                </Text>
              </Flex>

              <FaLinkedin color="blue" />
            </Flex>
            <Box
              bg={"gray.2"}
              p={"xs"}
              sx={{ borderRadius: rem(12) }}
              h={"100%"}
            >
              <Text transform="uppercase" size={"sm"} fw={700} color="gray.6">
                Example Message
              </Text>

              <Text size={"sm"} mt={"xs"}>
                Lorem ipsum dolor sit amet consectetur adipisicing elit.
                Consectetur labore perspiciatis sapiente itaque. Quasi doloribus
                quibusdam, ducimus eum earum vitae voluptatem aliquid
                perferendis veritatis debitis nobis iste soluta quam quis.
              </Text>
            </Box>
          </Stack>
        </Grid.Col>
        <Grid.Col span={6}>
          <Card withBorder radius={"lg"}>
            <Flex justify={"space-between"}>
              <Flex>
                <Text fz={"xs"}>Contacts &nbsp;</Text>
                <Text fw={700} fz={"xs"}>
                  (238)
                </Text>
              </Flex>
              <Text fw={700} fz={"xs"} color="gray.6">
                +235 MORE
              </Text>
            </Flex>

            <Stack mt={"sm"}>
              {new Array(3).fill(0).map((i, idx) => (
                <Flex align={"center"} gap={"sm"}>
                  <Avatar size={"lg"} />

                  <Flex sx={{ flex: 1 }} direction={"column"}>
                    <Flex align={"center"} justify={"space-between"} w={"100%"}>
                      <Flex fw={700} fz={"xs"}>
                        Arron Mackey
                      </Flex>

                      <Badge size="xs">Very Hight</Badge>
                    </Flex>
                    <Text fw={700} fz={"xs"} color="gray.6" mt={4}>
                      Lorem ipsum, dolor sit amet consectetur adipisicing elit.
                    </Text>
                  </Flex>
                </Flex>
              ))}
            </Stack>
          </Card>
        </Grid.Col>
      </Grid>

      <Flex w={"100%"} mt={"sm"}>
        <Button rightIcon={<IconExternalLink />} ml={"auto"} radius={"md"}>
          View And Mark As Complete
        </Button>
      </Flex>
    </Box>
  );
};

export default HighPriority;
