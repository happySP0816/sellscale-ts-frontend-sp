import TransformersChart from "@common/charts/TransformersChart";
import { Box, Center, Container, Flex, SegmentedControl, Title } from "@mantine/core";
import { IconBrandLinkedin, IconMail } from "@tabler/icons";
import { useRef, useState } from "react";
import { Channel } from "src";
import ChannelSwitch from "./ChannelSwitch";
import TransformersTable from "./TransformersTable";

export default function PersonaDetailsTransformers(props: { channel: Channel }) {

  return (
    <Box>
      <Center p={0} h={310}>
        <TransformersChart channel={props.channel} />
      </Center>
      <TransformersTable channel={props.channel} />
    </Box>
  );
}
