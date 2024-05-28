import RichTextArea from "@common/library/RichTextArea";
import { Badge, Box, Button, Flex, Paper, Text } from "@mantine/core";
import { IconArrowRight, IconCopy } from "@tabler/icons";
import { IconSparkles } from "@tabler/icons-react";
import { useState } from "react";

export default function SimulatepersonalizerModal() {
  const [simulate, setSimulate] = useState(false);
  return (
    <Paper>
      <Text size={"xs"} fw={500} color="gray">
        Paste contents of your email here and SellScale will personalize the email using the Personalizer.
      </Text>
      <Box>
        <Flex justify={"space-between"} align={"center"} mt={"md"}>
          <Flex align={"center"} gap={"sm"}>
            {simulate && (
              <Flex>
                <IconSparkles size={"0.9rem"} color="#D444F1" />
              </Flex>
            )}
            <Text size={"sm"} fw={600}>
              {simulate ? "Personalized" : "Original"}Email
            </Text>
          </Flex>
          {simulate && (
            <Flex gap={"sm"}>
              <Badge size="sm" leftSection={<IconCopy size={"0.9rem"} className="mt-[3px]" />} radius={"xl"} variant="light">
                Copy
              </Badge>
              <Badge size="sm" radius={"xl"} color="blue" variant="filled">
                View Original
              </Badge>
            </Flex>
          )}
        </Flex>
        <Box mt={4}>
          <RichTextArea height={300} />
        </Box>
      </Box>
      {!simulate && (
        <Button fullWidth rightIcon={<IconArrowRight size={"0.9rem"} />} my={"xl"} onClick={() => setSimulate(true)}>
          Simulate
        </Button>
      )}
    </Paper>
  );
}
