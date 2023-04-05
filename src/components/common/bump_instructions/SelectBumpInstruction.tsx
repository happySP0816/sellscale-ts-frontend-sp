import { useEffect, useState } from "react";
import CreateBumpInstructionModal from "./CreateBumpInstructionModal";
import { Container, Select } from "@mantine/core";
import { useRecoilValue } from "recoil";
import { userTokenState } from "@atoms/userAtoms";

type PropsType = {
  client_sdr_id: number;
  overall_status: string;
  onBumpFrameworkSelected: (bumpFrameworkId: number) => void;
};

export default function SelectBumpInstruction(props: PropsType) {
  const [bumpFrameworks, setBumpFrameworks] = useState([]);
  const userToken = useRecoilValue(userTokenState);
  const [loadingBumpFrameworks, setLoadingBumpFrameworks] = useState(false);

  const getBumpFrameworks = () => {
    setLoadingBumpFrameworks(true);
    fetch(
      `${process.env.REACT_APP_API_URI}/bump_framework/?client_sdr_id=` +
        props.client_sdr_id +
        `&overall_status=` +
        props.overall_status,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      }
    )
      .then((res) => {
        setLoadingBumpFrameworks(false);
        return res.json();
      })
      .then((j) => {
        setBumpFrameworks(j);
      })
      .catch((e) => {
        setLoadingBumpFrameworks(false);
      });
  };

  const createBumpFramework = (description: string) => {
    fetch(`${process.env.REACT_APP_API_URI}/bump_framework/create`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_sdr_id: props.client_sdr_id,
        overall_status: props.overall_status,
        description: description,
      }),
    }).then((res) => {
      getBumpFrameworks();
      return res.json();
    });
  };

  useEffect(() => {
    getBumpFrameworks();
  }, []);

  // Todo: Aakash - fix this!
  return null;

  return (
    <>
      <Select
        data={bumpFrameworks.map((x: any) => {
          return { value: x.id, label: x.description };
        })}
        placeholder={
          loadingBumpFrameworks
            ? "loading..."
            : "ex. Keep it short! Mention the superbowl!"
        }
        label="Instruct your AI for the next bump generation"
        description="Tell the AI on how you'd like it to response. Choose an existing bump framework or create a new one."
        mt={"sm"}
        onCreate={(value) => {
          createBumpFramework(value);
          return value;
        }}
        getCreateLabel={(query) => (
          <>
            <span style={{ fontWeight: 700 }}>Create new instruction: </span>
            {query}
          </>
        )}
        disabled={loadingBumpFrameworks}
        searchable
        creatable
      />
    </>
  );
}
