// REDEVI Blockchain Server - Deno Compatible
import { serve } from "https://deno.land/std@0.208.0/http/server.ts";

const PORT = parseInt(Deno.env.get("PORT") || "8000");

// Accounts (Test Wallets)
const accounts: Record<string, number> = {
  "0x8Dc7dF6a8D7CAE52a590a2dDf75e9Be38D4453": 1000000000,
  "0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb": 0,
  "0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db": 0,
};

// Transactions List
const transactions: object[] = [];
let blockNumber = 1;

// RPC Handler
async function handleRPC(req: Request): Promise<Response> {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { headers });
  }

  if (req.method === "GET") {
    return new Response(
      JSON.stringify({
        network: "Wireless Solution Redevi",
        symbol: "REDEVI",
        chainId: 9983,
        blockNumber: blockNumber,
        status: "✅ Online",
        rpcUrl: "https://redevi-blockchain.deno.dev",
      }),
      { headers }
    );
  }

  try {
    const body = await req.json();
    const { method, params, id } = body;

    let result: unknown = null;

    switch (method) {
      case "eth_chainId":
        result = "0x26FF"; // 9983 in hex
        break;

      case "net_version":
        result = "9983";
        break;

      case "eth_blockNumber":
        result = `0x${blockNumber.toString(16)}`;
        break;

      case "eth_getBalance":
        const addr = params[0]?.toLowerCase();
        const balance = accounts[addr] || 0;
        result = `0x${(balance * 1e18).toString(16)}`;
        break;

      case "eth_accounts":
        result = Object.keys(accounts);
        break;

      case "eth_sendTransaction": {
        const tx = params[0];
        const from = tx.from?.toLowerCase();
        const to = tx.to?.toLowerCase();
        const value = parseInt(tx.value || "0x0", 16) / 1e18;

        if (accounts[from] !== undefined && accounts[from] >= value) {
          accounts[from] -= value;
          accounts[to] = (accounts[to] || 0) + value;
          blockNumber++;

          const txHash = `0x${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`;
          transactions.push({ hash: txHash, from, to, value });
          result = txHash;
        } else {
          return new Response(
            JSON.stringify({
              jsonrpc: "2.0",
              id,
              error: { code: -32000, message: "Kam balance hai!" },
            }),
            { headers }
          );
        }
        break;
      }

      case "eth_getTransactionCount":
        result = "0x1";
        break;

      case "eth_gasPrice":
        result = "0x3B9ACA00";
        break;

      case "eth_estimateGas":
        result = "0x5208";
        break;

      default:
        result = null;
    }

    return new Response(
      JSON.stringify({ jsonrpc: "2.0", id, result }),
      { headers }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({
        jsonrpc: "2.0",
        error: { code: -32700, message: "Parse error" },
      }),
      { headers }
    );
  }
}

console.log(`
╔═══════════════════════════════════════╗
║     REDEVI Blockchain Network         ║
╠═══════════════════════════════════════╣
║  ✅ Server Chal Raha Hai!             ║
║  🌐 Chain ID:  9983                   ║
║  💰 Symbol:    REDEVI                 ║
║  📡 Port:      ${PORT}                    ║
╚═══════════════════════════════════════╝

MetaMask Mein Add Karo:
- Network Name: REDEVI Network  
- Chain ID: 9983
- Symbol: REDEVI
`);

serve(handleRPC, { port: PORT });
