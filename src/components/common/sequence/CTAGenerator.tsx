import { Button, ActionIcon, Text, Flex, Group, Title } from "@mantine/core";
import { CTAGeneratorSuggestedModal } from "@modals/CTAGeneratorSuggestedModal";
import { IconPencil, IconPlus, IconQuestionMark, IconX } from "@tabler/icons";
import { useState } from "react";

const CTAGenerator = () => {
  const [isOpenCTAGeneratorModal, setOpenCTAGeneratorModal] = useState(false);

  return (
    <>
      <Flex direction={"column"}>
        <Group>
          <Title color="blue.5" order={3}>
            CTA Generator.
          </Title>
          <ActionIcon
            size="sm"
            radius={999}
            color="yellow"
            variant="outline"
            onClick={(event) => event.preventDefault()}
          >
            <IconQuestionMark />
          </ActionIcon>
        </Group>

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
            Company
          </Button>

          <Flex h={"2.25rem"} align={"center"}>
            <Text>help</Text>
          </Flex>

          <Button
            radius={"xl"}
            variant="light"
            color="blue"
            h={"2.25rem"}
            rightIcon={<IconPencil size={"1rem"} />}
          >
            Persona
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
            Value Added Proposition
          </Button>

          <Button
            radius={"xl"}
            variant="filled"
            color="blue"
            h={"2.25rem"}
            leftIcon={<IconPlus size={"1rem"} />}
            onClick={() => {
              setOpenCTAGeneratorModal(true);
            }}
          >
            Generate CTA
          </Button>
        </Flex>
      </Flex>

      <CTAGeneratorSuggestedModal
        modalOpened={isOpenCTAGeneratorModal}
        closeModal={() => {
          setOpenCTAGeneratorModal(false);
        }}
      />
    </>
  );
};

export default CTAGenerator;
