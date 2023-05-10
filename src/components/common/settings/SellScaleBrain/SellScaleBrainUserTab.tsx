import { Box, Container, Text } from "@mantine/core";
import React from "react";

export default function SellScaleBrainUserTab() {
  const [selectedPersona, setSelectedPersona]: any = React.useState(null);

  return (
    <Box>
      <Container>
        <Text>
          This is the user tab. It will be used to update user information
        </Text>
      </Container>
    </Box>
  );
}
