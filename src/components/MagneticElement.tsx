import type { CSSProperties, ReactNode } from 'react';

interface MagneticElementProps {
  children: ReactNode;
  strength?: number;
  className?: string;
  style?: CSSProperties;
  as?: 'div' | 'button' | 'a' | 'span';
}

export const MagneticElement = ({
  children,
  className,
  style,
  as = 'div',
}: MagneticElementProps) => {
  const Tag = as as keyof JSX.IntrinsicElements;

  return (
    <Tag className={className} style={style}>
      {children}
    </Tag>
  );
};
