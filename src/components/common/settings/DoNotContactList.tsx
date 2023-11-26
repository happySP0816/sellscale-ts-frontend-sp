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
} from "@mantine/core";
import { useEffect, useState } from "react";

import { useRecoilState, useRecoilValue } from "recoil";
import { userDataState, userTokenState } from "@atoms/userAtoms";
import { showNotification } from "@mantine/notifications";
import { API_URL } from "@constants/data";
import DoNotContactListCaughtProspects from "./DoNotContactListCaughtProspects";
import {
  IconAbc,
  IconAlertCircle,
  IconKeyboard,
  IconRefresh,
} from "@tabler/icons";
import { INDUSTRIES, LOCATION, TITLES } from "./DoNotContactListConstants";
import { openConfirmModal } from "@mantine/modals";

export default function DoNotContactList(props: { forSDR?: boolean }) {
  const [userToken] = useRecoilState(userTokenState);
  const [fetchedData, setFetchedData] = useState(false);
  const [loading, setLoading] = useState(false);
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
  const [caughtProspects, setCaughtProspects] = useState([]);
  const userData = useRecoilValue(userDataState);

  // Save as nothing tracking state
  // - No clean, bug-free way to do this without a component restructure
  const [saveAsNothing, setSaveAsNothing] = useState(false);

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
            {caughtProspects.length} prospects from your SellScale pipeline.
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

  return (
    <Box m="xs" p="md">
      <Box>
        <Title order={3}>
          {props.forSDR
            ? userData.sdr_name.split(" ")[0] + "'s "
            : userData.client.company + "'s "}{" "}
          Do Not Contact Filters
        </Title>{" "}
        <Text size="sm">
          Specify criteria to exclude prospects from all current and future
          outreach.
        </Text>
      </Box>

      <Divider my="md" />
      {!loading && caughtProspects.length === 0 && (
        <Flex justify={"space-between"}>
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
      {!loading && caughtProspects.length > 0 && (
        <>
          <Flex justify={"space-between"} align={"center"} gap={"md"}>
            <Alert
              w={"100%"}
              icon={<IconAlertCircle size="1rem" />}
              title="Warning"
              color="red"
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
                {caughtProspects.length >= 500
                  ? caughtProspects.length + "+"
                  : caughtProspects.length}{" "}
                prospects caught in these filters
              </Text>
            </Alert>
            <Flex align={"center"} gap={"sm"}>
              <Button leftIcon={<IconRefresh />} onClick={fetchCaughtProspects}>
                Refresh
              </Button>
              <Button
                color="red"
                onClick={openProspectRemovalModal}
                disabled={needsSave}
              >
                Remove {caughtProspects.length} Prospects
              </Button>
            </Flex>
          </Flex>
        </>
      )}
      <Flex mt={"md"}>
        <Box
          w="25%"
          bg={"white"}
          sx={{
            borderRadius: 12,
          }}
        >
          <Accordion
            defaultValue="accountData"
            styles={(theme) => ({
              control: {
                backgroundColor: theme.colors.gray[2],

                "&[data-active]": {
                  backgroundColor: theme.colors.blue[theme.fn.primaryShade()],
                  color: theme.white,
                },
              },
            })}
          >
            <Accordion.Item value="accountData">
              <Accordion.Control
                sx={{
                  borderTopRightRadius: 12,
                  borderTopLeftRadius: 12,
                }}
              >
                <Title order={4}>Account Data</Title>
              </Accordion.Control>
              <Accordion.Panel>
                <Card withBorder mb="xs">
                  <Title order={6}>👾 Exclude by Company Names </Title>
                  <MultiSelect
                    withinPortal
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
                </Card>

                {/* Company Keywords */}
                <Card withBorder mb="xs">
                  <Title order={6}>✨ Exclude by Keywords </Title>
                  <MultiSelect
                    withinPortal
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
                      let newKeywords: { value: string; label: string }[] = [];

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
                        setKeywords((current) => [...current, ...newKeywords]);
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
                </Card>

                {/* Company Location Keywords */}
                <Card withBorder mb="xs">
                  <Title order={6}>🌍 Exclude by Company Location </Title>
                  <MultiSelect
                    withinPortal
                    mt="md"
                    data={LOCATION.map((x) => ({
                      value: x,
                      label: x,
                    })).concat(companyLocations)}
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
                      let newKeywords: { value: string; label: string }[] = [];

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
                </Card>

                {/* Company Industry */}
                <Card withBorder mb="xs">
                  <Title order={6}>🔎 Exclude by Company Industries </Title>
                  <MultiSelect
                    withinPortal
                    mt="md"
                    data={INDUSTRIES.map((x) => ({
                      value: x,
                      label: x,
                    })).concat(companyIndustries)}
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
                      let newKeywords: { value: string; label: string }[] = [];

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
                </Card>
              </Accordion.Panel>
            </Accordion.Item>

            <Accordion.Item value="flexibility">
              <Accordion.Control>
                <Title order={4}>Prospect Data</Title>
              </Accordion.Control>
              <Accordion.Panel>
                {/* Prospect Title */}
                <Card withBorder mb="xs">
                  <Title order={6}>💼 Exclude by Prospect Titles </Title>
                  <MultiSelect
                    withinPortal
                    mt="md"
                    data={TITLES.map((x) => ({ value: x, label: x })).concat(
                      prospectTitles
                    )}
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
                      let newKeywords: { value: string; label: string }[] = [];

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
                  />
                </Card>

                {/* Prospect Location */}
                <Card withBorder mb="xs">
                  <Title order={6}>🌍 Exclude by Prospect Locations </Title>
                  <MultiSelect
                    withinPortal
                    mt="md"
                    data={LOCATION.map((x) => ({
                      value: x,
                      label: x,
                    })).concat(prospectLocations)}
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
                      let newKeywords: { value: string; label: string }[] = [];

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
                </Card>
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion>

          <Flex mb="xs" px={"1rem"} direction={"column"} mt="md" gap={"sm"}>
            <Button
              size="md"
              w={"100%"}
              onClick={async () => {
                await saveFilters();
              }}
              disabled={!needsSave}
            >
              {saveAsNothing ? "Save with no filters" : "Save filters"}
            </Button>

            <Flex justify={"space-between"} align={"center"}>
              <Text color="red" size={"sm"} fw={700}>
                2026 found
              </Text>
              <Button
                variant="subtle"
                color="gray"
                size="sm"
                disabled={!needsSave}
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
          </Flex>
        </Box>
        <Box w="75%" ml="md">
          <DoNotContactListCaughtProspects
            forSDR={props.forSDR}
            needsSave={needsSave}
            setCaughtProspects={setCaughtProspects}
            caughtProspects={caughtProspects}
            loading={loading}
            setLoading={setLoading}
          />
        </Box>
      </Flex>
    </Box>
  );
}
