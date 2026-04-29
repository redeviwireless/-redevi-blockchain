// REDEVI Blockchain Server - Complete Fixed Version
// Network: Wireless Solution Redevi | Chain ID: 9983 | Symbol: REDEVI

const CHAIN_ID = 9983;
const CHAIN_ID_HEX = "0x" + CHAIN_ID.toString(16);

// ====================================
// ACCOUNTS - Wei mein balance (1 REDEVI = 1e18 wei)
// ====================================
const accounts: Record<string, bigint> = {
  "0x865497c63f1fc73e114d119c138d0f593216f318": BigInt("1000000000000000000000"), // 1000 REDEVI
  "0x6a30bda921b36e8f8104209e9577daa1a8bbf721": BigInt("1000000000000000000000"), // 1000 REDEVI
  "0xc6b00958e5fb2c525619fbf13b5da2c520bc4c2f": BigInt("1000000000000000000000"), // 1000 REDEVI
  "0x08ff2e83f5e9bb4b7aa4239fd09ac173fbb81b91": BigInt("1000000000000000000000"), // 1000 REDEVI
  "0x474de33adb9cb7627f9ba4fcce0070f4bde77acd": BigInt("1000000000000000000000"), // 1000 REDEVI
  "0xf1bdbac914d7db25327a159258469ebbd102dc7c": BigInt("1000000000000000000000"), // 1000 REDEVI
  "0xe4978c39cd8f9e6a695caca16ff6ce89e32e80b7": BigInt("1000000000000000000000"), // 1000 REDEVI
  "0x220a27c654e67998b56beb7535e92ba1a4a28724": BigInt("1000000000000000000000"), // 1000 REDEVI
  "0x9adce2da70dbd316e70038b223fe443784261c43": BigInt("1000000000000000000000"), // 1000 REDEVI
  "0xc4b182118ba2dff4d1040258fc3a90da91d27832": BigInt("1000000000000000000000"), // 1000 REDEVI
};

const nonces: Record<string, number> = {};
const transactions: Record<string, object> = {};
const contracts: Record<string, string> = {};
let blockNumber = 100;

// ====================================
// HELPER FUNCTIONS
// ====================================
function randomHash(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return "0x" + Array.from(bytes).map(b => b.toString(16).padStart(2, "0")).join("");
}

function makeBlock() {
  return {
    number: `0x${blockNumber.toString(16)}`,
    hash: randomHash(),
    parentHash: randomHash(),
    nonce: "0x0000000000000000",
    sha3Uncles: "0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347",
    logsBloom: "0x" + "0".repeat(512),
    transactionsRoot: randomHash(),
    stateRoot: randomHash(),
    receiptsRoot: randomHash(),
    miner: "0x865497c63f1fc73e114d119c138d0f593216f318",
    difficulty: "0x1",
    totalDifficulty: "0x1",
    extraData: "0x52656465766920426c6f636b636861696e",
    size: "0x1000",
    gasLimit: "0x1c9c380",
    gasUsed: "0x5208",
    timestamp: `0x${Math.floor(Date.now() / 1000).toString(16)}`,
    transactions: [],
    uncles: [],
    baseFeePerGas: "0x3b9aca00",
  };
}

