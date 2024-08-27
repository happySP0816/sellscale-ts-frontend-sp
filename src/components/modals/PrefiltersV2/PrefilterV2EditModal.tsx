import { userTokenState } from "@atoms/userAtoms";
import CustomSelect from "@common/persona/ICPFilter/CustomSelect";
import { API_URL } from "@constants/data";
import {
  Accordion,
  Avatar,
  Box,
  Center,
  Badge,
  Flex,
  Paper,
  SegmentedControl,
  Stack,
  Text,
  TextInput,
  useMantineTheme,
  Button,
  ScrollArea,
  Select,
  MultiSelect,
  Textarea,
  Title,
} from "@mantine/core";
import { closeAllModals, openContextModal } from "@mantine/modals";
import { showNotification } from "@mantine/notifications";
import { IconBrandLinkedin, IconCircleCheck, IconFilter, IconLink, IconPlus, IconSearch, IconUsers } from "@tabler/icons";
import { nameToInitials, valueToColor } from "@utils/general";
import e from "cors";
import { debounce } from "lodash";
import { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import CreateSegmentModal from "./CreateSegmentModal";


interface AccordionItemProps {
  value: string;
  label: string;
  isActive: boolean;
  children: React.ReactNode;
  amount?: number;
}

const CustomAccordionItem = ({ value, label, isActive, children, amount }: AccordionItemProps) => (
  <Accordion.Item value={value}>
    <Accordion.Control>
      <Flex align="center" gap="xs">
        <span>{label}</span>
        {isActive && <Badge color="green">Active</Badge>}
        {amount !== undefined && amount !== 0 && <Badge>{amount} entries</Badge>}
      </Flex>
    </Accordion.Control>
    <Accordion.Panel>{children}</Accordion.Panel>
  </Accordion.Item>
);


export default function PreFiltersV2EditModal({ innerProps, context, id }: { innerProps: any, context: any, id: string }) {
  const saved_query_id = innerProps.id;
  const isIcpFilter = innerProps.isIcpFilter || false;
  const hideSaveFeature = innerProps.hide_save_feature || false;
  const [somethingWasAltered, setSomethingWasAltered] = useState(false);

  const theme = useMantineTheme();

  const userToken = useRecoilValue(userTokenState);

  const [name, setName] = useState<string>("");
  const [jobTitles, setJobTitles] = useState<string[]>([]);
  const [seniority, setSeniority] = useState<string[]>([]);
  const [excludedJobTitles, setExcludedJobTitles] = useState<string[]>([]);
  const [industry, setIndustry] = useState<string[]>([]);
  const [industryOptions, setIndustryOptions] = useState<string[]>([]);
  const [industryOptionsWithIds, setIndustryOptionsWithIds] = useState<any>({});
  const [revenue, setRevenue] = useState<{ min: string; max: string }>({ min: "", max: "" });
  const [companyName, setcompanyName] = useState<string>("");
  const [companyKeywords, setCompanyKeywords] = useState<string[]>([]);
  const [selectedCompanies, setselectedCompanies] = useState<string[]>([]);
  const [fetchingCompanyOptions, setFetchingCompanyOptions] = useState<boolean>(false);
  const [companyOptions, setCompanyOptions] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [experience, setExperience] = useState<string>("");
  const [fundraise, setFundraise] = useState<string[]>([]);
  const [filterName, setFilterName] = useState<string>("");
  const [companyDomain, setCompanyDomain] = useState<string>("");
  const [aiPrompt, setAiPrompt] = useState<string>("");
  const [selectedNumEmployees, setSelectedNumEmployees] = useState<string[]>([]);
  const [technology, setTechnology] = useState<string[]>([]);
  const [technologyOptionsWithUids, setTechnologyOptionsWithUids] = useState<any>({});
  const [technologyOptions, setTechnologyOptions] = useState<string[]>([]);
  const [eventTypes, setEventTypes] = useState<string[]>([]);
  const [days, setDays] = useState<number>(0);
  const [recentNews, setRecentNews] = useState<string[]>([]);
  const [departmentMinCount, setDepartmentMinCount] = useState<number>(0);
  const [departmentMaxCount, setDepartmentMaxCount] = useState<number>(0);
  const [currentSavedQueryId, setCurrentSavedQueryId] = useState<number | undefined>(undefined);
  const [createSegmentOpened, setCreateSegmentOpened] = useState(false);
  const [prefilters, setPrefilters] = useState<any[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [showApplyButton, setShowApplyButton] = useState(false);

  const [prospects, setProspects] = useState([]);
  const [loadingProspects, setLoadingProsepcts] = useState(false);
  const [totalFound, setTotalFound] = useState(innerProps.numResults || 0);


  // return (
  //   <iframe
  //     src={
  //       "https://sellscale.retool.com/embedded/public/7559b6ce-6f20-4649-9240-a2dd6429323e#authToken=" +
  //       userToken + "&id=" + saved_query_id
  //     }
  //     width={"100%"}
  //     height={window.innerHeight}
  //     frameBorder={0}
  //     allowFullScreen
  //   />
  // )

  const handleApply = async () => {
    if (!selectedFilter) return;
    innerProps.id = Number(selectedFilter);
    setShowApplyButton(false);
    setCurrentSavedQueryId(prefilters.find((prefilter) => prefilter.id === Number(selectedFilter))?.id);
  };

  const fetchSavedQueries = async () => {
    try {
      const response = await fetch(`${API_URL}/apollo/get_all_saved_queries`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
      });
      const data = await response.json();
      if (data.status === "success") {
        const formattedPrefilters = data.data.map((query: any) => ({
          title: query.custom_name,
          id: query.id,
          prospects: query.num_results,
          status: true, // Assuming all fetched queries are active by default
        }));
        setPrefilters(formattedPrefilters);
      } else {
        console.error("Failed to fetch saved queries:", data);
      }
    } catch (error) {
      console.error("Error fetching saved queries:", error);
    }
  };

  useEffect(() => {
    fetchSavedQueries();
  }, [userToken]);


const mergeSavedQueries = async (saved_query_id: number) => {
  if (saved_query_id !== undefined) {
    try {
      const response = await fetch(`${API_URL}/apollo/get_saved_query/${saved_query_id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${userToken}`,
        },
      });
      const data = await response.json();
      if (data.status === "success") {
        const queryDetails = data.data;

        setFilterName((prev) => queryDetails.data.custom_name || prev);
        setName((prev) => queryDetails.data.q_person_name || prev);
        setJobTitles((prev) => Array.from(new Set([...prev, ...(queryDetails.data.person_titles || [])])));
        setSeniority((prev) => Array.from(new Set([...prev, ...(queryDetails.data.person_seniorities || [])])));
        setExcludedJobTitles((prev) => Array.from(new Set([...prev, ...(queryDetails.data.person_not_titles || [])])));

        const industryBreadcrumbs = queryDetails.results.breadcrumbs.filter((breadcrumb: any) => breadcrumb.label === "Industry");
        if (industryBreadcrumbs.length > 0) {
          const industryNames = industryBreadcrumbs.map((breadcrumb: any) => breadcrumb.display_name);
          const industryIds = industryBreadcrumbs.reduce((acc: any, breadcrumb: any) => {
            acc[breadcrumb.display_name] = breadcrumb.value;
            return acc;
          }, {});

          setIndustry((prev) => Array.from(new Set([...prev, ...industryNames])));
          setIndustryOptions((prevOptions: string[]) => Array.from(new Set([...prevOptions, ...industryNames])));
          setIndustryOptionsWithIds((prevOptions: any) => ({
            ...prevOptions,
            ...industryIds,
          }));
        } else {
          setIndustry((prev) => Array.from(new Set([...prev, ...(queryDetails.data.organization_industry_tag_ids || [])])));
        }

        setRevenue((prev) => ({
          min: queryDetails.data.revenue_range?.min ? String(queryDetails.data.revenue_range.min) : prev.min,
          max: queryDetails.data.revenue_range?.max ? String(queryDetails.data.revenue_range.max) : prev.max,
        }));

        setcompanyName((prev) => queryDetails.data.q_person_title || prev);
        setCompanyKeywords((prev) => queryDetails.data.q_organization_keyword_tags || prev);

        const companyBreadcrumbs = queryDetails.results.breadcrumbs.filter((breadcrumb: any) => breadcrumb.label === "Companies");
        if (companyBreadcrumbs.length > 0) {
          const companyNames = companyBreadcrumbs.map((breadcrumb: any) => breadcrumb.value);
          const companyOptions = companyBreadcrumbs.map((breadcrumb: any) => ({
            label: breadcrumb.display_name,
            value: breadcrumb.value,
            logo_url: breadcrumb.logo_url || ""
          }));

          setselectedCompanies((prev) => Array.from(new Set([...prev, ...companyNames])));
          setCompanyOptions((prevOptions: any[]) => Array.from(new Set([...prevOptions, ...companyOptions])));
        } else {
          setselectedCompanies((prev) => Array.from(new Set([...prev, ...(queryDetails.data.organization_ids || [])])));
        }

        setLocations((prev) => Array.from(new Set([...(prev || []), ...(queryDetails.data.person_locations || [])])) as any);
        setExperience((prev) => queryDetails.data.person_seniorities || prev);
        setFundraise((prev) => Array.from(new Set([...prev, ...(queryDetails.data.organization_latest_funding_stage_cd || [])])));
        setCompanyDomain((prev) => queryDetails.data.q_organization_search_list_id || prev);
        setAiPrompt((prev) => prev); // Assuming no change needed
        setSelectedNumEmployees((prev) => Array.from(new Set([...prev, ...(queryDetails.data.organization_num_employees_ranges || [])])));
        
        const technologyBreadcrumbs = queryDetails.results.breadcrumbs.filter((breadcrumb: any) => breadcrumb.label === "Use at least one of");
        if (technologyBreadcrumbs.length > 0) {
          const technologyNames = technologyBreadcrumbs.map((breadcrumb: any) => breadcrumb.display_name);
          const technologyUids = technologyBreadcrumbs.reduce((acc: any, breadcrumb: any) => {
            acc[breadcrumb.display_name] = breadcrumb.value;
            return acc;
          }, {});

          setTechnology((prev) => Array.from(new Set([...prev, ...technologyNames])));
          setTechnologyOptions((prevOptions: string[]) => Array.from(new Set([...prevOptions, ...technologyNames])));
          setTechnologyOptionsWithUids((prevOptions: any) => ({
            ...prevOptions,
            ...technologyUids,
          }));
        } else {
          setTechnology((prev) => Array.from(new Set([...prev, ...(queryDetails.data.currently_using_any_of_technology_uids || [])])));
        }

        setEventTypes((prev) => Array.from(new Set([...prev, ...(queryDetails.data.event_categories || [])])));
        setDays((prev) => queryDetails.data.published_at_date_range ? parseInt(queryDetails.data.published_at_date_range.min.replace("_days_ago", ""), 10) : prev);
        setRecentNews((prev) => queryDetails.data.q_organization_keyword_tags || prev);
        setDepartmentMinCount((prev) => queryDetails.data.organization_department_or_subdepartment_counts?.min || prev);
        setDepartmentMaxCount((prev) => queryDetails.data.organization_department_or_subdepartment_counts?.max || prev);

        const newProspects = queryDetails.results.people.map((person: any) => ({
          avatar: person.photo_url,
          name: `${person.first_name} ${person.last_name}`,
          linkedin: !!person.linkedin_url,
          linkedin_url: person.linkedin_url,
          email: !!person.email,
          prospects: "",
          job: person.headline,
          filter: {
            ...(name && { name: person?.name }),
            ...(selectedNumEmployees.length && { company_headcount: person.organization.organization_num_employees_ranges }),
            ...(experience.length && { position: person.seniority }),
            ...(locations.length && { location: person.city }),
            ...(selectedCompanies.length && { company: person.organization?.name }),
            ...(typeof revenue === 'object' && (revenue.min || revenue.max) && { revenue: person.organization.revenue }),
            ...(fundraise.length && { funding_stage: person.organization.latest_funding_stage }),
            ...(technology.length && { technology: person.organization.technology }),
            ...(days && { published_at: person.organization.published_at }),
            ...(eventTypes.length && { event_category: person.organization.event_category }),
          },
        }));

        // setTotalFound((prev) => prev + (queryDetails.results.pagination.total_entries > 100 ? queryDetails.results.pagination.total_entries : queryDetails.results.people.length) || 0);
        setProspects([]);
      } else {
        console.error("Failed to fetch saved query:", data);
      }
    } catch (error) {
      console.error("Error fetching saved query:", error);
    }
  }
};


  useEffect(() => {
      setSomethingWasAltered(true);
  }, [jobTitles, name, seniority, excludedJobTitles, industry, revenue, companyName, companyKeywords, selectedCompanies, locations, experience, fundraise, companyDomain, aiPrompt, selectedNumEmployees, technology, eventTypes, days, recentNews, departmentMinCount, departmentMaxCount]);

  useEffect(() => {
    setTimeout(() => setSomethingWasAltered(false), 0);
    const fetchSavedQuery = async () => {
      if (saved_query_id !== undefined) {
        try {
          const response = await fetch(`${API_URL}/apollo/get_saved_query/${saved_query_id}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${userToken}`,
            },
          });
          const data = await response.json();
          if (data.status === "success") {
            setFilterName(data.data.custom_name || "");
            const queryDetails = data.data;
            setName(queryDetails.data.q_person_name || "");
            setJobTitles(queryDetails.data.person_titles || []);
            setSeniority(queryDetails.data.person_seniorities || []);
            setExcludedJobTitles(queryDetails.data.person_not_titles || []);
            const industryBreadcrumbs = queryDetails.results.breadcrumbs.filter((breadcrumb: any) => breadcrumb.label === "Industry");
            if (industryBreadcrumbs.length > 0) {
              const industryNames = industryBreadcrumbs.map((breadcrumb: any) => breadcrumb.display_name);
              const industryIds = industryBreadcrumbs.reduce((acc: any, breadcrumb: any) => {
                acc[breadcrumb.display_name] = breadcrumb.value;
                return acc;
              }, {});

              setIndustry(industryNames);
              setIndustryOptions((prevOptions: string[]) => Array.from(new Set([...prevOptions, ...industryNames])));
              setIndustryOptionsWithIds((prevOptions: any) => ({
                ...prevOptions,
                ...industryIds,
              }));
            } else {
              setIndustry(queryDetails.data.organization_industry_tag_ids || []);
            }
            setRevenue({
              min: queryDetails.data.revenue_range?.min ? String(queryDetails.data.revenue_range.min) : "",
              max: queryDetails.data.revenue_range?.max ? String(queryDetails.data.revenue_range.max) : ""
            });
            setcompanyName(queryDetails.data.q_person_title || "");
            setCompanyKeywords(queryDetails.data.q_organization_keyword_tags || "");
            const companyBreadcrumbs = queryDetails.results.breadcrumbs.filter((breadcrumb: any) => breadcrumb.label === "Companies");
            if (companyBreadcrumbs.length > 0) {
              const companyNames = companyBreadcrumbs.map((breadcrumb: any) => breadcrumb.value);
              const companyOptions = companyBreadcrumbs.map((breadcrumb: any) => ({
                label: breadcrumb.display_name,
                value: breadcrumb.value,
                logo_url: breadcrumb.logo_url || ""
              }));

              setselectedCompanies(companyNames);
              setCompanyOptions((prevOptions: any[]) => Array.from(new Set([...prevOptions, ...companyOptions])));
            } else {
              setselectedCompanies(queryDetails.data.organization_ids || []);
            }
            setLocations(queryDetails.data.person_locations || []);
            setExperience(queryDetails.data.person_seniorities || "");
            setFundraise(queryDetails.data.organization_latest_funding_stage_cd || []);
            setFilterName(queryDetails.custom_name || "");
            setCompanyDomain(queryDetails.data.q_organization_search_list_id || "");
            setAiPrompt("");
            setSelectedNumEmployees(queryDetails.data.organization_num_employees_ranges || []);
            const technologyBreadcrumbs = queryDetails.results.breadcrumbs.filter((breadcrumb: any) => breadcrumb.label === "Use at least one of");

            if (technologyBreadcrumbs.length > 0) {
              const technologyNames = technologyBreadcrumbs.map((breadcrumb: any) => breadcrumb.display_name);
              const technologyUids = technologyBreadcrumbs.reduce((acc: any, breadcrumb: any) => {
                acc[breadcrumb.display_name] = breadcrumb.value;
                return acc;
              }, {});

              setTechnology(technologyNames);
              setTechnologyOptions((prevOptions: string[]) => Array.from(new Set([...prevOptions, ...technologyNames])));
              setTechnologyOptionsWithUids((prevOptions: any) => ({
                ...prevOptions,
                ...technologyUids,
              }));
            } else {
              setTechnology(queryDetails.data.currently_using_any_of_technology_uids || []);
            }
            setEventTypes(queryDetails.data.event_categories || []);
            setDays(queryDetails.data.published_at_date_range ? parseInt(queryDetails.data.published_at_date_range.min.replace("_days_ago", ""), 10) : 0);
            setRecentNews(queryDetails.data.q_organization_keyword_tags || []);
            setDepartmentMinCount(queryDetails.data.organization_department_or_subdepartment_counts?.min || 0);
            setDepartmentMaxCount(queryDetails.data.organization_department_or_subdepartment_counts?.max || 0);
            // setCurrentSavedQueryId(queryDetails.client_sdr_id || undefined);
            const newProspects = queryDetails.results.people.map((person: { photo_url: any; first_name: any; last_name: any; linkedin_url: any; email: any; headline: any; name: any; organization: { organization_num_employees_ranges: any; name: any; revenue: any; latest_funding_stage: any; technology: any; published_at: any; event_category: any; }; seniority: any; city: any; }) => ({
              avatar: person.photo_url,
              name: `${person.first_name} ${person.last_name}`,
              linkedin: !!person.linkedin_url,
              linkedin_url: person.linkedin_url,
              email: !!person.email,
              prospects: "",
              job: person.headline,
              filter: {
                ...(name && { name: person?.name }),
                ...(selectedNumEmployees.length && { company_headcount: person.organization.organization_num_employees_ranges }),
                ...(experience.length && { position: person.seniority }),
                // ...(industry.length && { industry: person.organization.industry }),
                ...(locations.length && { location: person.city }),
                ...(selectedCompanies.length && { company: person.organization?.name }),
                ...(typeof revenue === 'object' && (revenue.min || revenue.max) && { revenue: person.organization.revenue }),
                ...(fundraise.length && { funding_stage: person.organization.latest_funding_stage }),
                ...(technology.length && { technology: person.organization.technology }),
                ...(days && { published_at: person.organization.published_at }),
                ...(eventTypes.length && { event_category: person.organization.event_category }),
              },
            }));
            // console.log('pagination is ', queryDetails.results.);
            setTotalFound(((queryDetails.results.pagination.total_entries > 100? queryDetails.results.pagination.total_entries: queryDetails.results.people.length)) || 0);
            setProspects(newProspects || []);
          } else {
            console.error("Failed to fetch saved query:", data);
          }
        } catch (error) {
          console.error("Error fetching saved query:", error);
        } finally {
          setTimeout(() => setSomethingWasAltered(false), 0);
        }
      }
    };

    fetchSavedQuery();
  }, [saved_query_id, userToken]);

  const saveFilter = async (saved_query_id?: number, prev_query?: number) => {
    try {
      console.log('recent a',currentSavedQueryId);
      const response = await fetch(`${API_URL}/apollo/save_query`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          //saved query id is if its editing
          editingQuery: saved_query_id,
          currentSavedQueryId: prev_query || currentSavedQueryId,
          name: filterName,
        }),
      });
      setCurrentSavedQueryId(prev_query || currentSavedQueryId);
      const data = await response.json();
      if (response.ok) {
        showNotification({
          title: 'Success',
          message: 'Filter saved successfully',
          color: 'green',
        });
        // Assuming you have a function to close all modals
        // closeAllModals();
      } else {
        console.error("Error:", data);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }
  const generateQueryPayload = () => {
    const selectedCompanyLabels = selectedCompanies.map((id: any) => {
      const company = companyOptions.find((option: any) => option.value === id) as any;
      return company ? company.label: id;
    });
    return {
      "query_full_name": name,
      "included_title_keywords": jobTitles,
      "excluded_title_keywords": excludedJobTitles,
      "query_titles": name,
      "included_seniority_keywords": seniority,
      "excluded_seniority_keywords": [],
      "included_industries_keywords": industry.map(ind => industryOptionsWithIds[ind]),
      "excluded_industries_keywords": [],
      "included_company_keywords": selectedCompanyLabels,
      "excluded_company_keywords": [],
      "included_education_keywords": [],
      "excluded_education_keywords": [],
      "included_bio_keywords": [],
      "excluded_bio_keywords": [],
      "included_location_keywords": locations,
      "excluded_location_keywords": [],
      "included_skills_keywords": [],
      "excluded_skills_keywords": [],
      "years_of_experience_start": [],
      "years_of_experience_end": [],
      "included_fundraise": fundraise,
      "included_company_size": selectedNumEmployees,
      "included_revenue": { 'min': revenue.min, 'max': revenue.max },
      "included_technology": technology.map(tech => technologyOptionsWithUids[tech]),
      "included_news_event_type": eventTypes
    };
  };

  const searchProspects = async () => {
    setLoadingProsepcts(true);
    try {
      const response = await fetch(`${API_URL}/contacts/search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          is_prefilter: !isIcpFilter && !hideSaveFeature,
          is_icp_filter: isIcpFilter,
          editing_query: hideSaveFeature ? undefined : currentSavedQueryId,
          num_contacts: 100,
          q_organization_keyword_tags: companyKeywords.length ? companyKeywords : undefined,
          organization_latest_funding_stage_cd: fundraise.length ? fundraise : undefined,
          person_seniorities: seniority,
          per_page: 100,
          organization_num_employees_ranges: selectedNumEmployees.length ? selectedNumEmployees : undefined,
          person_not_titles: excludedJobTitles.length ? excludedJobTitles : undefined, // works
          person_titles: jobTitles.length ? jobTitles : undefined, // works
          q_person_name: name || undefined, // works
          organization_industry_tag_ids: industry.length ? industry.map(ind => industryOptionsWithIds[ind]) : undefined, // works
          // organization_num_employees_range: selectedNumEmployees.length ? selectedNumEmployees : undefined, // does not work in retool either
          person_locations: locations.length ? locations : undefined,//works
          organization_ids: selectedCompanies.length? selectedCompanies : undefined, //works
          companyName: companyName || undefined, //sent alongside organization_ids so we can add company names to our db. caching purposes
          revenue_range: revenue.min || revenue.max ? { min: parseInt(revenue?.min?.replaceAll(',',''), 10) || undefined, max: parseInt(revenue?.max?.replaceAll(',',''), 10) || undefined } : undefined, //works
          // organization_latest_funding_stages: fundraise.length ? fundraise : undefined, 
          currently_using_any_of_technology_uids: technology.length ? technology.map(tech => technologyOptionsWithUids[tech]) : undefined,
          // person_seniorities: experience.length ? experience : undefined,
          published_at_date_range: days ? { "min": String(days) + "_days_ago" } : undefined, // works
          // q_organization_search_list_id: companyDomain.length ? companyDomain.split("\n") : undefined,
          event_categories: eventTypes.length ? eventTypes : undefined, // works
          // organization_department_or_subdepartment_headcount_min_max_value: {
          //   min: departmentMinCount || undefined,
          //   max: departmentMaxCount || undefined
          // },
          // organization_department_or_subdepartment_counts: experience.length ? experience : undefined,
         // q_organization_keyword_tags: eventTypes.length ? eventTypes : undefined,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        if (!hideSaveFeature) {
          saveFilter(saved_query_id, data?.saved_query_id);
        }
        setCurrentSavedQueryId(data?.saved_query_id);
        //search & save filter
        const newProspects = data.people.map((person: { photo_url: any; first_name: any; last_name: any; linkedin_url: any; email: any; headline: any; name: any; organization: { organization_num_employees_ranges: any; name: any; revenue: any; latest_funding_stage: any; technology: any; published_at: any; event_category: any; }; seniority: any; city: any; }) => ({
          avatar: person.photo_url,
          name: `${person.first_name} ${person.last_name}`,
          linkedin: !!person.linkedin_url,
          email: !!person.email,
          prospects: "",
          job: person.headline,
          filter: {
            ...(name && { name: person?.name }),
            ...(selectedNumEmployees.length && { company_headcount: person.organization.organization_num_employees_ranges }),
            ...(experience.length && { position: person.seniority }),
            // ...(industry.length && { industry: person.organization.industry }),
            ...(locations.length && { location: person.city }),
            ...(selectedCompanies.length && { company: person.organization?.name }),
            ...(typeof revenue === 'object' && (revenue.min || revenue.max) && { revenue: person.organization.revenue }),
            ...(fundraise.length && { funding_stage: person.organization.latest_funding_stage }),
            ...(technology.length && { technology: person.organization.technology }),
            ...(days && { published_at: person.organization.published_at }),
            ...(eventTypes.length && { event_category: person.organization.event_category }),
          },
        }));
        setProspects(newProspects);
        setTotalFound(((data?.pagination?.total_entries > 100? data?.pagination?.total_entries: data?.people?.length)) || 0);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setSomethingWasAltered(false);
    }
    setLoadingProsepcts(false);
  }


  const fetchCompanyNameOptions = async (query: string) => {
    try {
      const response = await fetch(`${API_URL}/contacts/company_search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          company_names: [query],
        }),
      });

      const data = await response.json();
      if (response.ok) {
        const newOptions = data.data.map((item: any) => ({
          value: item.id,
          label: item.name,
          domain: item.domain,
          logo_url: item.logo_url,
          website_url: item.website_url,
        }));

        setCompanyOptions((prev) => {
          const combinedOptions = [...prev, ...newOptions];
          const uniqueOptions = Array.from(new Set(combinedOptions.map(option => option.value)))
            .map(value => combinedOptions.find(option => option.value === value));
          return uniqueOptions;
        });

      }
    } catch (error) {
      console.error("Error:", error);
    }
  }


  const fetchCompanyOptions = async () => {
    setFetchingCompanyOptions(true);
    try {
      const response = await fetch(`${API_URL}/contacts/company_search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          company_names: companyName.length ? companyName.split("\n") : [],
          company_urls: companyDomain.length ? companyDomain.split("\n") : [],
          company_prompt: aiPrompt.length ? aiPrompt : "",
        }),
      });

      const data = await response.json();
      if (response.ok) {
        const newOptions = data.data.map((item: any) => ({
          value: item.id,
          label: item.name,
          domain: item.domain,
          logo_url: item.logo_url,
          website_url: item.website_url,
        }));

        setCompanyOptions((prev) => {
          const combinedOptions = [...prev, ...newOptions];
          const uniqueOptions = Array.from(new Set(combinedOptions.map(option => option.value)))
            .map(value => combinedOptions.find(option => option.value === value));
          return uniqueOptions;
        });

        setselectedCompanies((prev) => {
          const combinedOptions = [...prev, ...newOptions.map((option: { value: any; }) => option.value)];
          const uniqueOptions = Array.from(new Set(combinedOptions));
          return uniqueOptions;
        }
        );


      } else {
        console.error("Error fetching company options:", data);
      }
    } catch (error) {
      console.error("Error:", error);
    }
    setFetchingCompanyOptions(false);
  }

  const fetchTechnologyOptions = async (query: string) => {
    try {
      const response = await fetch(`${API_URL}/apollo/tags/searchTechnology?q_tag_fuzzy_name=${query}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();

      if (data.status === "success" && Array.isArray(data.data.tags)) {
        const newOptions = data.data.tags.map((tag: any) => tag.cleaned_name);
        const newOptionsWithUids = data.data.tags?.reduce((acc: any, tag: any) => {
          acc[tag.cleaned_name] = tag.uid;
          return acc;
        }, {});
        setTechnologyOptionsWithUids((prevOptions: any) => ({
          ...prevOptions,
          ...newOptionsWithUids,
        }));
        console.log('new options are ', newOptions);
        setTechnologyOptions((prevOptions) => Array.from(new Set([...prevOptions, ...newOptions])));
        console.log('current options are ', technologyOptions);
      }

      return data;
    } catch (error) {
      console.log(error);
      return;
    }
  }

  const fetchIndustryOptions = async (query: string) => {
    try {
      const response = await fetch(`${API_URL}/apollo/tags/search?q_tag_fuzzy_name=${query}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();

      if (data.status === "success" && Array.isArray(data.data.tags)) {
        const newOptions = data.data.tags.map((tag: any) => tag.cleaned_name);
        const newOptionsWithIds = data.data.tags?.reduce((acc: any, tag: any) => {
          acc[tag.cleaned_name] = tag.id;
          return acc;
        }, {});
        setIndustryOptionsWithIds((prevOptions: any) => ({
          ...prevOptions,
          ...newOptionsWithIds,
        }));
        console.log('new options are ', newOptions);
        setIndustryOptions((prevOptions) => Array.from(new Set([...prevOptions, ...newOptions])));
        console.log('current options are ', industryOptions);
      }

      return data;
    } catch (error) {
      console.log(error);
      return;
    }
  }

  return (
    <Box>
      <CreateSegmentModal
        numContactsLimit={totalFound}
        filters={generateQueryPayload()}
        saved_apollo_query_id={currentSavedQueryId || saved_query_id}
        modalOpened={createSegmentOpened}
        openModal={()=>{}}
        closeModal={()=>{setCreateSegmentOpened(false)}}
        backFunction={() => {
          // props.refetch();
        }}
        archetypeID={-1}
          />
      {!hideSaveFeature && <TextInput 
        label="Filter Name" 
        value={filterName}
        required={filterName === ''}
        styles={{
          input: {
            borderColor: filterName === "" ? "red" : undefined,
            borderWidth: filterName === "" ? "2px" : undefined,
          },
          label: {
            color: filterName === "" ? "red" : undefined,
          },
        }}
        onChange={(event) => setFilterName(event.currentTarget.value)}
      />}
      <Flex align="end" mb={'sm'}>
        {!window.location.href.includes("selix") && !window.location.href.includes("pre-filters-v2") && <Select
          label="Saved filters"
          placeholder="Pick one"
          data={prefilters.map((prefilter) => ({ value: prefilter.id, label: prefilter.title }))}
          value={selectedFilter}
          onChange={(value) => {
            setSelectedFilter(value);
            const handleApply = async (value: any) => {
              mergeSavedQueries(Number(value));
              // if (!value) return;
              // innerProps.id = Number(value);
              // setShowApplyButton(false);
              // setCurrentSavedQueryId(prefilters.find((prefilter) => prefilter.id === Number(value))?.id);
            };
            handleApply(value);
            // setShowApplyButton(true);
          }}
          rightSection={false && (
            <Button onClick={handleApply} size="xs" style={{ marginLeft: '-60px' }}>
              Apply
            </Button>
          )}
          style={{ width: '50%' }}
        />}
      </Flex>
      <Flex mt={"sm"} gap={"md"}>
        <Paper withBorder radius={"sm"} w={"100%"}>
          {/* <Box w={"100%"} bg={"#eceef1"} p={3}>
            <SegmentedControl
              data={[
                {
                  value: "person",
                  label: (
                    <Center style={{ gap: 10 }}>
                      <span>Person</span>
                    </Center>
                  ),
                },
                {
                  value: "account",
                  label: (
                    <Center style={{ gap: 10 }}>
                      <span>Account</span>
                      <Badge color="gray" variant="filled">
                        {4}
                      </Badge>
                    </Center>
                  ),
                },
              ]}
              style={{ backgroundColor: "transparent" }}
            />
          </Box> */}
          <Stack spacing={"xs"} px={"lg"}>
            <Accordion
              multiple={true}
              mt={"sm"}
              styles={{
                control: {
                  paddingTop: "3px",
                  paddingBottom: "3px",
                  paddingLeft: "0px",
                  paddingRight: "0px",
                },
                content: {
                  paddingLeft: "0px",
                  paddingRight: "0px",
                },
              }}
            >
              <CustomAccordionItem value="name" label="Name" isActive={!!name}>
                <TextInput 
                  label="Name" 
                  placeholder="Enter name" 
                  value = {name}
                  onChange={(event) => setName(event.currentTarget.value)}
                />
              </CustomAccordionItem>
              <CustomAccordionItem value="job" label="Job Title" isActive={jobTitles.length > 0 || excludedJobTitles.length > 0 || seniority.length > 0}>
                <CustomSelect
                  label="Included"
                  placeholder="Select options"
                  value={jobTitles || []}
                  setValue={setJobTitles}
                  data={Array.isArray(jobTitles) ? jobTitles.filter(option => option) : []}
                  setData={setJobTitles}
                />
                <MultiSelect
                  label="Seniority"
                  placeholder="Select options"
                  value={seniority}
                  onChange={setSeniority}
                  data={[
                    { value: "owner", label: "Owner" },
                    { value: "founder", label: "Founder" },
                    { value: "c_suite", label: "C-Suite" },
                    { value: "partner", label: "Partner" },
                    { value: "vp", label: "VP" },
                    { value: "head", label: "Head" },
                    { value: "director", label: "Director" },
                    { value: "manager", label: "Manager" },
                    { value: "senior", label: "Senior" },
                    { value: "entry", label: "Entry" },
                    { value: "intern", label: "Intern" }
                  ]}
                />
                <CustomSelect
                  value={excludedJobTitles || []}
                  label="Excluded"
                  placeholder="Select options"
                  setValue={setExcludedJobTitles}
                  data={excludedJobTitles?.filter(option => option) || []}
                  setData={setExcludedJobTitles}
                />
              </CustomAccordionItem>

              <CustomAccordionItem value="industry" label="Industry" isActive={industry.length > 0}>
                <MultiSelect
                  label="Industry"
                  placeholder="Enter industry"
                  data={Array.isArray(industryOptions) ? industryOptions.filter(option => option) : []}
                  value={industry || []}
                  onChange={(value) => {
                    setIndustry(value);
                    setIndustryOptions((current) => {
                      const newOptions = [...current];
                      value.forEach((item) => {
                        if (!newOptions.includes(item)) {
                          newOptions.push(item);
                        }
                      });
                      return newOptions;
                    });
                  }}
                  searchable
                  getCreateLabel={(query) => `+ Create ${query}`}
                  onCreate={(query) => {
                    setIndustryOptions((current) => [...current, query]);
                    return query;
                  }}
                  onSearchChange={debounce((query) => {
                    // Make a request to populate the options based on the query
                    fetchIndustryOptions(query);
                  }, 300)}
                  nothingFound="Nothing found"
                  clearButtonProps={{ "aria-label": "Clear selection" }}
                  clearable
                  filter={(value, selected, item) => {
                    console.log('filtering by ', value);
                    if (!item || !item.label) {
                      return false;
                    }
                    return item.label.toLowerCase().includes(value.toLowerCase().trim());
                  }}
                  styles={{
                    rightSection: { pointerEvents: "none" },
                    label: { width: "100%" },
                    value: {
                      backgroundColor: "rgba(0, 149, 18, 0.1)",
                      border: "0.6px solid #009512",
                    },
                    input: {
                      minHeight: "",
                    },
                  }}
                />
              </CustomAccordionItem>
              <CustomAccordionItem value="locations" label="Locations" isActive={locations.length > 0}>

              <CustomSelect
                  label="Included"
                  placeholder="Select options"
                  value={Array.isArray(locations) ? locations : []}
                  setValue={setLocations}
                  data={Array.isArray(locations) ? locations.filter(option => option) : []}
                  setData={setLocations}
                />

                
                {/* <MultiSelect
                  label="Locations"
                  placeholder="Enter locations"
                  data={['United States', 'Europe', 'Germany', 'India', 'United Kingdom', 'France', 'Canada', 'Australia']}
                  value={Array.isArray(locations) ? locations : []}
                  onChange={(value) => setLocations(value as any)}
                  searchable
                  nothingFound="Nothing found"
                  clearButtonProps={{ "aria-label": "Clear selection" }}
                  clearable
                  styles={{
                    rightSection: { pointerEvents: "none" },
                    label: { width: "100%" },
                    value: {
                      backgroundColor: "rgba(0, 149, 18, 0.1)",
                      border: "0.6px solid #009512",
                    },
                    input: {
                      minHeight: "",
                    },
                  }}
                /> */}
              </CustomAccordionItem>
              <CustomAccordionItem value="fundraise" label="Fundraise" isActive={fundraise.length > 0}>
                <MultiSelect
                  label="Funding Stages"
                  placeholder="Select funding stages"
                  data={ [
                    { "label": "Seed", "value": "0" },
                    { "label": "Angel", "value": "1" },
                    { "label": "Venture (Round not specified)", "value": "10" },
                    { "label": "Series A", "value": "2" },
                    { "label": "Series B", "value": "3" },
                    { "label": "Series C", "value": "4" },
                    { "label": "Series D", "value": "5" },
                    { "label": "Series E", "value": "6" },
                    { "label": "Series F", "value": "7" },
                    { "label": "Debt Financing", "value": "13" },
                    { "label": "Equity Crowdfunding", "value": "14" },
                    { "label": "Convertible Note", "value": "15" },
                    { "label": "Private Equity", "value": "11" },
                    { "label": "Other", "value": "12" }
                  ]}
                  value={fundraise || []}
                  onChange={(value) => setFundraise(value)}
                  searchable
                  nothingFound="Nothing found"
                  clearButtonProps={{ "aria-label": "Clear selection" }}
                  clearable
                  styles={{
                    rightSection: { pointerEvents: "none" },
                    label: { width: "100%" },
                    value: {
                      backgroundColor: "rgba(0, 149, 18, 0.1)",
                      border: "0.6px solid #009512",
                    },
                    input: {
                      minHeight: "",
                    },
                  }}
                />
              </CustomAccordionItem>
              <CustomAccordionItem amount={selectedCompanies.length} value="company" label="Company" isActive={selectedCompanies.length > 0 || !!companyName || !!companyDomain || !!aiPrompt || companyKeywords.length > 0}>
                <MultiSelect
                  label="Selected Companies"
                  placeholder="Enter company"
                  data={Array.isArray(companyOptions) ? companyOptions : []}
                  value={selectedCompanies || []}
                  onChange={(value) => {
                    setselectedCompanies(value);
                  }}
                  searchable
                  getCreateLabel={(query) => `+ Create ${query}`}
                  onCreate={(query) => {
                    setCompanyOptions((current) => [...current, { label: query, value: query } as any]);
                    return query;
                  }}
                  onSearchChange={debounce((query) => {
                    // Make a request to populate the options based on the query
                    fetchCompanyNameOptions(query);
                  }, 300)}
                  filter={(value, selected, item) => {
                    console.log('filtering by ', value);
                    if (!item || !item.label) {
                      return false;
                    }
                    return item.label.toLowerCase().includes(value.toLowerCase().trim());
                  }
                  }
                  nothingFound="Nothing found"
                  clearButtonProps={{ "aria-label": "Clear selection" }}
                  clearable
                  valueComponent={({ value, label, ...others }) => {
                    const company = companyOptions.find((option: any) => option.value === value) as any;
                    if (!company) {
                      return <div {...others}>{label}</div>;
                    }
                    return (
                      <div {...others} style={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar src={company.logo_url} size="sm" radius="xl" />
                        <span style={{ marginLeft: 8, marginRight: 0 }}>{label}</span>
                        <Button 
                          size="xs" 
                          variant="subtle" 
                          onClick={(e) => {
                            e.stopPropagation();
                            setselectedCompanies((current) => current.filter((item) => item !== value));
                          }}
                        >
                          ✕
                        </Button>
                      </div>
                    );
                  }}

                  itemComponent={({ value, label, ...others }) => {
                    const company = companyOptions.find((option: any) => option.value === value) as any;
                    return (
                      <div {...others} style={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar src={company?.logo_url} size="sm" radius="xl" />
                        <span style={{ marginLeft: 8 }}>{label}</span>
                      </div>
                    );
                  }}
                  // filter={(value, selected, item) => {
                  //   console.log('filtering by ', value);
                  //   if (!item || !item.label) {
                  //     return false;
                  //   }
                  //   return item.label.toLowerCase().includes(value.toLowerCase().trim());
                  // }}
                  styles={{
                    rightSection: { pointerEvents: "none" },
                    label: { width: "100%" },
                    value: {
                      backgroundColor: "#e0e0e0",
                      border: "0.6px solid gray",
                      borderRadius: "3px",
                    },
                    input: {
                      minHeight: "",
                    },
                  }}
                />
              <Button 
                  mt="sm" 
                  variant="outline" 
                  onClick={() => {setselectedCompanies([]); setcompanyName(""); setCompanyDomain(""); setAiPrompt(""); setCompanyOptions([]); setCompanyKeywords([]);}}
                >
                  Reset
                </Button>
                {/* <TextInput 
                  disabled
                  label="Keywords" 
                  onChange={(event) => setselectedCompanies(event.currentTarget.value)}
                /> */}
                <Accordion.Item value="advanced">
                  <Accordion.Control>Advanced</Accordion.Control>
                  <Accordion.Panel>
                    <Textarea 
                      label="Company Name List" 
                      placeholder={"e.g.\nCisco\nApple\nDell" }
                      value={companyName}
                      onChange={(event) => setcompanyName(event.currentTarget.value)}
                      autosize
                      minRows={3}
                    />
                    <MultiSelect
                      label="Company Keywords"
                      placeholder="Select or type keywords"
                      data={Array.isArray(companyKeywords) ? companyKeywords.map(keyword => ({ label: keyword, value: keyword })) : []}
                      value={companyKeywords}
                      onChange={(value) => setCompanyKeywords(value)}
                      searchable
                      creatable
                      getCreateLabel={(query) => `+ Create ${query}`}
                      onCreate={(query) => {
                        setCompanyKeywords((prev) => [...prev, query]);
                        return query;
                      }}
                      styles={{
                        rightSection: { pointerEvents: "none" },
                        label: { width: "100%" },
                        value: {
                          backgroundColor: "#e0e0e0",
                          border: "0.6px solid gray",
                          borderRadius: "3px",
                        },
                        input: {
                          minHeight: "",
                        },
                      }}
                    />
                    <Textarea 
                      label="Company Domain" 
                      placeholder={"e.g. http://cisco.com\njohn@apple.com\nsalesforce.com"} 
                      value={companyDomain}
                      onChange={(event) => setCompanyDomain(event.currentTarget.value)}
                      autosize
                      minRows={3}
                    />
                    <Textarea 
                      label="AI Prompt" 
                      placeholder="e.g. give me the top 50 Tech companies in CSV form" 
                      value={aiPrompt}
                      onChange={(event) => setAiPrompt(event.currentTarget.value)}
                      autosize
                      minRows={1}
                      mb="xl"
                    />
                    <Button loading={fetchingCompanyOptions} mt="sm" style={{ float: 'right' }} onClick={() => {fetchCompanyOptions()}}>
                  Apply
                </Button>
                  </Accordion.Panel>
                </Accordion.Item>
              </CustomAccordionItem>
              <CustomAccordionItem value="employees" label="# Employees" isActive={selectedNumEmployees.length > 0}>
                <MultiSelect
                  label=""
                  placeholder="Select number of employees"
                  data={["1,10","11,20","21,50","51,100","101,200","201,500","501,1000","1001,2000","2001,5000","5001,10000","10001"]
                    .map(x => ({ label: x.replaceAll(",", "-"), value: x }))
                    .filter(option => option)}
                  value={selectedNumEmployees || []}
                  onChange={(value) => setSelectedNumEmployees(value)}
                  searchable
                  nothingFound="Nothing found"
                  clearButtonProps={{ "aria-label": "Clear selection" }}
                  clearable
                  styles={{
                    rightSection: { pointerEvents: "none" },
                    label: { width: "100%" },
                    value: {
                      backgroundColor: "rgba(0, 149, 18, 0.1)",
                      border: "0.6px solid #009512",
                    },
                    input: {
                      minHeight: "",
                    },
                  }}
                />
              </CustomAccordionItem>

              <CustomAccordionItem value="revenue" label="Revenue Range" isActive={!!revenue.min || !!revenue.max}>
                <Flex gap="md">
                  <TextInput
                    label="Min Revenue ($)"
                    placeholder="Enter minimum revenue"
                    value={revenue.min}
                    onChange={(event) => {
                      const newValue = event.currentTarget.value.replace(/,/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                      setRevenue({ ...revenue, min: newValue });
                    }}
                    styles={{
                      input: {
                        borderColor: revenue.min && revenue.max && parseFloat(revenue.min.replace(/,/g, "")) > parseFloat(revenue.max.replace(/,/g, "")) ? 'red' : undefined,
                      },
                    }}
                  />
                  <TextInput
                    label="Max Revenue ($)"
                    placeholder="Enter maximum revenue"
                    value={revenue.max}
                    onChange={(event) => {
                      const newValue = event.currentTarget.value.replace(/,/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                      setRevenue({ ...revenue, max: newValue });
                    }}
                    styles={{
                      input: {
                        borderColor: revenue.max && parseFloat(revenue.max.replace(/,/g, "")) < parseFloat(revenue.min.replace(/,/g, "")) ? 'red' : undefined,
                      },
                    }}
                  />
                </Flex>
              </CustomAccordionItem>
              <CustomAccordionItem value="technology" label="Technology" isActive={technology.length > 0}>
                <MultiSelect
                  placeholder="Enter technology"
                  data={Array.isArray(technologyOptions) ? technologyOptions.filter(option => option) : []}
                  value={technology}
                  onChange={(value) => {
                    setTechnology(value);
                    setTechnologyOptions((current) => {
                      const newOptions = [...current];
                      value.forEach((item) => {
                        if (!newOptions.includes(item)) {
                          newOptions.push(item);
                        }
                      });
                      return newOptions;
                    });
                  }}
                  searchable
                  getCreateLabel={(query) => `+ Create ${query}`}
                  onCreate={(query) => {
                    setTechnologyOptions((current) => [...current, query]);
                    return query;
                  }}
                  onSearchChange={debounce((query) => {
                    // Make a request to populate the options based on the query
                    fetchTechnologyOptions(query);
                  }, 300)}
                  nothingFound="Nothing found"
                  clearButtonProps={{ "aria-label": "Clear selection" }}
                  clearable
                  filter={(value, selected, item) => {
                    console.log('filtering by ', value);
                    if (!item || !item.label) {
                      return false;
                    }
                    return item.label.toLowerCase().includes(value.toLowerCase().trim());
                  }}
                  styles={{
                    rightSection: { pointerEvents: "none" },
                    label: { width: "100%" },
                    value: {
                      backgroundColor: "rgba(0, 149, 18, 0.1)",
                      border: "0.6px solid #009512",
                    },
                    input: {
                      minHeight: "",
                    },
                  }}
                />
              </CustomAccordionItem>
              <CustomAccordionItem value="recent_news" label="Recent News" isActive={eventTypes.length > 0}>
                <MultiSelect
                  label="Event Type"
                  placeholder="Select event types"
                  data={[
                    { value: "leadership", label: "Leadership" },
                    { value: "acquisition", label: "Acquisition" },
                    { value: "expansion", label: "Expansion" },
                    { value: "new_offering", label: "New Offering" },
                    { value: "investment", label: "Investment" },
                    { value: "cost_cutting", label: "Cost Cutting" },
                    { value: "partnership", label: "Partnership" },
                    { value: "recognition", label: "Recognition" },
                    { value: "contract", label: "Contract" },
                    { value: "corporate_challenges", label: "Corporate Challenges" },
                    { value: "relational", label: "Relational" },
                  ]}
                  value={Array.isArray(eventTypes) ? eventTypes.filter(option => option) : []}
                  onChange={(value) => setEventTypes(value)}
                  searchable
                  nothingFound="Nothing found"
                  clearButtonProps={{ "aria-label": "Clear selection" }}
                  clearable
                  styles={{
                    rightSection: { pointerEvents: "none" },
                    label: { width: "100%" },
                    value: {
                      backgroundColor: "rgba(0, 149, 18, 0.1)",
                      border: "0.6px solid #009512",
                    },
                    input: {
                      minHeight: "",
                    },
                  }}
                />
                <TextInput
                  label="Within Last N Days"
                  placeholder="Enter number of days"
                  type="number"
                  min={0}
                  value={days || []}
                  onChange={(event) => setDays(parseInt(event.currentTarget.value, 10))}
                />
              </CustomAccordionItem>


              {/* <CustomAccordionItem value="experience" label="Recent News" isActive={experience.length > 0}>
                <MultiSelect
                  label="Department"
                  placeholder="Select departments"
                  data={[
                    { value: "c_suite", label: "C-Suite" },
                    { value: "executive", label: "Executive" },
                    { value: "finance_executive", label: "Finance Executive" },
                    { value: "founder", label: "Founder" },
                    { value: "human_resources_executive", label: "Human Resources Executive" },
                    { value: "information_technology_executive", label: "Information Technology Executive" },
                    { value: "legal_executive", label: "Legal Executive" },
                    { value: "marketing_executive", label: "Marketing Executive" },
                    { value: "medical_health_executive", label: "Medical Health Executive" },
                    { value: "operations_executive", label: "Operations Executive" },
                    { value: "sales_leader", label: "Sales Leader" },
                    { value: "product_development", label: "Product Development" },
                    { value: "product_management", label: "Product Management" },
                    { value: "artificial_intelligence_machine_learning", label: "Artificial Intelligence / Machine Learning" },
                    { value: "bioengineering", label: "Bioengineering" },
                    { value: "biometrics", label: "Biometrics" },
                    { value: "business_intelligence", label: "Business Intelligence" },
                    { value: "chemical_engineering", label: "Chemical Engineering" },
                    { value: "cloud_mobility", label: "Cloud / Mobility" },
                    { value: "data_science", label: "Data Science" },
                    { value: "devops", label: "DevOps" },
                    { value: "digital_transformation", label: "Digital Transformation" },
                    { value: "emerging_technology_innovation", label: "Emerging Technology / Innovation" },
                    { value: "master_engineering_technical", label: "Engineering & Technical" },
                    { value: "industrial_engineering", label: "Industrial Engineering" },
                    { value: "mechanic", label: "Mechanic" },
                    { value: "mobile_development", label: "Mobile Development" },
                    { value: "product_mangement", label: "Project Management" },
                    { value: "research_development", label: "Research & Development" },
                    { value: "scrum_master_agile_coach", label: "Scrum Master / Agile Coach" },
                    { value: "software_development", label: "Software Development" },
                    { value: "support_technical_services", label: "Support / Technical Services" },
                    { value: "technician", label: "Technician" },
                    { value: "technology_operations", label: "Technology Operations" },
                    { value: "test_quality_assurance", label: "Test / Quality Assurance" },
                    { value: "ui_ux", label: "UI / UX" },
                    { value: "web_development", label: "Web Development" },
                    { value: "all_design", label: "All Design" },
                    { value: "product_ui_ux_design", label: "Product or UI/UX Design" },
                    { value: "graphic_design", label: "Graphic / Visual / Brand Design" },
                    { value: "teacher", label: "Teacher" },
                    { value: "principal", label: "Principal" },
                    { value: "superintendent", label: "Superintendent" },
                    { value: "professor", label: "Professor" },
                    { value: "accounting", label: "Accounting" },
                    { value: "finance", label: "Finance" },
                    { value: "financial_planning_analysis", label: "Financial Planning & Analysis" },
                    { value: "financial_reporting", label: "Financial Reporting" },
                    { value: "financial_strategy", label: "Financial Strategy" },
                    { value: "financial_systems", label: "Financial Systems" },
                    { value: "internal_audit_control", label: "Internal Audit & Control" },
                    { value: "investor_relations", label: "Investor Relations" },
                    { value: "mergers_acquisitions", label: "Mergers & Acquisitions" },
                    { value: "real_estate_finance", label: "Real Estate Finance" },
                    { value: "financial_risk", label: "Financial Risk" },
                    { value: "shared_services", label: "Shared Services" },
                    { value: "sourcing_procurement", label: "Sourcing / Procurement" },
                    { value: "tax", label: "Tax" },
                    { value: "treasury", label: "Treasury" },
                    { value: "compensation_benefits", label: "Compensation & Benefits" },
                    { value: "culture_diversity_inclusion", label: "Culture, Diversity & Inclusion" },
                    { value: "employee_labor_relations", label: "Employee & Labor Relations" },
                    { value: "health_safety", label: "Health & Safety" },
                    { value: "human_resource_information_system", label: "Human Resource Information System" },
                    { value: "human_resources", label: "Human Resources" },
                    { value: "hr_business_partner", label: "HR Business Partner" },
                    { value: "learning_development", label: "Learning & Development" },
                    { value: "organizational_development", label: "Organizational Development" },
                    { value: "recruiting_talent_acquisition", label: "Recruiting & Talent Acquisition" },
                    { value: "talent_management", label: "Talent Management" },
                    { value: "workforce_management", label: "Workforce Management" },
                    { value: "people_operations", label: "People Operations" },
                    { value: "application_development", label: "Application Development" },
                    { value: "business_service_management_itsm", label: "Business Service Management / ITSM" },
                    { value: "collaboration_web_app", label: "Collaboration & Web App" },
                    { value: "data_center", label: "Data Center" },
                    { value: "data_warehouse", label: "Data Warehouse" },
                    { value: "database_administration", label: "Database Administration" },
                    { value: "ecommerce_development", label: "eCommerce Development" },
                    { value: "enterprise_architecture", label: "Enterprise Architecture" },
                    { value: "help_desk_desktop_services", label: "Help Desk / Desktop Services" },
                    { value: "hr_financial_erp_systems", label: "HR / Financial / ERP Systems" },
                    { value: "information_security", label: "Information Security" },
                    { value: "information_technology", label: "Information Technology" },
                    { value: "infrastructure", label: "Infrastructure" },
                    { value: "it_asset_management", label: "IT Asset Management" },
                    { value: "it_audit_it_compliance", label: "IT Audit / IT Compliance" },
                    { value: "it_operations", label: "IT Operations" },
                    { value: "it_procurement", label: "IT Procurement" },
                    { value: "it_strategy", label: "IT Strategy" },
                    { value: "it_training", label: "IT Training" },
                    { value: "networking", label: "Networking" },
                    { value: "project_program_management", label: "Project & Program Management" },
                    { value: "quality_assurance", label: "Quality Assurance" },
                    { value: "retail_store_systems", label: "Retail / Store Systems" },
                    { value: "servers", label: "Servers" },
                    { value: "storage_disaster_recovery", label: "Storage & Disaster Recovery" },
                    { value: "telecommunications", label: "Telecommunications" },
                    { value: "virtualization", label: "Virtualization" },
                    { value: "acquisitions", label: "Acquisitions" },
                    { value: "compliance", label: "Compliance" },
                    { value: "contracts", label: "Contracts" },
                    { value: "corporate_secretary", label: "Corporate Secretary" },
                    { value: "ediscovery", label: "eDiscovery" },
                    { value: "ethics", label: "Ethics" },
                    { value: "governance", label: "Governance" },
                    { value: "governmental_affairs_regulatory_law", label: "Governmental Affairs & Regulatory Law" },
                    { value: "intellectual_property_patent", label: "Intellectual Property & Patent" },
                    { value: "labor_employment", label: "Labor & Employment" },
                    { value: "lawyer_attorney", label: "Lawyer / Attorney" },
                    { value: "legal", label: "Legal" },
                    { value: "legal_counsel", label: "Legal Counsel" },
                    { value: "legal_operations", label: "Legal Operations" },
                    { value: "litigation", label: "Litigation" },
                    { value: "privacy", label: "Privacy" },
                    { value: "advertising", label: "Advertising" },
                    { value: "brand_management", label: "Brand Management" },
                    { value: "content_marketing", label: "Content Marketing" },
                    { value: "customer_experience", label: "Customer Experience" },
                    { value: "customer_marketing", label: "Customer Marketing" },
                    { value: "demand_generation", label: "Demand Generation" },
                    { value: "digital_marketing", label: "Digital Marketing" },
                    { value: "ecommerce_marketing", label: "eCommerce Marketing" },
                    { value: "event_marketing", label: "Event Marketing" },
                    { value: "field_marketing", label: "Field Marketing" },
                    { value: "lead_generation", label: "Lead Generation" },
                    { value: "marketing", label: "Marketing" },
                    { value: "marketing_analytics_insights", label: "Marketing Analytics / Insights" },
                    { value: "marketing_communications", label: "Marketing Communications" },
                    { value: "marketing_operations", label: "Marketing Operations" },
                    { value: "product_marketing", label: "Product Marketing" },
                    { value: "public_relations", label: "Public Relations" },
                    { value: "search_engine_optimization_pay_per_click", label: "Search Engine Optimization / Pay Per Click" },
                    { value: "social_media_marketing", label: "Social Media Marketing" },
                    { value: "strategic_communications", label: "Strategic Communications" },
                    { value: "technical_marketing", label: "Technical Marketing" },
                    { value: "anesthesiology", label: "Anesthesiology" },
                    { value: "chiropractics", label: "Chiropractics" },
                    { value: "clinical_systems", label: "Clinical Systems" },
                    { value: "dentistry", label: "Dentistry" },
                    { value: "dermatology", label: "Dermatology" },
                    { value: "doctors_physicians", label: "Doctors / Physicians" },
                    { value: "epidemiology", label: "Epidemiology" },
                    { value: "first_responder", label: "First Responder" },
                    { value: "infectious_disease", label: "Infectious Disease" },
                    { value: "medical_administration", label: "Medical Administration" },
                    { value: "medical_education_training", label: "Medical Education & Training" },
                    { value: "medical_research", label: "Medical Research" },
                    { value: "medicine", label: "Medicine" },
                    { value: "neurology", label: "Neurology" },
                    { value: "nursing", label: "Nursing" },
                    { value: "nutrition_dietetics", label: "Nutrition & Dietetics" },
                    { value: "obstetrics_gynecology", label: "Obstetrics / Gynecology" },
                    { value: "oncology", label: "Oncology" },
                    { value: "opthalmology", label: "Opthalmology" },
                    { value: "optometry", label: "Optometry" },
                    { value: "orthopedics", label: "Orthopedics" },
                    { value: "pathology", label: "Pathology" },
                    { value: "pediatrics", label: "Pediatrics" },
                    { value: "pharmacy", label: "Pharmacy" },
                    { value: "physical_therapy", label: "Physical Therapy" },
                    { value: "psychiatry", label: "Psychiatry" },
                    { value: "psychology", label: "Psychology" },
                    { value: "public_health", label: "Public Health" },
                    { value: "radiology", label: "Radiology" },
                    { value: "social_work", label: "Social Work" },
                    { value: "call_enter", label: "Call Center" },
                    { value: "construction", label: "Construction" },
                    { value: "corporate_strategy", label: "Corporate Strategy" },
                    { value: "customer_service_support", label: "Customer Service / Support" },
                    { value: "enterprise_resource_planning", label: "Enterprise Resource Planning" },
                    { value: "facilities_management", label: "Facilities Management" },
                    { value: "leasing", label: "Leasing" },
                    { value: "logistics", label: "Logistics" },
                    { value: "office_operations", label: "Office Operations" },
                    { value: "operations", label: "Operations" },
                    { value: "physical_security", label: "Physical Security" },
                    { value: "project_development", label: "Project Development" },
                    { value: "quality_management", label: "Quality Management" },
                    { value: "real_estate", label: "Real Estate" },
                    { value: "safety", label: "Safety" },
                    { value: "store_operations", label: "Store Operations" },
                    { value: "supply_chain", label: "Supply Chain" },
                    { value: "account_management", label: "Account Management" },
                    { value: "business_development", label: "Business Development" },
                    { value: "channel_sales", label: "Channel Sales" },
                    { value: "customer_retention_development", label: "Customer Retention & Development" },
                    { value: "customer_success", label: "Customer Success" },
                    { value: "field_outside_sales", label: "Field / Outside Sales" },
                    { value: "inside_sales", label: "Inside Sales" },
                    { value: "partnerships", label: "Partnerships" },
                    { value: "revenue_operations", label: "Revenue Operations" },
                    { value: "sales", label: "Sales" },
                    { value: "sales_enablement", label: "Sales Enablement" },
                    { value: "sales_engineering", label: "Sales Engineering" },
                    { value: "sales_operations", label: "Sales Operations" },
                    { value: "sales_training", label: "Sales Training" },
                    { value: "consultant", label: "Consultant" },
                  ]}
                  value={experience}
                  onChange={(value) => setExperience(value)}
                  searchable
                  nothingFound="Nothing found"
                  clearButtonProps={{ "aria-label": "Clear selection" }}
                  clearable
                  styles={{
                    rightSection: { pointerEvents: "none" },
                    label: { width: "100%" },
                    value: {
                      backgroundColor: "rgba(0, 149, 18, 0.1)",
                      border: "0.6px solid #009512",
                    },
                    input: {
                      minHeight: "",
                    },
                  }}
                />
                <TextInput
                  label="Min Count"
                  placeholder="Enter minimum count"
                  type="number"
                  min={0}
                  value={departmentMinCount}
                  onChange={(event) => setDepartmentMinCount(parseInt(event.currentTarget.value, 10))}
                />
                <TextInput
                  label="Max Count"
                  placeholder="Enter maximum count"
                  type="number"
                  min={0}
                  value={departmentMaxCount}
                  onChange={(event) => setDepartmentMaxCount(parseInt(event.currentTarget.value, 10))}
                />
              </CustomAccordionItem> */}

              {/* {menu.map((item, index) => {
                return (
                  <CustomAccordionItem key={index} value={item.toLowerCase()} label={item} isActive={false}>
                    {item}
                  </CustomAccordionItem>
                );
              })} */}
            </Accordion>
          </Stack>
        </Paper>
        <Paper withBorder radius={"sm"} w={"100%"}>
        <Flex gap="sm" mb="sm" mt="sm">
          <Button 
            loading={loadingProspects}
            color="blue" 
            fullWidth 
            leftIcon={<IconSearch size={16} />} 
            style={{ 
              padding: '10px 20px', 
              fontSize: '16px', 
              borderRadius: '5px',
              boxShadow: !hideSaveFeature && somethingWasAltered ? '0 0 10px 2px rgba(255, 0, 0, 1)' : 'none', // Glowing halo when it needs to be saved
              animation: !hideSaveFeature && somethingWasAltered ? 'glow 0.90s infinite alternate' : 'none' // Animation for the glowing effect
            }}
            onClick={searchProspects}
          >
            {hideSaveFeature ? "Search" : "Search & Save"}
          </Button>
          <style>
            {`
              @keyframes glow {
                from {
                  box-shadow: 0 0 15px rgba(0, 255, 0, 1); /* Green color */
                }
                to {
                  box-shadow: 0 0 30px rgba(255, 192, 203, 1); /* Pink color */
                }
              }
            `}
          </style>
          {/* <Button 
            disabled={(currentSavedQueryId === undefined || filterName === '')} 
            onClick={() => saved_query_id ? saveFilter(saved_query_id) : saveFilter()} 
            fullWidth
            color="orange"
            leftIcon={<IconCircleCheck size={16} />}
          >
            {saved_query_id ? 'Save Filter' : 'Save Pre-filter'}
          </Button> */}
          {!window.location.href.includes('/selix_onboarding') && !window.location.href.includes('/analytics') && !window.location.href.includes('/website') && (
            <Button 
              color="green"
              disabled={saved_query_id || currentSavedQueryId ? false : ((currentSavedQueryId === undefined) || filterName === '')}
              leftIcon={<IconLink size={"1rem"} />}
              onClick={() => setCreateSegmentOpened(true)}
            >
              {'Attach to segment'}
            </Button>
          )}
        </Flex>
          <Flex align={"center"} gap={3} p={"sm"} bg={"#eceef1"}>
            <IconUsers size={"1rem"} color="gray" />
            <Text size={"sm"} fw={500} color="gray" tt={"uppercase"}>
              {totalFound > 100 ? `${totalFound.toLocaleString()} prospects found (showing 100)` : `${totalFound?.toLocaleString() || 0} prospects found`}
            </Text>
          </Flex>
          <ScrollArea h={500}>
            <Stack spacing={"sm"} px={"md"} py={"sm"}>
              {prospects?.map((item: any, index: number) => {
                return (
                  <Flex 
                    align={"start"} 
                    gap={"xs"} 
                    key={index} 
                    style={{ cursor: item.linkedin ? 'pointer' : 'default' }}
                  >
                    <Avatar src={item.avatar} color={valueToColor(theme, item.name)} radius="lg" size={30}>
                      {nameToInitials(item.name)}
                    </Avatar>
                    <Box>
                      <Flex align={"center"} justify={"space-between"}>
                        <Flex align={"center"} gap={4} style={{ flexGrow: 1 }}>
                          <Text size={"sm"} fw={500}>
                            {item.name}
                          </Text>
                          <IconBrandLinkedin
                            size={"1.4rem"}
                            onClick={() => {
                              if (item.linkedin_url) {
                                window.open(item.linkedin_url, '_blank');
                              }
                            }}
                            fill="#228be6"
                            color="white" />
                        </Flex>

                      </Flex>
                      {/* <Badge variant="light">{"very high"}</Badge> */}
                      <Text size={"xs"} fw={400} color="gray">
                        {item.job}
                      </Text>
                      <Flex align={"center"} gap={4} wrap={"wrap"} mt={5}>
                        {Object.entries(item.filter).filter(([key, value]) => value && (typeof value === 'string' ? value.trim() !== '' : true)).length !== 0 && (
                          <Text tt={"uppercase"} size={"xs"} color="gray">
                            matched filters:
                          </Text>
                        )}
                        {Object.entries(item.filter).filter(([key, value]) => value && (typeof value === 'string' ? value.trim() !== '' : true)).map(([key, value]) => (
                          <Flex align={"center"} gap={4} key={key}>
                            <IconCircleCheck fill="green" color="white" size={"1.2rem"} />
                            <Text fw={400} size={"xs"}>
                              {key.replace(/_/g, ' ').charAt(0).toUpperCase() + key.replace(/_/g, ' ').slice(1)}: <span className="font-medium">{String(value)}</span>
                            </Text>
                          </Flex>
                        ))}
                      </Flex>
                    </Box>
                  </Flex>
                );
              })}
            </Stack>
          </ScrollArea>
        </Paper>
      </Flex>
    </Box>
  );
}
