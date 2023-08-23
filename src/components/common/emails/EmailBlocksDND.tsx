import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { ActionIcon, Button, Card, Flex, LoadingOverlay, Text, Textarea } from "@mantine/core";
import { useDebouncedValue, useForceUpdate, useListState } from "@mantine/hooks";
import { IconGripVertical, IconX } from "@tabler/icons";
import { useEffect, useRef, useState } from "react";
import getEmailBlocks from "@utils/requests/getEmailBlocks";
import { showNotification } from "@mantine/notifications";
import { useRecoilValue } from "recoil";
import { userTokenState } from "@atoms/userAtoms";
import patchEmailBlocks from "@utils/requests/patchEmailBlocks";


interface EmailBlockDNDProps {
  archetypeId: number,
  emailSequenceStepId?: number,
  autosave?: boolean,
  // initialData: {
  //   position: number;
  //   content: string;
  // }[],
  // data: {
  //   position: number;
  //   content: string;
  // }[],
  creating?: boolean,
  getNewOrder?: (email_blocks: string[]) => void,
  // triggerSave: () => void,
}


// Note that this makes a bypass on React.StrictMode in order to render properly
export const EmailBlocksDND = ({ archetypeId, emailSequenceStepId, autosave, creating, getNewOrder }: EmailBlockDNDProps) => {
  const userToken = useRecoilValue(userTokenState);
  const [loading, setLoading] = useState<boolean>(false);

  const [state, handlers] = useListState([
    {position: 0, content: "Add some email blocks above and remove me!"},
  ]);
  
  const newBlockText = useRef<HTMLTextAreaElement>(null);
  const [blockTextEmpty, setBlockTextEmpty] = useState<boolean>(true);

  const [initialEmailBlocks, setInitialEmailBlocks] = useState<string[] | null>(null);
  const [emailBlocks, setEmailBlocks] = useState<string[]>([]);

  // Auto saving email blocks
  const [debouncedEmailBlocks] = useDebouncedValue(emailBlocks, 300);
  useEffect(() => {
    if (autosave) {
      triggerPatchEmailBlocks();
    } else if (getNewOrder !== undefined) {
      getNewOrder(debouncedEmailBlocks);
    }
  }, [debouncedEmailBlocks]);

  const triggerGetEmailBlocks = async () => {
    setLoading(true);

    const result = await getEmailBlocks(userToken, archetypeId, emailSequenceStepId);

    if (result.status !== "success") {
      showNotification({
        title: "Error",
        message: "Could not get email blocks",
        color: "red",
      });
      return;
    }

    setInitialEmailBlocks(result.data);
    setEmailBlocks(result.data);

    handlers.setState(result.data.map((item: string, index: number) => {
      return {
        position: index,
        content: item,
      }
    }));

    setLoading(false);
  }

  const triggerPatchEmailBlocks = async () => {
    if (initialEmailBlocks === null) {
      return;
    }
    const result = await patchEmailBlocks(userToken, archetypeId, emailBlocks);

    if (result.status !== "success") {
      return;
    }

    setInitialEmailBlocks(emailBlocks);
  }

  useEffect(() => {
    setEmailBlocks(state.map((item) => item.content));
  }, [state])


  const items = state.map((item, index) => {
    return (
      <Draggable key={item.content + "-" + index} index={index} draggableId={item.content + "-" + index}>
        {(provided, snapshot) => {
          return (
            <Card
              w='100%'
              withBorder
              {...provided.draggableProps}
              ref={provided.innerRef}
              mb='lg'
            >
              <Flex justify={'space-between'}>
                <Flex align='center'>
                  <Flex {...provided.dragHandleProps} mr='8px'>
                    <IconGripVertical size="1.05rem" stroke={1.5} />
                  </Flex>
                  <Text>
                    {item.content}
                  </Text>
                </Flex>
                <Flex align='center' ml='xs'>
                  <ActionIcon onClick={
                    () => {
                      handlers.remove(index);
                    }
                  }>
                    <IconX size="0.95rem" />
                  </ActionIcon>
                </Flex>
              </Flex>

            </Card>
          )
        }}
      </Draggable>
    )
  });

  useEffect(() => {
    if (creating) {
      return;
    }
    triggerGetEmailBlocks();
  }, []);

  return (
    <>
      <LoadingOverlay visible={loading} />
      <Flex direction='column' w='100%'>

        <Flex w='100%' justify={'space-between'} align='center'>
          <Textarea
            w='75%'
            placeholder="Type your new email block here..."
            ref={newBlockText}
            onChange={() => {
              if (newBlockText.current?.value == "" || newBlockText.current?.value == undefined) {
                setBlockTextEmpty(true);
              } else {
                setBlockTextEmpty(false);
              }
            }}
          />
          <Button
            ml='xs'
            disabled={newBlockText.current?.value == "" || newBlockText.current?.value == undefined}
            onClick={() => {
              const content = newBlockText.current?.value || "Block " + (state.length + 1);
              handlers.append({ position: 0, content: content })
              if (newBlockText.current?.value) {
                newBlockText.current.value = "";
              }
              setBlockTextEmpty(true);
            }}
          >
            Add New Block
          </Button>
        </Flex>

        <Flex mt='lg' w='100%'>
          <DragDropContext
            onDragEnd={({ destination, source }) => {
              handlers.reorder({ from: source.index, to: destination?.index || 0 })
            }}
          >
            <Droppable droppableId='email-blocks-dnd-list' direction="vertical">
              {(provided) => (
                <Flex w='100%' direction='column' {...provided.droppableProps} ref={provided.innerRef}>
                  {items}
                  {provided.placeholder}
                </Flex>
              )}
            </Droppable>
          </DragDropContext>
        </Flex>
      </Flex>
    </>
  );
}
