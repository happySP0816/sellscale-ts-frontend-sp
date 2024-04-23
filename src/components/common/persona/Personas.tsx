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
  Badge,
  Switch,
  Card,
  Stack,
  Box,
  Flex,
} from "@mantine/core";
import {
  IconPlus,
  IconEdit,
  IconSearch,
  IconMicrophone,
  IconWand,
} from "@tabler/icons";
import { API_URL } from "@constants/data";
import { useRecoilValue } from "recoil";
import { userTokenState } from "@atoms/userAtoms";
import { set } from "lodash";
import { IconMagnetic } from "@tabler/icons-react";

interface PersonaData {
  name: string;
  description: string;
  contacts: number;
  filters: number;
  voiceLabel: string;
  saved_apollo_query_id: number;
  id: number;
  assets: any;
  saved_apollo_query: any;
  stack_ranked_message_generation_configuration_id: number;
  stack_ranked_message_generation_configuration: any;
}

const Personas = () => {
  const [personas, setPersonas] = useState([]);
  const [isLoading, setLoading] = useState(false); // Add this line

  const [openedPersonaId, setOpenedPersonaId] = useState<any>(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [newPersonaName, setNewPersonaName] = useState("");
  const [newPersonaDescription, setNewPersonaDescription] = useState("");

  const [isFullscreenModalOpen, setFullscreenModalOpen] = useState(false);
  const [iframeUrl, setIframeUrl] = useState("");

  const [showAssetModal, setShowAssetModal] = useState(false);
  const [assets, setAssets]: any = useState([]);
  const [usedAssets, setUsedAssets] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [voices, setVoices] = useState([]);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [currentUsedVoice, setCurrentUsedVoice]: any = useState(null);

  const filteredAssets = assets.filter((asset: any) =>
    asset.asset_key.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

      const currentOpenedPersona = data.personas.find(
        (persona: PersonaData) => persona.id === openedPersonaId
      );
      setUsedAssets(currentOpenedPersona?.assets);
      setCurrentUsedVoice(
        currentOpenedPersona?.stack_ranked_message_generation_configuration_id
      );
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

      setNewPersonaName("");
      setNewPersonaDescription("");
    } else {
      // Handle creation errors
      console.error("Failed to create new persona");
    }
  };

  const fetchAllVoices = async () => {
    const response = await fetch(
      `${API_URL}/message_generation/stack_ranked_configuration/get_all_for_client`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`, // Ensure you have the userToken
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      setVoices(data.data); // Update the voices state with the fetched data
      setShowVoiceModal(true); // Show the modal
      return data.data;
    } else {
      // Handle errors
      console.error("Failed to fetch voices");
    }
  };

  const getAllAssets = async () => {
    const response = await fetch(`${API_URL}/client/all_assets_in_client`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`, // Ensure you have the userToken
      },
    });

    if (response.ok) {
      const data = await response.json();
      setAssets(data.data);
      setShowAssetModal(true);

      return data.data;
    } else {
      // Handle errors
      console.error("Failed to fetch assets");
    }
  };

  const updateVoice = async (voiceId: number, personaId: number) => {
    const response = await fetch(
      `${API_URL}/personas/persona/link_message_generation_config`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`, // Ensure you have the userToken
        },
        body: JSON.stringify({
          persona_id: personaId,
          stack_ranked_message_generation_configuration_id: voiceId,
        }),
      }
    );

    if (response.ok) {
      // Voice updated successfully
      console.log("Voice updated successfully");
      fetchPersonas();
    } else {
      // Handle errors
      console.error("Failed to update voice");
    }
  };

  const handleAddPersona = () => setModalOpen(true);
  const handleCloseModal = () => setModalOpen(false);

  const linkAsset = async (assetId: number, personaId: number) => {
    const response = await fetch(`${API_URL}/personas/persona/link_asset`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`, // Ensure you have the userToken
      },
      body: JSON.stringify({
        asset_id: assetId,
        persona_id: personaId,
      }),
    });

    if (response.ok) {
      // Asset linked successfully
      console.log("Asset linked successfully");
      fetchPersonas();
    } else {
      // Handle errors
      console.error("Failed to link asset");
    }
  };

  const unlinkAsset = async (assetId: number, personaId: number) => {
    const response = await fetch(`${API_URL}/personas/persona/unlink_asset`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`, // Ensure you have the userToken
      },
      body: JSON.stringify({
        asset_id: assetId,
        persona_id: personaId,
      }),
    });

    if (response.ok) {
      // Asset linked successfully
      console.log("Asset linked successfully");
      fetchPersonas();
    } else {
      // Handle errors
      console.error("Failed to link asset");
    }
  };

  const rows = personas.map((persona: PersonaData, index) => (
    <tr key={index}>
      <td style={{ paddingTop: 12, paddingBottom: 12 }}>
        <Text weight={500}>{persona.name}</Text>
        <Text color="dimmed" size="xs">
          {persona.description}
        </Text>
      </td>
      {/* <td style={{ paddingTop: 12, paddingBottom: 12 }}>
        {persona.saved_apollo_query_id ? (
          <>
            <Text>
              {persona.saved_apollo_query?.num_results?.toLocaleString()}{" "}
              prospects
            </Text>
            <Group spacing="xs">
              <Button
                leftIcon={<IconEdit size={14} />}
                variant="outline"
                size="xs"
                compact
                color="grape"
                mt="xs"
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
                Edit Filters
              </Button>
            </Group>
          </>
        ) : (
          <Button
            leftIcon={<IconSearch size="0.8rem" />}
            size="xs"
            compact
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
      </td> */}
      <td style={{ paddingTop: 12, paddingBottom: 12 }}>
        <>
          {persona.assets.length > 0 && (
            <Text>{persona.assets.length} assets</Text>
          )}
          <Button
            mt="xs"
            variant={persona.assets.length > 0 ? "outline" : "filled"}
            leftIcon={
              persona.assets.length > 0 ? (
                <IconEdit size={14} />
              ) : (
                <IconWand size={14} />
              )
            }
            size="xs"
            compact
            color="teal"
            onClick={() => {
              getAllAssets();
              setUsedAssets(persona.assets);
              setOpenedPersonaId(persona.id);
            }}
          >
            {persona.assets.length > 0 ? "Edit" : "Add"} Assets
          </Button>
        </>
      </td>
      {/* <td style={{ paddingTop: 12, paddingBottom: 12 }}>
        <Text>
          {persona.stack_ranked_message_generation_configuration?.name.substring(
            0,
            25
          )}{" "}
          {persona.stack_ranked_message_generation_configuration?.name.length >
          25
            ? "..."
            : ""}
        </Text>
        <Button
          leftIcon={<IconMicrophone size={14} />}
          variant={
            persona.stack_ranked_message_generation_configuration_id
              ? "outline"
              : "filled"
          }
          size="xs"
          compact
          mt="xs"
          onClick={async () => {
            const voices = await fetchAllVoices();
            console.log(voices);
            setOpenedPersonaId(persona.id);
            setCurrentUsedVoice(
              persona.stack_ranked_message_generation_configuration_id
            );
          }}
        >
          {persona.stack_ranked_message_generation_configuration_id
            ? "Edit"
            : "Add"}{" "}
          Voice
        </Button>
      </td> */}
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
      <Modal
        opened={showAssetModal}
        onClose={() => setShowAssetModal(false)}
        size="600px"
        padding="lg"
        title="Assets"
        withinPortal
        zIndex={1000}
      >
        <TextInput
          placeholder="Search assets"
          mb="md"
          onChange={(event) => setSearchQuery(event.currentTarget.value)}
        />
        {filteredAssets.map((asset: any, index: any) => (
          <Card key={index} mb="md" shadow="sm">
            <Group
              position="apart"
              sx={{ flexDirection: "row", display: "flex" }}
            >
              <Box w="80%">
                <Stack>
                  <Group>
                    <Text weight={500} size="sm">
                      {asset.asset_key}
                    </Text>
                    {asset.asset_tags.map((tag: any, tagIndex: any) => (
                      <Badge size="xs" key={tagIndex} color="blue">
                        {tag}
                      </Badge>
                    ))}
                  </Group>
                  <Text color="dimmed" size="10px">
                    {asset.asset_value}
                  </Text>
                </Stack>
              </Box>
              <Box w="15%">
                <Switch
                  checked={usedAssets.filter((x) => x === asset.id).length > 0}
                  onChange={() => {
                    if (usedAssets.filter((x) => x === asset.id).length > 0) {
                      unlinkAsset(asset.id, openedPersonaId);
                    } else {
                      linkAsset(asset.id, openedPersonaId);
                    }
                  }}
                  size="md"
                />
              </Box>
            </Group>
          </Card>
        ))}
        {filteredAssets.length === 0 && <Text size="sm">No assets found.</Text>}
      </Modal>
      <Modal
        opened={showVoiceModal}
        onClose={() => setShowVoiceModal(false)}
        size="lg"
        title="Select a Voice"
      >
        {voices.map((voice: any, index: any) => (
          <Card key={index} shadow="sm" p="lg" m="sm">
            <Flex>
              <Box w="85%">
                <Text weight={500}>{voice.name}</Text>
                {voice.completion_1 && (
                  <Text size="sm" mt="md">
                    {voice.completion_1}
                  </Text>
                )}
              </Box>
              <Button
                color={voice.id === currentUsedVoice ? "gray" : "teal"}
                variant={voice.id === currentUsedVoice ? "filled" : "outline"}
                onClick={() => {
                  updateVoice(voice.id, openedPersonaId);
                }}
                w="15%"
              >
                {voice.id === currentUsedVoice ? "Used" : "Use"}
              </Button>
            </Flex>
          </Card>
        ))}
      </Modal>

      <Group
        position="apart"
        style={{ marginBottom: 20, alignItems: "center" }}
      >
        <div>
          <Title order={2}>Personas</Title>
          <Text color="dimmed" size="sm">
            Personas help you define filters, assets, and voice easily for
            future campaigns.
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
        <Table highlightOnHover withBorder>
          <thead>
            <tr>
              <th style={{ width: "40%" }}>Persona Name</th>
              {/* <th style={{ width: "20%" }}>Pre-Filters</th> */}
              <th style={{ width: "20%" }}>AI Brain</th>
              {/* <th style={{ width: "20%" }}>Voice</th> */}
            </tr>
          </thead>
          <tbody>{rows}</tbody>
        </Table>
      )}
    </Paper>
  );
};

export default Personas;
