import {
  Drawer,
  Title,
  Text,
  Center,
  Button,
  Switch,
  Container,
  Badge,
  Stack,
  Group,
} from "@mantine/core";
import { DataTable, DataTableSortStatus } from "mantine-datatable";
import { useRef, useState } from "react";
import { useRecoilState } from "recoil";
import { prospectDrawerOpenState } from "../atoms/personaAtoms";
import { faker } from "@faker-js/faker";
import { useQuery } from "react-query";
import { percentageToColor, temp_delay } from "../../utils/general";
import { chunk } from "lodash";
import { IconPencil, IconTrashX } from "@tabler/icons";
import { showNotification } from "@mantine/notifications";
import { closeAllModals, openModal } from "@mantine/modals";

const PAGE_SIZE = 20;

export default function ProspectDetailsDrawer(props: {}) {
  const [opened, setOpened] = useRecoilState(prospectDrawerOpenState);

  return (
    <Drawer
      opened={opened}
      onClose={() => setOpened(false)}
      padding="xl"
      size="xl"
      position="right"
    >
      <Text size="md">Vice President of Operations @ Coursera</Text>
    </Drawer>
  );
}