// ====================================
// PROCESS RPC REQUEST
// ====================================
async function processRequest(body: {
  method: string;
  params?: unknown[];
  id?: unknown;
}): Promise<object> {
  const { method, params = [], id } = body;
  const ok = (result: unknown) => ({ jsonrpc: "2.0", id, result });
  const fail = (code: number, msg: string) => ({
    jsonrpc: "2.0", id,
    error: { code, message: msg }
  });

  console.log(`→ ${method}`);

  switch (method) {

    // ===== NETWORK =====
    case "eth_chainId": return ok(CHAIN_ID_HEX);
    case "net_version": return ok(String(CHAIN_ID));
    case "net_listening": return ok(true);
    case "net_peerCount": return ok("0x1");
    case "web3_clientVersion": return ok("RedeviBlockchain/1.0.0/Deno");
    case "eth_protocolVersion": return ok("0x41");
    case "eth_syncing": return ok(false);
    case "eth_mining": return ok(true);
    case "eth_hashrate": return ok("0x1");
    case "eth_coinbase": return ok("0x865497c63f1fc73e114d119c138d0f593216f318");

    // ===== BLOCKS =====
    case "eth_blockNumber":
      return ok(`0x${blockNumber.toString(16)}`);

    case "eth_getBlockByNumber":
    case "eth_getBlockByHash":
      return ok(makeBlock());

    case "eth_getUncleByBlockHashAndIndex":
    case "eth_getUncleByBlockNumberAndIndex":
      return ok(null);

    case "eth_getUncleCountByBlockHash":
    case "eth_getUncleCountByBlockNumber":
      return ok("0x0");

    case "eth_getBlockTransactionCountByHash":
    case "eth_getBlockTransactionCountByNumber":
      return ok("0x0");

    // ===== ACCOUNTS =====
    case "eth_accounts":
    case "eth_requestAccounts":
      return ok(Object.keys(accounts));

    case "eth_getBalance": {
      const addr = (params[0] as string)?.toLowerCase?.() ?? "";
      const bal = accounts[addr] ?? 0n;
      return ok("0x" + bal.toString(16));
    }

    case "eth_getTransactionCount": {
      const addr = (params[0] as string)?.toLowerCase?.() ?? "";
      return ok("0x" + (nonces[addr] ?? 0).toString(16));
    }

    // ===== GAS =====
    case "eth_gasPrice": return ok("0x3B9ACA00");
    case "eth_maxPriorityFeePerGas": return ok("0x3B9ACA00");
    case "eth_estimateGas": return ok("0x30D40"); // 200000
    case "eth_feeHistory":
      return ok({
        oldestBlock: `0x${blockNumber.toString(16)}`,
        baseFeePerGas: ["0x3B9ACA00", "0x3B9ACA00"],
        gasUsedRatio: [0.5],
        reward: [["0x3B9ACA00"]],
      });

    // ===== TRANSACTIONS =====
    case "eth_sendTransaction": {
      const tx = params[0] as Record<string, string>;
      const from = tx.from?.toLowerCase?.() ?? "";
      const to = tx.to?.toLowerCase?.() ?? "";
      const value = BigInt(tx.value ?? "0x0");
      const data = tx.data ?? "0x";

      // Balance check
      const fromBal = accounts[from] ?? 0n;
      if (fromBal < value) {
        return fail(-32000, "Insufficient funds - Kam balance hai!");
      }

      // Deduct value
      if (value > 0n) {
        accounts[from] = fromBal - value;
        accounts[to] = (accounts[to] ?? 0n) + value;
      }

      // Contract deploy (to is empty)
      let contractAddr = null;
      if (!tx.to && data !== "0x") {
        contractAddr = "0x" + randomHash().slice(2, 42);
        contracts[contractAddr] = data;
        accounts[contractAddr] = 0n;
      }

      nonces[from] = (nonces[from] ?? 0) + 1;
      blockNumber++;

      const txHash = randomHash();
      transactions[txHash] = {
        hash: txHash,
        blockHash: randomHash(),
        blockNumber: `0x${blockNumber.toString(16)}`,
        transactionIndex: "0x0",
        from,
        to: contractAddr ?? to,
        value: "0x" + value.toString(16),
        gas: "0x30D40",
        gasPrice: "0x3B9ACA00",
        input: data,
        nonce: "0x" + (nonces[from] - 1).toString(16),
        contractAddress: contractAddr,
      };

      return ok(txHash);
    }

    case "eth_sendRawTransaction": {
      blockNumber++;
      const txHash = randomHash();
      transactions[txHash] = {
        hash: txHash,
        blockNumber: `0x${blockNumber.toString(16)}`,
        from: Object.keys(accounts)[0],
        to: null,
        value: "0x0",
        contractAddress: "0x" + randomHash().slice(2, 42),
      };
      return ok(txHash);
    }

    case "eth_getTransactionByHash": {
      const hash = params[0] as string;
      return ok(transactions[hash] ?? {
        hash,
        blockHash: randomHash(),
        blockNumber: `0x${blockNumber.toString(16)}`,
        transactionIndex: "0x0",
        from: Object.keys(accounts)[0],
        to: null,
        value: "0x0",
        gas: "0x30D40",
        gasPrice: "0x3B9ACA00",
        input: "0x",
        nonce: "0x0",
      });
    }

    case "eth_getTransactionReceipt": {
      const hash = params[0] as string;
      const tx = transactions[hash] as Record<string, unknown> | undefined;
      const contractAddress = tx?.contractAddress as string ?? null;
      return ok({
        transactionHash: hash,
        transactionIndex: "0x0",
        blockHash: randomHash(),
        blockNumber: `0x${blockNumber.toString(16)}`,
        from: tx?.from ?? Object.keys(accounts)[0],
        to: tx?.to ?? null,
        cumulativeGasUsed: "0x30D40",
        gasUsed: "0x30D40",
        contractAddress,
        logs: [],
        logsBloom: "0x" + "0".repeat(512),
        status: "0x1",
        effectiveGasPrice: "0x3B9ACA00",
        type: "0x0",
      });
    }

    // ===== CONTRACT =====
    case "eth_call": {
      return ok("0x");
    }

    case "eth_getCode": {
      const addr = (params[0] as string)?.toLowerCase?.() ?? "";
      return ok(contracts[addr] ?? "0x");
    }

    case "eth_getStorageAt":
      return ok("0x" + "0".repeat(64));

    // ===== LOGS =====
    case "eth_getLogs":
    case "eth_getFilterLogs":
    case "eth_getFilterChanges":
      return ok([]);

    case "eth_newFilter":
    case "eth_newBlockFilter":
    case "eth_newPendingTransactionFilter":
      return ok("0x1");

    case "eth_uninstallFilter":
      return ok(true);

    // ===== SIGN =====
    case "eth_sign":
    case "personal_sign":
    case "eth_signTypedData":
    case "eth_signTypedData_v4":
      return ok("0x" + "a".repeat(130));

    // ===== MISC =====
    case "eth_subscribe": return ok("0x1");
    case "eth_unsubscribe": return ok(true);

    default:
      console.log(`⚠️ Unknown method: ${method}`);
      return ok(null);
  }
}

