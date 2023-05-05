import {
  Card,
  Paper,
  TextInput,
  Text,
  Title,
  ActionIcon,
  Flex,
  Button,
  LoadingOverlay,
  Notification,
  Select,
  MultiSelect,
  Box,
  Container,
} from "@mantine/core";
import { IconCheck, IconEdit, IconX } from "@tabler/icons";
import { useEffect, useState } from "react";

import { patchSchedulingLink } from "@utils/requests/patchSchedulingLink";
import { useRecoilState, useRecoilValue } from "recoil";
import { userDataState, userTokenState } from "@atoms/userAtoms";
import { showNotification } from "@mantine/notifications";
import { API_URL } from "@constants/data";

const urlRegex: RegExp = /^(?:(?:https?|ftp):\/\/)?(?:www\.)?[a-z0-9\-]+(?:\.[a-z]{2,})+(?:\/[\w\-\.\?\=\&]*)*$/i;

export default function DoNotContactList() {
  const [keywords, setKeywords] = useState([
    { value: "staffing", label: "staffing" },
    { value: "recruit", label: "recruit" },
  ]);
  const [companyNames, setCompanyNames] = useState([
    { value: "Medicus", label: "medicus" },
    { value: "Staff Care", label: "staff care" },
    { value: "Curative", label: "curative" },
  ]);

  const defaultSelectedKeywords = keywords.map((x) => x.value);
  const defaultSelectedCompanyNames = companyNames.map((x) => x.value);

  return (
    <Paper withBorder m="xs" p="md" radius="md">
      <Flex>
        <Box>
          <Title order={3}>Do Not Contact Filters</Title>{" "}
          <Text size="sm">
            You can specify what conditions need to be met to automatically
            remove prospects from SellScale AI outreach.
          </Text>
          <Text size="sm" mt="md">
            Any prospect that meets these criteria will automatically be marked
            as 'removed' from the SellScale pipeline if uploaded in the future.
          </Text>
        </Box>
        <Card withBorder m="lg" mr="0" mt="0">
          <Container>
            <Title order={5}>🚨 Warning: 46 prospects caught</Title>
            <Text size="sm">
              46 prospects are currently still in the SellScale pipeline that
              meet these criteria. Press the button below to remove them from
              the pipeline.
            </Text>
            <Button mt="md" color="red">
              Remove 46 Prospects
            </Button>
          </Container>
        </Card>
      </Flex>

      <Card mt="md">
        <Title order={5}>Filter by Keywords</Title>
        <Text size="sm">
          Any company that contains these keywords in their name will be
          automatically removed from the SellScale pipeline.
        </Text>
        <MultiSelect
          label="Filtered Keywords"
          mt="md"
          data={keywords}
          placeholder="Select or create keywords"
          searchable
          creatable
          defaultValue={defaultSelectedKeywords}
          getCreateLabel={(query) => `+ Add a filter for ${query}`}
          onCreate={(query) => {
            const item = { value: query, label: query };
            setKeywords((current) => [...current, item]);
            return item;
          }}
        />
      </Card>
      <Card mt="md">
        <Title order={5}>Filter by Company Name</Title>
        <Text size="sm">
          Any company that is an exact match to these names will be
          automatically removed from the SellScale pipeline.
        </Text>
        <MultiSelect
          label="Filtered Companies"
          mt="md"
          data={companyNames}
          placeholder="Select or create companies"
          searchable
          creatable
          defaultValue={defaultSelectedCompanyNames}
          getCreateLabel={(query) => `+ Add a filter for ${query}`}
          onCreate={(query) => {
            const item = { value: query, label: query };
            setKeywords((current) => [...current, item]);
            return item;
          }}
        />
      </Card>
      <Button
        mt="lg"
        onClick={() => {
          alert("Coming soon!");
        }}
      >
        Save Criteria
      </Button>
    </Paper>
  );
}
