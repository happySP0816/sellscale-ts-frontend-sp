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
  Text,
  TextInput,
  Title,
  Tooltip,
  useMantineTheme,
} from "@mantine/core";
import { useDisclosure, useHover } from "@mantine/hooks";
import { IconSearch } from '@tabler/icons';
import { IconEdit, IconPencil } from "@tabler/icons-react";
import _ from "lodash";
import { useState } from 'react';

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
  showSearchbar?: boolean;
  activeItemId?: number;
  loading: boolean;
  size?: number;
  zIndex?: number;
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

  const [search, setSearch] = useState('');
  const filteredItems = props.items.filter((item) => {
    if (!search) return true;
    return item?.name?.toLowerCase().includes(search.toLowerCase());
  })

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
                  <IconEdit size="1.1rem" />
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
        zIndex={props.zIndex ?? 1000}
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
            {
              props.showSearchbar && 
              <TextInput 
                placeholder="Search" 
                onChange={(e) => setSearch(e.currentTarget.value)}
                icon={<IconSearch size='0.9rem' />} 
                w='100%'
                autoFocus
              />
            }
            <ScrollArea h={props.footer ? "60vh" : "70vh"} w="100%">
              <Stack py={4} spacing={0}>
                {filteredItems.map((item, index) => (
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
          {props.leftSection && (
            <Box sx={{ flexBasis: "15%" }}>
              <Center>{props.leftSection}</Center>
            </Box>
          )}
          <Box
            sx={{
              cursor: "pointer",
              width: "100%",
            }}
            onClick={() => {
              props.onClick && props.onClick();
            }}
          >
            {props.content}
          </Box>
          {props.rightSection && (
            <Box sx={{ flexBasis: "27%" }} ml="auto" mr="md">
              <Flex justify="flex-end">{props.rightSection}</Flex>
            </Box>
          )}
        </Flex>
      </Box>
      <Divider m={0} />
    </Box>
  );
}
