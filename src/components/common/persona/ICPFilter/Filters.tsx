import { useEffect, useState } from "react";
import {
  InputBase,
  Box,
  Title,
  Select,
  Tabs,
  Button,
  Flex,
  Progress,
  NumberInput,
  Center,
  Text,
  Accordion,
  useMantineTheme,
  rem,
  Badge,
} from "@mantine/core";
import CustomSelect from "./CustomSelect";
import { IconBuildingCommunity, IconPhoto, IconUser } from "@tabler/icons";
import { useForm } from "@mantine/form";
import { set, sum } from "lodash";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  filterProspectsState,
  filterRuleSetState,
} from "@atoms/icpFilterAtoms";
import {
  getICPRuleSet,
  updateICPFiltersBySalesNavURL,
} from "@utils/requests/icpScoring";
import { userTokenState } from "@atoms/userAtoms";
import { currentProjectState } from "@atoms/personaAtoms";
import { getFiltersAutofill } from "@utils/requests/getFiltersAutofill";
import { openConfirmModal, openContextModal } from "@mantine/modals";
import { showNotification } from "@mantine/notifications";
import { useQuery } from "@tanstack/react-query";
import ItemCollapse from "./Filters/ItemCollapse";

function Filters(props: {
  isTesting: boolean;
  selectOptions: { value: string; label: string }[];
  autofill: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const userToken = useRecoilValue(userTokenState);
  const currentProject = useRecoilValue(currentProjectState);
  const [globalRuleSetData, setGlobalRuleSetData] =
    useRecoilState(filterRuleSetState);
  const icpProspects = useRecoilValue(filterProspectsState);

  const [
    included_individual_title_keywords,
    setIncludedIndividualTitleKeywords,
  ] = useState<string[]>([]);
  const [
    excluded_individual_title_keywords,
    setExcludedIndividualTitleKeywords,
  ] = useState<string[]>([]);
  const [
    included_individual_seniority_keywords,
    setIncludedIndividualSeniorityKeywords,
  ] = useState<string[]>([]);
  const [
    excluded_individual_seniority_keywords,
    setExcludedIndividualSeniorityKeywords,
  ] = useState<string[]>([]);
  const [
    included_individual_industry_keywords,
    setIncludedIndividualIndustryKeywords,
  ] = useState<string[]>([]);
  const [
    excluded_individual_industry_keywords,
    setExcludedIndividualIndustryKeywords,
  ] = useState<string[]>([]);
  const [
    individual_years_of_experience_start,
    setIndividualYearsOfExperienceStart,
  ] = useState<number>(0);
  const [
    individual_years_of_experience_end,
    setIndividualYearsOfExperienceEnd,
  ] = useState<number>(0);
  const [
    included_individual_skills_keywords,
    setIncludedIndividualSkillsKeywords,
  ] = useState<string[]>([]);
  const [
    excluded_individual_skills_keywords,
    setExcludedIndividualSkillsKeywords,
  ] = useState<string[]>([]);
  const [
    included_individual_locations_keywords,
    setIncludedIndividualLocationsKeywords,
  ] = useState<string[]>([]);
  const [
    excluded_individual_locations_keywords,
    setExcludedIndividualLocationsKeywords,
  ] = useState<string[]>([]);
  const [
    included_individual_generalized_keywords,
    setIncludedIndividualGeneralizedKeywords,
  ] = useState<string[]>([]);
  const [
    excluded_individual_generalized_keywords,
    setExcludedIndividualGeneralizedKeywords,
  ] = useState<string[]>([]);
  const [
    included_individual_education_keywords,
    setIncludedIndividualEducationKeywords,
  ] = useState<string[]>([]);
  const [
    excluded_individual_education_keywords,
    setExcludedIndividualEducationKeywords,
  ] = useState<string[]>([]);
  const [included_company_name_keywords, setIncludedCompanyNameKeywords] =
    useState<string[]>([]);
  const [excluded_company_name_keywords, setExcludedCompanyNameKeywords] =
    useState<string[]>([]);
  const [
    included_company_locations_keywords,
    setIncludedCompanyLocationsKeywords,
  ] = useState<string[]>([]);
  const [
    excluded_company_locations_keywords,
    setExcludedCompanyLocationsKeywords,
  ] = useState<string[]>([]);
  const [company_size_start, setCompanySizeStart] = useState<number>(0);
  const [company_size_end, setCompanySizeEnd] = useState<number>(0);
  const [
    included_company_industries_keywords,
    setIncludedCompanyIndustriesKeywords,
  ] = useState<string[]>([]);
  const [
    excluded_company_industries_keywords,
    setExcludedCompanyIndustriesKeywords,
  ] = useState<string[]>([]);
  const [
    included_company_generalized_keywords,
    setIncludedCompanyGeneralizedKeywords,
  ] = useState<string[]>([]);
  const [
    excluded_company_generalized_keywords,
    setExcludedCompanyGeneralizedKeywords,
  ] = useState<string[]>([]);

  useQuery({
    queryKey: [`get-icp-filters`, { currentProject }],
    queryFn: async ({ queryKey }) => {
      // @ts-ignore
      // eslint-disable-next-line
      const [_key, { currentProject }] = queryKey;

      if (!currentProject) return null;

      const response = await getICPRuleSet(userToken, currentProject.id);

      if (response.status === "success") {
        setIncludedIndividualTitleKeywords(
          response.data.included_individual_title_keywords ?? []
        );
        setExcludedIndividualTitleKeywords(
          response.data.excluded_individual_title_keywords ?? []
        );
        setIncludedIndividualSeniorityKeywords(
          response.data.included_individual_seniority_keywords ?? []
        );
        setExcludedIndividualSeniorityKeywords(
          response.data.excluded_individual_seniority_keywords ?? []
        );
        setIncludedIndividualIndustryKeywords(
          response.data.included_individual_industry_keywords ?? []
        );
        setExcludedIndividualIndustryKeywords(
          response.data.excluded_individual_industry_keywords ?? []
        );
        setIndividualYearsOfExperienceStart(
          response.data.individual_years_of_experience_start ?? 0
        );
        setIndividualYearsOfExperienceEnd(
          response.data.individual_years_of_experience_end ?? 0
        );
        setIncludedIndividualSkillsKeywords(
          response.data.included_individual_skills_keywords ?? []
        );
        setExcludedIndividualSkillsKeywords(
          response.data.excluded_individual_skills_keywords ?? []
        );
        setIncludedIndividualLocationsKeywords(
          response.data.included_individual_locations_keywords ?? []
        );
        setExcludedIndividualLocationsKeywords(
          response.data.excluded_individual_locations_keywords ?? []
        );
        setIncludedIndividualGeneralizedKeywords(
          response.data.included_individual_generalized_keywords ?? []
        );
        setExcludedIndividualGeneralizedKeywords(
          response.data.excluded_individual_generalized_keywords ?? []
        );
        setIncludedIndividualEducationKeywords(
          response.data.included_individual_education_keywords ?? []
        );
        setExcludedIndividualEducationKeywords(
          response.data.excluded_individual_education_keywords ?? []
        );
        setIncludedCompanyNameKeywords(
          response.data.included_company_name_keywords ?? []
        );
        setExcludedCompanyNameKeywords(
          response.data.excluded_company_name_keywords ?? []
        );
        setIncludedCompanyLocationsKeywords(
          response.data.included_company_locations_keywords ?? []
        );
        setExcludedCompanyLocationsKeywords(
          response.data.excluded_company_locations_keywords ?? []
        );
        setCompanySizeStart(response.data.company_size_start ?? 0);
        setCompanySizeEnd(response.data.company_size_end ?? 0);
        setIncludedCompanyIndustriesKeywords(
          response.data.included_company_industries_keywords ?? []
        );
        setExcludedCompanyIndustriesKeywords(
          response.data.excluded_company_industries_keywords ?? []
        );
        setIncludedCompanyGeneralizedKeywords(
          response.data.included_company_generalized_keywords ?? []
        );
        setExcludedCompanyGeneralizedKeywords(
          response.data.excluded_company_generalized_keywords ?? []
        );
      }
      return null;
    },
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    setGlobalRuleSetData({
      included_individual_title_keywords,
      excluded_individual_title_keywords,
      included_individual_seniority_keywords,
      excluded_individual_seniority_keywords,
      included_individual_industry_keywords,
      excluded_individual_industry_keywords,
      individual_years_of_experience_start,
      individual_years_of_experience_end,
      included_individual_skills_keywords,
      excluded_individual_skills_keywords,
      included_individual_locations_keywords,
      excluded_individual_locations_keywords,
      included_individual_generalized_keywords,
      excluded_individual_generalized_keywords,
      included_company_name_keywords,
      excluded_company_name_keywords,
      included_company_locations_keywords,
      excluded_company_locations_keywords,
      company_size_start,
      company_size_end,
      included_company_industries_keywords,
      excluded_company_industries_keywords,
      included_company_generalized_keywords,
      excluded_company_generalized_keywords,
      included_individual_education_keywords,
      excluded_individual_education_keywords,
    });
  }, [
    included_individual_title_keywords,
    excluded_individual_title_keywords,
    included_individual_seniority_keywords,
    excluded_individual_seniority_keywords,
    included_individual_industry_keywords,
    excluded_individual_industry_keywords,
    individual_years_of_experience_start,
    individual_years_of_experience_end,
    included_individual_skills_keywords,
    excluded_individual_skills_keywords,
    included_individual_locations_keywords,
    excluded_individual_locations_keywords,
    included_individual_generalized_keywords,
    excluded_individual_generalized_keywords,
    included_company_name_keywords,
    excluded_company_name_keywords,
    included_company_locations_keywords,
    excluded_company_locations_keywords,
    company_size_start,
    company_size_end,
    included_company_industries_keywords,
    excluded_company_industries_keywords,
    included_company_generalized_keywords,
    excluded_company_generalized_keywords,
    included_individual_education_keywords,
    excluded_individual_education_keywords,
  ]);

  const titleOptions = [
    ...new Set(icpProspects.map((x) => (x.title ? x.title : ""))),
  ].filter((x) => x);
  const industryOptions = [
    ...new Set(icpProspects.map((x) => x.industry)),
  ].filter((x) => x);
  const companyOptions = [
    ...new Set(icpProspects.map((x) => x.company)),
  ].filter((x) => x);
  const theme = useMantineTheme();
  const sumPersonalOption = sum([
    included_individual_title_keywords.length,
    excluded_individual_title_keywords.length,
    included_individual_seniority_keywords.length,
    excluded_individual_seniority_keywords.length,
    included_individual_industry_keywords.length,
    excluded_individual_industry_keywords.length,
    included_individual_skills_keywords.length,
    excluded_individual_skills_keywords.length,
    included_individual_locations_keywords.length,
    excluded_individual_locations_keywords.length,
    included_individual_generalized_keywords.length,
    excluded_individual_generalized_keywords.length,
    included_individual_education_keywords.length,
    excluded_individual_education_keywords.length,
  ]);
  const sumCompanyOption = sum([
    included_company_name_keywords.length,
    excluded_company_name_keywords.length,
    included_company_locations_keywords.length,
    excluded_company_locations_keywords.length,
    included_company_industries_keywords.length,
    excluded_company_industries_keywords.length,
    included_company_generalized_keywords.length,
    excluded_company_generalized_keywords.length,
  ]);

  return (
    <>
      <Tabs
        mt={"xs"}
        defaultValue="personal"
        styles={{
          panel: {
            paddingLeft: theme.spacing.xs,
            paddingRight: theme.spacing.xs,
            paddingTop: theme.spacing.sm,
            paddingBottom: theme.spacing.sm,
            border: `1px solid ${theme.colors.blue[4]}`,
          },
          tabsList: {
            backgroundColor: theme.colors.blue[4],
            padding: "0.5rem 0.25rem",
            borderTopRightRadius: 12,
            borderTopLeftRadius: 12,
            borderWidth: 0,
          },
          tab: {
            "&[data-active]": {
              borderBottomWidth: 0,
              fontWeight: 600,
              color: theme.white,
              backgroundColor: theme.colors.blue[5],
            },
            borderRadius: 12,
            borderBottomWidth: 0,
            color: theme.white,
            "&:hover": {
              backgroundColor: theme.colors.gray[2],

              "& > span": {
                color: theme.black,
              },
            },
          },
        }}
      >
        <Tabs.List>
          <Tabs.Tab value="personal">
            <Flex align={"center"} gap={"xs"}>
              <Text>Personal</Text>

              <Badge color="gray">{sumPersonalOption}</Badge>
            </Flex>
          </Tabs.Tab>
          <Tabs.Tab value="company">
            <Flex align={"center"} gap={"xs"}>
              <Text>Company</Text>

              <Badge color="gray">{sumCompanyOption}</Badge>
            </Flex>
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="personal" pt="xs">
          <Box
            style={{
              display: "flex",
              gap: "1rem",
              flexDirection: "column",
            }}
          >
            <ItemCollapse
              title={"Title"}
              numberOfItem={
                included_individual_title_keywords.length +
                excluded_individual_title_keywords.length
              }
            >
              <CustomSelect
                maxWidth="30vw"
                value={included_individual_title_keywords}
                label="Included"
                placeholder="Select options"
                setValue={setIncludedIndividualTitleKeywords}
                data={included_individual_title_keywords.concat(titleOptions)}
                setData={setIncludedIndividualTitleKeywords}
              />
              <CustomSelect
                maxWidth="30vw"
                color="red"
                value={excluded_individual_title_keywords}
                label="Excluded"
                placeholder="Select options"
                setValue={setExcludedIndividualTitleKeywords}
                data={excluded_individual_title_keywords.concat(titleOptions)}
                setData={setExcludedIndividualTitleKeywords}
              />
            </ItemCollapse>
            <ItemCollapse
              title={"Seniority"}
              numberOfItem={
                included_individual_seniority_keywords.length +
                excluded_individual_seniority_keywords.length
              }
            >
              <CustomSelect
                maxWidth="30vw"
                value={included_individual_seniority_keywords}
                label="Included"
                placeholder="Select options"
                setValue={setIncludedIndividualSeniorityKeywords}
                data={included_individual_seniority_keywords}
                setData={setIncludedIndividualSeniorityKeywords}
              />
              <CustomSelect
                maxWidth="30vw"
                color="red"
                value={excluded_individual_seniority_keywords}
                label="Excluded"
                placeholder="Select options"
                setValue={setExcludedIndividualSeniorityKeywords}
                data={excluded_individual_seniority_keywords}
                setData={setExcludedIndividualSeniorityKeywords}
              />
            </ItemCollapse>

            <ItemCollapse
              title={"Industry"}
              numberOfItem={
                included_individual_industry_keywords.length +
                excluded_individual_industry_keywords.length
              }
            >
              <CustomSelect
                maxWidth="30vw"
                value={included_individual_industry_keywords}
                label="Included"
                placeholder="Select options"
                setValue={setIncludedIndividualIndustryKeywords}
                data={included_individual_industry_keywords.concat(
                  industryOptions
                )}
                setData={setIncludedIndividualIndustryKeywords}
              />
              <CustomSelect
                maxWidth="30vw"
                value={excluded_individual_industry_keywords}
                label="Excluded"
                color="red"
                placeholder="Select options"
                setValue={setExcludedIndividualIndustryKeywords}
                data={excluded_individual_industry_keywords.concat(
                  industryOptions
                )}
                setData={setExcludedIndividualIndustryKeywords}
              />
            </ItemCollapse>

            <ItemCollapse
              title={"Skills"}
              numberOfItem={
                included_individual_skills_keywords.length +
                excluded_individual_skills_keywords.length
              }
            >
              <CustomSelect
                maxWidth="30vw"
                value={included_individual_skills_keywords}
                label="Included"
                placeholder="Select options"
                setValue={setIncludedIndividualSkillsKeywords}
                data={included_individual_skills_keywords}
                setData={setIncludedIndividualSkillsKeywords}
              />
              <CustomSelect
                maxWidth="30vw"
                value={excluded_individual_skills_keywords}
                label="Excluded"
                color="red"
                placeholder="Select options"
                setValue={setExcludedIndividualSkillsKeywords}
                data={excluded_individual_skills_keywords}
                setData={setExcludedIndividualSkillsKeywords}
              />
            </ItemCollapse>
            <ItemCollapse
              title={"Location"}
              numberOfItem={
                included_individual_locations_keywords.length +
                excluded_individual_locations_keywords.length
              }
            >
              <CustomSelect
                maxWidth="30vw"
                value={included_individual_locations_keywords}
                label="Included"
                placeholder="Select options"
                setValue={setIncludedIndividualLocationsKeywords}
                data={included_individual_locations_keywords.concat([
                  "United States",
                ])}
                setData={setIncludedIndividualLocationsKeywords}
              />
              <CustomSelect
                maxWidth="30vw"
                value={excluded_individual_locations_keywords}
                label="Excluded"
                color="red"
                placeholder="Select options"
                setValue={setExcludedIndividualLocationsKeywords}
                data={excluded_individual_locations_keywords.concat([
                  "United States",
                ])}
                setData={setExcludedIndividualLocationsKeywords}
              />
            </ItemCollapse>
            <ItemCollapse
              title={"Bio & Jobs Description"}
              numberOfItem={
                included_individual_generalized_keywords.length +
                excluded_individual_generalized_keywords.length
              }
            >
              <CustomSelect
                maxWidth="30vw"
                value={included_individual_generalized_keywords}
                label="Included"
                placeholder="Select options"
                setValue={setIncludedIndividualGeneralizedKeywords}
                data={included_individual_generalized_keywords}
                setData={setIncludedIndividualGeneralizedKeywords}
              />
              <CustomSelect
                maxWidth="30vw"
                value={excluded_individual_generalized_keywords}
                label="Excluded"
                color="red"
                placeholder="Select options"
                setValue={setExcludedIndividualGeneralizedKeywords}
                data={excluded_individual_generalized_keywords}
                setData={setExcludedIndividualGeneralizedKeywords}
              />
            </ItemCollapse>

            <ItemCollapse
              title={"University / College"}
              numberOfItem={
                included_individual_education_keywords.length +
                excluded_individual_education_keywords.length
              }
            >
              <CustomSelect
                maxWidth="30vw"
                value={included_individual_education_keywords}
                label="Included"
                placeholder="Select options"
                setValue={setIncludedIndividualEducationKeywords}
                data={included_individual_education_keywords}
                setData={setIncludedIndividualEducationKeywords}
              />
              <CustomSelect
                maxWidth="30vw"
                value={excluded_individual_education_keywords}
                label="Excluded"
                color="red"
                placeholder="Select options"
                setValue={setExcludedIndividualEducationKeywords}
                data={excluded_individual_education_keywords}
                setData={setExcludedIndividualEducationKeywords}
              />
            </ItemCollapse>
            <ItemCollapse title={"Experience"} numberOfItem={0}>
              <Flex direction="column">
                <Title size={"14px"} fw={"500"}>
                  Years of Experience
                </Title>
                <Flex
                  justify={"space-between"}
                  align={"center"}
                  mt={"0.2rem"}
                  w={"100%"}
                  gap={"xs"}
                  maw={"30vw"}
                >
                  <NumberInput
                    value={individual_years_of_experience_start}
                    placeholder="Min"
                    hideControls
                    onChange={(value) =>
                      setIndividualYearsOfExperienceStart(value || 0)
                    }
                  />
                  <NumberInput
                    value={individual_years_of_experience_end}
                    placeholder="Max"
                    hideControls
                    onChange={(value) =>
                      setIndividualYearsOfExperienceEnd(value || 0)
                    }
                  />
                </Flex>
                <Button
                  mt={"0.5rem"}
                  size="sm"
                  ml={"auto"}
                  onClick={() => setIndividualYearsOfExperienceEnd(100)}
                >
                  Max
                </Button>
              </Flex>
            </ItemCollapse>
          </Box>
        </Tabs.Panel>

        <Tabs.Panel value="company" pt="xs">
          <Box
            style={{ display: "flex", gap: "1rem", flexDirection: "column" }}
          >
            <ItemCollapse
              title={"Companies Keywords"}
              numberOfItem={
                included_company_name_keywords.length +
                excluded_company_name_keywords.length
              }
            >
              <CustomSelect
                maxWidth="30vw"
                value={included_company_name_keywords}
                label="Included"
                placeholder="Select options"
                setValue={setIncludedCompanyNameKeywords}
                data={included_company_name_keywords.concat(companyOptions)}
                setData={setIncludedCompanyNameKeywords}
              />
              <CustomSelect
                maxWidth="30vw"
                value={excluded_company_name_keywords}
                label="Excluded"
                color="red"
                placeholder="Select options"
                setValue={setExcludedCompanyNameKeywords}
                data={excluded_company_name_keywords.concat(companyOptions)}
                setData={setExcludedCompanyNameKeywords}
              />
            </ItemCollapse>
            <ItemCollapse
              title={"Location"}
              numberOfItem={
                included_company_locations_keywords.length +
                excluded_company_locations_keywords.length
              }
            >
              <CustomSelect
                maxWidth="30vw"
                value={included_company_locations_keywords}
                label="Included"
                placeholder="Select options"
                setValue={setIncludedCompanyLocationsKeywords}
                data={included_company_locations_keywords.concat([
                  "United States",
                ])}
                setData={setIncludedCompanyLocationsKeywords}
              />
              <CustomSelect
                maxWidth="30vw"
                value={excluded_company_locations_keywords}
                label="Excluded"
                color="red"
                placeholder="Select options"
                setValue={setExcludedCompanyLocationsKeywords}
                data={excluded_company_locations_keywords.concat([
                  "United States",
                ])}
                setData={setExcludedCompanyLocationsKeywords}
              />
            </ItemCollapse>
            <ItemCollapse title="Employee Count" numberOfItem={company_size_start && company_size_end ? 1 : 0}>
              <Flex direction="column" maw={"30vw"}>
                <Box
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "1rem",
                    alignItems: "center",
                    marginTop: "0.2rem",
                  }}
                >
                  <NumberInput
                    value={company_size_start}
                    placeholder="Min"
                    hideControls
                    onChange={(value) => setCompanySizeStart(value || 0)}
                  />
                  <NumberInput
                    value={company_size_end}
                    placeholder="Max"
                    hideControls
                    onChange={(value) => setCompanySizeEnd(value || 0)}
                  />
                </Box>
                <Button
                  mt={"0.5rem"}
                  size="sm"
                  ml={"auto"}
                  onClick={() => setCompanySizeEnd(100_000)}
                >
                  Max
                </Button>
              </Flex>
            </ItemCollapse>
            <ItemCollapse
              title="Industries"
              numberOfItem={
                included_company_industries_keywords.length +
                excluded_company_industries_keywords.length
              }
            >
              <CustomSelect
                maxWidth="30vw"
                value={included_company_industries_keywords}
                label="Included"
                placeholder="Select options"
                setValue={setIncludedCompanyIndustriesKeywords}
                data={included_company_industries_keywords.concat(
                  industryOptions
                )}
                setData={setIncludedCompanyIndustriesKeywords}
              />
              <CustomSelect
                maxWidth="30vw"
                value={excluded_company_industries_keywords}
                label="Excluded"
                color="red"
                placeholder="Select options"
                setValue={setExcludedCompanyIndustriesKeywords}
                data={excluded_company_industries_keywords.concat(
                  industryOptions
                )}
                setData={setExcludedCompanyIndustriesKeywords}
              />
            </ItemCollapse>
            <ItemCollapse
              title="Company Description"
              numberOfItem={
                included_company_generalized_keywords.length +
                excluded_company_generalized_keywords.length
              }
            >
              <CustomSelect
                maxWidth="30vw"
                value={included_company_generalized_keywords}
                label="Included"
                placeholder="Select options"
                setValue={setIncludedCompanyGeneralizedKeywords}
                data={included_company_generalized_keywords}
                setData={setIncludedCompanyGeneralizedKeywords}
              />
              <CustomSelect
                maxWidth="30vw"
                value={excluded_company_generalized_keywords}
                label="Excluded"
                color="red"
                placeholder="Select options"
                setValue={setExcludedCompanyGeneralizedKeywords}
                data={excluded_company_generalized_keywords}
                setData={setExcludedCompanyGeneralizedKeywords}
              />
            </ItemCollapse>
          </Box>
        </Tabs.Panel>
      </Tabs>
      {/* <Accordion
        defaultValue="personal"
        styles={{
          panel: {
            backgroundColor: "transparent",
          },

          item: {
            marginBottom: rem(12),
            border: `1px solid ${theme.colors.gray[2]}`,
            borderRadius: 12,

            "&[data-active]": {
              borderColor: theme.colors.blue[4],
              "& > button": {
                backgroundColor: theme.colors.blue[4],
                color: theme.white,
                borderBottomLeftRadius: 0,
                borderBottomRightRadius: 0,
              },
            },

            "&:last-of-type": {
              marginBottom: 0,
            },
          },
          control: {
            borderRadius: 12,

            background: "transparent",
            "&:hover": {
              backgroundColor: theme.colors.gray[2],

              "& > span": {
                color: theme.black,
              },
            },

            "& > span": {
              fontWeight: 600,
            },
          },
          content: {
            paddingLeft: theme.spacing.xs,
            paddingRight: theme.spacing.xs,
            paddingTop: theme.spacing.sm,
            paddingBottom: theme.spacing.sm,
          },
        }}
        mt={"md"}
        bg={"white"}
      >
        <Accordion.Item value="Person">
          <Accordion.Control>
            <Flex align={"center"} gap={"xs"}>
              <Text>Personal</Text>

              <Badge color="gray">{sumPersonalOption}</Badge>
            </Flex>
          </Accordion.Control>
          <Accordion.Panel></Accordion.Panel>
        </Accordion.Item>

        <Accordion.Item value="company">
          <Accordion.Control>
            <Flex align={"center"} gap={"xs"}>
              <Text>Company</Text>

              <Badge color="gray">{sumCompanyOption}</Badge>
            </Flex>
          </Accordion.Control>
          <Accordion.Panel>

          </Accordion.Panel>
        </Accordion.Item>
      </Accordion> */}
      {props.autofill && (
        <Flex align={"center"} justify={"space-between"}>
          <Button
            // mt='xs'
            variant="light"
            loading={loading}
            onClick={async () => {
              openConfirmModal({
                title: "Override existing filters?",
                children: (
                  <Text>
                    Are you sure you want to override existing filters? This
                    action cannot be undone.
                  </Text>
                ),
                labels: { confirm: "Confirm", cancel: "Cancel" },
                onCancel: () => {},
                onConfirm: () => {
                  (async () => {
                    if (!currentProject) return;
                    setLoading(true);
                    const response = await getFiltersAutofill(
                      userToken,
                      currentProject.id
                    );
                    const results = response.data;
                    console.log(results);
                    setIncludedIndividualTitleKeywords(results.job_titles);
                    setIncludedIndividualIndustryKeywords(results.industries);
                    setCompanySizeStart(results.yoe.min);
                    setCompanySizeEnd(results.yoe.max);
                    setLoading(false);

                    showNotification({
                      title: "Filters autofilled",
                      message:
                        "Filters have been autofilled based on your prospects",
                    });
                  })();
                },
              });
            }}
          >
            AI Autofill
          </Button>
          <Button
            onClick={async () => {
              openContextModal({
                modal: "salesNavURL",
                title: "Improt Filters from Sales Nav URL",
                innerProps: {},
              });
            }}
            size="md"
            compact
          >
            Import from Sales Nav URL
          </Button>
        </Flex>
      )}
    </>
  );
}

export default Filters;
