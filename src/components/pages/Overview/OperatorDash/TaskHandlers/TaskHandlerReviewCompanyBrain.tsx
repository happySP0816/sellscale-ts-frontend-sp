import { userTokenState } from "@atoms/userAtoms";
import { VoiceBuilderSection } from "@modals/VoiceBuilderModal";
import { useRecoilValue } from "recoil";

interface TaskHandlerReviewCompanyBrainData {
  data: {
    campaign_id: number;
  };
  onTaskComplete?: () => void;
}

export const TaskHandlerReviewCompanyBrain = (
  props: TaskHandlerReviewCompanyBrainData
) => {
  const userToken = useRecoilValue(userTokenState);

  return (
    <>
      <iframe
        src={
          "https://sellscale.retool.com/embedded/public/035e7bc0-da4c-4913-a028-5c49e0d457fc#auth_token=" +
          userToken
        }
        width={"100%"}
        height={window.innerHeight - 30}
        frameBorder={0}
        allowFullScreen
      />
    </>
  );
};
