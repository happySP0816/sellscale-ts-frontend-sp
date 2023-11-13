import {
  Card,
  Paper,
  Text,
  Title,
  Button,
  MultiSelect,
  Box,
  Divider,
  Flex,
} from "@mantine/core";
import { useEffect, useState } from "react";

import { useRecoilState, useRecoilValue } from "recoil";
import { userDataState, userTokenState } from "@atoms/userAtoms";
import { showNotification } from "@mantine/notifications";
import { API_URL } from "@constants/data";
import DoNotContactListCaughtProspects from "./DoNotContactListCaughtProspects";
import { IconAbc, IconKeyboard } from '@tabler/icons';
import { INDUSTRIES, LOCATION, TITLES } from './DoNotContactListConstants';


export default function DoNotContactList(props: { forSDR?: boolean }) {
  const [userToken] = useRecoilState(userTokenState);
  const [fetchedData, setFetchedData] = useState(false);
  const [keywords, setKeywords] = useState<{ value: string, label: string }[]>([
    // { value: "staffing", label: "staffing" },
  ]);
  const [companyNames, setCompanyNames] = useState<{ value: string, label: string }[]>([
    // { value: "Medicus", label: "medicus" },
  ]);
  const [companyLocations, setCompanyLocations] = useState<{ value: string, label: string }[]>([
    // { value: "America", label: "america" },
  ]);
  const [companyIndustries, setCompanyIndustries] = useState<{ value: string, label: string }[]>([

  ]);
  const [prospectTitles, setProspectTitles] = useState<{ value: string, label: string }[]>([
    // { value: "CEO", label: "ceo" },
  ]);
  const [prospectLocations, setProspectLocations] = useState<{ value: string, label: string }[]>([
    // { value: "America", label: "america" },
  ]);


  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [selectedCompanyLocations, setSelectedCompanyLocations] = useState<string[]>([]);
  const [selectedCompanyIndustries, setSelectedCompanyIndustries] = useState<string[]>([]);
  const [selectedProspectTitles, setSelectedProspectTitles] = useState<string[]>([]);
  const [selectedProspectLocations, setSelectedProspectLocations] = useState<string[]>([]);
  const [needsSave, setNeedsSave] = useState(false);

  const [keywordSearchValue, setKeywordSearchValue] = useState('');
  const [companySearchValue, setCompanySearchValue] = useState('');
  const [companyLocationSearchValue, setCompanyLocationSearchValue] = useState('');
  const [companyIndustrySearchValue, setCompanyIndustrySearchValue] = useState('');
  const [prospectTitleSearchValue, setProspectTitleSearchValue] = useState('');
  const [prospectLocationSearchValue, setProspectLocationSearchValue] = useState('');

  const userData = useRecoilValue(userDataState)

  // Save as nothing tracking state
  // - No clean, bug-free way to do this without a component restructure
  const [saveAsNothing, setSaveAsNothing] = useState(false);

  // Replace all newlines in pasted text with an escaped newline
  useEffect(() => {
    const modifiedPasteHandler = (event: any) => {
      event.preventDefault(); // Prevent default paste behavior
    
      // @ts-ignore
      const clipboardData = event.clipboardData;
      const pastedText = clipboardData?.getData('text'); // Get the pasted text
      if(!pastedText) return;
    
      // Modify the pasted content
      const modifiedText = pastedText.replace(/\r|\n/gm, '\\n');
    
      // Insert the modified content into the editable element
      document.execCommand('insertHTML', false, modifiedText);
    }
    addEventListener('paste', modifiedPasteHandler);

    return () => {
      removeEventListener('paste', modifiedPasteHandler);
    }
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

    setCompanyLocations(
      resp.data.do_not_contact_location_keywords.map((x: any) => ({
        value: x,
        label: x,
      }))
    );
    setSelectedCompanyLocations(
      resp.data.do_not_contact_location_keywords.map((x: any) => x)
    );

    setCompanyIndustries(
      resp.data.do_not_contact_industries.map((x: any) => ({
        value: x,
        label: x,
      }))
    );
    setSelectedCompanyIndustries(
      resp.data.do_not_contact_industries.map((x: any) => x)
    );

    setProspectTitles(
      resp.data.do_not_contact_titles.map((x: any) => ({
        value: x,
        label: x,
      }))
    );
    setSelectedProspectTitles(
      resp.data.do_not_contact_titles.map((x: any) => x)
    );

    setProspectLocations(
      resp.data.do_not_contact_prospect_location_keywords.map((x: any) => ({
        value: x,
        label: x,
      }))
    );
    setSelectedProspectLocations(
      resp.data.do_not_contact_prospect_location_keywords.map((x: any) => x)
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
        do_not_contact_industries: selectedCompanyIndustries,
        do_not_contact_location_keywords: selectedCompanyLocations,
        do_not_contact_titles: selectedProspectTitles,
        do_not_contact_prospect_location_keywords: selectedProspectLocations,
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
        <Title order={3}>{props.forSDR ? userData.sdr_name.split(" ")[0] + "'s " : userData.client.company + "'s "} Do Not Contact Filters</Title>{" "}
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
        <Flex>
          {/* Company Filters */}
          <Card withBorder  w='50%'>
            <Title order={3} mb='md'>
              Account Data
            </Title>

            {/* Company Name */}
            <Card withBorder mb='xs'>
              <Title order={6}>👾 Company Names to Exclude</Title>
              <Text size="xs">
                Any company that is an exact match to these names will be
                automatically removed from the SellScale pipeline.
              </Text>
              <MultiSelect withinPortal
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

            {/* Company Keywords */}
            <Card withBorder mb='xs'>
              <Title order={6}>✨ Keywords to Exclude</Title>
              <Text size="xs">
                Any company that contains these keywords in their name will be
                automatically removed from the SellScale pipeline.
              </Text>
              <MultiSelect withinPortal
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

            {/* Company Location Keywords */}
            <Card withBorder mb='xs'>
              <Title order={6}>🌍 Company Location to Exclude</Title>
              <Text size="xs">
                Any company that contains these keywords in their location will be
                automatically removed from the SellScale pipeline.
              </Text>
              <MultiSelect withinPortal
                label="Filtered Company Locations"
                mt="md"
                data={LOCATION.map(x => ({ value: x, label: x })).concat(companyLocations)}
                placeholder="Select or create location"
                searchable
                creatable
                value={selectedCompanyLocations}
                onChange={(value: any) => {
                  setSelectedCompanyLocations(value);
                  setNeedsSave(true);
                  setSaveAsNothing(false);
                }}
                getCreateLabel={(query) => `+ Add a filter for ${query}`}
                onCreate={(query: any) => {
                  const item: any = { value: query, label: query };
                  setCompanyLocations((current: any) => [...current, item]);
                  return item;
                }}
                searchValue={companyLocationSearchValue}
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
                    setCompanyLocations((current) => [...current, ...newKeywords]);
                    setSelectedCompanyLocations((current) => [...current, ...newKeywords.map(x => x.value)]);
                    setNeedsSave(true);
                    setSaveAsNothing(false);
                  }
                  setCompanyLocationSearchValue(newValue);
                }}
              />
            </Card>

            {/* Company Industry */}
            <Card withBorder mb='xs'>
              <Title order={6}>🔎 Company Industries to Exclude</Title>
              <Text size="xs">
                Any company that is in these industries will be
                automatically removed from the SellScale pipeline.
              </Text>
              <MultiSelect withinPortal
                label="Filtered Company Industries"
                mt="md"
                data={INDUSTRIES.map(x => ({ value: x, label: x })).concat(companyIndustries)}
                placeholder="Select or create industry"
                searchable
                creatable
                value={selectedCompanyIndustries}
                onChange={(value: any) => {
                  setSelectedCompanyIndustries(value);
                  setNeedsSave(true);
                  setSaveAsNothing(false);
                }}
                getCreateLabel={(query) => `+ Add a filter for ${query}`}
                onCreate={(query: any) => {
                  const item: any = { value: query, label: query };
                  setCompanyIndustries((current: any) => [...current, item]);
                  return item;
                }}
                searchValue={companyIndustrySearchValue}
                onSearchChange={(query) => {

                  // If search value includes any newlines, add those items
                  let newValue = query;
                  let newKeywords: { value: string, label: string }[] = [];

                  const matches = [...query.matchAll(/(.*?)\\n/gm)];
                  for(const match of matches) {
                    newKeywords.push({ value: match[1], label: match[1] });
                    newValue = newValue
                      .replace(match[0], '')
                      .replace(/(^\s+|\s+$)/g, '');
                  }

                  // If there are more than 4 being added, add the last input to the list as well
                  if(matches.length > 4){
                    newKeywords.push({ value: newValue, label: newValue });
                    newValue = '';
                  }

                  if(matches.length > 0) {
                    setCompanyIndustries((current) => [...current, ...newKeywords]);
                    setSelectedCompanyIndustries((current) => [...current, ...newKeywords.map(x => x.value)]);
                    setNeedsSave(true);
                    setSaveAsNothing(false);
                  }
                  setCompanyIndustrySearchValue(newValue);
                }
                }
              />
            </Card> 

          
          </Card>

          {/* Prospect Filters */}
          <Card ml='md' withBorder w='50%'>
            <Title order={3} mb={'md'}>
              Prospect Data
            </Title>

            {/* Prospect Title */}
            <Card withBorder mb='xs'>
              <Title order={6}>💼 Prospect Titles to Exclude</Title>
              <Text size="xs">
                Any prospect that has these titles will be
                automatically removed from the SellScale pipeline.
              </Text>
              <MultiSelect withinPortal
                label="Filtered Prospect Titles"
                mt="md"
                data={TITLES.map(x => ({ value: x, label: x })).concat(prospectTitles)}
                placeholder="Select or create title"
                searchable
                creatable
                value={selectedProspectTitles}
                onChange={(value: any) => {
                  setSelectedProspectTitles(value);
                  setNeedsSave(true);
                  setSaveAsNothing(false);
                }}
                getCreateLabel={(query) => `+ Add a filter for ${query}`}
                onCreate={(query: any) => {
                  const item: any = { value: query, label: query };
                  setProspectTitles((current: any) => [...current, item]);
                  return item;
                }}
                searchValue={prospectTitleSearchValue}
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
                    setProspectTitles((current) => [...current, ...newKeywords]);
                    setSelectedProspectTitles((current) => [...current, ...newKeywords.map(x => x.value)]);
                    setNeedsSave(true);
                    setSaveAsNothing(false);
                  }

                  setProspectTitleSearchValue(newValue);
                }
                }
              />
            </Card>

            {/* Prospect Location */}
            <Card withBorder mb='xs'>
              <Title order={6}>🌍 Prospect Locations to Exclude</Title>
              <Text size="xs">
                Any prospect that has these locations will be
                automatically removed from the SellScale pipeline.
              </Text>
              <MultiSelect withinPortal
                label="Filtered Prospect Locations"
                mt="md"
                data={LOCATION.map(x => ({ value: x, label: x })).concat(prospectLocations)}
                placeholder="Select or create location"
                searchable
                creatable
                value={selectedProspectLocations}
                onChange={(value: any) => {
                  setSelectedProspectLocations(value);
                  setNeedsSave(true);
                  setSaveAsNothing(false);
                }}
                getCreateLabel={(query) => `+ Add a filter for ${query}`}
                onCreate={(query: any) => {
                  const item: any = { value: query, label: query };
                  setProspectLocations((current: any) => [...current, item]);
                  return item;
                }}
                searchValue={prospectLocationSearchValue}
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
                    setProspectLocations((current) => [...current, ...newKeywords]);
                    setSelectedProspectLocations((current) => [...current, ...newKeywords.map(x => x.value)]);
                    setNeedsSave(true);
                    setSaveAsNothing(false);
                  }

                  setProspectLocationSearchValue(newValue);
                }
                }
              />
            </Card>


          </Card>
        </Flex>
      </Card>
      
      <Flex>
        <Button
          mt="lg"
          size="md"
          onClick={async () => {
            await saveFilters();
          }}
          disabled={!needsSave}
        >
          {saveAsNothing ? 'Save with no filters' : 'Save filters'}
        </Button>

        <Button 
          mt="lg"
          size="md"
          color='red'
          ml='md'
          variant='outline'
          display={!needsSave ? 'none' : 'block'}
          onClick={() => {
            // reset back to original values
            setSelectedCompanies([]);
            setSelectedKeywords([]);
            setSelectedCompanyLocations([]);
            setSelectedCompanyIndustries([]);
            setSelectedProspectTitles([]);
            setSelectedProspectLocations([]);
            setNeedsSave(false);

            getKeywords();
          }}
        >
          Clear Changes
        </Button>
      </Flex>

      <Divider mt="lg" mb="lg" />

      <DoNotContactListCaughtProspects forSDR={props.forSDR} />
    </Paper>
  );
}
