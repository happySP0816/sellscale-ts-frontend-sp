// @ts-nocheck
import ComingSoonCard from "@common/library/ComingSoonCard";
import CurrentSequences from "@common/persona/CurrentSequences";
import EmailOutboundProgram from "@common/persona/EmailOutboundProgram";
import { Button, Container, Flex, Title } from "@mantine/core";
import { openContextModal } from "@mantine/modals";

export default function SequenceSection() {
  return (
    <>
      <Flex direction="row-reverse" gap="sm" pb='sm'>
        <Button
          variant="light"
          color="teal"
          radius="md"
          size="md"
          onClick={() => {
            openContextModal({
              modal: "sequenceWriter",
              title: <Title order={3}>Sequence Writer</Title>,
              innerProps: {},
            });
          }}
        >
          Create Sequence with AI
        </Button>
      </Flex>
      <EmailOutboundProgram />
      <CurrentSequences />
    </>
  );
}
