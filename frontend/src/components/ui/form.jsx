import React from 'react';
import { FormProvider, Controller } from 'react-hook-form';
import { cn } from '../../lib/utils';

const Form = ({ children, ...formProps }) => {
  return <FormProvider {...formProps}>{children}</FormProvider>;
};

const FormField = ({ control, name, render }) => {
  return (
    <Controller
      control={control}
      name={name}
      render={render}
    />
  );
};

const FormItem = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('form-item', className)} {...props} />
));
FormItem.displayName = 'FormItem';

const FormLabel = React.forwardRef(({ className, ...props }, ref) => (
  <label ref={ref} className={cn('form-label', className)} {...props} />
));
FormLabel.displayName = 'FormLabel';

const FormControl = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('form-control', className)} {...props} />
));
FormControl.displayName = 'FormControl';

const FormMessage = ({ className, children, error }) => {
  const content = error || children;
  if (!content) return null;

  return (
    <p className={cn('form-message', className)}>
      {content}
    </p>
  );
};
FormMessage.displayName = 'FormMessage';

export {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
};










