import {
  ActionIcon,
  Badge,
  Box,
  Center,
  Checkbox,
  Divider,
  Flex,
  HoverCard,
  Loader,
  Modal,
  Popover,
  ScrollArea,
  SegmentedControl,
  Select,
  Switch,
  Table,
  Tabs,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { API_URL } from "@constants/data";
import { useRecoilValue } from "recoil";
import { userTokenState } from "@atoms/userAtoms";
import { FaFilter } from "react-icons/fa6";
import { ICPFitReasonV2, Prospect } from "src";
import {
  ICPScoringRuleset,
  ICPScoringRulesetKeys,
  ProspectAccounts,
  TableHeader,
  ViewMode,
} from "@modals/ContactAccountFilterModal";
import { currentProjectState } from "@atoms/personaAtoms";
import { getICPRuleSet } from "@utils/requests/icpScoring";
import CampaignFilters from "@pages/CampaignV2/CampaignFilters";
import { socket } from "../../App";
import { display } from "html2canvas/dist/types/css/property-descriptors/display";

interface ContactAccountFilterModalProps {
  showContactAccountFilterModal: boolean;
  setShowContactAccountFilterModal: (showModal: boolean) => void;
}

const ArchetypeFilterModal = function({
  showContactAccountFilterModal,
  setShowContactAccountFilterModal,
}: ContactAccountFilterModalProps) {
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

  const [view10, setView10] = useState<boolean>(true);

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

      if (view10) {
        currentProspects = currentProspects.slice(0, 10);
      }

      setDisplayProspects(currentProspects);
    }
  }, [filteredColumns, view10, prospects, filteredWords, displayScore]);

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

  return (
    <Modal
      onClose={() => setShowContactAccountFilterModal(false)}
      opened={showContactAccountFilterModal}
      size={"1100px"}
      style={{ maxHeight: "700px", maxWidth: "1100px" }}
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
      <Flex gap={"8px"}>
        {isLoading && <Loader />}
        {!isLoading && icp_scoring_ruleset && (
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
        <Flex direction={"column"} gap={"8px"}>
          <Flex gap={"4px"} align={"end"} justify={"space-between"}>
            <TextInput
              label={"Global Search"}
              placeholder={"Search for a specific name / company / title"}
              value={filteredWords}
              style={{ minWidth: "85%" }}
              onChange={(event) => setFilteredWords(event.currentTarget.value)}
            />

            <Switch
              size={"xl"}
              onLabel={"View All"}
              offLabel={"View 10"}
              checked={!view10}
              onChange={(event) => {
                setView10(!event.currentTarget.checked);
              }}
            />
          </Flex>
          <Tabs
            defaultValue="5"
            value={displayScore}
            onTabChange={setDisplayScore}
          >
            <Tabs.List>
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
                  color = "gold";
                  label = "Medium";
                } else if (typedItem === 3) {
                  color = "blue";
                  label = "High";
                } else if (typedItem === 4) {
                  color = "lightgreen";
                  label = "Very High";
                } else {
                  label = "All";
                }

                return (
                  <Tabs.Tab value={item}>
                    <Center>
                      <Text style={{ color: color, fontWeight: "bold" }}>
                        {label}
                      </Text>
                      <Text ml={10} style={{ color: color }}>
                        (
                        {
                          prospects.filter((prospect) => {
                            if (typedItem === 5) {
                              return true;
                            } else {
                              return typedItem === prospect.icp_fit_score;
                            }
                          }).length
                        }
                        )
                      </Text>
                    </Center>
                  </Tabs.Tab>
                );
              })}
            </Tabs.List>
          </Tabs>
          <ScrollArea w={800} h={700}>
            <Box>
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
                            <Flex align={"center"} justify={"space-between"}>
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
                                {icp_scoring_ruleset_typed.company_personalizers?.includes(
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
                                              { value: "", label: "Select" },
                                              {
                                                value: "0",
                                                label: "VERY LOW",
                                              },
                                              { value: "1", label: "LOW" },
                                              { value: "2", label: "MEDIUM" },
                                              { value: "3", label: "HIGH" },
                                              {
                                                value: "4",
                                                label: "VERY HIGH",
                                              },
                                            ]
                                            : [
                                              { value: "", label: "Select" },
                                              { value: "YES", label: "YES" },
                                              { value: "NO", label: "NO" },
                                            ]
                                        }
                                        onChange={(value) =>
                                          onSelectFilter(item.key, value ?? "")
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
                    .slice(0, view10 ? 20 : undefined)
                    .map((prospect, index) => {
                      const keys: string[] = contactTableHeaders.map(
                        (h) => h.key
                      );
                      const p = {
                        ...prospect,
                        ...prospect.icp_fit_reason_v2,
                        ...prospect.icp_company_fit_reason,
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
                              if (key === "icp_fit_score") {
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
                                          {prospect.icp_fit_reason_v2 &&
                                            Object.keys(
                                              prospect.icp_fit_reason_v2
                                            ).map((key) => {
                                              const section =
                                                prospect.icp_fit_reason_v2[key];
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
                                            Object.keys(
                                              prospect.icp_company_fit_reason
                                            ).map((key) => {
                                              const section =
                                                prospect.icp_company_fit_reason[
                                                key
                                                ];
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
                                        <Flex direction={"column"} gap={"4px"}>
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
            </Box>
          </ScrollArea>
        </Flex>
      </Flex>
    </Modal>
  );
};

export default ArchetypeFilterModal;
