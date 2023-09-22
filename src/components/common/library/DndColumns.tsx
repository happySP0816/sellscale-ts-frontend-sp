import { co, cx } from "@fullcalendar/core/internal-common";
import {
  Box,
  Paper,
  ScrollArea,
  SimpleGrid,
  Stack,
  createStyles,
  rem,
} from "@mantine/core";
import React, { ReactNode, useState } from "react";
import {
  DragDropContext,
  Draggable,
  DropResult,
  Droppable,
} from "react-beautiful-dnd";

const useStyles = createStyles((theme) => ({
  item: {
    ...theme.fn.focusStyles(),
    display: "flex",
    alignItems: "center",
    borderRadius: theme.radius.md,
    border: `${rem(1)} solid ${
      theme.colorScheme === "dark" ? theme.colors.dark[5] : theme.colors.gray[2]
    }`,
    padding: `5px 0px`,
    width: "100%",
    backgroundColor:
      theme.colorScheme === "dark" ? theme.colors.dark[5] : theme.white,
    marginBottom: "1rem",
  },

  itemDragging: {
    boxShadow: theme.shadows.sm,
  },

  symbol: {
    fontSize: rem(30),
    fontWeight: 700,
    width: rem(60),
  },
}));

export default function DndColumns(props: {
  initialColumns: Record<
    string,
    {
      id: string;
      header?: ReactNode;
      footer?: ReactNode;
      data: { id: string; content: ReactNode }[];
    }
  >;
  wrapInPaper?: boolean;
  listHeight?: number;
  onColumnChange?: (
    startColId: string,
    endColId: string,
    itemId: string
  ) => void;
}) {
  const { classes, cx } = useStyles();

  const [columns, setColumns] = useState(props.initialColumns);

  const onDragEnd = ({ source, destination }: DropResult) => {
    // Make sure we have a valid destination
    if (destination === undefined || destination === null) return null;

    // Make sure we're actually moving the item
    if (
      source.droppableId === destination.droppableId &&
      destination.index === source.index
    )
      return null;

    // Set start and end variables
    const start = columns[source.droppableId];
    const end = columns[destination.droppableId];

    // If start is the same as end, we're in the same column
    if (start === end) {
      // Move the item within the list
      // Start by making a new list without the dragged item
      const newList = start.data.filter(
        (_: any, idx: number) => idx !== source.index
      );

      // Then insert the item at the right location
      newList.splice(destination.index, 0, start.data[source.index]);

      // Then create a new copy of the column object
      const newCol = {
        id: start.id,
        data: newList,
        header: start.header,
        footer: start.footer,
      };

      // Update the state
      setColumns((state) => ({ ...state, [newCol.id]: newCol }));
      return null;
    } else {
      // If start is different from end, we need to update multiple columns
      // Filter the start list like before
      const newStartList = start.data.filter(
        (_: any, idx: number) => idx !== source.index
      );

      // Create a new start column
      const newStartCol = {
        id: start.id,
        data: newStartList,
        header: start.header,
        footer: start.footer,
      };

      // Make a new end list array
      const newEndList = end.data;

      // Insert the item into the end list
      newEndList.splice(destination.index, 0, start.data[source.index]);

      // Create a new end column
      const newEndCol = {
        id: end.id,
        data: newEndList,
        header: end.header,
        footer: end.footer,
      };

      // Update the state
      setColumns((state) => ({
        ...state,
        [newStartCol.id]: newStartCol,
        [newEndCol.id]: newEndCol,
      }));

      // Call the onColumnChange callback
      props.onColumnChange &&
        props.onColumnChange(
          newStartCol.id,
          newEndCol.id,
          start.data[source.index].id
        );

      return null;
    }
  };

  const renderDroppable = (col: {
    id: string;
    header?: ReactNode;
    footer?: ReactNode;
    data: {
      id: string;
      content: ReactNode;
    }[];
  }) => {
    return (
      <ScrollArea h={props.listHeight || 400} mt={"0.5rem"}>
        <Droppable droppableId={col.id} direction="vertical">
          {(provided) => (
            <div
              style={{ minHeight: 200 }}
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {col.data.map((d, index) => (
                <Draggable key={d.id} index={index} draggableId={d.id}>
                  {(provided, snapshot) => (
                    <div
                      className={cx(classes.item, {
                        [classes.itemDragging]: snapshot.isDragging,
                      })}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      ref={provided.innerRef}
                    >
                      {d.content}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </ScrollArea>
    );
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <SimpleGrid cols={Object.values(props.initialColumns).length}>
        {Object.values(columns).map((col) => (
          <Box key={col.id}>
            {props.wrapInPaper ? (
              <Paper p={8} h="100%" withBorder>
                {col.header}
                {renderDroppable(col)}
                {col.footer}
              </Paper>
            ) : (
              <Box h="100%">
                {col.header}
                {renderDroppable(col)}
                {col.footer}
              </Box>
            )}
          </Box>
        ))}
      </SimpleGrid>
    </DragDropContext>
  );
}