// ====================================
// MAIN HANDLER
// ====================================
async function handleRPC(req: Request): Promise<Response> {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "*",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers });
  }

  if (req.method === "GET") {
    return new Response(JSON.stringify({
      network: "Wireless Solution Redevi",
      symbol: "REDEVI",
      chainId: CHAIN_ID,
      chainIdHex: CHAIN_ID_HEX,
      rpcUrl: "https://redevi-blockchain-k9amjefchx6v.redeviwireless.deno.net/",
      blockNumber,
      status: "🟢 Online",
      totalAccounts: Object.keys(accounts).length,
      metamask: {
        networkName: "Wireless Solution Redevi",
        rpcUrl: "https://redevi-blockchain-k9amjefchx6v.redeviwireless.deno.net/",
        chainId: 9983,
        symbol: "REDEVI",
      }
    }, null, 2), { headers });
  }

  try {
    const body = await req.json();

    // Batch support
    if (Array.isArray(body)) {
      const results = await Promise.all(body.map(r => processRequest(r)));
      return new Response(JSON.stringify(results), { headers });
    }

    const result = await processRequest(body);
    return new Response(JSON.stringify(result), { headers });

  } catch (e) {
    console.error("Handler error:", e);
    return new Response(JSON.stringify({
      jsonrpc: "2.0",
      id: null,
      error: { code: -32700, message: "Parse error" },
    }), { headers });
  }
}

console.log("🚀 WIRELESS SOLUTION REDEVI BLOCKCHAIN LIVE!");
console.log("📡 Chain ID: 9983 | Symbol: REDEVI");

Deno.serve(handleRPC);
