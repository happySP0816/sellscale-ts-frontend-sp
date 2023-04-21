import { userTokenState } from "@atoms/userAtoms";
import { API_URL } from "@constants/data";
import { Title, Text, Card, Code, Container, Button } from "@mantine/core";
import { IconMail } from "@tabler/icons";
import { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";

type PropsType = {
  archetype_id: number;
};

export default function PullProspectEmailsCard(props: PropsType) {
  const [numEmailFetchingCredits, setNumEmailFetchingCredits] = useState(0);
  const [unusedEmailProspects, setUnusedEmailProspects] = useState(0);
  const [fetchButtonDisabled, setFetchButtonDisabled] = useState(false);
  const [fetchedStats, setFetchedStats] = useState(false);
  const userToken = useRecoilValue(userTokenState);

  const fetchCredits = async () => {
    const res = await fetch(`${API_URL}/prospect/get_credits`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    });
    const data = await res.json();
    setNumEmailFetchingCredits(data.email_fetching_credits);
  };

  const fetchNumUunusedProspects = async () => {
    const res = await fetch(
      `${API_URL}/client/unused_li_and_email_prospects_count?client_archetype_id=` +
        props.archetype_id,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      }
    );
    const data = await res.json();
    setUnusedEmailProspects(data.unused_email_prospects);
  };

  const fetchAdditionalProspectEmails = async () => {
    setFetchButtonDisabled(true);
    const res = await fetch(`${API_URL}/prospect/pull_emails`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    });

    setTimeout(() => {
      setFetchButtonDisabled(false);
    }, 10000);
  };

  const refreshStats = () => {
    fetchCredits();
    fetchNumUunusedProspects();
  };

  useEffect(() => {
    if (!fetchedStats) {
      refreshStats();
    }
    setFetchedStats(true);
  }, [refreshStats]);

  return (
    <Card pl="sm" pr="sm" mt="md" mr="md">
      <Container>
        <Title order={3}>
          {unusedEmailProspects} Unused Prospects with Emails
        </Title>
        <Text size="sm">
          Fetch more emails for this persona by pressing{" "}
          <Code color="pink">Fetch Emails</Code>. If an email is found, it will
          use 1 Email Extraction Credit. If email was already found or no email
          was found, it will not use a credit.
        </Text>
      </Container>
      <Container>
        <Text mt="md" size="sm">
          By pressing this button, you may use your Email Extraction Credits
        </Text>
        <Button
          size="lg"
          color="pink"
          mt="md"
          leftIcon={<IconMail />}
          mb="sm"
          onClick={fetchAdditionalProspectEmails}
          disabled={fetchButtonDisabled}
        >
          Fetch Emails
        </Button>
      </Container>

      <Button
        size="xs"
        variant="subtle"
        color="gray"
        mt="sm"
        onClick={refreshStats}
      >
        Refresh Stats
      </Button>
    </Card>
  );
}
