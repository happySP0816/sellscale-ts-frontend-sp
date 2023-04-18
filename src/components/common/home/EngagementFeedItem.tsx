import { Card, Title, Text, Group, Badge, useMantineTheme, Avatar, Flex, Divider, Textarea } from "@mantine/core";
import { convertDateToLocalTime, formatToLabel, nameToInitials, valueToColor } from "@utils/general";
import { LinkedInConversationEntry } from "@common/persona/LinkedInConversationEntry";
import { useEffect } from "react";
import { useState } from "react";

type EngagementFeedItemProps = {
  channelType: string,
  clientSDRID: number,
  engagementType: string,
  prospectID: number,
  viewed: boolean,
  prospectName: string | null,
  prospectTitle: string | null,
  prospectCompany: string | null,
  prospectImgURL: string | null,
  sdrImgURL: string | null,
  engagementMetadata: any
}

export default function EngagementFeedItem(props: EngagementFeedItemProps) {
  const { channelType, clientSDRID, engagementType, prospectID, viewed, prospectName, prospectTitle, prospectCompany, prospectImgURL, sdrImgURL, engagementMetadata } = props;
  const theme = useMantineTheme();
  const [engagementText, setEngagementText] = useState<string>("");

  useEffect(() => {
    calculateCardText();
  }, [])

  function calculateCardText() {
    switch (engagementType) {
      case "ACCEPTED_INVITE":
        switch (channelType) {
          case "EMAIL":
            setEngagementText("responded to your email! 🙌🏽");
            break;
          case "LINKEDIN":
            setEngagementText("accepted your invite! 😀");
            break;
          default:
            setEngagementText("accepted your invite");
            break;
        }
        break
      case "RESPONDED":
        setEngagementText("responded to your outreach! 🙌🏽");
        break;
      case "SCHEDULING":
        setEngagementText("is scheduling! 🙏🔥")
        break;
      case "SET_TIME_TO_DEMO":
        setEngagementText("set a time to demo!! 🎉🎉🎉")
        break;
      default:
        setEngagementText("had a recent status change.");
        break;
    }
  }

  return (
    <Card shadow="sm" p="lg" radius="md" withBorder>
      
      <Group position="apart" mb='md'>
        <Group>
          <Avatar 
            color={valueToColor(theme, prospectName as string)}
            src={prospectImgURL}
          >
              {nameToInitials(prospectName as string)}
          </Avatar>
          <Title order={4}>{prospectName} {engagementText}</Title>
        </Group>
        <Group>
          <Badge key={`engagement-${prospectID}`} color={valueToColor(theme, formatToLabel(engagementType))}>
            {formatToLabel(engagementType)}
          </Badge>
          <Badge key={`channel-${prospectID}`} color={valueToColor(theme, channelType)}>
            {channelType}
          </Badge>
        </Group>
      </Group>
      <Group>
        <Text weight="bold">Title:</Text>
        <Text>{prospectTitle}</Text>
      </Group>
      <Group>
        <Text weight="bold">Company:</Text>
        <Text>{prospectCompany}</Text>
      </Group>
      {
        engagementMetadata.message ? (
          <div style={{ paddingTop: 15 }}>
            <LinkedInConversationEntry
              postedAt={convertDateToLocalTime(new Date(engagementMetadata?.last_message_timestamp))}
              body={engagementMetadata?.message?.trim()}
              name={engagementMetadata?.sender_first_name + " " + engagementMetadata?.sender_last_name}
              image={
                engagementMetadata?.last_message_from_me ? sdrImgURL as string : prospectImgURL as string
              }
              isLatest
            />
          </div>
        ) :
        null
      }
      
    </Card>
  );
}