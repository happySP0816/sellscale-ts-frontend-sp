import { useDisclosure } from "@mantine/hooks";
import {
  Card,
  Paper,
  Text,
  Title,
  Button,
  Group,
  MultiSelect,
  Box,
  Divider,
  Tabs,
  Modal,
  TextInput,
} from "@mantine/core";
import { openContextModal } from "@mantine/modals";
import { useEffect, useState } from "react";

import { useRecoilState } from "recoil";
import { userTokenState } from "@atoms/userAtoms";
import { API_URL } from "@constants/data";
import {
  IconBrandSuperhuman,
  IconBriefcase,
  IconFingerprint,
  IconPackages,
  IconPoint,
  IconSettings,
} from "@tabler/icons";
import ComingSoonCard from "@common/library/ComingSoonCard";
import SellScaleBrainPersonasTab from "./SellScaleBrain/SellScaleBrainPersonasTab";
import SellScaleBrainUserTab from "./SellScaleBrain/SellScaleBrainUserTab";
import SellScaleBrainCompanyTab from "./SellScaleBrain/SellScaleBrainCompanyTab";
import SellScaleBrainProductsTab from "./SellScaleBrain/SellScaleBrainProductsTab";

import { useSearchParams } from "react-router-dom";

export default function SellScaleBrain() {
  const [siteUrl, setSiteUrl] = useState<String>();
  const [userToken] = useRecoilState(userTokenState);
  const [opened, { open, close }] = useDisclosure(false);
  const [isValidUrl, setIsValidUrl] = useState(true);

  const [searchParams] = useSearchParams();
  const tabValue = searchParams.get("tab") || "company_info";

  const [url, setUrl] = useState("");

  const handleChange = (value: string) => {
    setUrl(value);
    setIsValidUrl(true);
  };
  const handlePullInformation = () => {
    const urlPattern = new RegExp(/^(ftp|http|https):\/\/[^ "]+$/);

    if (!urlPattern.test(url.trim())) {
      setIsValidUrl(false);
      return;
    }

    setIsValidUrl(true);
    setSiteUrl(url);
    close();
  };
  return (
    <Paper withBorder m="xs" p="md" radius="md">
      <Box>
        <Title order={3}>SellScale Brain</Title>
        <Text size="sm" mt="md">
          The SellScale Brain is a network of information that is used to
          customize your experience on SellScale. The more correct information
          you provide, the more accurate your experience will be.
        </Text>

        <Tabs variant="outline" defaultValue={tabValue} mt="lg">
          <Tabs.List className="flex justify-between">
            <div className="flex">
              <Tabs.Tab
                value="company_info"
                icon={<IconBriefcase size="0.8rem" />}
              >
                Company Info
              </Tabs.Tab>
              <Tabs.Tab
                value="user_info"
                icon={<IconFingerprint size="0.8rem" />}
              >
                User Info
              </Tabs.Tab>
              <Tabs.Tab
                value="persona_info"
                icon={<IconBrandSuperhuman size="0.8rem" />}
              >
                Persona Info
              </Tabs.Tab>
              <Tabs.Tab
                value="product_info"
                icon={<IconPackages size="0.8rem" />}
              >
                Products
              </Tabs.Tab>
            </div>
            <Group className=" justify-end">
              <IconSettings
                size={20}
                onClick={open}
                className=" cursor-pointer"
              />
            </Group>
          </Tabs.List>

          <Tabs.Panel value="company_info" pt="xs">
            <SellScaleBrainCompanyTab siteUrl={siteUrl} />
          </Tabs.Panel>

          <Tabs.Panel value="user_info" pt="xs">
            <SellScaleBrainUserTab />
          </Tabs.Panel>

          <Tabs.Panel value="persona_info" pt="xs">
            <SellScaleBrainPersonasTab />
          </Tabs.Panel>

          <Tabs.Panel value="product_info" pt="xs">
            <SellScaleBrainProductsTab />
          </Tabs.Panel>
        </Tabs>
      </Box>
      <Modal
        opened={opened}
        onClose={close}
        title="Paste your website URL here:"
        centered
      >
        <Box>
          <p>
            We will automatically pull information from your website to fill in
            your company 'brain'
          </p>
          <TextInput
            size="lg"
            label="website url"
            onChange={(event) => handleChange(event.target.value)}
            value={url}
            required
          />
          {!isValidUrl && (
            <p className=" text-red-500 text-[15px] leading-none">
              Please enter a valid URL.
            </p>
          )}
          <Group className="flex justify-center">
            <Button size="lg" mt={30} onClick={handlePullInformation}>
              Pull Information
            </Button>
          </Group>
        </Box>
      </Modal>
    </Paper>
  );
}
