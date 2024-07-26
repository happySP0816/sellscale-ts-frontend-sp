import { userTokenState } from "@atoms/userAtoms";
import CustomSelect from "@common/persona/ICPFilter/CustomSelect";
import {
  IcpRouteData,
  UpdateIcpRouteData,
  useTrackApi,
} from "@common/settings/Traffic/WebTrafficRoutingApi";
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
} from "@mantine/core";
import { ContextModalProps, closeAllModals } from "@mantine/modals";
import { showNotification } from "@mantine/notifications";
import { IconArrowRight, IconMinus, IconPlus } from "@tabler/icons";
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
  const [includedCompanySizes, setIncludedCompanySizes] = useState<string[]>(
    []
  );
  const [active, setActive] = useState(true);

  const [mode, setMode] = useState("ai_mode");
  const [rules, setRules] = useState<{ segment: string; condition: string; value: string; }[]>([]);

  const [segmentOptions, setSegmentOptions] = useState<Segment[]>([]);

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
      <Select
        withinPortal
        mt={"sm"}
        data={
          segmentOptions
            ? segmentOptions.map((segment) => ({
              value: segment.id + "",
              label: segment.segment_title,
            }))
            : []
        }
        placeholder="Select Segment"
        label={
          "Target Segment" + (fetchingSegments ? " (loading)" : "") + ":"
        }
        value={segment}
        onChange={(value) => setSegment(value)}
      />
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
              <Select
                withinPortal
                disabled
                value="Add to segment"
                data={[{ value: "Add to segment", label: "Add to segment" }]}
                style={{ width: "170px" }}
              />
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
                  { value: "title_contains", label: "Title contains" },
                  { value: "title_not_contains", label: "Title does not contain" },
                  { value: "company_name_is", label: "Company name is" },
                  { value: "person_name_is", label: "Person name is" },
                  { value: "has_clicked_on_page", label: "Has clicked on page" },
                  // Add more options as needed
                ]}
                placeholder="Select condition"
                style={{ width: "170px" }}
              />
              <TextInput
                value={rule.value}
                onChange={(event) => {
                  const newRules = [...rules];
                  newRules[index].value = event.currentTarget.value;
                  setRules(newRules);
                }}
                placeholder="Enter value"
                style={{ width: "150px" }}
              />
              <Button
                color="red"
                onClick={() => {
                  const newRules = rules.filter((_, i) => i !== index);
                  setRules(newRules);
                }}
              >
                <IconMinus />
              </Button>
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
        <Button
          mt="lg"
          rightIcon={<IconArrowRight size={"1rem"} />}
          variant="outline"
          fullWidth
          disabled
        >
          Do an Example Test
        </Button>
      </Flex>
    </Paper>
  );
}

const ICPAccount = ({
  includedCompanies,
  setIncludedCompanies,
  includedTitles,
  setIncludedTitles,
  includedLocations,
  setIncludedLocations,
  includedCompanySizes,
  setIncludedCompanySizes,
}: {
  includedCompanies: string[];
  setIncludedCompanies: React.Dispatch<React.SetStateAction<string[]>>;
  includedTitles: string[];
  setIncludedTitles: React.Dispatch<React.SetStateAction<string[]>>;
  includedLocations: string[];
  setIncludedLocations: React.Dispatch<React.SetStateAction<string[]>>;
  includedCompanySizes: string[];
  setIncludedCompanySizes: React.Dispatch<React.SetStateAction<string[]>>;
}) => {
  return (
    <Card withBorder pt={"0px"}>
      <Stack>
        <Accordion
          defaultValue={"job"}
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
          <Accordion.Item value="companies">
            <Accordion.Control>
              Companies ({includedCompanies.length})
            </Accordion.Control>
            <Accordion.Panel>
              <MultiSelect
                searchable
                creatable
                value={includedCompanies}
                label="Included"
                placeholder="Select or create options"
                onChange={setIncludedCompanies}
                data={includedCompanies}
                getCreateLabel={(query) => `+ Create ${query}`}
                onCreate={(query) => {
                  const newItem = query;
                  setIncludedCompanies((current) => [...current, newItem]);
                  return newItem;
                }}
              />
            </Accordion.Panel>
          </Accordion.Item>
          <Accordion.Item value="title">
            <Accordion.Control>
              Title ({includedTitles.length})
            </Accordion.Control>
            <Accordion.Panel>
              <MultiSelect
                searchable
                creatable
                value={includedTitles}
                label="Included"
                placeholder="Select or create options"
                onChange={setIncludedTitles}
                data={includedTitles}
                getCreateLabel={(query) => `+ Create ${query}`}
                onCreate={(query) => {
                  const newItem = query;
                  setIncludedTitles((current) => [...current, newItem]);
                  return newItem;
                }}
              />
            </Accordion.Panel>
          </Accordion.Item>
          <Accordion.Item value="location">
            <Accordion.Control>
              Location ({includedLocations.length})
            </Accordion.Control>
            <Accordion.Panel>
              <MultiSelect
                searchable
                creatable
                value={includedLocations}
                label="Included"
                placeholder="Select or create options"
                onChange={setIncludedLocations}
                data={includedLocations}
                getCreateLabel={(query) => `+ Create ${query}`}
                onCreate={(query) => {
                  const newItem = query;
                  setIncludedLocations((current) => [...current, newItem]);
                  return newItem;
                }}
              />
            </Accordion.Panel>
          </Accordion.Item>
          <Accordion.Item value="company_size">
            <Accordion.Control>
              Company Size ({includedCompanySizes.length})
            </Accordion.Control>
            <Accordion.Panel>
              <MultiSelect
                searchable
                creatable
                value={includedCompanySizes}
                label="Included"
                placeholder="Select or create options"
                onChange={setIncludedCompanySizes}
                data={includedCompanySizes}
                getCreateLabel={(query) => `+ Create ${query}`}
                onCreate={(query) => {
                  const newItem = query;
                  setIncludedCompanySizes((current) => [...current, newItem]);
                  return newItem;
                }}
              />
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
      </Stack>
    </Card>
  );
};
