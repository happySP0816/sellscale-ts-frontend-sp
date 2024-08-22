import {
  Box,
  Badge,
  Checkbox,
  Flex,
  Loader,
  Modal,
  Switch,
  Table,
  Title,
  Text,
  HoverCard,
  Button,
  Popover,
  TextInput,
  Divider,
  Select,
  ActionIcon,
  ScrollArea,
} from "@mantine/core";
import { useEffect, useState } from "react";
import { ICPFitReasonV2, Prospect } from "../../index";
import { useQuery } from "@tanstack/react-query";
import { TransformedSegment } from "@pages/SegmentV3/SegmentV3";
import { API_URL } from "@constants/data";
import { useRecoilValue } from "recoil";
import { userTokenState } from "@atoms/userAtoms";
import MarketMapFilters from "@pages/SegmentV3/MarketMapFilters";
import { FaFilter } from "react-icons/fa6";
import { socket } from "../App";

interface ContactAccountFilterModalProps {
  showContactAccountFilterModal: boolean;
  setShowContactAccountFilterModal: (showModal: boolean) => void;
  segment?: TransformedSegment;
}

export type ViewMode = "ACCOUNT" | "CONTACT";

export interface TableHeader {
  key: string;
  title: string;
}

export interface ProspectAccounts {
  [key: string]: string | number;
}

export interface AIFilters {
  key: string;
  title: string;
  prompt: string;
  use_linkedin: boolean;
}

export interface ICPScoringRuleset extends ICPScoringRulesetKeys {
  client_archetype_id: number;
  dealbreakers: string[] | null;
  company_ai_filters: AIFilters[] | null;
  company_personalizers: string[] | null;
  hash: string | null;
  id: number;
  individual_ai_filters: AIFilters[];
  individual_personalizers: string[];
  segment_id: number;
}

export interface ICPScoringRulesetKeys {
  company_size_end: number | null;
  company_size_start: number | null;
  excluded_company_generalized_keywords: string[] | null;
  excluded_company_industries_keywords: string[] | null;
  excluded_company_locations_keywords: string[] | null;
  excluded_company_name_keywords: string[] | null;
  excluded_individual_education_keywords: string[] | null;
  excluded_individual_generalized_keywords: string[] | null;
  excluded_individual_industry_keywords: string[] | null;
  excluded_individual_locations_keywords: string[] | null;
  excluded_individual_seniority_keywords: string[] | null;
  excluded_individual_skills_keywords: string[] | null;
  excluded_individual_title_keywords: string[] | null;
  included_company_generalized_keywords: string[] | null;
  included_company_industries_keywords: string[] | null;
  included_company_locations_keywords: string[] | null;
  included_company_name_keywords: string[] | null;
  included_individual_education_keywords: string[] | null;
  included_individual_generalized_keywords: string[] | null;
  included_individual_industry_keywords: string[] | null;
  included_individual_locations_keywords: string[] | null;
  included_individual_seniority_keywords: string[] | null;
  included_individual_skills_keywords: string[] | null;
  included_individual_title_keywords: string[] | null;

  individual_years_of_experience_end: number;
  individual_years_of_experience_start: number;
}

