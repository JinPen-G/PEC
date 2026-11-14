/** Original homepage word reveal and rotating phrase, with host-provided platform copy. */
import { useRef } from 'react';
import { useInView, motion } from 'motion/react';
import { useShouldReduceMotion, ease, useTempoTransition } from '@animate-ui/react/utils/motion';
import { RotatingText, RotatingTextContainer } from '@animate-ui/react/primitives/texts/rotating';
import { SplittingText } from '@animate-ui/react/primitives/texts/splitting';
import { usePageVisible } from './landing-playback';

export function LandingHeroTitle({
  ready,
  prefix,
  phrases,
  suffix,
}: {
  ready: boolean;
  prefix: string;
  phrases: string[];
  suffix: string;
}) {
  const ref = useRef<HTMLHeadingElement>(null);
  const onScreen = useInView(ref);
  const visible = usePageVisible();
  const reduce = useShouldReduceMotion();
  const reveal = useTempoTransition({ duration: 0.7, ease: ease.out });
  const initial = { opacity: 0, y: reduce ? 0 : 24, filter: 'blur(12px)' };
  const animate = { opacity: 1, y: 0, filter: 'blur(0px)' };
  return (
    <h1 ref={ref} className="home-hero-title">
      <span className="home-hero-title-line">
        {ready ? (
          <SplittingText
            type="chars"
            text={prefix}
            className="home-title-words"
            initial={initial}
            animate={animate}
            transition={reveal}
            stagger={0.035}
          />
        ) : (
          <span className="home-title-waiting">{prefix}</span>
        )}{' '}
        <motion.span
          className="home-title-phrase"
          initial={false}
          animate={ready ? animate : initial}
          transition={{ ...reveal, delay: 0.14 }}
        >
          <RotatingTextContainer
            text={ready && onScreen && visible && !reduce ? phrases : phrases.slice(0, 1)}
            duration={2600}
            delay={1400}
            align="center"
            style={{ display: 'inline-block', overflow: 'clip' }}
          >
            <RotatingText className="home-title-rotating" />
          </RotatingTextContainer>
        </motion.span>
      </span>
      {ready ? (
        <SplittingText
          type="chars"
          text={suffix}
          className="home-title-words"
          initial={initial}
          animate={animate}
          transition={reveal}
          delay={300}
          stagger={0.035}
        />
      ) : (
        <span className="home-title-waiting">{suffix}</span>
      )}
    </h1>
  );
}
