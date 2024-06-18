import React from 'react';
import { Box, Flex, Text, Tooltip, ActionIcon, Collapse, Avatar, Badge, Button } from '@mantine/core';
import { IconMessages, IconEdit, IconTrash, IconChevronUp, IconChevronDown, IconStar } from '@tabler/icons';
import BracketGradientWrapper from '@common/sequence/BracketGradientWrapper';
import { IconSparkles } from '@tabler/icons-react';
import { handleAssetCreation } from '@pages/Sequence/InlineTemplateAdder';
import { useRecoilValue } from 'recoil';
import { userDataState, userTokenState } from '@atoms/userAtoms';
import { currentProjectState } from '@atoms/personaAtoms';

interface SequenceVariantProps {
    angle: string;
    text: string;
    assetId: number;
    index: number;
    selectStep: number;
    opened: boolean;
    userImgUrl: string;
    removeFromStagingData: (id: number, stagingData: any, setStagingData: any) => void;
    handleToggle: (index: number) => void;
    stagingData: any;
    setStagingData: any;
    isSaved?: boolean;
    addToStagingData?: (data: any, stepNum: number, stagingData: any, setStagingData: any) => void;
    showAll?: boolean;
    sequenceType?: string;
    currentStepNum?: number;
    setSuggestionData?: (data: any) => void;
    setAddingLinkedinAsset?: (value: boolean) => void;
    setManuallyAddedTemplate?: (value: string) => void;
}

const SequenceVariant: React.FC<SequenceVariantProps> = (props) => {
    const {
        angle,
        text,
        assetId,
        index,
        selectStep,
        opened,
        userImgUrl,
        removeFromStagingData,
        handleToggle,
        stagingData,
        addToStagingData,
        setStagingData,
        isSaved,
        showAll,
        sequenceType,
        currentStepNum,
        setSuggestionData,
        setAddingLinkedinAsset,
        setManuallyAddedTemplate,
    } = props;

    const userData = useRecoilValue(userDataState);
    const userToken = useRecoilValue(userTokenState);
    const currentProject = useRecoilValue(currentProjectState);
    console.log('suggestion data is', setSuggestionData && setSuggestionData((prev: any) => { console.log(prev); return prev; }));
    return (
        <Box
            mb={"sm"}
            style={{
                backgroundColor: "white",
                border: selectStep === index ? "1px solid #228be6" : "1px solid #ced4da",
                borderRadius: "8px",
            }}
        >
            <Flex align={"center"} justify={"space-between"} px={"sm"} py={"xs"}>
                <Flex align={"center"} gap={"xs"}>
                    <IconMessages color="#228be6" size={"0.9rem"} />
                    <Text color="gray" fw={500} size={"xs"}>
                        Variant #{index + 1}:
                    </Text>
                    <Text fw={600} size={"xs"} ml={"-5px"}>
                        {angle}
                    </Text>
                </Flex>
                <Flex gap={1} align={"center"}>
                    {isSaved && <Badge color="teal" size="xs" mr="6px">
                        Saved
                    </Badge>}
                    <Tooltip label="Editing coming soon" position="top">
                        <ActionIcon disabled>
                            <IconEdit size={"0.9rem"} />
                        </ActionIcon>
                    </Tooltip>
                    {!showAll && <ActionIcon
                        disabled={isSaved}
                        onClick={() => removeFromStagingData(assetId, stagingData, setStagingData)}
                    >
                        <IconTrash size={"0.9rem"} />
                    </ActionIcon>}
                    {/* Button to add to staging data */}
                    {showAll && <Button
                        ml={'sm'}
                        size="xs"
                        color="grape"
                        onClick={() => {
                            if (addToStagingData) {
                                handleAssetCreation(
                                    text,
                                    sequenceType || '',
                                    userData,
                                    userToken,
                                    (data, stepNum, stagingData, setStagingData) => {
                                        addToStagingData(data, stepNum, stagingData, setStagingData);
                                        setSuggestionData && setSuggestionData((prevData: any) => prevData.filter((item: any) => item.text !== text));
                                    },
                                    currentStepNum || -1,
                                    stagingData,
                                    setStagingData,
                                    setSuggestionData || (() => { }),
                                    setAddingLinkedinAsset || (() => { }),
                                    setManuallyAddedTemplate || (() => { }),
                                    currentProject?.id || -1,
                                    true
                                );
                            }
                        }}
                        leftIcon={<IconSparkles size={"0.9rem"} color="white" />}
                    >
                        Add
                    </Button>}
                    {!showAll && <ActionIcon onClick={() => handleToggle(index)}>
                        {selectStep === index && opened ? (
                            <IconChevronUp size={"0.9rem"} />
                        ) : (
                            <IconChevronDown size={"0.9rem"} />
                        )}
                    </ActionIcon>}
                </Flex>
            </Flex>
            <Collapse in={((selectStep === index && opened) || showAll || false)} key={index}>
                <Flex gap={"sm"} p={"sm"} style={{ borderTop: "1px solid #ced4da" }}>
                    <Avatar src={userImgUrl} size={"md"} radius={"xl"} />
                    <Box>
                        <div style={{ fontSize: "11px" }}>
                            <BracketGradientWrapper>{text}</BracketGradientWrapper>
                        </div>
                    </Box>
                </Flex>
            </Collapse>
        </Box>
    );
};

export default SequenceVariant;
