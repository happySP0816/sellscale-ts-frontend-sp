import {
  Flex,
  Title,
  Avatar,
  Text,
  Box,
  Card,
  useMantineTheme,
} from "@mantine/core";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export default function ContactsGlobe() {
  const theme = useMantineTheme();

  const samplePins = [
    { position: [40.7128, -74.0060], city: "New York, NY", name: "John Doe" },
    { position: [34.0522, -118.2437], city: "Los Angeles, CA", name: "Jane Smith" },
    { position: [41.8781, -87.6298], city: "Chicago, IL", name: "Michael Johnson" },
    { position: [29.7604, -95.3698], city: "Houston, TX", name: "Emily Davis" },
    { position: [33.4484, -112.0740], city: "Phoenix, AZ", name: "David Wilson" },
    { position: [39.7392, -104.9903], city: "Denver, CO", name: "Chris Brown" },
    { position: [32.7767, -96.7970], city: "Dallas, TX", name: "Patricia Taylor" },
    { position: [37.7749, -122.4194], city: "San Francisco, CA", name: "Robert Miller" },
    { position: [47.6062, -122.3321], city: "Seattle, WA", name: "Linda Anderson" },
    { position: [38.9072, -77.0369], city: "Washington, D.C.", name: "James Thomas" },
  ];

  return (
    <Flex direction={"column"} p={"lg"}>
      <Flex align={"center"} justify={"space-between"}>
        <Title order={3}>Contact World Map</Title>
      </Flex>
      <Card
        shadow="sm"
        padding="lg"
        radius="md"
        withBorder
        style={{
          marginTop: theme.spacing.md,
          height: "calc(100vh - 280px)",
          position: "relative",
        }}
      >
        <MapContainer 
          bounds={[[24.396308, -125.0], [49.384358, -66.93457]]} // Setting bounds to cover the U.S.
          style={{ height: "100%", width: "100%", borderRadius: theme.radius.md }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {samplePins.map((pin, index) => (
            <Marker key={index} position={pin.position}>
              <Popup>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar radius="xl" mr="sm" />
                  <Box>
                    <Text size="sm" fw={500}>{pin.name}</Text>
                    <Text size="xs" color="dimmed">{pin.city}</Text>
                  </Box>
                </Box>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </Card>
    </Flex>
  );
}
