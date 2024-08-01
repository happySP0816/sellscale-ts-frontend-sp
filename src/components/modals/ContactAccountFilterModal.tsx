import {Modal, Switch, Table, Title} from "@mantine/core";
import {useEffect, useState} from "react";
import {Prospect} from "../../index";
import {useQuery} from "@tanstack/react-query";
import {TransformedSegment} from "@pages/SegmentV3/SegmentV3";
import {API_URL} from "@constants/data";
import {useRecoilValue} from "recoil";
import {userTokenState} from "@atoms/userAtoms";

interface ContactAccountFilterModalProps {
  showContactAccountFilterModal: boolean,
  setShowContactAccountFilterModal: (showModal: boolean) => void,
  segment?: TransformedSegment,
}

type ViewMode = "ACCOUNT" | "CONTACT";

interface TableHeader {
  key: string,
  title: string,
}

interface ProspectAccounts {
  [key: string]: string | number;
}

const ContactAccountFilterModal = function (
  {
    showContactAccountFilterModal,
    setShowContactAccountFilterModal,
    segment,
  }: ContactAccountFilterModalProps) {
  const userToken = useRecoilValue(userTokenState);

  const [viewMode, setViewMode] = useState<ViewMode>("CONTACT");
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [prospectAccounts, setProspectAccounts] = useState<ProspectAccounts[]>([]);

  const [contactTableHeaders, setContactTableHeaders] = useState<TableHeader[]>(
    [{key: "full_name", title: "Full Name"}, {key: "title", title: "Title"}, {key: "company", title: "Company"}]
  );

  const [companyTableHeaders, setCompanyTableHeaders] = useState<TableHeader[]>(
    [{key: "company", title: "Account Name"}]
  );

  const { data, isLoading, error } = useQuery({
    queryKey: ['segmentProspects', segment?.id],
    queryFn: async () => {
      if (segment) {
        const response = await fetch(`${API_URL}/segment/${segment.id}/prospects`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${userToken}`,
          }
        });

        const jsonResponse = await response.json();

        return jsonResponse.prospects;
      }
      else {
        return null;
      }
    },
    enabled: !!segment
  })

  useEffect(() => {
    if (data) {
      const prospectData = data as Prospect[];

      console.log("Prospect Data: ", prospectData);

      setProspects(prospectData);

      const companySet = new Set();
      const finalCompanyData: ProspectAccounts[] = [];

      prospectData.forEach(prospect => {
        const prospectCompanyName = prospect.company;

        if (!companySet.has(prospectCompanyName)) {
          companySet.add(prospectCompanyName);
          // Add to final Company Data
          // Have columns for them like scoring
          // Make new column for icp_fit_reason_v2
          // Json key value pair of header_key, and reasoning
          finalCompanyData.push({"company": prospectCompanyName})
        }
      })

      setProspectAccounts(finalCompanyData);
    }
  }, [data]);

  return (
    <Modal
      onClose={() => setShowContactAccountFilterModal(false)}
      opened={showContactAccountFilterModal}
      size={'1000px'}
    >
      <Title order={4}>
        {viewMode === "ACCOUNT" ? "Account Market Map" : "Contact Market Map"}
        <Switch
          onLabel="Account View"
          offLabel="Contact View"
          onChange={(event) =>{
          if (event.currentTarget.checked) {
            setViewMode("ACCOUNT")
          } else {
            setViewMode("CONTACT")
          }}}
          checked={viewMode === "ACCOUNT"}
        />
      </Title>
      {viewMode === "ACCOUNT" ? (
        <Table>
          <thead>
          <tr>
            {companyTableHeaders.map(item => {
              return (
                <th>
                  {item.title}
                </th>
              )
            })}
          </tr>
          </thead>
          <tbody>
            {prospectAccounts.map((prospectAccount, index) => {
              const keys = companyTableHeaders.map(h => h.key);

              return (
                <tr>
                  {keys.map(key => {
                    const keyType = key as keyof ProspectAccounts;

                    return (
                      <td>
                        {prospectAccount[keyType]}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </Table>
      ) : (
        <Table>
          <thead>
          <tr>
            {contactTableHeaders.map(item => {
              return (
                <th>
                  {item.title}
                </th>
              )
            })}
          </tr>
          </thead>
          <tbody>
          {prospects.map((prospect, index) => {
            const keys: string[] = contactTableHeaders.map(h => h.key);

            return (
              <tr>
                {keys.map(key => {
                  const keyType = key as keyof Prospect;
                  return (
                    <td>
                      {prospect[keyType]}
                    </td>
                  )
                })}
              </tr>
            )
          })}
          </tbody>
        </Table>
      )}

    </Modal>
  );
};

export default ContactAccountFilterModal;
