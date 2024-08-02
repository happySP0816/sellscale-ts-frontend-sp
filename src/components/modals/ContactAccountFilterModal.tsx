import {Box, Flex, Loader, Modal, Switch, Table, Title} from "@mantine/core";
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
  // included_individual_title_keywords: {
  //   value: string[],
  //   dealbreaker: boolean,
  //   is_personalizer: boolean,
  // },
  // excluded_individual_title_keywords: {
  //   value: string[],
  //   dealbreaker: boolean,
  //   is_personalizer: boolean,
  // },
  // included_individual_seniority_keywords: {
  //   value: string[],
  //   dealbreaker: boolean,
  //   is_personalizer: boolean,
  // },
  // excluded_individual_seniority_keywords: {
  //   value: string[],
  //   dealbreaker: boolean,
  //   is_personalizer: boolean,
  // },
  // included_individual_industry_keywords: {
  //   value: string[],
  //   dealbreaker: boolean,
  //   is_personalizer: boolean,
  // },
  // excluded_individual_industry_keywords: {
  //   value: string[],
  //   dealbreaker: boolean,
  //   is_personalizer: boolean,
  // },
  // individual_years_of_experience_start: {
  //   value: number,
  //   dealbreaker: boolean,
  //   is_personalizer: boolean,
  // },
  // individual_years_of_experience_end: {
  //   value: number,
  //   dealbreaker: boolean,
  //   is_personalizer: boolean,
  // },
  // included_individual_skills_keywords: {
  //   value: string[],
  //   dealbreaker: boolean,
  //   is_personalizer: boolean,
  // },
  // excluded_individual_skills_keywords: {
  //   value: string[],
  //   dealbreaker: boolean,
  //   is_personalizer: boolean,
  // },
  // included_individual_locations_keywords: {
  //   value: string[],
  //   dealbreaker: boolean,
  //   is_personalizer: boolean,
  // },
  // excluded_individual_locations_keywords: {
  //   value: string[],
  //   dealbreaker: boolean,
  //   is_personalizer: boolean,
  // },
  // included_individual_generalized_keywords: {
  //   value: string[],
  //   dealbreaker: boolean,
  //   is_personalizer: boolean,
  // },
  // excluded_individual_generalized_keywords: {
  //   value: string[],
  //   dealbreaker: boolean,
  //   is_personalizer: boolean,
  // },
  // included_individual_education_keywords: {
  //   value: string[],
  //   dealbreaker: boolean,
  //   is_personalizer: boolean,
  // },
  // excluded_individual_education_keywords: {
  //   value: string[],
  //   dealbreaker: boolean,
  //   is_personalizer: boolean,
  // },
  // ai_filters: {
  //   value: string | string[] | number,
  //   dealbreaker: boolean,
  //   is_personalizer: boolean,
  // }[]
  [key: string]: {
    value: string | string[] | number,
    dealbreaker: boolean,
    is_personalizer: boolean,
  },
}

type CompanyFilterKeys = "included_company_name_keywords" | "excluded_company_name_keywords" | "included_company_locations_keywords" | "excluded_company_locations_keywords" | "company_size_start" | "company_size_end" | "included_company_industries_keywords" | "excluded_company_industries_keywords" | "included_company_generalized_keywords" | "excluded_company_generalized_keywords"

export interface CompanyFilters {
  // included_company_name_keywords: {
  //   value: string[],
  //   dealbreaker: boolean,
  //   is_personalizer: boolean,
  // },
  // excluded_company_name_keywords: {
  //   value: string[],
  //   dealbreaker: boolean,
  //   is_personalizer: boolean,
  // },
  // included_company_locations_keywords: {
  //   value: string[],
  //   dealbreaker: boolean,
  //   is_personalizer: boolean,
  // },
  // excluded_company_locations_keywords: {
  //   value: string[],
  //   dealbreaker: boolean,
  //   is_personalizer: boolean,
  // },
  // company_size_start: {
  //   value: number,
  //   dealbreaker: boolean,
  //   is_personalizer: boolean,
  // },
  // company_size_end: {
  //   value: number,
  //   dealbreaker: boolean,
  //   is_personalizer: boolean,
  // },
  // included_company_industries_keywords: {
  //   value: string[],
  //   dealbreaker: boolean,
  //   is_personalizer: boolean,
  // },
  // excluded_company_industries_keywords: {
  //   value: string[],
  //   dealbreaker: boolean,
  //   is_personalizer: boolean,
  // },
  // included_company_generalized_keywords: {
  //   value: string[],
  //   dealbreaker: boolean,
  //   is_personalizer: boolean,
  // },
  // excluded_company_generalized_keywords: {
  //   value: string[],
  //   dealbreaker: boolean,
  //   is_personalizer: boolean,
  // },
  // ai_filters: {
  //   value: string | string[] | number,
  //   dealbreaker: boolean,
  //   is_personalizer: boolean,
  // }[]
    [key: string]: {
      value: string | string[] | number,
      dealbreaker: boolean,
      is_personalizer: boolean,
    },

}

