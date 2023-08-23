import { ProspectPipeline } from "@common/home/PipelineSection";
import { atom } from "recoil";

const pipelineProspectsState = atom({
  key: "pipeline-prospects",
  default: null as ProspectPipeline[] | null,
});

export {
  pipelineProspectsState,
};
