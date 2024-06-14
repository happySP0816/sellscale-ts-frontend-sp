import React, { useState } from 'react';
import { Textarea, Button } from '@mantine/core';
import { IconArrowRight } from '@tabler/icons';

interface InlineAdderProps {
  manuallyAddedTemplate: string;
  setManuallyAddedTemplate: (value: string) => void;
  addingLinkedinAsset: boolean;
  setAddingLinkedinAsset: (value: boolean) => void;
  sequenceType: string;
  userData: any;
  userToken: string;
  API_URL: string;
  addToStagingData: (data: any, stepNum: number, stagingData: any, setStagingData: any) => void;
  currentStepNum: number;
  stagingData: any;
  setStagingData: (data: any) => void;
  isSubjectLine?: boolean;
}

const InlineTemplateAdder: React.FC<InlineAdderProps> = ({
  manuallyAddedTemplate,
  setManuallyAddedTemplate,
  addingLinkedinAsset,
  setAddingLinkedinAsset,
  sequenceType,
  userData,
  userToken,
  API_URL,
  addToStagingData,
  currentStepNum,
  stagingData,
  setStagingData,
}) => {

  const createNewAsset = () => {
    return {
      asset_key:
        "New Template (" +
        Math.random()
          .toString(36)
          .substring(2, 8)
          .toUpperCase() +
        ")",
      asset_raw_value: manuallyAddedTemplate,
      asset_tags:
        sequenceType === "email"
          ? ["email template"]
          : ["linkedin template"],
      asset_type: "TEXT",
      asset_value:
        sequenceType === "email"
          ? manuallyAddedTemplate.replaceAll(
              "\n",
              "<br/>"
            )
          : manuallyAddedTemplate,
      client_archetype_ids: [userData.client.id],
      client_id: userData.client.id,
      num_opens: null,
      num_replies: null,
      num_sends: null,
    };
  };

  const handleAssetCreation = (newAsset: any) => {
    if (sequenceType === "linkedin") {
      setAddingLinkedinAsset(true);
      fetch(`${API_URL}/client/create_archetype_asset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify(newAsset),
      })
      .then(response => response.json())
      .then(data => {
        // Add the new asset to the staging data
        addToStagingData(
          data.data,
          currentStepNum,
          stagingData,
          setStagingData
        );
      })
      .catch(error => {
        console.error('Error creating new asset:', error);
      }).finally(() => {
        setAddingLinkedinAsset(false);
        setManuallyAddedTemplate("");
      });
    } else {
      // Handle email asset creation
      addToStagingData(
        { ...newAsset, id: Math.floor(Math.random() * 1000000) },
        currentStepNum,
        stagingData,
        setStagingData
      );
      setManuallyAddedTemplate("");
    }
  };

  return (
    <>
      <Textarea
        mt={'sm'}
        minRows={3}
        placeholder="Prefer to create your own message? Write direct in here ..."
        value={manuallyAddedTemplate}
        onChange={(event) => {
          const value = event.currentTarget.value;
          setManuallyAddedTemplate(value);
        }}
        style={{
          // Highlight the textarea with a red outline if the number of opening and closing brackets do not match
          outline: (manuallyAddedTemplate.match(/\[\[/g)?.length || 0) !== (manuallyAddedTemplate.match(/\]\]/g)?.length || 0) ? '2px solid red' : 'none'
        }}
      />
      <Button
        loading={addingLinkedinAsset}
        size="sm"
        ml="auto"
        mt="xs"
        mb="xs"
        rightIcon={<IconArrowRight size={"0.9rem"} />}
        onClick={() => {
          const newAsset = createNewAsset();
          handleAssetCreation(newAsset);
        }}
      >
        Add Message
      </Button>
    </>
  );
};

export default InlineTemplateAdder;
