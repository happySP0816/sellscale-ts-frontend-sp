import {
  Paper,
  TextInput,
  rem,
  createStyles,
  Text,
  Badge,
} from "@mantine/core";
import { ContextModalProps } from "@mantine/modals";
import { useState } from "react";
import { useRecoilValue } from "recoil";
import { userTokenState } from "@atoms/userAtoms";
import { useForm } from "@mantine/form";
import { DateInput } from "@mantine/dates";
import { ratingToLabel } from "@common/charts/DemoFeedbackChart";

const useStyles = createStyles((theme) => ({
  root: {
    position: "relative",
  },

  input: {
    height: rem(54),
    paddingTop: rem(18),
  },

  label: {
    position: "absolute",
    pointerEvents: "none",
    fontSize: theme.fontSizes.xs,
    paddingLeft: theme.spacing.sm,
    paddingTop: `calc(${theme.spacing.sm} / 2)`,
    zIndex: 1,
  },
}));

export default function DemoFeedbackDetailsModal({
  context,
  id,
  innerProps,
}: ContextModalProps<{
  company: string;
  demoDate: string;
  demoRating: string;
  fullName: string;
  prospectId: string;
  demoFeedback: string;
  refetch: () => void;
}>) {
  const [loading, setLoading] = useState(false);
  const userToken = useRecoilValue(userTokenState);
  const { classes } = useStyles();

  const form = useForm({
    initialValues: {
      name: innerProps.editProduct?.name ?? "",
      description: innerProps.editProduct?.description ?? "",
      how_it_works: innerProps.editProduct?.how_it_works ?? "",
      use_cases: innerProps.editProduct?.use_cases ?? "",
      product_url: innerProps.editProduct?.product_url ?? "",
    },
  });

  // inner props
  // company: propsData.company,
  // demoDate: propsData.demo_date,
  // demoRating: propsData.demo_rating,
  // fullName: propsData.full_name,
  // prospectId: propsData.prospect_id,
  // demoFeedback: propsData.demo_feedback,

  return (
    <Paper
      p={0}
      style={{
        position: "relative",
      }}
    >
      <Text mb="xs">
        <b>Company:</b> {innerProps.company}
      </Text>
      <Text mb="xs">
        <b>Demo Date:</b> {innerProps.demoDate}
      </Text>
      <Text mb="xs">
        <b>Demo Rating:</b>
        <br />
        <Badge>{ratingToLabel(innerProps.demoRating)}</Badge>
        <br />
        {new Array(parseInt(innerProps.demoRating.split("/")[0])).join("★") +
          "★"}
      </Text>
      <Text mb="xs">
        <b>Demo Feedback:</b>
        <br /> {innerProps.demoFeedback}
      </Text>
    </Paper>
  );
}
