import { Hono } from 'hono';
import Stripe from 'stripe';
import type { Env } from '../index';

const app = new Hono<Env>();

// Create checkout session for trial
app.post('/checkout', async (c) => {
  const stripe = new Stripe(c.env.STRIPE_SECRET_KEY, { apiVersion: '2024-04-10' });
  const { email, name } = await c.req.json();
  
  // Get or create user
  let user = await c.env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(email).first<{ id: number; email: string; name: string | null }>();
  
  if (!user) {
    const result = await c.env.DB.prepare(
      'INSERT INTO users (email, name) VALUES (?, ?) RETURNING id'
    ).bind(email, name).first<{ id: number }>();
    user = { id: result!.id, email, name };
  }
  
  // Create Stripe customer
  const customer = await stripe.customers.create({
    email,
    name,
    metadata: { user_id: user.id.toString() }
  });
  
  await c.env.DB.prepare('UPDATE users SET stripe_customer_id = ? WHERE id = ?')
    .bind(customer.id, user.id).run();
  
  // Create checkout session with trial
  const session = await stripe.checkout.sessions.create({
    customer: customer.id,
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: 'eur',
        product_data: {
          name: 'Essai Copycat AI - 48h',
          description: 'Accès complet pendant 48h, puis 49,90€/28jours'
        },
        unit_amount: 290, // 2,90€
        recurring: {
          interval: 'day',
          interval_count: 28
        }
      },
      quantity: 1
    }],
    mode: 'subscription',
    subscription_data: {
      trial_end: Math.floor(Date.now() / 1000) + (48 * 60 * 60), // 48h trial
      metadata: { user_id: user.id.toString() }
    },
    success_url: `${c.env.APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${c.env.APP_URL}/cancel`,
    metadata: { user_id: user.id.toString() }
  });
  
  return c.json({ sessionId: session.id, url: session.url });
});

// Customer portal
app.post('/portal', async (c) => {
  const stripe = new Stripe(c.env.STRIPE_SECRET_KEY, { apiVersion: '2024-04-10' });
  const sessionId = c.req.header('cookie')?.match(/session=([^;]+)/)?.[1];
  
  if (!sessionId) {
    return c.json({ error: 'Non authentifié' }, 401);
  }
  
  const user = await c.env.DB.prepare(
    'SELECT stripe_customer_id FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.id = ?'
  ).bind(sessionId).first<{ stripe_customer_id: string }>();
  
  if (!user?.stripe_customer_id) {
    return c.json({ error: 'Pas de customer Stripe' }, 400);
  }
  
  const portalSession = await stripe.billingPortal.sessions.create({
    customer: user.stripe_customer_id,
    return_url: `${c.env.APP_URL}/app/settings`
  });
  
  return c.json({ url: portalSession.url });
});

// Webhook handler
app.post('/webhook', async (c) => {
  const stripe = new Stripe(c.env.STRIPE_SECRET_KEY, { apiVersion: '2024-04-10' });
  const payload = await c.req.text();
  const signature = c.req.header('stripe-signature');
  
  if (!signature) {
    return c.json({ error: 'Signature manquante' }, 400);
  }
  
  let event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, c.env.STRIPE_WEBHOOK_SECRET);
  } catch (err: any) {
    return c.json({ error: `Webhook Error: ${err.message}` }, 400);
  }
  
  // Handle events
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.user_id;
      const subscriptionId = session.subscription as string;
      
      if (userId) {
        const trialEnd = new Date();
        trialEnd.setHours(trialEnd.getHours() + 48);
        
        await c.env.DB.prepare(
          'UPDATE users SET subscription_status = ?, subscription_id = ?, trial_end_date = ? WHERE id = ?'
        ).bind('trialing', subscriptionId, trialEnd.toISOString(), userId).run();
      }
      break;
    }
    
    case 'invoice.paid': {
      const invoice = event.data.object as Stripe.Invoice;
      const subscriptionId = invoice.subscription as string;
      
      const user = await c.env.DB.prepare(
        'SELECT id FROM users WHERE subscription_id = ?'
      ).bind(subscriptionId).first<{ id: number }>();
      
      if (user) {
        await c.env.DB.prepare(
          'UPDATE users SET subscription_status = ? WHERE id = ?'
        ).bind('active', user.id).run();
      }
      break;
    }
    
    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      const subscriptionId = invoice.subscription as string;
      
      const user = await c.env.DB.prepare(
        'SELECT id FROM users WHERE subscription_id = ?'
      ).bind(subscriptionId).first<{ id: number }>();
      
      if (user) {
        await c.env.DB.prepare(
          'UPDATE users SET subscription_status = ? WHERE id = ?'
        ).bind('past_due', user.id).run();
      }
      break;
    }
    
    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      
      const user = await c.env.DB.prepare(
        'SELECT id FROM users WHERE subscription_id = ?'
      ).bind(subscription.id).first<{ id: number }>();
      
      if (user) {
        await c.env.DB.prepare(
          'UPDATE users SET subscription_status = ? WHERE id = ?'
        ).bind('canceled', user.id).run();
      }
      break;
    }
  }
  
  return c.json({ received: true });
});

export const stripeRoutes = app;
