import { Box, Flex } from "@mantine/core";
import React from "react";
import { IconChevronsRight } from "@tabler/icons-react";

const blue = "#228be6";

const Hook: React.FC<{
  linkedLeft: boolean;
  linkedRight: boolean;
}> = ({ linkedLeft, linkedRight }) => {
  return (
    <Flex
      align={"center"}
      justify={"center"}
      h={"100%"}
      sx={{ position: "relative" }}
    >
      <Flex
        align={"center"}
        justify={"center"}
        bg={linkedLeft || linkedRight ? blue : "#E9ECEF"}
        p={"0.25rem"}
        sx={{ borderRadius: 999, zIndex: 10 }}
      >
        <IconChevronsRight size={"1rem"} color="#FFFFFF" />
      </Flex>
      <Box
        h={"0.125rem"}
        w={"50%"}
        sx={{ position: "absolute", zIndex: 1 }}
        bg={linkedLeft ? blue : "#E9ECEF"}
        left={0}
      />

      <Box
        h={"0.125rem"}
        w={"50%"}
        sx={{ position: "absolute" }}
        bg={linkedRight ? blue : "#E9ECEF"}
        right={0}
      />
    </Flex>
  );
};

export default Hook;
