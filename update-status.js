import { Client, GatewayIntentBits } from 'discord.js';
import fetch from 'node-fetch';

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const token = process.env.DISCORD_TOKEN;

async function fetchPrices() {
  // Fetch SHDW price from CoinGecko
  const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=genesysgo-shadow&vs_currencies=usd');
  if (!res.ok) throw new Error(`CoinGecko API error: ${res.statusText}`);
  const data = await res.json();
  const priceUsd = Number(data["genesysgo-shadow"]?.usd);
  if (isNaN(priceUsd)) throw new Error('Invalid SHDW price');

  // Fetch exchange rate USD to GBP
  const exchangeRes = await fetch('https://open.er-api.com/v6/latest/USD');
  if (!exchangeRes.ok) throw new Error(`Exchange API error: ${exchangeRes.statusText}`);
  const exchangeData = await exchangeRes.json();
  const gbpRate = exchangeData.rates?.GBP;
  if (!gbpRate) throw new Error('GBP rate missing');

  return { usd: priceUsd.toFixed(4), gbp: (priceUsd * gbpRate).toFixed(4) };
}

async function updateStatus() {
  try {
    const prices = await fetchPrices();
    const status = `SHDW Price: USD $${prices.usd} | GBP £${prices.gbp}`;
    await client.user.setActivity(status, { type: 'WATCHING' });
    console.log(`Status updated: ${status}`);
  } catch (e) {
    console.error('Failed to update status:', e);
  }
}

client.once('ready', async () => {
  console.log(`Logged in as ${client.user.tag}`);
  await updateStatus();
  await client.destroy();  // disconnect so process can exit
  process.exit(0);
});

client.login(token);
