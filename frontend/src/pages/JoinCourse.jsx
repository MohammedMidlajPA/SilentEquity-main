import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '../components/ui/form';
import { submitCourseForm } from '../lib/api';

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name is too long'),
  email: z.string().email('Enter a valid email address'),
  phone: z
    .string()
    .min(10, 'Phone must be at least 10 digits')
    .max(20, 'Phone must be 20 digits or fewer')
    .regex(/^[\d+\-() ]{10,20}$/, 'Phone number contains invalid characters'),
});

const JoinCourse = () => {
  const [status, setStatus] = React.useState({ submitting: false, error: '' });
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
    },
  });

  const onSubmit = async (values) => {
    // Prevent duplicate submissions
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setStatus({ submitting: true, error: '' });
    
    try {
      const { checkoutUrl } = await submitCourseForm(values);
      if (checkoutUrl) {
        // Small delay to ensure state updates before redirect
        await new Promise(resolve => setTimeout(resolve, 100));
        window.location.href = checkoutUrl;
      } else {
        throw new Error('No checkout URL received from server');
      }
    } catch (error) {
      setIsSubmitting(false);
      setStatus({
        submitting: false,
        error: error.message || 'Unable to start payment. Please check your connection and try again.',
      });
    }
  };

  return (
    <section className="join-course" aria-labelledby="join-course-title">
      <div className="join-course__grid">
        <div className="glass-card join-course__visual">
          <div className="join-course__visual-content">
            <p className="eyebrow">Silent Equity</p>
            <h2>Learn to Trade Like a Professional</h2>
            <p>
              Join our 3-month trading program built to help you think, act, and execute like a real trader.
              You’ll follow a structured learning path, face practical trading challenges, and master proven
              risk management methods used by professionals.
            </p>
            <p>
              With team support, mentorship, and accountability, you won’t be learning alone—you’ll grow with
              a community focused on real progress, not quick profits.
            </p>
            <p>Enroll now and start your journey toward consistent, disciplined trading.</p>
          </div>
          <div className="join-course__visual-media" aria-hidden="true">
            <img
              src="/media/course-image.jpeg"
              alt="Trading course illustration"
              loading="lazy"
            />
            <div className="join-course__visual-waves wave-one" />
            <div className="join-course__visual-waves wave-two" />
          </div>
        </div>

        <div className="glass-card join-course__form-card">
          <div className="glass-card__header">
            <p className="eyebrow">JOIN THE COURSE</p>
            <h1 id="join-course-title">Code of Consistency</h1>
            <div className="glass-card__description" style={{ marginTop: '1.25rem', marginBottom: '1.75rem' }}>
              <p style={{ marginBottom: '1rem', lineHeight: '1.6', fontSize: '0.95rem', color: 'var(--muted)' }}>
                A focused trading program designed to build discipline, structure, and repeatable results.
              </p>
              <p style={{ marginBottom: '1.5rem', lineHeight: '1.6', fontSize: '0.95rem', color: 'var(--muted)' }}>
                This course teaches you how to follow a daily trading system, avoid emotional decisions, and trade with clarity.
              </p>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.75rem', color: '#9fece2', letterSpacing: '0.05em', textTransform: 'uppercase' }}>What You Get</h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, lineHeight: '1.8', fontSize: '0.9rem', color: 'var(--muted)' }}>
                  <li style={{ marginBottom: '0.5rem', paddingLeft: '0.5rem' }}>• A simple, consistent trading routine</li>
                  <li style={{ marginBottom: '0.5rem', paddingLeft: '0.5rem' }}>• Market structure & SMC basics</li>
                  <li style={{ marginBottom: '0.5rem', paddingLeft: '0.5rem' }}>• Clear risk management rules</li>
                  <li style={{ marginBottom: '0.5rem', paddingLeft: '0.5rem' }}>• High-probability trade setups</li>
                  <li style={{ marginBottom: '0.5rem', paddingLeft: '0.5rem' }}>• Psychology and discipline training</li>
                </ul>
              </div>
              
              <div style={{ marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.75rem', color: '#9fece2', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Built For</h3>
                <p style={{ lineHeight: '1.6', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--muted)' }}>
                  Beginners, struggling traders, and funded traders who want stable, controlled, and consistent performance.
                </p>
                <p style={{ lineHeight: '1.6', fontStyle: 'italic', color: '#9fece2', fontSize: '0.9rem', marginTop: '0.75rem' }}>
                  Trade less. Trade better. Stay consistent.
                </p>
              </div>
            </div>
            <p className="glass-card__subtitle" style={{ marginTop: '1.5rem', fontSize: '0.9rem' }}>
              Complete the intake form to save your cohort seat, then finish payment on Stripe using your existing live checkout.
            </p>
          </div>

          <Form {...form}>
            <form className="glass-card__form" onSubmit={form.handleSubmit(onSubmit)} noValidate>
              <FormField
                control={form.control}
                name="name"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel htmlFor="name">Name</FormLabel>
                    <FormControl>
                      <Input
                        id="name"
                        placeholder="Jai Verma"
                        autoComplete="name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage error={fieldState.error?.message} />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel htmlFor="email">Email</FormLabel>
                    <FormControl>
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@email.com"
                        autoComplete="email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage error={fieldState.error?.message} />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel htmlFor="phone">Phone</FormLabel>
                    <FormControl>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+91 98765 43210"
                        autoComplete="tel"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage error={fieldState.error?.message} />
                  </FormItem>
                )}
              />

              {status.error && (
                <p className="form-error-banner" role="alert">
                  {status.error}
                </p>
              )}

              <div className="glass-card__actions">
                <Button type="submit" disabled={status.submitting || isSubmitting}>
                  {status.submitting || isSubmitting ? 'Processing…' : 'Proceed to payment'}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </section>
  );
};

export default JoinCourse;

