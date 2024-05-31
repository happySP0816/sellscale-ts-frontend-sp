import React from "react";
import { Avatar, Box, Card, Flex, Text, useMantineTheme } from "@mantine/core";
import { proxyURL, valueToColor, nameToInitials } from "@utils/general";
import { IconBuilding } from "@tabler/icons";

interface LinkedinAvatarProps {
  avatar?: string;
  title?: string;
  location?: string;
  name?: string;
  experience?: string;
}

const LinkedinAvatar: React.FC<LinkedinAvatarProps> = ({ avatar, name, title, location, experience }) => {
  const theme = useMantineTheme();
  return (
    <Box mt={"lg"}>
      <Text color="#7A8595">Champion Preview:</Text>
      <Flex style={{ border: "1px solid #3B85EF", borderRadius: "6px", padding: "12px" }} gap={10}>
        <Avatar src={avatar} size={"xl"} radius={"100%"} />
        <Box>
          <Text fw={600} size={"xl"}>
            {name}
          </Text>
          <Text fw={400}>{title}</Text>
          <Text fw={400} color="gray">
            {location}
          </Text>
          {experience !=='undefined' && <Flex gap={3} align={"center"} mt={4}>
            <IconBuilding size={"0.9rem"} color="gray" />
            <Text fw={400} color="gray">
              {experience}
            </Text>
          </Flex>}
        </Box>
      </Flex>
    </Box>
  );
};

export default LinkedinAvatar;
