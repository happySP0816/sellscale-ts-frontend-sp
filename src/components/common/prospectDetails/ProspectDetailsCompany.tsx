import {
  Card,
  Paper,
  Text,
  Group,
  Button,
  Avatar,
  Collapse,
  createStyles,
  Badge,
} from "@mantine/core";
import { useState } from "react";

const useStyles = createStyles((theme) => ({
  card: {
    backgroundColor:
      theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.white,
  },

  section: {
    borderBottom: `1px solid ${
      theme.colorScheme === "dark" ? theme.colors.dark[4] : theme.colors.gray[3]
    }`,
    paddingLeft: theme.spacing.md,
    paddingRight: theme.spacing.md,
    paddingBottom: theme.spacing.md,
  },

  like: {
    color: theme.colors.red[6],
  },

  label: {
    textTransform: "uppercase",
    fontSize: theme.fontSizes.xs,
    fontWeight: 700,
  },
}));

type ProspectCompanyDetailsProps = {
  logo: string;
  company_name: string;
  location: string;
  description: string;
  employee_count: number;
  tags: string[];
  website_url: string;
  tagline: string;
};

export default function ProspectDetailsCompany(
  props: ProspectCompanyDetailsProps
) {
  const [opened, setOpened] = useState(false);

  return (
    <Card shadow="sm" p="lg" radius="md" mt="md" withBorder>
      <Group position="apart" mb="xs">
        <Text weight={700} size="lg">
          Company
        </Text>
      </Group>
      <Paper
        radius="md"
        withBorder
        p="lg"
        sx={(theme) => ({
          backgroundColor:
            theme.colorScheme === "dark" ? theme.colors.dark[8] : theme.white,
        })}
      >
        <Avatar src={props.logo} size={60} radius={60} mx="auto" />
        <Text align="center" size="lg" weight={500} mt="md">
          {props.company_name}
        </Text>
        <Text align="center" color="dimmed" size="sm">
          {props.tagline}
        </Text>

        <Collapse in={opened} mt="md">
          <Text size="sm">{props.description}</Text>
          {props.tags.map((tag) => (
            <Badge color="blue" variant="outline" ml="xs" size="xs">
              {tag}
            </Badge>
          ))}
        </Collapse>

        <Button
          variant="default"
          fullWidth
          mt="md"
          onClick={(o) => setOpened(!opened)}
        >
          Learn more about {props.company_name}
        </Button>

        <Button variant="default" fullWidth mt="md">
          Visit {props.company_name}'s website
        </Button>
      </Paper>
    </Card>
  );
}
