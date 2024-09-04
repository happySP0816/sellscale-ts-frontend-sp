import { userTokenState } from "@atoms/userAtoms";
import { API_URL } from "@constants/data";
import { Card, Group, Text, Button, Flex } from "@mantine/core";
import { useQueryClient } from "@tanstack/react-query";
import displayNotification from "@utils/notificationFlow";
import { useRecoilValue } from "recoil";
import { MsgResponse } from "src";

type ProspectDetailsRemoveProps = {
  prospectId: number;
  prospectStatus: string;
};

export async function removeProspectFromContactList(
  prospectId: number,
  userToken: string
): Promise<MsgResponse> {
  return await fetch(
    `${API_URL}/prospect/remove_from_contact_list?prospect_id=` + prospectId,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
    }
  )
    .then(async (r) => {
      if (r.status === 200) {
        return {
          status: "success",
          title: `Success`,
          message: `Removed prospect from contact list.`,
        } satisfies MsgResponse;
      } else {
        return {
          status: "error",
          title: `Error (${r.status})`,
          message: "Error while removing prospect from contact list.",
        } satisfies MsgResponse;
      }
    })
    .catch((e) => {
      console.error(e);
      return {
        status: "error",
        title: `Error while removing prospect from contact list.`,
        message: e.message as string,
      } satisfies MsgResponse;
    });
}

export async function sendQueuedLinkedinInvite(
  prospectId: number,
  userToken: string
): Promise<MsgResponse> {
  return await fetch(
    `${API_URL}/prospect/send_queued_linkedin_invite`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prospect_id: prospectId })
    }
  )
    .then(async (r) => {
      if (r.status === 200) {
        return {
          status: "success",
          title: `Success`,
          message: `Queued LinkedIn invite sent successfully.`,
        } satisfies MsgResponse;
      } else {
        return {
          status: "error",
          title: `Error (${r.status})`,
          message: "Error while sending queued LinkedIn invite.",
        } satisfies MsgResponse;
      }
    })
    .catch((e) => {
      console.error(e);
      return {
        status: "error",
        title: `Error while sending queued LinkedIn invite.`,
        message: e.message as string,
      } satisfies MsgResponse;
    });
}

export default function ProspectDetailsRemove(
  props: ProspectDetailsRemoveProps
) {
  const userToken = useRecoilValue(userTokenState);
  const queryClient = useQueryClient();

  if (props.prospectStatus === "REMOVED") {
    return null;
  }

  return (
    <Card shadow="sm" p="lg" radius="md" mt="md" withBorder>
      <Group position="apart">
        <Text weight={700} size="lg">
          Remove Prospect from Contact List
        </Text>
      </Group>
      <Text mb="xs" fz="sm" c="dimmed">
        Press button below if this is a prospect you are already engaging with
        outside of SellScale (i.e. an existing account), that you would like the
        AI to <b>not</b> contact.
      </Text>

      <Flex gap="xs">
        <Button
          color="red"
          variant="outline"
          onClick={async () => {
            await displayNotification(
              "remove-prospect-from-contact-list",
              async () => {
                let result = await removeProspectFromContactList(
                  props.prospectId,
                  userToken
                );

                queryClient.invalidateQueries({
                  queryKey: [`query-prospect-details-${props.prospectId}`],
                });

                return result;
              },
              {
                title: `Removing prospect ...`,
                message: `Working with servers...`,
                color: "teal",
              },
              {
                title: `Removed!`,
                message: `Your prospect has been removed from your contact list.`,
                color: "teal",
              },
              {
                title: `Error while removing prospect from contact list.`,
                message: `Please try again later.`,
                color: "red",
              }
            );
          }}
        >
          Remove Prospect
        </Button>
      </Flex>
    </Card>
  );
}
