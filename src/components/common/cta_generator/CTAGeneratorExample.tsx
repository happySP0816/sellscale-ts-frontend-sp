import {
  Avatar,
  Badge,
  Center,
  Container,
  Divider,
  Popover,
  Text,
} from "@mantine/core";
import { useHover } from "@mantine/hooks";
import React from "react";

type PropsType = {
  ctaText: string;
};

export default function CTAGeneratorExample(props: PropsType) {
  const { hovered, ref } = useHover();
  return (
    <Popover position="right" withArrow shadow="md" opened={hovered}>
      <Popover.Target>
        <Center ref={ref} py="md" className="cursor-pointer">
          <Badge size="sm" color="gray">
            View example{" "}
          </Badge>
        </Center>
      </Popover.Target>
      <Popover.Dropdown>
        <Container w={400}>
          <Text size="sm" weight="700">
            Example message with CTA:
          </Text>
          <Divider mt="sm" mb="sm"></Divider>
          <Text size="sm" p="md">
            Hey George! Congrats on that 3 year anni at Acme! It's clear you're
            an incredible leader after seeing what John had to say about you.{" "}
            <span style={{ color: "yellow" }}>{props.ctaText}</span>
          </Text>
        </Container>
      </Popover.Dropdown>
    </Popover>
  );
}
