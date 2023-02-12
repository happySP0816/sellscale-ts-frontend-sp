import { ColorScheme, Flex, Text, Image } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { FaFeatherAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { GRADIENT_COLORS, SCREEN_SIZES } from '../../constants/data';
import IconImg from '../../assets/images/icon.svg';

export function Logo() {

  const phoneScreen = useMediaQuery(`(max-width: ${SCREEN_SIZES.TY})`);

  return (
    <Flex
      wrap="nowrap"
      onClick={() => {
        window.location.href = '/';
      }}
      py='xs'
      sx={{ cursor: 'pointer', userSelect: 'none' }}
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