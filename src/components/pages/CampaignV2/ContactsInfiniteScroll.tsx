import { Badge, Group, Paper, Text, ScrollArea, Flex, Avatar, Box, Loader, Skeleton, TextInput, ActionIcon } from '@mantine/core';
import { useEffect, useRef, useState, useCallback } from 'react';
import { IconSearch, IconFilter } from '@tabler/icons-react';
import { fetchCampaignContacts } from "@utils/requests/campaignOverview";
import { useRecoilValue } from 'recoil';
import { userTokenState } from '@atoms/userAtoms';
import { debounce } from 'lodash';

interface Contact {
    first_name: string;
    last_name: string;
    email: string;
    avatar: string;
    title: string;
    company: string;
    icp_fit_score: number;
}

const batchSize = 20; // Adjust batch size as needed

export function ContactsInfiniteScroll({ campaignId, setContactsData }: { campaignId: number, setContactsData: any}) {
    const [loading, setLoading] = useState(false);
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [hasMoreContacts, setHasMoreContacts] = useState(true);
    const scrollViewportRef = useRef<HTMLDivElement>(null);
    const userToken = useRecoilValue(userTokenState);
    const offsetRef = useRef(0);

    const getIcpFitBadge = (icp_fit_score: number) => {
        let label = "";
        let color = "";

        switch (icp_fit_score) {
            case 4:
                label = "Very High";
                color = "green";
                break;
            case 3:
                label = "High";
                color = "blue";
                break;
            case 2:
                label = "Medium";
                color = "yellow";
                break;
            case 1:
                label = "Low";
                color = "orange";
                break;
            case 0:
                label = "Very Low";
                color = "red";
                break;
            case -1:
                label = "Do Not Contact";
                color = "gray";
                break;
            default:
                label = "Unknown";
                color = "gray";
                break;
        }

        return (
            <Flex gap="xs">
                <Badge color={color}>{label}</Badge>
            </Flex>
        );
    };

    const loadMoreContacts = async () => {
        if (loading || !hasMoreContacts) return; // Prevent multiple calls while loading or if no more contacts
        setLoading(true);
        try {
            const newContacts = await fetchCampaignContacts(userToken, campaignId, offsetRef.current, batchSize, searchTerm);
            if (newContacts.sample_contacts.length === 0) {
                setHasMoreContacts(false); // No more contacts to load
            } else {
                setContacts((prevContacts) => [...prevContacts, ...newContacts.sample_contacts]);
                offsetRef.current += batchSize;
            }
        } catch (error) {
            console.error("Error loading more contacts", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchInitialContacts = async (searchTerm: string) => {
        setLoading(true);
        try {
            const initialContacts = await fetchCampaignContacts(userToken, campaignId, 0, batchSize, searchTerm);
            setContacts(initialContacts.sample_contacts);
            offsetRef.current = batchSize;
            setHasMoreContacts(initialContacts.sample_contacts.length === batchSize);
        } catch (error) {
            console.error("Error fetching initial contacts", error);
        } finally {
            setLoading(false);
        }
    };

    const debouncedFetchInitialContacts = useCallback(debounce(fetchInitialContacts, 300), []);

    useEffect(() => {
        fetchInitialContacts(searchTerm);
    }, [campaignId]);

    useEffect(() => {
        debouncedFetchInitialContacts(searchTerm);
    }, [searchTerm]);

    return (
        <Paper withBorder w={"100%"}>
            <Flex gap={"sm"} align={"center"} p={"md"}>
                <TextInput
                    w={"100%"}
                    placeholder="Search prospects, companies, titles"
                    rightSection={<IconSearch size={"0.9rem"} color="gray" />}
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.currentTarget.value)}
                />
                <ActionIcon
                    variant="outline"
                    size={"lg"}
                    styles={{
                        root: {
                            border: "1px solid #ced4da !important",
                        },
                    }}
                >
                    <IconFilter />
                </ActionIcon>
            </Flex>
            <ScrollArea
                style={{ height: 300 }}
                onScrollPositionChange={({ y }) => {
                    const threshold = 50; // Load more contacts 50px before reaching the end
                    if (y + scrollViewportRef.current!.clientHeight >= scrollViewportRef.current!.scrollHeight - threshold) {
                        loadMoreContacts();
                    }
                }}
                viewportRef={scrollViewportRef}
            >
                <Flex direction="column" gap="sm">
                    {contacts.map((contact, index) => (
                        <Flex key={index} gap="sm">
                             <Box ml="md">
                                <Flex align="center" gap="xs">
                                <Avatar size="md" radius="xl" src={contact.avatar} />
                                    <Flex direction="column">
                                        <Flex align="center" gap="xs">
                                            <Text fw={500}>{contact.first_name + ' ' + contact.last_name}</Text>
                                            {getIcpFitBadge(contact.icp_fit_score)}
                                        </Flex>
                                        <Text color="gray" fw={500} size="xs">
                                            {contact.title + ' at ' + contact.company}
                                        </Text>
                                    </Flex>
                                </Flex>
                                </Box>

                        </Flex>

                    ))}
                    {loading && (
                        <Flex direction="column" gap="sm">
                            {Array.from({ length: batchSize }).map((_, index) => (
                                <Flex key={index} direction="row" align="center" gap="sm" ml="lg">
                                    <Skeleton height={50} width={50} radius="150%" />
                                    <Flex direction="column" gap="xs" w="100%">
                                        <Skeleton height={8} radius="xl" width="80%" />
                                        <Skeleton height={8} radius="xl" width="60%" />
                                    </Flex>
                                </Flex>
                            ))}
                        </Flex>
                    )}
                </Flex>
            </ScrollArea>
            <Paper p="md" withBorder>
                <Group position="apart">
                    <Text size="sm">
                        {loading ? <><Loader size="xs" variant="dots" /></> : `Showing ${contacts?.length} contacts`}
                    </Text>
                    {/* <Button variant="light" onClick={resetContacts}>
            Reset contacts
          </Button> */}
                </Group>
            </Paper>
        </Paper>
    )
}
