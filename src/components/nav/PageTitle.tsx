
import { Title } from "@mantine/core";
import React from "react";

export default function PageTitle(props: { title: string, mb?: boolean }) {
  return (
    <Title order={1} mx='md' mb={props.mb || props.mb === undefined ? 'md' : undefined}>
      {props.title}
    </Title>
  );
}
