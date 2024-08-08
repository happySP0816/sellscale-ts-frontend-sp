import {
  Box,
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
  Accordion, Popover, TextInput, Divider
} from "@mantine/core";
import {useEffect, useState} from "react";
import {ICPFitReasonV2, Prospect} from "../../index";
import {useQuery} from "@tanstack/react-query";
import {TransformedSegment} from "@pages/SegmentV3/SegmentV3";
import {API_URL} from "@constants/data";
import {useRecoilValue} from "recoil";
import {userTokenState} from "@atoms/userAtoms";
import MarketMapFilters from "@pages/SegmentV3/MarketMapFilters";
import {not} from "three/examples/jsm/nodes/math/OperatorNode";

interface ContactAccountFilterModalProps {
  showContactAccountFilterModal: boolean,
  setShowContactAccountFilterModal: (showModal: boolean) => void,
  segment?: TransformedSegment,
}

export type ViewMode = "ACCOUNT" | "CONTACT";

export interface TableHeader {
  key: string,
  title: string,
}

export interface ProspectAccounts {
  [key: string]: string | number;
}

export interface AIFilters {
  key: string,
  title: string,
  prompt: string,
  use_linkedin: boolean,
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

interface ICPScoringRulesetKeys {
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
  included_individual_seniority_keywords:  string[] | null;
  included_individual_skills_keywords: string[] | null;
  included_individual_title_keywords: string[] | null;

