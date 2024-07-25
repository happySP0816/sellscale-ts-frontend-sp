import React, { useState } from "react";
import { Textarea, Button, Loader, Flex, Text } from "@mantine/core";
import { IconArrowRight } from "@tabler/icons";
import { getTemplateSuggestion } from "@utils/requests/generateSequence";
import { useRecoilValue } from "recoil";
import { currentProjectState } from "@atoms/personaAtoms";
import { API_URL } from "@constants/data";
import { set } from "lodash";

interface InlineAdderProps {
  manuallyAddedTemplate: string;
  setManuallyAddedTemplate: (value: string) => void;
  addingLinkedinAsset: boolean;
  setAddingLinkedinAsset: (value: boolean) => void;
  sequenceType: string;
  userData: any;
  userToken: string;
  addToStagingData: (data: any, stepNum: number, stagingData: any, setStagingData: any) => void;
  currentStepNum: number;
  stagingData: any;
  setStagingData: (data: any) => void;
  isSubjectLine?: boolean;
  setSuggestionData: (data: any) => void;
  setLoadingSuggestionData?: (value: boolean) => void;
}

export const createNewAsset = (manuallyAddedTemplate: string, sequenceType: string, userData: any) => {
  return {
    asset_key: "New Template (" + Math.random().toString(36).substring(2, 8).toUpperCase() + ")",
    asset_raw_value: manuallyAddedTemplate,
    asset_tags: sequenceType === "email" ? ["email template"] : ["linkedin template"],
    asset_type: "TEXT",
    asset_value: sequenceType === "email" ? manuallyAddedTemplate.replaceAll("\n", "<br/>") : manuallyAddedTemplate,
    client_archetype_ids: [userData.client.id],
    client_id: userData.client.id,
    num_opens: null,
    num_replies: null,
    num_sends: null,
  };
};

const getTemplateSuggestions = async (
  manuallyAddedTemplate: string,
  userToken: string,
  archetypeId: number,
  setSuggestionData: any,
  setLoadingTemplateSuggestions?: any
) => {
  console.log("getting template suggestions");
  setLoadingTemplateSuggestions && setLoadingTemplateSuggestions(true);
  const response = await getTemplateSuggestion(userToken, manuallyAddedTemplate, archetypeId);
  if (!response) {
    return;
  }
  setSuggestionData(response.personalized_email);
  setLoadingTemplateSuggestions && setLoadingTemplateSuggestions(false);
};

export const handleAssetCreation = (
  manuallyAddedTemplate: string,
  sequenceType: string,
  userData: any,
  userToken: string,
  addToStagingData: (data: any, stepNum: number, stagingData: any, setStagingData: any) => void,
  currentStepNum: number,
  stagingData: any,
  setStagingData: (data: any) => void,
  setSuggestionData: (data: any) => void,
  setAddingLinkedinAsset: (value: boolean) => void,
  setManuallyAddedTemplate: (value: string) => void,
  archetypeId: number,
  addingAiAsset?: boolean,
  setLoadingTemplateSuggestions?: (value: boolean) => void
) => {
  !addingAiAsset && getTemplateSuggestions(manuallyAddedTemplate, userToken, archetypeId, setSuggestionData, setLoadingTemplateSuggestions);
  const newAsset = createNewAsset(manuallyAddedTemplate, sequenceType, userData);
  if (sequenceType === "linkedin") {
    setAddingLinkedinAsset(true);
    fetch(`${API_URL}/client/create_archetype_asset`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify(newAsset),
    })
      .then((response) => response.json())
      .then((data) => {
        // Add the new asset to the staging data
        addToStagingData(data.data, currentStepNum, stagingData, setStagingData);
      })
      .catch((error) => {
        console.error("Error creating new asset:", error);
      })
      .finally(() => {
        setAddingLinkedinAsset(false);
        setManuallyAddedTemplate("");
      });
  } else {
    // Handle email asset creation
    addToStagingData({ ...newAsset, id: Math.floor(Math.random() * 1000000) }, currentStepNum, stagingData, setStagingData);
    setManuallyAddedTemplate("");
  }
};

const InlineTemplateAdder: React.FC<InlineAdderProps> = ({
  manuallyAddedTemplate,
  setManuallyAddedTemplate,
  addingLinkedinAsset,
  setAddingLinkedinAsset,
  sequenceType,
  userData,
  userToken,
  addToStagingData,
  currentStepNum,
  stagingData,
  setStagingData,
  setSuggestionData,
}) => {
  const currentProject = useRecoilValue(currentProjectState);
  const [loadingTemplateSuggestions, setLoadingTemplateSuggestions] = useState(false);

  return (
    <>
      <Textarea
        minRows={4}
        placeholder="Prefer to create your own message? Write directly in here ..."
        value={manuallyAddedTemplate}
        onChange={(event) => {
          const value = event.currentTarget.value;
          setManuallyAddedTemplate(value);
        }}
        style={{
          // Highlight the textarea with a red outline if the number of opening and closing brackets do not match
          outline: (manuallyAddedTemplate.match(/\[\[/g)?.length || 0) !== (manuallyAddedTemplate.match(/\]\]/g)?.length || 0) ? "2px solid red" : "none",
        }}
      />
      <Flex align="center" mt="xs" mb="xs">
        {loadingTemplateSuggestions && (
          <>
            <Loader color="grape" size="sm" mr="auto" />
            <Text color="grape" size="sm" ml="xs">
              Generating some more ideas...
            </Text>
          </>
        )}
        <Button
          loading={addingLinkedinAsset}
          size="sm"
          ml="auto"
          rightIcon={<IconArrowRight size={"0.9rem"} />}
          onClick={() => {
            handleAssetCreation(
              manuallyAddedTemplate,
              sequenceType,
              userData,
              userToken,
              addToStagingData,
              currentStepNum,
              stagingData,
              setStagingData,
              setSuggestionData,
              setAddingLinkedinAsset,
              setManuallyAddedTemplate,
              currentProject?.id || -1,
              false,
              setLoadingTemplateSuggestions
            );
          }}
        >
          Add Message
        </Button>
      </Flex>
    </>
  );
};

export default InlineTemplateAdder;
