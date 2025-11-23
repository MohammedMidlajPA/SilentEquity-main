import React from 'react';
import { cn } from '../../lib/utils';

const buttonVariants = {
  primary: 'shad-button--primary',
  ghost: 'shad-button--ghost',
  outline: 'shad-button--outline',
};

const Button = React.forwardRef(({ className, variant = 'primary', ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={cn('shad-button', buttonVariants[variant], className)}
      {...props}
    />
  );
});

Button.displayName = 'Button';

export { Button, buttonVariants };










