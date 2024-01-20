import { userTokenState } from "@atoms/userAtoms";
import { API_URL } from "@constants/data";
import {
  ActionIcon,
  Avatar,
  Badge,
  Button,
  Card,
  Divider,
  Flex,
  Loader,
  Popover,
  Select,
  Stack,
  Text,
  TypographyStylesProvider,
  useMantineTheme,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { showNotification } from '@mantine/notifications';
import {
  IconArrowRight,
  IconBrandLinkedin,
  IconBriefcase,
  IconBuildingCommunity,
  IconBuildingEstate,
  IconEye,
  IconInfoCircle,
  IconLink,
  IconMail,
  IconMapPin,
  IconUser,
  IconUserCheck,
  IconUsers,
  IconX,
} from "@tabler/icons";
import { IconBuildingArch, IconUserSquare } from "@tabler/icons-react";
import { formatToLabel, valueToColor } from "@utils/general";
import { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";

type CompanyTooltipPropsType = {
  prospectId?: number;
};

const popoverStyles = {
  arrow: {
    backgroundColor: "#228be6",
  },
};

export default function CompanyTooltip(props: CompanyTooltipPropsType) {
  const theme = useMantineTheme();
  const id = props.prospectId;
  const userToken = useRecoilValue(userTokenState);

  const [isLoading, setIsLoading] = useState(false);
  const [companyData, setCompanyData] = useState({} as any);

  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const togglePopover = () => {
    if (!isPopoverOpen) {
      console.log(`Popover opened for prospect ID: ${id}`);
      fetchProspectDetails();
    }
    setIsPopoverOpen(true);
  };

  const fetchProspectDetails = async () => {
    setIsLoading(true);
    const response = await fetch(
      `${API_URL}/prospect/companydetail?prospect_id=${id}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      }
    );

    const data = await response.json();
    setCompanyData(data);
    setIsLoading(false);
  };

  return (
    <Popover
      width={380}
      position="bottom"
      withArrow
      arrowOffset={5}
      arrowSize={12}
      styles={popoverStyles}
      withinPortal
      opened={isPopoverOpen}
      onOpen={() => setIsPopoverOpen(true)}
      onClose={() => setIsPopoverOpen(false)}
    >
      <Popover.Target>
        <ActionIcon onClick={togglePopover}>
          <IconEye size={"0.8rem"} color="#228be6" />
        </ActionIcon>
      </Popover.Target>
      <Popover.Dropdown style={{ padding: "0px" }}>
        {!isLoading && (
          <>
            <Flex direction={"column"} p={"md"} px={"xl"} gap={"5px"}>
              <Flex justify={"space-between"}>
                <Flex gap={"sm"}>
                  <Avatar
                    size={"lg"}
                    radius={"xl"}
                    src={companyData?.data?.logo_url}
                  />
                  <Flex direction={"column"}>
                    <Text fw={600} size={"sm"}>
                      {companyData?.company}
                    </Text>
                    <Text color="gray" size={"sm"}>
                      {companyData?.Tagline?.slice(0, 25)} {companyData?.Tagline?.length > 25 ? '...' : ''}
                    </Text>
                  </Flex>
                </Flex>
                <IconX
                  size={"2.3rem"}
                  color="gray"
                  style={{ cursor: "pointer" }}
                  onClick={() => setIsPopoverOpen(false)}
                />
              </Flex>
              <Flex gap={"5px"}>
                <IconMapPin size={"1.1rem"} color="gray" />
                <Text color="gray" fz="sm">
                  {companyData?.location}
                </Text>
              </Flex>
              <Flex gap={"5px"}>
                <IconUsers size={"1.1rem"} color="gray" />
                <Text color="gray" fz="sm">
                  {companyData?.num_employees} employees
                </Text>
              </Flex>
              <Flex gap={"5px"}>
                <IconInfoCircle size={"1.1rem"} color="gray" />
                <Text color="gray" fz="sm">
                  {"Industry:"} <span>{companyData?.industry}</span>
                </Text>
              </Flex>
              <Flex mt={"sm"} gap={"5px"}>
                <IconLink size={"1.1rem"} color="gray" />
                <Text
                  color="gray"
                  fz="sm"
                  onClick={() =>
                    window.open(companyData?.company_url, "_blank")
                  }
                >
                  {companyData?.company_url?.slice(8)}
                </Text>
              </Flex>
              <Flex gap={"5px"}>
                <IconBrandLinkedin fill="gray" color="white" size={"1.3rem"} />
                <Text
                  color="gray"
                  fz="sm"
                  onClick={() =>
                    window.open(companyData?.company_linkedin, "_blank")
                  }
                >
                  {companyData?.company_linkedin?.slice(8)}
                </Text>
              </Flex>
              <Divider
                label={
                  <Flex align={"center"} gap={4}>
                    <Text
                      color="gray"
                      fw={600}
                      size={"md"}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      ENGAGEMENT
                    </Text>
                  </Flex>
                }
                labelPosition="left"
                w={"100%"}
                my={"sm"}
              />
              <Flex gap={"5px"}>
                <IconUserCheck color="gray" size={"1.3rem"} />
                <Text
                  color="gray"
                  fz="sm"
                  onClick={() =>
                    window.open(
                      "https://" + companyData?.data?.linkedin_url,
                      "_blank"
                    )
                  }
                >
                  {"Employees Engaged: "}{" "}
                  <span className="text-blue">{companyData?.num_engaged}</span>{" "}
                  / {companyData?.num_employees}
                </Text>
              </Flex>
            </Flex>

            <Button
              w={"100%"}
              rightIcon={<IconArrowRight size={"1rem"} />}
              style={{
                borderTopLeftRadius: "0px",
                borderTopRightRadius: "0px",
              }}
              color='gray'
              onClick={() => {
                showNotification({
                  title: "Coming Soon!",
                  message: "This feature is coming soon!",
                  color: "blue",
                  icon: <IconInfoCircle size={24} />,
                });
              }}
            >
              View Company Page
            </Button>
          </>
        )}
        {isLoading && (
          <Card
            sx={{
              width: "100%",
              height: "300px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Loader />
          </Card>
        )}
      </Popover.Dropdown>
    </Popover>
  );
}
