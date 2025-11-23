# Performance Troubleshooting Guide

## Understanding Slow Request Warnings

### What Triggers the Warning?

The system logs a warning when any request takes longer than **1 second** (>1000ms).

This is **normal monitoring behavior** - it helps identify performance bottlenecks.

### Log Format

```
warn: Slow request detected
{
  method: 'POST',
  path: '/api/course/join',
  responseTimeMs: 1234,
  statusCode: 200,
  timestamp: '2025-11-23T14:34:30.000Z'
}
```

## Common Causes of Slow Requests

### 1. External API Calls

**Stripe API Calls**
- Creating checkout sessions
- Retrieving payment intents
- Network latency to Stripe servers

**Solutions:**
- ✅ Already optimized with 10s timeout
- ✅ Retry logic implemented
- ✅ Connection pooling active

**Exchange Rate API**
- First request (not cached)
- Network latency

**Solutions:**
- ✅ Caching implemented (1 hour TTL)
- ✅ Subsequent requests use cache

### 2. Database Operations

**Supabase Queries**
- Insert operations
- Duplicate email checks
- Network latency

**Solutions:**
- ✅ Retry logic implemented
- ✅ Connection pooling active
- ✅ Indexes on email field

**MongoDB Queries**
- Payment record lookups
- User queries

**Solutions:**
- ✅ Connection pool: 50 connections
- ✅ Indexes on frequently queried fields

### 3. High Load Scenarios

**Concurrent Requests**
- Multiple users registering simultaneously
- Payment processing spikes

**Solutions:**
- ✅ Rate limiting: 500/100 requests per 15min
- ✅ Connection pooling: 50 DB, 20 email
- ✅ Request timeout: 15 seconds

### 4. Network Latency

**Geographic Distance**
- Stripe servers location
- Supabase servers location
- Customer location

**Solutions:**
- ✅ Timeouts configured
- ✅ Retry logic for transient failures

## Performance Thresholds

| Response Time | Severity | Action Required |
|---------------|----------|----------------|
| < 500ms | ✅ Excellent | None |
| 500ms - 1s | ✅ Good | Monitor |
| 1s - 3s | ⚠️ Slow | Investigate |
| 3s - 5s | 🔴 High | Optimize |
| > 5s | 🚨 Critical | Immediate fix |

## Investigation Steps

### Step 1: Identify the Endpoint

Check the log for the `path` field:
```javascript
{
  path: '/api/course/join'  // This tells you which endpoint
}
```

### Step 2: Check Response Time

```javascript
{
  responseTimeMs: 1234  // Time in milliseconds
}
```

### Step 3: Review Common Causes

Based on the endpoint, check:

**For `/api/course/join`:**
- Supabase insert operation
- Stripe checkout session creation
- Duplicate email check

**For `/api/payment/create-checkout-session`:**
- Stripe API call
- Exchange rate API (if not cached)
- Database connection

**For `/api/webhook`:**
- Webhook signature verification
- Database updates
- Email sending (should be async)

### Step 4: Check System Resources

```bash
# Check server logs for patterns
grep "Slow request" logs/*.log | tail -20

# Check for multiple slow requests
grep "Slow request" logs/*.log | wc -l
```

### Step 5: Monitor Trends

- **Single slow request**: Likely network latency or one-time issue
- **Multiple slow requests**: System under load or bottleneck
- **Consistent slow requests**: Performance issue needs optimization

## Optimization Checklist

### ✅ Already Implemented

- [x] Connection pooling (DB: 50, Email: 20)
- [x] Rate limiting (500/100 per 15min)
- [x] Request timeouts (15s)
- [x] Retry logic for transient failures
- [x] Async email sending (non-blocking)
- [x] Exchange rate caching (1 hour)
- [x] Performance monitoring (logs slow requests)

### 🔍 Things to Check

- [ ] Database query performance
- [ ] Stripe API response times
- [ ] Supabase connection latency
- [ ] Network connectivity
- [ ] Server resources (CPU, memory)
- [ ] Concurrent request patterns

## Quick Fixes

### If Slow Requests Are Frequent

1. **Check Database Pool Usage**
   - Current: 50 connections
   - Increase if needed: Update `MONGODB_MAX_POOL_SIZE`

2. **Check Rate Limiting**
   - Current: 500/100 per 15min
   - Increase if needed: Update `RATE_LIMIT_MAX_REQUESTS`

3. **Check Exchange Rate Cache**
   - Verify cache is working
   - Check cache hit rate

4. **Monitor Stripe API**
   - Check Stripe Dashboard for API latency
   - Verify webhook delivery times

### If Slow Requests Are Rare

- **Normal behavior** - occasional slow requests are expected
- **Network latency** - varies by customer location
- **External API delays** - Stripe/Supabase may have occasional delays
- **No action needed** - system is working as expected

## Performance Monitoring

### Current Monitoring

- ✅ Logs requests >1 second
- ✅ Tracks response times
- ✅ Identifies slow endpoints
- ✅ Provides recommendations

### Enhanced Monitoring (Just Added)

- ✅ Analyzes slow request patterns
- ✅ Provides endpoint-specific recommendations
- ✅ Suggests optimizations based on response time

## Example Log Output

### Before Enhancement
```
warn: Slow request detected
{
  method: 'POST',
  path: '/api/course/join',
  responseTimeMs: 1234,
  statusCode: 200
}
```

### After Enhancement
```
warn: Slow request detected
{
  method: 'POST',
  path: '/api/course/join',
  responseTimeMs: 1234,
  statusCode: 200,
  timestamp: '2025-11-23T14:34:30.000Z'
}

info: Slow request analysis
{
  endpoint: '/api/course/join',
  method: 'POST',
  responseTimeMs: 1234,
  statusCode: 200,
  commonCauses: [
    'Supabase insert operation',
    'Stripe checkout session creation',
    'Duplicate email check query',
    'Network latency to Supabase'
  ],
  recommendations: [
    'Check Supabase response times',
    'Verify Supabase connection pool',
    'Monitor database query performance',
    'Check network connectivity'
  ]
}

info: Performance recommendations
{
  path: '/api/course/join',
  responseTimeMs: 1234,
  recommendations: [
    'MEDIUM: Response time >1s - Monitor and optimize',
    'Check external API response times',
    'Verify caching is working'
  ]
}
```

## When to Worry

### 🟢 Normal (No Action Needed)
- Occasional slow requests (< 5% of total)
- Response time 1-2 seconds
- No pattern or trend

### 🟡 Monitor (Investigate)
- 5-10% of requests are slow
- Response time 2-3 seconds
- Pattern emerging

### 🔴 Action Required (Optimize)
- >10% of requests are slow
- Response time >3 seconds
- Consistent pattern
- Affecting user experience

## Summary

**Slow request warnings are normal** - they help you monitor performance.

**The system is optimized** for:
- ✅ High traffic (10k+ concurrent users)
- ✅ Fast response times (<500ms typical)
- ✅ Handling occasional slow requests gracefully

**If you see slow requests:**
1. Check which endpoint (from log)
2. Check response time (from log)
3. Review recommendations (from enhanced logs)
4. Monitor trends (single vs multiple)
5. Take action only if pattern emerges


