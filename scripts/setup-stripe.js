#!/usr/bin/env node
/**
 * Stripe Setup Script for Copycat AI
 * 
 * This script creates:
 * - Product: Copycat AI - Essai 48h
 * - Price: 2,90€ trial then 49,90€ every 28 days
 * - Webhook endpoint (local or production)
 * 
 * Usage:
 *   node scripts/setup-stripe.js [--local|--production]
 * 
 * Environment variables required:
 *   STRIPE_SECRET_KEY - Your Stripe secret key
 *   APP_URL - Your application URL (for webhooks)
 */

const Stripe = require('stripe');

const ENV = process.argv[2] || '--local';
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const APP_URL = process.env.APP_URL || (ENV === '--local' ? 'http://localhost:8787' : null);

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function header(title) {
  console.log('');
  log('═'.repeat(60), 'cyan');
  log(`  ${title}`, 'bright');
  log('═'.repeat(60), 'cyan');
  console.log('');
}

function success(message) {
  log(`✓ ${message}`, 'green');
}

function error(message) {
  log(`✗ ${message}`, 'red');
}

function info(message) {
  log(`ℹ ${message}`, 'blue');
}

function step(message) {
  log(`→ ${message}`, 'yellow');
}

async function validateEnvironment() {
  if (!STRIPE_SECRET_KEY) {
    error('STRIPE_SECRET_KEY environment variable is required');
    info('Set it with: export STRIPE_SECRET_KEY=sk_test_...');
    process.exit(1);
  }

  if (!APP_URL) {
    error('APP_URL environment variable is required for production');
    info('Set it with: export APP_URL=https://your-domain.com');
    process.exit(1);
  }

  const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2024-04-10' });
  
  try {
    const account = await stripe.account.retrieve();
    success(`Connected to Stripe account: ${account.settings?.dashboard?.display_name || account.id}`);
    info(`Mode: ${STRIPE_SECRET_KEY.startsWith('sk_live') ? 'PRODUCTION' : 'TEST'}`);
    return stripe;
  } catch (err) {
    error('Failed to connect to Stripe');
    error(err.message);
    process.exit(1);
  }
}

async function createProduct(stripe) {
  header('Creating Product');
  
  const productData = {
    name: 'Copycat AI - Essai 48h',
    description: 'Accès complet à Copycat AI pendant 48 heures, puis abonnement de 49,90€ tous les 28 jours. Annulation gratuite à tout moment.',
    metadata: {
      type: 'trial_subscription',
      trial_hours: '48'
    }
  };

  try {
    // Check if product already exists
    const existingProducts = await stripe.products.list({ limit: 10 });
    const existing = existingProducts.data.find(p => p.name === productData.name);
    
    if (existing) {
      info(`Product already exists: ${existing.id}`);
      return existing;
    }

    const product = await stripe.products.create(productData);
    success(`Product created: ${product.id}`);
    return product;
  } catch (err) {
    error(`Failed to create product: ${err.message}`);
    throw err;
  }
}

async function createPrice(stripe, productId) {
  header('Creating Price');
  
  const priceData = {
    product: productId,
    currency: 'eur',
    unit_amount: 4900, // 49,90€
    recurring: {
      interval: 'day',
      interval_count: 28
    },
    metadata: {
      display_price: '49.90',
      trial_price: '2.90',
      billing_period: '28 days'
    }
  };

  try {
    // Check if price already exists for this product
    const existingPrices = await stripe.prices.list({ product: productId, limit: 10 });
    const existing = existingPrices.data.find(p => 
      p.unit_amount === priceData.unit_amount && 
      p.recurring?.interval === 'day' &&
      p.recurring?.interval_count === 28
    );
    
    if (existing) {
      info(`Price already exists: ${existing.id}`);
      return existing;
    }

    const price = await stripe.prices.create(priceData);
    success(`Price created: ${price.id}`);
    info(`Amount: 49,90€ every 28 days`);
    return price;
  } catch (err) {
    error(`Failed to create price: ${err.message}`);
    throw err;
  }
}

