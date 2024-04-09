const mockPersonas: PersonaData[] = [
  {
    name: "NewtonX Baseline",
    contacts: 1766890,
    filters: 3,
    assets: 51,
    voiceLabel: "UI/UX",
    description: "Your description here.",
  },
  {
    name: "In-house researcher",
    contacts: 1766890,
    filters: 10,
    assets: 10,
    voiceLabel: "UI/UX",
    description: "Your description here.",
  },
  {
    name: "UI/UX",
    contacts: 1766890,
    filters: 10,
    assets: 10,
    voiceLabel: "UI/UX",
    description: "Your description here.",
  },
  {
    name: "Private equity",
    contacts: 1766890,
    filters: 10,
    assets: 0,
    voiceLabel: "UI/UX",
    description: "Your description here.",
  },
  {
    name: "Consulting",
    contacts: 1766890,
    filters: 10,
    assets: 0,
    voiceLabel: "UI/UX",
    description: "Your description here.",
  },
  // ... Add more personas here as per the mock data in the screenshot
];

import React, { useState } from "react";
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
} from "@mantine/core";
import {
  IconPlus,
  IconEdit,
  IconSettings,
  IconSearch,
  IconMicrophone,
} from "@tabler/icons";

interface PersonaData {
  name: string;
  contacts: number;
  filters: number;
  assets: number;
  voiceLabel: string;
  description?: string;
}

const Personas = () => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [newPersonaName, setNewPersonaName] = useState("");
  const [newPersonaDescription, setNewPersonaDescription] = useState("");

  const handleAddPersona = () => setModalOpen(true);
  const handleCloseModal = () => setModalOpen(false);
  const handleCreatePersona = () => {
    // Logic to create new persona goes here
    console.log(newPersonaName, newPersonaDescription);
    handleCloseModal();
  };

  const rows = mockPersonas.map((persona, index) => (
    <tr key={index}>
      <td style={{ paddingTop: 24, paddingBottom: 24 }}>
        <Text weight={500}>{persona.name}</Text>
        <Text color="dimmed" size="xs">
          {persona.description}
        </Text>
      </td>
      <td style={{ paddingTop: 24, paddingBottom: 24 }}>
        <Text>{persona.contacts.toLocaleString()} prospects</Text>
        <Group spacing="xs">
          <Button
            leftIcon={<IconSearch size={14} />}
            variant="outline"
            size="xs"
          >
            View Filters
          </Button>
          <Button leftIcon={<IconEdit size={14} />} variant="outline" size="xs">
            Edit
          </Button>
        </Group>
      </td>
      <td style={{ paddingTop: 24, paddingBottom: 24 }}>
        <Text>{persona.assets} assets</Text>
        <Button
          variant="filled"
          size="xs"
          color="teal"
          style={{ marginTop: 5 }}
        >
          Edit assets
        </Button>
      </td>
      <td style={{ paddingTop: 24, paddingBottom: 24 }}>
        <Button
          leftIcon={<IconMicrophone size={14} />}
          variant="filled"
          size="xs"
        >
          Using {persona.voiceLabel} Voice
        </Button>
      </td>
    </tr>
  ));

  return (
    <Paper style={{ padding: "32px" }}>
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
    </Paper>
  );
};

export default Personas;
