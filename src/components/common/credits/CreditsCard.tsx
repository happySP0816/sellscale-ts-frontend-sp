import { userTokenState } from "@atoms/userAtoms";
import { API_URL } from "@constants/data";
import { Title, Text, Card, Divider } from "@mantine/core";
import { Progress } from "@mantine/core";
import { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";

export default function CreditsCard() {
  const [numEmailFetchingCredits, setNumEmailFetchingCredits] = useState(0);
  const userToken = useRecoilValue(userTokenState);

  const MAX_NUM_EMAIL_FETCHING_CREDITS = 2000;

  useEffect(() => {
    const fetchCredits = async () => {
      const res = await fetch(
        `${API_URL}/prospect/get_credits`,
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
    fetchCredits();
  }, []);

  return (
    <Card pl="sm" pr="sm">
      <Title order={4} mb="md">
        Credits
      </Title>
      <Text size="sm">Email Extraction Credits</Text>
      <Progress
        value={(numEmailFetchingCredits / MAX_NUM_EMAIL_FETCHING_CREDITS) * 100}
        animate
        size={"lg"}
        color="pink"
      />
      <Text size="xs" mb="md">
        {numEmailFetchingCredits} / {MAX_NUM_EMAIL_FETCHING_CREDITS} credits
        left for month
      </Text>
    </Card>
  );
}
