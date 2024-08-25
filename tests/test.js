const { expect } = require("chai");
const { ethers } = require("hardhat");
const { CCIPLocalSimulator } = require("@chainlink/local");

describe("CrossChainNameService Test", function () {
  let ccipLocalSimulator;
  let routerAddress;
  let CrossChainNameServiceRegister;
  let CrossChainNameServiceReceiver;
  let CrossChainNameServiceLookup;
  let registerContract;
  let receiverContract;
  let lookupContract;
  let aliceEOA;
  let deployer;

  before(async function () {
    // Initialize the Chainlink Local Simulator
    ccipLocalSimulator = await CCIPLocalSimulator.create();
    await ccipLocalSimulator.start();

    // Get Router contract address
    const [deployerAddress] = await ethers.getSigners();
    deployer = deployerAddress;
    const CCIPLocalSimulatorContract = await ethers.getContractFactory("CCIPLocalSimulator");
    const ccipLocalSimulatorInstance = await CCIPLocalSimulatorContract.deploy();
    await ccipLocalSimulatorInstance.deployed();
    routerAddress = await ccipLocalSimulatorInstance.configuration();

    // Deploy CrossChainNameService contracts
    CrossChainNameServiceRegister = await ethers.getContractFactory("CrossChainNameServiceRegister");
    CrossChainNameServiceReceiver = await ethers.getContractFactory("CrossChainNameServiceReceiver");
    CrossChainNameServiceLookup = await ethers.getContractFactory("CrossChainNameServiceLookup");

    registerContract = await CrossChainNameServiceRegister.deploy(routerAddress);
    receiverContract = await CrossChainNameServiceReceiver.deploy(routerAddress);
    lookupContract = await CrossChainNameServiceLookup.deploy(routerAddress);

    await registerContract.deployed();
    await receiverContract.deployed();
    await lookupContract.deployed();

    // Enable chains if needed
    await registerContract.enableChain(1); // Enable chain ID 1 (Ethereum Mainnet as an example)
    await receiverContract.enableChain(1);
    await lookupContract.enableChain(1);

    // Define Alice's EOA address
    aliceEOA = "0x1234567890123456789012345678901234567890";
  });

  it("should register and lookup a name", async function () {
    // Register the name
    const name = "alice.ccns";
    await registerContract.register(name, aliceEOA);

    // Lookup the name
    const registeredAddress = await lookupContract.lookup(name);

    // Assert that the registered address matches Alice's EOA address
    expect(registeredAddress).to.equal(aliceEOA);
  });

  after(async function () {
    // Stop the Chainlink Local Simulator
    await ccipLocalSimulator.stop();
  });