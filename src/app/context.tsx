'use client';
import { ThemeProvider } from '@fxtrot/ui';
import React, { type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

export const AppContext = ({ children }: Props) => {
  return <ThemeProvider>{children}</ThemeProvider>;
};
