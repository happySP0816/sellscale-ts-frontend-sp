import { userTokenState } from "@atoms/userAtoms";
import { API_URL } from "@constants/data";
import {
  Box,
  Button,
  Card,
  Collapse,
  Container,
  LoadingOverlay,
  MultiSelect,
  NumberInput,
  Text,
  TextInput,
  Textarea,
} from "@mantine/core";
import React, { useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import DoNotContactList from "../DoNotContactList";
import { IconWashMachine } from "@tabler/icons";

export default function SellScaleBrainCompanyTab(props: { siteUrl?: String }) {
  const [userToken] = useRecoilState(userTokenState);
  const [fetchedCompany, setFetchedCompany] = React.useState(false);
  const [fetchingCompany, setFetchingCompany] = React.useState(false);
  const [needsSave, setNeedsSave] = React.useState(false);

  const [companyName, setCompanyName] = React.useState("");
  const [companyTagline, setCompanyTagline] = React.useState("");
  const [companyDescription, setCompanyDescription] = React.useState("");
  const [companyMission, setCompanyMission] = React.useState("");
  const [companyCaseStudy, setCompanyCaseStudy] = React.useState("");
  const [valuePropsKeyPoints, setValuePropsKeyPoints] = React.useState("");
  const [toneAttributes, setToneAttributes]: any = React.useState([]);
  const [contractSize, setContractSize] = useState(0);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [toneOptions, setToneOptions] = useState([
    { value: "professional", label: "Professional" },
    { value: "fun", label: "Fun" },
    { value: "serious", label: "Serious" },
    { value: "quirky", label: "Quirky" },
    { value: "friendly", label: "Friendly" },
    { value: "helpful", label: "Helpful" },
    { value: "authoritative", label: "Authoritative" },
    { value: "confident", label: "Confident" },
    { value: "casual", label: "Casual" },
    { value: "formal", label: "Formal" },
    { value: "informal", label: "Informal" },
    { value: "direct", label: "Direct" },
  ]);

  const fetchCompany = async () => {
    setFetchingCompany(false);
    const response = await fetch(`${API_URL}/client/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
    });
    const data = await response.json();
    setCompanyName(data.company);
    setCompanyTagline(data.tagline);
    setCompanyDescription(data.description);
    setCompanyMission(data.mission);
    setCompanyCaseStudy(data.case_study);
    setValuePropsKeyPoints(data.value_prop_key_points);
    setToneAttributes(data.tone_attributes);
    setFetchingCompany(false);
    setNeedsSave(false);
    setContractSize(data.contract_size);
  };

  const saveCompany = async () => {
    setFetchingCompany(true);
    const response = await fetch(`${API_URL}/client/`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        company: companyName,
        tagline: companyTagline,
        description: companyDescription,
        mission: companyMission,
        case_study: companyCaseStudy,
        value_prop_key_points: valuePropsKeyPoints,
        tone_attributes: toneAttributes,
        contract_size: contractSize,
      }),
    });
    setFetchingCompany(false);
    setNeedsSave(false);
    fetchCompany();
  };
  useEffect(() => {
    if (props.siteUrl) {
      setFetchingCompany(true);
      var myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");

      var raw = JSON.stringify({
        url: props.siteUrl,
      });

      var requestOptions: any = {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow",
      };

      fetch(`${API_URL}/research/generate_website_metadata`, requestOptions)
        .then((response) => response.text())
        .then(async (result) => {
          const data = await JSON.parse(result);
          setCompanyName(data.company_name);
          setCompanyTagline(data.summary);
          setCompanyDescription(data.description);
          setCompanyMission(data.mission);
          setCompanyCaseStudy(data.case_study);
          setValuePropsKeyPoints(data.value_proposition);
          setToneAttributes(data.tone_attributes);
          setContractSize(data.contract_size);

          setFetchingCompany(false);
          setNeedsSave(true);
        })
        .catch((error) => console.log("error", error));
    }
  }, [props.siteUrl]);

  useEffect(() => {
    if (!fetchedCompany) {
      fetchCompany();
      setFetchedCompany(false);
    }
  }, [fetchedCompany]);

  return (
    <Box>
      <Container>
        <Card>
          <LoadingOverlay visible={fetchingCompany} />
          <TextInput
            label="Company Name"
            value={companyName}
            onChange={(event) => {
              setCompanyName(event.currentTarget.value);
              setNeedsSave(true);
            }}
            mb="sm"
          />
          <Textarea
            label="Company Tagline"
            description="A short 7-8 word description of your company"
            value={companyTagline}
            onChange={(event) => {
              setCompanyTagline(event.currentTarget.value);
              setNeedsSave(true);
            }}
            mb="sm"
          />
          <Textarea
            label="Company Description"
            description="A longer description of your company and what you do"
            minRows={5}
            value={companyDescription}
            onChange={(event) => {
              setCompanyDescription(event.currentTarget.value);
              setNeedsSave(true);
            }}
            mb="sm"
          />
          <Collapse in={showAdvanced}>
            <Textarea
              label="Company Mission"
              description="Your company's mission statement"
              minRows={5}
              value={companyMission}
              onChange={(event) => {
                setCompanyMission(event.currentTarget.value);
                setNeedsSave(true);
              }}
              mb="sm"
            />
            <Textarea
              label="Value Proposition Key Points"
              description="A list of 3-5 key points that describe your value proposition"
              minRows={5}
              value={valuePropsKeyPoints}
              onChange={(event) => {
                setValuePropsKeyPoints(event.currentTarget.value);
                setNeedsSave(true);
              }}
              mb="sm"
            />
            <MultiSelect
              label="(Optional) Tone Attributes"
              description="Select 3-5 tone attributes that describe your company"
              data={toneOptions}
              value={toneAttributes}
              onChange={(value) => {
                setToneAttributes(value);
                setNeedsSave(true);
              }}
              searchable
              mb="sm"
            />
            <TextInput
              label="(Optional) Company Case Study"
              value={companyCaseStudy}
              placeholder="https://example.com/fh/files/misc/hsw-sqrg.pdf"
              onChange={(event) => {
                setCompanyCaseStudy(event.currentTarget.value);
                setNeedsSave(true);
              }}
              mb="sm"
            />

            <NumberInput
              label="Annual Contract Value (ACV)"
              value={contractSize || 0}
              parser={(value) => value?.replace(/\$\s?|(,*)/g, "")}
              formatter={(value) =>
                !Number.isNaN(parseFloat(value))
                  ? `$ ${value}`.replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")
                  : "$ "
              }
              onChange={(value) => {
                setContractSize(value || 0);
                setNeedsSave(true);
              }}
            />
          </Collapse>
          <Button
            w="100%"
            mt="xs"
            variant="outline"
            color="gray"
            onClick={() => setShowAdvanced(!showAdvanced)}
            leftIcon={<IconWashMachine />}
          >
            {showAdvanced ? "Hide Advanced" : "Show Advanced"}
          </Button>

          <Button
            color="blue"
            variant="light"
            mt="md"
            disabled={!needsSave}
            onClick={() => saveCompany()}
          >
            Save Company Information
          </Button>
          <Button
            color="red"
            variant="outline"
            mt="md"
            ml="lg"
            onClick={fetchCompany}
            hidden={!needsSave}
          >
            Cancel Edits
          </Button>
        </Card>
      </Container>
    </Box>
  );
}
