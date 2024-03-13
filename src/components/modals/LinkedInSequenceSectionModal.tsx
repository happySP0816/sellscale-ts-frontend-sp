import LinkedInSequenceSection from "@common/sequence/LinkedInSequenceSection";
import { Modal } from "@mantine/core";

export default function LinkedInSequenceSectionModal(props: {
  opened: boolean;
  onClose: () => void;
  archetypeID: number;
  backFunction?: () => void;
}) {
  return (
    <Modal
      opened={props.opened}
      onClose={props.onClose}
      overlayProps={{
        opacity: 0.55,
        blur: 3,
      }}
      centered
      size="70rem"
      withCloseButton={true}
      padding="md"
      radius={"md"}
    >
      <LinkedInSequenceSection backFunction={props.backFunction} />
    </Modal>
  );
}
