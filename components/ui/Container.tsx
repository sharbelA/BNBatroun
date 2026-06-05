/**
 * Container — consistent max-width + padding wrapper.
 * Every section that needs page-level horizontal constraints uses this.
 *
 * Usage:
 *   <Container>content</Container>
 *   <Container as="section" className="py-12">content</Container>
 */

import { ElementType, ReactNode } from "react";

interface ContainerProps {
  children: ReactNode;
  as?: ElementType;
  className?: string;
}

export default function Container({
  children,
  as: Tag = "div",
  className = "",
}: ContainerProps) {
  return (
    <Tag
      className={`mx-auto max-w-[1760px] px-6 sm:px-10 lg:px-20 ${className}`}
    >
      {children}
    </Tag>
  );
}
