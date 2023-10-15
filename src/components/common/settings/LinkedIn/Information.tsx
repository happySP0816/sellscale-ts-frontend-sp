import {
  Box,
  Button,
  Divider,
  Container,
  Flex,
  Text,
  Title,
  ThemeIcon,
  ActionIcon,
} from "@mantine/core";
import { IconCheck, IconExternalLink, IconShare2 } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { WarmUp } from "./WarmUp";
import { PersonalizationCard } from "./PersonalizationCard";
import { useRecoilState, useRecoilValue } from "recoil";
import { userDataState, userTokenState } from "@atoms/userAtoms";
import getSDRLinkedinHealth from "@utils/requests/getSDRLinkedinHealth";
import { showNotification } from "@mantine/notifications";
import { IconX } from "@tabler/icons";

interface CheckBox {
  title: string;
  checked: boolean;
  disabled: boolean;
}

const Process: React.FC = () => {
  const userToken = useRecoilValue(userTokenState);
  const [userData, setUserData] = useRecoilState(userDataState);

  const [linkedInHealthCritera, setLinkedInHealthCritera] = useState<any>([]);

  const triggerGetLinkedinHealth = async () => {
    const result = await getSDRLinkedinHealth(userToken);
    if (result.status !== "success") {
      showNotification({
        title: "Error",
        message: result.message,
        color: "red",
      });
    }

    const data = result.data;
    setUserData({ ...userData, li_health: data.health });

    setLinkedInHealthCritera(data.details);
    console.log("result", result);
  };

  useEffect(() => {
    triggerGetLinkedinHealth();
  }, []);

  return (
    <>
      {linkedInHealthCritera && (
        <Flex direction={"column"} maw="100%">
          <Flex align={"center"} mb={"0.5rem"} gap={"0.5rem"}>
            <Title order={3}>LinkedIn Profile Success Criteria</Title>
            {/* <Button variant="light" size="xs" color="red" radius="xl">
          4 Issues Detected
        </Button> */}
          </Flex>
          <Text c={"gray.6"} mb={"1rem"} fw={500}>
            Completing these steps will improve your LinkedIn Profile health and
            increase your chances of success through SellScale.
          </Text>
          {/* <Flex align={"center"} mb={"1rem"} gap={"0.25rem"}>
            {linkedInHealthCritera.map((criteria: any) => {
              const status = criteria.status;
              return (
                <Box
                  h={"0.25rem"}
                  w={"100%"}
                  bg={status ? "green" : "red"}
                  sx={{ borderRadius: "0.25rem" }}
                />
              );
            })}
          </Flex> */}
          {/* <Text c={"gray.6"} fz={"0.75rem"} mb={"0.5rem"}>
        4 remaining to complete
      </Text> */}
          <Flex gap={"0.5rem"} mb={"1.5rem"} direction="column" pb={"0.5rem"}>
            {linkedInHealthCritera.map((critera: any) => {
              const status = critera.status;
              const message = critera.message;
              const criteria_name = critera.criteria;
              return (
                <Flex align={"center"}>
                  {status ? (
                    <ThemeIcon color="green" size="1.25rem" radius="xl">
                      <IconCheck size="1rem" />
                    </ThemeIcon>
                  ) : (
                    <ThemeIcon color="gray" size="1.25rem" radius="xl">
                      <IconX size="1rem" />
                    </ThemeIcon>
                  )}

                  <Text ml={"0.25rem"} fw={400} size={"lg"}>
                    {criteria_name}
                  </Text>
                  <ActionIcon color="blue">
                    <IconExternalLink size="1.25rem" />
                  </ActionIcon>
                </Flex>
              );
            })}
          </Flex>
        </Flex>
      )}
    </>
  );
};

const Information = () => {
  const userData = useRecoilValue(userDataState);

  const [isEnabledProspectBase, setEnabledProspectBase] = useState(false);
  const [isEnabledCompanyBase, setEnabledCompanyBase] = useState(false);
  const [prospectItems, setProspectItems] = useState([
    {
      title: "Personal Bio",
      checked: true,
      disabled: false,
    },
    {
      title: "List Of Past Jobs",
      checked: true,
      disabled: false,
    },
    {
      title: "Years Of Experience",
      checked: true,
      disabled: false,
    },
    {
      title: "Current Position Description",
      checked: true,
      disabled: false,
    },
    {
      title: "Current Experience",
      checked: true,
      disabled: false,
    },
    {
      title: "Education History",
      checked: true,
      disabled: false,
    },
    {
      title: "Recommendations",
      checked: true,
      disabled: false,
    },
    {
      title: "Patents",
      checked: true,
      disabled: false,
    },
  ]);

  const [companyItems, setCompanyItems] = useState([
    {
      title: "Company Description",
      checked: true,
      disabled: false,
    },
    {
      title: "Company Specialites",
      checked: true,
      disabled: false,
    },
    {
      title: "Company News",
      checked: true,
      disabled: false,
    },
    // {
    //   title: "Current Job Description",
    //   checked: true,
    //   disabled: true,
    // },
    // {
    //   title: "Current Experience",
    //   checked: true,
    //   disabled: false,
    // },
    // {
    //   title: "Current Job Specialities",
    //   checked: true,
    //   disabled: true,
    // },
  ]);

  function setProfileChecked(item: CheckBox, checked: boolean) {
    const items = [...prospectItems];
    items.map((i) => {
      if (i.title === item.title) {
        i.checked = checked;
      }
      return i;
    });
    setProspectItems([...items]);
  }

  function setAccountChecked(item: CheckBox, checked: boolean) {
    const items = [...companyItems];
    items.map((i) => {
      if (i.title === item.title) {
        i.checked = checked;
      }
      return i;
    });
    setCompanyItems(items);
  }

  useEffect(() => {
    setProspectItems((cur) =>
      [...cur].map((e) => ({ ...e, disabled: !isEnabledProspectBase }))
    );
  }, [isEnabledProspectBase]);

  useEffect(() => {
    setCompanyItems((cur) =>
      [...cur].map((e) => ({ ...e, disabled: !isEnabledCompanyBase }))
    );
  }, [isEnabledCompanyBase]);

  return (
    <Flex direction="column" p="md" maw="100%">
      <Flex maw="100%">
        <Process />
      </Flex>

      <Divider my="sm" />

      <Flex maw="100%">
        <WarmUp />
      </Flex>

      <Divider my="sm" />

      <Flex direction={"column"}>
        <Flex align={"center"} mb={"0.5rem"} gap={"0.5rem"}>
          <Text fw={"500"} fz={"1rem"}>
            Personalization Settings - Coming Soon
          </Text>
          {/* <Button
            variant="light"
            size="xs"
            fw={"700"}
            color="green"
            radius="xl"
          >
            5 ACTIVE
          </Button> */}
        </Flex>
        <Text c={"gray.6"} fz={"0.75rem"} mb={"1rem"}>
          Globally set personalization settings. Tell us which personalizations
          you want, and which ones you dont.
        </Text>

        <PersonalizationCard
          title="Prospect Based Personalization:"
          checked={isEnabledProspectBase}
          items={prospectItems}
          onToggle={setEnabledProspectBase}
          onPressItem={setProfileChecked}
        />

        <PersonalizationCard
          title="Company Based Personalization:"
          checked={isEnabledCompanyBase}
          items={companyItems}
          onToggle={setEnabledCompanyBase}
          onPressItem={setAccountChecked}
        />
      </Flex>
    </Flex>
  );
};

export default Information;
