import {
  Card,
  Container,
  Grid,
  TextInput,
  Text,
  Box,
  Flex,
  Title,
  Button,
  useMantineTheme,
  rem,
  ActionIcon,
  Stack,
  Badge,
  Divider,
  Modal,
} from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { SCREEN_SIZES } from "../../../constants/data";
import RichTextArea from "@common/library/RichTextArea";
import {
  IconAlertOctagon,
  IconArrowRight,
  IconCheck,
  IconCircleCheck,
  IconCircleX,
  IconClock,
  IconDownload,
  IconOctagon,
} from "@tabler/icons";
import { IconSparkles } from "@tabler/icons-react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, Tooltip, ArcElement, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const EmailGrader = () => {
  const [opened, { open, close, toggle }] = useDisclosure(false);
  const smScreenOrLess = useMediaQuery(`(max-width: ${SCREEN_SIZES.SM})`);
  const theme = useMantineTheme();
  const percentage = [
    {
      percentage: 80,
      color: theme.colors.green[4],
    },

    {
      percentage: 60,
      color: theme.colors.red[4],
    },
    {
      percentage: 30,
      color: theme.colors.orange[4],
    },
  ];
  const currentPercentage = 74;

  return (
    <>
      <Container
        px={5}
        py={15}
        sx={(theme) => ({
          width: `clamp(50px, ${
            smScreenOrLess ? "180vw" : "calc(100vw - 180px)"
          }, 1200px)`,
          maxWidth: "100%",
        })}
      >
        <Grid>
          <Grid.Col md={6} xs={12}>
            <Card sx={{ display: "flex", flexDirection: "column" }}>
              <Box>
                <Text color="gray.6" fw={600} fz={"sm"}>
                  SUBJECT LINE
                </Text>
                <TextInput />
              </Box>

              <Box mt={"sm"}>
                <Text color="gray.6" fw={600} fz={"sm"}>
                  BODY
                </Text>

                <Box>
                  <RichTextArea height={500} />
                </Box>
              </Box>

              <Flex mt={"sm"} justify={"end"}>
                <Button
                  color="violet"
                  radius={"lg"}
                  onClick={() => toggle()}
                  leftIcon={<IconSparkles size={"0.8rem"} />}
                >
                  Generate Feedback
                </Button>
              </Flex>
            </Card>
          </Grid.Col>
          <Grid.Col md={6} xs={12}>
            <Card>
              <Flex align={"center"} justify={"space-between"}>
                <Title order={2}>AI Feedback Report</Title>

                <Button
                  leftIcon={<IconDownload size={"0.8rem"} />}
                  compact
                  radius={"sm"}
                  color="gray"
                  variant="light"
                >
                  Download Report
                </Button>
              </Flex>
            </Card>

            <Card mt={"sm"}>
              <Flex align={"center"} gap={"sm"}>
                {/* <Box w={"30%"} pos={"relative"}>
                  <Doughnut
                    data={data}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      rotation: -90,
                      circumference: 180,
                      plugins: {
                        legend: {
                          display: false,
                        },
                        tooltip: {
                          enabled: false,
                        },
                      },
                    }}
                  />

                  <Text
                    sx={{
                      position: "absolute",
                      bottom: 0,
                      left: "50%",
                      transform: "translateX(-50%)",
                    }}
                    fz={"sm"}
                  >
                    <Text component="span" fw={700} fz={"md"}>
                      74
                    </Text>
                    /100
                  </Text>
                </Box> */}

                <Box
                  sx={{
                    width: "180px",
                    height: "90px",
                    position: "relative",

                    display: "flex",
                    alignItems: "flex-end",
                    justifyContent: "center",
                    overflow: "hidden",
                    boxSizing: "border-box",

                    "&:before": {
                      content: '""',
                      width: "180px",
                      height: "90px",
                      border: `20px solid ${theme.colors.gray[4]}`,
                      position: "absolute",
                      transformOrigin: "50%  0% 0",
                      borderRadius: "120px 120px 0 0",
                      borderBottom: 0,
                      left: 0,
                      top: 0,
                    },
                  }}
                >
                  <Text fz={"sm"}>
                    <Text component="span" fw={700} fz={"md"}>
                      74
                    </Text>
                    /100
                  </Text>
                  {percentage.map((i, idx) => (
                    <Box
                      key={idx}
                      sx={(theme) => ({
                        width: "180px",
                        height: "90px",
                        border: `20px solid ${i.color}`,
                        borderTop: "none",
                        position: "absolute",
                        transformOrigin: "50%  0% 0",
                        borderRadius: "0 0 120px 120px",
                        left: "0",
                        top: "100%",
                        zIndex: 5,
                        animation: "1s fillGraphAnimation ease-in",
                        boxSizing: "border-box",
                        transform: `rotate(calc(1deg*${i.percentage}*1.8))`,

                        "&:before": {
                          content: '""',
                          width: "180px",
                          height: "90px",
                          borderBottom: `3px solid white`,
                          position: "absolute",
                          transformOrigin: "left",
                          transform: `rotate(calc(1deg*100*1.8))`,
                          left: 0,
                          top: 0,
                        },
                      })}
                    />
                  ))}

                  <Box
                    sx={(theme) => ({
                      width: "180px",
                      height: "90px",
                      border: `20px solid transparent`,
                      borderTop: "none",
                      position: "absolute",
                      transformOrigin: "50%  0% 0",
                      borderRadius: "0 0 120px 120px",
                      left: "0",
                      top: "100%",
                      zIndex: 5,
                      animation: "1s fillGraphAnimation ease-in",
                      boxSizing: "border-box",
                      transform: `rotate(calc(1deg*${currentPercentage}*1.8))`,

                      "&:before": {
                        content: '""',
                        width: "20px",
                        height: "1px",
                        borderBottom: `3px solid black`,
                        position: "absolute",
                        transformOrigin: "left",
                        transform: `rotate(calc(1deg*100*1.8))`,
                        left: 0,
                        top: 0,
                      },
                    })}
                  />
                </Box>

                <Card withBorder sx={{ flex: 1, height: "fit-content" }}>
                  <Text
                    fw={700}
                    fz={"sm"}
                    sx={{ display: "flex", alignItems: "center", gap: rem(4) }}
                  >
                    <ActionIcon color="green">
                      <IconCircleCheck stroke={1.5} />
                    </ActionIcon>
                    You have a good score!
                  </Text>

                  <Text fz={"sm"} color="gray.6">
                    This email is off to a great start and beats 30% of cold
                    emails send out
                  </Text>
                </Card>
              </Flex>
            </Card>

            <Card mt={"sm"}>
              <Text fw={700} color="gray.6" fz={"sm"}>
                Feedback
              </Text>

              <Stack mt={"md"}>
                <Flex gap={"xs"}>
                  <Box>
                    <IconArrowRight />
                  </Box>
                  <Text fw={600} fz={"xs"}>
                    Lorem ipsum dolor sit amet consectetur adipisicing elit.
                    Pariatur, eaque velit mollitia, ipsam sapiente illum iure
                    accusantium tempore ratione quos quo vel suscipit explicabo
                    iste eos quas asperiores atque dolorum!
                  </Text>
                </Flex>

                <Flex gap={"xs"}>
                  <Box>
                    <IconArrowRight />
                  </Box>
                  <Text fw={600} fz={"xs"}>
                    Lorem ipsum dolor sit amet consectetur adipisicing elit.
                    Pariatur, eaque velit mollitia, ipsam sapiente illum iure
                    accusantium tempore ratione quos quo vel suscipit explicabo
                    iste eos quas asperiores atque dolorum!
                  </Text>
                </Flex>

                <Flex gap={"xs"}>
                  <Box>
                    <IconArrowRight />
                  </Box>
                  <Text fw={600} fz={"xs"}>
                    Lorem ipsum dolor sit amet consectetur adipisicing elit.
                    Pariatur, eaque velit mollitia, ipsam sapiente illum iure
                    accusantium tempore ratione quos quo vel suscipit explicabo
                    iste eos quas asperiores atque dolorum!
                  </Text>
                </Flex>
              </Stack>
            </Card>

            <Grid mt={"sm"}>
              <Grid.Col md={6} xs={12}>
                <Card>
                  <Text fw={700} color="gray.6" fz={"sm"}>
                    TONES:
                  </Text>

                  <Flex wrap={"wrap"} gap={"sm"} mt={"sm"}>
                    <Badge color="blue" variant="light">
                      #Commanding
                    </Badge>

                    <Badge color="orange" variant="light">
                      #Funny
                    </Badge>

                    <Badge color="green" variant="light">
                      #Happy
                    </Badge>

                    <Badge color="red" variant="light">
                      #Happy
                    </Badge>
                  </Flex>
                </Card>

                <Card mt={"sm"}>
                  <Text fw={700} color="gray.6" fz={"sm"}>
                    CONSTRUCTION
                  </Text>

                  <Stack mt={"sm"}>
                    <Box>
                      <Flex gap={"xs"} align={"center"}>
                        <ActionIcon color="green" size={"sm"}>
                          <IconCircleCheck />
                        </ActionIcon>
                        <Text fw={600} fz={"sm"}>
                          Subject Line
                        </Text>
                      </Flex>
                      <Divider mt={"xs"} />
                    </Box>
                    <Box>
                      <Flex gap={"xs"} align={"center"}>
                        <ActionIcon color="red" size={"sm"}>
                          <IconAlertOctagon />
                        </ActionIcon>
                        <Text fw={600} fz={"sm"} color="red">
                          Spam Words
                        </Text>
                      </Flex>
                      <Divider mt={"xs"} />
                    </Box>

                    <Box>
                      <Flex gap={"xs"} align={"center"}>
                        <ActionIcon color="green" size={"sm"}>
                          <IconCircleCheck />
                        </ActionIcon>
                        <Text fw={600} fz={"sm"}>
                          Subject Line
                        </Text>
                      </Flex>
                    </Box>
                  </Stack>
                </Card>
              </Grid.Col>
              <Grid.Col md={6} xs={12}>
                <Card>
                  <Text fw={700} color="gray.6" fz={"sm"}>
                    PERSONALIZATIONS:
                  </Text>
                  <Text fw={500} color="gray.6" fz={"sm"}>
                    3 personalizations identified
                  </Text>
                  <Stack mt={"sm"}>
                    <Badge color="gray">
                      Lorem, ipsum dolor sit amet consectetur.
                    </Badge>
                    <Badge color="gray">
                      Lorem, ipsum dolor sit amet consectetur.
                    </Badge>
                    <Badge color="gray">
                      Lorem, ipsum dolor sit amet consectetur.
                    </Badge>
                  </Stack>
                </Card>

                <Card mt={"sm"}>
                  <Text fw={700} color="gray.6" fz={"sm"}>
                    READ QUANTITY & TIME
                  </Text>
                  <Text
                    mt={"xs"}
                    fw={700}
                    fz={"lg"}
                    display={"flex"}
                    sx={{ gap: rem(4), alignItems: "center" }}
                  >
                    <ActionIcon size={"sm"}>
                      <IconClock />
                    </ActionIcon>
                    83 seconds
                  </Text>

                  <Text fw={700} color="gray.6" fz={"sm"} mt={"xs"}>
                    The average reader will only read for 30 seconds. This email
                    is way too long.
                  </Text>
                </Card>
              </Grid.Col>
            </Grid>
          </Grid.Col>
        </Grid>
      </Container>

      <Modal opened={opened} onClose={close} title="Feedback" />
    </>
  );
};

export default EmailGrader;
