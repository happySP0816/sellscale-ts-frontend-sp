import CalendarAndScheduling from "@common/settings/CalendarAndScheduling";
import { Container } from "@mantine/core";


export default function SchedulingSection() {

  return (
    <Container h={500} sx={{ overflow: 'auto' }}>
      <CalendarAndScheduling />
    </Container>
  );

}
