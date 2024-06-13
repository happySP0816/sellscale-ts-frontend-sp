import React, { useState } from 'react';
import { Slider, Button, Flex, Text, Tooltip, Paper } from '@mantine/core';
import { IconQuestionMark } from '@tabler/icons-react';

const MAX_CONTACTS = 2147483647;

interface OutreachSliderProps {
    testingVolume: number;
    setTestingVolume: (value: number) => void;
    totalContacts: number;
    userToken: string;
    id: Number;
    fetchCampaignStats: (token: string, id: number) => Promise<void>;
    setLoadingStats: (loading: boolean) => void;
}

import {
    patchTestingVolume,
} from "@utils/requests/campaignOverview";

const OutreachSlider: React.FC<OutreachSliderProps> = ({
    testingVolume,
    setTestingVolume,
    totalContacts,
    userToken,
    id,
    fetchCampaignStats,
    setLoadingStats,
}) => {
    const [isUnsaved, setIsUnsaved] = useState(false);

    return (
        <Paper p="md" withBorder w={"100%"}>
            <Flex justify={"space-between"}>
                <Flex justify={"space-between"}>
                    <Text size={"xs"} fw={500}>
                        Outreach Volume
                    </Text>
                    <Tooltip
                        multiline
                        label={
                            <Text size="sm">
                                SellScale will initiate weekly interactions
                                <br />
                                with this specified number of contacts,
                                <br />
                                determined by the imported contacts
                                <br /> and the capacity of your account.
                                <br></br>
                            </Text>
                        }
                        withArrow
                        position="right"
                    >
                        <Text color="#37414E" size="xs">
                            <IconQuestionMark size={"0.75rem"} color="#37414E" />
                        </Text>
                    </Tooltip>
                </Flex>
                <Text size={"xs"} fw={500}>
                    {testingVolume === MAX_CONTACTS ||
                        (testingVolume === 1000 && totalContacts < 1000)
                        ? "Max/week"
                        : `${testingVolume}/week`}{" "}
                    {isUnsaved && (
                        <Text
                            component="span"
                            color="red"
                            size="xs"
                            fw={700}
                            ml={4}
                        >
                            (Unsaved)
                        </Text>
                    )}
                    <Text
                        component="span"
                        underline
                        color="#228be6"
                        size="xs"
                        fw={700}
                        ml={4}
                    >
                        Analytics
                    </Text>
                </Text>
            </Flex>
            <Flex w={"100%"} align={"start"} gap={"sm"} mt={"md"}>
                <Slider
                    w={"100%"}
                    value={testingVolume}
                    onChange={(value) => {
                        setTestingVolume(value);
                        setIsUnsaved(true);
                    }}
                    max={totalContacts > 1000 ? totalContacts : 1000}
                    marks={[
                        { value: 0, label: "0" },
                        {
                            value: totalContacts > 1000 ? totalContacts : 1000,
                            label: (
                                <div
                                    style={{
                                        whiteSpace: "nowrap",
                                    }}
                                >
                                    Max
                                </div>
                            ),
                        },
                    ]}
                    label={(value) =>
                        totalContacts < 1000 && value === 1000 ? "Max" : value
                    }
                ></Slider>
                <Button
                    onClick={async () => {
                        const clientArchetypeId = Number(id);
                        const response = await patchTestingVolume(
                            userToken,
                            clientArchetypeId,
                            testingVolume
                        );
                        if (response) {
                            console.log(
                                "Testing volume updated successfully",
                                response
                            );
                        }
                        setLoadingStats(true);
                        await fetchCampaignStats(userToken, clientArchetypeId);
                        setLoadingStats(false);
                        setIsUnsaved(false);
                    }}
                >
                    Save
                </Button>
            </Flex>
        </Paper>
    );
};

export default OutreachSlider;
