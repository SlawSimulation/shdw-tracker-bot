import { Client, GatewayIntentBits } from 'discord.js';
import fetch from 'node-fetch';

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

const token = process.env.DISCORD_TOKEN;
const apiKey = process.env.API_KEY;

async function fetchPrices() {
  const response = await fetch('https://api.api-ninjas.com/v1/cryptoprice?symbol=DOGEUSD', {
    headers: { 'X-Api-Key': apiKey },
  });

  if (!response.ok) {
    throw new Error(`Crypto API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  console.log('✅ Doge price API response:', data);

  if (!data.price) throw new Error('Price field missing from crypto API response');

  const priceUsd = Number(data.price);
  if (isNaN(priceUsd)) throw new Error('Price is not a valid number');

  const exchangeResponse = await fetch('https://open.er-api.com/v6/latest/USD');
  if (!exchangeResponse.ok) {
    throw new Error(`Exchange rate API error: ${exchangeResponse.status} ${exchangeResponse.statusText}`);
  }

  const exchangeData = await exchangeResponse.json();
  console.log('✅ Exchange rate API response:', exchangeData);

  const usdToGbpRate = exchangeData.rates?.GBP;
  if (!usdToGbpRate) throw new Error('GBP rate not found in exchange rate API response');

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
    console.log(`✅ Status updated: ${statusMessage}`);
  } catch (error) {
    console.error('❌ Error updating status:', error.message);
  }
}

client.once('ready', () => {
  console.log(`🤖 Logged in as ${client.user.tag}`);

  updateStatus(); // Initial update
  setInterval(updateStatus, 15 * 60 * 1000); // Update every 15 minutes
});

client.login(token);

// Optional debug logs
client.on('error', console.error);
client.on('warn', console.warn);
