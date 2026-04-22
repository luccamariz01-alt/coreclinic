"use client";

import type { ReactNode } from "react";
import { Children, useEffect, useState } from "react";
import { motion } from "motion/react";

type StaggerGroupProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

export function StaggerGroup({ children, className, delay = 0 }: StaggerGroupProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      variants={{
        hidden: {},
        show: {
          transition: {
            delayChildren: delay,
            staggerChildren: 0.07
          }
        }
      }}
    >
      {Children.map(children, (child, index) => (
        <motion.div
          key={index}
          variants={{
            hidden: { opacity: 0, y: 12 },
            show: { opacity: 1, y: 0 }
          }}
          transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}
