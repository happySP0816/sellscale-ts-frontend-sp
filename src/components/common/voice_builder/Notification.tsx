import { Button, Flex, Text } from "@mantine/core";

import { blue } from "../../../colors";
import { IconCircleXFilled } from "@tabler/icons-react";
import { FC } from "react";

const Notification: FC<{
  show: boolean;
  setShow: (val: boolean) => void;
}> = ({ show, setShow }) => {
  if (!show) {
    return null;
  }

  return (
    <Flex
      bg={blue}
      h={50}
      justify={"space-between"}
      align={"center"}
      p={"2rem"}
    >
      <Text color="white" weight={700} size={"lg"}>
        Train your AI
      </Text>
      <Button onClick={() => setShow(false)}>
        <IconCircleXFilled />
      </Button>
    </Flex>
  );
};

export default Notification;
