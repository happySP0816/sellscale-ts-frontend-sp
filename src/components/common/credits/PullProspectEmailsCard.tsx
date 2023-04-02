import { userTokenState } from "@atoms/userAtoms";
import { Title, Text, Card, Flex, Container, Button } from "@mantine/core";
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
    const res = await fetch(
      `${process.env.REACT_APP_API_URI}/prospect/get_credits`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      }
    );
    const data = await res.json();
    setNumEmailFetchingCredits(data.email_fetching_credits);
  };

  const fetchNumUunusedProspects = async () => {
    const res = await fetch(
      `${process.env.REACT_APP_API_URI}/client/unused_li_and_email_prospects_count?client_archetype_id=` +
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
    const res = await fetch(
      `${process.env.REACT_APP_API_URI}/prospect/pull_emails`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      }
    );

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
    <Card pl="sm" pr="sm">
      <Flex>
        <Container>
          <Title order={3}>
            {unusedEmailProspects} Unused Prospects with Emails
          </Title>
          <Text>
            Fetch more emails for this persona by pressing `Fetch Emails`. If an
            email is found, it will use 1 Email Extraction Credit. If email was
            already found or no email was found, it will not use a credit.
          </Text>
        </Container>
        <Container>
          <Button
            size="lg"
            color="pink"
            leftIcon={<IconMail />}
            mb="sm"
            onClick={fetchAdditionalProspectEmails}
            disabled={fetchButtonDisabled}
          >
            Fetch Emails
          </Button>
          <Text size="sm">
            By pressing this button, you may use your Email Extraction Credits
          </Text>
          <Button
            size="xs"
            variant="outline"
            color="gray"
            mt="sm"
            onClick={refreshStats}
          >
            Refresh
          </Button>
        </Container>
      </Flex>
    </Card>
  );
}
