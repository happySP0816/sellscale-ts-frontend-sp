import { userDataState, userTokenState } from "@atoms/userAtoms";
import CustomSelect from "@common/persona/ICPFilter/CustomSelect";
import {
  IcpRouteData,
  UpdateIcpRouteData,
  useTrackApi,
} from "@common/settings/Traffic/WebTrafficRoutingApi";
import { API_URL } from "@constants/data";
import {
  Accordion,
  Box,
  Button,
  Card,
  Checkbox,
  Flex,
  Loader,
  MultiSelect,
  Paper,
  ScrollArea,
  SegmentedControl,
  Select,
  Stack,
  Tabs,
  Text,
  Textarea,
  TextInput,
  Title,
} from "@mantine/core";
import { ContextModalProps, closeAllModals, openContextModal } from "@mantine/modals";
import { showNotification } from "@mantine/notifications";
import { IconArrowRight, IconCheck, IconFilter, IconMinus, IconPencil, IconPlus } from "@tabler/icons";
import e from "cors";
import { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";

type Segment = {
  num_results: number;
  attached_segments: any[];
  client_archetype: {
    archetype: string;
    emoji: string;
  };
  client_sdr: {
    client_id: number;
    id: number;
  };
  filters: {
    excluded_bio_keywords: string[];
    excluded_company_keywords: string[];
    excluded_education_keywords: string[];
    // Add other filter fields as necessary
  };
  id: number;
  num_contacted: number;
  num_prospected: number;
  parent_segment_id: number | null;
  saved_apollo_query_id: number;
  segment_title: string;
  unique_companies: number;
};

export default function ICPRoutingCreateModal({
  context,
  id,
  innerProps,
}: ContextModalProps<{ onClose: () => void; icpRouteId: number }>) {
  const userToken = useRecoilValue(userTokenState);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fetchingSegments, setFetchingSegments] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [segment, setSegment] = useState<string | null>(null);
  const [sendSlack, setSendSlack] = useState(false);
  const [includedCompanies, setIncludedCompanies] = useState<string[]>([]);
  const [includedTitles, setIncludedTitles] = useState<string[]>([]);
  const [includedLocations, setIncludedLocations] = useState<string[]>([]);
  const [icpQueries, setIcpQueries] = useState<[]>([]);
  const [data, setData] = useState<any[]>([]);
  const [includedCompanySizes, setIncludedCompanySizes] = useState<string[]>(
    []
  );
  const [active, setActive] = useState(true);

  const [mode, setMode] = useState("ai_mode");
  const [rules, setRules] = useState<{ segment: string; condition: string; value: string; }[]>([]);

  const [segmentOptions, setSegmentOptions] = useState<Segment[]>([]);

  const createSegment = async (segmentName?: string) => {
    return fetch(`${API_URL}/segment/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        segment_title: segmentName,
        // is_market_map: isMarketMapSegment,
        filters: {},
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        return data;
      });
  };

  const doStuff = async (query: string, icp_route_id: number) => {
    setFetchingSegments(true);
      const newSegment = await createSegment(query);
      updateIcpRoute(icp_route_id || -1, {
        segment_id: newSegment.id,
      });
      await fetchSegments();
      await fetchData();
      setFetchingSegments(false);
      setSegment(newSegment.id.toString());
      return { value: newSegment.id.toString(), label: newSegment.segment_title };

    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const icpRoutes = await getAllIcpRoutes();
        const formattedData = icpRoutes.map((route: UpdateIcpRouteData) => ({
          icpRouteTitle: route.title,
          description: route.description,
          id: route.id,
          count: route.count,
          ai_mode: route.ai_mode,
          segment_id: route.segment_id,
          rules: route.rules,
          routeTo: route.segment_id ? `${route.segment_title} ✅` : "no segment connected",
          send_slack: route.send_slack,
          status: route.active,
          icpRouteId: route.id,
        }));
        console.log('data', formattedData);
        setData(formattedData);
      } catch (error) {
        console.error("Error fetching ICP routes:", error);
      }
      setLoading(false);
    };

  const fetchSegments = async () => {
    setFetchingSegments(true);
    const segments = await getSegments();
    setSegmentOptions(segments);
    setFetchingSegments(false);
  };

  const fetchIcpQueries = async () => {
    const url = new URL(`${API_URL}/apollo/get_all_icp_queries`);
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
    });
    const data = await response.json();
    setIcpQueries(data.data);
    return data;
  };

  const {
    isLoading,
    getTrackSourceMetadata,
    getScript,
    verifySource,
    getMostRecentTrackEvent,
    getTrackEventHistory,
    getDeanonomizedContacts,
    createIcpRoute,
    updateIcpRoute,
    getAllIcpRoutes,
    getIcpRouteDetails,
    getSegments,
  } = useTrackApi(userToken);

  const getIcpRouteData = async () => {
    if (!innerProps.icpRouteId) return;
    setLoading(true);

    const data = await getIcpRouteDetails(innerProps.icpRouteId);
    setTitle(data.title);
    setDescription(data.description);
    setSegment(data.segment_id?.toString() || null);
    setSendSlack(data.send_slack);
    setMode(data.ai_mode ? 'ai_mode' : "rule_mode");
    setRules(data.rules || []);
    setIncludedCompanies(
      data.filter_company ? data.filter_company.split(",") : []
    );
    setIncludedTitles(data.filter_title ? data.filter_title.split(",") : []);
    setIncludedLocations(
      data.filter_location ? data.filter_location.split(",") : []
    );
    setIncludedCompanySizes(
      data.filter_company_size ? data.filter_company_size.split(",") : []
    );
    setActive(data.active || true);

    setLoading(false);
  };

  const handleUpdateIcpRoute = async () => {
    setSaving(true);

    //filter out all the rules that are empty

    const filteredRules = rules.filter((rule) => rule.condition !== '' && rule.value !== '');

    const routeUpdateData: UpdateIcpRouteData = {
      title,
      rules: filteredRules || [],
      ai_mode: (mode === 'ai_mode'),
      description,
      filter_company: includedCompanies.join(","),
      filter_title: includedTitles.join(","),
      filter_location: includedLocations.join(","),
      filter_company_size: includedCompanySizes.join(","),
      segment_id: segment ? parseInt(segment) : undefined,
      send_slack: sendSlack,
      active: active,
    };

    try {
      await updateIcpRoute(innerProps.icpRouteId, routeUpdateData);
      showNotification({
        title: "Success",
        message: "ICP Route updated successfully",
        color: "green",
      });
      closeAllModals();
      innerProps.onClose();
    } catch (error) {
      showNotification({
        title: "Error",
        message: "Failed to update ICP Route",
        color: "red",
      });
      console.error("Error updating ICP Route:", error);
    }

    setSaving(false);
  };

  const handleCreateIcpRoute = async () => {
    setSaving(true);
    const routeData: IcpRouteData = {
      title,
      description,
      ai_mode: mode === 'ai_mode',
      rules: rules || [],
      filter_company: includedCompanies.join(","),
      filter_title: includedTitles.join(","),
      filter_location: includedLocations.join(","),
      filter_company_size: includedCompanySizes.join(","),
      segment_id: segment ? parseInt(segment) : undefined,
      send_slack: sendSlack,
    };

    try {
      await createIcpRoute(routeData);
      showNotification({
        title: "Success",
        message: "ICP Route created successfully",
        color: "green",
      });
      // Assuming there's a function to close the modal
      closeAllModals();
      innerProps.onClose();
    } catch (error) {
      showNotification({
        title: "Error",
        message: "Failed to create ICP Route",
        color: "red",
      });
      console.error("Error creating ICP Route:", error);
    }

    setSaving(false);
  };

  useEffect(() => {
    getIcpRouteData();
  }, [innerProps.icpRouteId]);

  useEffect(() => {
    const fetchSegments = async () => {
      setFetchingSegments(true);
      const segments = await getSegments();
      setSegmentOptions(segments);
      setFetchingSegments(false);
    };

    fetchSegments();
    fetchIcpQueries();
  }, [userToken]);

  return (
    <Paper>
      {loading && (
        <Flex mb="md">
          <Loader size="sm" variant="dots"></Loader>
          <Text ml="md" size="sm" color="gray">
            Loading ICP routing information ...
          </Text>
        </Flex>
      )}
      <TextInput
        label="ICP Route Title"
        placeholder="Enter the title for the ICP Route"
        value={title}
        onChange={(event) => setTitle(event.currentTarget.value)}
      />
      <Text mt ='sm'>{'Target Segment'}</Text>
      {!fetchingSegments ? <Select
        style={{ minWidth: "300px", transition: "all 0.3s ease-in-out" }}
        withinPortal
        mt={"sm"}
        data={segmentOptions.map((segment) => ({
          value: segment.id.toString(),
          label: segment.segment_title,
        }))}
        label={segment ? null : <Text color="red">No Segment Attached</Text>}
        placeholder="Select Segment"
        value={segment?.toString() || ""}
        creatable
        searchable
        getCreateLabel={(query) => `+ Create ${query}`}
        onCreate={(query) => {
          doStuff(query, innerProps.icpRouteId);
          return null
        }}
        onChange={(value) => {
          console.log('value changed', value);
          updateIcpRoute(innerProps.icpRouteId || -1, {
            segment_id: value ? parseInt(value) : undefined,
          });

          setSegment(value);
          showNotification({
            title: "Success",
            message: "Segment attached successfully",
            color: "green",
            icon: <IconCheck />,
          });
          // unfocus the select
          setTimeout(() => {
            (document.activeElement as HTMLElement)?.blur();
          }, 0);
        }}
        onDropdownOpen={() => {
          console.log('Dropdown opened');
        }}
        onDropdownClose={() => {
          console.log('Dropdown closed');
        }}
      /> : <Loader size="sm" variant="dots"></Loader>}
      <Checkbox
        mt={"md"}
        mb="md"
        label="Send Slack notifications"
        checked={sendSlack}
        onChange={(event) => setSendSlack(event.currentTarget.checked)}
      />
      <Flex justify="center" mt="sm">
        <SegmentedControl
          data={[
            { value: "ai_mode", label: "AI Mode" },
            { value: "rule_mode", label: "Rule Mode" },
          ]}
          value={mode}
          onChange={(mode) => setMode(mode)}
        />
      </Flex>



      {mode === 'ai_mode' ? <>
        <Textarea
          minRows={5}
          label="Describe your ICP:"
          placeholder="Eg. Product managers in chicago"
          value={description}
          onChange={(event) => setDescription(event.currentTarget.value)}
        />
        {/* <Box mt={"sm"}>
        <Text size="sm" fw={600}>
          Filter Attributes:
        </Text>
        <ICPAccount
          includedCompanies={includedCompanies}
          setIncludedCompanies={setIncludedCompanies}
          includedTitles={includedTitles}
          setIncludedTitles={setIncludedTitles}
          includedLocations={includedLocations}
          setIncludedLocations={setIncludedLocations}
          includedCompanySizes={includedCompanySizes}
          setIncludedCompanySizes={setIncludedCompanySizes}
        />
      </Box> */}
        <Flex gap={"lg"} mt={"xl"}>
          <Button fullWidth variant="outline" color="gray">
            Cancel
          </Button>
        </Flex>
      </> : (<>


        <Flex direction="column" align="center" mt="xl">

          {rules.map((rule, index) => (
            <Flex key={index} align="center" mt="md" gap="md">
              <TextInput
                value="if"
                disabled
                style={{ width: "50px", textAlign: "center" }}
              />
              <Select
                withinPortal        
                value={rule.condition}
                onChange={(value) => {
                  const newRules = [...rules];
                  newRules[index].condition = value ?? "";
                  setRules(newRules);
                }}
                data={[
                  { value: "filter_matches", label: "Filter Matches" },
                  { value: "title_contains", label: "Title contains" },
                  { value: "title_not_contains", label: "Title does not contain" },
                  { value: "company_name_is", label: "Company name is" },
                  { value: "company_name_is_not", label: "Company name is not" },
                  { value: "person_name_is", label: "Person name is" },
                  { value: "has_clicked_on_page", label: "Has clicked on page" },
                  { value: "has_not_clicked_on_page", label: "Has not clicked on page" },
                  // Add more options as needed
                ]}
                placeholder="Select condition"
                style={{ width: "220px" }}
              />
              {rule.condition === "filter_matches" ? (
                <Select
                  withinPortal
                  value={rule.value}
                  onChange={(value) => {
                    const newRules = [...rules];
                    newRules[index].value = value ?? "";
                    setRules(newRules);
                  }}
                  itemComponent={({ value, label }) => (
                    <Flex
                      align="center"
                      gap="xs"
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#d3d3d3';
                        e.currentTarget.style.cursor = 'pointer';
                        const textElement = e.currentTarget.querySelector('Text');
                        if (textElement instanceof HTMLElement) {
                          textElement.style.color = '#000000';
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        const textElement = e.currentTarget.querySelector('Text');
                        if (textElement instanceof HTMLElement) {
                          textElement.style.color = '#000000';
                        }
                      }}
                      onClick={() => {
                        if (value === "create_new") {
                          openContextModal({
                            modal: "prefilterEditModal",
                            title: (
                              <Title order={3} className="flex items-center gap-2">
                                <IconFilter size={"1.5rem"} color="#228be6" /> Edit Pre-Filter
                              </Title>
                            ),
                            innerProps: {isIcpFilter: true},
                            centered: true,
                            styles: {
                              content: {
                                minWidth: "80%",
                              },
                            },
                          });
                          console.log("Create new item clicked");
                        } else {
                          const newRules = [...rules];
                          newRules[index].value = value;
                          setRules(newRules);
                        }
                      }}
                    >
                      <Text>{label}</Text>
                    </Flex>
                  )}
                  data={icpQueries.map((item: { id: string; custom_name: string }) => ({ value: item.id, label: item.custom_name })).concat({ value: "create_new", label: "+ Create New" })}
                  placeholder="Select value"
                  style={{ width: "70%" }}
                  rightSection={
                    rule.value !== "create_new" && (
                      <Button
                        onClick={(e) => { e.stopPropagation(); 
                          openContextModal({
                            modal: "prefilterEditModal",
                            title: (
                              <Title order={3} className="flex items-center gap-2">
                                <IconFilter size={"1.5rem"} color="#228be6" /> Edit Pre-Filter
                              </Title>
                            ),
                            innerProps: {isIcpFilter: true, id: rule.value},
                            centered: true,
                            styles: {
                              content: {
                                minWidth: "80%",
                              },
                            },
                          });
                          }
                        }
                        variant="subtle"
                        color="blue"
                        style={{ padding: 0 }}
                      >
                        {rule.value && <IconPencil size={16} />}
                      </Button>
                    )
                  }
                />
              ) : (
                <TextInput
                  placeholder={
                    rule.condition === 'has_not_clicked_on_page' || rule.condition === 'has_clicked_on_page' 
                      ? '/home' // Hint: Enter the page URL
                      : rule.condition === 'title_contains' || rule.condition === 'title_not_contains' 
                      ? 'Director' // Hint: Enter the job title
                      : rule.condition === 'company_name_is' || rule.condition === 'company_name_is_not' 
                      ? 'Company Name' // Hint: Enter the company name
                      : rule.condition === 'person_name_is'? 'Steve'
                      : 'Enter Value' 
                  }
                  value={rule.value}
                  onChange={(event) => {
                    const newRules = [...rules];
                    newRules[index].value = event.currentTarget.value;
                    setRules(newRules);
                  }}
                  style={{ width: "150px" }}
                />
              )}
              <Button
                color="red"
                onClick={() => {
                  const newRules = rules.filter((_, i) => i !== index);
                  setRules(newRules);
                }}
              >
                <IconMinus />
              </Button>
              {index < rules.length - 1 && (
              <Text style={{ margin: '10px 0' }}>
                and
              </Text>
            )}
            </Flex>
          ))}
          
          <Button
            mt="xl"
            leftIcon={<IconPlus size={"1rem"} />}
            onClick={() => {
              setRules([...rules, { segment: "", condition: "", value: "" }]);
            }}
            style={{ width: "200px", backgroundColor: "#a9a9a9" }}
          >
            Add Rule
          </Button>
        </Flex>




      </>)}
      <Flex justify="center" direction="column" align="center" mt="lg">
        <Button
          style={{ width: "200px" }}
          loading={saving}
          fullWidth
          leftIcon={<IconPlus size={"1rem"} />}
          onClick={() => {
            innerProps.icpRouteId
              ? handleUpdateIcpRoute()
              : handleCreateIcpRoute();
          }}
        >
          {innerProps.icpRouteId ? "Save & Close" : "Save & Close"}
        </Button>
      </Flex>
    </Paper>
  );
}
