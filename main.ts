// REDEVI Blockchain Server - Final Fixed Version

const accounts: Record<string, number> = {
  "0x8dc7df6a8d7cae52a590a2ddf75e9be38d4453": 1000000000,
  "0xab8483f64d9c6d1ecf9b849ae677dd3315835cb": 0,
  "0x4b20993bc481177ec7e8f571cecae8a9e22c02db": 0,
};

let blockNumber = 1;

async function handleRPC(req: Request): Promise<Response> {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers });
  }

  if (req.method === "GET") {
    return new Response(
      JSON.stringify({
        network: "Wireless Solution Redevi",
        symbol: "REDEVI",
        chainId: 9983,
        blockNumber: blockNumber,
        status: "Online",
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
        result = "0x26FF";
        break;
      case "net_version":
        result = "9983";
        break;
      case "eth_blockNumber":
        result = `0x${blockNumber.toString(16)}`;
        break;
      case "eth_getBalance": {
        const addr = params[0]?.toLowerCase();
        const bal = accounts[addr] || 0;
        result = `0x${BigInt(Math.floor(bal * 1e18)).toString(16)}`;
        break;
      }
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
          const txHash = `0x${crypto.randomUUID().replace(/-/g, "")}`;
          result = txHash;
        } else {
          return new Response(
            JSON.stringify({
              jsonrpc: "2.0", id,
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
  } catch (_e) {
    return new Response(
      JSON.stringify({
        jsonrpc: "2.0",
        error: { code: -32700, message: "Parse error" },
      }),
      { headers }
    );
  }
}

// ✅ FIXED: Koi Port Nahi - Deno Khud Handle Karta Hai
Deno.serve(handleRPC);
