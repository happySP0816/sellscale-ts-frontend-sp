import CustomSelect from "@common/persona/ICPFilter/CustomSelect";
import { Box, Button, Paper, Text } from "@mantine/core";
import { useState } from "react";

export default function CreateFundraiseSonarmodal() {
  const [fundingRound, setFundingRound] = useState([""]);
  const [companyIndustries, setCompanyIndustries] = useState([""]);
  const [companySize, setCompanySize] = useState([""]);
  const [companyLocation, setCompanyLocation] = useState([""]);
  const [prospectTitle, setProspectTitle] = useState([""]);
  const [prospectSeniority, setProspectSeniority] = useState([""]);
  return (
    <Paper>
      <Text color="gray" fw={500}>
        Fundraise Sonar: track donations, analyze performance, engage supporters, amplify impact.
      </Text>

      <Box mt={26}>
        <Text fw={600} size={"lg"} tt={"uppercase"} mb={"sm"}>
          Account
        </Text>
        <CustomSelect
          maxWidth="30vw"
          value={fundingRound}
          label="Funding Round"
          placeholder="Select options"
          setValue={setFundingRound}
          data={fundingRound}
          setData={setFundingRound}
        />
        <CustomSelect
          maxWidth="30vw"
          value={companyIndustries}
          label="Company Industries"
          placeholder="Select options"
          setValue={setCompanyIndustries}
          data={companyIndustries}
          setData={setCompanyIndustries}
        />
        <CustomSelect
          maxWidth="30vw"
          value={companySize}
          label="Company Size"
          placeholder="Select options"
          setValue={setCompanySize}
          data={companySize}
          setData={setCompanySize}
        />
        <CustomSelect
          maxWidth="30vw"
          value={companyLocation}
          label="Prospect Title:"
          placeholder="Select options"
          setValue={setCompanyLocation}
          data={companyLocation}
          setData={setCompanyLocation}
        />
      </Box>
      <Box mt={26}>
        <Text fw={600} size={"lg"} tt={"uppercase"} mb={"sm"}>
          Account
        </Text>
        <CustomSelect
          maxWidth="30vw"
          value={prospectTitle}
          label="Funding Round"
          placeholder="Select options"
          setValue={setProspectTitle}
          data={prospectTitle}
          setData={setProspectTitle}
        />
        <CustomSelect
          maxWidth="30vw"
          value={prospectSeniority}
          label="Prospect Seniority"
          placeholder="Select options"
          setValue={setProspectSeniority}
          data={prospectSeniority}
          setData={setProspectSeniority}
        />
      </Box>
      <Button fullWidth mt={30} size="md">
        Create
      </Button>
    </Paper>
  );
}
