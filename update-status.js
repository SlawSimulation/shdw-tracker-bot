import { Client, GatewayIntentBits } from 'discord.js';
import fetch from 'node-fetch';

// Create the Discord client
const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

// Environment variables
const token = process.env.DISCORD_TOKEN;
const apiKey = process.env.API_KEY;

async function fetchPrices() {
  // Fetch DOGE price in USD
  const response = await fetch('https://api.api-ninjas.com/v1/cryptoprice?symbol=DOGEUSD', {
    headers: { 'X-Api-Key': apiKey },
  });

  if (!response.ok) {
    throw new Error(`Crypto API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  console.log('✅ Doge price API response:', data);

  if (!data.price) {
    throw new Error('Price field missing from crypto API response');
  }

  const priceUsd = Number(data.price);
  if (isNaN(priceUsd)) {
    throw new Error('Price is not a valid number');
  }

  // Fetch exchange rates to convert USD → GBP
  const exchangeResponse = await fetch('https://open.er-api.com/v6/latest/USD');
  if (!exchangeResponse.ok) {
    throw new Error(`Exchange rate API error: ${exchangeResponse.status} ${exchangeResponse.statusText}`);
  }

  const exchangeData = await exchangeResponse.json();
  console.log('✅ Exchange rate API response:', exchangeData);

  const usdToGbpRate = exchangeData.rates?.GBP;
  if (!usdToGbpRate) {
    throw new Error('GBP rate not found in exchange rate API response');
  }

  const priceGbp = priceUsd * usdToGbpRate;

  return {
    usd: priceUsd.toFixed(4),
    gbp: priceGbp.toFixed(4),
  };
}

async function updateStatus() {
  try {
    const prices = await fetchPrices();
    const statusMessage = `Dogecoin Price: USD $${prices.usd} | GBP £${prices.gbp}`;

    await client.user.setActivity(statusMessage, { type: 'WATCHING' });
    console.log(`✅ Status set to: ${statusMessage}`);
  } catch (err) {
    console.error('❌ Error updating status:', err.message);
  } finally {
    // Exit the bot cleanly
    await client.destroy();
  }
}

client.once('ready', () => {
  console.log(`🤖 Logged in as ${client.user.tag}`);
  updateStatus();
});

client.login(token);

// Optional: debug output
client.on('error', console.error);
client.on('warn', console.warn);
