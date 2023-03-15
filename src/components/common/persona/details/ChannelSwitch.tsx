import { Box, Center, Flex, SegmentedControl, Title } from "@mantine/core";
import { IconBrandLinkedin, IconMail } from "@tabler/icons";
import { forwardRef, useImperativeHandle, useState } from "react";
import { Channel } from "src/main";

export default forwardRef(function ChannelSwitch(
  props: { defaultValue: Channel },
  ref
) {
  useImperativeHandle(
    ref,
    () => {
      return {
        getChannel: () => channel,
        setChannel: setChannel,
      };
    },
    []
  );

  const [channel, setChannel] = useState(props.defaultValue);

  return (
    <Flex direction="row-reverse" gap="sm">
      <SegmentedControl
        size="sm"
        value={channel}
        onChange={(value) => setChannel(value as Channel)}
        data={[
          {
            value: "LINKEDIN",
            label: (
              <Center>
                <IconBrandLinkedin size="1rem" />
                <Box ml={10}>LinkedIn</Box>
              </Center>
            ),
          },
          {
            value: "EMAIL",
            label: (
              <Center>
                <IconMail size="1rem" />
                <Box ml={10}>Email</Box>
              </Center>
            ),
          },
        ]}
      />
      <Title order={4} lh={2.25}>
        Channel
      </Title>
    </Flex>
  );
});
