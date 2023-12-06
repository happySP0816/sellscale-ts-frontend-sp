import React, { useState } from "react";
import { Flex, Text, Card, Badge, Title, Box, TextInput } from "@mantine/core";
import DOMPurify from "dompurify";

interface EmailProps {
  email: {
    id: number;
    subject: string;
    email_body: string;
  };
}

const Email: React.FC<EmailProps> = ({ email }) => {
  if (!email) return null;

  return (
    <Flex direction="column" mt="lg" ml="lg" w="100%">
      <Title order={5}>{email.subject || "No Subject"}</Title>
      <Box
        sx={() => ({
          border: "1px solid #E0E0E0",
          borderRadius: "8px",
          backgroundColor: "#F5F5F5",
        })}
        p="sm"
        mt="sm"
      >
        <Text fz="sm">
          <div
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(email.email_body),
            }}
          />
        </Text>
      </Box>
    </Flex>
  );
};

interface SequenceStepProps {
  sequenceStep: {
    id: number;
    seq_number: number;
    seq_delay_details: {
      delayInDays: number;
    };
    sequence_variants: Array<EmailProps["email"]>;
    subject: string;
    email_body: string;
  };
  stepIndex: number;
  selectedStep: EmailProps["email"] | null;
  onSelectStep: (step: EmailProps["email"]) => void;
}

const SequenceStep: React.FC<SequenceStepProps> = ({
  sequenceStep,
  stepIndex,
  selectedStep,
  onSelectStep,
}) => {
  if (!sequenceStep) return null;

  const numberToAlphabet = (number: number): string => {
    if (Number.isInteger(number) && number >= 0) {
      const asciiCode = "a".charCodeAt(0) + number;
      return String.fromCharCode(asciiCode);
    } else {
      return "Invalid input";
    }
  };

  const colors = ["green", "blue", "yellow", "purple", "pink", "cyan"];

  return (
    <>
      {sequenceStep.seq_number > 1 && (
        <Flex align="center" mt="lg" justify={"center"}>
          <Text mr="4px" fz="xs">
            Wait
          </Text>
          <TextInput
            w="35px"
            disabled
            value={sequenceStep.seq_delay_details.delayInDays}
          />
          <Text ml="4px" fz="xs">
            days
          </Text>
        </Flex>
      )}
      <Card withBorder mt="lg">
        <Text mb="4px" fw="bold">
          Step {stepIndex + 1}
        </Text>
        <Flex direction="column">
          {sequenceStep.sequence_variants ? (
            <>
              {sequenceStep?.sequence_variants?.map((email, index) => {
                return (
                  <Flex
                    key={email.id}
                    onClick={() => onSelectStep(email)}
                    align="center"
                    mt="4px"
                  >
                    <Badge
                      variant="filled"
                      color={colors[index % colors.length]}
                      mr="5px"
                    >
                      {numberToAlphabet(index)}
                    </Badge>
                    <Flex
                      sx={(theme) => ({
                        backgroundColor:
                          selectedStep?.id === email.id
                            ? theme.colors.gray[3]
                            : "",
                        borderRadius: "4px",
                      })}
                      px="3px"
                    >
                      <Text fz="sm">Subject: {email.subject}</Text>
                    </Flex>
                  </Flex>
                );
              })}
            </>
          ) : (
            <>
              <Flex
                onClick={() => onSelectStep({ id: sequenceStep.id, subject: sequenceStep.subject, email_body: sequenceStep.email_body })}
                align="center"
                mt="4px"
              >
                <Badge
                  variant="filled"
                  color={colors[0 % colors.length]}
                  mr="5px"
                >
                  {numberToAlphabet(0)}
                </Badge>
                <Flex
                  sx={(theme) => ({
                    backgroundColor:
                      selectedStep?.id === sequenceStep.id ? theme.colors.gray[3] : "",
                    borderRadius: "4px",
                  })}
                  px="3px"
                >
                  <Text fz="sm">Subject: {sequenceStep.subject}</Text>
                </Flex>
              </Flex>
            </>
          )}
        </Flex>
      </Card>
    </>
  );
};

interface SmartleadVisualizerProps {
  data: Array<SequenceStepProps["sequenceStep"]>;
}

const SmartleadVisualizer: React.FC<SmartleadVisualizerProps> = ({ data }) => {
  const [selectedStep, setSelectedStep] = useState<EmailProps["email"] | null>(
    null
  );

  const handleSelectStep = (step: EmailProps["email"]) => {
    setSelectedStep(step);
  };

  return (
    <>
      <Flex>
        <Flex w={400} direction="column">
          {data &&
            data.map((sequenceStep, index) => (
              <SequenceStep
                key={sequenceStep.id}
                sequenceStep={sequenceStep}
                stepIndex={index}
                selectedStep={selectedStep}
                onSelectStep={handleSelectStep}
              />
            ))}
        </Flex>
        <Flex w={"50%"}>{selectedStep && <Email email={selectedStep} />}</Flex>
      </Flex>
    </>
  );
};

export default SmartleadVisualizer;
