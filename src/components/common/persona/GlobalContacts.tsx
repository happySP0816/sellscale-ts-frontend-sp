import { useState, useEffect } from "react";
import {
  Title,
  Table,
  Box,
  Pagination,
  Button,
  Checkbox,
  Card,
  Flex,
  MultiSelect,
  Tabs,
  Modal,
  LoadingOverlay,
  useMantineTheme,
} from "@mantine/core";
import { Text, Badge } from "@mantine/core";
import { useRecoilValue } from "recoil";
import { userTokenState } from "@atoms/userAtoms";
import { API_URL } from "@constants/data";
import { IconArrowsCross, IconFilter, IconTrash } from "@tabler/icons";
import { deterministicMantineColor } from "@utils/requests/utils";
import { openConfirmModal } from "@mantine/modals";
import { showNotification } from "@mantine/notifications";
import PersonaSelect from "./PersonaSplitSelect";
import { useDisclosure } from "@mantine/hooks";
import { IconExternalLink } from "@tabler/icons-react";
import PageFrame from "@common/PageFrame";

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
  overall_status: string;
  linkedin_bio: string;
  education_1: string;
  education_2: string;
  employee_count_comp: string;
  mapping?: string;
};

const GlobalContacts = () => {
  const userToken = useRecoilValue(userTokenState);
  const [contacts, setContacts]: any = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [loadingProspects, setLoadingProspects] = useState(false);
  const [allContactsSelected, setAllContactsSelected] = useState(false);
  const [filterVisible, { toggle: toggleFilterVisible }] = useDisclosure(false);
  const [prospectPersonas, setProspectPersonas]: any = useState([]);
  const [prospectTitles, setProspectTitles]: any = useState([]);
  const [prospectExcludedTitles, setProspectExcludedTitles]: any = useState([]);
  const [prospectSeniority, setProspectSeniority]: any = useState([]);
  const [prospectExcludedSeniority, setProspectExcludedSeniority]: any =
    useState([]);
  const [prospectEducations, setProspectEducations]: any = useState([]);
  const [prospectExcludeEducations, setProspectExcludeEducations]: any =
    useState([]);
  const [prospectBios, setProspectBios]: any = useState([]);
  const [prospectExcludeBios, setProspectExcludeBios]: any = useState([]);
  const [prospectIndustries, setProspectIndustries]: any = useState([]);
  const [prospectExcludeIndustries, setProspectExcludeIndustries]: any =
    useState([]);

  const [prospectCompanies, setProspectCompanies]: any = useState([]);
  const [prospectExcludeCompanies, setProspectExcludeCompanies]: any = useState(
    []
  );
  const [prospectCompanySizes, setProspectCompanySizes]: any = useState([]);
  const [prospectExcludeCompanySizes, setProspectExcludeCompanySizes]: any =
    useState([]);

  const [targetPersona, setTargetPersona]: any = useState(null);
  const theme = useMantineTheme();
  const [showMoveProspectsModal, setShowMoveProspectsModal] = useState(false);

  const [search, setSearch]: any = useState({
    name: [],

    persona: [],

    title: [],
    excluded_titles: [],

    seniority: [],
    excluded_seniority: [],

    education: [],
    excluded_education: [],

    bio: [],
    excluded_bio: [],

    industry: [],
    excluded_industry: [],

    company: [],
    excluded_company: [],

    company_size: [],
    excluded_company_size: [],

    userName: [],
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

    return Array.from(
      new Set(array.sort((a: any, b: any) => frequency[b] - frequency[a]))
    );
  };

  const bulkRemoveProspects = (prospect_ids: any) => {
    fetch(`${API_URL}/prospect/global_contacts/remove`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prospect_ids: prospect_ids,
      }),
    })
      .then((response) => {
        showNotification({
          title: "Success",
          message: "Successfully removed prospects",
          color: "blue",
        });

        setLoadingProspects(true);
        fetch(`${API_URL}/prospect/global_contacts`, {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        })
          .then((response) => response.json())
          .then((data) => {
            setContacts(data.data);
          })
          .finally(() => {
            setLoadingProspects(false);
            setSelectedIds(new Set());
          });

        return response.json();
      })
      .then((data) => {
        console.log(data);
      })
      .catch((error) => {
        showNotification({
          title: "Error",
          message: "Error removing prospects",
          color: "red",
        });
      });
  };

  useEffect(() => {
    setLoadingProspects(true);
    fetch(`${API_URL}/prospect/global_contacts`, {
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setContacts(data.data);

        const tempProspectPersonas: any = sortByFrequency(
          data.data
            .map((contact: GlobalContact) => contact.persona)
            .filter((x: any) => x)
        );
        const tempProspectTitles: any = sortByFrequency(
          data.data
            .map((contact: GlobalContact) => contact.prospect_title)
            .filter((x: any) => x)
        );
        const tempProspectEducations: any = sortByFrequency(
          data.data
            .map((contact: GlobalContact) => contact.education_1)
            .filter((x: any) => x)
        );
        const tempProspectCompanies: any = sortByFrequency(
          data.data
            .map((contact: GlobalContact) => contact.prospect_company)
            .filter((x: any) => x)
        );
        const tempProspectIndustries: any = sortByFrequency(
          data.data
            .map((contact: GlobalContact) => contact.prospect_industry)
            .filter((x: any) => x)
        );
        const tempProspectBios: any = [];
        const tempProspectCompanySizes: any = sortByFrequency(
          data.data
            .map((contact: GlobalContact) => contact.employee_count_comp)
            .filter((x: any) => x)
        );

        setProspectPersonas(tempProspectPersonas);
        setProspectTitles(tempProspectTitles);
        setProspectExcludedTitles(tempProspectTitles);
        setProspectEducations(tempProspectEducations);
        setProspectExcludeEducations(tempProspectEducations);
        setProspectExcludeBios(tempProspectBios);
        setProspectCompanies(tempProspectCompanies);
        setProspectExcludeCompanies(tempProspectCompanies);
        setProspectIndustries(tempProspectIndustries);
        setProspectExcludeIndustries(tempProspectIndustries);
        setProspectCompanySizes(tempProspectCompanySizes);
        setProspectExcludeCompanySizes(tempProspectCompanySizes);
      })
      .finally(() => setLoadingProspects(false))
      .catch((error) => console.error("Error fetching contacts:", error));
  }, [userToken]);

  const isSearchTermIncluded = (searchTerms: any, contactProperty: any) => {
    return searchTerms.some((term: string) =>
      contactProperty?.toLowerCase().includes(term?.toLowerCase())
    );
  };

  const isSearchTermDiscluded = (searchTerms: any, contactProperty: any) => {
    return searchTerms.every(
      (term: string) =>
        !contactProperty?.toLowerCase().includes(term?.toLowerCase())
    );
  };

  let filteredContacts = contacts.filter(
    (contact: GlobalContact) =>
      (search.name.length === 0 ||
        isSearchTermIncluded(search.name, contact.prospect_name)) &&
      (search.title.length === 0 ||
        isSearchTermIncluded(search.title, contact.prospect_title)) &&
      (search.company.length === 0 ||
        isSearchTermIncluded(search.company, contact.prospect_company)) &&
      (search.industry.length === 0 ||
        isSearchTermIncluded(search.industry, contact.prospect_industry)) &&
      (search.userName.length === 0 ||
        isSearchTermIncluded(search.userName, contact.user_name)) &&
      (search.excluded_titles.length === 0 ||
        isSearchTermDiscluded(
          search.excluded_titles,
          contact.prospect_title
        )) &&
      (
        search.excluded_seniority.length === 0 ||
        isSearchTermDiscluded(
          search.excluded_seniority,
          contact.prospect_title
        )
      ) &&
      (search.seniority.length === 0 ||
        isSearchTermIncluded(search.seniority, contact.prospect_title)) 
      &&
      (search.education.length === 0 ||
        isSearchTermIncluded(search.education, contact.education_1) ||
        search.education.length === 0 ||
        isSearchTermIncluded(search.education, contact.education_2)) &&
      (search.excluded_education.length === 0 ||
        isSearchTermDiscluded(
          search.excluded_education,
          contact.education_1
        )) &&
      (search.excluded_education.length === 0 ||
        isSearchTermDiscluded(
          search.excluded_education,
          contact.education_2
        )) &&
      (search.bio.length === 0 ||
        isSearchTermIncluded(search.bio, contact.linkedin_bio)) &&
      (search.excluded_bio.length === 0 ||
        isSearchTermDiscluded(search.excluded_bio, contact.linkedin_bio)) &&
      (search.excluded_industry.length === 0 ||
        isSearchTermDiscluded(
          search.excluded_industry,
          contact.prospect_industry
        )) &&
      (search.excluded_company.length === 0 ||
        isSearchTermDiscluded(
          search.excluded_company,
          contact.prospect_company
        )) &&
      (search.excluded_company_size.length === 0 ||
        isSearchTermDiscluded(
          search.excluded_company_size,
          contact.employee_count_comp
        )) &&
      (search.company_size.length === 0 ||
        isSearchTermIncluded(
          search.company_size,
          contact.employee_count_comp
        )) &&
      (!search.persona ||
        search.persona?.length === 0 ||
        isSearchTermIncluded(search.persona, contact.persona))
  );

  // for every prospect, add a string called 'mapping' which is a list that says (✅ title: {title}, ✅ company: {company}, ✅ industry: {industry}, ✅ education: {education}, ✅ bio: {bio}, ✅ company size: {company size})
  //  based on the search terms, and then filter out the ones that don't have all of the search terms

  // ex 1. Julie Smith is a Sr. Devops engineer in Technology industry
  // for her it should be (✅ title: Sr. Devops engineer, ✅ industry: Technology)

  filteredContacts = filteredContacts.map((contact: GlobalContact) => {
    let mapping = "";

    if (
      search.title.length > 0 ||
      isSearchTermIncluded(search.title, contact.prospect_title)
    ) {
      for (let i = 0; i < search.title.length; i++) {
        if (
          contact.prospect_title
            ?.toLowerCase()
            .includes(search.title[i]?.toLowerCase())
        ) {
          mapping += `✅ title: ${search.title[i]}, `;
          break;
        }
      }
    }

    if (
      search.seniority.length > 0 ||
      isSearchTermIncluded(search.seniority, contact.prospect_title)
    ) {
      for (let i = 0; i < search.seniority.length; i++) {
        if (
          contact.prospect_title
            ?.toLowerCase()
            .includes(search.seniority[i]?.toLowerCase())
        ) {
          mapping += `✅ seniority: ${search.seniority[i]}, `;
          break;
        }
      }
    }

    if (
      search.company.length > 0 ||
      isSearchTermIncluded(search.company, contact.prospect_company)
    ) {
      for (let i = 0; i < search.company.length; i++) {
        if (
          contact.prospect_company
            ?.toLowerCase()
            .includes(search.company[i]?.toLowerCase())
        ) {
          mapping += `✅ company: ${search.company[i]}, `;
          break;
        }
      }
    }

    if (
      search.industry.length > 0 ||
      isSearchTermIncluded(search.industry, contact.prospect_industry)
    ) {
      for (let i = 0; i < search.industry.length; i++) {
        if (
          contact.prospect_industry
            ?.toLowerCase()
            .includes(search.industry[i]?.toLowerCase())
        ) {
          mapping += `✅ industry: ${search.industry[i]}, `;
          break;
        }
      }
    }

    if (
      search.education.length > 0 ||
      isSearchTermIncluded(search.education, contact.education_1) ||
      search.education.length > 0 ||
      isSearchTermIncluded(search.education, contact.education_2)
    ) {
      if (contact.education_1) {
        for (let i = 0; i < search.education.length; i++) {
          if (
            contact.education_1
              ?.toLowerCase()
              .includes(search.education[i]?.toLowerCase())
          ) {
            mapping += `✅ education: ${search.education[i]}, `;
            break;
          }
        }
      }
      if (contact.education_2) {
        for (let i = 0; i < search.education.length; i++) {
          if (
            contact.education_2
              ?.toLowerCase()
              .includes(search.education[i]?.toLowerCase())
          ) {
            mapping += `✅ education: ${search.education[i]}, `;
            break;
          }
        }
      }
    }

    if (
      search.bio.length > 0 ||
      isSearchTermIncluded(search.bio, contact.linkedin_bio)
    ) {
      for (let i = 0; i < search.bio.length; i++) {
        if (
          contact.linkedin_bio
            ?.toLowerCase()
            .includes(search.bio[i]?.toLowerCase())
        ) {
          mapping += `✅ bio: ${search.bio[i]}, `;
          break;
        }
      }
    }

    if (
      search.company_size.length > 0 ||
      isSearchTermIncluded(search.company_size, contact.employee_count_comp)
    ) {
      for (let i = 0; i < search.company_size.length; i++) {
        if (
          contact.employee_count_comp
            ?.toLowerCase()
            .includes(search.company_size[i]?.toLowerCase())
        ) {
          mapping += `✅ company size: ${search.company_size[i]}, `;
          break;
        }
      }
    }

    return { ...contact, mapping };
  });

  const startIndex = (currentPage - 1) * resultsPerPage;
  const selectedContacts = filteredContacts.slice(
    startIndex,
    startIndex + resultsPerPage
  );

  const handleSelectRow = (id: number) => {
    const newSelectedIds = new Set(selectedIds);
    if (newSelectedIds.has(id)) {
      newSelectedIds.delete(id);
    } else {
      newSelectedIds.add(id);
    }
    setSelectedIds(newSelectedIds);
  };

  const removeSelectedProspects = () => {
    openConfirmModal({
      children: (
        <Box>
          <Text fw="bold">
            {"Are you sure you want to remove " +
              selectedIds.size +
              " prospects?"}
          </Text>
          <Text>
            This will mark the prospect as 'Not Qualified' and will remove them
            from your list of prospects.
          </Text>
        </Box>
      ),
      labels: { confirm: "Confirm", cancel: "Cancel" },
      onConfirm: () => {
        bulkRemoveProspects(Array.from(selectedIds));
      },
    });
  };

  const moveProspectsToNewCampaign = () => {
    fetch(`${API_URL}/prospect/global_contacts/move_to_persona`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prospect_ids: Array.from(selectedIds),
        new_archetype_id: targetPersona[0].archetype_id,
      }),
    })
      .then((response) => {
        showNotification({
          title: "Success",
          message: "Successfully moved prospects",
          color: "blue",
        });

        setLoadingProspects(true);
        fetch(`${API_URL}/prospect/global_contacts`, {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        })
          .then((response) => response.json())
          .then((data) => {
            setContacts(data.data);
          })
          .finally(() => {
            setLoadingProspects(false);
            setSelectedIds(new Set());
          });

        return response.json();
      })
      .then((data) => {
        console.log(data);
      })
      .catch((error) => {
        showNotification({
          title: "Error",
          message: "Error moving prospects",
          color: "red",
        });
      });
  };

  const openMoveProspectsModal = () => {
    setShowMoveProspectsModal(true);
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
      <td width={"5%"}>
        <Box>
          <Checkbox
            checked={selectedIds.has(contact.prospect_id)}
            onChange={() => handleSelectRow(contact.prospect_id)}
          />
        </Box>
      </td>
      <td width="25%">
        <Box>
          <Text size="xs" fw={600}>
            {contact.prospect_name}
          </Text>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Badge size="xs" color={deterministicMantineColor(contact.persona)}>
              {contact.persona.substring(0, 30)} {contact.persona.length > 30 && '...'}
            </Badge>
          </Box>
        </Box>
      </td>
      <td width="20%">
        <Text size="xs" fw={600}>
          {contact.prospect_title}
        </Text>
      </td>
      <td width="20%">
        <Text size="xs" fw={600}>
          {contact.prospect_company}
        </Text>
      </td>
      <td width="10%">
        <Badge
          size="xs"
          color={deterministicMantineColor(contact.overall_status)}
        >
          {contact.overall_status}
        </Badge>
      </td>
      <td width="10%">
        <Text size="xs" fw={600}>
          {contact.mapping}
        </Text>
      </td>
      <td width="10%">
        <Button
          radius="xl"
          size="xs"
          compact
          component="a"
          target="_blank"
          rel="noopener noreferrer"
          href={contact.prospect_linkedin_url}
          leftIcon={<IconExternalLink size={"0.8rem"} />}
        >
          Visit
        </Button>
      </td>
    </tr>
  ));

  return (
    <PageFrame>
      <Title order={3}>Global Contacts</Title>
      <Text>
        These are the contacts that have been uploaded by all users who are in
        the 'Prospected' state. You can filter and search through them below.
      </Text>

      <Modal
        opened={showMoveProspectsModal}
        onClose={() => {
          setShowMoveProspectsModal(false);
        }}
        title={"Move " + selectedIds.size + " prospects to another persona"}
        size="md"
      >
        <PersonaSelect
          disabled={false}
          onChange={(persona) => setTargetPersona(persona)}
          selectMultiple={false}
          label=""
          description={"Select the Campaign you wish to move contacts to"}
          exclude={[]}
        />
        <Button
          onClick={() => {
            moveProspectsToNewCampaign();
            setShowMoveProspectsModal(false);
          }}
          mt="md"
          size="xs"
          color="blue"
          disabled={!targetPersona}
          rightIcon={<IconArrowsCross size={14} style={{ marginRight: 5 }} />}
        >
          Move {selectedIds.size} prospects
        </Button>
      </Modal>

      <Flex mt={"md"} justify={"space-between"}>
        <Button
          size="xs"
          onClick={toggleFilterVisible}
          variant="outline"
          color="gray"
          leftIcon={<IconFilter size={14} />}
        >
          Show Filter
        </Button>

        <Box>
          {selectedIds.size > 0 && (
            <Flex mb="xs">
              <Button
                onClick={removeSelectedProspects}
                ml="auto"
                size="xs"
                color="red"
              >
                <IconTrash size={14} style={{ marginRight: 5 }} />
                Remove {selectedIds.size} prospects
              </Button>
              <Button
                onClick={openMoveProspectsModal}
                ml="xs"
                size="xs"
                color="grape"
              >
                <IconArrowsCross size={14} style={{ marginRight: 5 }} />
                Move {selectedIds.size} prospects to another persona
              </Button>
            </Flex>
          )}
        </Box>
      </Flex>
      <Flex h={"100%"} mt="xs" gap={"md"}>
        {filterVisible && (
          <Box sx={{ maxWidth: "30%", width: "100%", flex: 1 }}>
            <Tabs
              defaultValue="person"
              styles={(theme) => ({
                tabsList: {
                  backgroundColor: theme.colors.blue[theme.fn.primaryShade()],
                  paddingLeft: "0.5rem",
                  paddingRight: "0.5rem",
                  height: "44px",
                },
                panel: {
                  padding: "0.5rem",
                  backgroundColor: theme.white,
                },
                tab: {
                  ...theme.fn.focusStyles(),
                  color: theme.white,
                  marginBottom: 0,
                  "&:hover": {
                    backgroundColor: theme.colors.blue[theme.fn.primaryShade()],
                    color: theme.white,
                  },
                  "&[data-active]": {
                    borderBottomColor: theme.white,
                    color: theme.white,
                  },
                },
              })}
            >
              <Tabs.List>
                <Tabs.Tab value="person">Person</Tabs.Tab>
                <Tabs.Tab value="company">Company</Tabs.Tab>
              </Tabs.List>

              <Tabs.Panel value="person">
                <MultiSelect
                  data={prospectPersonas}
                  withinPortal
                  value={search.persona}
                  onChange={(value) => setSearch({ ...search, persona: value })}
                  label="Persona"
                  placeholder="Search by Persona"
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
                  maw={"30vw"}
                  value={search.title}
                  onChange={(value) => setSearch({ ...search, title: value })}
                  label="Title (Included)"
                  placeholder="Search by Title"
                />
                <MultiSelect
                  withinPortal
                  data={prospectExcludedTitles}
                  creatable
                  searchable
                  getCreateLabel={(query) => `+ Add a filter for ${query}`}
                  onCreate={(query: any) => {
                    const item: any = { value: query, label: query };
                    setProspectExcludedTitles((current: any) => [
                      ...current,
                      item,
                    ]);
                    return item;
                  }}
                  value={search.excluded_titles}
                  onChange={(value) =>
                    setSearch({ ...search, excluded_titles: value })
                  }
                  label="Title (Excluded)"
                  placeholder="Search by Title"
                />

                <MultiSelect
                  withinPortal
                  data={prospectSeniority}
                  creatable
                  searchable
                  getCreateLabel={(query) => `+ Add a filter for ${query}`}
                  onCreate={(query: any) => {
                    const item: any = { value: query, label: query };
                    setProspectSeniority((current: any) => [
                      ...current,
                      item,
                    ]);
                    return item;
                  }}
                  value={search.seniority}
                  onChange={(value) =>
                    setSearch({ ...search, seniority: value })
                  }
                  label="Seniority (Included)"
                  placeholder="Search by Seniority"
                />

                <MultiSelect
                  withinPortal
                  data={prospectExcludedSeniority}
                  creatable
                  searchable
                  getCreateLabel={(query) => `+ Add a filter for ${query}`}
                  onCreate={(query: any) => {
                    const item: any = { value: query, label: query };
                    setProspectExcludedSeniority((current: any) => [
                      ...current,
                      item,
                    ]);
                    return item;
                  }}
                  value={search.excluded_seniority}
                  onChange={(value) =>
                    setSearch({ ...search, excluded_seniority: value })
                  }
                  label="Seniority (Excluded)"
                  placeholder="Search by Seniority"
                />

                <MultiSelect
                  data={prospectEducations}
                  withinPortal
                  creatable
                  searchable
                  getCreateLabel={(query) => `+ Add a filter for ${query}`}
                  onCreate={(query: any) => {
                    const item: any = { value: query, label: query };
                    setProspectEducations((current: any) => [...current, item]);
                    return item;
                  }}
                  value={search.education}
                  onChange={(value) =>
                    setSearch({ ...search, education: value })
                  }
                  label="Education (Included)"
                  placeholder="Search by Education"
                />
                <MultiSelect
                  data={prospectExcludeEducations}
                  withinPortal
                  creatable
                  searchable
                  getCreateLabel={(query) => `+ Add a filter for ${query}`}
                  onCreate={(query: any) => {
                    const item: any = { value: query, label: query };
                    setProspectExcludeEducations((current: any) => [
                      ...current,
                      item,
                    ]);
                    return item;
                  }}
                  value={search.excluded_education}
                  onChange={(value) =>
                    setSearch({ ...search, excluded_education: value })
                  }
                  label="Education (Excluded)"
                  placeholder="Search by Education"
                />

                <MultiSelect
                  data={prospectBios}
                  withinPortal
                  creatable
                  searchable
                  getCreateLabel={(query) => `+ Add a filter for ${query}`}
                  onCreate={(query: any) => {
                    const item: any = { value: query, label: query };
                    setProspectBios((current: any) => [...current, item]);
                    return item;
                  }}
                  value={search.bio}
                  onChange={(value) => setSearch({ ...search, bio: value })}
                  label="Bio (Included)"
                  placeholder="Search by Bio"
                />
                <MultiSelect
                  data={prospectExcludeBios}
                  withinPortal
                  creatable
                  searchable
                  getCreateLabel={(query) => `+ Add a filter for ${query}`}
                  onCreate={(query: any) => {
                    const item: any = { value: query, label: query };
                    setProspectExcludeBios((current: any) => [
                      ...current,
                      item,
                    ]);
                    return item;
                  }}
                  value={search.excluded_bio}
                  onChange={(value) =>
                    setSearch({ ...search, excluded_bio: value })
                  }
                  label="Bio (Excluded)"
                  placeholder="Search by Bio"
                />

                <MultiSelect
                  data={[]}
                  withinPortal
                  creatable
                  searchable
                  getCreateLabel={(query) => `+ Add a filter for ${query}`}
                  value={search.excluded_bio}
                  onChange={(value) =>
                    setSearch({ ...search, excluded_bio: value })
                  }
                  label="Years Experience (Coming soon ⚠️)"
                />

                <MultiSelect
                  data={[]}
                  withinPortal
                  creatable
                  searchable
                  getCreateLabel={(query) => `+ Add a filter for ${query}`}
                  value={search.excluded_bio}
                  onChange={(value) =>
                    setSearch({ ...search, excluded_bio: value })
                  }
                  label="Skills (Coming soon ⚠️)"
                />

                <MultiSelect
                  data={[]}
                  withinPortal
                  creatable
                  searchable
                  getCreateLabel={(query) => `+ Add a filter for ${query}`}
                  value={search.excluded_bio}
                  onChange={(value) =>
                    setSearch({ ...search, excluded_bio: value })
                  }
                  label="Location (Coming soon ⚠️)"
                />
              </Tabs.Panel>

              <Tabs.Panel value="company">
                <MultiSelect
                  data={prospectCompanies}
                  withinPortal
                  creatable
                  searchable
                  value={search.company}
                  onChange={(value) => setSearch({ ...search, company: value })}
                  label="Company (Included)"
                  placeholder="Search by Company"
                />
                <MultiSelect
                  data={prospectExcludeCompanies}
                  withinPortal
                  creatable
                  searchable
                  value={search.excluded_company}
                  onChange={(value) =>
                    setSearch({ ...search, excluded_company: value })
                  }
                  label="Company (Excluded)"
                  placeholder="Search by Company"
                />
                <MultiSelect
                  data={prospectIndustries}
                  withinPortal
                  creatable
                  searchable
                  value={search.industry}
                  onChange={(value) =>
                    setSearch({ ...search, industry: value })
                  }
                  label="Industry (Included)"
                  placeholder="Search by Industry"
                />
                <MultiSelect
                  data={prospectExcludeIndustries}
                  withinPortal
                  creatable
                  searchable
                  value={search.excluded_industry}
                  onChange={(value) =>
                    setSearch({ ...search, excluded_industry: value })
                  }
                  label="Industry (Excluded)"
                  placeholder="Search by Industry"
                />
                <MultiSelect
                  data={prospectCompanySizes}
                  withinPortal
                  creatable
                  searchable
                  value={search.company_size}
                  onChange={(value) =>
                    setSearch({ ...search, company_size: value })
                  }
                  label="Company Size (Included)"
                  placeholder="Search by Company Size"
                />
                <MultiSelect
                  data={prospectExcludeCompanySizes}
                  withinPortal
                  creatable
                  searchable
                  value={search.excluded_company_size}
                  onChange={(value) =>
                    setSearch({ ...search, excluded_company_size: value })
                  }
                  label="Company Size (Excluded)"
                  placeholder="Search by Company Size"
                />

                <MultiSelect
                  data={[]}
                  withinPortal
                  creatable
                  searchable
                  getCreateLabel={(query) => `+ Add a filter for ${query}`}
                  value={search.excluded_bio}
                  onChange={(value) =>
                    setSearch({ ...search, excluded_bio: value })
                  }
                  label="Location (Coming soon ⚠️)"
                />

                <MultiSelect
                  data={[]}
                  withinPortal
                  creatable
                  searchable
                  getCreateLabel={(query) => `+ Add a filter for ${query}`}
                  value={search.excluded_bio}
                  onChange={(value) =>
                    setSearch({ ...search, excluded_bio: value })
                  }
                  label="Description (Coming soon ⚠️)"
                />
              </Tabs.Panel>
            </Tabs>

            <Text mt={'sm'} fw={500}>
              {filteredContacts.length} prospects of {contacts.length} total
            </Text>
          </Box>
        )}

        <Box sx={{ flex: 1 }}>
          {/* Contacts Table */}
          <Card withBorder>
            <LoadingOverlay visible={loadingProspects} />
            <Table sx={{ lineHeight: "1.25" }}>
              <thead
                style={{
                  height: "44px",
                  backgroundColor: theme.colors.gray[0],
                }}
              >
                <tr>
                  <th>
                    <Checkbox
                      onClick={selectAllContacts}
                      checked={allContactsSelected}
                    />
                  </th>
                  <th>Name</th>
                  <th>Title</th>
                  <th>Company</th>
                  <th>Status</th>
                  <th>ICP Fit Reason</th>
                  <th>Linkedin URL</th>
                </tr>
              </thead>
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
              sx={{ marginTop: "20px" }}
            />
          </Card>
        </Box>
      </Flex>
    </PageFrame>
  );
};

export default GlobalContacts;
