import { userTokenState } from "@atoms/userAtoms";
import { Modal } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { showNotification } from "@mantine/notifications";
import NewUIEmailSequencing from "@pages/EmailSequencing/NewUIEmailSequencing";
import { getEmailSequenceSteps } from "@utils/requests/emailSequencing";
import { getEmailSubjectLineTemplates } from "@utils/requests/emailSubjectLines";
import { useEffect, useRef, useState } from "react";
import { useRecoilValue } from "recoil";
import { EmailSequenceStep, SubjectLineTemplate } from "src";

type EmailSequenceStepBuckets = {
  PROSPECTED: {
    total: number;
    templates: EmailSequenceStep[];
  };
  ACCEPTED: {
    total: number;
    templates: EmailSequenceStep[];
  };
  BUMPED: Record<
    string,
    {
      total: number;
      templates: EmailSequenceStep[];
    }
  >;
  ACTIVE_CONVO: {
    total: number;
    templates: EmailSequenceStep[];
  };
};

export default function NewUIEmailSequencingModal(props: {
  opened: boolean;
  onClose: () => void;
  archetypeID: number;
  backFunction?: () => void;
}) {
  const userToken = useRecoilValue(userTokenState);
  const [loading, setLoading] = useState(false);

  const [
    addNewSequenceStepOpened,
    { open: openSequenceStep, close: closeSequenceStep },
  ] = useDisclosure();

  const [subjectLineTemplates, setSubjectLineTemplates] = useState<
    SubjectLineTemplate[]
  >([]);
  const sequenceBuckets = useRef<EmailSequenceStepBuckets>({
    PROSPECTED: {
      total: 0,
      templates: [],
    },
    ACCEPTED: {
      total: 0,
      templates: [],
    },
    BUMPED: {},
    ACTIVE_CONVO: {
      total: 0,
      templates: [],
    },
  } as EmailSequenceStepBuckets);
  const [sequenceBucketsState, setSequenceBucketsState] =
    useState<EmailSequenceStepBuckets>(sequenceBuckets.current);

  // Get the subject line templates
  const triggerGetEmailSubjectLineTemplates = async () => {
    const result = await getEmailSubjectLineTemplates(
      userToken,
      props.archetypeID,
      false
    );
    if (result.status != "success") {
      showNotification({
        title: "Error",
        message: result.message,
        color: "red",
      });
    }

    const templates = result.data
      .subject_line_templates as SubjectLineTemplate[];

    setSubjectLineTemplates(templates);
    return;
  };

  // Get the sequence steps
  const triggerGetEmailSequenceSteps = async () => {
    setLoading(true);

    const result = await getEmailSequenceSteps(
      userToken,
      [],
      [],
      [props.archetypeID]
    );

    if (result.status !== "success") {
      setLoading(false);
      showNotification({
        title: "Error",
        message: "Could not get sequence steps.",
        color: "red",
        autoClose: false,
      });
      return;
    }

    // Populate bump buckets
    let newsequenceBuckets = {
      PROSPECTED: {
        total: 0,
        templates: [],
      },
      ACCEPTED: {
        total: 0,
        templates: [],
      },
      BUMPED: {},
      ACTIVE_CONVO: {
        total: 0,
        templates: [],
      },
    } as EmailSequenceStepBuckets;
    for (const bumpFramework of result.data
      .sequence_steps as EmailSequenceStep[]) {
      const status = bumpFramework.step.overall_status;
      if (status === "PROSPECTED") {
        newsequenceBuckets.PROSPECTED.total += 1;
        if (bumpFramework.step.default) {
          newsequenceBuckets.PROSPECTED.templates.unshift(bumpFramework);
        } else {
          newsequenceBuckets.PROSPECTED.templates.push(bumpFramework);
        }
      } else if (status === "ACCEPTED") {
        newsequenceBuckets.ACCEPTED.total += 1;
        if (bumpFramework.step.default) {
          newsequenceBuckets.ACCEPTED.templates.unshift(bumpFramework);
        } else {
          newsequenceBuckets.ACCEPTED.templates.push(bumpFramework);
        }
      } else if (status === "BUMPED") {
        const bumpCount = bumpFramework.step.bumped_count as number;
        if (!(bumpCount in newsequenceBuckets.BUMPED)) {
          newsequenceBuckets.BUMPED[bumpCount] = {
            total: 0,
            templates: [],
          };
        }
        newsequenceBuckets.BUMPED[bumpCount].total += 1;
        if (bumpFramework.step.default) {
          newsequenceBuckets.BUMPED[bumpCount].templates.unshift(bumpFramework);
        } else {
          newsequenceBuckets.BUMPED[bumpCount].templates.push(bumpFramework);
        }
      } else if (status === "ACTIVE_CONVO") {
        newsequenceBuckets.ACTIVE_CONVO.total += 1;
        if (bumpFramework.step.default) {
          newsequenceBuckets.ACTIVE_CONVO.templates.unshift(bumpFramework);
        } else {
          newsequenceBuckets.ACTIVE_CONVO.templates.push(bumpFramework);
        }
      }
    }
    sequenceBuckets.current = newsequenceBuckets;
    setSequenceBucketsState(newsequenceBuckets);

    setLoading(false);
  };

  useEffect(() => {
    triggerGetEmailSubjectLineTemplates();
    triggerGetEmailSequenceSteps();
  }, []);

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
      <NewUIEmailSequencing
        userToken={userToken}
        archetypeID={props.archetypeID}
        templateBuckets={sequenceBucketsState}
        subjectLines={subjectLineTemplates}
        refetch={async () => {
          await triggerGetEmailSequenceSteps();
          await triggerGetEmailSubjectLineTemplates();
          await props.backFunction?.();
        }}
        loading={loading}
        addNewSequenceStepOpened={addNewSequenceStepOpened}
        closeSequenceStep={closeSequenceStep}
        openSequenceStep={openSequenceStep}
      />
    </Modal>
  );
}
