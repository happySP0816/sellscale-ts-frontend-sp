import React from 'react';
import { useMantineTheme } from '@mantine/core';

const BracketGradientWrapper: React.FC<{ children: string }> = ({ children }) => {
  const theme = useMantineTheme();
  const highlightedText = children.replace(/\[\[(.*?)\]\]/g, (match, p1) => {
    return `<span style="background-image: linear-gradient(45deg, ${theme.colors.cyan[5]}, purple); font-weight: 700; -webkit-background-clip: text; -webkit-text-fill-color: transparent;">[[${p1}]]</span>`;
  });

  return (
    <span dangerouslySetInnerHTML={{ __html: highlightedText }} />
  );
};

export default BracketGradientWrapper;
