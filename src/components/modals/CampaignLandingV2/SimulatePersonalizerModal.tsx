import RichTextArea from "@common/library/RichTextArea";
import { Badge, Box, Button, Flex, Paper, Text, Loader, LoadingOverlay, Select } from "@mantine/core";
import { IconArrowRight, IconCopy } from "@tabler/icons";
import * as researcher from "@utils/requests/researchers";
import { IconSparkles } from "@tabler/icons-react";
import { useState } from "react";
import { useRecoilValue } from "recoil";
import { userTokenState } from "@atoms/userAtoms";
import { ContextModalProps } from "@mantine/modals";
import { JSONContent } from "@tiptap/react";

export default function SimulatepersonalizerModal({
  innerProps,
}: ContextModalProps<{
  sequences: any; prospectId: string 
}>) {
  const [simulate, setSimulate] = useState(false);
  const [loading, setLoading] = useState(false);
  const userToken = useRecoilValue(userTokenState);
  const [emailBody, setEmailBody] = useState("");
  const [overrideEmailBody, setOverrideEmailBody] = useState<string | undefined>(undefined); 
  const [rawEmailBody, setRawEmailBody] = useState<JSONContent | undefined>(undefined);
  const sequences = innerProps?.sequences?.flatMap((sequenceGroup: any[]) => {
    const descriptions = new Set();
    return sequenceGroup.filter((sequence: any) => {
      if (!descriptions.has(sequence.description)) {
        descriptions.add(sequence.description);
        return true;
      }
      return false;
    }).map((sequence: any) => sequence.description);
  });
  console.log('sequences are', innerProps.sequences)
  //get the titels of the sequences
  const sequenceTitles = innerProps?.sequences?.flatMap((sequenceGroup: any[]) => {
    return sequenceGroup.map((sequence: any) => sequence.title);
  });
  console.log('sequence titles are', sequenceTitles)
  const [originalEmailBody, setOriginalEmailBody] = useState<string | undefined>(undefined);

  const handleSimulate = async () => {
    setOriginalEmailBody(emailBody);
    setLoading(true);
    setSimulate(true);
    try {
      const prospectId = innerProps.prospectId; // Replace with actual prospectId
      const response = await researcher.getPersonalization(userToken, Number(prospectId), emailBody);
      setOverrideEmailBody(response.personalized_email.replace(/\n/g, "<br/>"));
    } catch (error) {
      console.error("Error during personalization:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (overrideEmailBody !== undefined) {
      navigator.clipboard.writeText(overrideEmailBody).then(() => {
        console.log("Email body copied to clipboard");
      }).catch((error) => {
        console.error("Error copying email body:", error);
      });
    }
  };

  const handleViewOriginal = () => {
    setEmailBody(originalEmailBody || "");
    setOverrideEmailBody(undefined);
    setSimulate(false);
  };

  return (
    <Paper>
      <LoadingOverlay visible={loading} />
      <Text size={"xs"} fw={500} color="gray">
        Paste contents of your email here and SellScale will personalize the email using the Personalizer.
      </Text>
      <Box>
        <Flex justify={"space-between"} align={"center"} mt={"md"}>
          <Flex justify={"space-between"} align={"center"} w={"100%"}>
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
            {sequences?.length > 0 && !simulate && (
              <Select
                placeholder="Select template"
                data={sequences.map((sequence: any, index: any) => ({ value: index, label: sequenceTitles[index] }))}
                onChange={(value: any) => {
                  setOverrideEmailBody(sequences[value]);
                  setEmailBody(sequences[value]);
                }}
                ></Select>
            )}
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

          <RichTextArea height={300} value={overrideEmailBody || originalEmailBody || rawEmailBody} onChange={(value, rawValue) => {
                  setEmailBody(value)
                  setRawEmailBody(rawValue)
                }}
                 />
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
