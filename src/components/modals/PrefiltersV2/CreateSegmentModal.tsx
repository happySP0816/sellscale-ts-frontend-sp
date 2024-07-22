import { emailSubjectLinesState, userTokenState } from "@atoms/userAtoms";
import { API_URL } from "@constants/data";
import { LoadingOverlay, TextInput, Card, Flex, Button, Box, Overlay, CloseButton, Text, Select } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
// import { CreateSegmentTemplate } from "@utils/requests/emailSubjectLines";
import { useEffect, useState } from "react";
import { closeAllModals, openConfirmModal } from "@mantine/modals";
import { useRecoilState, useRecoilValue } from "recoil";


interface CreateSegment extends Record<string, unknown> {
  modalOpened: boolean;
  openModal: () => void;
  closeModal: () => void;
  backFunction: () => void;
  archetypeID: number | null;
}

export default function CreateSegmentModal(props: CreateSegment) {

  const [userToken] = useRecoilState(userTokenState);


  const [segments, setSegments] = useState<any[]>([]);
  const [selectedSegment, setSelectedSegment] = useState<string>("");
  const [segmentName, setSegmentName] = useState<string>("");

  const [loading, setLoading] = useState(false);
  const [subjectLine, setSubjectLine] = useState<string>("");

  const fetchSegments = async () => {
    try {
      const response = await fetch(`${API_URL}/apollo/segments`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${userToken}`,
        },
      });
      const data = await response.json();
      if (data.status === "success") {
        console.log("Segments fetched successfully:", data.data);
        setSegments(data.data);
        return data.data
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

  const triggerCreateSegmentTemplate = async () => {
    setLoading(true);

    // const result = await CreateSegmentTemplate(userToken, props.archetypeID as number, subjectLine);
    // if (result.status != 'success') {
    //   showNotification({
    //     title: 'Error',
    //     message: result.message,
    //     color: 'red',
    //   })
    //   setLoading(false);
    //   return;
    // } else {
    //   showNotification({
    //     title: 'Success',
    //     message: 'Successfully created email subject line',
    //     color: 'green',
    //   })
    //   setLoading(false);
    //   if (setEmailSubjectLines) {
    //     setEmailSubjectLines((prev: any) => [...prev, result.data]);
    //   }
    //   props.backFunction();
    //   props.closeModal();
    //   setSubjectLine("");
    // }

    return;
  }

  const [screen, setScreen] = useState<'choice' | 'newSegment' | 'existingSegment'>('choice');

  if (!props.modalOpened) {
    return null;
  }

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.15)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
      }}
      onClick={() => {
        props.closeModal();
        setSubjectLine("");
        setScreen('choice');
      }}
    >
      <Card
        mt='sm'
        sx={{
          position: 'relative',
          padding: '20px',
          backgroundColor: 'white',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <CloseButton
          onClick={() => {
            props.closeModal();
            setSubjectLine("");
            setScreen('choice');
          }}
          sx={{ position: 'absolute', top: 10, right: 10 }}
        />

        {screen === 'choice' && (
          <>
            <Text align="center" size="lg" weight={700} mt="md">
              Pick a Segment
            </Text>
            <Text align="center" size="sm" color="dimmed" mt="sm">
              To get started, either <Text component="span" weight={700}>Create New Segment</Text> or <Text component="span" weight={700}>Select Existing Segment</Text>.
            </Text>
            <Text align="center" size="sm" color="dimmed" mt="xs">
              The found prospects will be uploaded into that Segment.
            </Text>
            <Flex justify="center" mt="xl">
              <Button color="blue" mr="md" onClick={() => setScreen('newSegment')}>
                Create New Segment
              </Button>
              <Button color="blue" onClick={() => setScreen('existingSegment')}>
                Select Existing Segment
              </Button>
            </Flex>
          </>
        )}

        {screen === 'existingSegment' && (
          <>
            <Text align="center" size="lg" weight={700} mt="md">
              Select Existing Segment
            </Text>
            <Flex justify="center" mt="xl">
              <Button variant="subtle" onClick={() => setScreen('choice')}>
                <Text size="sm" color="blue">Previous</Text>
              </Button>
     
            </Flex>
            <Select
              label="Segment"
              placeholder="Select an option"
              onChange={(value) => setSelectedSegment(value ?? "")}
              mt="md"
              data={segments.map(segment => ({
                value: segment.id.toString(),
                label: `${segment.segment_title} (${segment.prospect_count} prospects)`
              }))}
            />
            <Text align="center" size="sm" color="dimmed" mt="sm">
              Note: This action is not reversible. Once segment is created, contacts will start uploading. This will use your upload credits.
            </Text>
            <Flex justify="center" mt="xl">
              <Button color="blue" onClick={async () => {
                try {
                  const response = await fetch(`${API_URL}/prospect/add_from_apollo_query_id`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${userToken}`,
                    },
                    body: JSON.stringify({
                      saved_apollo_query_id: props.saved_apollo_query_id,
                      segment_id: segments.find(segment => segment.id.toString() === selectedSegment)?.id,
                      num_contacts: 100,
                    }),
                  });
                  if (!response.ok) {
                    throw new Error('Network response was not ok');
                  }
                  const data = await response;
                  console.log('Success:', data);
                  showNotification({
                    id: 'success',
                    title: 'Success',
                    message: 'Segment created successfully',
                    color: 'green',
                  });
                  closeAllModals();
                } catch (error) {
                  showNotification({
                    id: 'error',
                    title: 'Error',
                    message: 'Failed to add contacts to segment',
                    color: 'red',
                  });
                  console.error('Error:', error);
                }
              }}>
                Add & Upload 100 Contacts to Segment
              </Button>
            </Flex>
          </>
        )}

        {screen === 'newSegment' && (
          <>
            <Flex direction="column" align="center" mt="md">
              <Button variant="subtle" onClick={() => setScreen('choice')} mb="md">
                <Text size="sm" color="blue">Previous</Text>
              </Button>
              <Text size="lg" weight={700} align="center">CREATE NEW SEGMENT</Text>
            </Flex>
            <TextInput
              value={segmentName}
              onChange={(event) => setSegmentName(event.currentTarget.value)}
              label="Descriptive Segment Name"
              placeholder="Diverse contacts, various interests and industries."
              mt="md"
            />
            <Text align="center" size="sm" color="dimmed" mt="sm">
              Note: This action is not reversible. Once segment is created, contacts will start uploading. This will use your upload credits.
            </Text>
            <Flex justify="center" mt="xl">
              <Button color="blue" onClick={async () => {
                try {
                  const response = await fetch(`${API_URL}/segment/create`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${userToken}`,
                    },
                    body: JSON.stringify({
                      segment_title: segmentName === '' ? new Date().toISOString() : segmentName,
                      filters: props.filters, // Add your filters here
                      // campaign_id: 'campaign_id', // Replace with actual campaign ID
                      saved_apollo_query_id: props.saved_apollo_query_id,
                    }),
                  });
                  if (!response.ok) {
                    throw new Error('Network response was not ok');
                  }
                  const data = await response.json();
                  console.log('Success:', data);
                  
                  // Fetch segments to get the newly created segment ID
                  const segmentData = await fetchSegments();
                  const newSegment = segmentData.find((segment: { segment_title: string; }) => segment.segment_title === (segmentName === '' ? new Date().toISOString() : segmentName));
                  if (!newSegment) {
                    throw new Error('Newly created segment not found');
                  }

                  // Call the API to add contacts to the new segment
                  const addContactsResponse = await fetch(`${API_URL}/prospect/add_from_apollo_query_id`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${userToken}`,
                    },
                    body: JSON.stringify({
                      saved_apollo_query_id: props.saved_apollo_query_id,
                      segment_id: newSegment.id,
                      num_contacts: 100,
                    }),
                  });
                  if (!addContactsResponse.ok) {
                    throw new Error('Network response was not ok');
                  }
                  const addContactsData = await addContactsResponse;
                  console.log('Success:', addContactsData);

                  closeAllModals();
                  showNotification({
                    id: 'success',
                    title: 'Success',
                    message: 'Segment created and contacts added successfully',
                    color: 'green',
                  });
                } catch (error) {
                  showNotification({
                    id: 'error',
                    title: 'Error',
                    message: 'Failed to create segment or add contacts',
                    color: 'red',
                  });
                  console.error('Error:', error);
                }
              }}>
                Create & Upload 100 Contacts
              </Button>
            </Flex>
          </>
        )}
      </Card>
    </Box>
  )
}
