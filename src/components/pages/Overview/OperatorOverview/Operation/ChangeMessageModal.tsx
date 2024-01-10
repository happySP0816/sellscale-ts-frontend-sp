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
} from "@mantine/core";
import {
  IconAlertTriangle,
  IconCheck,
  IconChevronLeft,
  IconChevronRight,
  IconMessages,
  IconX,
} from "@tabler/icons";

const ChangeMessageModal: FC<ModalProps> = (props) => {
  const [step, setStep] = useState(1);

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
        <Flex align="center" gap={"sm"} mt={"md"}>
          <Avatar size={"sm"} mb="auto" />

          <Box>
            <Text fw={700} size={"sm"}>
              HR Leaders Tier 1 - Gov, Parma, Business Support
            </Text>

            <Flex align={"center"} gap={"sm"}>
              <Text size={"sm"} fw={600} color="gray.6">
                SDR
              </Text>
              <Flex align={"center"}>
                <Avatar size={"sm"} />
                <Text size={"sm"} fw={600}>
                  Adam Meehan
                </Text>
              </Flex>

              <Divider orientation="vertical" />

              <Badge
                color="red"
                leftSection={
                  <IconAlertTriangle size={"0.8rem"} style={{ marginTop: 4 }} />
                }
              >
                2 errors
              </Badge>
            </Flex>
          </Box>
        </Flex>

        <Flex mt={"md"} align={"center"} gap={"sm"}>
          <Text fw={700} size={"sm"} color="gray.6">
            ADJUST WORDING
          </Text>
          <Divider style={{ flex: 1 }} />
          <Flex align={"center"} gap={"sm"}>
            <Text display={"flex"} c={"gray.6"} fw={700} fz={"sm"}>
              <Text c={"blue"} component="span">
                0{step} &nbsp;
              </Text>
              of 02
            </Text>
            <Button.Group>
              <Button variant="default" size="xs" onClick={() => setStep(1)}>
                <IconChevronLeft size={"0.9rem"} />
              </Button>
              <Button variant="default" size="xs" onClick={() => setStep(2)}>
                <IconChevronRight size={"0.9rem"} />
              </Button>
            </Button.Group>
          </Flex>
        </Flex>

        <Card
          mt={"md"}
          radius={"lg"}
          sx={(theme) => ({
            border: `1px dashed ${theme.colors.red[theme.fn.primaryShade()]}`,
          })}
        >
          <Flex align={"center"} gap={"sm"}>
            <IconMessages />
            <Text fw={700} size={"sm"} color="gray.6">
              STEP1: &nbsp;
              <Text color="gray.8" component="span">
                INTRODUCTION
              </Text>
            </Text>
            <Divider style={{ flex: 1 }} />
            <Badge color="red">{"<16% conversion"}</Badge>
          </Flex>

          <Card
            radius={"lg"}
            sx={(theme) => ({
              border: `1px dashed ${
                theme.colors.gray[theme.fn.primaryShade()]
              }`,
            })}
            mt={"md"}
          >
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Natus,
            excepturi delectus vitae exercitationem ad totam aut pariatur
            laboriosam! Eum incidunt nesciunt doloremque ea vero mollitia
            excepturi reprehenderit a, animi omnis.
          </Card>
        </Card>

        <Button
          mt={"md"}
          color="red"
          variant="light"
          w={"100%"}
          styles={{
            inner: {
              justifyContent: "start",
            },
          }}
          leftIcon={
            <IconAlertTriangle size={"0.8rem"} style={{ marginTop: 4 }} />
          }
        >
          You can try rephrasing the message or changing the framework to fix
          this error
        </Button>

        <Flex gap={"lg"} mt={"md"}>
          <Button
            w={"100%"}
            rightIcon={<IconCheck size={"1rem"} />}
            variant="outline"
          >
            Mark as Reviewed
          </Button>
          <Button w={"100%"}>Create New Template</Button>
        </Flex>
      </Box>
    </Modal>
  );
};

export default ChangeMessageModal;
