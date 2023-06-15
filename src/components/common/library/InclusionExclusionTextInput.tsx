import { ActionIcon, Badge, Button, Flex, TextInput, Tooltip, rem } from "@mantine/core";
import { useShallowEffect } from "@mantine/hooks";
import { IconCheck, IconMinus, IconPlus, IconX } from "@tabler/icons";
import { SetStateAction, useEffect, useRef, useState } from "react";

type PropsType = {
  label: string,
  description: string,
  placeholder: string,
  onInclusionAdd: (value: string[]) => void,
  onExclusionAdd: (value: string[]) => void,
  defaultInclusion?: string[],
  defaultExclusion?: string[],
}

export default function InclusionExclusionTextInput(props: PropsType) {
  const [textInput, setTextInput] = useState<string>('')

  const [inclusionList, setInclusionList] = useState<string[]>([])
  const [exclusionList, setExclusionList] = useState<string[]>([])

  const removeButton = (func: React.Dispatch<SetStateAction<string[]>>, value: SetStateAction<string[]>, color: string) => {
    return (
      <ActionIcon
        size="xs"
        radius='xl'
        variant="transparent"
        color={color}
        onClick={() => func(value)}
      >
        <IconX size={rem(10)} />
      </ActionIcon>
    )
  }

  useEffect(() => {
    props.onExclusionAdd(exclusionList)
  }, [exclusionList])

  useEffect(() => {
    props.onInclusionAdd(inclusionList)
  }, [inclusionList])

  useShallowEffect(() => {
    if (props.defaultInclusion && props.defaultInclusion[0] !== '') {
      setInclusionList(props.defaultInclusion)
    }
    if (props.defaultExclusion && props.defaultExclusion[0] !== '') {
      setExclusionList(props.defaultExclusion)
    }
  }, [props.defaultInclusion, props.defaultExclusion])

  return (
    <Flex direction='column' w={'100%'}>

      <Flex direction='row' align={'flex-end'}>

        <TextInput
          label={props.label}
          description={props.description}
          placeholder={props.placeholder}
          value={textInput}
          onChange={(event) => setTextInput(event.currentTarget.value)}
          mr='xs'
          w='75%'
        />
        {
          textInput !== '' &&
          <Flex mb='xs'>
            <Tooltip label="Include">
              <ActionIcon
                variant='transparent'
                color='green'
                onClick={() => {
                  if (textInput === '') return
                  setInclusionList([...inclusionList, textInput as string])
                  setTextInput('')
                }}
              >
                <IconPlus size='1rem' />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Exclude">
              <ActionIcon
                variant='transparent'
                color='red'
                onClick={() => {
                  if (textInput === '') return
                  setExclusionList([...exclusionList, textInput])
                  setTextInput('')
                }}
              >
                <IconMinus size='1rem' />
              </ActionIcon>
            </Tooltip>
          </Flex>
        }
      </Flex>
      <Flex
        sx={{
          flexWrap: 'wrap',
        }}
        maw='90%'
        h='auto'
        mt='xs'
      >
        {
          inclusionList.map((item, index) => {
            return (
              <Badge
                key={index}
                color='green'
                variant='outline'
                mr='xs'
                mb='xs'
                maw='180px'
                rightSection={removeButton(setInclusionList, inclusionList.filter((value) => value !== item), 'green')}
              >
                {item}
              </Badge>
            )
          })
        }
        {
          exclusionList.map((item, index) => {
            return (
              <Badge
                key={index}
                color='red'
                variant='outline'
                mr='xs'
                mb='xs'
                maw='180px'
                rightSection={removeButton(setExclusionList, exclusionList.filter((value) => value !== item), 'red')}
              >
                {item}
              </Badge>
            )
          })
        }
      </Flex>

    </Flex>

  )
}