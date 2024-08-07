import { userTokenState } from "@atoms/userAtoms";
import React from "react";
import { useRecoilValue } from "recoil";

export const SelixTaskPuppet = () => {
  const userToken = useRecoilValue(userTokenState);
  return (
    <>
      <iframe
        title="Selix AI Retool"
        // Editing Link: https://sellscale.retool.com/editor/2a059998-54f4-11ef-a7db-933905e4d83c/Selix%20MVP/Selix%20AI%20-%20Task%20Puppet%20View#authToken=81EpYvSxFIcRucTnBPjpcnC6xymDqlb2
        src={`https://sellscale.retool.com/embedded/public/c4c5347a-aee0-43ff-b5d6-ebf277e80697#authToken=${userToken}`}
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
