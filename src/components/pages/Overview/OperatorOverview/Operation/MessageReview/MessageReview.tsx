import React, { FC, useState } from "react";
import {
  Box,
  Card,
  Text,
  Flex,
  Badge,
  Button,
  Modal,
  Avatar,
  Divider,
  rem,
  Title,
  ActionIcon,
  ModalProps,
  Transition,
  Grid,
  Tooltip,
} from "@mantine/core";
import {
  IconAlertTriangle,
  IconChartAreaLine,
  IconCheck,
  IconChevronLeft,
  IconChevronRight,
  IconExternalLink,
  IconMessages,
  IconPencil,
  IconX,
} from "@tabler/icons";

const STEP = [
  {
    id: 1,
    title: "Introduction",
    icon: <IconMessages size={"1rem"} />,
    message:
      " Lorem ipsum dolor sit amet consectetur adipisicing elit. Inventore excepturi in laborum atque sequi? Exercitationem accusantium ea numquam nostrum magnam quos est earum. Veniam modi, praesentium temporibus ut eligendi quia.",
  },
  {
    id: 2,
    title: "Pain points opener",
    icon: <IconChartAreaLine size={"1rem"} />,
    message:
      " Lorem ipsum dolor sit amet consectetur adipisicing elit. Inventore excepturi in laborum atque sequi? Exercitationem accusantium ea numquam nostrum magnam quos est earum. Veniam modi, praesentium temporibus ut eligendi quia.",
  },
  {
    id: 3,
    title: "About us",
    icon: <IconMessages size={"1rem"} />,
    message:
      " Lorem ipsum dolor sit amet consectetur adipisicing elit. Inventore excepturi in laborum atque sequi? Exercitationem accusantium ea numquam nostrum magnam quos est earum. Veniam modi, praesentium temporibus ut eligendi quia.",
  },
];

const MessageReviewModal: FC<ModalProps> = (props) => {
  const [step, setStep] = useState(0);
  const renderItemBox = (s: (typeof STEP)[0]) => {
    return (
      <Box>
        <Flex
          align={"center"}
          justify={"space-between"}
          wrap={"wrap"}
          gap={"sm"}
        >
          <Text
            display="flex"
            fw={700}
            color="gray.6"
            sx={{ alignItems: "center" }}
          >
            {s.icon} &nbsp; STEP {s.id}: &nbsp;
            <Text component="span" color="gray.8">
              {s.title}
            </Text>
          </Text>

          <Button
            compact
            size="sm"
            color="gray"
            variant="light"
            leftIcon={<IconPencil size={"0.8rem"} />}
          >
            Edit
          </Button>
        </Flex>
        <Divider w={"100%"} my={"md"} />
        <Box>
          <Text fz={"sm"} fw={500}>
            {s.message}
          </Text>
        </Box>
      </Box>
    );
  };

  return (
    <Modal
      {...props}
      styles={{
        title: {
          fontWeight: 700,
          fontSize: rem(24),
        },
      }}
      title=""
      size={"xl"}
      withCloseButton={false}
    >
      <Box>
        <Flex justify={"space-between"}>
          <Title order={3}>Messaging Review</Title>

          <ActionIcon onClick={props.onClose} size={"lg"}>
            <IconX />
          </ActionIcon>
        </Flex>

        <Box
          mt={"md"}
          sx={(theme) => ({
            border: `1px dashed ${theme.colors.gray[theme.fn.primaryShade()]}`,
            borderRadius: theme.radius.md,
          })}
          p={"md"}
        >
          {renderItemBox(STEP[step])}

          <Flex
            mt={"md"}
            align={"center"}
            justify={"space-between"}
            wrap={"wrap"}
            gap={"sm"}
          >
            <Tooltip
              withArrow
              width={220}
              multiline
              radius={"md"}
              color="red"
              label="You can try rephrasing the message or changing the framework to fix this error"
            >
              <Badge
                color="red"
                styles={{
                  leftSection: {
                    marginBottom: 0,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  },
                }}
                leftSection={<IconAlertTriangle size={"0.8rem"} />}
              >
                {"<16% conversation"}
              </Badge>
            </Tooltip>
            <Flex align={"center"} gap={"xs"}>
              <Text size={"sm"} color="gray.6" fw={700}>
                <Text color="red.6" component="span">
                  &nbsp;{step + 1}
                </Text>{" "}
                OF {STEP.length} MESSAGES
              </Text>

              <Button.Group>
                <Button
                  variant="default"
                  size="xs"
                  onClick={() => setStep((s) => s - 1)}
                  compact
                  disabled={step === 0}
                >
                  <IconChevronLeft size={"0.9rem"} />
                </Button>
                <Button
                  variant="default"
                  size="xs"
                  disabled={step === STEP.length - 1}
                  onClick={() => setStep((s) => s + 1)}
                  compact
                >
                  <IconChevronRight size={"0.9rem"} />
                </Button>
              </Button.Group>
            </Flex>
          </Flex>
        </Box>

        <Card bg={"gray.2"} mt={"md"} withBorder>
          <Flex align={"center"} gap={"xs"}>
            <Text size={"xs"} color="gray.6" fw={700}>
              CAMPAIGN:
            </Text>
            <Flex align={"center"} gap={"xs"}>
              <Text size={"xs"} color="gray.8" fw={700} display={"flex"}>
                <Avatar size={"xs"} /> &nbsp; Lorem ipsum dolor sit, amet
                consectetur adipisicing elit.
              </Text>
            </Flex>
          </Flex>

          <Flex align={"center"} gap={"xs"}>
            <Text size={"xs"} color="gray.6" fw={700}>
              SDR:
            </Text>
            <Text size={"xs"} color="gray.8" fw={700}>
              Lorem ipsum dolor sit.
            </Text>
          </Flex>
        </Card>
        <Grid gutter={"md"} mt={"md"}>
          <Grid.Col md={6}>
            <Button
              w={"100%"}
              rightIcon={<IconExternalLink size={"1rem"} />}
              variant="outline"
              component="a"
              target="_blank"
              rel="noopener noreferrer"
              href={`/campaigns/${1}`}
            >
              View Campaign
            </Button>
          </Grid.Col>
          <Grid.Col md={6}>
            <Button w={"100%"} rightIcon={<IconCheck size={"1rem"} />}>
              Mark as Resolved
            </Button>
          </Grid.Col>
        </Grid>
      </Box>
    </Modal>
  );
};

export default MessageReviewModal;