  individual_years_of_experience_end: number;
  individual_years_of_experience_start: number;
}

const ContactAccountFilterModal = function (
  {
    showContactAccountFilterModal,
    setShowContactAccountFilterModal,
    segment,
  }: ContactAccountFilterModalProps) {
  const userToken = useRecoilValue(userTokenState);

  const [viewMode, setViewMode] = useState<ViewMode>("CONTACT");
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [prospectAccounts, setProspectAccounts] = useState<ProspectAccounts[]>([]);

  const [view20, setView20] = useState<boolean>(true);

  const [contactTableHeaders, setContactTableHeaders] = useState<TableHeader[]>(
    [{key: "full_name", title: "Full Name"},
      {key: "title", title: "Title"},
      {key: "company", title: "Company"},
      {key: "icp_fit_score", title: "Score"},
      {key: "icp_company_fit_score", title: "Company Score"}
    ]
  );

  const notFilters = ["full_name", "title", "company", "icp_fit_score", "icp_company_fit_score"];

  const [companyTableHeaders, setCompanyTableHeaders] = useState<TableHeader[]>(
    [{key: "company", title: "Account Name"},
      {key: "icp_company_fit_score", title: "Score"}]
  );

  const [selectedContacts, setSelectedContacts] = useState<Set<number>>(new Set());
  const [selectedCompanies, setSelectedCompanies] = useState<Set<string>>(new Set());

  // This selection is the set of columns that we want the score to be "yes" or 1.
  // Only select the prospects or companies that have a score of 1 or "yes" for this column.
  // We can select both individual or company columns
  const [selectedIndividualColumns, setSelectedIndividualColumns] = useState<Set<string>>(new Set());
  const [selectedCompanyColumns, setSelectedCompanyColumns] = useState<Set<string>>(new Set());

  // state for updating columns
  // whenever we change any columns, we add the columns name to the set
  // we then display it as TBD
  // if the column is set to empty, then we don't display the columns
  const [updatedIndividualColumns, setUpdatedIndividualColumns] = useState<Set<string>>(new Set());
  const [updatedCompanyColumns, setUpdatedCompanyColumns] = useState<Set<string>>(new Set());

  const [segmentName, setSegmentName] = useState<string>("");

  const [headerSet, setHeaderSet] = useState<Set<string>>(new Set());

  // We want to pass in the set column header to the filter component
  // if we add a new filter, we want to add it to the column
  // if we clear a filter we want to remove it from the header
  // if we update a column add it to the update columns state

  // Whenever we select a new company, we want to select the contacts that are associated with that company
  useEffect(() => {
    let finalProspects: number[] = [];

    selectedCompanies.forEach(company => {
      const prospectIds = prospects.filter(prospect => prospect.company === company).map(prospect => prospect.id);
      finalProspects = finalProspects.concat(prospectIds);
    })

    setSelectedContacts(new Set(finalProspects));
  }, [selectedCompanies]);

  // In here, we will select the reasons that says yes.
  useEffect(() => {
    if (selectedCompanyColumns.size === 0 && selectedIndividualColumns.size === 0) {
      setSelectedContacts(new Set());
      setSelectedCompanies(new Set());
      return;
    }

    let finalProspects: Prospect[] = prospects;
    let finalProspectAccounts: string[] = [];

    selectedIndividualColumns.forEach(column => {
      finalProspects = finalProspects.filter(prospect => {
        const icp_fit_reason =prospect.icp_fit_reason_v2;

        if (!icp_fit_reason) {
          return false;
        }

        const section = icp_fit_reason[column];

        if (section) {
          return section.answer === "YES";
        }
        else {
          return false;
        }
      })
    })

    selectedCompanyColumns.forEach(column => {
      finalProspects = finalProspects.filter(prospect => {
        const icp_company_fit_reason = prospect.icp_company_fit_reason;

        if (!icp_company_fit_reason) {
          return false;
        }

        const section = icp_company_fit_reason[column];

        if (section) {
          return section.answer === "YES";
        }

        return false;
      })
    })
    finalProspectAccounts = finalProspects.map(prospect => prospect.company);

    setSelectedContacts(new Set(finalProspects.map(prospect => prospect.id)));
    setSelectedCompanies(new Set(finalProspectAccounts));

  }, [selectedIndividualColumns, selectedCompanyColumns]);

  // Checkbox Handlers for selecting contacts
  const handleSelectContact = (contactId: number) => {
    if (selectedContacts.has(contactId)) {
      setSelectedContacts(prevState => {
        prevState.delete(contactId);
        return new Set(prevState);
      })
    }
    else {
      setSelectedContacts(prevState => {
        prevState.add(contactId);
        return new Set(prevState);
      })
    }
  }

  const handleSelectAllContacts = () => {
    if (selectedContacts.size === prospects.length) {
      setSelectedContacts(new Set());
    }
    else {
      setSelectedContacts(new Set(prospects.map(prospect => prospect.id)));
    }
  }

  // Checkbox Handlers for selecting companies
  const handleSelectCompany = (companyName: string) => {
    if (selectedCompanies.has(companyName)) {
      setSelectedCompanies(prevState => {
        prevState.delete(companyName);
        return new Set(prevState);
      });
    }
    else {
      setSelectedCompanies(prevState => {
        prevState.add(companyName);
        return new Set(prevState);
      });
    }
  }

  const handleSelectAllCompanies = () => {
    if (selectedCompanies.size === prospectAccounts.length) {
      setSelectedCompanies(new Set());
    } else {
      setSelectedCompanies(new Set(prospectAccounts.map(prospectAccount => "" + prospectAccount.company)));
    }
  }

  const { data, isLoading, error } = useQuery({
    queryKey: ['segmentProspects', segment?.id],
    queryFn: async () => {
      if (segment) {
        const response = await fetch(`${API_URL}/segment/${segment.id}/prospects`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${userToken}`,
          }
        });

        const jsonResponse = await response.json();

        return jsonResponse.prospects;
      }
      else {
        return null;
      }
    },
    enabled: !!segment,
    refetchInterval: 10000,
  })

  const {data: icp_scoring_ruleset, isLoading: icp_scoring_ruleset_loading } = useQuery({
    queryKey: ['icpScoringRuleset', segment?.id],
    queryFn: async () => {
      if (segment) {
        const response = await fetch(`${API_URL}/segment/${segment.id}/icp_ruleset`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${userToken}`,
          }
        })

        const jsonResponse = await response.json();

        return jsonResponse.icp_ruleset;
      }
    },
    enabled: !!segment,
    refetchInterval: 10000,
  });

  const icp_scoring_ruleset_typed = icp_scoring_ruleset as ICPScoringRuleset;

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (icp_scoring_ruleset_typed) {
      const newContactHeaders = [{key: "full_name", title: "Full Name"},
        {key: "title", title: "Title"},
        {key: "company", title: "Company"},
        {key: "icp_fit_score", title: "Score"},
      ];

      const newCompanyHeaders = [{key: "company", title: "Account Name"},
        {key: "icp_company_fit_score", title: "Score"}];

      const company_ai_filters = icp_scoring_ruleset_typed.company_ai_filters ?? [];
      const individual_ai_filters = icp_scoring_ruleset_typed.individual_ai_filters ?? [];

      const icp_scoring_ruleset_keys = Object.keys(icp_scoring_ruleset_typed).filter(item => {
        return (item !== "individual_personalizers" &&
          item !== "company_personalizers" &&
          item !== "dealbreakers" &&
          item !== "company_ai_filters" &&
          item !== "individual_ai_filters" &&
          item !== "segment_id" &&
          item !== "client_archetype_id" &&
          item !== "id" &&
          item !== "hash");
      })
      // Handling programmatic filters
      const programmaticContactHeaders: TableHeader[] = [];
      const programmaticCompanyHeaders: TableHeader[] = [];

      const set = new Set<string>();

      icp_scoring_ruleset_keys.forEach(key => {
        const keyType = key as keyof ICPScoringRulesetKeys;

        if (icp_scoring_ruleset_typed[keyType] || icp_scoring_ruleset_typed[keyType] === 0) {
          if (Array.isArray(icp_scoring_ruleset_typed[keyType])) {
            const array: string[] = icp_scoring_ruleset_typed[keyType] as string[];
            if (array.length === 0) {
              return;
            }
          }

          const title = keyType.split("_").join(" ").replace("keywords", "").replace("start", "").replace("end", "");

          if (keyType.includes("individual")) {
            const key = keyType.replace("_start", "").replace("_end", "");
            if (!set.has(key)) {
              set.add(key);
              programmaticContactHeaders.push({key: key, title: title.replace("individual", "").replace(" ", "")});
            }
          }
          else if (keyType.includes("company")) {
            const key = keyType.replace("_start", "").replace("_end", "");
            if (!set.has(key)) {
              set.add(key);
              programmaticCompanyHeaders.push({key: key, title: title.replace("company", "").replace(" ", "")});
            }
          }
        }
      })

      const individualAIHeaders: TableHeader[] = [];
      const companyAIHeaders: TableHeader[] = [];

      // Handling AI filters
      individual_ai_filters.forEach(ai_filter => {
        if (!set.has(ai_filter.key)) {
          set.add(ai_filter.key);
          individualAIHeaders.push({key: ai_filter.key, title: ai_filter.title});
        }
      })

      company_ai_filters.forEach(ai_filter => {
        if (!set.has(ai_filter.key)) {
          set.add(ai_filter.key);
          companyAIHeaders.push({key: ai_filter.key, title: ai_filter.title});
        }
      })

      setContactTableHeaders([...newContactHeaders, ...programmaticContactHeaders, ...individualAIHeaders]);
      setCompanyTableHeaders([...newCompanyHeaders, ...programmaticCompanyHeaders, ...companyAIHeaders]);
      setHeaderSet(set);
    }
  }, [icp_scoring_ruleset, icp_scoring_ruleset_typed, prospects]);

  useEffect(() => {
    const prospectData = prospects;

    const prospectSorted = [...prospectData]
      .sort((a, b) => {
          const individual_fit_score = b.icp_fit_score - a.icp_fit_score

          if (individual_fit_score !== 0) {
            return individual_fit_score;
          }

          const individual_fit_reason: number = (a.icp_fit_reason_v2 && !b.icp_fit_reason_v2) ? -1 :
            (!a.icp_fit_reason_v2 && b.icp_fit_reason_v2) ? 1 : (!a.icp_fit_reason_v2 && !b.icp_fit_reason_v2) ? 0 :
              Object.keys(b.icp_fit_reason_v2).length - Object.keys(a.icp_fit_reason_v2).length;

          if (individual_fit_reason !== 0) {
            return individual_fit_reason;
          }

          return a.full_name.localeCompare(b.full_name);
        }
      )

    const accountSorted = [...prospectData]
      .sort((a, b) => {
          const company_fit_score = b.icp_company_fit_score - a.icp_company_fit_score;

          if (company_fit_score !== 0) {
            return company_fit_score;
          }

          const company_fit_reason = (a.icp_company_fit_reason && !b.icp_company_fit_reason) ? -1 :
            (!a.icp_company_fit_reason && b.icp_company_fit_reason) ? 1 : (!a.icp_company_fit_reason && !b.icp_company_fit_reason) ? 0 :
              Object.keys(b.icp_company_fit_reason).length - Object.keys(a.icp_company_fit_reason).length;

          if (company_fit_reason !== 0) {
            return company_fit_reason;
          }

          return a.full_name.localeCompare(b.full_name);
        }
      )

    setProspects(prospectSorted);

    const companySet = new Set();
    const finalCompanyData: ProspectAccounts[] = [];

    accountSorted.forEach(prospect => {
      const prospectCompanyName = prospect.company;

      if (!companySet.has(prospectCompanyName)) {
        companySet.add(prospectCompanyName);
        // Add to final Company Data
        // Have columns for them like scoring
        // Make new column for icp_fit_reason_v2
        // Json key value pair of header_key, and reasoning

        finalCompanyData.push({"company": prospectCompanyName,
          "icp_company_fit_score": prospect.icp_company_fit_score, "prospect_id": prospect.id});
      }
    })

    setProspectAccounts(finalCompanyData);
  }, [prospects]);

  useEffect(() => {
    if (data) {
      const prospectData = data as Prospect[];

      const prospectSorted = [...prospectData]
        .sort((a, b) => {
            const individual_fit_score = b.icp_fit_score - a.icp_fit_score

            if (individual_fit_score !== 0) {
              return individual_fit_score;
            }

            const individual_fit_reason: number = (a.icp_fit_reason_v2 && !b.icp_fit_reason_v2) ? -1 :
              (!a.icp_fit_reason_v2 && b.icp_fit_reason_v2) ? 1 : (!a.icp_fit_reason_v2 && !b.icp_fit_reason_v2) ? 0 :
                Object.keys(b.icp_fit_reason_v2).length - Object.keys(a.icp_fit_reason_v2).length;

            if (individual_fit_reason !== 0) {
              return individual_fit_reason;
            }

            return a.full_name.localeCompare(b.full_name);
          }
        )

      const accountSorted = [...prospectData]
        .sort((a, b) => {
            const company_fit_score = b.icp_company_fit_score - a.icp_company_fit_score;

            if (company_fit_score !== 0) {
              return company_fit_score;
            }

            const company_fit_reason = (a.icp_company_fit_reason && !b.icp_company_fit_reason) ? -1 :
              (!a.icp_company_fit_reason && b.icp_company_fit_reason) ? 1 : (!a.icp_company_fit_reason && !b.icp_company_fit_reason) ? 0 :
                Object.keys(b.icp_company_fit_reason).length - Object.keys(a.icp_company_fit_reason).length;

            if (company_fit_reason !== 0) {
              return company_fit_reason;
            }

            return a.full_name.localeCompare(b.full_name);
          }
        )

      setProspects(prospectSorted);

      const companySet = new Set();
      const finalCompanyData: ProspectAccounts[] = [];

      accountSorted.forEach(prospect => {
        const prospectCompanyName = prospect.company;

        if (!companySet.has(prospectCompanyName)) {
          companySet.add(prospectCompanyName);
          // Add to final Company Data
          // Have columns for them like scoring
          // Make new column for icp_fit_reason_v2
          // Json key value pair of header_key, and reasoning

          finalCompanyData.push({"company": prospectCompanyName,
            "icp_company_fit_score": prospect.icp_company_fit_score, "prospect_id": prospect.id});
        }
      })

      setProspectAccounts(finalCompanyData);
    }
  }, [data]);

  const onClickCreateSegment = async () => {
    const response = await fetch(`${API_URL}/segment/${segment?.id}/create-segment-from-market-map`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        segment_title: segmentName,
        prospects: Array.from(selectedContacts),
      })
    });

    const jsonResponse = await response.json();

    if (jsonResponse.status === 200) {
      setLoading(false);
      setSegmentName("");
      setSelectedContacts(new Set());
      return setShowContactAccountFilterModal(false);
    }
  }

  return (
    <Modal
      onClose={() => setShowContactAccountFilterModal(false)}
      opened={showContactAccountFilterModal}
      size={'1100px'}
      style={{maxHeight: "700px"}}
      title={
      <Flex justify={'space-between'} gap={'36px'}>
        <Title order={3}>
          {viewMode === "ACCOUNT" ? "Account Market Map" : "Contact Market Map"}
        </Title>
        <Switch size={'xl'}
                onLabel="Account View"
                offLabel="Contact View"
                onChange={(event) =>{
                  if (event.currentTarget.checked) {
                    setViewMode("ACCOUNT")
                  } else {
                    setViewMode("CONTACT")
                  }}}
                checked={viewMode === "ACCOUNT"}
        />
        <Switch size={'xl'}
                onLabel={"View All"}
                offLabel={"View 20"}
                checked={!view20}
                onChange={(event) => {
                  setView20(!event.currentTarget.checked);
                }}
        />
        <Popover width={400} position="bottom" withArrow shadow="md" withinPortal>
          <Popover.Target>
            <Button>Create Segment From Selected Prospects</Button>
          </Popover.Target>
          <Popover.Dropdown>
            <Flex direction={'column'} gap={'24px'}>
              <TextInput
                value={segmentName}
                label={'Segment Name'}
                onChange={(event) => setSegmentName(event.currentTarget.value)}
              >

              </TextInput>
              <Button
                onClick={() => {
                setLoading(true);
                onClickCreateSegment()
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
      <Flex>
        {isLoading && <Loader />}
        {!isLoading && icp_scoring_ruleset &&
          (
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
              setUpdatedIndividualColumns={setUpdatedIndividualColumns}/>
          )}
        <Box style={{height: "700px", overflow: "scroll", maxWidth: '100%'}}>
          {!isLoading && viewMode === "ACCOUNT" ? (
            <Table style={{overflow: 'scroll'}} verticalSpacing={"sm"}>
              <thead>
              <tr>
                <th>
                  <Checkbox
                    checked={selectedCompanies.size === prospectAccounts.length}
                    onChange={() => handleSelectAllCompanies()}
                  />
                </th>
                {icp_scoring_ruleset_typed && companyTableHeaders.map(item => {
                  return (
                    <th key={item.key}>
                      <Flex direction={'column'}>
                        {item.title}

                        {!notFilters.includes(item.key) && (
                          <Checkbox
                            checked={selectedCompanyColumns.has(item.key)}
                            onChange={() => {
                              if (selectedCompanyColumns.has(item.key)) {
                                setSelectedCompanyColumns(prevState => {
                                  prevState.delete(item.key);
                                  return new Set(prevState);
                                })
                              }
                              else {
                                setSelectedCompanyColumns(prevState => {
                                  prevState.add(item.key);
                                  return new Set(prevState);
                                })
                              }
                            }}
                          />
                        )}
                        {icp_scoring_ruleset_typed.company_personalizers?.includes(item.key) && "Personalizer: ✅"}
                        {icp_scoring_ruleset_typed.dealbreakers?.includes(item.key) && "Dealbreaker: ✅"}
                      </Flex>
                    </th>
                  )
                })}
              </tr>
              </thead>
              <tbody>
              {prospectAccounts.map((prospectAccount, index) => {
                const keys = companyTableHeaders.map(h => h.key);

                return (
                  <tr key={prospectAccount.company}
                      style={{ backgroundColor: selectedCompanies.has("" + prospectAccount.company) ? "lightcyan" : "white"}}>
                    <td>
                      <Checkbox
                        checked={selectedCompanies.has( "" + prospectAccount.company)}
                        onChange={() => handleSelectCompany("" + prospectAccount.company)}
                      />
                    </td>
                    {keys.map(key => {
                      if (notFilters.includes(key)) {
                        const keyType = key as keyof ProspectAccounts;

                        if (key === "icp_company_fit_score") {
                          const prospect = prospects.find(item => item.id === prospectAccount.prospect_id);

                          if (!prospect) {
                            return (
                              <td key={key + prospectAccount.company}
                                  style={{minWidth: "100px", maxWidth: "300px"}}>
                                <Text color={'orange'} weight={'bold'}>
                                  Not Scored
                                </Text>
                              </td>);
                          }

                          const trueScore = prospect.icp_company_fit_reason && Object.keys(prospect.icp_company_fit_reason).length > 0;

                          let humanReadableScore = "Not Scored";

                          if (prospectAccount[keyType] === 0) {
                            humanReadableScore = "Very Low"
                          } else if (prospectAccount[keyType] === 1) {
                            humanReadableScore = "Low"
                          } else if (prospectAccount[keyType] === 2) {
                            humanReadableScore = "Medium"
                          } else if (prospectAccount[keyType] === 3) {
                            humanReadableScore = "High"
                          } else {
                            humanReadableScore = "Very High"
                          }

                          return (
                            <td key={key + prospectAccount.company}
                                style={{minWidth: "100px", maxWidth: "300px"}}>
                              <Text>
                                {trueScore ? humanReadableScore : "Not Scored"}
                              </Text>
                            </td>
                          )
                        }

                        return (
                          <td key={key + prospectAccount.company}
                              style={{minWidth: "100px", maxWidth: "300px"}}>
                            {prospectAccount[keyType]}
                          </td>
                        )
                      }
                      else {
                        const icp_company_fit_reason = prospects.find(item => item.id === prospectAccount.prospect_id)?.icp_company_fit_reason as ICPFitReasonV2;

                        if (!icp_company_fit_reason) {
                          return (
                            <td key={key + prospectAccount.company}
                                style={{minWidth: "100px", maxWidth: "300px"}}>
                              <Text color={'orange'} weight={'bold'}>
                                TBD
                              </Text>
                            </td>);
                        }
                        const pa = {...prospectAccount, ...icp_company_fit_reason};
                        const keyType = key as keyof typeof pa;

                        const section = icp_company_fit_reason[keyType];

                        return (
                          <td key={key + prospectAccount.company}
                              style={{minWidth: "100px", maxWidth: "300px"}}>
                            {(pa[keyType] && !updatedCompanyColumns.has(key)) ? (
                              <HoverCard>
                                <HoverCard.Target>
                                  <Text color={section.answer === "YES" ? "green" : "red"}
                                        weight={'bold'}
                                  >
                                    {section.answer}
                                  </Text>
                                </HoverCard.Target>
                                <HoverCard.Dropdown maw={'300px'}>
                                  <Flex direction={'column'} gap={'4px'}>
                                    <Text size="sm">
                                      <span style={{fontWeight: "bold"}}>
                                        {`Reason: `}
                                      </span>
                                      {section.reasoning}
                                    </Text>
                                    <Divider />
                                    <Text>
                                      <span style={{fontWeight: "bold"}}>
                                        {`Source:  `}
                                      </span>
                                      {section.source}
                                    </Text>
                                  </Flex>
                                </HoverCard.Dropdown>
                              </HoverCard>
                            ) : (
                              <Text color={'orange'} weight={'bold'}>
                                TBD
                              </Text>
                            )}
                          </td>
                        )
                      }
                    })}
                  </tr>
                )
              })}
              </tbody>
            </Table>
          ) : (
            <Table style={{overflow: 'scroll'}} verticalSpacing={"sm"}>
              <thead>
              <tr>
                <th>
                  <Checkbox
                    checked={selectedContacts.size === prospects.length}
                    onChange={() => handleSelectAllContacts()}
                  />
                </th>
                {icp_scoring_ruleset_typed && contactTableHeaders.map(item => {
                  return (
                    <th key={item.title}>
                      <Flex direction={'column'} justify={'center'}>
                        {item.title}
                        {!notFilters.includes(item.key) && (
                          <Checkbox
                            checked={selectedIndividualColumns.has(item.key)}
                            onChange={() => {
                              if (selectedIndividualColumns.has(item.key)) {
                                setSelectedIndividualColumns(prevState => {
                                  prevState.delete(item.key);
                                  return new Set(prevState);
                                })
                              }
                              else {
                                setSelectedIndividualColumns(prevState => {
                                  prevState.add(item.key);
                                  return new Set(prevState);
                                })
                              }
                            }}
                          />
                        )}
                        {icp_scoring_ruleset_typed.company_personalizers?.includes(item.key) && "Personalizer: ✅"}
                        {icp_scoring_ruleset_typed.dealbreakers?.includes(item.key) && "Dealbreaker: ✅"}
                      </Flex>
                    </th>
                  )
                })}
              </tr>
              </thead>
              <tbody>
              {prospects.slice(0, view20 ? 20 : undefined).map((prospect, index) => {
                const keys: string[] = contactTableHeaders.map(h => h.key);
                const p = {...prospect, ...prospect.icp_fit_reason_v2};

                return (
                  <tr key={p.id}
                      style={{ backgroundColor: selectedContacts.has(p.id) ? "lightcyan" : "white"}}>
                    <td>
                      <Checkbox
                        checked={selectedContacts.has(p.id)}
                        onChange={() => handleSelectContact(p.id)}
                      />
                    </td>
                    {keys.map(key => {
                      if (notFilters.includes(key)) {
                        const keyType = key as keyof typeof p;
                        if (key === "icp_fit_score") {
                          const trueScore = prospect.icp_fit_reason_v2 && Object.keys(prospect.icp_fit_reason_v2).length > 0;

                          let humanReadableScore = "Not Scored";

                          if (p[keyType] === 0) {
                            humanReadableScore = "Very Low"
                          } else if (p[keyType] === 1) {
                            humanReadableScore = "Low"
                          } else if (p[keyType] === 2) {
                            humanReadableScore = "Medium"
                          } else if (p[keyType] === 3) {
                            humanReadableScore = "High"
                          } else if (p[keyType] === 4) {
                            humanReadableScore = "Very High"
                          }

                          return (
                            <td key={key + p.id}
                                style={{minWidth: "100px", maxWidth: "300px"}}>
                              <Text>
                                {trueScore ? humanReadableScore : "Not Scored"}
                              </Text>
                            </td>
                          )
                        }
                        return (
                          <td key={key + p.id}
                              style={{minWidth: "100px", maxWidth: "300px"}}>
                            <Text>
                              {p[keyType]}
                            </Text>
                          </td>
                        )
                      }
                      else {
                        const keyType = key as keyof typeof p;
                        return (
                          <td key={key + p.id}
                              style={{minWidth: "100px", maxWidth: "300px"}}>
                            {(p[keyType] && !updatedIndividualColumns.has(key)) ? (
                              <HoverCard>
                                <HoverCard.Target>
                                  <Text color={p[keyType].answer === "YES" ? "green" : "red"}
                                        weight={'bold'}
                                  >
                                    {p[keyType].answer}
                                  </Text>
                                </HoverCard.Target>
                                <HoverCard.Dropdown maw={'300px'}>
                                  <Flex direction={'column'} gap={'4px'}>
                                    <Text size="sm">
                                      <span style={{fontWeight: "bold"}}>
                                        {`Reason: `}
                                      </span>
                                      {p[keyType].reasoning}
                                    </Text>
                                    <Divider />
                                    <Text>
                                      <span style={{fontWeight: "bold"}}>
                                        {`Source:  `}
                                      </span>
                                      {p[keyType].source}
                                    </Text>
                                  </Flex>
                                </HoverCard.Dropdown>
                              </HoverCard>
                            ) : (
                              <Text color={'orange'} weight={'bold'}>
                                TBD
                              </Text>
                            )}
                          </td>
                        )
                      }
                    })}
                  </tr>
                )
              })}
              </tbody>
            </Table>
          )}
        </Box>
      </Flex>
    </Modal>
  );
};

export default ContactAccountFilterModal;
