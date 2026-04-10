'use client';

import { LazyMotion, domAnimation, m } from 'framer-motion';

function FadeInInner({ children, delay = 0, className = '', direction = 'up' }) {
  const dirMap = {
    up: { y: 30 },
    down: { y: -30 },
    left: { x: 30 },
    right: { x: -30 },
    none: {},
  };

  return (
    <m.div
      initial={{ opacity: 0, ...dirMap[direction] }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{
        duration: 0.7,
        delay,
        ease: [0.21, 0.47, 0.32, 0.98],
      }}
      className={className}
    >
      {children}
    </m.div>
  );
}

export function FadeIn(props) {
  return (
    <LazyMotion features={domAnimation}>
      <FadeInInner {...props} />
    </LazyMotion>
  );
}

export function StaggerContainer({ children, className = '' }) {
  return (
    <LazyMotion features={domAnimation}>
      <m.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
        variants={{
          visible: {
            transition: { staggerChildren: 0.08 },
          },
        }}
        className={className}
      >
        {children}
      </m.div>
    </LazyMotion>
  );
}

export function StaggerItem({ children, className = '' }) {
  return (
    <m.div
      variants={{
        hidden: { opacity: 0, y: 24 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.5,
            ease: [0.21, 0.47, 0.32, 0.98],
          },
        },
      }}
      className={className}
    >
      {children}
    </m.div>
  );
}
