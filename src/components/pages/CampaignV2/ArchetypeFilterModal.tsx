import {
  ActionIcon,
  Anchor,
  Badge,
  Box,
  Button,
  Center,
  Checkbox,
  Divider,
  Flex,
  HoverCard,
  Loader,
  Modal,
  Popover,
  ScrollArea,
  Select,
  Switch,
  Table,
  Tabs,
  Text,
  TextInput,
  Title,
  Tooltip,
} from "@mantine/core";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { API_URL } from "@constants/data";
import { useRecoilValue } from "recoil";
import { userTokenState } from "@atoms/userAtoms";
import { FaFilter } from "react-icons/fa6";
import { ICPFitReasonV2, Prospect } from "src";
import {
  FilterVariant,
  ICPScoringRuleset,
  ICPScoringRulesetKeys,
  TableHeader,
} from "@modals/ContactAccountFilterModal";
import { currentProjectState } from "@atoms/personaAtoms";
import { getICPRuleSet } from "@utils/requests/icpScoring";
import CampaignFilters from "@pages/CampaignV2/CampaignFilters";
import { socket } from "../../App";
import { showNotification } from "@mantine/notifications";
import { moveToUnassigned } from "@utils/requests/moveToUnassigned";
import { ProspectICP } from "@common/persona/Pulse";
import BulkActions from "@common/persona/BulkActions_new";
import { IconExternalLink, IconFileDownload, IconMagnet, IconTrash } from "@tabler/icons-react";
import { openConfirmModal } from "@mantine/modals";
import { CSVLink } from "react-csv";
import CustomResearchPointCard from "@common/persona/CustomResearchPointCard";
import { useDisclosure } from "@mantine/hooks";
import generate from "@babel/generator";
import { MantineReactTable, useMantineReactTable } from "mantine-react-table";
import { IconBrandLinkedin } from "@tabler/icons";

interface ContactAccountFilterModalProps {
  showContactAccountFilterModal: boolean;
  setShowContactAccountFilterModal: (showModal: boolean) => void;
}

export interface DataRow {
  [key: string]: any;
}

const ArchetypeFilterModal = function({
  showContactAccountFilterModal,
  setShowContactAccountFilterModal,
}: ContactAccountFilterModalProps) {
  const currentProject = useRecoilValue(currentProjectState);

  return (
    <Modal
      onClose={() => setShowContactAccountFilterModal(false)}
      opened={showContactAccountFilterModal}
      size={"90%"}
      style={{ maxHeight: "700px", minWidth: "2000px" }}
      title={
        <Flex justify={"space-between"} gap={"36px"}>
          <Title order={3} style={{ width: "600px" }}>
            {currentProject
              ? currentProject.name + " Filters view"
              : "Filters View"}
          </Title>
        </Flex>
      }
    >
      <ArchetypeFilters />
    </Modal>
  );
};