export interface ICPScoringRuleset extends ICPScoringRulesetKeys {
  client_archetype_id: number;
  dealbreakers: string[] | null;
  company_ai_filters: string[] | null;
  company_personalizers: string[] | null;
  hash: string | null;
  id: number;
  individual_ai_filters: string[];
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
      {key: "title", title: "Title"},
      {key: "company", title: "Company"},
      {key: "icp_fit_score", title: "score"},]
  );

  const [companyTableHeaders, setCompanyTableHeaders] = useState<TableHeader[]>(
    [{key: "company", title: "Account Name"},
      {key: "icp_company_fit_score", title: "Score"}]
  );

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
  })

  useEffect(() => {
    if (icp_scoring_ruleset) {
      const icp_scoring_ruleset_typed = icp_scoring_ruleset as ICPScoringRuleset;
      const individual_personalizers = icp_scoring_ruleset_typed.individual_personalizers ?? [];
      const company_personalizers = icp_scoring_ruleset_typed.company_personalizers ?? [];
      const dealbreakers = icp_scoring_ruleset_typed.dealbreakers ?? [];
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

        // if it exists, add them to the table as well
        // retrieve icp_score from prospect
        // retrieve icp_reason from prospect

        // retrieve icp_company_score from prospect
        // retrieve icp_company_reason from prospect

        // Assume that icp_reason is formatted as a JSON
        /**
         * {
         *   [key_as_header]: {
         *     answer: "yes/no or maybe/type","
         *     reasoning: "short 1 sentence explanation"
         *   }
         * }
         */
        if (icp_scoring_ruleset_typed[keyType]) {

        }
      })

      // Handling AI filters
      // Working with the assumption that AI questions will ask
      // two things at creation:
      // key / title (will be used as the headers)
    }
  }, [icp_scoring_ruleset])

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
          console.log("prospect: ", prospect);
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
      size={'1000px'}
      style={{height: "700px"}}
    >
      <Title order={4}>
        <Flex justify={'space-between'}>
          {viewMode === "ACCOUNT" ? "Account Market Map" : "Contact Market Map"}
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
      </Title>
      <Flex style={{maxHeight: "700px"}}>
        {isLoading && <Loader />}
        {!isLoading && icp_scoring_ruleset &&
          (
            <MarketMapFilters
              prospects={prospects}
              prospectAccounts={prospectAccounts}
              viewMode={viewMode}
              icp_scoring_ruleset={icp_scoring_ruleset}
            />
          )}
        <Box style={{height: "600px", overflow: "scroll", width: '100%'}}>
          {!isLoading && viewMode === "ACCOUNT" ? (
            <Table>
              <thead>
              <tr>
                {companyTableHeaders.map(item => {
                  return (
                    <th>
                      {item.title}
                    </th>
                  )
                })}
              </tr>
              </thead>
              <tbody>
              {prospectAccounts.map((prospectAccount, index) => {
                const keys = companyTableHeaders.map(h => h.key);

                return (
                  <tr>
                    {keys.map(key => {
                      const keyType = key as keyof ProspectAccounts;

                      return (
                        <td>
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
            <Table>
              <thead>
              <tr>
                {contactTableHeaders.map(item => {
                  return (
                    <th>
                      {item.title}
                    </th>
                  )
                })}
              </tr>
              </thead>
              <tbody>
              {prospects.map((prospect, index) => {
                const keys: string[] = contactTableHeaders.map(h => h.key);

                return (
                  <tr>
                    {keys.map(key => {
                      const keyType = key as keyof Prospect;
                      return (
                        <td>
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
