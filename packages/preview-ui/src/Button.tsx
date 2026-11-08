/** Native button with the original admin bridge attributes; source motion stays intact. */
import { forwardRef, type ComponentProps } from 'react';
import { Button as SourceButton } from '../upstream/rental-admin/packages/ui-arc/vendor/registry/components/button/button';

export const Button = forwardRef<HTMLButtonElement, ComponentProps<typeof SourceButton>>(
  function Button(props, ref) {
    return (
      <SourceButton
        {...props}
        variant={props.variant ?? 'secondary'}
        ref={ref}
        data-rental-arc-button=""
        data-button-kind={props.variant ?? 'secondary'}
      />
    );
  },
);
