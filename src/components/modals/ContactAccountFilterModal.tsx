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
  Tooltip,
  Anchor,
} from "@mantine/core";
import { useEffect, useMemo, useState } from "react";
import { ICPFitReasonV2, Prospect } from "../../index";
import { useQuery } from "@tanstack/react-query";
import { TransformedSegment } from "@pages/SegmentV3/SegmentV3";
import { API_URL } from "@constants/data";
import { useRecoilValue } from "recoil";
import { userTokenState } from "@atoms/userAtoms";
import MarketMapFilters from "@pages/SegmentV3/MarketMapFilters";
import { FaFilter } from "react-icons/fa6";
import { socket } from "../App";
import { DataRow } from "@pages/CampaignV2/ArchetypeFilterModal";
import { MantineReactTable, useMantineReactTable } from "mantine-react-table";

interface ContactAccountFilterModalProps {
  showContactAccountFilterModal: boolean;
  setShowContactAccountFilterModal: (showModal: boolean) => void;
  segment?: TransformedSegment;
}

export type ViewMode = "ACCOUNT" | "CONTACT";

export type FilterVariant =
  | "select"
  | "text"
  | "checkbox"
  | "date"
  | "autocomplete"
  | "date-range"
  | "multi-select"
  | "range"
  | "range-slider"
  | undefined;

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
  }, [filteredColumns, prospects, filteredWords]);

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

  const generatedProspectData = useMemo(() => {
    return displayProspects.map((prospect) => {
      const p = {
        ...prospect,
        ...prospect.icp_fit_reason_v2,
      };

      const row: DataRow = {};

      row["id"] = p.id;

      contactTableHeaders.forEach((item) => {
        const key = item.key;

        console.log("Key: ", key);
        console.log("Prospect: ", p);

        const keyType = key as keyof typeof p;

        console.log("Prospect value: ", p[keyType]);

        row[key] = p[keyType];
      });

      return row;
    });
  }, [displayProspects, contactTableHeaders]);

  const generatedProspectAccountData = useMemo(() => {
    return displayProspectAccounts.map((prospectAccount) => {
      const prospect = prospects.find(
        (p) => p.id === prospectAccount.prospect_id
      );

      const p = {
        ...prospect,
        ...prospect?.icp_company_fit_reason,
      };

      const row: DataRow = {};

      row["id"] = p.id;

      companyTableHeaders.forEach((item) => {
        const key = item.key;

        const keyType = key as keyof typeof p;

        row[key] = p[keyType];
      });

      return row;
    });
  }, [prospects, companyTableHeaders, displayProspectAccounts]);

  const generatedProspectColumns = useMemo(() => {
    if (!icp_scoring_ruleset_typed) {
      return [];
    }

    return contactTableHeaders.map((item) => {
      return {
        header: item.title,
        accessorKey: item.key,
        mantineTableHeadCellProps: {
          style: {
            borderRight: "1px solid #ddd", // Add border to the right of the header cell
          },
        },
        mantineTableBodyCellProps: {
          style: {
            borderRight: "1px solid #ddd", // Add border to the right of the body cell
          },
        },
        size:
          item.key === "icp_prospect_fit_score" || item.key === "full_name"
            ? 150
            : 250,
        enableColumnFilter:
          item.key === "icp_prospect_fit_score" ||
          !notFilters.includes(item.key),
        filterVariant: "select" as FilterVariant,
        filterFn: (row: any, id: any, filterValue: string) => {
          let value = row.getValue(id);
          if (item.key === "icp_prospect_fit_score") {
            let numeric = 4;
            switch (filterValue) {
              case "VERY HIGH":
                numeric = 4;
                break;
              case "HIGH":
                numeric = 3;
                break;
              case "MEDIUM":
                numeric = 2;
                break;
              case "LOW":
                numeric = 1;
                break;
              default:
                numeric = 0;
            }

            return numeric === value;
          } else {
            return value.answer === filterValue;
          }
        },
        mantineFilterSelectProps: {
          data:
            item.key === "icp_prospect_fit_score"
              ? ["VERY HIGH", "HIGH", "MEDIUM", "LOW", "VERY LOW"]
              : ["YES", "NO"],
        },
        Header: () => {
          return (
            <Flex
              align={"center"}
              gap={"3px"}
              style={{ width: "fit-content" }}
              direction={"column"}
            >
              <Text ta={"center"}>{item.title}</Text>
              <Flex align={"center"}>
                {icp_scoring_ruleset_typed.individual_personalizers?.includes(
                  item.key
                ) && (
                    <Badge size={"xs"} color={"green"}>
                      Personalizer
                    </Badge>
                  )}
                {icp_scoring_ruleset_typed.dealbreakers?.includes(item.key) && (
                  <Badge size={"xs"} color={"red"}>
                    Dealbreaker
                  </Badge>
                )}
              </Flex>
            </Flex>
          );
        },
        Cell: ({ cell }: { cell: any }) => {
          const value = cell.getValue();

          const prospect = prospects.find(
            (prospect) => prospect.id === cell.row.original["id"]
          );

          if (!prospect) {
            return "";
          }

          if (notFilters.includes(item.key)) {
            const p = {
              ...prospect,
              ...prospect.icp_fit_reason_v2,
            };

            const keyType = item.key as keyof typeof p;
            if (item.key === "icp_prospect_fit_score") {
              const trueScore =
                prospect.icp_fit_reason_v2 &&
                Object.keys(prospect.icp_fit_reason_v2).length > 0;

              let humanReadableScore = "Not Scored";

              if (value === 0) {
                humanReadableScore = "VERY LOW";
              } else if (value === 1) {
                humanReadableScore = "LOW";
              } else if (value === 2) {
                humanReadableScore = "MEDIUM";
              } else if (value === 3) {
                humanReadableScore = "HIGH";
              } else if (value === 4) {
                humanReadableScore = "VERY HIGH";
              }

              let positiveCount = 0;

              if (prospect.icp_fit_reason_v2) {
                positiveCount = Object.values(
                  prospect.icp_fit_reason_v2
                ).filter((prospect) => prospect.answer === "YES").length;
              }

              let total = prospect.icp_fit_reason_v2
                ? Object.values(prospect.icp_fit_reason_v2).length
                : 1;

              return (
                <Tooltip
                  label={
                    <Flex
                      direction={"column"}
                      style={{ maxWidth: "400px", textWrap: "wrap" }}
                    >
                      <Flex gap={"4px"}>
                        <Text size={"md"} fw={"bold"}>
                          Prospect Score
                        </Text>
                        <Text color={"red"} fw={"bold"} size={"md"}>
                          {`(${positiveCount} /  ${total})`}
                        </Text>
                      </Flex>
                      {prospect.icp_fit_reason_v2 &&
                        Object.keys(prospect.icp_fit_reason_v2).map((key) => {
                          const section = prospect.icp_fit_reason_v2[key];
                          const title = key
                            .replace("_individual_", "_")
                            .replace("_company_", "_")
                            .replace("aicomp_", "")
                            .replace("aiind_", "")
                            .replace("keywords", "")
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
                                    {title}:
                                  </span>
                                  {section.reasoning
                                    .replace("❌", "")
                                    .replace("✅", "")}
                                </Text>
                              </Flex>
                            );
                          } else if (section.answer === "YES") {
                            return (
                              <Flex key={key} gap={"4px"}>
                                <Text>✅</Text>
                                <Text size="sm">
                                  <span
                                    style={{
                                      fontWeight: "bold",
                                    }}
                                  >
                                    {title}:
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
                  }
                >
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
                              : humanReadableScore == "VERY LOW" && trueScore
                                ? "red"
                                : "gray"
                    }
                    fw={600}
                  >
                    {trueScore ? humanReadableScore : "NOT SCORED"}
                  </Badge>
                </Tooltip>
              );
            } else if (item.key === "linkedin_url") {
              return (
                <Anchor href="value" target="_blank">
                  {value}
                </Anchor>
              );
            }
            return <Text style={{ maxHeight: "2em" }}>{p[keyType]}</Text>;
          } else {
            if (value) {
              return !updatedIndividualColumns.has(item.key) ? (
                <HoverCard>
                  <HoverCard.Target>
                    {value.answer === "LOADING" ? (
                      <Loader size={"xs"} />
                    ) : (
                      <Text
                        color={value.answer === "YES" ? "green" : "red"}
                        weight={"bold"}
                      >
                        {value.answer}
                      </Text>
                    )}
                  </HoverCard.Target>
                  <HoverCard.Dropdown maw={"300px"}>
                    <Flex direction={"column"} gap={"4px"}>
                      <Text size="sm">
                        <span style={{ fontWeight: "bold" }}>{`Reason: `}</span>
                        {value.reasoning}
                      </Text>
                      <Divider />
                      <Text>
                        <span style={{ fontWeight: "bold" }}>
                          {`Source:  `}
                        </span>
                        {value.source}
                      </Text>
                    </Flex>
                  </HoverCard.Dropdown>
                </HoverCard>
              ) : (
                <Text color={"orange"} weight={"bold"}>
                  TBD
                </Text>
              );
            } else {
              return "";
            }
          }
        },
      };
    });
  }, [prospects, updatedIndividualColumns, icp_scoring_ruleset_typed]);

  const generatedProspectAccountColumns = useMemo(() => {
    if (!icp_scoring_ruleset_typed) {
      return [];
    }

    return companyTableHeaders.map((item) => {
      return {
        header: item.title,
        accessorKey: item.key,
        mantineTableHeadCellProps: {
          style: {
            borderRight: "1px solid #ddd", // Add border to the right of the header cell
          },
        },
        mantineTableBodyCellProps: {
          style: {
            borderRight: "1px solid #ddd", // Add border to the right of the body cell
          },
        },
        size: item.key === "icp_company_fit_score" ? 150 : 250,
        enableColumnFilter:
          item.key === "icp_company_fit_score" ||
          !notFilters.includes(item.key),
        filterVariant: "select" as FilterVariant,
        filterFn: (row: any, id: any, filterValue: string) => {
          let value = row.getValue(id);
          if (item.key === "icp_company_fit_score") {
            let numeric = 4;
            switch (filterValue) {
              case "VERY HIGH":
                numeric = 4;
                break;
              case "HIGH":
                numeric = 3;
                break;
              case "MEDIUM":
                numeric = 2;
                break;
              case "LOW":
                numeric = 1;
                break;
              default:
                numeric = 0;
            }

            return numeric === value;
          } else {
            return value.answer === filterValue;
          }
        },
        mantineFilterSelectProps: {
          data:
            item.key === "icp_company_fit_score"
              ? ["VERY HIGH", "HIGH", "MEDIUM", "LOW", "VERY LOW"]
              : ["YES", "NO"],
        },
        Header: () => {
          return (
            <Flex
              align={"center"}
              gap={"3px"}
              style={{ width: "fit-content" }}
              direction={"column"}
            >
              <Text ta={"center"}>{item.title}</Text>
              <Flex align={"center"}>
                {icp_scoring_ruleset_typed.company_personalizers?.includes(
                  item.key
                ) && (
                    <Badge size={"xs"} color={"green"}>
                      Personalizer
                    </Badge>
                  )}
                {icp_scoring_ruleset_typed.dealbreakers?.includes(item.key) && (
                  <Badge size={"xs"} color={"red"}>
                    Dealbreaker
                  </Badge>
                )}
              </Flex>
            </Flex>
          );
        },
        Cell: ({ cell }: { cell: any }) => {
          const value = cell.getValue();

          const prospect = prospects.find(
            (prospect) => prospect.id === cell.row.original["id"]
          );

          if (!prospect) {
            return "";
          }

          if (notFilters.includes(item.key)) {
            const p = {
              ...prospect,
              ...prospect.icp_company_fit_reason,
            };

            const keyType = item.key as keyof typeof p;
            if (item.key === "icp_company_fit_score") {
              const trueScore =
                prospect.icp_company_fit_reason &&
                Object.keys(prospect.icp_company_fit_reason).length > 0;

              let humanReadableScore = "Not Scored";

              if (value === 0) {
                humanReadableScore = "VERY LOW";
              } else if (value === 1) {
                humanReadableScore = "LOW";
              } else if (value === 2) {
                humanReadableScore = "MEDIUM";
              } else if (value === 3) {
                humanReadableScore = "HIGH";
              } else if (value === 4) {
                humanReadableScore = "VERY HIGH";
              }

              let positiveCount = 0;

              if (prospect.icp_company_fit_reason) {
                positiveCount = Object.values(
                  prospect.icp_company_fit_reason
                ).filter((prospect) => prospect.answer === "YES").length;
              }

              const total = prospect.icp_company_fit_reason
                ? Object.values(prospect.icp_company_fit_reason).length
                : 1;

              return (
                <Tooltip
                  label={
                    <Flex
                      direction={"column"}
                      style={{ maxWidth: "400px", textWrap: "wrap" }}
                    >
                      <Flex gap={"4px"}>
                        <Text size={"md"} fw={"bold"}>
                          Company Score
                        </Text>
                        <Text color={"red"} fw={"bold"} size={"md"}>
                          {`(${positiveCount} / ${total})`}
                        </Text>
                      </Flex>
                      {prospect.icp_company_fit_reason &&
                        Object.keys(prospect.icp_company_fit_reason).map(
                          (key) => {
                            const section =
                              prospect.icp_company_fit_reason[key];
                            const title = key
                              .replace("_individual_", "_")
                              .replace("_company_", "_")
                              .replace("aicomp_", "")
                              .replace("aiind_", "")
                              .replace("keywords", "")
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
                                      {title}:
                                    </span>
                                    {section.reasoning
                                      .replace("❌", "")
                                      .replace("✅", "")}
                                  </Text>
                                </Flex>
                              );
                            } else if (section.answer === "YES") {
                              return (
                                <Flex key={key} gap={"4px"}>
                                  <Text>✅</Text>
                                  <Text size="sm">
                                    <span
                                      style={{
                                        fontWeight: "bold",
                                      }}
                                    >
                                      {title}:
                                    </span>
                                    {section.reasoning
                                      .replace("❌", "")
                                      .replace("✅", "")}
                                  </Text>
                                </Flex>
                              );
                            }

                            return <></>;
                          }
                        )}
                    </Flex>
                  }
                >
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
                              : humanReadableScore == "VERY LOW" && trueScore
                                ? "red"
                                : "gray"
                    }
                    fw={600}
                  >
                    {trueScore ? humanReadableScore : "NOT SCORED"}
                  </Badge>
                </Tooltip>
              );
            } else if (item.key === "linkedin_url") {
              return (
                <Anchor href="value" target="_blank">
                  {value}
                </Anchor>
              );
            }
            return <Text style={{ maxHeight: "2em" }}>{p[keyType]}</Text>;
          } else {
            if (value) {
              return !updatedCompanyColumns.has(item.key) ? (
                <HoverCard>
                  <HoverCard.Target>
                    {value.answer === "LOADING" ? (
                      <Loader size={"xs"} />
                    ) : (
                      <Text
                        color={value.answer === "YES" ? "green" : "red"}
                        weight={"bold"}
                      >
                        {value.answer}
                      </Text>
                    )}
                  </HoverCard.Target>
                  <HoverCard.Dropdown maw={"300px"}>
                    <Flex direction={"column"} gap={"4px"}>
                      <Text size="sm">
                        <span style={{ fontWeight: "bold" }}>{`Reason: `}</span>
                        {value.reasoning}
                      </Text>
                      <Divider />
                      <Text>
                        <span style={{ fontWeight: "bold" }}>
                          {`Source:  `}
                        </span>
                        {value.source}
                      </Text>
                    </Flex>
                  </HoverCard.Dropdown>
                </HoverCard>
              ) : (
                <Text color={"orange"} weight={"bold"}>
                  TBD
                </Text>
              );
            } else {
              return "";
            }
          }
        },
      };
    });
  }, [prospects, updatedCompanyColumns, icp_scoring_ruleset_typed]);

  console.log("generatedData: ", generatedProspectData);

  const contactTable = useMantineReactTable({
    columns: generatedProspectColumns,
    data: generatedProspectData,
    enableRowSelection: true,
    getRowId: (row) => row.id,
    mantineTableContainerProps: {
      sx: {
        maxHeight: "540px",
      },
    },
    enableBottomToolbar: true,
    enableTopToolbar: false,
    enableStickyHeader: true,
    enableStickyFooter: true,
    enableColumnResizing: true,
    mantineTableProps: {
      withColumnBorders: true,
    },
  });

  const companyTable = useMantineReactTable({
    columns: generatedProspectAccountColumns,
    data: generatedProspectAccountData,
    enableRowSelection: true,
    getRowId: (row) => row.company,
    mantineTableContainerProps: {
      sx: {
        maxHeight: "540px",
      },
    },
    enableBottomToolbar: true,
    enableTopToolbar: false,
    enableStickyHeader: true,
    enableStickyFooter: true,
    enableColumnResizing: true,
    mantineTableProps: {
      withColumnBorders: true,
    },
  });

  useEffect(() => {
    //fetch data based on row selection state or something
    //
    const array = Object.keys(contactTable.getState().rowSelection).map(
      (key) => +key
    );

    setSelectedContacts(new Set(array));
  }, [contactTable.getState().rowSelection]);

  useEffect(() => {
    //fetch data based on row selection state or something
    //
    const array = Object.keys(companyTable.getState().rowSelection).map(
      (key) => key
    );

    setSelectedCompanies(new Set(array));
  }, [companyTable.getState().rowSelection]);

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
      <Flex gap={"8px"} style={{ overflowY: "hidden", height: "100%" }}>
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
        <Flex
          direction={"column"}
          gap={"8px"}
          style={{ minWidth: "750px", maxWidth: "750px" }}
        >
          <Flex gap={"4px"} align={"end"} justify="space-between">
            <TextInput
              label={"Global Search"}
              placeholder={"Search for a specific name / company / title"}
              value={filteredWords}
              onChange={(event) => setFilteredWords(event.currentTarget.value)}
              style={{ minWidth: "100%" }}
            />
          </Flex>
          {icp_scoring_ruleset_typed && (
            <Box>
              {!isLoading && viewMode === "ACCOUNT" ? (
                <MantineReactTable table={companyTable} />
              ) : (
                <MantineReactTable table={contactTable} />
              )}
            </Box>
          )}
        </Flex>
      </Flex>
    </Modal>
  );
};

export default ContactAccountFilterModal;
