import {
  Badge,
  Group,
  Paper,
  Text,
  ScrollArea,
  Flex,
  Avatar,
  Box,
  Loader,
  Skeleton,
  TextInput,
  ActionIcon,
  Modal,
  Button,
  Select,
} from "@mantine/core";
import { useEffect, useRef, useState, useCallback } from "react";
import { IconSearch, IconFilter } from "@tabler/icons-react";
import { fetchCampaignContacts } from "@utils/requests/campaignOverview";
import { useRecoilValue } from "recoil";
import { userTokenState } from "@atoms/userAtoms";
import CampaignChannelPage from "@pages/CampaignChannelPage";
import FindContactsPage from "@pages/FindContactsPage";
import { debounce } from "lodash";

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

export function ContactsInfiniteScroll({
  campaignId,
  setContactsData,
}: {
  campaignId: number;
  setContactsData: any;
}) {
  const [loading, setLoading] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [hasMoreContacts, setHasMoreContacts] = useState(true);
  const scrollViewportRef = useRef<HTMLDivElement>(null);
  const [showCampaignTemplateModal, setShowCampaignTemplateModal] = useState(
    false
  );
  const userToken = useRecoilValue(userTokenState);
  const offsetRef = useRef(0);
  const [modalOpened, setModalOpened] = useState(false);

  const getIcpFitBadge = (
    icp_fit_score: number,
    size: "sm" | "md" | "xs" = "sm"
  ) => {
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
        <Badge color={color} size={size}>
          {label}
        </Badge>
      </Flex>
    );
  };

  const loadMoreContacts = async () => {
    if (loading || !hasMoreContacts) return; // Prevent multiple calls while loading or if no more contacts
    setLoading(true);
    try {
      const newContacts = await fetchCampaignContacts(
        userToken,
        campaignId,
        offsetRef.current,
        batchSize,
        searchTerm
      );
      if (newContacts.sample_contacts.length === 0) {
        setHasMoreContacts(false); // No more contacts to load
      } else {
        setContacts((prevContacts) => [
          ...prevContacts,
          ...newContacts.sample_contacts,
        ]);
        setContactsData((prevContacts: any) => [
          ...prevContacts,
          ...newContacts.sample_contacts,
        ]);
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
      const initialContacts = await fetchCampaignContacts(
        userToken,
        campaignId,
        0,
        batchSize,
        searchTerm
      );
      setContacts(initialContacts.sample_contacts);
      setContactsData(initialContacts.sample_contacts);
      offsetRef.current = batchSize;
      setHasMoreContacts(initialContacts.sample_contacts.length === batchSize);
    } catch (error) {
      console.error("Error fetching initial contacts", error);
    } finally {
      setLoading(false);
    }
  };

  const debouncedFetchInitialContacts = useCallback(
    debounce(fetchInitialContacts, 300),
    []
  );

  useEffect(() => {
    fetchInitialContacts(searchTerm);
  }, [campaignId]);

  useEffect(() => {
    debouncedFetchInitialContacts(searchTerm);
  }, [searchTerm]);

  return (
    <Paper withBorder w={"100%"}>
      <Modal
        size="1100px"
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
      >
        <FindContactsPage />
      </Modal>
      <Modal
        opened={showCampaignTemplateModal}
        onClose={() => {
          setShowCampaignTemplateModal(false);
        }}
        size="1100px"
      >
        <CampaignChannelPage
          campaignId={campaignId}
          cType={"filter_contact"}
          hideHeader={true}
          hideEmail={false}
          hideLinkedIn={false}
          hideAssets={true}
        />
      </Modal>
      <Flex gap={"sm"} align={"center"}>
        <Flex direction="column" w={"100%"} gap="sm">
          <Flex
            justify="space-between"
            align="center"
            w={"100%"}
            style={{ borderBottom: "1px solid #ECEEF1" }}
            p={"md"}
          >
            <Text fw={600} size={20} color="#37414E">
              Contacts
            </Text>
            <Button
              variant="filled"
              size="sm"
              onClick={() => {
                setModalOpened(true);
              }}
            >
              Add Contacts
            </Button>
          </Flex>
          <Flex w={"100%"} gap="sm" pb={"md"} pl={"md"} pr={"md"}>
            <TextInput
              w={"100%"}
              size="xs"
              placeholder="Search prospects, companies, titles"
              rightSection={<IconSearch size={"0.9rem"} color="gray" />}
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.currentTarget.value)}
            />
            <ActionIcon
              variant="outline"
              size={"md"}
              onClick={() => setShowCampaignTemplateModal(true)}
            >
              <IconFilter size={"0.9rem"} color="gray" />
            </ActionIcon>
          </Flex>
        </Flex>
      </Flex>
      <ScrollArea
        style={{ height: 300 }}
        onScrollPositionChange={({ y }) => {
          const threshold = 50; // Load more contacts 50px before reaching the end
          if (
            y + scrollViewportRef.current!.clientHeight >=
            scrollViewportRef.current!.scrollHeight - threshold
          ) {
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
                      <Text fw={500} size={"sm"}>
                        {(contact.first_name + " " + contact.last_name).slice(
                          0,
                          25
                        )}
                        {(contact.first_name + " " + contact.last_name).length >
                        25
                          ? "..."
                          : ""}
                      </Text>
                      {getIcpFitBadge(contact.icp_fit_score, "xs")}
                    </Flex>
                    <Text color="gray" fw={500} fz={10}>
                      {(contact.title + " at " + contact.company).slice(0, 40)}
                      {(contact.title + " at " + contact.company).length > 40
                        ? "..."
                        : ""}
                    </Text>
                  </Flex>
                </Flex>
              </Box>
            </Flex>
          ))}
          {loading && (
            <Flex direction="column" gap="sm">
              {Array.from({ length: batchSize }).map((_, index) => (
                <Flex
                  key={index}
                  direction="row"
                  align="center"
                  gap="sm"
                  ml="lg"
                >
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
            {loading ? (
              <>
                <Loader size="xs" variant="dots" />
              </>
            ) : (
              `Showing ${contacts?.length} contacts`
            )}
          </Text>
          {/* <Button variant="light" onClick={resetContacts}>
            Reset contacts
          </Button> */}
        </Group>
      </Paper>
    </Paper>
  );
}
