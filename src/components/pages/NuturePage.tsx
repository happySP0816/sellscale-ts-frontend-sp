import PageFrame from "@common/PageFrame";
import {
  Box,
  Center,
  Group,
  Stack,
  Title,
  Select,
  Button,
  ThemeIcon,
  MantineColor,
  Popover,
  useMantineTheme,
  Switch,
  LoadingOverlay,
  Skeleton,
} from "@mantine/core";
import {
  IconBoxMultiple,
  IconBrandLinkedin,
  IconCalendarTime,
  IconCheck,
  IconPlus,
  IconX,
} from "@tabler/icons";
import { createStyles, rem, Text } from "@mantine/core";
import { useDisclosure, useListState } from "@mantine/hooks";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DraggableProvidedDragHandleProps,
} from "react-beautiful-dnd";
import { IconGripVertical } from "@tabler/icons-react";
import { ReactNode, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { testDelay } from "@utils/general";

const useStyles = createStyles((theme) => ({
  item: {
    display: "flex",
    alignItems: "center",
    borderRadius: theme.radius.md,
    border: `${rem(1)} solid ${
      theme.colorScheme === "dark" ? theme.colors.dark[5] : theme.colors.gray[2]
    }`,
    padding: `${theme.spacing.sm} ${theme.spacing.xl}`,
    paddingLeft: `calc(${theme.spacing.xl} - ${theme.spacing.md})`, // to offset drag handle
    backgroundColor:
      theme.colorScheme === "dark" ? theme.colors.dark[5] : theme.white,
    marginBottom: theme.spacing.sm,
  },

  itemDragging: {
    boxShadow: theme.shadows.sm,
  },

  symbol: {
    fontSize: rem(30),
    fontWeight: 700,
    width: rem(60),
  },

  dragHandle: {
    ...theme.fn.focusStyles(),
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    color:
      theme.colorScheme === "dark"
        ? theme.colors.dark[1]
        : theme.colors.gray[6],
    paddingLeft: theme.spacing.md,
    //paddingRight: theme.spacing.md,
  },
}));

export default function NuturePage() {
  const data = [
    {
      id: 1,
      icon: <IconBrandLinkedin size="3rem" />,
      color: "blue",
      name: "Job Change",
      description:
        "Detect when a prospect changes companies and send them a congratulatory message.",
      prospect_count: 19,
      example_message: `Congratulations on the new role Franklin! Let's find a time to connect - excited to catch up and see if we can work together.`,
      active: true,
    },
    {
      id: 2,
      icon: <IconBrandLinkedin size="3rem" />,
      color: "blue",
      name: "Promotion",
      description:
        "Detect when a prospect gets promoted and send them a congratulatory message.",
      prospect_count: 9,
      example_message: `Loading...`,
      active: true,
    },
    {
      id: 3,
      icon: <IconCalendarTime size="3rem" />,
      color: "pink",
      name: "Every Quarter",
      description:
        "Send nuturing messages to add more value to disengaged prospects until they are interested.",
      prospect_count: 44,
      example_message: `Loading...`,
      active: true,
    },
    {
      id: 4,
      icon: <IconBoxMultiple size="3rem" />,
      color: "yellow",
      name: "Job Posting",
      description: `Identify when there's a new job posting on "PracticeMatch" and trigger a message to the prospect.`,
      prospect_count: 82,
      example_message: `Loading...`,
      active: false,
    },
  ];

  const { classes, cx } = useStyles();
  const [state, handlers] = useListState(data);

  const { isFetching } = useQuery({
    queryKey: [`get-all-projects`, {}],
    queryFn: async ({ queryKey }) => {
      // @ts-ignore
      // eslint-disable-next-line
      const [_key, {}] = queryKey;

      await testDelay(600);
      return null;
    },
    refetchOnWindowFocus: false,
    enabled: true,
  });

  const items = state.map((item, index) => (
    <Draggable key={item.id} index={index} draggableId={item.id + ""}>
      {(provided, snapshot) => (
        <div
          className={cx(classes.item, {
            [classes.itemDragging]: snapshot.isDragging,
          })}
          ref={provided.innerRef}
          {...provided.draggableProps}
        >
          <NurtureItem item={item} dragHandleProps={provided.dragHandleProps} />
        </div>
      )}
    </Draggable>
  ));

  return (
    <PageFrame>
      <Center>
      <LoadingOverlay visible={isFetching} />
        <Stack w={"50vw"}>
          {isFetching ? (
            <Skeleton visible={isFetching}></Skeleton>
          ) : (
            <>
              <Box>
                <Title order={2}>Re-Engagement Platform</Title>
                <Group position="apart" noWrap>
                  <Box sx={{ flexBasis: "60%" }}>
                    <Text fz="xs" pl={3}>
                      Identify intent signals and automatically send prospects
                      highly personalized messages to strike re-engagement.
                    </Text>
                  </Box>
                  <Box sx={{ flexBasis: "20%" }}></Box>
                  <Box sx={{ flexBasis: "20%" }}>
                    <Button
                      variant="outline"
                      rightIcon={<IconPlus size="0.9rem" />}
                    >
                      Add Pulse
                    </Button>
                  </Box>
                </Group>
              </Box>
              <Box>
                <DragDropContext
                  onDragEnd={({ destination, source }) =>
                    handlers.reorder({
                      from: source.index,
                      to: destination?.index || 0,
                    })
                  }
                >
                  <Droppable droppableId="dnd-list" direction="vertical">
                    {(provided) => (
                      <div {...provided.droppableProps} ref={provided.innerRef}>
                        {items}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              </Box>
            </>
          )}
        </Stack>
      </Center>
    </PageFrame>
  );
}

function NurtureItem(props: {
  item: {
    id: number;
    icon: ReactNode;
    color: MantineColor;
    name: string;
    description: string;
    prospect_count: number;
    example_message: string;
    active: boolean;
  };
  dragHandleProps: DraggableProvidedDragHandleProps | null | undefined;
}) {
  const { classes, cx } = useStyles();
  const theme = useMantineTheme();
  const item = props.item;

  const [opened, { close, open }] = useDisclosure(false);
  const [checked, setChecked] = useState(item.active);

  return (
    <Group position="apart" w="100%" noWrap>
      <div {...props.dragHandleProps} className={classes.dragHandle}>
        <IconGripVertical size="1.05rem" stroke={1.5} />
      </div>
      <ThemeIcon size="lg" variant="light" radius="md" color={item.color}>
        {item.icon}
      </ThemeIcon>
      <Box maw={200}>
        <Title order={4} fw={500}>
          {item.name}
        </Title>
        <Text color="dimmed" size={9}>
          {item.description}
        </Text>
      </Box>
      <Box>
        <Popover
          width={400}
          position="bottom"
          withArrow
          shadow="md"
          opened={opened}
        >
          <Popover.Target>
            <Button
              onMouseEnter={open}
              onMouseLeave={close}
              variant="light"
              size="xs"
            >
              Example Message
            </Button>
          </Popover.Target>
          <Popover.Dropdown sx={{ pointerEvents: "none" }}>
            <Text size="sm">{item.example_message}</Text>
          </Popover.Dropdown>
        </Popover>
      </Box>
      <Box>
        <Text size="sm" span>
          <Text fw="700" span>
            {item.prospect_count}{" "}
          </Text>
          <Text size="xs" span>
            prospects
          </Text>
        </Text>
      </Box>
      <Box>
        <Switch
          checked={checked}
          onChange={(event) => setChecked(event.currentTarget.checked)}
          color="teal"
          size="xs"
          thumbIcon={
            checked ? (
              <IconCheck
                size="0.6rem"
                color={theme.colors.teal[theme.fn.primaryShade()]}
                stroke={3}
              />
            ) : (
              <IconX
                size="0.6rem"
                color={theme.colors.red[theme.fn.primaryShade()]}
                stroke={3}
              />
            )
          }
        />
      </Box>
    </Group>
  );
}
