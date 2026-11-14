/** Outline adaptation of resources/brand/02_icon/svg/icon-symbol-dark.svg.
 * Card masks preserve the original stacking while dots and lines stay solid. */
import symbol from './brand-icon.svg';
import styles from './brand-icon.module.css';

export function BrandIcon({ size = 32 }: { size?: number }) {
  return (
    <img
      className={styles.icon}
      src={symbol}
      width={size}
      height={size}
      alt=""
      aria-hidden="true"
      draggable={false}
    />
  );
}
