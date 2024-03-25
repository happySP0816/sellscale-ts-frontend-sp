import { userTokenState } from "@atoms/userAtoms";
import { Box } from "@mantine/core";
import React from "react";
import { useRecoilValue } from "recoil";

export const CampaignAGI = () => {
  const token = useRecoilValue(userTokenState);

  // get request from url param
  const urlParams = new URLSearchParams(window.location.search);
  const request = urlParams.get("request");

  return (
    <Box>
      <Box w="100%" style={{ backgroundColor: "#ddd" }} p="sm">
        <b>
          ⚠️ Warning: Campaign AGI is a Beta Feature - Generations and behavior
          may not be accurate or fully operational. Please use with caution.
        </b>
      </Box>
      <iframe
        src={
          "https://sellscale.retool.com/embedded/public/8aa78910-5a94-430c-894e-98282471b398#authToken=" +
          token +
          "&request=" +
          request
        }
        style={{ width: "100%", height: "100vh", border: "none" }}
      />
    </Box>
  );
};
