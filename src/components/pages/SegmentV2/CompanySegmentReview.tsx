import { userTokenState } from "@atoms/userAtoms";
import { Text } from "@mantine/core";
import React from "react";
import { useRecoilValue } from "recoil";

type PropsType = {
  selixSessionId: number | null | undefined | Number;
  connectedCompanySegmentId: number | null | undefined;
};

export default function CompanySegmentReview(props: PropsType) {
  const userToken = useRecoilValue(userTokenState);
  return (
    <div>
      <iframe
        // Edit URL: https://sellscale.retool.com/editor/06ae64ca-8b40-11ef-8667-7ff11a0817d0/Segments%20v2%20Modules/Segments%20-%20Search%20%26%20Add%20Companies
        src={`https://sellscale.retool.com/embedded/public/b94afb73-72a8-42f0-8325-5613192d524a#authToken=${userToken}&segmentId=${props.connectedCompanySegmentId}&defaultTab=1&selixSessionId=${props.selixSessionId}`}
        width="100%"
        height="700px"
        style={{ border: "none" }}
      ></iframe>
    </div>
  );
}
