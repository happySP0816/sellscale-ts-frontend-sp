import { userTokenState } from "@atoms/userAtoms";
import { logout } from "@auth/core";
import { API_URL } from "@constants/data";
import { Avatar, Flex, Text, Indicator, Group, Button, Collapse, Skeleton, Loader, LoadingOverlay } from "@mantine/core";
import { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import { Prospect } from "src";
import ProspectDetailsViewConversation from "@common/prospectDetails/ProspectDetailsViewConversation";
import { showNotification } from "@mantine/notifications";
import { proxyURL } from "@utils/general";


export default function SchedulingCardContents(props: { prospect: Prospect }) {

  const userToken = useRecoilValue(userTokenState);
  const [opened, setOpened] = useState(false);
  const [prospectDetails, setProspectDetails] = useState<any | null>(null);

  useEffect(() => {
    if (opened) {
      (async () => {
        const details = await fetchProspectDetails();
        setProspectDetails(details);
      })();
    }
  }, [opened]);

  const fetchProspectDetails = async () => {
    const response = await fetch(`${API_URL}/prospect/${props.prospect.id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    });
    if (response.status === 401) {
      logout();
    }
    return await response.json();
  }

  return (
    <>
    <Flex justify='space-between'>
      <div>
        <Indicator inline size={12} offset={5} position="top-end" color="violet" withBorder>
          <Avatar
            size="md"
            radius="xl"
            src={proxyURL(props.prospect.img_url)}
          />
        </Indicator>
      </div>
      <div style={{ flexGrow: 1, marginLeft: 10 }}>
        <Text fw={700} fz='sm'>{props.prospect.full_name}</Text>
        <Text fz='sm'>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus faucibus elementum interdum.</Text>
        <Group position="right" mt={5}>
          <Button color="green" radius="xl" size="xs" compact variant={opened ? 'filled' : 'light'} onClick={() => setOpened((prev) => !prev)}>
            Respond
          </Button>
          <Button color="green" radius="xl" size="xs" compact variant="subtle" component="a" href={`/home/${props.prospect.id}`}>
            See details
          </Button>
          <Button color="green" radius="xl" size="xs" compact variant="subtle" onClick={() => {
            showNotification({
              title: 'Coming soon!',
              color: 'orange',
              message: 'This feature is coming soon, please contact an admin for now.',
            })
          }}>
            Flag
          </Button>
        </Group>
      </div>
    </Flex>
    <Collapse in={opened}>
      {prospectDetails ? (
        <ProspectDetailsViewConversation
          conversation_entry_list={
            prospectDetails.prospect_info.li
              .li_conversation_thread
          }
          ai_enabled={
            prospectDetails.prospect_info.details.ai_enabled
          }
          conversation_url={
            prospectDetails.prospect_info.li.li_conversation_url
          }
          prospect_id={
            prospectDetails.prospect_info.details.id
          }
          persona_id={
            prospectDetails.prospect_info.details.persona_id
          }
          overall_status={
            prospectDetails.prospect_info.details.overall_status
          }
        />
      ) : (
        <div style={{ height: 100, position: 'relative' }}>
          <LoadingOverlay visible={true} />
        </div>
      )}
    </Collapse>
    </>
  );

}
