import React, { useEffect, useState } from "react";
import {
  Paper,
  Title,
  Button,
  Group,
  Text,
  Table,
  Modal,
  TextInput,
  Textarea,
  Loader,
} from "@mantine/core";
import { IconPlus, IconEdit, IconSearch, IconMicrophone } from "@tabler/icons";
import { API_URL } from "@constants/data";
import { useRecoilValue } from "recoil";
import { userTokenState } from "@atoms/userAtoms";

interface PersonaData {
  name: string;
  description: string;
  contacts: number;
  filters: number;
  voiceLabel: string;
  saved_apollo_query_id: number;
  id: number;
  assets: any;
}

const Personas = () => {
  const [personas, setPersonas] = useState([]);
  const [isLoading, setLoading] = useState(false); // Add this line

  const [isModalOpen, setModalOpen] = useState(false);
  const [newPersonaName, setNewPersonaName] = useState("");
  const [newPersonaDescription, setNewPersonaDescription] = useState("");

  const [isFullscreenModalOpen, setFullscreenModalOpen] = useState(false);
  const [iframeUrl, setIframeUrl] = useState("");

  const userToken = useRecoilValue(userTokenState);

  // Function to fetch personas
  const fetchPersonas = async () => {
    setLoading(true); // Start loading
    const response = await fetch(`${API_URL}/personas/personas`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`, // Assuming you have a userToken state or prop
      },
    });
    if (response.ok) {
      const data = await response.json();
      setPersonas(data.personas);
    } else {
      // Handle server errors or unauthorized access
      console.error("Failed to fetch personas");
    }
    setLoading(false); // End loading
  };

  useEffect(() => {
    fetchPersonas();
  }, []); // Empty dependency array means this effect runs once on mount

  const handleCreatePersona = async () => {
    const response = await fetch(`${API_URL}/personas/persona`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`, // Ensure you have the userToken
      },
      body: JSON.stringify({
        name: newPersonaName,
        description: newPersonaDescription,
      }),
    });

    if (response.ok) {
      // Persona created successfully, now fetch the updated list
      fetchPersonas();
      handleCloseModal();
    } else {
      // Handle creation errors
      console.error("Failed to create new persona");
    }
  };

  const handleAddPersona = () => setModalOpen(true);
  const handleCloseModal = () => setModalOpen(false);

  const rows = personas.map((persona: PersonaData, index) => (
    <tr key={index}>
      <td style={{ paddingTop: 24, paddingBottom: 24 }}>
        <Text weight={500}>{persona.name}</Text>
        <Text color="dimmed" size="xs">
          {persona.description}
        </Text>
      </td>
      <td style={{ paddingTop: 24, paddingBottom: 24 }}>
        {persona.saved_apollo_query_id ? (
          <>
            <Text>{persona.contacts?.toLocaleString()} prospects</Text>
            <Group spacing="xs">
              <Button
                leftIcon={<IconSearch size={14} />}
                variant="outline"
                size="xs"
              >
                View Filters
              </Button>
              <Button
                leftIcon={<IconEdit size={14} />}
                variant="outline"
                size="xs"
              >
                Edit
              </Button>
            </Group>
          </>
        ) : (
          <Button
            leftIcon={<IconSearch size="0.8rem" />}
            size="xs"
            color="grape"
            onClick={() => {
              setIframeUrl(
                "https://sellscale.retool.com/embedded/public/7559b6ce-6f20-4649-9240-a2dd6429323e#authToken=" +
                  userToken +
                  "&persona_id=" +
                  persona.id
              );
              setFullscreenModalOpen(true);
            }}
          >
            Set filters
          </Button>
        )}
      </td>
      <td style={{ paddingTop: 24, paddingBottom: 24 }}>
        <>
          <Text>{persona.assets.length} assets</Text>
          <Button
            variant="filled"
            size="xs"
            color="teal"
            style={{ marginTop: 5 }}
          >
            Edit assets
          </Button>
        </>
      </td>
      <td style={{ paddingTop: 24, paddingBottom: 24 }}>
        <Button
          leftIcon={<IconMicrophone size={14} />}
          variant="filled"
          size="xs"
        >
          Using No Voice
        </Button>
      </td>
    </tr>
  ));

  return (
    <Paper style={{ padding: "32px" }}>
      <Modal
        opened={isFullscreenModalOpen}
        onClose={() => {
          setFullscreenModalOpen(false);
          fetchPersonas();
        }}
        size="full"
        padding={0}
        w={window.innerWidth}
        h={window.innerHeight}
        withinPortal
        zIndex={1000}
      >
        <iframe
          src={iframeUrl}
          width={window.innerWidth - 400}
          height={window.innerHeight}
          style={{ border: "none" }}
        ></iframe>
      </Modal>
      <Group
        position="apart"
        style={{ marginBottom: 20, alignItems: "center" }}
      >
        <div>
          <Title order={2}>Personas (Coming Soon ⚠️)</Title>
          <Text color="dimmed" size="sm">
            Territories are used to define high level TAM and filters for our AI
            to segment from.
          </Text>
        </div>
        <Button
          leftIcon={<IconPlus size={14} />}
          variant="filled"
          size="md"
          onClick={handleAddPersona}
        >
          Add persona
        </Button>
      </Group>

      <Modal
        opened={isModalOpen}
        onClose={handleCloseModal}
        title="Add New Persona"
      >
        <TextInput
          label="Persona Name"
          placeholder="Enter persona name"
          value={newPersonaName}
          onChange={(event) => setNewPersonaName(event.currentTarget.value)}
          required
        />
        <Textarea
          label="Persona Description"
          placeholder="Enter persona description"
          value={newPersonaDescription}
          onChange={(event) =>
            setNewPersonaDescription(event.currentTarget.value)
          }
          minRows={5}
          required
        />
        <Button mt="md" onClick={handleCreatePersona}>
          Create Persona
        </Button>
      </Modal>

      {isLoading ? (
        <div
          style={{ display: "flex", justifyContent: "center", padding: "50px" }}
        >
          <Loader /> {/* Use the Loader component from Mantine */}
        </div>
      ) : (
        <Table striped highlightOnHover>
          <thead>
            <tr>
              <th>Persona Name</th>
              <th>Pre-Filters</th>
              <th>AI Brain</th>
              <th>Voice</th>
            </tr>
          </thead>
          <tbody>{rows}</tbody>
        </Table>
      )}
    </Paper>
  );
};

export default Personas;
