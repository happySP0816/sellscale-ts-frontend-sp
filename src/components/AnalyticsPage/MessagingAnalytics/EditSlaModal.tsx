import {
  Badge,
  Box,
  Button,
  Flex,
  Group,
  Input,
  Modal,
  ModalProps,
  RangeSlider,
  Text,
  rem,
  useMantineTheme,
} from "@mantine/core";
import React, { FC, useState } from "react";

const marks = [
  { value: 20, label: "20%" },
  { value: 75, label: "75%" },
];

const EditSlaModal: FC<ModalProps> = (props) => {
  const theme = useMantineTheme();
  return (
    <Modal
      {...props}
      title="Edit SLAs"
      size={"lg"}
      styles={{
        title: {
          fontWeight: 700,
          fontSize: rem(32),
        },
      }}
    >
      <Box py={"md"}>
        <Text c={"gray.8"} fw={700}>
          Conversions
        </Text>

        <Text size={"sm"} color="gray.6" fw={600}>
          Adjust sliders to configure health range
        </Text>

        <Box pos={"relative"}>
          <Box
            sx={{
              position: "absolute",
              width: `${marks[0].value}%`,
              backgroundColor: theme.colors.red[theme.fn.primaryShade()],
              height: 8,
              top: 4,
            }}
          />
          <Box
            sx={{
              position: "absolute",
              width: `${marks[1].value - marks[0].value}%`,
              backgroundColor: theme.colors.orange[theme.fn.primaryShade()],
              height: 8,
              top: 4,
              left: `${marks[0].value}%`,
            }}
          />
          <Box
            sx={{
              position: "absolute",
              width: `${100 - marks[1].value}%`,
              backgroundColor: theme.colors.green[theme.fn.primaryShade()],
              height: 8,
              top: 4,
              left: `${marks[1].value}%`,
            }}
          />
          <RangeSlider
            defaultValue={[20, 75]}
            marks={marks}
            my={"md"}
            thumbSize={20}
            styles={{
              bar: {
                backgroundColor: "transparent",
              },
              track: {
                backgroundColor: "transparent",
                "&:before": {
                  backgroundColor: "transparent",
                },
              },
              mark: {
                backgroundColor: "transparent",
              },

              markFilled: {
                border: "none",
              },
              markLabel: {
                fontWeight: 700,
                marginTop: 12,
              },
            }}
          />
        </Box>
      </Box>
      <Box mt={"md"}>
        <Text c={"gray.8"} fw={700}>
          Significance
        </Text>

        <Flex align={"center"} justify={"space-between"}>
          <Text size={"sm"} color="gray.6" fw={600}>
            Values will show up as <Badge color="gray">N/A</Badge> if sample
            size is less than:
          </Text>
          <Input defaultValue={25} type="number" />
        </Flex>
      </Box>

      <Flex gap="md" mt="xl">
        <Button variant="outline" w={"100%"} onClick={() => props.onClose()}>
          Go Back
        </Button>
        <Button w={"100%"} onClick={() => props.onClose()}>
          Save Changes
        </Button>
      </Flex>
    </Modal>
  );
};

export default EditSlaModal;
