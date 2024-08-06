import {Box, Checkbox, Flex, Loader, Modal, Switch, Table, Title, Text} from "@mantine/core";
import {useEffect, useState} from "react";
import {Prospect} from "../../index";
import {useQuery} from "@tanstack/react-query";
import {TransformedSegment} from "@pages/SegmentV3/SegmentV3";
import {API_URL} from "@constants/data";
import {useRecoilValue} from "recoil";
import {userTokenState} from "@atoms/userAtoms";
import MarketMapFilters from "@pages/SegmentV3/MarketMapFilters";

interface ContactAccountFilterModalProps {
  showContactAccountFilterModal: boolean,
  setShowContactAccountFilterModal: (showModal: boolean) => void,
  segment?: TransformedSegment,
}

export type ViewMode = "ACCOUNT" | "CONTACT";

interface TableHeader {
  key: string,
  title: string,
}

export interface ProspectAccounts {
  [key: string]: string | number;
}

export interface IndividualFilters {
  [key: string]: {
    value: string | string[] | number,
    dealbreaker: boolean,
    is_personalizer: boolean,
  },
}

export interface CompanyFilters {
    [key: string]: {
      value: string | string[] | number,
      dealbreaker: boolean,
      is_personalizer: boolean,
    },
}

export interface AIFilters {
  key: string,
  title: string,
  prompt: string,
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

  const [contactTableHeaders, setContactTableHeaders] = useState<TableHeader[]>(
    [{key: "full_name", title: "Full Name"},
      {key: "icp_fit_score", title: "Score"},
      {key: "icp_company_fit_score", title: "Company Score"}
    ]
  );

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

  useEffect(() => {
    // In here, we will select the reasons that says yes.
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
    enabled: !!segment
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
  });

  const icp_scoring_ruleset_typed = icp_scoring_ruleset as ICPScoringRuleset;

  useEffect(() => {
    if (icp_scoring_ruleset_typed) {
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
      icp_scoring_ruleset_keys.forEach(key => {
        const keyType = key as keyof ICPScoringRulesetKeys;

        if (icp_scoring_ruleset_typed[keyType]) {
          const title = keyType.split("_").join(" ");

          if (keyType.includes("individual")) {
            setContactTableHeaders(prevState => {
              return [...prevState, {key: keyType, title: title}]
            })
          }
          else if (keyType.includes("company")) {
            setCompanyTableHeaders(prevState => {
              return [...prevState, {key: keyType, title: title}]
           })
          }
        }
      })

      // Handling AI filters
      individual_ai_filters.forEach(ai_filter => {
        setContactTableHeaders(prevState => {
          return [...prevState, {key: ai_filter.key, title: ai_filter.title}]
        })
      })

      company_ai_filters.forEach(ai_filter => {
        setCompanyTableHeaders(prevState => {
          return [...prevState, {key: ai_filter.key, title: ai_filter.title}]
        })
      })
      // Working with the assumption that AI questions will ask
      // two things at creation:
      // key / title (will be used as the headers)
    }
  }, [icp_scoring_ruleset]);

  useEffect(() => {
    if (data) {
      const prospectData = data as Prospect[];

      setProspects(prospectData);

      const companySet = new Set();
      const finalCompanyData: ProspectAccounts[] = [];

      prospectData.forEach(prospect => {
        const prospectCompanyName = prospect.company;

        if (!companySet.has(prospectCompanyName)) {
          companySet.add(prospectCompanyName);
          // Add to final Company Data
          // Have columns for them like scoring
          // Make new column for icp_fit_reason_v2
          // Json key value pair of header_key, and reasoning
          finalCompanyData.push({"company": prospectCompanyName,
            "icp_company_fit_score": prospect.icp_company_fit_score})
        }
      })

      setProspectAccounts(finalCompanyData);
    }
  }, [data]);

  return (
    <Modal
      onClose={() => setShowContactAccountFilterModal(false)}
      opened={showContactAccountFilterModal}
      size={'1100px'}
      style={{maxHeight: "700px"}}
      title={
      <Flex justify={'space-between'} gap={'24px'}>
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
            />
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
                    <th key={item.title}>
                      <Flex direction={'column'}>
                        {item.title}
                        {item.key !== "company" && item.key !==  "icp_company_fit_score" && (
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
                      const keyType = key as keyof ProspectAccounts;

                      return (
                        <td key={prospectAccount[keyType]} style={{maxWidth: "300px"}}>
                          {prospectAccount[keyType]}
                        </td>
                      )
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
                        {item.key !== "full_name" && item.key !==  "icp_fit_score" && item.key !== "icp_company_fit_score" && (
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
              {prospects.map((prospect, index) => {
                const keys: string[] = contactTableHeaders.map(h => h.key);

                return (
                  <tr key={prospect.id}
                      style={{ backgroundColor: selectedContacts.has(prospect.id) ? "lightcyan" : "white"}}>
                    <td>
                      <Checkbox
                        checked={selectedContacts.has(prospect.id)}
                        onChange={() => handleSelectContact(prospect.id)}
                      />
                    </td>
                    {keys.map(key => {
                      const keyType = key as keyof Prospect;
                      return (
                        <td key={prospect[keyType]} style={{maxWidth: "300px"}}>
                          {prospect[keyType]}
                        </td>
                      )
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
