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
  ActionIcon,
} from "@mantine/core";
import { FaLinkedin } from "@react-icons/all-files/fa/FaLinkedin";
import {
  IconCalendar,
  IconExternalLink,
  IconHomeHeart,
  IconX,
} from "@tabler/icons";
import moment from "moment";
import { IconBriefcase, IconBuildingStore } from "@tabler/icons-react";
import { Editor } from "@tiptap/react";
const useStyles = createStyles((theme) => ({
  icon: {
    color: theme.colors.gray[6],
  },
}));
const LowPriority = () => {
  const { classes } = useStyles();
  return (
    <Box>
      {" "}
      <Card withBorder p={"sm"} py={0}>
        <Grid>
          <Grid.Col span={4} py={"sm"}>
            <Box py={"sm"}>
              <Stack spacing={"xs"}>
                <Flex align={"center"} gap={"sm"}>
                  <Avatar />

                  <Box>
                    <Flex>
                      <Text fw={700} size={"sm"}>
                        Donald Bryant &nbsp;
                      </Text>

                      <ActionIcon color="blue.6" size={"sm"}>
                        <IconExternalLink></IconExternalLink>
                      </ActionIcon>
                    </Flex>

                    <Badge size="sm">Very High</Badge>
                  </Box>
                </Flex>
                <Group noWrap spacing={10}>
                  <IconBriefcase
                    stroke={1.5}
                    size={18}
                    className={classes.icon}
                  />
                  <Text size="xs">Lorem ipsum dolor sit amet,</Text>
                </Group>

                <Group noWrap spacing={10}>
                  <IconHomeHeart
                    stroke={1.5}
                    size={16}
                    className={classes.icon}
                  />
                  <Text size="xs">Lorem ipsum dolor sit amet,</Text>
                </Group>

                <Group noWrap spacing={10}>
                  <IconBuildingStore
                    stroke={1.5}
                    size={18}
                    className={classes.icon}
                  />
                  <Text size="xs">Lorem ipsum dolor sit amet,</Text>
                </Group>

                <Group noWrap spacing={10}>
                  <IconBuildingStore
                    stroke={1.5}
                    size={16}
                    className={classes.icon}
                  />
                  <Text size="xs">Lorem ipsum dolor sit amet,</Text>
                </Group>
              </Stack>
            </Box>
          </Grid.Col>
          <Grid.Col
            py={"sm"}
            span={8}
            sx={(theme) => ({
              borderLeft: `1px solid ${theme.colors.gray[2]}`,
            })}
          >
            <Flex direction={"column"} h={"100%"} p={"sm"}>
              <Flex justify={"space-between"}>
                <Text fw={600} fz={"lg"} c={"gray.8"}>
                  Last Message:
                </Text>
                <Text c={"gray.6"}>
                  {moment(new Date()).format("d/MM/YYYY hh:mm A")}
                </Text>
              </Flex>

              <Box
                bg={"gray.2"}
                p={"sm"}
                sx={{ borderRadius: rem(12) }}
                mt={"md"}
                fz={"sm"}
                fw={500}
              >
                Lorem, ipsum dolor sit amet consectetur adipisicing elit. Quo
                accusantium maiores iure officiis delectus, nisi laudantium
                voluptatum ut sit autem quos nostrum quam deleniti ullam aliquam
                magni modi magnam non.
              </Box>
            </Flex>
          </Grid.Col>
        </Grid>
      </Card>
      <Flex
        mt={"md"}
        mb={"sm"}
        justify={"flex-end"}
        align={"center"}
        gap={"sm"}
      >
        <Text fw={700} color="gray.6">
          Mark As:
        </Text>
        <Flex gap={"sm"}>
          <Button
            variant="outline"
            color="gray"
            leftIcon={<IconX color="red" />}
          >
            Not Interested
          </Button>
          <Button
            variant="outline"
            color="gray"
            leftIcon={<IconX color="red" />}
          >
            Not Qualified
          </Button>
          <Button leftIcon={<IconCalendar />}>Schedule</Button>
        </Flex>
      </Flex>
    </Box>
  );
};

export default LowPriority;
