import { ColorScheme, Flex, Text, Image } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { FaFeatherAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { GRADIENT_COLORS, SCREEN_SIZES } from '../../constants/data';
import IconImg from '../../assets/images/icon.svg';
import LogoImg from '../../assets/images/logo.svg';

export function LogoIcon() {

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
        width={30}
        fit="contain"
        src={IconImg}
        alt="SellScale Sight"
      />
    </Flex>
  );
}


export function LogoFull() {

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
        height={26}
        fit="contain"
        src={LogoImg}
        alt="SellScale Sight"
      />
    </Flex>
  );
}