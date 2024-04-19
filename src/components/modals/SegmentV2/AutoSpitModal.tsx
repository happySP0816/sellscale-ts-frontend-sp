import CustomSelect from '@common/persona/ICPFilter/CustomSelect';
import { Button, Flex } from '@mantine/core';
import { closeAllModals } from '@mantine/modals';
import { useState } from 'react';

export default function AutoSpitModal() {
  const [schoolData, setSchoolData] = useState(['Southern Oregon University', 'Aptos High School']);
  const [locationData, setLocationData] = useState(['San Francisco']);
  const [preCompanyData, setPreCompanyData] = useState(['SellScale', 'FlexSweep Industries', 'TalesTerrain']);
  const [prospectIndustryData, setProspectIndustryData] = useState([''] || null);
  const [tier1title, setTier1Title] = useState(['CEO', 'Vice President', 'Head of']);
  const [tier2title, setTier2Title] = useState(['Manager', 'Senior']);
  const [tier3title, setTier3Title] = useState([''] || null);

  const handleAutoSplit = () => {
    closeAllModals();
  };

  return (
    <>
      <Flex gap={'sm'} direction={'column'}>
        <CustomSelect
          maxWidth='100%'
          value={schoolData}
          label='YOUR SCHOOLS:'
          placeholder='Select options'
          setValue={setSchoolData}
          data={schoolData}
          setData={setSchoolData}
        />

        <CustomSelect
          maxWidth='100%'
          value={locationData}
          label='YOUR LOCATIONS:'
          placeholder='Select options'
          setValue={setLocationData}
          data={locationData}
          setData={setLocationData}
        />
        <CustomSelect
          maxWidth='100%'
          value={preCompanyData}
          label='YOUR PREVIOUS COMPANIES:'
          placeholder='Select options'
          setValue={setPreCompanyData}
          data={preCompanyData}
          setData={setPreCompanyData}
        />
        <CustomSelect
          maxWidth='100%'
          value={prospectIndustryData}
          label='PROSPECT INDUSTRIES:'
          placeholder='Select options'
          setValue={setProspectIndustryData}
          data={prospectIndustryData}
          setData={setProspectIndustryData}
        />
        <CustomSelect
          maxWidth='100%'
          value={tier1title}
          label='PROSPECT TIER 1 TITLES:'
          placeholder='Select options'
          setValue={setTier1Title}
          data={tier1title}
          setData={setTier1Title}
        />
        <CustomSelect
          maxWidth='100%'
          value={tier2title}
          label='PROSPECT TIER 2 TITLES:'
          placeholder='Select options'
          setValue={setTier2Title}
          data={tier2title}
          setData={setTier2Title}
        />
        <CustomSelect
          maxWidth='100%'
          value={tier3title}
          label='PROSPECT TIER 3 TITLES:'
          placeholder='Select options'
          setValue={setTier3Title}
          data={tier3title}
          setData={setTier3Title}
        />
      </Flex>
      <Flex gap={'lg'} mt={40}>
        <Button fullWidth variant='outline' color='gray' size='md' radius='md' onClick={() => closeAllModals()}>
          Cancel
        </Button>
        <Button fullWidth size='md' radius='md' onClick={handleAutoSplit}>
          Run Auto Split
        </Button>
      </Flex>
    </>
  );
}
