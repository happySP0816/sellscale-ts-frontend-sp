import { useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import {
  Box,
  Stack,
  Text,
  useMantineTheme,
  Indicator,
  Group,
  Avatar,
  ActionIcon,
  Button,
  Flex,
  Divider,
  ThemeIcon,
} from "@mantine/core";
import {
  convertDateToCasualTime,
  getFavIconFromURL,
  nameToInitials,
  proxyURL,
  valueToColor,
} from "@utils/general";
import {
  prospectDrawerIdState,
  prospectDrawerOpenState,
} from "@atoms/prospectAtoms";
import { companyImageCacheState } from "@atoms/cacheAtoms";
import _ from "lodash";
import {
  IconArrowRight,
  IconBrandLinkedin,
  IconGlobe,
  IconWorld,
} from "@tabler/icons";
import { ProspectPipeline } from "./PipelineSection";
import { FaLinkedin } from "@react-icons/all-files/fa/FaLinkedin";

export function PipelineProspect(props: {
  prospect: ProspectPipeline;
  bg: string;
}) {
  const theme = useMantineTheme();

  const [_opened, setOpened] = useRecoilState(prospectDrawerOpenState);
  const [_prospectId, setProspectId] = useRecoilState(prospectDrawerIdState);

  const [companyImageCache, setCompanyImageCache] = useRecoilState(
    companyImageCacheState
  );
  const getCompanyImage = async () => {
    const url = companyImageCache.get(props.prospect.company_name);
    if (url) {
      return url;
    }

    const foundUrl = await getFavIconFromURL(props.prospect.company_url);
    if (foundUrl) {
      setCompanyImageCache(
        companyImageCache.set(props.prospect.company_name, foundUrl)
      );
    }
    return foundUrl;
  };
  const [companyIcon, setCompanyIcon] = useState<string | null>(null);
  useEffect(() => {
    getCompanyImage().then((data) => {
      setCompanyIcon(data);
    });
  }, []);

  return (
    <>
      <Flex
        direction={"column"}
        w={"100%"}
        mb={"-0.75rem"}
        sx={{ borderTopRightRadius: "0.5rem", borderTopLeftRadius: "0.5rem" }}
      >
        <Flex direction={"column"} p={"1rem"}>
          <Flex gap={"0.75rem"}>
            <Box>
              <Indicator
                inline
                size={16}
                offset={8}
                position="bottom-end"
                label={
                  <Avatar
                    src={proxyURL(props.prospect.img_url)}
                    alt={props.prospect.full_name}
                    color={valueToColor(theme, props.prospect.full_name)}
                    radius="xl"
                    size={20}
                  >
                    {nameToInitials(props.prospect.full_name)}
                  </Avatar>
                }
                styles={{
                  indicator: {
                    backgroundColor: "#00000000",
                    zIndex: 1,
                  },
                }}
              >
                <Avatar
                  src={companyIcon}
                  alt={props.prospect.company_name}
                  color={valueToColor(theme, props.prospect.company_name)}
                  radius="xl"
                >
                  {nameToInitials(props.prospect.company_name)}
                </Avatar>
              </Indicator>
            </Box>
            <Flex
              gap={"0.25rem"}
              direction={"column"}
              justify={"center"}
              wrap={"wrap"}
            >
              <Flex w={"100%"} wrap={"nowrap"}>
                <Text fz={"1rem"} fw={700}>
                  {_.truncate(props.prospect.company_name, { length: 16 })}:
                </Text>
                <Text fz={"1rem"} fw={700} color="gray.6">
                  &nbsp;
                  {_.truncate(props.prospect.full_name, {
                    length: 8,
                    separator: ".",
                    omission: ".",
                  })}
                </Text>
              </Flex>
              <Text fz={"0.75rem"} fw={700} fs="italic" color="gray.6">
                {_.truncate(props.prospect.title, { length: 50 })}
              </Text>
            </Flex>
          </Flex>
          <Divider my={"1rem"} w={"100%"} color="gray.4" sx={{ flex: 1 }} />
          <Flex direction={"column"} gap={"0.25rem"}>
            <Flex justify={"space-between"}>
              <Text fz={"0.75rem"} fw={600} color="gray.6">
                Last Updated:
              </Text>
              <Text fz={"0.75rem"} fw={700} color="gray.7">
                {convertDateToCasualTime(
                  new Date(props.prospect.last_updated + " UTC")
                )}
              </Text>
            </Flex>
            <Flex justify={"space-between"}>
              <Text fz={"0.75rem"} fw={600} color="gray.6">
                Est Deal Value
              </Text>
              <Text fz={"0.75rem"} fw={700} color="green">
                ${parseInt(props.prospect.contract_size).toLocaleString()}
              </Text>
            </Flex>
          </Flex>
        </Flex>
        <Flex
          bg={`${props.bg}.1`}
          py={"0.5rem"}
          px={"1rem"}
          justify={"space-between"}
          align={"center"}
          sx={{
            borderBottomRightRadius: "0.5rem",
            borderBottomLeftRadius: "0.5rem",
          }}
        >
          <Button
            variant="light"
            color={props.bg}
            size="xs"
            radius="lg"
            py={0}
            fs={"0.5rem"}
            fw={600}
            onClick={() => {
              setProspectId(+props.prospect.id);
              setOpened(true);
            }}
            rightIcon={<IconArrowRight size="1rem" />}
          >
            Open Prospect
          </Button>

          <Flex gap={"0.5rem"}>
            <ThemeIcon
              variant="light"
              radius={999}
              onClick={() => {
                const li_url = !props.prospect.li_url.startsWith("http")
                  ? "https://" + props.prospect.li_url
                  : props.prospect.li_url;
                window.open(li_url, "_blank");
              }}
            >
              <FaLinkedin stroke={`${props.bg}.8`} />
            </ThemeIcon>
            <ThemeIcon
              variant="light"
              radius={999}
              onClick={() => {
                const company_url = !props.prospect.company_url.startsWith(
                  "http"
                )
                  ? "https://" + props.prospect.company_url
                  : props.prospect.company_url;
                window.open(company_url, "_blank");
              }}
            >
              <IconWorld color="purple" />
            </ThemeIcon>
          </Flex>
        </Flex>
      </Flex>
    </>
  );
}
