const { RpcProvider, Contract, Account, cairo } = require("starknet");
const ERC20_ABI = require("../../database/config/ERC20_ABI.json");
const COITON_ABI = require("../../database/config/COITON_ABI.json");

const get_erc20_contract_instance = () => {
  const RPC_URL = process.env.RPC_URL;
  const PRIVATE_KEY = process.env.PRIVATE_KEY;
  const ACCOUNT_ADDRESS = process.env.ACCOUNT_ADDRESS;

  const CONTRACT_ADDRESS = process.env.ERC20_CONTRACT_ADDRESS;

  const provider = new RpcProvider({ nodeUrl: `${RPC_URL}` });
  const account = new Account(provider, ACCOUNT_ADDRESS, PRIVATE_KEY);
  const contract = new Contract(ERC20_ABI, CONTRACT_ADDRESS, provider);
  // Connect account with the contract
  contract.connect(account);
  return contract;
};

const get_coiton_contract_instance = () => {
  const RPC_URL = process.env.RPC_URL;
  const PRIVATE_KEY = process.env.PRIVATE_KEY;
  const ACCOUNT_ADDRESS = process.env.ACCOUNT_ADDRESS;

  const CONTRACT_ADDRESS = process.env.COITON_CONTRACT_ADDRESS;

  const provider = new RpcProvider({ nodeUrl: `${RPC_URL}` });
  const account = new Account(provider, ACCOUNT_ADDRESS, PRIVATE_KEY);
  const contract = new Contract(COITON_ABI, CONTRACT_ADDRESS, provider);
  // Connect account with the contract
  contract.connect(account);
  return contract;
};

const mint_token = async (address, amount) => {
  try {
    const contract = get_erc20_contract_instance();
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

const store_real_estate_index = async (data) => {
  try {
    const contract = get_coiton_contract_instance();
    if (!contract) {
      throw new Error("Contract instance not set");
    }
    const tx = await contract.store_realestate_index(data);
    return { success: true, tx };
  } catch (error) {
    console.log(error);
    return { success: false, tx: {} };
  }
};

const get_proposal_initiator = async (address) => {
  try {
    const contract = get_coiton_contract_instance();
    if (!contract) {
      throw new Error("Contract instance not set");
    }
    const response = await contract.get_user(address);
    return { success: true, response };
  } catch (error) {
    console.log(error);
    return { success: false, response: {} };
  }
};

const get_dao_members = async () => {
  try {
    const contract = get_coiton_contract_instance();
    if (!contract) {
      throw new Error("Contract instance not set");
    }
    const response = await contract.get_dao_members();
    return { success: true, response };
  } catch (error) {
    console.log(error);
    return { success: false, response: {} };
  }
};

module.exports = {
  mint_token,
  get_proposal_initiator,
  get_dao_members,
  store_real_estate_index,
};
