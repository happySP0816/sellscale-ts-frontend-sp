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
  Group,
  createStyles,
  Textarea,
  Rating,
} from "@mantine/core";
import { FaLinkedin } from "@react-icons/all-files/fa/FaLinkedin";
import { IconExternalLink, IconHomeHeart } from "@tabler/icons";
import moment from "moment";
import { IconBriefcase, IconBuildingStore } from "@tabler/icons-react";
import { Editor } from "@tiptap/react";
const useStyles = createStyles((theme) => ({
  icon: {
    color: theme.colors.gray[6],
  },
}));
const MediumPriority = () => {
  const { classes } = useStyles();
  return (
    <Box>
      <Grid>
        <Grid.Col span={4}>
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
                <Avatar size={"md"} />

                <Box>
                  <Text fz={"xs"} fw={700}>
                    Demo #1 with XXX
                  </Text>
                  <Text fz={"xs"}>
                    Demo on{" "}
                    <Text component="span" c={"blue"} fw={500}>
                      {moment(new Date()).format("MMMM d,yyyy")}
                    </Text>
                  </Text>
                </Box>
              </Flex>
            </Flex>
            <Card withBorder radius={"lg"} p={"xs"}>
              <Stack spacing={"xs"}>
                <Group noWrap spacing={10} mt={3}>
                  <IconBriefcase
                    stroke={1.5}
                    size={18}
                    className={classes.icon}
                  />
                  <Text size="xs">Lorem ipsum dolor sit amet,</Text>
                </Group>

                <Group noWrap spacing={10} mt={5}>
                  <IconHomeHeart
                    stroke={1.5}
                    size={16}
                    className={classes.icon}
                  />
                  <Text size="xs">Lorem ipsum dolor sit amet,</Text>
                </Group>

                <Group noWrap spacing={10} mt={5}>
                  <IconBuildingStore
                    stroke={1.5}
                    size={18}
                    className={classes.icon}
                  />
                  <Text size="xs">Lorem ipsum dolor sit amet,</Text>
                </Group>

                <Group noWrap spacing={10} mt={5}>
                  <IconBuildingStore
                    stroke={1.5}
                    size={16}
                    className={classes.icon}
                  />
                  <Text size="xs">Lorem ipsum dolor sit amet,</Text>
                </Group>
              </Stack>
            </Card>
          </Stack>
        </Grid.Col>
        <Grid.Col span={8}>
          <Flex direction={"column"} h={"100%"}>
            <Box sx={{ flex: 1 }}>
              <Textarea
                styles={{
                  root: {
                    width: "100%",
                    height: "100%",
                  },
                  wrapper: {
                    width: "100%",
                    height: "100%",
                  },
                  input: {
                    width: "100%",
                    height: "100%",
                  },
                }}
                placeholder="Write Feedback here"
              />
            </Box>
            <Flex
              w={"100%"}
              mt={"sm"}
              justify={"space-between"}
              align={"center"}
            >
              <Flex align={"center"} gap={'xs'}>
                <Text fw={700}>Rating:</Text>

                <Rating />
              </Flex>
              <Button radius={"md"}>Add Demo Feedback</Button>
            </Flex>
          </Flex>
        </Grid.Col>
      </Grid>
    </Box>
  );
};

export default MediumPriority;