async function createWebhook(stripe) {
  header('Configuring Webhook');
  
  const webhookUrl = `${APP_URL}/api/stripe/webhook`;
  const enabledEvents = [
    'checkout.session.completed',
    'invoice.paid',
    'invoice.payment_failed',
    'customer.subscription.created',
    'customer.subscription.updated',
    'customer.subscription.deleted'
  ];

  try {
    // Check if webhook already exists
    const existingWebhooks = await stripe.webhookEndpoints.list({ limit: 10 });
    const existing = existingWebhooks.data.find(w => w.url === webhookUrl);
    
    if (existing) {
      info(`Webhook already exists: ${existing.id}`);
      
      // Update if events changed
      const needsUpdate = enabledEvents.some(e => !existing.enabled_events.includes(e));
      if (needsUpdate) {
        const updated = await stripe.webhookEndpoints.update(existing.id, {
          enabled_events: enabledEvents
        });
        success(`Webhook updated with new events`);
        return updated;
      }
      
      return existing;
    }

    const webhook = await stripe.webhookEndpoints.create({
      url: webhookUrl,
      enabled_events: enabledEvents,
      description: `Copycat AI ${ENV === '--local' ? 'Local' : 'Production'} Webhook`
    });
    
    success(`Webhook created: ${webhook.id}`);
    success(`URL: ${webhookUrl}`);
    info(`Webhook secret: ${webhook.secret}`);
    info(`\n⚠️  IMPORTANT: Save this webhook secret!`);
    info(`   Set it with: wrangler secret put STRIPE_WEBHOOK_SECRET`);
    
    return webhook;
  } catch (err) {
    error(`Failed to create webhook: ${err.message}`);
    throw err;
  }
}

async function updateConfigFile(productId, priceId, webhookSecret) {
  header('Updating Configuration');
  
  const fs = require('fs');
  const path = require('path');
  
  const configPath = path.join(__dirname, '..', 'stripe', 'products.json');
  
  try {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    
    config.trial_product.id = productId;
    config.trial_price.id = priceId;
    if (webhookSecret) {
      config.webhook_secret = webhookSecret;
    }
    
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    success(`Configuration saved to stripe/products.json`);
  } catch (err) {
    error(`Failed to update configuration: ${err.message}`);
    // Don't throw, this is not critical
  }
}

function showNextSteps(webhookSecret) {
  header('Next Steps');
  
  console.log('1. Save the webhook secret:');
  if (webhookSecret) {
    log(`   export STRIPE_WEBHOOK_SECRET=${webhookSecret}`, 'yellow');
  }
  log(`   wrangler secret put STRIPE_WEBHOOK_SECRET`, 'yellow');
  
  console.log('\n2. Update your environment variables:');
  log(`   APP_URL=${APP_URL}`, 'yellow');
  
  if (ENV === '--local') {
    console.log('\n3. For local development, use Stripe CLI to forward webhooks:');
    log(`   stripe login`, 'yellow');
    log(`   stripe listen --forward-to localhost:8787/api/stripe/webhook`, 'yellow');
  }
  
  console.log('\n4. Test the checkout flow:');
  log(`   npm run dev`, 'yellow');
  log(`   Open http://localhost:8787 and try the checkout`, 'yellow');
  
  console.log('');
  log('✨ Stripe setup complete!', 'green');
}

async function main() {
  if (ENV === '--help' || ENV === '-h') {
    console.log(`
Usage: node scripts/setup-stripe.js [--local|--production]

Options:
  --local       Setup for local development (default)
  --production  Setup for production environment

Environment variables:
  STRIPE_SECRET_KEY    Required - Your Stripe secret key
  APP_URL              Required for production - Your app URL

Examples:
  # Local development
  export STRIPE_SECRET_KEY=sk_test_...
  node scripts/setup-stripe.js --local

  # Production
  export STRIPE_SECRET_KEY=sk_live_...
  export APP_URL=https://copycat-ai.example.com
  node scripts/setup-stripe.js --production
`);
    process.exit(0);
  }

  if (ENV !== '--local' && ENV !== '--production') {
    error(`Unknown environment: ${ENV}`);
    info('Use --local or --production');
    process.exit(1);
  }

  header(`Stripe Setup - ${ENV === '--local' ? 'Local Development' : 'Production'}`);

  const stripe = await validateEnvironment();
  
  try {
    const product = await createProduct(stripe);
    const price = await createPrice(stripe, product.id);
    const webhook = await createWebhook(stripe);
    
    await updateConfigFile(product.id, price.id, webhook.secret);
    
    showNextSteps(webhook.secret);
  } catch (err) {
    error('Setup failed');
    console.error(err);
    process.exit(1);
  }
}

main();
