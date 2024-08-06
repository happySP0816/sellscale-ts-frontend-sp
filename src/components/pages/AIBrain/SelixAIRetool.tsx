import { userTokenState } from "@atoms/userAtoms";
import React from "react";
import { useRecoilValue } from "recoil";

export const SelixAIRetool = () => {
  const userToken = useRecoilValue(userTokenState);
  return (
    <>
      <iframe
        title="Selix AI Retool"
        // Editing Link: https://sellscale.retool.com/editor/a1a9c22c-4f99-11ef-922a-07d18b36767c/Selix%20MVP/Selix%20AI%20-%20Core%20Experience#authToken=9wEDP7vv1kPCUqG7oQirlebPbTmvrj1g
        src={`https://sellscale.retool.com/embedded/public/936d22c0-a26f-4ef8-b246-bc17815f3e9c#authToken=${userToken}`}
        width="100%"
        height="100%"
        style={{
          outline: "none",
          border: "none",
        }}
      ></iframe>
    </>
  );
};
