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
  Accordion,
  Container,
  Alert,
  Switch,
  Group,
  FileButton,
  Anchor,
  rem,
  useMantineTheme,
} from "@mantine/core";
import { useEffect, useState } from "react";

import { useRecoilState, useRecoilValue } from "recoil";
import { userDataState, userTokenState } from "@atoms/userAtoms";
import { showNotification } from "@mantine/notifications";
import { API_URL } from "@constants/data";
import DoNotContactListCaughtProspects from "./DoNotContactListV2/DoNotContactListCaughtProspects";
import {
  IconAbc,
  IconAlertCircle,
  IconKeyboard,
  IconRefresh,
  IconChevronDown,
  IconTrash,
} from "@tabler/icons";
import { INDUSTRIES, LOCATION, TITLES } from "./DoNotContactListConstants";
import { openConfirmModal } from "@mantine/modals";
import { Prospect } from "src";
import { convertFileToJSON, csvStringToArray } from "@utils/fileProcessing";
import { CSVLink } from "react-csv";
import { ex } from "@fullcalendar/core/internal-common";

export default function DoNotContactListV2(props: { forSDR?: boolean }) {
  const [userToken] = useRecoilState(userTokenState);
  const [fetchedData, setFetchedData] = useState(false);
  const [loading, setLoading] = useState(false);
  const [accordion, setAccordion] = useState("");
  const [companyValue, setCompanyValue] = useState<any>("companyName");
  const [keywordsValue, setKeywordsValue] = useState<any>("keywords");
  const [companyLocationValue, setCompanyLocationValue] =
    useState<any>("companyLocation");
  const [companyIndustryValue, setCompanyIndustryValue] =
    useState<any>("companyIndustry");
  const [prospectTitle, setProspectTitleValue] = useState<any>("prospectTitle");
  const [prospectLocation, setProspectLocationValue] =
    useState<any>("prospectLocation");
  const [prospectName, setProspectNameValue] = useState<any>("prospectName");
  const [prospectEmail, setProspectEmailValue] = useState<any>("prospectEmail");
  const [keywords, setKeywords] = useState<{ value: string; label: string }[]>([
    // { value: "staffing", label: "staffing" },
  ]);
  const [companyNames, setCompanyNames] = useState<
    { value: string; label: string }[]
  >([
    // { value: "Medicus", label: "medicus" },
  ]);
  const [companyLocations, setCompanyLocations] = useState<
    { value: string; label: string }[]
  >([
    // { value: "America", label: "america" },
  ]);
  const [companyIndustries, setCompanyIndustries] = useState<
    { value: string; label: string }[]
  >([]);
  const [prospectTitles, setProspectTitles] = useState<
    { value: string; label: string }[]
  >([
    // { value: "CEO", label: "ceo" },
  ]);
  const [prospectLocations, setProspectLocations] = useState<
    { value: string; label: string }[]
  >([
    // { value: "America", label: "america" },
  ]);
  const [prospectNames, setProspectNames] = useState<
    { value: string; label: string }[]
  >([
    // { value: "America", label: "america" },
  ]);
  const [prospectEmails, setProspectEmails] = useState<
    { value: string; label: string }[]
  >([
    // { value: "America", label: "america" },
  ]);

  const [isViewRemovedProspects, setIsViewRemovedProspects] =
    useState<boolean>(false);

  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [selectedCompanyLocations, setSelectedCompanyLocations] = useState<
    string[]
  >([]);
  const [selectedCompanyIndustries, setSelectedCompanyIndustries] = useState<
    string[]
  >([]);
  const [selectedProspectTitles, setSelectedProspectTitles] = useState<
    string[]
  >([]);
  const [selectedProspectLocations, setSelectedProspectLocations] = useState<
    string[]
  >([]);
  const [selectedProspectNames, setSelectedProspectNames] = useState<string[]>(
    []
  );
  const [selectedProspectEmails, setSelectedProspectEmails] = useState<string[]>(
    []
  );
  const [needsSave, setNeedsSave] = useState(false);

  const [keywordSearchValue, setKeywordSearchValue] = useState("");
  const [companySearchValue, setCompanySearchValue] = useState("");
  const [companyLocationSearchValue, setCompanyLocationSearchValue] =
    useState("");
  const [companyIndustrySearchValue, setCompanyIndustrySearchValue] =
    useState("");
  const [prospectTitleSearchValue, setProspectTitleSearchValue] = useState("");
  const [prospectLocationSearchValue, setProspectLocationSearchValue] =
    useState("");
  const [prospectNameSearchValue, setProspectNameSearchValue] = useState("");
  const [prospectEmailSearchValue, setProspectEmailSearchValue] = useState("");
  const [caughtProspects, setCaughtProspects] = useState([]);
  const userData = useRecoilValue(userDataState);

  const [AccoundData_Count, setAccountData_Count] = useState(
    selectedCompanies.length +
      selectedKeywords.length +
      selectedCompanyLocations.length +
      selectedCompanyIndustries.length
  );

  const [ProspectData_Count, setProspectData_Count] = useState(
    selectedProspectTitles.length + selectedProspectLocations.length + selectedProspectNames.length + selectedProspectEmails.length
  );

  // Save as nothing tracking state
  // - No clean, bug-free way to do this without a component restructure
  const [saveAsNothing, setSaveAsNothing] = useState(false);
  const theme = useMantineTheme();
  // Replace all newlines in pasted text with an escaped newline
  useEffect(() => {
    const modifiedPasteHandler = (event: any) => {
      event.preventDefault(); // Prevent default paste behavior

      // @ts-ignore
      const clipboardData = event.clipboardData;
      const pastedText = clipboardData?.getData("text"); // Get the pasted text
      if (!pastedText) return;

      // Modify the pasted content
      const modifiedText = pastedText.replace(/\r|\n/gm, "\\n");

      // Insert the modified content into the editable element
      document.execCommand("insertHTML", false, modifiedText);
    };
    addEventListener("paste", modifiedPasteHandler);

    return () => {
      removeEventListener("paste", modifiedPasteHandler);
    };
  }, []);

  const getKeywords = async () => {
    const res = await fetch(
      `${API_URL}/client${props.forSDR ? `/sdr` : ``}/do_not_contact_filters`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
      }
    );
    const resp = await res.json();

    // If the user has never set filters before, let them save empty filters
    if (
      !resp.data.do_not_contact_company_names ||
      !resp.data.do_not_contact_keywords_in_company_names
    ) {
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
    if (resp.data.do_not_contact_company_names?.length === 0)
      setCompanyValue("");
    setKeywords(
      resp.data.do_not_contact_keywords_in_company_names.map((x: any) => ({
        value: x,
        label: x,
      }))
    );
    setSelectedKeywords(
      resp.data.do_not_contact_keywords_in_company_names.map((x: any) => x)
    );
    if (resp.data.do_not_contact_keywords_in_company_names?.length === 0)
      setKeywordsValue("");

    setCompanyLocations(
      resp.data.do_not_contact_location_keywords.map((x: any) => ({
        value: x,
        label: x,
      }))
    );
    setSelectedCompanyLocations(
      resp.data.do_not_contact_location_keywords.map((x: any) => x)
    );
    if (resp.data.do_not_contact_location_keywords?.length === 0)
      setCompanyLocationValue("");
    setCompanyIndustries(
      resp.data.do_not_contact_industries.map((x: any) => ({
        value: x,
        label: x,
      }))
    );
    setSelectedCompanyIndustries(
      resp.data.do_not_contact_industries.map((x: any) => x)
    );

    if (resp.data.do_not_contact_industries?.length === 0)
      setCompanyIndustryValue("");

    setProspectTitles(
      resp.data.do_not_contact_titles.map((x: any) => ({
        value: x,
        label: x,
      }))
    );
    setSelectedProspectTitles(
      resp.data.do_not_contact_titles.map((x: any) => x)
    );

    if (resp.data.do_not_contact_titles?.length === 0)
      setProspectTitleValue("");

    setProspectLocations(
      resp.data.do_not_contact_prospect_location_keywords.map((x: any) => ({
        value: x,
        label: x,
      }))
    );
    setSelectedProspectLocations(
      resp.data.do_not_contact_prospect_location_keywords.map((x: any) => x)
    );

    if (resp.data.do_not_contact_prospect_location_keywords?.length === 0)
      setProspectLocationValue("");

    setProspectNames(
      resp.data.do_not_contact_people_names.map((x: any) => ({
        value: x,
        label: x,
      }))
    );
    setSelectedProspectNames(
      resp.data.do_not_contact_people_names.map((x: any) => x)
    );

    if (resp.data.do_not_contact_people_names?.length === 0)
      setProspectNameValue("");

    setProspectEmails(
      resp.data.do_not_contact_emails.map((x: any) => ({
        value: x,
        label: x,
      }))
    );
    setSelectedProspectEmails(
      resp.data.do_not_contact_emails.map((x: any) => x)
    );

    if (resp.data.do_not_contact_emails?.length === 0)
      setProspectEmailValue("");

      
  };
  useEffect(() => {
    if (!fetchedData) {
      getKeywords();
      setFetchedData(true);
    }
  }, [fetchedData]);

  const saveFilters = async () => {
    const resp = await fetch(
      `${API_URL}/client${props.forSDR ? `/sdr` : ``}/do_not_contact_filters`,
      {
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
          do_not_contact_people_names: selectedProspectNames,
          do_not_contact_emails: selectedProspectEmails,
        }),
      }
    );
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

  const openProspectRemovalModal = () => {
    openConfirmModal({
      title: "⚠️ Confirm Prospect Removal ⚠️ ",
      children: (
        <>
          <Text>
            By clicking confirm, you will automatically remove{" "}
            {caughtProspects.filter(
              (prospect: Prospect) => prospect.overall_status !== "REMOVED"
            ).length}{" "} prospects
          </Text>
          <Text mt="md">This action is not reversible.</Text>
        </>
      ),
      labels: { confirm: "Confirm", cancel: "Cancel" },
      onCancel: () => {},
      onConfirm: () => removeProspectFromContactList(),
    });
  };

  const fetchCaughtProspects = async () => {
    setLoading(true);
    const res = await fetch(
      `${API_URL}/client${
        props.forSDR ? `/sdr` : ``
      }/do_not_contact_filters/caught_prospects`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
      }
    );
    const resp = await res.json();
    const prospects = resp.prospects;
    setCaughtProspects(prospects);
    setLoading(false);
  };

  const removeProspectFromContactList = async () => {
    setLoading(true);
    const resp = await fetch(
      `${API_URL}/client${
        props.forSDR ? `/sdr` : ``
      }/do_not_contact_filters/remove_prospects`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
      }
    );
    fetchCaughtProspects();
    setLoading(false);
  };

  const handleAccordion = (type: string) => {
    setAccordion(type);
  };

  const handleRemoveFilter = () => {
    setSelectedCompanies([]);
    setSelectedKeywords([]);
    setSelectedCompanyLocations([]);
    setSelectedCompanyIndustries([]);
    setSelectedProspectTitles([]);
    setSelectedProspectLocations([]);
    setSelectedProspectNames([]);
    setSelectedProspectEmails([]);
  };

  useEffect(() => {
    setAccountData_Count(
      selectedCompanies.length +
        selectedKeywords.length +
        selectedCompanyLocations.length +
        selectedCompanyIndustries.length
    );
  }, [
    selectedCompanies,
    selectedKeywords,
    selectedCompanyLocations,
    selectedCompanyIndustries,
  ]);

  useEffect(() => {
    setProspectData_Count(
      selectedProspectTitles.length + selectedProspectLocations.length + selectedProspectNames.length + selectedProspectEmails.length
    );
  }, [selectedProspectTitles, selectedProspectLocations, selectedProspectNames, selectedProspectEmails]);

  // File Import / Export
  const handleFileImport = async (payload: File | null) => {
    if (!payload) return;
    let records: Record<string, string>[] = [];
    try {
      records = (await convertFileToJSON(payload)) as Record<string, string>[];

      // For each key in the record, run csvStringToArray on the value
      // Object.keys(record).forEach((key) => {
      //   record[key] = csvStringToArray(record[key] as unknown as string) as string[];
      // });
    } catch (e) {
      console.error(e);
    }

    setSelectedCompanies(records.map((x) => x.company));

    // if (record?.company_names) {
    //   setSelectedCompanies(record?.company_names);
    // }
    // if (record?.keywords_in_company_names) {
    //   setSelectedKeywords(record?.keywords_in_company_names);
    // }
    // if (record?.industries) {
    //   setSelectedCompanyIndustries(record?.industries);
    // }
    // if (record?.location_keywords) {
    //   setSelectedCompanyLocations(record?.location_keywords);
    // }
    // if (record?.titles) {
    //   setSelectedProspectTitles(record?.titles);
    // }
    // if (record?.prospect_location_keywords) {
    //   setSelectedProspectLocations(record?.prospect_location_keywords);
    // }
    await saveFilters();
  };

  return (
    <Box maw='93%'>
      <Box p="md" pb={0}>
        <Flex justify={"space-between"} align={"center"}>
          <Box>
            <Title order={3}>
              {props.forSDR
                ? userData.sdr_name.split(" ")[0] + "'s "
                : userData.client.company + "'s "}{" "}
              Do Not Contact Filters
            </Title>{" "}
          </Box>
          {/* <Flex gap={"md"}>
          <Text>
            View{" "}
            {
              caughtProspects.filter(
                (prospect: Prospect) => prospect.overall_status === "REMOVED"
              ).length
            }{" "}
            Removed Prospects
          </Text>
          <Switch
            defaultChecked
            // checked={isViewRemovedProspects}
            size="md"
            onClick={() => setIsViewRemovedProspects((prev) => !prev)}
          />
        </Flex> */}
          <Group noWrap spacing={5} mx={5}>
            <FileButton onChange={handleFileImport} accept=".csv">
              {(props) => <Button {...props}>Upload CSV</Button>}
            </FileButton>
            {/* <Button>
            <CSVLink
              style={{ textDecoration: "none", color: "white" }}
              data={selectedCompanies.map((company) => ({
                company: company,
              }))}
              // data={[
              //   {
              //     company_names: selectedCompanies,
              //     keywords_in_company_names: selectedKeywords,
              //     industries: selectedCompanyIndustries,
              //     location_keywords: selectedCompanyLocations,
              //     titles: selectedProspectTitles,
              //     prospect_location_keywords: selectedProspectLocations,
              //   },
              // ]}
              filename={"do-not-contact-filters.csv"}
            >
              Export to CSV
            </CSVLink>
          </Button> */}
          </Group>
        </Flex>

        {props.forSDR || (
          <Alert
            mt={"md"}
            icon={<IconAlertCircle size="1rem" />}
            title="Warning"
            color="red"
            styles={{
              body: {
                display: "flex",
                gap: rem(4),
                alignItems: "center",
              },
              message: {
                fontWeight: 600,
                color: theme.colors.gray[6],
              },
              title: {
                marginBottom: 0,
              },
            }}
          >
            This is your entire organizations' Do Not Contact list. This will
            affect other users.
          </Alert>
        )}

        {!loading && caughtProspects.length === 0 && (
          <Flex justify={"space-between"} align={"center"} mt={"md"}>
            <Title order={5}> No prospects caught in these filters</Title>{" "}
            <Button
              color="gray"
              ml="lg"
              leftIcon={<IconRefresh />}
              onClick={fetchCaughtProspects}
            >
              Refresh
            </Button>
          </Flex>
        )}

        <Box mt={"md"}>
          <Box
            sx={{
              borderRadius: 12,
            }}
          >
            <Accordion
              multiple
              defaultValue={["accountData", "flexibility"]}
              styles={(theme) => ({
                control: {
                  border: "1.5px solid #eceaee",
                  borderBottomLeftRadius: 0,
                  borderBottomRightRadius: 0,
                  "&[data-active]": {
                    backgroundColor: "#ebf2fd",
                    color: "#3c85ee",
                    border: "1.5px solid #c8ddfa",
                    borderBottom: "0px",
                    borderTopLeftRadius: 12,
                    borderTopRightRadius: 12,
                    borderBottomLeftRadius: 0,
                    borderBottomRightRadius: 0,
                  },
                },
                panel: {
                  flex: 1,
                },
                item: {
                  margin: "0 !important",
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                },
              })}
            >
              <Flex mt={"md"} mb={"md"} align={"center"} justify={"end"} gap={"sm"}>
                <Button
                  variant="subtle"
                  color="gray"
                  fw={700}
                  onClick={handleRemoveFilter}
                >
                  Clear Filters
                </Button>

                <Button
                  fw={700}
                  onClick={async () => {
                    await saveFilters();
                    await fetchCaughtProspects();
                  }}
                  disabled={!needsSave}
                >
                  {saveAsNothing ? "Save with no filters" : "Save filters"}
                </Button>
              </Flex>
              <Flex gap={"md"}>
                <Accordion.Item
                  value="accountData"
                  my={"md"}
                  sx={{ borderBottom: "0px" }}
                >
                  <Accordion.Control
                    sx={{ borderRadius: 12 }}
                    onClick={() => handleAccordion("account")}
                  >
                    
                    <Flex justify={"space-between"} align={"center"}>
                      <Title order={4}>Account Data</Title>
                      <Title
                        style={{
                          borderRadius: "100%",
                          width: "18px",
                          height: "18px",
                          fontSize: "10px",
                          alignItems: "center",
                          display: "flex",
                          justifyContent: "center",
                          textAlign: "center",
                          background:
                            accordion === "account" ? "#3c85ee" : "#eceaee",
                          color: accordion === "account" ? "white" : "",
                        }}
                      >
                        {AccoundData_Count}
                      </Title>
                    </Flex>
                  </Accordion.Control>
                  <Accordion.Panel
                    bg={"white"}
                    sx={{
                      border: "1.5px solid #c8ddfa",
                      borderBottomLeftRadius: 12,
                      borderBottomRightRadius: 12,
                    }}
                  >
                    <Title order={6} color="#8a8891" mt={"md"}>
                      EXCLUDE BY{" "}
                    </Title>
                    <Accordion
                      value={companyValue}
                      style={{
                        border: "1px solid #eceaee",
                        borderBottom: "0px",
                        borderRadius: "6px",
                      }}
                      mt={"md"}
                      onChange={(e) => {
                        setCompanyValue(e);
                      }}
                    >
                      <Accordion.Item value="companyName">
                        <Accordion.Control style={{ color: "#5b5b5b" }}>
                          Company Names
                        </Accordion.Control>
                        <Accordion.Panel>
                          <MultiSelect
                            withinPortal
                            variant={
                              selectedCompanies.length ? "unstyled" : "default"
                            }
                            data={companyNames}
                            rightSection={<></>}
                            placeholder="Company Names"
                            searchable
                            creatable
                            value={selectedCompanies}
                            onChange={(value: any) => {
                              setSelectedCompanies(value);
                              setNeedsSave(true);
                              setSaveAsNothing(false);
                            }}
                            getCreateLabel={(query) =>
                              `+ Add a filter for ${query}`
                            }
                            onCreate={(query: any) => {
                              const item: any = { value: query, label: query };
                              setCompanyNames((current: any) => [
                                ...current,
                                item,
                              ]);
                              return item;
                            }}
                            searchValue={companySearchValue}
                            onSearchChange={(query) => {
                              // If search value includes any newlines, add those items
                              let newValue = query;
                              let newCompanyNames: {
                                value: string;
                                label: string;
                              }[] = [];

                              const matches = [...query.matchAll(/(.*?)\\n/gm)];
                              for (const match of matches) {
                                newCompanyNames.push({
                                  value: match[1],
                                  label: match[1],
                                });
                                newValue = newValue.replace(match[0], "");
                              }

                              // If there are more than 4 being added, add the last input to the list as well
                              if (matches.length > 4) {
                                newCompanyNames.push({
                                  value: newValue,
                                  label: newValue,
                                });
                                newValue = "";
                              }

                              if (matches.length > 0) {
                                setCompanyNames((current) => [
                                  ...current,
                                  ...newCompanyNames,
                                ]);
                                setSelectedCompanies((current) => [
                                  ...current,
                                  ...newCompanyNames.map((x) => x.value),
                                ]);
                                setNeedsSave(true);
                                setSaveAsNothing(false);
                              }
                              setCompanySearchValue(newValue);
                            }}
                          />
                        </Accordion.Panel>
                      </Accordion.Item>
                    </Accordion>

                    {/* Company Keywords */}
                    <Accordion
                      value={keywordsValue}
                      style={{
                        border: "1px solid #eceaee",
                        borderBottom: "0px",
                        borderRadius: "6px",
                      }}
                      mt={"md"}
                      onChange={(e) => {
                        setKeywordsValue(e);
                      }}
                    >
                      <Accordion.Item value="keywords">
                        <Accordion.Control style={{ color: "#5b5b5b" }}>
                          Keywords
                        </Accordion.Control>
                        <Accordion.Panel>
                          <MultiSelect
                            withinPortal
                            variant={
                              selectedKeywords.length ? "unstyled" : "default"
                            }
                            data={keywords}
                            placeholder="Keywords"
                            searchable
                            creatable
                            value={selectedKeywords}
                            onChange={(value: any) => {
                              setSelectedKeywords(value);
                              setNeedsSave(true);
                              setSaveAsNothing(false);
                            }}
                            getCreateLabel={(query) =>
                              `+ Add a filter for ${query}`
                            }
                            onCreate={(query: any) => {
                              const item: any = { value: query, label: query };
                              setKeywords((current: any) => [...current, item]);
                              return item;
                            }}
                            searchValue={keywordSearchValue}
                            onSearchChange={(query) => {
                              // If search value includes any newlines, add those items
                              let newValue = query;
                              let newKeywords: {
                                value: string;
                                label: string;
                              }[] = [];

                              const matches = [...query.matchAll(/(.*?)\\n/gm)];
                              for (const match of matches) {
                                newKeywords.push({
                                  value: match[1],
                                  label: match[1],
                                });
                                newValue = newValue.replace(match[0], "");
                              }

                              // If there are more than 4 being added, add the last input to the list as well
                              if (matches.length > 4) {
                                newKeywords.push({
                                  value: newValue,
                                  label: newValue,
                                });
                                newValue = "";
                              }

                              if (matches.length > 0) {
                                setKeywords((current) => [
                                  ...current,
                                  ...newKeywords,
                                ]);
                                setSelectedKeywords((current) => [
                                  ...current,
                                  ...newKeywords.map((x) => x.value),
                                ]);
                                setNeedsSave(true);
                                setSaveAsNothing(false);
                              }
                              setKeywordSearchValue(newValue);
                            }}
                          />
                        </Accordion.Panel>
                      </Accordion.Item>
                    </Accordion>

                    {/* Company Location Keywords */}
                    <Accordion
                      value={companyLocationValue}
                      style={{
                        border: "1px solid #eceaee",
                        borderBottom: "0px",
                        borderRadius: "6px",
                      }}
                      mt={"md"}
                      onChange={(e) => {
                        setCompanyLocationValue(e);
                      }}
                    >
                      <Accordion.Item value="companyLocation">
                        <Accordion.Control style={{ color: "#5b5b5b" }}>
                          Location
                        </Accordion.Control>
                        <Accordion.Panel>
                          <MultiSelect
                            withinPortal
                            variant={
                              selectedCompanyLocations.length
                                ? "unstyled"
                                : "default"
                            }
                            data={LOCATION.map((x) => ({
                              value: x,
                              label: x,
                            })).concat(companyLocations)}
                            placeholder="Location"
                            searchable
                            creatable
                            value={selectedCompanyLocations}
                            onChange={(value: any) => {
                              setSelectedCompanyLocations(value);
                              setNeedsSave(true);
                              setSaveAsNothing(false);
                            }}
                            getCreateLabel={(query) =>
                              `+ Add a filter for ${query}`
                            }
                            onCreate={(query: any) => {
                              const item: any = { value: query, label: query };
                              setCompanyLocations((current: any) => [
                                ...current,
                                item,
                              ]);
                              return item;
                            }}
                            searchValue={companyLocationSearchValue}
                            onSearchChange={(query) => {
                              // If search value includes any newlines, add those items
                              let newValue = query;
                              let newKeywords: {
                                value: string;
                                label: string;
                              }[] = [];

                              const matches = [...query.matchAll(/(.*?)\\n/gm)];
                              for (const match of matches) {
                                newKeywords.push({
                                  value: match[1],
                                  label: match[1],
                                });
                                newValue = newValue.replace(match[0], "");
                              }

                              // If there are more than 4 being added, add the last input to the list as well
                              if (matches.length > 4) {
                                newKeywords.push({
                                  value: newValue,
                                  label: newValue,
                                });
                                newValue = "";
                              }

                              if (matches.length > 0) {
                                setCompanyLocations((current) => [
                                  ...current,
                                  ...newKeywords,
                                ]);
                                setSelectedCompanyLocations((current) => [
                                  ...current,
                                  ...newKeywords.map((x) => x.value),
                                ]);
                                setNeedsSave(true);
                                setSaveAsNothing(false);
                              }
                              setCompanyLocationSearchValue(newValue);
                            }}
                          />
                        </Accordion.Panel>
                      </Accordion.Item>
                    </Accordion>

                    {/* Company Industry */}
                    <Accordion
                      value={companyIndustryValue}
                      style={{
                        border: "1px solid #eceaee",
                        borderBottom: "0px",
                        borderRadius: "6px",
                      }}
                      mt={"md"}
                      onChange={(e) => {
                        setCompanyIndustryValue(e);
                      }}
                    >
                      <Accordion.Item value="companyIndustry">
                        <Accordion.Control style={{ color: "#5b5b5b" }}>
                          Industry
                        </Accordion.Control>
                        <Accordion.Panel>
                          <MultiSelect
                            withinPortal
                            variant={
                              selectedCompanyIndustries.length
                                ? "unstyled"
                                : "default"
                            }
                            data={INDUSTRIES.map((x) => ({
                              value: x,
                              label: x,
                            })).concat(companyIndustries)}
                            placeholder="Industry"
                            searchable
                            creatable
                            value={selectedCompanyIndustries}
                            onChange={(value: any) => {
                              setSelectedCompanyIndustries(value);
                              setNeedsSave(true);
                              setSaveAsNothing(false);
                            }}
                            getCreateLabel={(query) =>
                              `+ Add a filter for ${query}`
                            }
                            onCreate={(query: any) => {
                              const item: any = { value: query, label: query };
                              setCompanyIndustries((current: any) => [
                                ...current,
                                item,
                              ]);
                              return item;
                            }}
                            searchValue={companyIndustrySearchValue}
                            onSearchChange={(query) => {
                              // If search value includes any newlines, add those items
                              let newValue = query;
                              let newKeywords: {
                                value: string;
                                label: string;
                              }[] = [];

                              const matches = [...query.matchAll(/(.*?)\\n/gm)];
                              for (const match of matches) {
                                newKeywords.push({
                                  value: match[1],
                                  label: match[1],
                                });
                                newValue = newValue
                                  .replace(match[0], "")
                                  .replace(/(^\s+|\s+$)/g, "");
                              }

                              // If there are more than 4 being added, add the last input to the list as well
                              if (matches.length > 4) {
                                newKeywords.push({
                                  value: newValue,
                                  label: newValue,
                                });
                                newValue = "";
                              }

                              if (matches.length > 0) {
                                setCompanyIndustries((current) => [
                                  ...current,
                                  ...newKeywords,
                                ]);
                                setSelectedCompanyIndustries((current) => [
                                  ...current,
                                  ...newKeywords.map((x) => x.value),
                                ]);
                                setNeedsSave(true);
                                setSaveAsNothing(false);
                              }
                              setCompanyIndustrySearchValue(newValue);
                            }}
                          />
                        </Accordion.Panel>
                      </Accordion.Item>
                    </Accordion>
                  </Accordion.Panel>
                </Accordion.Item>

                <Accordion.Item
                  value="flexibility"
                  sx={{ borderBottom: "0px" }}
                >
                  <Accordion.Control
                    sx={{
                      borderRadius: 12,
                    }}
                    onClick={() => handleAccordion("prospect")}
                  >
                    <Flex justify={"space-between"} align={"center"}>
                      <Title order={4}>Prospect Data</Title>
                      <Title
                        id="prospect"
                        style={{
                          borderRadius: "100%",
                          width: "18px",
                          height: "18px",
                          fontSize: "10px",
                          alignItems: "center",
                          display: "flex",
                          justifyContent: "center",
                          textAlign: "center",
                          background:
                            accordion === "prospect" ? "#3c85ee" : "#eceaee",
                          color: accordion === "prospect" ? "white" : "",
                        }}
                      >
                        {ProspectData_Count}
                      </Title>
                    </Flex>
                  </Accordion.Control>
                  <Accordion.Panel
                    bg={"white"}
                    sx={{
                      border: "1.5px solid #c8ddfa",
                      borderBottomLeftRadius: 12,
                      borderBottomRightRadius: 12,
                    }}
                  >
                    {/* Prospect Title */}
                    <Title order={6} color="#8a8891" mt={"md"}>
                      EXCLUDE BY{" "}
                    </Title>
                    <Accordion
                      value={prospectTitle}
                      style={{
                        border: "1px solid #eceaee",
                        borderBottom: "0px",
                        borderRadius: "6px",
                      }}
                      mt={"md"}
                      onChange={(e) => {
                        setProspectTitleValue(e);
                      }}
                    >
                      <Accordion.Item value="prospectTitle">
                        <Accordion.Control style={{ color: "#5b5b5b" }}>
                          Title
                        </Accordion.Control>
                        <Accordion.Panel>
                          <MultiSelect
                            withinPortal
                            variant={
                              selectedProspectTitles.length
                                ? "unstyled"
                                : "default"
                            }
                            data={TITLES.map((x) => ({
                              value: x,
                              label: x,
                            })).concat(prospectTitles)}
                            rightSection={<></>}
                            placeholder="Title"
                            searchable
                            creatable
                            value={selectedProspectTitles}
                            onChange={(value: any) => {
                              setSelectedProspectTitles(value);
                              setNeedsSave(true);
                              setSaveAsNothing(false);
                            }}
                            getCreateLabel={(query) =>
                              `+ Add a filter for ${query}`
                            }
                            onCreate={(query: any) => {
                              const item: any = { value: query, label: query };
                              setProspectTitles((current: any) => [
                                ...current,
                                item,
                              ]);
                              return item;
                            }}
                            searchValue={prospectTitleSearchValue}
                            onSearchChange={(query) => {
                              // If search value includes any newlines, add those items
                              let newValue = query;
                              let newKeywords: {
                                value: string;
                                label: string;
                              }[] = [];

                              const matches = [...query.matchAll(/(.*?)\\n/gm)];
                              for (const match of matches) {
                                newKeywords.push({
                                  value: match[1],
                                  label: match[1],
                                });
                                newValue = newValue.replace(match[0], "");
                              }

                              // If there are more than 4 being added, add the last input to the list as well
                              if (matches.length > 4) {
                                newKeywords.push({
                                  value: newValue,
                                  label: newValue,
                                });
                                newValue = "";
                              }

                              if (matches.length > 0) {
                                setProspectTitles((current) => [
                                  ...current,
                                  ...newKeywords,
                                ]);
                                setSelectedProspectTitles((current) => [
                                  ...current,
                                  ...newKeywords.map((x) => x.value),
                                ]);
                                setNeedsSave(true);
                                setSaveAsNothing(false);
                              }

                              setProspectTitleSearchValue(newValue);
                            }}
                            styles={{
                              rightSection: { pointerEvents: "none" },
                              label: { width: "100%" },
                            }}
                          />
                        </Accordion.Panel>
                      </Accordion.Item>
                    </Accordion>

                    <Accordion
                      value={prospectLocation}
                      mt={"md"}
                      style={{
                        border: "1px solid #eceaee",
                        borderBottom: "0px",
                        borderRadius: "6px",
                      }}
                      onChange={(e) => {
                        setProspectLocationValue(e);
                      }}
                    >
                      <Accordion.Item value="prospectLocation">
                        <Accordion.Control style={{ color: "#5b5b5b" }}>
                          Location
                        </Accordion.Control>
                        <Accordion.Panel>
                          <MultiSelect
                            withinPortal
                            variant={
                              selectedProspectLocations.length
                                ? "unstyled"
                                : "default"
                            }
                            rightSection={<></>}
                            data={LOCATION.map((x) => ({
                              value: x,
                              label: x,
                            })).concat(prospectLocations)}
                            placeholder="Location"
                            searchable
                            creatable
                            value={selectedProspectLocations}
                            onChange={(value: any) => {
                              setSelectedProspectLocations(value);
                              setNeedsSave(true);
                              setSaveAsNothing(false);
                            }}
                            getCreateLabel={(query) =>
                              `+ Add a filter for ${query}`
                            }
                            onCreate={(query: any) => {
                              const item: any = { value: query, label: query };
                              setProspectLocations((current: any) => [
                                ...current,
                                item,
                              ]);
                              return item;
                            }}
                            searchValue={prospectLocationSearchValue}
                            onSearchChange={(query) => {
                              // If search value includes any newlines, add those items
                              let newValue = query;
                              let newKeywords: {
                                value: string;
                                label: string;
                              }[] = [];

                              const matches = [...query.matchAll(/(.*?)\\n/gm)];
                              for (const match of matches) {
                                newKeywords.push({
                                  value: match[1],
                                  label: match[1],
                                });
                                newValue = newValue.replace(match[0], "");
                              }

                              // If there are more than 4 being added, add the last input to the list as well
                              if (matches.length > 4) {
                                newKeywords.push({
                                  value: newValue,
                                  label: newValue,
                                });
                                newValue = "";
                              }

                              if (matches.length > 0) {
                                setProspectLocations((current) => [
                                  ...current,
                                  ...newKeywords,
                                ]);
                                setSelectedProspectLocations((current) => [
                                  ...current,
                                  ...newKeywords.map((x) => x.value),
                                ]);
                                setNeedsSave(true);
                                setSaveAsNothing(false);
                              }

                              setProspectLocationSearchValue(newValue);
                            }}
                          />
                        </Accordion.Panel>
                      </Accordion.Item>
                    </Accordion>

                    <Accordion
                      value={prospectName}
                      mt={"md"}
                      style={{
                        border: "1px solid #eceaee",
                        borderBottom: "0px",
                        borderRadius: "6px",
                      }}
                      onChange={(e) => {
                        setProspectNameValue(e);
                      }}
                    >
                      <Accordion.Item value="prospectName">
                        <Accordion.Control style={{ color: "#5b5b5b" }}>
                          Name
                        </Accordion.Control>
                        <Accordion.Panel>
                          <MultiSelect
                            withinPortal
                            variant={
                              selectedProspectNames.length ? "unstyled" : "default"
                            }
                            rightSection={<></>}
                            data={prospectNames}
                            placeholder="Name"
                            searchable
                            creatable
                            value={selectedProspectNames}
                            onChange={(value: any) => {
                              setSelectedProspectNames(value);
                              setNeedsSave(true);
                              setSaveAsNothing(false);
                            }}
                            getCreateLabel={(query) =>
                              `+ Add a filter for ${query}`
                            }
                            onCreate={(query: any) => {
                              const item: any = { value: query, label: query };
                              setProspectNames((current: any) => [...current, item]);
                              return item;
                            }}
                            searchValue={prospectNameSearchValue}
                            onSearchChange={(query) => {
                              // If search value includes any newlines, add those items
                              let newValue = query;
                              let newKeywords: {
                                value: string;
                                label: string;
                              }[] = [];

                              const matches = [...query.matchAll(/(.*?)\\n/gm)];
                              for (const match of matches) {
                                newKeywords.push({
                                  value: match[1],
                                  label: match[1],
                                });
                                newValue = newValue.replace(match[0], "");
                              }

                              // If there are more than 4 being added, add the last input to the list as well
                              if (matches.length > 4) {
                                newKeywords.push({
                                  value: newValue,
                                  label: newValue,
                                });
                                newValue = "";
                              }

                              if (matches.length > 0) {
                                setProspectNames((current) => [
                                  ...current,
                                  ...newKeywords,
                                ]);
                                setSelectedProspectNames((current) => [
                                  ...current,
                                  ...newKeywords.map((x) => x.value),
                                ]);
                                setNeedsSave(true);
                                setSaveAsNothing(false);
                              }

                              setProspectNameSearchValue(newValue);
                            }}
                          />
                        </Accordion.Panel>
                      </Accordion.Item>
                    </Accordion>

                    <Accordion
                      value={prospectEmail}
                      mt={"md"}
                      style={{
                        border: "1px solid #eceaee",
                        borderBottom: "0px",
                        borderRadius: "6px",
                      }}
                      onChange={(e) => {
                        setProspectEmailValue(e);
                      }}
                    >
                      <Accordion.Item value="prospectEmail">
                        <Accordion.Control style={{ color: "#5b5b5b" }}>
                          Email
                        </Accordion.Control>
                        <Accordion.Panel>
                          <MultiSelect
                            withinPortal
                            variant={
                              selectedProspectEmails.length ? "unstyled" : "default"
                            }
                            rightSection={<></>}
                            data={prospectEmails}
                            placeholder="Email"
                            searchable
                            creatable
                            value={selectedProspectEmails}
                            onChange={(value: any) => {
                              setSelectedProspectEmails(value);
                              setNeedsSave(true);
                              setSaveAsNothing(false);
                            }}
                            getCreateLabel={(query) =>
                              `+ Add a filter for ${query}`
                            }
                            onCreate={(query: any) => {
                              const item: any = { value: query, label: query };
                              setProspectEmails((current: any) => [...current, item]);
                              return item;
                            }}
                            searchValue={prospectEmailSearchValue}
                            onSearchChange={(query) => {
                              // If search value includes any newlines, add those items
                              let newValue = query;
                              let newKeywords: {
                                value: string;
                                label: string;
                              }[] = [];

                              const matches = [...query.matchAll(/(.*?)\\n/gm)];
                              for (const match of matches) {
                                newKeywords.push({
                                  value: match[1],
                                  label: match[1],
                                });
                                newValue = newValue.replace(match[0], "");
                              }

                              // If there are more than 4 being added, add the last input to the list as well
                              if (matches.length > 4) {
                                newKeywords.push({
                                  value: newValue,
                                  label: newValue,
                                });
                                newValue = "";
                              }

                              if (matches.length > 0) {
                                setProspectEmails((current) => [
                                  ...current,
                                  ...newKeywords,
                                ]);
                                setSelectedProspectEmails((current) => [
                                  ...current,
                                  ...newKeywords.map((x) => x.value),
                                ]);
                                setNeedsSave(true);
                                setSaveAsNothing(false);
                              }

                              setProspectEmailSearchValue(newValue);
                            }}
                          />
                        </Accordion.Panel>
                      </Accordion.Item>
                    </Accordion>
                  </Accordion.Panel>
                </Accordion.Item>
              </Flex>
            </Accordion>
          </Box>
          <Flex sx={{
            display: caughtProspects.filter(
                        (prospect: Prospect) =>
                          prospect.overall_status !== "REMOVED"
                      ).length === 0 ? "none" : "flex"
          }}>
            {!isViewRemovedProspects && (
                  <Alert
                    w={"100%"}
                    icon={<IconAlertCircle size="1rem" />}
                    title="Warning"
                    color="red"
                    mt='md'
                    variant="outline"
                    styles={(theme) => ({
                      root: {
                        backgroundColor: theme.colors.red[0],
                        paddingTop: 0,
                        paddingBottom: 0,
                        height: 36,
                        display: "flex",
                        alignItems: "center",
                      },
                      icon: {
                        marginRight: 0,
                      },
                      title: {
                        marginBottom: 0,
                      },
                      body: {
                        display: "flex",
                        alignItems: "center",
                        gap: "0.55rem",
                      },
                    })}
                  >
                    <Text fw={600} fz={"14"}>
                      {caughtProspects.filter(
                        (prospect: Prospect) =>
                          prospect.overall_status !== "REMOVED"
                      ).length} prospects caught in these filters
                    </Text>
                  </Alert>
                )}

                {!loading &&
            caughtProspects.filter(
              (prospect: Prospect) => prospect.overall_status !== "REMOVED"
            ).length > 0 && (
              <Flex
                justify={isViewRemovedProspects ? "end" : "space-between"}
                align={"center"}
                gap={"md"}
                ml='xs'
                mt='sm'
              >
                <Flex align={"center"} gap={"sm"}>
                  <Button
                    leftIcon={<IconRefresh size={14} />}
                    onClick={fetchCaughtProspects}
                  >
                    Refresh
                  </Button>
                  {!isViewRemovedProspects && (
                    <Button
                      color="red"
                      onClick={openProspectRemovalModal}
                      disabled={needsSave}
                      leftIcon={<IconTrash size={14} />}
                    >
                      Remove {caughtProspects.filter(
                        (prospect: Prospect) =>
                          prospect.overall_status !== "REMOVED"
                      ).length}{" "} prospects
                    </Button>
                  )}
                </Flex>
              </Flex>
            )}
          </Flex>
          <Box mt={"md"}>
            <Alert
              icon={<IconAlertCircle size="1rem" />}
              title="Warning"
              color="red"
              display={
                !needsSave && caughtProspects.length > 0 ? "none" : "block"
              }
              styles={{
                body: {
                  display: "flex",
                  gap: rem(4),
                  alignItems: "center",
                },
                message: {
                  fontWeight: 600,
                  color: theme.colors.gray[6],
                },
                title: {
                  marginBottom: 0,
                },
              }}
            >
              {needsSave
                ? "Please save filter"
                : "Please add a filter to see new prospects captured"}
            </Alert>
            <DoNotContactListCaughtProspects
              forSDR={props.forSDR}
              needsSave={needsSave}
              setCaughtProspects={setCaughtProspects}
              caughtProspects={caughtProspects.filter(
                (prospect: Prospect) => prospect.overall_status !== "REMOVED"
              )}
              loading={loading}
              setLoading={setLoading}
            />
          </Box>
        </Box>
      </Box>
      <Divider mt={"md"} />
      <Accordion
        styles={{
          control: {
            backgroundColor: "white",
          },
          content: {
            padding: "0 !important",
          },
        }}
      >
        <Accordion.Item value="customization">
          <Accordion.Control>
            <Text fw={700}>
              View{" "}
              {
                caughtProspects.filter(
                  (prospect: Prospect) => prospect.overall_status === "REMOVED"
                ).length
              }{" "}
              Removed Prospects
            </Text>{" "}
          </Accordion.Control>
          <Accordion.Panel>
            <DoNotContactListCaughtProspects
              forSDR={props.forSDR}
              needsSave={needsSave}
              setCaughtProspects={setCaughtProspects}
              caughtProspects={caughtProspects.filter(
                (prospect: Prospect) => prospect.overall_status === "REMOVED"
              )}
              loading={loading}
              setLoading={setLoading}
            />
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    </Box>
  );
}
