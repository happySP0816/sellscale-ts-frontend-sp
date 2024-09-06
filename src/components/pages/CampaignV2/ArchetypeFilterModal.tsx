import {
  ActionIcon,
  Anchor,
  Badge,
  Box,
  Button,
  Divider,
  Flex,
  HoverCard,
  Loader,
  Modal,
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
import BulkActions from "@common/persona/BulkActions_new";
import { IconFileDownload, IconMagnet, IconTrash } from "@tabler/icons-react";
import { openConfirmModal } from "@mantine/modals";
import { CSVLink } from "react-csv";
import CustomResearchPointCard from "@common/persona/CustomResearchPointCard";
import { useDisclosure } from "@mantine/hooks";
import { MantineReactTable, useMantineReactTable } from "mantine-react-table";
import { IconBrandLinkedin, IconChevronRight } from "@tabler/icons";

interface ContactAccountFilterModalProps {
  showContactAccountFilterModal: boolean;
  setShowContactAccountFilterModal: (showModal: boolean) => void;
}

export interface DataRow {
  [key: string]: any;
}

const ArchetypeFilterModal = function ({
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
      zIndex={10}
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

export const ArchetypeFilters = function ({
  hideFeature = false, //for selix
}: {
  hideFeature?: boolean; // for selix
}) {
  const isSelix: boolean = hideFeature;

  const userToken = useRecoilValue(userTokenState);

  const [prospects, setProspects] = useState<Prospect[]>([]);

  // What we actually display
  const [displayProspects, setDisplayProspects] = useState<Prospect[]>([]);

  const [filteredWords, setFilteredWords] = useState<string>("");

  const [displayScore, setDisplayScore] = useState<string | null>("5");

  const [collapseFilters, setCollapseFilters] = useState<boolean>(false);

  const [programmaticUpdateList, setProgrammaticUpdateList] = useState<
    Set<number>
  >(new Set());

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
      { key: "email", title: "Email" },
      { key: "overall_status", title: "Status" },
    ]
  );

  const notFilters = [
    "full_name",
    "title",
    "company",
    "icp_fit_score",
    "linkedin_url",
    "email",
    "overall_status",
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
  // Necessary UseEffects
  useEffect(() => {
    socket.on("update_prospect_list", async (data) => {
      await refetchICP();
      await refetch();
    });

    socket.on("update_progress", async (data) => {
      const list: number[] = data.update;

      const newProgrammaticUpdateList = new Set(programmaticUpdateList);

      list.forEach((i) => {
        newProgrammaticUpdateList.delete(i);
      });

      setProgrammaticUpdateList(newProgrammaticUpdateList);
    });

    return () => {
      socket.off("update_prospect_list");
      socket.off("update_progress");
    };
  }, [programmaticUpdateList]);

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

  // Necessary UseEffects
  useEffect(() => {
    if (icp_scoring_ruleset_typed) {
      const newContactHeaders = [
        { key: "icp_fit_score", title: "Score" },
        { key: "full_name", title: "Full Name" },
        { key: "title", title: "Title" },
        { key: "company", title: "Company" },
        { key: "linkedin_url", title: "Linkedin URL" },
        { key: "email", title: "Email" },
        { key: "overall_status", title: "Status" },
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
  // Not necessary as a useEffect, can be a use Memo
  // prospects does not have to be a useState
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

  // Necessary Useeffect
  // Display Prospects does not have to be a state variable
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

      setDisplayProspects(currentProspects);
    }
  }, [prospects, filteredWords, displayScore]);

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
        size:
          item.key === "icp_fit_score" ||
          item.key === "full_name" ||
          item.key === "company" ||
          item.key === "overall_status"
            ? 150
            : 250,
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
        mantineTableBodyCellProps: {
          sx: {
            border: `1px black`,
          },
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
                (prospect.icp_fit_reason_v2 &&
                  Object.keys(prospect.icp_fit_reason_v2).length > 0) ||
                (prospect.icp_company_fit_reason &&
                  Object.keys(prospect.icp_company_fit_reason).length > 0);

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
                  position="bottom"
                  withinPortal={true}
                  offset={8}
                  label={
                    <Flex
                      direction={"column"}
                      style={{
                        maxWidth: "400px",
                        textWrap: "wrap",
                      }}
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
                  <Anchor href={"https://" + value} target="_blank">
                    <IconBrandLinkedin size={16} />
                    {value}
                  </Anchor>
                </Tooltip>
              );
            } else if (item.key === "overall_status") {
              return <Badge color={"blue"}>{p[keyType]}</Badge>;
            } else if (item.key === "email" && !p[keyType]) {
              return (
                <Tooltip
                  position="bottom"
                  withinPortal={true}
                  offset={8}
                  label={"Email is revealed when the campaign is launched."}
                >
                  <Box style={{ textWrap: "wrap", maxWidth: "250px" }}>
                    <Text truncate>{p[keyType] ? p[keyType] : "Not Found"}</Text>
                  </Box>
                </Tooltip>
              );
            }
            return (
              <Box style={{ textWrap: "wrap", maxWidth: "250px" }}>
                <Text truncate>{p[keyType] ? p[keyType] : "Not Found"}</Text>
              </Box>
            );
          } else {
            if (value) {
              return !updatedIndividualColumns.has(item.key) ? (
                <HoverCard position="bottom" withinPortal>
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
                      <Text size={"xs"}>
                        <span style={{ fontWeight: "bold" }}>
                          {`Source:  `}
                        </span>
                        {value.source}
                      </Text>
                      {value.question && (
                        <Text size={"xs"}>
                          <span style={{ fontWeight: "bold" }}>
                            {`Question:  `}
                          </span>
                          {value.question}
                        </Text>
                      )}
                      {value.last_run && (
                        <Text size={"xs"}>
                          <span style={{ fontWeight: "bold" }}>
                            {`Last Updated:  `}
                          </span>
                          {new Date(value.last_run + " UTC").toLocaleString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "2-digit",
                              day: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                              second: "2-digit",
                              hour12: true,
                            }
                          )}
                        </Text>
                      )}
                    </Flex>
                  </HoverCard.Dropdown>
                </HoverCard>
              ) : (
                <Text color={"orange"} weight={"bold"}>
                  TBD
                </Text>
              );
            } else {
              return "Not Scored";
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
    mantineTableHeadRowProps: {
      sx: {
        shadow: "none",
        boxShadow: "none",
      },
    },
    mantineTableProps: {
      sx: {
        borderCollapse: "separate",
        border: "none",
        borderSpacing: "0px 0px",
      },
      withColumnBorders: true,
    },
    mantinePaginationProps: {
      rowsPerPageOptions: [
        "5",
        "10",
        "25",
        "50",
        "100",
        "" + displayProspects.length,
      ].sort((a, b) => +a - +b),
    },
    mantineTableBodyCellProps: ({ row }) => {
      return {
        style: {
          backgroundColor: selectedContacts.has(+row.id) ? "cyan" : undefined,
        },
      };
    },
    mantineSelectAllCheckboxProps: {
      indeterminate:
        selectedContacts.size > 0 &&
        selectedContacts.size < displayProspects.length,
      checked: selectedContacts.size === displayProspects.length,
      onChange: (e) => {
        if (!e.currentTarget.checked) {
          setSelectedContacts(new Set());
        } else {
          setSelectedContacts(new Set(displayProspects.map((p) => p.id)));
        }
      },
    },
    mantineSelectCheckboxProps: ({ row }) => {
      return {
        checked: selectedContacts.has(+row.id),
        onChange: (e) => {
          if (!e.currentTarget.checked) {
            setSelectedContacts((prevState) => {
              return new Set([...prevState].filter((p) => p !== +row.id));
            });
          } else {
            setSelectedContacts((prevState) => {
              return new Set([...prevState, +row.id]);
            });
          }
        },
      };
    },
  });

  return (
    <Flex gap={"8px"} style={{ overflowY: "hidden", height: "100%" }}>
      {isLoading && <Loader />}
      {!isLoading &&
        icp_scoring_ruleset &&
        !hideFeature &&
        !collapseFilters && (
          <CampaignFilters
            prospects={prospects}
            icp_scoring_ruleset={icp_scoring_ruleset}
            selectedContacts={selectedContacts}
            archetype_id={currentProject?.id}
            setContactTableHeaders={setContactTableHeaders}
            setHeaderSet={setHeaderSet}
            setUpdatedIndividualColumns={setUpdatedIndividualColumns}
            programmaticUpdates={programmaticUpdateList}
            setProgrammaticUpdates={setProgrammaticUpdateList}
            setCollapseFilters={setCollapseFilters}
          />
        )}
      {collapseFilters && (
        <ActionIcon onClick={() => setCollapseFilters(false)}>
          <IconChevronRight />
        </ActionIcon>
      )}
      <Divider orientation={"vertical"} />
      <Flex
        direction={"column"}
        gap={"8px"}
        style={{ maxWidth: collapseFilters ? "1450px" : "1150px" }}
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
                    onCancel: () => {},
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
              hideFeature={isSelix}
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
          {!isSelix && (
            <Tooltip label="Upload custom data points to your prospects.">
              <Button
                size="sm"
                onClick={customPointHandlers.open}
                color="gray"
                variant="outline"
              >
                <IconMagnet size={16} />
              </Button>
            </Tooltip>
          )}
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
          style={{ minWidth: isSelix ? "100%" : "800px", maxWidth: "800px" }}
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
        <Box style={{ maxWidth: isSelix ? "50vw" : "100%" }}>
          {icp_scoring_ruleset_typed && <MantineReactTable table={table} />}
        </Box>
      </Flex>
    </Flex>
  );
};

export default ArchetypeFilterModal;
