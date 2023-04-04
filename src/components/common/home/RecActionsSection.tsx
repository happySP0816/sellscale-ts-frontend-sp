import ComingSoonCard from "@common/library/ComingSoonCard";
import { Stack, Title, Group } from "@mantine/core";

export default function RecActionsSection() {

  return (
    <Stack>
      <div>
        <Title order={3}>To-Do's</Title>
        <Group>
          <ComingSoonCard h={300} />
        </Group>
      </div>
      <div>
        <Title order={3}>Quick Actions</Title>
        <Group>
          <ComingSoonCard h={300} />
        </Group>
      </div>
    </Stack>
  )

}
