import { Flex, Image } from '@mantine/core';
import IconImg from '@assets/images/icon.svg';
import LogoImg from '@assets/images/logo.svg';

export function LogoIcon(props: { size?: number }) {

  return (
    <Flex
      wrap="nowrap"
      onClick={() => {
        window.location.href = '/';
      }}
      py='xs'
      className="cursor-pointer"
      sx={{ userSelect: 'none' }}
    >
      <Image
        width={props.size || 30}
        fit="contain"
        src={IconImg}
        alt="SellScale Sight"
      />
    </Flex>
  );
}


export function LogoFull(props: { size?: number }) {

  return (
    <Flex
      wrap="nowrap"
      onClick={() => {
        window.location.href = '/';
      }}
      py='xs'
      className="cursor-pointer"
      sx={{ userSelect: 'none' }}
    >
      <Image
        height={props.size || 26}
        fit="contain"
        src={LogoImg}
        alt="SellScale Sight"
      />
    </Flex>
  );
}