import { emailSubjectLinesState, userTokenState } from "@atoms/userAtoms";
import { API_URL } from "@constants/data";
import {
  LoadingOverlay,
  TextInput,
  Card,
  Flex,
  Button,
  Box,
  Overlay,
  CloseButton,
  Text,
  Select,
  Modal,
  Space,
  Accordion,
  Table,
  Checkbox,
  List,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
// import { CreateSegmentTemplate } from "@utils/requests/emailSubjectLines";
import { useEffect, useState } from "react";
import { closeAllModals, openConfirmModal } from "@mantine/modals";
import { useRecoilState, useRecoilValue } from "recoil";
import { set } from "lodash";
import { a } from "react-spring";
import { NewContacts } from "./PrefilterV2EditModal";

interface CreateSegment extends Record<string, unknown> {
  modalOpened: boolean;
  openModal: () => void;
  closeModal: () => void;
  saved_apollo_query_id: number;
  backFunction: () => void;
  filters: any;
  numContactsLimit: number;
  archetypeID: number | null;
  setDuplicateContacts: React.Dispatch<React.SetStateAction<any[]>>;
  setNewContacts: React.Dispatch<React.SetStateAction<NewContacts[]>>;
  setDuplicateModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function CreateSegmentModal(props: CreateSegment) {
  const [userToken] = useRecoilState(userTokenState);

  const numContactsLimit = props.numContactsLimit;
  const [segments, setSegments] = useState<any[]>([]);
  const [selectedSegment, setSelectedSegment] = useState<string>("");
  const [segmentName, setSegmentName] = useState<string>("");
  const [numContacts, setNumContacts] = useState<string>(
    numContactsLimit < 100 ? "10" : "100"
  );

  const contactSelectNums = [
    { value: "10", label: "10" },
    { value: "50", label: "50" },
    { value: "100", label: "100" },
    { value: "200", label: "200" },
    { value: "500", label: "500" },
    { value: "1000", label: "1000" },
    { value: "2000", label: "2000" },
    ...(numContactsLimit < 2000
      ? [
          {
            value: numContactsLimit.toString(),
            label: numContactsLimit.toString() + " (all found contacts)",
          },
        ]
      : []),
  ].filter(
    (option) => parseInt(option.value, 10) <= Math.min(numContactsLimit, 2000)
  );

  const [loading, setLoading] = useState(false);
  const [subjectLine, setSubjectLine] = useState<string>("");

  const fetchSegments = async () => {
    try {
      const response = await fetch(`${API_URL}/apollo/segments`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
      });
      const data = await response.json();
      if (data.status === "success") {
        console.log("Segments fetched successfully:", data.data);
        setSegments(data.data);
        return data.data;
      } else {
        console.error("Failed to fetch segments:", data.message);
      }
    } catch (error) {
      console.error("Error fetching segments:", error);
    }
  };

  useEffect(() => {
    fetchSegments();
  }, [userToken]);

  const [screen, setScreen] = useState<
    "choice" | "newSegment" | "existingSegment"
  >("choice");

  if (!props.modalOpened) {
    return null;
  }

  return (
    <>
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.15)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000,
        }}
        onClick={() => {
          props.closeModal();
          setSubjectLine("");
          setScreen("choice");
        }}
      >
        <Card
          mt="sm"
          sx={{
            position: "relative",
            padding: "20px",
            backgroundColor: "white",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <CloseButton
            onClick={() => {
              props.closeModal();
              setSubjectLine("");
              setScreen("choice");
            }}
            sx={{ position: "absolute", top: 10, right: 10 }}
          />

          {screen === "choice" && (
            <>
              <Text align="center" size="lg" weight={700} mt="md">
                Pick a Segment
              </Text>
              <Text align="center" size="sm" color="dimmed" mt="sm">
                To get started, either{" "}
                <Text component="span" weight={700}>
                  Create New Segment
                </Text>{" "}
                or{" "}
                <Text component="span" weight={700}>
                  Select Existing Segment
                </Text>
                .
              </Text>
              <Text align="center" size="sm" color="dimmed" mt="xs">
                The found prospects will be uploaded into that Segment.
              </Text>
              <Flex justify="center" mt="xl">
                <Button
                  color="blue"
                  mr="md"
                  onClick={() => setScreen("newSegment")}
                >
                  Create New Segment
                </Button>
                <Button
                  color="blue"
                  onClick={() => setScreen("existingSegment")}
                >
                  Select Existing Segment
                </Button>
              </Flex>
            </>
          )}

          {screen === "existingSegment" && (
            <>
              <Text align="center" size="lg" weight={700} mt="md">
                Select Existing Segment
              </Text>
              <Flex justify="center" mt="xl">
                <Button variant="subtle" onClick={() => setScreen("choice")}>
                  <Text size="sm" color="blue">
                    Previous
                  </Text>
                </Button>
              </Flex>
              <Select
                label="Segment"
                withinPortal
                placeholder="Select an option"
                onChange={(value) => setSelectedSegment(value ?? "")}
                mt="md"
                data={segments?.map((segment) => ({
                  value: segment.id.toString(),
                  label: `${segment.segment_title} (${segment.prospect_count} prospects)`,
                }))}
                zIndex={9999}
              />
              <Select
                withinPortal
                label="Number of Contacts to Import"
                placeholder="Pick one"
                value={numContacts}
                onChange={(value) => setNumContacts(value ?? "")}
                data={contactSelectNums}
                mt="md"
                zIndex={9999}
              />
              <Text align="center" size="sm" color="dimmed" mt="sm">
                Note: This action is not reversible. Once segment is created,
                contacts will start uploading. This will use your upload
                credits.
              </Text>
              <Flex justify="center" mt="xl">
                <Button
                  loading={loading}
                  color="blue"
                  onClick={async () => {
                    setLoading(true);
                    console.log(props.saved_apollo_query_id);
                    try {
                      const response = await fetch(
                        `${API_URL}/prospect/add_from_apollo_query_id`,
                        {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${userToken}`,
                          },
                          body: JSON.stringify({
                            saved_apollo_query_id: props.saved_apollo_query_id,
                            segment_id: segments.find(
                              (segment) =>
                                segment.id.toString() === selectedSegment
                            )?.id,
                            num_contacts: parseInt(numContacts, 10),
                          }),
                        }
                      );
                      if (!response.ok) {
                        throw new Error("Network response was not ok");
                      }

                      const data = await response.json();

                      props.setDuplicateContacts(data.duplicate);
                      props.setNewContacts(data.new);

                      showNotification({
                        id: "success",
                        title: "Success",
                        message: "Segment created successfully",
                        color: "green",
                      });
                      closeAllModals();
                      props.closeModal();
                      props.setDuplicateModalOpen(true);
                    } catch (error) {
                      showNotification({
                        id: "error",
                        title: "Error",
                        message: "Failed to add contacts to segment",
                        color: "red",
                      });
                      console.error("Error:", error);
                    }
                    setLoading(false);
                  }}
                >
                  {`Add & Upload ${numContacts} Contacts to Segment`}
                </Button>
              </Flex>
            </>
          )}

          {screen === "newSegment" && (
            <>
              <Flex direction="column" align="center" mt="md">
                <Button
                  variant="subtle"
                  onClick={() => setScreen("choice")}
                  mb="md"
                >
                  <Text size="sm" color="blue">
                    Previous
                  </Text>
                </Button>
                <Text size="lg" weight={700} align="center">
                  CREATE NEW SEGMENT
                </Text>
              </Flex>
              <TextInput
                value={segmentName}
                onChange={(event) => setSegmentName(event.currentTarget.value)}
                label="Descriptive Segment Name"
                placeholder="Diverse contacts, various interests and industries."
                mt="md"
              />
              <Select
                withinPortal
                label="Number of Contacts to Import"
                placeholder="Pick one"
                value={numContacts}
                onChange={(value) => setNumContacts(value ?? "")}
                data={contactSelectNums}
                mt="md"
                zIndex={9999}
              />
              <Text align="center" size="sm" color="dimmed" mt="sm">
                Note: This action is not reversible. Once segment is created,
                contacts will start uploading. This will use your upload
                credits.
              </Text>
              <Flex justify="center" mt="xl">
                <Button
                  loading={loading}
                  color="blue"
                  onClick={async () => {
                    setLoading(true);
                    try {
                      console.log(props.saved_apollo_query_id);

                      const payload = {
                        segment_title:
                          segmentName === ""
                            ? new Date().toISOString()
                            : segmentName,
                        filters: props.filters, // Add your filters here
                        // campaign_id: 'campaign_id', // Replace with actual campaign ID
                        saved_apollo_query_id: props.saved_apollo_query_id,
                      };

                      const response = await fetch(
                        `${API_URL}/segment/create`,
                        {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${userToken}`,
                          },
                          body: JSON.stringify(payload),
                        }
                      );
                      if (!response.ok) {
                        throw new Error("Network response was not ok");
                      }
                      //get the segmnet id from the response

                      const data = await response.json();
                      const segmentId = data.id;
                      // Fetch segments to get the newly created segment ID
                      // const segmentData = await fetchSegments();
                      // const newSegment = segmentData.find((segment: { segment_title: string; }) => segment.segment_title === (segmentName === '' ? new Date().toISOString() : segmentName));
                      if (!segmentId) {
                        throw new Error("Newly created segment not found");
                      }

                      // Call the API to add contacts to the new segment
                      const addContactsResponse = await fetch(
                        `${API_URL}/prospect/add_from_apollo_query_id`,
                        {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${userToken}`,
                          },
                          body: JSON.stringify({
                            saved_apollo_query_id: props.saved_apollo_query_id,
                            segment_id: segmentId,
                            num_contacts: parseInt(numContacts, 10),
                          }),
                        }
                      );
                      if (!addContactsResponse.ok) {
                        throw new Error("Network response was not ok");
                      }

                      const responseData = await addContactsResponse.json();

                      props.setDuplicateContacts(responseData.duplicate);
                      props.setNewContacts(responseData.new);

                      closeAllModals();
                      props.closeModal();
                      props.setDuplicateModalOpen(true);

                      showNotification({
                        id: "success",
                        title: "Success",
                        message:
                          "Segment created and contacts added successfully",
                        color: "green",
                      });
                      //close current modal

                      props.closeModal();
                    } catch (error) {
                      showNotification({
                        id: "error",
                        title: "Error",
                        message: "Failed to create segment or add contacts",
                        color: "red",
                      });
                      console.error("Error:", error);
                    }
                    setLoading(false);
                  }}
                >
                  {loading
                    ? "Finding Duplicates"
                    : "Create & Upload {numContacts} Contacts"}
                </Button>
              </Flex>
            </>
          )}
        </Card>
      </Box>
    </>
  );
}
