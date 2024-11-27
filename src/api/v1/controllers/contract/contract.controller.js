const { RpcProvider, Contract, Account, cairo } = require("starknet");
const ABI = require("../../database/config/ABI.json");

const get_contract_instance = () => {
  const RPC_URL = process.env.RPC_URL;
  const PRIVATE_KEY = process.env.PRIVATE_KEY;
  const ACCOUNT_ADDRESS = process.env.ACCOUNT_ADDRESS;

  const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

  const provider = new RpcProvider({ nodeUrl: `${RPC_URL}` });
  const account = new Account(provider, ACCOUNT_ADDRESS, PRIVATE_KEY);
  const contract = new Contract(ABI, CONTRACT_ADDRESS, provider);
  // Connect account with the contract
  contract.connect(account);
  return contract;
};

const mint_token = async (address, amount) => {
  try {
    const contract = get_contract_instance();
    if (!contract) {
      throw new Error("Contract instance not set");
    }
    const tx = await contract.mint(address, cairo.uint256(amount));
    return { success: true, tx };
  } catch (error) {
    console.log(error);
    return { success: false, tx: {} };
  }
};

module.exports = {
  mint_token,
};
