import RichTextArea from "@common/library/RichTextArea";
import { Badge, Box, Button, Flex, Paper, Text, Loader } from "@mantine/core";
import { IconArrowRight, IconCopy } from "@tabler/icons";
import * as researcher from "@utils/requests/researchers";
import { IconSparkles } from "@tabler/icons-react";
import { useState } from "react";
import { useRecoilValue } from "recoil";
import { userTokenState } from "@atoms/userAtoms";
import { ContextModalProps } from "@mantine/modals";

export default function SimulatepersonalizerModal({
  innerProps,
}: ContextModalProps<{ prospectId: string }>) {
  const [simulate, setSimulate] = useState(false);
  const [loading, setLoading] = useState(false);
  const userToken = useRecoilValue(userTokenState);
  const [emailBody, setEmailBody] = useState("");

  const handleSimulate = async () => {
    setLoading(true);
    setSimulate(true);
    try {
      const prospectId = innerProps.prospectId; // Replace with actual prospectId
      const response = await researcher.getPersonalization(userToken, Number(prospectId), emailBody);
      setEmailBody(response.personalized_email);
    } catch (error) {
      console.error("Error during personalization:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(emailBody).then(() => {
      console.log("Email body copied to clipboard");
    }).catch((error) => {
      console.error("Error copying email body:", error);
    });
  };

  const handleViewOriginal = () => {
    setSimulate(false);
  };

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
              {simulate ? "Personalized" : "Original"} Email
            </Text>
          </Flex>
          {simulate && (
            <Flex gap={"sm"}>
              <Badge size="sm" leftSection={<IconCopy size={"0.9rem"} className="mt-[3px]" />} radius={"xl"} variant="light" onClick={handleCopy}>
                Copy
              </Badge>
              <Badge size="sm" radius={"xl"} color="blue" variant="filled" onClick={handleViewOriginal}>
                View Original
              </Badge>
            </Flex>
          )}
        </Flex>
        <Box mt={4}>
          <RichTextArea height={300} value={emailBody} onChange={(e) => setEmailBody(e)} />
        </Box>
      </Box>
      {!simulate && (
        <Button fullWidth rightIcon={<IconArrowRight size={"0.9rem"} />} my={"xl"} onClick={handleSimulate} disabled={loading}>
          {loading ? <Loader size="xs" color="white" /> : "Simulate"}
        </Button>
      )}
    </Paper>
  );
}
