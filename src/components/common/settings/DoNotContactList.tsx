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


export default function DoNotContactList(props: { forSDR?: boolean }) {
  const [userToken] = useRecoilState(userTokenState);
  const [fetchedData, setFetchedData] = useState(false);
  const [keywords, setKeywords] = useState<{ value: string, label: string }[]>([
    // { value: "staffing", label: "staffing" },
  ]);
  const [companyNames, setCompanyNames] = useState<{ value: string, label: string }[]>([
    // { value: "Medicus", label: "medicus" },
  ]);
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [needsSave, setNeedsSave] = useState(false);

  const [keywordSearchValue, setKeywordSearchValue] = useState('');
  const [companySearchValue, setCompanySearchValue] = useState('');

  // Save as nothing tracking state
  // - No clean, bug-free way to do this without a component restructure
  const [saveAsNothing, setSaveAsNothing] = useState(false);

  // Replace all newlines in pasted text with an escaped newline
  useEffect(() => {
    addEventListener('paste', (event) => {
      event.preventDefault(); // Prevent default paste behavior
    
      // @ts-ignore
      const clipboardData = event.clipboardData;
      const pastedText = clipboardData?.getData('text'); // Get the pasted text
      if(!pastedText) return;
    
      // Modify the pasted content
      const modifiedText = pastedText.replace(/\r|\n/gm, '\\n');
    
      // Insert the modified content into the editable element
      document.execCommand('insertHTML', false, modifiedText);
    });
  }, [])

  const getKeywords = async () => {
    const res = await fetch(`${API_URL}/client${props.forSDR ? `/sdr` : ``}/do_not_contact_filters`, {
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
      setSaveAsNothing(true);
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
    const resp = await fetch(`${API_URL}/client${props.forSDR ? `/sdr` : ``}/do_not_contact_filters`, {
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
    setSaveAsNothing(false);
  };

  return (
    <Paper withBorder m="xs" p="md" radius="md">
      <Box>
        <Title order={3}>{props.forSDR ? 'SDR:' : 'Company:'} Do Not Contact Filters</Title>{" "}
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
            setSaveAsNothing(false);
          }}
          getCreateLabel={(query) => `+ Add a filter for ${query}`}
          onCreate={(query: any) => {
            const item: any = { value: query, label: query };
            setKeywords((current: any) => [...current, item]);
            return item;
          }}
          searchValue={keywordSearchValue}
          onSearchChange={(query) => {

            // If search value includes any newlines, add those items
            let newValue = query;
            let newKeywords: { value: string, label: string }[] = [];

            const matches = [...query.matchAll(/(.*?)\\n/gm)];
            for(const match of matches) {
              newKeywords.push({ value: match[1], label: match[1] });
              newValue = newValue.replace(match[0], '');
            }

            // If there are more than 4 being added, add the last input to the list as well
            if(matches.length > 4){
              newKeywords.push({ value: newValue, label: newValue });
              newValue = '';
            }
            
            if(matches.length > 0) {
              setKeywords((current) => [...current, ...newKeywords]);
              setSelectedKeywords((current) => [...current, ...newKeywords.map(x => x.value)]);
              setNeedsSave(true);
              setSaveAsNothing(false);
            }
            setKeywordSearchValue(newValue);
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
            setSaveAsNothing(false);
          }}
          getCreateLabel={(query) => `+ Add a filter for ${query}`}
          onCreate={(query: any) => {
            const item: any = { value: query, label: query };
            setCompanyNames((current: any) => [...current, item]);
            return item;
          }}
          searchValue={companySearchValue}
          onSearchChange={(query) => {

            // If search value includes any newlines, add those items
            let newValue = query;
            let newCompanyNames: { value: string, label: string }[] = [];

            const matches = [...query.matchAll(/(.*?)\\n/gm)];
            for(const match of matches) {
              newCompanyNames.push({ value: match[1], label: match[1] });
              newValue = newValue.replace(match[0], '');
            }

            // If there are more than 4 being added, add the last input to the list as well
            if(matches.length > 4){
              newCompanyNames.push({ value: newValue, label: newValue });
              newValue = '';
            }
            
            if(matches.length > 0) {
              setCompanyNames((current) => [...current, ...newCompanyNames]);
              setSelectedCompanies((current) => [...current, ...newCompanyNames.map(x => x.value)]);
              setNeedsSave(true);
              setSaveAsNothing(false);
            }
            setCompanySearchValue(newValue);
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
        {saveAsNothing ? 'Save with no filters' : 'Save filter criteria'}
      </Button>

      <Divider mt="lg" mb="lg" />

      <DoNotContactListCaughtProspects forSDR={props.forSDR} />
    </Paper>
  );
}
