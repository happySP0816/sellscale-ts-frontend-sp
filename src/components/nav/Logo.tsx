import { ColorScheme, Flex, Text, Image } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { FaFeatherAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { GRADIENT_COLORS, SCREEN_SIZES } from '../../constants/data';
import LogoImg from '../../assets/images/logo.svg';

export function Logo({ colorScheme }: { colorScheme: ColorScheme }) {

  const phoneScreen = useMediaQuery(`(max-width: ${SCREEN_SIZES.TY})`);

  return (
    <Flex
      wrap="nowrap"
      onClick={() => {
        window.location.href = '/';
      }}
      sx={{ cursor: 'pointer', userSelect: 'none' }}
    >
      <Image
        height={120}
        width={200}
        fit="contain"
        src={LogoImg}
        alt="SellScale Sight"
      />
    </Flex>
  );
}