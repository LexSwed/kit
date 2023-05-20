"use client";
import React, { type ReactNode } from "react";

import { ThemeProvider } from "@fxtrot/ui";

interface Props {
  children: ReactNode;
}

export const AppContext = ({ children }: Props) => {
  return <ThemeProvider>{children}</ThemeProvider>;
};
