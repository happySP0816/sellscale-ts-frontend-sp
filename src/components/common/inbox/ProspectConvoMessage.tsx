import { userDataState, userTokenState } from "@atoms/userAtoms";
import TextWithNewlines from "@common/library/TextWithNewlines";
import {
  Flex,
  Group,
  Title,
  Text,
  useMantineTheme,
  Container,
  Avatar,
  Stack,
  Box,
  Card,
} from "@mantine/core";
import { proxyURL } from "@utils/general";
import { useEffect, useLayoutEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import { AiMetaDataBadge } from "@common/persona/LinkedInConversationEntry";
import { getSingleBumpFramework } from "@utils/requests/getBumpFrameworks";
import DOMPurify from "dompurify";

type Props = {
  id: number;
  img_url: string;
  name: string;
  message: string;
  timestamp: string;
  is_me: boolean;
  aiGenerated: boolean;
  bumpFrameworkId?: number;
  bumpFrameworkTitle?: string;
  bumpFrameworkDescription?: string;
  bumpFrameworkLength?: string;
  accountResearchPoints?: string[];
  initialMessageId?: number;
  initialMessageCTAId?: number;
  initialMessageCTAText?: string;
  initialMessageResearchPoints?: string[];
  initialMessageStackRankedConfigID?: number;
  initialMessageStackRankedConfigName?: string;
  cta?: string;
  isLastMsgInSequent?: boolean;
};

export function ProspectConvoMessage(props: Props) {
  const userToken = useRecoilValue(userTokenState);
  const theme = useMantineTheme();

  const uniqueId = `prospect-convo-message-${props.id}`;
  const [finalMessage, setFinalMessage] = useState<string>(props.message);

  const [bumpNumberConverted, setBumpNumberConverted] = useState<
    number | undefined
  >(undefined);
  const [bumpNumberUsed, setBumpNumberUsed] = useState<number | undefined>(
    undefined
  );

  const triggerGetSingleBumpFramework = async (id: number) => {
    const result = await getSingleBumpFramework(userToken, id);
    if (result) {
      setBumpNumberConverted(
        result.data.bump_framework.etl_num_times_converted
      );
      setBumpNumberUsed(result.data.bump_framework.etl_num_times_used);
    }
  };

  useEffect(() => {
    if (props.bumpFrameworkId) {
      triggerGetSingleBumpFramework(props.bumpFrameworkId);
    }
  }, []);

  // const replyMatch = props.message.match(/>On .+[AM|PM] .+ wrote:<br>/gm);
  // let realMessage = props.message;
  // let replyMessage = "";
  // if(replyMatch && replyMatch.length > 0){
  //   const parts = props.message.split(replyMatch[0]);
  //   realMessage = parts[0];
  //   replyMessage = parts[1];
  // }
  //console.log(realMessage, replyMessage);
  useLayoutEffect(() => {
    setTimeout(() => {
      const elements = document.querySelectorAll(`.gmail_quote`);
      if (elements.length > 0) {
        const parent = elements[0].parentNode;
        if (parent) {
          // TODO: Add collapse button
          const newElement = document.createElement("div");
          parent.insertBefore(newElement.cloneNode(true), elements[0]);
          parent.removeChild(elements[0]);
        }
      }

      const element = document.getElementById(uniqueId);
      if (element) {
        setFinalMessage(element.innerHTML);
      }
    });
  }, []);

  return (
    <>
      {/* Hidden section for dom html parsing */}
      <div
        id={uniqueId}
        style={{ display: "none" }}
        dangerouslySetInnerHTML={{
          __html: DOMPurify.sanitize(props.message),
        }}
      />
      <Flex
        py={5}
        sx={{ flex: 1 }}
        maw={"80%"}
        mx={"auto"}
        gap={"sm"}
        justify={props.is_me ? "flex-end" : "flex-start"}
      >
        {!props.is_me && (
          <Avatar
            size="lg"
            radius="xl"
            src={proxyURL(props.img_url)}
            mt={"0"}
          />
        )}

        <Stack spacing={5} w={"70%"}>
          <Group position="apart">
            <Group spacing={10}>
              {props.aiGenerated && (
                <AiMetaDataBadge
                  location={{ position: "relative" }}
                  bumpFrameworkId={props.bumpFrameworkId || 0}
                  bumpFrameworkTitle={props.bumpFrameworkTitle || ""}
                  bumpFrameworkDescription={
                    props.bumpFrameworkDescription || ""
                  }
                  bumpFrameworkLength={props.bumpFrameworkLength || ""}
                  bumpNumberConverted={bumpNumberConverted}
                  bumpNumberUsed={bumpNumberUsed}
                  accountResearchPoints={props.accountResearchPoints || []}
                  initialMessageId={props.initialMessageId || 0}
                  initialMessageCTAId={props.initialMessageCTAId || 0}
                  initialMessageCTAText={props.initialMessageCTAText || ""}
                  initialMessageResearchPoints={
                    props.initialMessageResearchPoints || []
                  }
                  initialMessageStackRankedConfigID={
                    props.initialMessageStackRankedConfigID || 0
                  }
                  initialMessageStackRankedConfigName={
                    props.initialMessageStackRankedConfigName || ""
                  }
                  cta={props.cta || ""}
                />
              )}
            </Group>
          </Group>
          <Card
            p={"sm"}
            radius={"md"}
            bg={props.is_me ? "blue" : "#fff"}
            c={props.is_me ? "#fff" : "#000"}
          >
            <TextWithNewlines
              style={{ fontSize: "0.875rem" }}
              breakheight="12px"
            >
              {finalMessage}
            </TextWithNewlines>
          </Card>
          {props.isLastMsgInSequent && (
            <Text
              weight={400}
              size={11}
              c="dimmed"
              ml={props.is_me ? "auto" : 0}
            >
              {props.timestamp}
            </Text>
          )}
        </Stack>
      </Flex>
    </>
  );
}
