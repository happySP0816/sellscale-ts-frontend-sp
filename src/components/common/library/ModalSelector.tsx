import {
  Box,
  Button,
  ButtonProps,
  Center,
  Divider,
  Flex,
  Group,
  Loader,
  LoadingOverlay,
  Modal,
  Paper,
  ScrollArea,
  Stack,
  Title,
  Tooltip,
  useMantineTheme,
} from "@mantine/core";
import { useDisclosure, useHover } from "@mantine/hooks";
import { IconPencil } from "@tabler/icons-react";
import _ from "lodash";

export default function ModalSelector(props: {
  selector: {
    content?: React.ReactNode;
    buttonProps?: ButtonProps;
    onClick?: () => void | boolean;
    onClickChange?: () => void;
    noChange?: boolean;
    override?: React.ReactNode; // This will override the selector button UI to the TSX provided
  };
  title: {
    name: string;
    rightSection?: React.ReactNode;
  };
  activeItemId?: number;
  loading: boolean;
  size?: number;
  items: {
    id: number;
    name: string;
    leftSection?: React.ReactNode;
    content: React.ReactNode;
    rightSection?: React.ReactNode;
    onClick?: () => void;
  }[];
  header?: {
    leftSection?: React.ReactNode;
    content: React.ReactNode;
    rightSection?: React.ReactNode;
  };
  footer?: {
    leftSection?: React.ReactNode;
    content: React.ReactNode;
    rightSection?: React.ReactNode;
  };
}) {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      {props.selector.override ? (
        <Box onClick={open}>{props.selector.override}</Box>
      ) : (
        <Button.Group>
          <Button
            {...props.selector.buttonProps}
            compact
            onClick={() => {
              if (props.selector.onClick) {
                const result = props.selector.onClick();
                if (result === true) {
                  open();
                }
              }
            }}
          >
            {props.selector.content}
          </Button>
          {props.selector.noChange ? null : (
            <Tooltip label={props.title.name} withArrow>
              <Button
                {...props.selector.buttonProps}
                compact
                onClick={() => {
                  props.selector.onClickChange &&
                    props.selector.onClickChange();
                  open();
                }}
              >
                {props.loading ? (
                  <Loader size="1.1rem" />
                ) : (
                  <IconPencil size="1.1rem" />
                )}
              </Button>
            </Tooltip>
          )}
        </Button.Group>
      )}
      <Modal
        opened={opened}
        onClose={close}
        title={
          <Flex w="100%" pr="6px">
            <Flex dir="row" justify="space-between" align={"center"} w="100%">
              <Title order={3}>{props.title.name}</Title>
              <Group>
                <Box>{props.title.rightSection}</Box>
              </Group>
            </Flex>
          </Flex>
        }
        styles={{ title: { width: "100%" } }}
        size={props.size}
      >
        <Paper
          p={0}
          h={"70vh"}
          style={{
            position: "relative",
          }}
        >
          <LoadingOverlay visible={props.loading} />
          <Group
            position="apart"
            sx={{
              flexDirection: "column",
              height: "100%",
              overflowX: "hidden",
            }}
            align="flex-start"
            noWrap
          >
            {props.header && (
              <Flex gap={10} wrap="nowrap" w={"100%"} h={30}>
                <Box
                  sx={{ flexBasis: props.header.leftSection ? "15%" : "0%" }}
                >
                  <Center>{props.header.leftSection}</Center>
                </Box>
                <Box sx={{}}>{props.header.content}</Box>
                <Box
                  sx={{ flexBasis: props.header.rightSection ? "27%" : "0%" }}
                >
                  <Flex justify="flex-end">{props.header.rightSection}</Flex>
                </Box>
              </Flex>
            )}
            <ScrollArea h={props.footer ? "60vh" : "70vh"}>
              <Stack py={4} spacing={0}>
                {props.items.map((item, index) => (
                  <ModalSelectorOption
                    key={index}
                    active={item.id === props.activeItemId ? true : undefined}
                    leftSection={item.leftSection}
                    content={item.content}
                    rightSection={item.rightSection}
                    onClick={() => {
                      item.onClick && item.onClick();
                      close();
                    }}
                  />
                ))}
              </Stack>
            </ScrollArea>
            {props.footer && (
              <Flex gap={10} wrap="nowrap" w={"100%"} h={30}>
                <Box
                  sx={{ flexBasis: props.footer.leftSection ? "15%" : "0%" }}
                >
                  <Center>{props.footer.leftSection}</Center>
                </Box>
                <Box sx={{}}>{props.footer.content}</Box>
                <Box
                  sx={{ flexBasis: props.footer.rightSection ? "27%" : "0%" }}
                >
                  <Flex justify="flex-end">{props.footer.rightSection}</Flex>
                </Box>
              </Flex>
            )}
          </Group>
        </Paper>
      </Modal>
    </>
  );
}

function ModalSelectorOption(props: {
  active?: boolean;
  leftSection?: React.ReactNode;
  content: React.ReactNode;
  rightSection?: React.ReactNode;
  onClick?: () => void;
}) {
  const theme = useMantineTheme();

  const { hovered, ref } = useHover();

  return (
    <Box>
      <Box
        py={10}
        sx={{
          backgroundColor:
            props.active ?? hovered ? theme.colors.gray[1] : "transparent",
        }}
      >
        <Flex ref={ref} gap={10} wrap="nowrap" w={"100%"}>
          <Box sx={{ flexBasis: props.leftSection ? "15%" : "0%" }}>
            <Center>{props.leftSection}</Center>
          </Box>
          <Box
            sx={{
              cursor: "pointer",
            }}
            onClick={() => {
              props.onClick && props.onClick();
            }}
          >
            {props.content}
          </Box>
          <Box sx={{ flexBasis: props.rightSection ? "27%" : "0%" }}>
            <Flex justify="flex-end">{props.rightSection}</Flex>
          </Box>
        </Flex>
      </Box>
      <Divider m={0} />
    </Box>
  );
}
