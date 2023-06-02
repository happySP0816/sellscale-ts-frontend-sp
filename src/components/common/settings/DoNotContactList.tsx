import {
  Card,
  Paper,
  Text,
  Title,
  Button,
  MultiSelect,
  Box,
  Divider,
} from "@mantine/core";
import { useEffect, useState } from "react";

import { useRecoilState, useRecoilValue } from "recoil";
import { userDataState, userTokenState } from "@atoms/userAtoms";
import { showNotification } from "@mantine/notifications";
import { API_URL } from "@constants/data";
import DoNotContactListCaughtProspects from "./DoNotContactListCaughtProspects";

const urlRegex: RegExp = /^(?:(?:https?|ftp):\/\/)?(?:www\.)?[a-z0-9\-]+(?:\.[a-z]{2,})+(?:\/[\w\-\.\?\=\&]*)*$/i;

export default function DoNotContactList() {
  const [userToken] = useRecoilState(userTokenState);
  const [fetchedData, setFetchedData] = useState(false);
  const [keywords, setKeywords]: any = useState([
    // { value: "staffing", label: "staffing" },
  ]);
  const [companyNames, setCompanyNames]: any = useState([
    // { value: "Medicus", label: "medicus" },
  ]);
  const [selectedCompanies, setSelectedCompanies] = useState([]);
  const [selectedKeywords, setSelectedKeywords] = useState([]);
  const [needsSave, setNeedsSave] = useState(false);

  const getKeywords = async () => {
    const res = await fetch(`${API_URL}/client/do_not_contact_filters`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
    });
    const resp = await res.json();

    // If the user has never set filters before, let them save empty filters
    if (!resp.data.do_not_contact_company_names || !resp.data.do_not_contact_keywords_in_company_names) {
      setNeedsSave(true);
    }

    setCompanyNames(
      resp.data.do_not_contact_company_names?.map((x: any) => ({
        value: x,
        label: x,
      })) || []
    );
    setSelectedCompanies(
      resp.data.do_not_contact_company_names?.map((x: any) => x) || []
    );

    setKeywords(
      resp.data.do_not_contact_keywords_in_company_names.map((x: any) => ({
        value: x,
        label: x,
      }))
    );
    setSelectedKeywords(
      resp.data.do_not_contact_keywords_in_company_names.map((x: any) => x)
    );
  };

  useEffect(() => {
    if (!fetchedData) {
      getKeywords();
      setFetchedData(true);
    }
  }, [fetchedData]);

  const saveFilters = async () => {
    const resp = await fetch(`${API_URL}/client/do_not_contact_filters`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        do_not_contact_company_names: selectedCompanies,
        do_not_contact_keywords_in_company_names: selectedKeywords,
      }),
    });
    if (resp.status === 200) {
      showNotification({
        title: "Success",
        message: "Successfully saved filters",
        color: "green",
      });
    } else {
      showNotification({
        title: "Error",
        message: "Error saving filters",
        color: "red",
      });
    }
    setNeedsSave(false);
  };

  return (
    <Paper withBorder m="xs" p="md" radius="md">
      <Box>
        <Title order={3}>Do Not Contact Filters</Title>{" "}
        <Text size="sm">
          You can specify what conditions need to be met to automatically remove
          prospects from SellScale AI outreach.
        </Text>
        <Text size="sm" mt="md">
          Any prospect that meets these criteria will automatically be marked as
          'removed' from the SellScale pipeline if uploaded in the future.
        </Text>
      </Box>

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
          value={selectedKeywords}
          onChange={(value: any) => {
            setSelectedKeywords(value);
            setNeedsSave(true);
          }}
          getCreateLabel={(query) => `+ Add a filter for ${query}`}
          onCreate={(query: any) => {
            const item: any = { value: query, label: query };
            setKeywords((current: any) => [...current, item]);
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
          value={selectedCompanies}
          onChange={(value: any) => {
            setSelectedCompanies(value);
            setNeedsSave(true);
          }}
          getCreateLabel={(query) => `+ Add a filter for ${query}`}
          onCreate={(query: any) => {
            const item: any = { value: query, label: query };
            setCompanyNames((current: any) => [...current, item]);
            return item;
          }}
        />
      </Card>
      <Button
        mt="lg"
        size="md"
        onClick={async () => {
          await saveFilters();
        }}
        disabled={!needsSave}
      >
        Save Filter Criteria
      </Button>

      <Divider mt="lg" mb="lg" />

      <DoNotContactListCaughtProspects />
    </Paper>
  );
}
