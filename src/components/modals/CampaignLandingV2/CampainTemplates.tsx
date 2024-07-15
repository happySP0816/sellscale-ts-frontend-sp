import { emailSubjectLinesState, userTokenState } from "@atoms/userAtoms";
import { userDataState } from "@atoms/userAtoms";
import { currentProjectState } from "@atoms/personaAtoms";
import RichTextArea from "@common/library/RichTextArea";
import CustomSelect from "@common/persona/ICPFilter/CustomSelect";
import { API_URL } from "@constants/data";
import { Title } from "@mantine/core";

import { Box, Button, Center, Flex, NumberInput, Paper, SegmentedControl, Switch, Text, TextInput, Textarea } from "@mantine/core";
import { ContextModalProps, closeAllModals, openContextModal } from "@mantine/modals";
import { showNotification } from "@mantine/notifications";
import { IconBrandLinkedin, IconMailOpened } from "@tabler/icons";
import { useEffect, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";

export default function CampaignTemplatesModal({
  innerProps,
  context,
  id,
}: ContextModalProps<{
  stagingData: any;
  sequenceType: string;
  refetchSequenceData: Function;
  setAddedTemplate: Function;
  currentStepNum: any;
  createTemplateBuilder: boolean;
  setCreateTemplateBuilder: Function;
  setSequences: Function;
  campaignId: number;
  cType?: string;
  setStagingData: Function;
  addToStagingData?: any;
  emailSequenceData: any;
  linkedinSequenceData: any;
}>) {
  const userToken = useRecoilValue(userTokenState);
  const currentProject = useRecoilValue(currentProjectState);
  const userData = useRecoilValue(userDataState);
  const [emailSubjectLines, setEmailSubjectLines] = useRecoilState(emailSubjectLinesState);

  const [type, setType]: any = useState(innerProps.sequenceType || "email");
  const [tags, setTags]: any = useState([]);
  const [template, setTemplate]: any = useState("");
  const [loading, setLoading] = useState(false);

  const createClientAsset = async () => {
    setLoading(true);
    const tempTags = tags.concat(type);
    const asset = {
      asset_key: `New Template (${Math.random().toString(36).substring(2, 8).toUpperCase()})`,
      asset_raw_value: template,
      asset_tags: type === "email" ? ["email template"] : ["linkedin template"],
      asset_type: "TEXT",
      asset_value: type === "email" ? template.replaceAll("\n", "<br/>") : template,
      client_archetype_ids: [userData.client.id],
      client_id: userData.client.id,
      num_opens: null,
      num_replies: null,
      num_sends: null,
    };

    try {
      const response = await fetch(`${API_URL}/client/create_archetype_asset`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify(asset),
      });

      const data = await response.json();
      console.log("data is", data);
      innerProps.setAddedTemplate(data.data);
      closeAllModals();
      openContextModal({
        modal: "campaignTemplateEditModal",
        title: <Title order={3}>Sequence Builder</Title>,
        innerProps: {
          sequenceType: innerProps.sequenceType,
          emailSubjectLines: emailSubjectLines,
          // emailSequenceData: innerProps.emailSequenceData,
          // linkedinSequenceData: innerProps.linkedinSequenceData,
          setEmailSubjectLines: setEmailSubjectLines,
          addedTemplate: asset,
          stagingData: innerProps.stagingData,
          refetchSequenceData: innerProps.refetchSequenceData,
          currentStepNum: innerProps.currentStepNum,
          createTemplateBuilder: innerProps.createTemplateBuilder,
          setCreateTemplateBuilder: innerProps.setCreateTemplateBuilder,
          setSequences: innerProps.setSequences,
          campaignId: innerProps.campaignId,
          cType: innerProps.cType,
          addToStagingData: innerProps.addToStagingData,
        },
        centered: true,
        styles: {
          content: {
            minWidth: "1100px",
          },
        },
        onClose: () => {
          try {
            console.log("refetching sequence data");
            innerProps.refetchSequenceData(currentProject?.id);
          } catch (e) {
            console.log("error is", e);
          }
        },
      });
      showNotification({
        title: "Template Created",
        message: "Template has been created successfully",
        color: "teal",
      });
    } catch (error) {
      console.error("Error creating new asset:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper>
      <Flex direction={"column"}>
        <Flex direction={"column"} mt={"sm"} gap={"sm"} pb={70}>
          <SegmentedControl
            value={type}
            onChange={(value: any) => {
              setType(value);
              setTemplate("");
              setTags([]);
            }}
            data={[
              {
                value: "email",
                label: (
                  <Center style={{ gap: 10 }}>
                    <IconMailOpened size={"1.2rem"} fill="orange" color="white" />
                    <Text fw={500}>Email</Text>
                  </Center>
                ),
              },
              {
                value: "linkedin",
                label: (
                  <Center style={{ gap: 10 }}>
                    <IconBrandLinkedin size={"1.4rem"} fill="#3B85EF" color="white" />
                    <Text fw={500}>Linkedin</Text>
                  </Center>
                ),
              },
            ]}
          />
          <Box>
            <Text size={"sm"} color="gray" fw={500} mt={"md"}>
              Template
            </Text>
            <Box mt={4}>
              {type == "email" ? (
                <RichTextArea onChange={(value) => setTemplate(value)} />
              ) : (
                <Textarea
                  placeholder={"ex. Hi [[first_name]], I wanted to reach out to you because..."}
                  minRows={7}
                  value={template}
                  onChange={(event) => setTemplate(event.currentTarget.value)}
                />
              )}
            </Box>
            <Box mt="xs">
              <CustomSelect maxWidth="100%" value={tags} label="Add Tags (optional)" placeholder="" setValue={setTags} data={tags} setData={setTags} />
            </Box>
          </Box>
        </Flex>
        <Flex justify={"end"} gap={"lg"}>
          <Button variant="outline" color="gray" fullWidth onClick={() => context.closeModal(id)}>
            Cancel
          </Button>
          <Button
            fullWidth
            onClick={() => {
              createClientAsset();
            }}
            disabled={!template || !type}
            loading={loading}
          >
            Create Template
          </Button>
        </Flex>
      </Flex>
    </Paper>
  );
}
