import React, { useState, useEffect } from 'react';
import { Title, Table, TextInput, Box, Pagination, Button, Checkbox, Loader, Card, Flex, MultiSelect, Tabs } from '@mantine/core';
import { Text, Badge } from '@mantine/core';
import { useRecoilValue } from 'recoil';
import { userTokenState } from '@atoms/userAtoms';
import { API_URL } from '@constants/data';
import { IconArrowsCross, IconBriefcase, IconBuilding, IconBuildingFactory, IconCalendar, IconTrash, IconUser } from '@tabler/icons';
import { deterministicMantineColor } from '@utils/requests/utils';
import PageFrame from '@common/PageFrame';

type GlobalContact = {
  prospect_id: number;
  prospect_name: string;
  prospect_title: string;
  prospect_company: string;
  prospect_industry: string;
  prospect_linkedin_url: string;
  persona: string;
  user_name: string;
  date_uploaded: string;
};

const GlobalContacts = () => {
  const userToken = useRecoilValue(userTokenState);
  const [contacts, setContacts]: any = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [loadingProspects, setLoadingProspects] = useState(false);
  const [allContactsSelected, setAllContactsSelected] = useState(false);

  const [prospectNames, setProspectNames]: any = useState([]);
  const [prospectTitles, setProspectTitles]: any = useState([]);
  const [prospectCompanies, setProspectCompanies]: any = useState([]);
  const [prospectIndustries, setProspectIndustries]: any = useState([]);

  const [search, setSearch]: any = useState({
    name: [],
    title: [],
    company: [],
    industry: [],
    userName: []
  });
  const [currentPage, setCurrentPage]: any = useState(1);
  const resultsPerPage = 7;

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const sortByFrequency = (array: any) => {
    const frequency = array.reduce((acc: any, value: any) => {
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    }, {});

    return Array.from(new Set(array.sort((a: any, b: any) => frequency[b] - frequency[a])));
  };

  useEffect(() => {
    setLoadingProspects(true);
    fetch(`${API_URL}/prospect/global_contacts`, {
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    })
    .then(response => response.json())
    .then(data => {
      setContacts(data.data)

      const tempProspectNames: any = sortByFrequency(data.data.map((contact: GlobalContact) => contact.prospect_name).filter((x: any) => x));
      const tempProspectTitles: any = sortByFrequency(data.data.map((contact: GlobalContact) => contact.prospect_title).filter((x: any) => x));
      const tempProspectCompanies: any = sortByFrequency(data.data.map((contact: GlobalContact) => contact.prospect_company).filter((x: any) => x));
      const tempProspectIndustries: any = sortByFrequency(data.data.map((contact: GlobalContact) => contact.prospect_industry).filter((x: any) => x));

      setProspectNames(tempProspectNames);
      setProspectTitles(tempProspectTitles);
      setProspectCompanies(tempProspectCompanies);
      setProspectIndustries(tempProspectIndustries);
    })
    .finally(() => setLoadingProspects(false))
    .catch(error => console.error('Error fetching contacts:', error))
  }, [userToken]);

  const isSearchTermIncluded = (searchTerms: any, contactProperty: any) => {
    return searchTerms.some((term: string) => contactProperty?.toLowerCase().includes(term?.toLowerCase()));
  };

  const isSearchTermDiscluded = (searchTerms: any, contactProperty: any) => {
    return searchTerms.every((term: string) => !contactProperty?.toLowerCase().includes(term?.toLowerCase()));
  }

  const filteredContacts = contacts.filter((contact: GlobalContact) =>
    (search.name.length === 0 || isSearchTermIncluded(search.name, contact.prospect_name)) &&
    (search.title.length === 0 || isSearchTermIncluded(search.title, contact.prospect_title)) &&
    (search.company.length === 0 || isSearchTermIncluded(search.company, contact.prospect_company)) &&
    (search.industry.length === 0 || isSearchTermIncluded(search.industry, contact.prospect_industry)) &&
    (search.userName.length === 0 || isSearchTermIncluded(search.userName, contact.user_name))
  );

  const startIndex = (currentPage - 1) * resultsPerPage;
  const selectedContacts = filteredContacts.slice(startIndex, startIndex + resultsPerPage);

  const handleSelectRow = (id: number) => {
    const newSelectedIds = new Set(selectedIds);
    if (newSelectedIds.has(id)) {
      newSelectedIds.delete(id);
    } else {
      newSelectedIds.add(id);
    }
    setSelectedIds(newSelectedIds);
  };

  const logSelectedProspects = () => {
    console.log(Array.from(selectedIds));
  };

  const selectAllContacts = () => {
    if (allContactsSelected) {
      setAllContactsSelected(false);
      setSelectedIds(new Set());
      return;
    }
    setAllContactsSelected(true);
    const newSelectedIds = new Set(selectedIds);
    selectedContacts.forEach((contact: GlobalContact) => {
      newSelectedIds.add(contact.prospect_id);
    });
    setSelectedIds(newSelectedIds);
  };

  const rows = selectedContacts.map((contact: GlobalContact) => (
    <tr key={contact.prospect_id}>
      <td>
        <Checkbox 
          checked={selectedIds.has(contact.prospect_id)}
          onChange={() => handleSelectRow(contact.prospect_id)}
        />
      </td>
      <td>
        <Text size="sm">
          <a href={contact.prospect_linkedin_url} target="_blank" rel="noopener noreferrer">{contact.prospect_name}</a>
        </Text>
      </td>
      <td><Text size="sm">{contact.prospect_title}</Text></td>
      <td><Text size="sm">{contact.prospect_company}</Text></td>
      <td><Text size="sm">{contact.prospect_industry}</Text></td>
      <td><Text size="sm">{contact.persona}</Text></td>
      <td><Badge color={deterministicMantineColor(contact.user_name)}>{contact.user_name}</Badge></td>
      <td>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconCalendar size={14} style={{ marginRight: 5 }} />
          <Text size="sm">{new Date(contact.date_uploaded).toLocaleDateString()}</Text>
        </Box>
      </td>
    </tr>
  ));

  return (
    <PageFrame>
      <Title order={3}>Global Contacts</Title>
      <Text>
        These are the contacts that have been uploaded by all users who are in the 'Prospected' state. You can filter and search through them below.
      </Text>
      <Box sx={{ display: 'flex', height: '100%' }} mt='xs'>
        
        <Card withBorder sx={{ width: '20%', padding: '20px' }} bgr={'0'}>
          <Tabs defaultValue="person">
            <Tabs.List>
              <Tabs.Tab value="person">
                Person
              </Tabs.Tab>
              <Tabs.Tab value="company">
                Company
              </Tabs.Tab>
            </Tabs.List>
          

            <Tabs.Panel value="person">
              <MultiSelect
                withinPortal
                data={prospectNames}
                creatable
                searchable
                value={search.name}
                onChange={(value) => setSearch({ ...search, name: value })}
                label="Full Name"
                placeholder="Search by Name"
                getCreateLabel={(query) => `+ Add a filter for ${query}`}
                onCreate={(query: any) => {
                  const item: any = { value: query, label: query };
                  setProspectNames((current: any) => [...current, item]);
                  return item;
                }}
              />
              <MultiSelect
                withinPortal
                data={prospectTitles}
                creatable
                searchable
                getCreateLabel={(query) => `+ Add a filter for ${query}`}
                onCreate={(query: any) => {
                  const item: any = { value: query, label: query };
                  setProspectTitles((current: any) => [...current, item]);
                  return item;
                }}
                value={search.title}
                onChange={(value) => setSearch({ ...search, title: value })}
                label="Title"
                placeholder="Search by Title"
              />
            </Tabs.Panel>

            <Tabs.Panel value="company">
              <MultiSelect
                data={prospectCompanies}
                creatable
                searchable
                value={search.company}
                onChange={(value) => setSearch({ ...search, company: value })}
                label="Company"
                placeholder="Search by Company"
              />
              <MultiSelect
                data={prospectIndustries}
                creatable
                searchable
                value={search.industry}
                onChange={(value) => setSearch({ ...search, industry: value })}
                label="Industry"
                placeholder="Search by Industry"
              />
            </Tabs.Panel>
          </Tabs>
          
          <Text>
            {filteredContacts.length} prospects of {contacts.length} total
          </Text>
        </Card>

        <Box sx={{ width: '80%', padding: '20px' }}>
          {/* Contacts Table */}
          {selectedIds.size > 0 && <Flex mb='xs'>
            <Button onClick={logSelectedProspects} ml='auto' size='xs' color='red'>
              <IconTrash size={14} style={{ marginRight: 5 }} />
              Remove {selectedIds.size} prospects
            </Button>
            <Button onClick={logSelectedProspects} ml='xs' size='xs' color='grape'>
              <IconArrowsCross size={14} style={{ marginRight: 5 }} />
              Move {selectedIds.size} prospects to another persona
            </Button>
          </Flex>}
          <Table sx={{ tableLayout: 'fixed', lineHeight: '1.25' }}>
            <thead>
              <tr>
                <th>
                  <Checkbox onClick={selectAllContacts} checked={allContactsSelected} />
                </th>
                <th>Name</th>
                <th>Title</th>
                <th>Company</th>
                <th>Industry</th>
                <th>Persona</th>
                <th>User Name</th>
                <th>Date Uploaded</th>
              </tr>
            </thead>
            {
              loadingProspects &&
              <tbody>
                <tr>
                  <td colSpan={8} style={{justifyContent: 'center', textAlign: 'center'}}>
                    <Text align="center" mt='md'>Loading...</Text>
                    <Loader ml='auto' mr='auto' mt='md'/>
                  </td>
                </tr>
              </tbody>
            }
            {!loadingProspects && <tbody>{rows}</tbody>}
          </Table>

          {/* Pagination */}
          <Pagination
            // @ts-ignore
            page={currentPage}
            onChange={(i) => {
              setAllContactsSelected(false);
              setCurrentPage(i);
              window.scrollTo(0, 0);
            }}
            total={Math.ceil(filteredContacts.length / resultsPerPage)}
            sx={{ marginTop: '20px' }}
          />
        </Box>
      </Box>
    </PageFrame>
  );
};

export default GlobalContacts;
