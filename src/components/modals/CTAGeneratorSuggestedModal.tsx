import {
  Modal,
  Divider,
  Button,
  ActionIcon,
  Text,
  Flex,
  useMantineTheme,
  Card,
  Badge,
} from "@mantine/core";
import { IconEdit, IconPencil, IconX } from "@tabler/icons";

export interface GenerateTabOption {
  id: number;
  label: string;
  types: string[];
}

const options: GenerateTabOption[] = [
  {
    id: 1,
    label:
      "Are you interested in building with GPT + LLM technology? SellScale is the perfect place to do that.",
    types: ["Problem Based", "View Example"],
  },
  {
    id: 2,
    label:
      "Are you interested in building with GPT + LLM technology? SellScale is the perfect place to do that.",
    types: ["Problem Based", "View Example"],
  },
  {
    id: 3,
    label:
      "Are you interested in building with GPT + LLM technology? SellScale is the perfect place to do that.",
    types: ["Problem Based", "View Example"],
  },
  {
    id: 4,
    label:
      "Are you interested in building with GPT + LLM technology? SellScale is the perfect place to do that.",
    types: ["Problem Based", "View Example"],
  },
  {
    id: 5,
    label:
      "Are you interested in building with GPT + LLM technology? SellScale is the perfect place to do that.",
    types: ["Problem Based", "View Example"],
  },
];

export const CTAGeneratorSuggestedModal: React.FC<{
  modalOpened: boolean;
  closeModal: () => void;
}> = ({ modalOpened, closeModal }) => {
  const theme = useMantineTheme();

  return (
    <Modal.Root
      opened={modalOpened}
      onClose={close}
      size={"xl"}
      closeOnClickOutside
    >
      <Modal.Overlay blur={3} color="gray.2" opacity={0.5} />
      <Modal.Content sx={{ borderRadius: "8px" }}>
        <Modal.Header
          md-px={"1.5rem"}
          px={"1rem"}
          sx={{
            background: theme.colors.blue[5],
            display: "flex",
          }}
        >
          <Modal.Title
            fz={"1rem"}
            fw={600}
            sx={{
              color: "#FFFFFF",
            }}
          >
            CTA Generator
          </Modal.Title>
          <ActionIcon
            variant="outline"
            size={"sm"}
            onClick={closeModal}
            sx={{ borderColor: "#E9ECEF", borderRadius: 999 }}
          >
            <IconX color="#FFFFFF" />
          </ActionIcon>
        </Modal.Header>

        <Modal.Body p={"1rem"}>
          <Flex
            wrap={"wrap"}
            align={"flex-start"}
            justify={"start"}
            sx={{
              border: "1px solid #E9ECEF",
              borderRadius: "0.5rem",
            }}
            p="sm"
            my={"1rem"}
            gap={"0.5rem"}
          >
            <Button
              radius={"xl"}
              variant="light"
              color="blue"
              h={"2.25rem"}
              rightIcon={<IconPencil size={"1rem"} />}
            >
              <Text color="black">Add glow</Text>
            </Button>

            <Flex h={"2.25rem"} align={"center"}>
              <Text>helps</Text>
            </Flex>

            <Button
              radius={"xl"}
              variant="light"
              color="blue"
              h={"2.25rem"}
              rightIcon={<IconPencil size={"1rem"} />}
            >
              <Text color="black">E-Commerce leaders</Text>
            </Button>

            <Flex h={"2.25rem"} align={"center"}>
              <Text>with</Text>
            </Flex>

            <Button
              radius={"xl"}
              variant="light"
              color="blue"
              h={"2.25rem"}
              rightIcon={<IconPencil size={"1rem"} />}
            >
              <Text color="black">engaging their</Text>
            </Button>
          </Flex>

          <Flex justify={"center"} mb={"2rem"}>
            <Button
              radius={"xl"}
              variant="filled"
              color="blue"
              h={"2.25rem"}
              onClick={() => {}}
            >
              Re-Generate CTA
            </Button>
          </Flex>

          <Divider
            my="xl"
            role="button"
            style={{ cursor: "pointer" }}
            variant="solid"
            labelPosition="center"
            label={
              <Text fw={700} color="gray.5" size={"sm"}>
                Suggested CTAs ({options.length})
              </Text>
            }
          />

          <Flex direction={"column"} gap={"1rem"}>
            {options.map((e, index) => (
              <CTASuggestOption data={e} key={index} />
            ))}
          </Flex>
        </Modal.Body>
      </Modal.Content>
    </Modal.Root>
  );
};

const CTASuggestOption: React.FC<{
  data: GenerateTabOption;
  onClickEdit?: () => void;
}> = ({ data, onClickEdit }) => {
  return (
    <Card
      radius={"md"}
      py={"1rem"}
      pos={"relative"}
      sx={(theme) => ({
        border: "1px dashed " + theme.colors.gray[2],
        overflow: "unset",
      })}
    >
      <Flex pos={"absolute"} top={-10} gap={"0.5rem"}>
        {data.types.map((e) => (
          <Badge
            fw={700}
            color={"green"}
            variant="light"
            style={{ zIndex: 10 }}
          >
            {e ? e.replace("-", " ") : "CTA Type"}
          </Badge>
        ))}
      </Flex>

      <Flex direction={"row"} w={"100%"} gap={"0.75rem"}>
        <Flex wrap={"wrap"} gap={"0.5rem"} align={"center"}></Flex>
        <Flex align={"center"}>
          <Text color={"gray.8"} fw={500}>
            {data.label}
            <Button
              size="compact-xs"
              variant="light"
              leftIcon={<IconEdit size={14} />}
              fz="xs"
              radius="lg"
              ml={"0.25rem"}
              onClick={onClickEdit}
            >
              Edit CTA
            </Button>
          </Text>
        </Flex>
        <Flex gap={"0.5rem"} align={"center"} ml={"auto"}>
          <Button size="sm" variant="light" fz="sm" radius="lg" fw={700}>
            Use CTA
          </Button>
        </Flex>
      </Flex>
    </Card>
  );
};