const ContactAccountFilterModal = function({
  showContactAccountFilterModal,
  setShowContactAccountFilterModal,
  segment,
}: ContactAccountFilterModalProps) {
  const userToken = useRecoilValue(userTokenState);

  const [viewMode, setViewMode] = useState<ViewMode>("CONTACT");
  const [prospects, setProspects] = useState<Prospect[]>([]);

  // What we actually display
  const [displayProspects, setDisplayProspects] = useState<Prospect[]>([]);
  const [displayProspectAccounts, setDisplayProspectAccounts] = useState<
    ProspectAccounts[]
  >([]);

  const [filteredColumns, setFilteredColumns] = useState<Map<string, string>>(
    new Map()
  );
  const [filteredWords, setFilteredWords] = useState<string>("");

  // We are going to use sockets to update the ICP Scoring Ruleset
  // We are going to use sockets to update the prospects

  const [view20, setView20] = useState<boolean>(true);

  const [loading, setLoading] = useState(false);

  const [contactTableHeaders, setContactTableHeaders] = useState<TableHeader[]>(
    [
      { key: "icp_prospect_fit_score", title: "Score" },
      { key: "full_name", title: "Full Name" },
      { key: "title", title: "Title" },
      { key: "company", title: "Company" },
      { key: "linkedin_url", title: "Linkedin URL" },
    ]
  );

  const notFilters = [
    "full_name",
    "title",
    "company",
    "icp_prospect_fit_score",
    "icp_company_fit_score",
    "linkedin_url",
  ];

  const [companyTableHeaders, setCompanyTableHeaders] = useState<TableHeader[]>(
    [
      { key: "icp_company_fit_score", title: "Score" },
      { key: "company", title: "Account Name" },
    ]
  );

  const [selectedContacts, setSelectedContacts] = useState<Set<number>>(
    new Set()
  );
  const [selectedCompanies, setSelectedCompanies] = useState<Set<string>>(
    new Set()
  );

  // state for updating columns
  // whenever we change any columns, we add the columns name to the set
  // we then display it as TBD
  // if the column is set to empty, then we don't display the columns
  const [updatedIndividualColumns, setUpdatedIndividualColumns] = useState<
    Set<string>
  >(new Set());
  const [updatedCompanyColumns, setUpdatedCompanyColumns] = useState<
    Set<string>
  >(new Set());

  const [segmentName, setSegmentName] = useState<string>("");

  const [headerSet, setHeaderSet] = useState<Set<string>>(new Set());

  // We want to pass in the set column header to the filter component
  // if we add a new filter, we want to add it to the column
  // if we clear a filter we want to remove it from the header
  // if we update a column add it to the update columns state

  useEffect(() => {
    socket.on("update_prospect_list", async (data) => {
      await refetchICP();
      await refetch();
    });

    return () => {
      socket.off("update_prospect_list");
    };
  }, []);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["segmentProspects", segment?.id],
    queryFn: async () => {
      if (segment) {
        const response = await fetch(
          `${API_URL}/segment/${segment.id}/prospects`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${userToken}`,
            },
          }
        );

        const jsonResponse = await response.json();

        return jsonResponse.prospects;
      } else {
        return null;
      }
    },
    enabled: !!segment,
  });

  const {
    data: icp_scoring_ruleset,
    isLoading: icp_scoring_ruleset_loading,
    refetch: refetchICP,
  } = useQuery({
    queryKey: ["icpScoringRuleset", segment?.id],
    queryFn: async () => {
      if (segment) {
        const response = await fetch(
          `${API_URL}/segment/${segment.id}/icp_ruleset`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${userToken}`,
            },
          }
        );

        const jsonResponse = await response.json();

        return jsonResponse.icp_ruleset;
      }
    },
    enabled: !!segment,
  });

  const icp_scoring_ruleset_typed = icp_scoring_ruleset as ICPScoringRuleset;

  // Whenever we select a new company, we want to select the contacts that are associated with that company
  useEffect(() => {
    let finalProspects: number[] = [];

    selectedCompanies.forEach((company) => {
      const prospectIds = prospects
        .filter((prospect) => prospect.company === company)
        .map((prospect) => prospect.id);
      finalProspects = finalProspects.concat(prospectIds);
    });

    setSelectedContacts(new Set(finalProspects));
  }, [selectedCompanies]);

  useEffect(() => {
    if (icp_scoring_ruleset_typed) {
      const newContactHeaders = [
        { key: "icp_prospect_fit_score", title: "Score" },
        { key: "full_name", title: "Full Name" },
        { key: "title", title: "Title" },
        { key: "company", title: "Company" },
        { key: "linkedin_url", title: "Linkedin URL" },
      ];

      const newCompanyHeaders = [
        { key: "icp_company_fit_score", title: "Score" },
        { key: "company", title: "Account Name" },
      ];

      const company_ai_filters =
        icp_scoring_ruleset_typed.company_ai_filters ?? [];
      const individual_ai_filters =
        icp_scoring_ruleset_typed.individual_ai_filters ?? [];

      const icp_scoring_ruleset_keys = Object.keys(
        icp_scoring_ruleset_typed
      ).filter((item) => {
        return (
          item !== "individual_personalizers" &&
          item !== "company_personalizers" &&
          item !== "dealbreakers" &&
          item !== "company_ai_filters" &&
          item !== "individual_ai_filters" &&
          item !== "segment_id" &&
          item !== "client_archetype_id" &&
          item !== "id" &&
          item !== "hash"
        );
      });
      // Handling programmatic filters
      const programmaticContactHeaders: TableHeader[] = [];
      const programmaticCompanyHeaders: TableHeader[] = [];

      const set = new Set<string>(headerSet);

      icp_scoring_ruleset_keys.forEach((key) => {
        const keyType = key as keyof ICPScoringRulesetKeys;

        if (
          icp_scoring_ruleset_typed[keyType] ||
          icp_scoring_ruleset_typed[keyType] === 0
        ) {
          if (Array.isArray(icp_scoring_ruleset_typed[keyType])) {
            const array: string[] = icp_scoring_ruleset_typed[
              keyType
            ] as string[];
            if (array.length === 0) {
              return;
            }
          }

          const title = keyType
            .split("_")
            .join(" ")
            .replace("keywords", "")
            .replace("start", "")
            .replace("end", "");

          if (keyType.includes("individual")) {
            const key = keyType.replace("_start", "").replace("_end", "");
            if (!set.has(key)) {
              set.add(key);
              programmaticContactHeaders.push({
                key: key,
                title: title.replace("individual", "").replace(" ", ""),
              });
            }
          } else if (keyType.includes("company")) {
            const key = keyType.replace("_start", "").replace("_end", "");
            if (!set.has(key)) {
              set.add(key);
              programmaticCompanyHeaders.push({
                key: key,
                title: title.replace("company", "").replace(" ", ""),
              });
            }
          }
        }
      });

      const individualAIHeaders: TableHeader[] = [];
      const companyAIHeaders: TableHeader[] = [];

      // Handling AI filters
      individual_ai_filters.forEach((ai_filter) => {
        if (!set.has(ai_filter.key)) {
          set.add(ai_filter.key);
          individualAIHeaders.push({
            key: ai_filter.key,
            title: ai_filter.title,
          });
        }
      });

      company_ai_filters.forEach((ai_filter) => {
        if (!set.has(ai_filter.key)) {
          set.add(ai_filter.key);
          companyAIHeaders.push({ key: ai_filter.key, title: ai_filter.title });
        }
      });

      const tempIndividualSet = new Set<string>(
        [
          ...newContactHeaders,
          ...programmaticContactHeaders,
          ...individualAIHeaders,
        ].map((item) => item.key)
      );
      const tempCompanySet = new Set<string>(
        [
          ...newCompanyHeaders,
          ...programmaticCompanyHeaders,
          ...companyAIHeaders,
        ].map((item) => item.key)
      );
      const tempCompanyAISet = new Set<string>(
        companyAIHeaders.map((item) => item.key)
      );
      const tempIndividualAISet = new Set<string>(
        individualAIHeaders.map((item) => item.key)
      );

      set.forEach((item) => {
        const keyType = item as keyof ICPScoringRulesetKeys;

        if (item.includes("aicomp") && !tempCompanyAISet.has(item)) {
          const title = item.replace("aicomp_", "").split("_").join(" ");

          companyAIHeaders.push({ key: keyType, title: title });
        } else if (item.includes("aiind") && !tempIndividualAISet.has(item)) {
          const title = item.replace("aiind_", "").split("_").join(" ");

          individualAIHeaders.push({ key: keyType, title: title });
        } else if (
          item.includes("individual") &&
          !tempIndividualSet.has(item)
        ) {
          const title = item
            .split("_")
            .join(" ")
            .replace("keywords", "")
            .replace("start", "")
            .replace("end", "");
          const key = keyType.replace("_start", "").replace("_end", "");

          programmaticContactHeaders.push({
            key: key,
            title: title.replace("individual", "").replace(" ", ""),
          });
        } else if (item.includes("company") && !tempCompanySet.has(item)) {
          const title = item
            .split("_")
            .join(" ")
            .replace("keywords", "")
            .replace("start", "")
            .replace("end", "");
          const key = keyType.replace("_start", "").replace("_end", "");

          programmaticCompanyHeaders.push({
            key: key,
            title: title.replace("company", "").replace(" ", ""),
          });
        }
      });

      setContactTableHeaders([
        ...newContactHeaders,
        ...programmaticContactHeaders,
        ...individualAIHeaders,
      ]);
      setCompanyTableHeaders([
        ...newCompanyHeaders,
        ...programmaticCompanyHeaders,
        ...companyAIHeaders,
      ]);
      setHeaderSet((prevState) => new Set([...prevState, ...set]));
    }
  }, [icp_scoring_ruleset, icp_scoring_ruleset_typed, prospects]);

  useEffect(() => {
    if (data) {
      const prospectData = data as Prospect[];

      const prospectSorted = [...prospectData].sort((a, b) => {
        const individual_fit_score =
          b.icp_prospect_fit_score - a.icp_prospect_fit_score;

        if (individual_fit_score !== 0) {
          return individual_fit_score;
        }

        const individual_fit_reason: number =
          a.icp_fit_reason_v2 && !b.icp_fit_reason_v2
            ? -1
            : !a.icp_fit_reason_v2 && b.icp_fit_reason_v2
              ? 1
              : !a.icp_fit_reason_v2 && !b.icp_fit_reason_v2
                ? 0
                : Object.keys(b.icp_fit_reason_v2).length -
                Object.keys(a.icp_fit_reason_v2).length;

        if (individual_fit_reason !== 0) {
          return individual_fit_reason;
        }

        return a.full_name.localeCompare(b.full_name);
      });

      setProspects(prospectSorted);
    }
  }, [data]);

  useEffect(() => {
    if (prospects) {
      let currentProspects = prospects.filter((prospect) => {
        if (filteredWords === "") {
          return true;
        }

        let answer = false;

        if (prospect.full_name) {
          answer =
            answer ||
            prospect.full_name
              .toLowerCase()
              .includes(filteredWords.toLowerCase());
        }

        if (prospect.company) {
          answer =
            answer ||
            prospect.company
              .toLowerCase()
              .includes(filteredWords.toLowerCase());
        }

        if (prospect.title) {
          answer =
            answer ||
            prospect.title.toLowerCase().includes(filteredWords.toLowerCase());
        }

        return answer;
      });

      filteredColumns.forEach((value, key) => {
        if (!value || value === "") {
          return;
        }
        if (key === "icp_prospect_fit_score") {
          currentProspects = currentProspects.filter(
            (prospect) => prospect.icp_prospect_fit_score === parseInt(value)
          );
        } else if (key === "icp_company_fit_score") {
          currentProspects = currentProspects.filter(
            (prospect) => prospect.icp_company_fit_score === parseInt(value)
          );
        } else {
          const keyType = key as keyof ICPFitReasonV2;

          if (contactTableHeaders.find((header) => header.key === key)) {
            currentProspects = currentProspects.filter((prospect) => {
              const icp_fit_reason = prospect.icp_fit_reason_v2;
              if (!icp_fit_reason) {
                return false;
              }

              if (!icp_fit_reason[keyType]) {
                return false;
              }
              return icp_fit_reason[keyType].answer === value;
            });
          } else {
            currentProspects = currentProspects.filter((prospect) => {
              const icp_company_fit_reason = prospect.icp_company_fit_reason;
              if (!icp_company_fit_reason) {
                return false;
              }

              if (!icp_company_fit_reason[keyType]) {
                return false;
              }
              return icp_company_fit_reason[keyType].answer === value;
            });
          }
        }
      });

      if (view20) {
        currentProspects = currentProspects.slice(0, 20);
      }

      const finalCompanyData: ProspectAccounts[] = [];
      const companySet = new Set();

      const accountSorted = [...currentProspects].sort((a, b) => {
        const company_fit_score =
          b.icp_company_fit_score - a.icp_company_fit_score;

        if (company_fit_score !== 0) {
          return company_fit_score;
        }

        const company_fit_reason =
          a.icp_company_fit_reason && !b.icp_company_fit_reason
            ? -1
            : !a.icp_company_fit_reason && b.icp_company_fit_reason
              ? 1
              : !a.icp_company_fit_reason && !b.icp_company_fit_reason
                ? 0
                : Object.keys(b.icp_company_fit_reason).length -
                Object.keys(a.icp_company_fit_reason).length;

        if (company_fit_reason !== 0) {
          return company_fit_reason;
        }

        return a.full_name.localeCompare(b.full_name);
      });

      accountSorted.forEach((prospect) => {
        const prospectCompanyName = prospect.company;

        if (!companySet.has(prospectCompanyName)) {
          companySet.add(prospectCompanyName);

          finalCompanyData.push({
            company: prospectCompanyName,
            icp_company_fit_score: prospect.icp_company_fit_score,
            prospect_id: prospect.id,
          });
        }
      });

      setDisplayProspectAccounts(finalCompanyData);
      setDisplayProspects(currentProspects);
    }
  }, [filteredColumns, view20, prospects, filteredWords]);

  // Checkbox Handlers for selecting contacts
  const handleSelectContact = (contactId: number) => {
    if (selectedContacts.has(contactId)) {
      setSelectedContacts((prevState) => {
        prevState.delete(contactId);
        return new Set(prevState);
      });
    } else {
      setSelectedContacts((prevState) => {
        prevState.add(contactId);
        return new Set(prevState);
      });
    }
  };

  const handleSelectAllContacts = () => {
    if (selectedContacts.size === displayProspects.length) {
      setSelectedContacts(new Set());
    } else {
      setSelectedContacts(
        new Set(displayProspects.map((prospect) => prospect.id))
      );
    }
  };

  // Checkbox Handlers for selecting companies
  const handleSelectCompany = (companyName: string) => {
    if (selectedCompanies.has(companyName)) {
      setSelectedCompanies((prevState) => {
        prevState.delete(companyName);
        return new Set(prevState);
      });
    } else {
      setSelectedCompanies((prevState) => {
        prevState.add(companyName);
        return new Set(prevState);
      });
    }
  };

  const handleSelectAllCompanies = () => {
    if (selectedCompanies.size === displayProspectAccounts.length) {
      setSelectedCompanies(new Set());
    } else {
      setSelectedCompanies(
        new Set(
          displayProspectAccounts.map(
            (prospectAccount) => "" + prospectAccount.company
          )
        )
      );
    }
  };

  const onSelectFilter = (key: string, value: string) => {
    if (value === "") {
      setFilteredColumns((prevState) => {
        prevState.delete(key);
        return new Map(prevState);
      });
    } else {
      setFilteredColumns((prevState) => {
        prevState.set(key, value);
        return new Map(prevState);
      });
    }
  };

  const onClickCreateSegment = async () => {
    const response = await fetch(
      `${API_URL}/segment/${segment?.id}/create-segment-from-market-map`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          segment_title: segmentName,
          prospects: Array.from(selectedContacts),
        }),
      }
    );

    const jsonResponse = await response.json();

    if (jsonResponse.status === 200) {
      setLoading(false);
      setSegmentName("");
      setSelectedContacts(new Set());
      return setShowContactAccountFilterModal(false);
    }
  };

  return (
    <Modal
      onClose={() => setShowContactAccountFilterModal(false)}
      opened={showContactAccountFilterModal}
      size={"1100px"}
      style={{ maxHeight: "700px", maxWidth: "1100px" }}
      title={
        <Flex justify={"space-between"} gap={"36px"}>
          <Title order={3} style={{ maxWidth: "300px" }}>
            {segment?.is_market_map
              ? segment.segment_title + " Market Map View"
              : segment?.segment_title + " Segment View"}
          </Title>

          <Popover
            width={400}
            position="bottom"
            withArrow
            shadow="md"
            withinPortal
          >
            <Popover.Target>
              <Button>Create Segment From Selected Prospects</Button>
            </Popover.Target>
            <Popover.Dropdown>
              <Flex direction={"column"} gap={"24px"}>
                <TextInput
                  value={segmentName}
                  label={"Segment Name"}
                  onChange={(event) =>
                    setSegmentName(event.currentTarget.value)
                  }
                ></TextInput>
                <Button
                  onClick={() => {
                    setLoading(true);
                    onClickCreateSegment();
                  }}
                  disabled={loading}
                >
                  {loading ? <Loader /> : "Create Segment"}
                </Button>
              </Flex>
            </Popover.Dropdown>
          </Popover>
        </Flex>
      }
    >
      <Flex gap={"8px"}>
        {isLoading && <Loader />}
        {!isLoading && icp_scoring_ruleset && (
          <MarketMapFilters
            prospects={prospects}
            viewMode={viewMode}
            icp_scoring_ruleset={icp_scoring_ruleset}
            selectedContacts={selectedContacts}
            segment_id={segment?.id}
            setCompanyTableHeaders={setCompanyTableHeaders}
            setContactTableHeaders={setContactTableHeaders}
            setUpdatedCompanyColumns={setUpdatedCompanyColumns}
            setHeaderSet={setHeaderSet}
            headerSet={headerSet}
            setViewMode={setViewMode}
            setUpdatedIndividualColumns={setUpdatedIndividualColumns}
          />
        )}
        <Divider orientation={"vertical"} />
        <Flex direction={"column"} gap={"8px"}>
          <Flex gap={"4px"} align={"end"} justify="space-between">
            <TextInput
              label={"Global Search"}
              placeholder={"Search for a specific name / company / title"}
              value={filteredWords}
              onChange={(event) => setFilteredWords(event.currentTarget.value)}
              style={{ minWidth: "85%" }}
            />

            <Switch
              size={"xl"}
              onLabel={"View All"}
              offLabel={"View 20"}
              checked={!view20}
              onChange={(event) => {
                setView20(!event.currentTarget.checked);
              }}
            />
          </Flex>
          <ScrollArea w={800} h={700}>
            {icp_scoring_ruleset_typed && (
              <Box>
                {!isLoading && viewMode === "ACCOUNT" ? (
                  <Table style={{ overflow: "scroll" }} verticalSpacing={"sm"}>
                    <thead>
                      <tr>
                        <th>
                          <Checkbox
                            checked={
                              selectedCompanies.size ===
                              displayProspectAccounts.length
                            }
                            onChange={() => handleSelectAllCompanies()}
                          />
                        </th>
                        {icp_scoring_ruleset_typed &&
                          companyTableHeaders.map((item) => {
                            return (
                              <th key={item.key}>
                                <Flex
                                  align={"center"}
                                  justify={"space-between"}
                                >
                                  <Flex direction={"column"}>
                                    {item.title}
                                    {icp_scoring_ruleset_typed.company_personalizers?.includes(
                                      item.key
                                    ) && (
                                        <span
                                          style={{
                                            fontStyle: "italic",
                                            fontSize: "x-small",
                                          }}
                                        >
                                          Personalizer: ✅
                                        </span>
                                      )}
                                    {icp_scoring_ruleset_typed.dealbreakers?.includes(
                                      item.key
                                    ) && (
                                        <span
                                          style={{
                                            fontStyle: "italic",
                                            fontSize: "x-small",
                                          }}
                                        >
                                          Dealbreaker: ✅
                                        </span>
                                      )}
                                  </Flex>
                                  {(!notFilters.includes(item.key) ||
                                    item.title === "Score") && (
                                      <Popover
                                        width={400}
                                        position="bottom"
                                        withArrow
                                        shadow="md"
                                        withinPortal
                                      >
                                        <Popover.Target>
                                          <ActionIcon>
                                            <FaFilter
                                              color={
                                                filteredColumns.has(item.key)
                                                  ? "lightgreen"
                                                  : "grey"
                                              }
                                            />
                                          </ActionIcon>
                                        </Popover.Target>
                                        <Popover.Dropdown>
                                          <Select
                                            label={item.title}
                                            placeholder={
                                              "Select the Property that you would like to filter for"
                                            }
                                            data={
                                              item.title === "Score"
                                                ? [
                                                  {
                                                    value: "",
                                                    label: "Select",
                                                  },
                                                  {
                                                    value: "0",
                                                    label: "VERY LOW",
                                                  },
                                                  { value: "1", label: "LOW" },
                                                  {
                                                    value: "2",
                                                    label: "MEDIUM",
                                                  },
                                                  { value: "3", label: "HIGH" },
                                                  {
                                                    value: "4",
                                                    label: "VERY HIGH",
                                                  },
                                                ]
                                                : [
                                                  {
                                                    value: "",
                                                    label: "Select",
                                                  },
                                                  {
                                                    value: "YES",
                                                    label: "YES",
                                                  },
                                                  { value: "NO", label: "NO" },
                                                ]
                                            }
                                            onChange={(value) =>
                                              onSelectFilter(
                                                item.key,
                                                value ?? ""
                                              )
                                            }
                                            value={
                                              filteredColumns.get(item.key)
                                                ? (filteredColumns.get(
                                                  item.key
                                                ) as string)
                                                : ""
                                            }
                                          />
                                        </Popover.Dropdown>
                                      </Popover>
                                    )}
                                </Flex>
                              </th>
                            );
                          })}
                      </tr>
                    </thead>
                    <tbody>
                      {displayProspectAccounts.map((prospectAccount, index) => {
                        const keys = companyTableHeaders.map((h) => h.key);

                        return (
                          <tr
                            key={prospectAccount.company}
                            style={{
                              backgroundColor: selectedCompanies.has(
                                "" + prospectAccount.company
                              )
                                ? "lightcyan"
                                : "white",
                            }}
                          >
                            <td>
                              <Checkbox
                                checked={selectedCompanies.has(
                                  "" + prospectAccount.company
                                )}
                                onChange={() =>
                                  handleSelectCompany(
                                    "" + prospectAccount.company
                                  )
                                }
                              />
                            </td>
                            {keys.map((key) => {
                              if (notFilters.includes(key)) {
                                const keyType = key as keyof ProspectAccounts;

                                if (key === "icp_company_fit_score") {
                                  const prospect = prospects.find(
                                    (item) =>
                                      item.id === prospectAccount.prospect_id
                                  );

                                  if (!prospect) {
                                    return (
                                      <td
                                        key={key + prospectAccount.company}
                                        style={{
                                          minWidth: "100px",
                                          maxWidth: "300px",
                                        }}
                                      >
                                        <Text color={"orange"} weight={"bold"}>
                                          Not Scored
                                        </Text>
                                      </td>
                                    );
                                  }

                                  const trueScore =
                                    prospect.icp_company_fit_reason &&
                                    Object.keys(prospect.icp_company_fit_reason)
                                      .length > 0;

                                  let humanReadableScore = "NOT SCORED";

                                  if (prospectAccount[keyType] === 0) {
                                    humanReadableScore = "VERY LOW";
                                  } else if (prospectAccount[keyType] === 1) {
                                    humanReadableScore = "LOW";
                                  } else if (prospectAccount[keyType] === 2) {
                                    humanReadableScore = "MEDIUM";
                                  } else if (prospectAccount[keyType] === 3) {
                                    humanReadableScore = "HIGH";
                                  } else if (prospectAccount[keyType] === 4) {
                                    humanReadableScore = "VERY HIGH";
                                  }

                                  return (
                                    <td
                                      key={key + prospectAccount.company}
                                      style={{
                                        minWidth: "100px",
                                        maxWidth: "300px",
                                      }}
                                    >
                                      <HoverCard>
                                        <HoverCard.Target>
                                          <Badge
                                            color={
                                              humanReadableScore == "VERY HIGH"
                                                ? "green"
                                                : humanReadableScore == "HIGH"
                                                  ? "blue"
                                                  : humanReadableScore == "MEDIUM"
                                                    ? "yellow"
                                                    : humanReadableScore == "LOW"
                                                      ? "orange"
                                                      : humanReadableScore ==
                                                        "VERY LOW" && trueScore
                                                        ? "red"
                                                        : "gray"
                                            }
                                            fw={600}
                                          >
                                            {trueScore
                                              ? humanReadableScore
                                              : "NOT SCORED"}
                                          </Badge>
                                        </HoverCard.Target>
                                        <HoverCard.Dropdown>
                                          <Flex
                                            direction={"column"}
                                            style={{ maxWidth: "400px" }}
                                          >
                                            {prospect.icp_company_fit_reason &&
                                              Object.keys(
                                                prospect.icp_company_fit_reason
                                              ).map((key) => {
                                                const section =
                                                  prospect
                                                    .icp_company_fit_reason[
                                                  key
                                                  ];
                                                const title = key
                                                  .replace("_individual_", "_")
                                                  .replace("_company_", "_")
                                                  .replace("aicomp_", "")
                                                  .replace("aiind_", "")
                                                  .split("_")
                                                  .join(" ");

                                                if (
                                                  section.answer === "NO" &&
                                                  icp_scoring_ruleset_typed.dealbreakers?.includes(
                                                    key
                                                  )
                                                ) {
                                                  return (
                                                    <Flex key={key} gap={"4px"}>
                                                      <Text>❌</Text>
                                                      <Text size="sm">
                                                        <span
                                                          style={{
                                                            fontWeight: "bold",
                                                          }}
                                                        >
                                                          {title}
                                                        </span>
                                                        {section.reasoning
                                                          .replace("❌", "")
                                                          .replace("✅", "")}
                                                      </Text>
                                                    </Flex>
                                                  );
                                                } else if (
                                                  section.answer === "YES"
                                                ) {
                                                  return (
                                                    <Flex key={key} gap={"4px"}>
                                                      <Text>✅</Text>
                                                      <Text size="sm">
                                                        <span
                                                          style={{
                                                            fontWeight: "bold",
                                                          }}
                                                        >
                                                          {title}
                                                        </span>
                                                        {section.reasoning
                                                          .replace("❌", "")
                                                          .replace("✅", "")}
                                                      </Text>
                                                    </Flex>
                                                  );
                                                }

                                                return <></>;
                                              })}
                                          </Flex>
                                        </HoverCard.Dropdown>
                                      </HoverCard>
                                    </td>
                                  );
                                }

                                return (
                                  <td
                                    key={key + prospectAccount.company}
                                    style={{
                                      minWidth: "100px",
                                      maxWidth: "300px",
                                    }}
                                  >
                                    {prospectAccount[keyType]}
                                  </td>
                                );
                              } else {
                                const icp_company_fit_reason = prospects.find(
                                  (item) =>
                                    item.id === prospectAccount.prospect_id
                                )?.icp_company_fit_reason as ICPFitReasonV2;

                                if (!icp_company_fit_reason) {
                                  return (
                                    <td
                                      key={key + prospectAccount.company}
                                      style={{
                                        minWidth: "100px",
                                        maxWidth: "300px",
                                      }}
                                    >
                                      <Text color={"orange"} weight={"bold"}>
                                        TBD
                                      </Text>
                                    </td>
                                  );
                                }
                                const pa = {
                                  ...prospectAccount,
                                  ...icp_company_fit_reason,
                                };
                                const keyType = key as keyof typeof pa;

                                const section = icp_company_fit_reason[keyType];

                                return (
                                  <td
                                    key={key + prospectAccount.company}
                                    style={{
                                      minWidth: "100px",
                                      maxWidth: "300px",
                                    }}
                                  >
                                    {pa[keyType] &&
                                      !updatedCompanyColumns.has(key) ? (
                                      <HoverCard>
                                        <HoverCard.Target>
                                          {section.answer === "LOADING" ? (
                                            <Loader size={"xs"} />
                                          ) : (
                                            <Text
                                              color={
                                                section.answer === "YES"
                                                  ? "green"
                                                  : "red"
                                              }
                                              weight={"bold"}
                                            >
                                              {section.answer}
                                            </Text>
                                          )}
                                        </HoverCard.Target>
                                        <HoverCard.Dropdown maw={"300px"}>
                                          <Flex
                                            direction={"column"}
                                            gap={"4px"}
                                          >
                                            <Text size="sm">
                                              <span
                                                style={{ fontWeight: "bold" }}
                                              >
                                                {`Reason: `}
                                              </span>
                                              {section.reasoning}
                                            </Text>
                                            <Divider />
                                            <Text>
                                              <span
                                                style={{ fontWeight: "bold" }}
                                              >
                                                {`Source:  `}
                                              </span>
                                              {section.source}
                                            </Text>
                                          </Flex>
                                        </HoverCard.Dropdown>
                                      </HoverCard>
                                    ) : (
                                      <Text color={"orange"} weight={"bold"}>
                                        TBD
                                      </Text>
                                    )}
                                  </td>
                                );
                              }
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                ) : (
                  <Table style={{ overflow: "scroll" }} verticalSpacing={"sm"}>
                    <thead>
                      <tr>
                        <th>
                          <Checkbox
                            checked={selectedContacts.size === prospects.length}
                            onChange={() => handleSelectAllContacts()}
                          />
                        </th>
                        {icp_scoring_ruleset_typed &&
                          contactTableHeaders.map((item) => {
                            return (
                              <th key={item.title}>
                                <Flex
                                  align={"center"}
                                  justify={"space-between"}
                                >
                                  <Flex direction={"column"} justify={"center"}>
                                    {item.title}
                                    {icp_scoring_ruleset_typed.individual_personalizers?.includes(
                                      item.key
                                    ) && (
                                        <span
                                          style={{
                                            fontStyle: "italic",
                                            fontSize: "xx-small",
                                          }}
                                        >
                                          Personalizer: ✅
                                        </span>
                                      )}
                                    {icp_scoring_ruleset_typed.dealbreakers?.includes(
                                      item.key
                                    ) && (
                                        <span
                                          style={{
                                            fontStyle: "italic",
                                            fontSize: "xx-small",
                                          }}
                                        >
                                          "Dealbreaker: ✅"
                                        </span>
                                      )}
                                  </Flex>
                                  {(!notFilters.includes(item.key) ||
                                    item.title === "Score") && (
                                      <Popover
                                        width={400}
                                        position="bottom"
                                        withArrow
                                        shadow="md"
                                        withinPortal
                                      >
                                        <Popover.Target>
                                          <ActionIcon>
                                            <FaFilter
                                              color={
                                                filteredColumns.has(item.key)
                                                  ? "lightgreen"
                                                  : "grey"
                                              }
                                            />
                                          </ActionIcon>
                                        </Popover.Target>
                                        <Popover.Dropdown>
                                          <Select
                                            label={item.title}
                                            placeholder={
                                              "Select the Property that you would like to filter for"
                                            }
                                            data={
                                              item.title === "Score"
                                                ? [
                                                  {
                                                    value: "",
                                                    label: "Select",
                                                  },
                                                  {
                                                    value: "0",
                                                    label: "VERY LOW",
                                                  },
                                                  { value: "1", label: "LOW" },
                                                  {
                                                    value: "2",
                                                    label: "MEDIUM",
                                                  },
                                                  { value: "3", label: "HIGH" },
                                                  {
                                                    value: "4",
                                                    label: "VERY HIGH",
                                                  },
                                                ]
                                                : [
                                                  {
                                                    value: "",
                                                    label: "Select",
                                                  },
                                                  {
                                                    value: "YES",
                                                    label: "YES",
                                                  },
                                                  { value: "NO", label: "NO" },
                                                ]
                                            }
                                            onChange={(value) =>
                                              onSelectFilter(
                                                item.key,
                                                value ?? ""
                                              )
                                            }
                                            value={
                                              filteredColumns.get(item.key)
                                                ? (filteredColumns.get(
                                                  item.key
                                                ) as string)
                                                : ""
                                            }
                                          />
                                        </Popover.Dropdown>
                                      </Popover>
                                    )}
                                </Flex>
                              </th>
                            );
                          })}
                      </tr>
                    </thead>
                    <tbody>
                      {displayProspects
                        .slice(0, view20 ? 20 : undefined)
                        .map((prospect, index) => {
                          const keys: string[] = contactTableHeaders.map(
                            (h) => h.key
                          );
                          const p = {
                            ...prospect,
                            ...prospect.icp_fit_reason_v2,
                          };

                          return (
                            <tr
                              key={p.id}
                              style={{
                                backgroundColor: selectedContacts.has(p.id)
                                  ? "lightcyan"
                                  : "white",
                              }}
                            >
                              <td>
                                <Checkbox
                                  checked={selectedContacts.has(p.id)}
                                  onChange={() => handleSelectContact(p.id)}
                                />
                              </td>
                              {keys.map((key) => {
                                if (notFilters.includes(key)) {
                                  const keyType = key as keyof typeof p;
                                  if (key === "icp_prospect_fit_score") {
                                    const trueScore =
                                      prospect.icp_fit_reason_v2 &&
                                      Object.keys(prospect.icp_fit_reason_v2)
                                        .length > 0;

                                    let humanReadableScore = "Not Scored";

                                    if (p[keyType] === 0) {
                                      humanReadableScore = "VERY LOW";
                                    } else if (p[keyType] === 1) {
                                      humanReadableScore = "LOW";
                                    } else if (p[keyType] === 2) {
                                      humanReadableScore = "MEDIUM";
                                    } else if (p[keyType] === 3) {
                                      humanReadableScore = "HIGH";
                                    } else if (p[keyType] === 4) {
                                      humanReadableScore = "VERY HIGH";
                                    }

                                    return (
                                      <td
                                        key={key + p.id}
                                        style={{
                                          minWidth: "100px",
                                          maxWidth: "300px",
                                        }}
                                      >
                                        <HoverCard>
                                          <HoverCard.Target>
                                            <Badge
                                              color={
                                                humanReadableScore ==
                                                  "VERY HIGH"
                                                  ? "green"
                                                  : humanReadableScore == "HIGH"
                                                    ? "blue"
                                                    : humanReadableScore ==
                                                      "MEDIUM"
                                                      ? "yellow"
                                                      : humanReadableScore == "LOW"
                                                        ? "orange"
                                                        : humanReadableScore ==
                                                          "VERY LOW" && trueScore
                                                          ? "red"
                                                          : "gray"
                                              }
                                              fw={600}
                                            >
                                              {trueScore
                                                ? humanReadableScore
                                                : "NOT SCORED"}
                                            </Badge>
                                          </HoverCard.Target>
                                          <HoverCard.Dropdown>
                                            <Flex
                                              direction={"column"}
                                              style={{ maxWidth: "400px" }}
                                            >
                                              {prospect.icp_fit_reason_v2 &&
                                                Object.keys(
                                                  prospect.icp_fit_reason_v2
                                                ).map((key) => {
                                                  const section =
                                                    prospect.icp_fit_reason_v2[
                                                    key
                                                    ];
                                                  const title = key
                                                    .replace(
                                                      "_individual_",
                                                      "_"
                                                    )
                                                    .replace("_company_", "_")
                                                    .replace("aicomp_", "")
                                                    .replace("aiind_", "")
                                                    .split("_")
                                                    .join(" ");

                                                  if (
                                                    section.answer === "NO" &&
                                                    icp_scoring_ruleset_typed.dealbreakers?.includes(
                                                      key
                                                    )
                                                  ) {
                                                    return (
                                                      <Flex
                                                        key={key}
                                                        gap={"4px"}
                                                      >
                                                        <Text>❌</Text>
                                                        <Text size="sm">
                                                          <span
                                                            style={{
                                                              fontWeight:
                                                                "bold",
                                                            }}
                                                          >
                                                            {title}
                                                          </span>
                                                          {section.reasoning
                                                            .replace("❌", "")
                                                            .replace("✅", "")}
                                                        </Text>
                                                      </Flex>
                                                    );
                                                  } else if (
                                                    section.answer === "YES"
                                                  ) {
                                                    return (
                                                      <Flex
                                                        key={key}
                                                        gap={"4px"}
                                                      >
                                                        <Text>✅</Text>
                                                        <Text size="sm">
                                                          <span
                                                            style={{
                                                              fontWeight:
                                                                "bold",
                                                            }}
                                                          >
                                                            {title}
                                                          </span>
                                                          {section.reasoning
                                                            .replace("❌", "")
                                                            .replace("✅", "")}
                                                        </Text>
                                                      </Flex>
                                                    );
                                                  }

                                                  return <></>;
                                                })}
                                            </Flex>
                                          </HoverCard.Dropdown>
                                        </HoverCard>
                                      </td>
                                    );
                                  }
                                  return (
                                    <td
                                      key={key + p.id}
                                      style={{
                                        minWidth: "100px",
                                        maxWidth: "300px",
                                      }}
                                    >
                                      <Text>{p[keyType]}</Text>
                                    </td>
                                  );
                                } else {
                                  const keyType = key as keyof typeof p;
                                  return (
                                    <td
                                      key={key + p.id}
                                      style={{
                                        minWidth: "100px",
                                        maxWidth: "300px",
                                      }}
                                    >
                                      {p[keyType] &&
                                        !updatedIndividualColumns.has(key) ? (
                                        <HoverCard>
                                          <HoverCard.Target>
                                            {p[keyType].answer === "LOADING" ? (
                                              <Loader size={"xs"} />
                                            ) : (
                                              <Text
                                                color={
                                                  p[keyType].answer === "YES"
                                                    ? "green"
                                                    : "red"
                                                }
                                                weight={"bold"}
                                              >
                                                {p[keyType].answer}
                                              </Text>
                                            )}
                                          </HoverCard.Target>
                                          <HoverCard.Dropdown maw={"300px"}>
                                            <Flex
                                              direction={"column"}
                                              gap={"4px"}
                                            >
                                              <Text size="sm">
                                                <span
                                                  style={{ fontWeight: "bold" }}
                                                >
                                                  {`Reason: `}
                                                </span>
                                                {p[keyType].reasoning}
                                              </Text>
                                              <Divider />
                                              <Text>
                                                <span
                                                  style={{ fontWeight: "bold" }}
                                                >
                                                  {`Source:  `}
                                                </span>
                                                {p[keyType].source}
                                              </Text>
                                            </Flex>
                                          </HoverCard.Dropdown>
                                        </HoverCard>
                                      ) : (
                                        <Text color={"orange"} weight={"bold"}>
                                          TBD
                                        </Text>
                                      )}
                                    </td>
                                  );
                                }
                              })}
                            </tr>
                          );
                        })}
                    </tbody>
                  </Table>
                )}
              </Box>
            )}
          </ScrollArea>
        </Flex>
      </Flex>
    </Modal>
  );
};

export default ContactAccountFilterModal;