export const ArchetypeFilters = function({
  hideFeature = false, //for selix
}: {
  hideFeature?: boolean; // for selix
}) {
  const userToken = useRecoilValue(userTokenState);

  const [prospects, setProspects] = useState<Prospect[]>([]);

  // What we actually display
  const [displayProspects, setDisplayProspects] = useState<Prospect[]>([]);

  const [filteredColumns, setFilteredColumns] = useState<Map<string, string>>(
    new Map()
  );
  const [filteredWords, setFilteredWords] = useState<string>("");

  const [displayScore, setDisplayScore] = useState<string | null>("5");

  // We are going to use sockets to update the ICP Scoring Ruleset
  // We are going to use sockets to update the prospects

  const currentProject = useRecoilValue(currentProjectState);

  const [contactTableHeaders, setContactTableHeaders] = useState<TableHeader[]>(
    [
      { key: "icp_fit_score", title: "Score" },
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
    "icp_fit_score",
    "linkedin_url",
  ];

  const [selectedContacts, setSelectedContacts] = useState<Set<number>>(
    new Set()
  );

  const [removeProspectsLoading, setRemoveProspectsLoading] = useState(false);

  const [openedCustomPoint, customPointHandlers] = useDisclosure(false);

  // state for updating columns
  // whenever we change any columns, we add the columns name to the set
  // we then display it as TBD
  // if the column is set to empty, then we don't display the columns
  const [updatedIndividualColumns, setUpdatedIndividualColumns] = useState<
    Set<string>
  >(new Set());

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
    queryKey: ["archetypeProspects", currentProject?.id],
    queryFn: async () => {
      if (currentProject) {
        // Fetch Prospects from the campaign Id
        const response = await fetch(
          `${API_URL}/client/archetype/${currentProject.id}/prospects`,
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
    enabled: !!currentProject,
  });

  const {
    data: icp_scoring_ruleset,
    isLoading: icp_scoring_ruleset_loading,
    refetch: refetchICP,
  } = useQuery({
    queryKey: ["icpScoringRuleset", currentProject?.id],
    queryFn: async () => {
      if (currentProject) {
        const response = await getICPRuleSet(userToken, currentProject?.id);

        return response.data;
      }
    },
    enabled: !!currentProject,
  });

  const icp_scoring_ruleset_typed = icp_scoring_ruleset as ICPScoringRuleset;

  useEffect(() => {
    if (icp_scoring_ruleset_typed) {
      const newContactHeaders = [
        { key: "icp_fit_score", title: "Score" },
        { key: "full_name", title: "Full Name" },
        { key: "title", title: "Title" },
        { key: "company", title: "Company" },
        { key: "linkedin_url", title: "Linkedin URL" },
      ];

      const company_ai_filters =
        icp_scoring_ruleset_typed.company_ai_filters ?? [];
      const individual_ai_filters =
        icp_scoring_ruleset_typed.individual_ai_filters ?? [];

      // Handling programmatic filters
      const programmaticContactHeaders: TableHeader[] = [];

      const set = new Set<string>(headerSet);

      const individualAIHeaders: TableHeader[] = [];

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
          individualAIHeaders.push({
            key: ai_filter.key,
            title: ai_filter.title,
          });
        }
      });

      const tempIndividualSet = new Set<string>(
        [
          ...newContactHeaders,
          ...programmaticContactHeaders,
          ...individualAIHeaders,
        ].map((item) => item.key)
      );

      const tempIndividualAISet = new Set<string>(
        individualAIHeaders.map((item) => item.key)
      );

      set.forEach((item) => {
        const keyType = item as keyof ICPScoringRulesetKeys;

        if (item.includes("aicomp") && !tempIndividualAISet.has(item)) {
          const title = item.replace("aicomp_", "").split("_").join(" ");

          individualAIHeaders.push({ key: keyType, title: title });
        } else if (item.includes("aiind") && !tempIndividualAISet.has(item)) {
          const title = item.replace("aiind_", "").split("_").join(" ");

          individualAIHeaders.push({ key: keyType, title: title });
        }
      });

      setContactTableHeaders([
        ...newContactHeaders,
        ...programmaticContactHeaders,
        ...individualAIHeaders,
      ]);

      setHeaderSet((prevState) => new Set([...prevState, ...set]));
    }
  }, [icp_scoring_ruleset, icp_scoring_ruleset_typed, prospects]);

  // Sorting the List
  useEffect(() => {
    if (data) {
      const prospectData = data as Prospect[];

      const prospectSorted = [...prospectData].sort((a, b) => {
        const individual_fit_score = b.icp_fit_score - a.icp_fit_score;

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
      let currentProspects = prospects;

      if (displayScore) {
        currentProspects = prospects.filter((prospect) => {
          if (displayScore === "5") {
            return true;
          }
          return prospect.icp_fit_score === +displayScore;
        });
      }

      currentProspects = currentProspects.filter((prospect) => {
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
        if (key === "icp_fit_score") {
          currentProspects = currentProspects.filter(
            (prospect) => prospect.icp_fit_score === parseInt(value)
          );
        } else if (key === "icp_company_fit_score") {
          currentProspects = currentProspects.filter(
            (prospect) => prospect.icp_company_fit_score === parseInt(value)
          );
        } else {
          const keyType = key as keyof ICPFitReasonV2;

          if (contactTableHeaders.find((header) => header.key === key)) {
            if (key.includes("aicomp")) {
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
            } else {
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
            }
          }
        }
      });

      setDisplayProspects(currentProspects);
    }
  }, [filteredColumns, prospects, filteredWords, displayScore]);

  const triggerMoveToUnassigned = async () => {
    setRemoveProspectsLoading(true);
    if (currentProject === null) {
      return;
    }

    const prospectIDs = Array.from(selectedContacts);
    try {
      showNotification({
        id: "prospect-removed",
        title: "Removing Prospected and Sent Outreach prospects only...",
        message: `SellScale can only remove prospects that are in the Prospected or Sent Outreach status. SellScale will remove the rest.`,
        color: "blue",
        autoClose: 3000,
      });

      const response = await moveToUnassigned(
        userToken,
        currentProject.id,
        prospectIDs
      );

      if (response.status === "success") {
        showNotification({
          id: "prospect-removed",
          title: "Prospects removed",
          message: `${prospectIDs.length} prospects has been removed from your list`,
          color: "green",
          autoClose: 3000,
        });
      } else {
        showNotification({
          id: "prospect-removed",
          title: "Prospects removal failed",
          message:
            "These prospects could not be removed. Please try again, or contact support.",
          color: "red",
          autoClose: false,
        });
      }

      refetch();
      setSelectedContacts(new Set());
    } catch (error) {
      showNotification({
        id: "prospect-removed",
        title: "Prospects removal failed",
        message:
          "These prospects could not be removed. Please try again, or contact support.",
        color: "red",
        autoClose: false,
      });
    } finally {
      setRemoveProspectsLoading(false);
    }
  };

  const csvData = prospects
    .filter((prospect) => {
      return selectedContacts.has(prospect.id);
    })
    .map((prospect) => {
      let readable_score = "";
      let color = "";
      let number = "";
      switch (prospect.icp_fit_score) {
        case -1:
          readable_score = "Not Scored";
          color = "🟪";
          number = "0";
          break;
        case 0:
          readable_score = "Very Low";
          color = "🟥";
          number = "1";
          break;
        case 1:
          readable_score = "Low";
          color = "🟧";
          number = "2";
          break;
        case 2:
          readable_score = "Medium";
          color = "🟨";
          number = "3";
          break;
        case 3:
          readable_score = "High";
          color = "🟦";
          number = "4";
          break;
        case 4:
          readable_score = "Very High";
          color = "green";
          color = "🟩";
          number = "5";
          break;
        default:
          readable_score = "Unknown";
          color = "";
          break;
      }

      let icp_fit_reason = "";
      let ai_filters = {};

      if (prospect.icp_fit_reason_v2) {
        const reason_keys = Object.keys(prospect.icp_fit_reason_v2);

        reason_keys.forEach((key) => {
          const answer =
            prospect.icp_fit_reason_v2[key].answer +
            " - " +
            prospect.icp_fit_reason_v2[key].reasoning;

          if (key.includes("aiind") || key.includes("aicomp")) {
            ai_filters = {
              ...ai_filters,
              [key]: answer.replace("❌", "").replace("✅", ""),
            };
          }
          icp_fit_reason +=
            key + ": " + prospect.icp_fit_reason_v2[key].reasoning + ". ";
        });
      }

      if (prospect.icp_company_fit_reason) {
        const reason_keys = Object.keys(prospect.icp_company_fit_reason);

        reason_keys.forEach((key) => {
          const answer =
            prospect.icp_company_fit_reason[key].answer +
            " - " +
            prospect.icp_company_fit_reason[key].reasoning;

          if (key.includes("aiind") || key.includes("aicomp")) {
            ai_filters = {
              ...ai_filters,
              [key]: answer.replace("❌", "").replace("✅", ""),
            };
          }
          icp_fit_reason +=
            key + ": " + prospect.icp_company_fit_reason[key].reasoning + ". ";
        });
      }

      return {
        id: prospect.id,
        label: `${number} ${color} ${readable_score}`.toUpperCase(),
        full_name: prospect.full_name,
        title: prospect.title,
        company: prospect.company,
        icp_fit_reason: icp_fit_reason,
        linkedin_url: prospect.linkedin_url,
        email: prospect.email,
        ...ai_filters,
      };
    });

  const csvHeaders = [
    { label: "ID", key: "id" },
    { label: "Label", key: "label" },
    { label: "Full name", key: "full_name" },
    { label: "Title", key: "title" },
    { label: "Company", key: "company" },
    { label: "Icp fit reason", key: "icp_fit_reason" },
    { label: "LinkedinURL", key: "linkedin_url" },
    { label: "Email", key: "email" },
    ...contactTableHeaders
      .filter(
        (header) =>
          header.key.includes("aiind") || header.key.includes("aicomp")
      )
      .map((header) => {
        return { key: header.key, label: header.title };
      }),
  ];

  const generatedData = useMemo(() => {
    return displayProspects.map((prospect) => {
      const p = {
        ...prospect,
        ...prospect.icp_fit_reason_v2,
        ...prospect.icp_company_fit_reason,
      };

      const row: DataRow = {};

      row["id"] = p.id;

      contactTableHeaders.forEach((item) => {
        const key = item.key;
        const keyType = key as keyof typeof p;

        row[key] = p[keyType];
      });

      return row;
    });
  }, [displayProspects, contactTableHeaders]);

  const generatedColumns = useMemo(() => {
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
          item.key === "icp_fit_score" || item.key === "full_name" ? 150 : 250,
        enableColumnFilter:
          item.key === "icp_fit_score" || !notFilters.includes(item.key),
        filterVariant: "select" as FilterVariant,
        filterFn: (row: any, id: any, filterValue: string) => {
          let value = row.getValue(id);
          if (item.key === "icp_fit_score") {
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
            item.key === "icp_fit_score"
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
                {(icp_scoring_ruleset_typed.individual_personalizers?.includes(
                  item.key
                ) ||
                  icp_scoring_ruleset_typed.company_personalizers?.includes(
                    item.key
                  )) && (
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
              ...prospect.icp_company_fit_reason,
            };

            const keyType = item.key as keyof typeof p;
            if (item.key === "icp_fit_score") {
              const trueScore =
                prospect.icp_fit_reason_v2 &&
                Object.keys(prospect.icp_fit_reason_v2).length > 0 &&
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
              let total = 0;

              if (prospect.icp_fit_reason_v2) {
                positiveCount += Object.values(
                  prospect.icp_fit_reason_v2
                ).filter((prospect) => prospect.answer === "YES").length;

                total += Object.values(prospect.icp_fit_reason_v2).length;
              }

              if (prospect.icp_company_fit_reason) {
                positiveCount += Object.values(
                  prospect.icp_company_fit_reason
                ).filter((prospect) => prospect.answer === "YES").length;

                total += Object.values(prospect.icp_company_fit_reason).length;
              }

              if (total === 0) {
                total = 1;
              }

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
                          {`(${positiveCount} /${total})`}
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
                <Tooltip label={value}>
                  <Anchor href={'https://' + value} target="_blank">
                    <IconBrandLinkedin size={16} />
                  </Anchor>
                </Tooltip>
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

  const table = useMantineReactTable({
    columns: generatedColumns,
    data: generatedData,
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

  useEffect(() => {
    //fetch data based on row selection state or something
    //
    const array = Object.keys(table.getState().rowSelection).map((key) => +key);

    setSelectedContacts(new Set(array));
  }, [table.getState().rowSelection]);

  return (
    <Flex gap={"8px"} style={{ overflowY: "hidden", height: "100%" }}>
      {isLoading && <Loader />}
      {!isLoading && icp_scoring_ruleset && !hideFeature && (
        <CampaignFilters
          prospects={prospects}
          icp_scoring_ruleset={icp_scoring_ruleset}
          selectedContacts={selectedContacts}
          archetype_id={currentProject?.id}
          setContactTableHeaders={setContactTableHeaders}
          setHeaderSet={setHeaderSet}
          setUpdatedIndividualColumns={setUpdatedIndividualColumns}
        />
      )}
      <Divider orientation={"vertical"} />
      <Flex
        direction={"column"}
        gap={"8px"}
        style={{ minWidth: "100%", maxWidth: "750px" }}
      >
        {selectedContacts && selectedContacts.size > 0 && (
          <Flex justify={"flex-end"} align={"center"} gap={"xs"} mt={"sm"}>
            <Text>Bulk Actions - {selectedContacts.size} Selected</Text>
            <Tooltip
              withinPortal
              label="Remove 'Prospected' or 'Sent Outreach' prospects from this campaign."
            >
              <Button
                color="red"
                leftIcon={<IconTrash size={14} />}
                size="sm"
                loading={removeProspectsLoading}
                onClick={() => {
                  openConfirmModal({
                    title: "Remove these prospects?",
                    children: (
                      <>
                        <Text>
                          Are you sure you want to remove these{" "}
                          {selectedContacts.size} prospects? This will move them
                          into your Unassigned Contacts list.
                        </Text>
                        <Text mt="xs">
                          <b>Note: </b>Only "Prospected" and "Sent Outreach"
                          prospects will be removed.
                        </Text>
                      </>
                    ),
                    labels: {
                      confirm: "Remove",
                      cancel: "Cancel",
                    },
                    confirmProps: { color: "red" },
                    onCancel: () => { },
                    onConfirm: () => {
                      triggerMoveToUnassigned();
                    },
                  });
                }}
              >
                Remove
              </Button>
            </Tooltip>
            <BulkActions
              hideFeature={hideFeature}
              selectedProspects={prospects.filter((prospect) =>
                selectedContacts.has(prospect.id)
              )}
              backFunc={() => {
                setSelectedContacts(new Set());
                refetch();
                showNotification({
                  title: "Success",
                  message: `${selectedContacts.size} prospects has been moved from Unassigned Contacts to the new persona.`,
                  color: "green",
                  autoClose: 5000,
                });
              }}
            />
            <CSVLink data={csvData} headers={csvHeaders} filename="export">
              <Button
                color="green"
                leftIcon={<IconFileDownload size={14} />}
                size="sm"
              >
                Download CSV
              </Button>
            </CSVLink>
          </Flex>
        )}
        <Flex gap={"4px"} align={"end"} justify={"space-between"}>
          <TextInput
            label={"Global Search"}
            placeholder={"Search for a specific name / company / title"}
            value={filteredWords}
            style={{ minWidth: "93%" }}
            onChange={(event) => setFilteredWords(event.currentTarget.value)}
          />
          {!hideFeature && <Tooltip label="Upload custom data points to your prospects.">
            <Button
              size="sm"
              onClick={customPointHandlers.open}
              color="gray"
              variant="outline"
            >
              <IconMagnet size={16} />
            </Button>
          </Tooltip>}
          <Modal
            opened={openedCustomPoint}
            onClose={customPointHandlers.close}
            size="xl"
            title="Custom Data Point Importer"
          >
            <Text size="xs" color="gray">
              Upload custom data points to your prospects.
            </Text>
            <CustomResearchPointCard />
          </Modal>
        </Flex>
        <Flex
          className="border border-[#ced4da] rounded-md border-solid"
          style={{ minWidth: "800px", maxWidth: "800px" }}
        >
          {["5", "4", "3", "2", "1", "0"].map((item) => {
            let label = "All";

            const typedItem = +item;
            let color = "black";

            if (typedItem === 0) {
              color = "red";
              label = "Very Low";
            } else if (typedItem === 1) {
              color = "orange";
              label = "Low";
            } else if (typedItem === 2) {
              color = "yellow";
              label = "Medium";
            } else if (typedItem === 3) {
              color = "blue";
              label = "High";
            } else if (typedItem === 4) {
              color = "green";
              label = "Very High";
            } else {
              label = "All";
            }

            return (
              <>
                <Button
                  color={color}
                  fullWidth
                  onClick={() => setDisplayScore(item)}
                  variant={displayScore === item ? "filled" : "white"}
                  rightIcon={
                    <Badge color={color}>
                      {
                        prospects.filter((prospect) => {
                          if (typedItem === 5) {
                            return true;
                          } else {
                            return typedItem === prospect.icp_fit_score;
                          }
                        }).length
                      }
                    </Badge>
                  }
                >
                  {label}
                </Button>
                <Divider orientation="vertical" h={24} my="auto" />
              </>
            );
          })}
        </Flex>
        <Box>
          {icp_scoring_ruleset_typed && <MantineReactTable table={table} />}
        </Box>
      </Flex>
    </Flex>
  );
};

export default ArchetypeFilterModal;
