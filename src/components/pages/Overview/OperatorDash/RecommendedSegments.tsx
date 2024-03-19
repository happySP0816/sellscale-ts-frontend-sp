import { userTokenState } from '@atoms/userAtoms';
import ComingSoonCard from '@common/library/ComingSoonCard';
import { API_URL } from '@constants/data';
import { Box, Title, Divider, Text, Flex, Button, Collapse, useMantineTheme, Card, Group } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { showNotification } from '@mantine/notifications';
import { IconArrowRight, IconChevronDown } from '@tabler/icons';
import React, { useEffect } from 'react';
import { useRecoilValue } from 'recoil';

interface Segment {
    segment_title: string;
    segment_id: number;
    num_prospects: number;
    distinct_archetypes: number;
}

export default function RecommendedSegments() {
    const [opened, { toggle }] = useDisclosure(true);
    const theme = useMantineTheme();

    const userToken = useRecoilValue(userTokenState)
    const [segments, setSegments] = React.useState([]);
    const [currentLoadingId, setCurrentLoadingId] = React.useState<number | null>(null);

    console.log(segments);

    const fetchSegments = async () => {
        fetch(`${API_URL}/segment/get_unused_segments`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${userToken}`,
            },
        })
        .then((response) => response.json())
        .then((data) => {
            console.log(data);

            const firstThree = data.slice(0, 3);

            setSegments(firstThree);
        });
    }

    // @SEGMENT_BLUEPRINT.route(
    //     "/<int:segment_id>/request_campaign_and_move_prospects", methods=["POST"]
    // )
    const requestCampaign = async (segment_id: number) => {
        setCurrentLoadingId(segment_id);
        fetch(`${API_URL}/segment/${segment_id}/request_campaign_and_move_prospects`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${userToken}`,
            },
        })
        .then((response) => response.json())
        .finally(() => {
            fetchSegments();
            showNotification({
                title: 'Campaign Requested',
                message: `You have requested a campaign for the segment.`,
                color: 'teal',
            });
            setCurrentLoadingId(null);

            window.location.href = '/campaigns'
        })
    }

    useEffect(() => {
        fetchSegments();
    }, []);

    if (segments.length === 0) {
        return (
            <></>
        );
    }

    return (
        <Box>
            <Flex align={"center"} gap={"sm"}>
                <Title order={4}>
                🟣 Suggested Segments <span style={{ fontWeight: "400" }} />
                </Title>

                <Divider style={{ flex: 1 }} />

                <Button
                variant="subtle"
                color="gray"
                onClick={toggle}
                compact
                rightIcon={
                    <IconChevronDown
                    size={"0.8rem"}
                    style={{
                        transitionDuration: "150ms",
                        transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
                        transform: opened ? `rotate(${opened ? 180 : 0}deg)` : "none",
                    }}
                    />
                }
                fw={700}
                fz={"sm"}
                >
                {segments.length} Segments
                </Button>
            </Flex>

            <Collapse in={opened} mt={"md"}>
                {
                    segments.map((segment: Segment) => {
                        return <Card withBorder mb='xs' p='md'>
                            <Flex>
                                <Box
                                    sx={{
                                        borderRadius: '100px',
                                        textAlign: 'center',
                                        width: 36,
                                        height: 36,
                                        flexShrink: 0,
                                    }}
                                    bg={theme.colors.grape[2]}
                                    mr='16px'
                                    mt='4px'
                                >
                                <Text fz={'18px'} size='xl' mt='5px'>
                                    ✍🏼
                                </Text>
                                </Box>
                                <Box w='80%'>
                                <Title order={5}>Segment: {segment.segment_title}</Title>
                                <Text color='#666' size='sm'>
                                    You have not used this segment in a campaign yet. If you want to use it, request a campaign.
                                </Text>
                                <Text color='gray' fw='600' fz='xs' mt='xs'>
                                    {segment.num_prospects} Prospects in this segment
                                </Text>
                                </Box>
                                <Group w='40%' sx={{ justifyContent: 'flex-end' }}>
                                <Button
                                    component='a'
                                    variant='filled'
                                    disabled={false}
                                    color={'grape'}
                                    onClick={() => {
                                        requestCampaign(segment.segment_id);
                                    }}
                                    loading={currentLoadingId === segment.segment_id}
                                >
                                    Request Campaign
                                    {'  '} <IconArrowRight size={16} />
                                </Button>
                                </Group>
                            </Flex>
                            </Card>
                    })
                }
            </Collapse>
        </Box>
    );
}