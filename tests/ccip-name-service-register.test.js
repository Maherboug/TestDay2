const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CrossChainNameServiceRegister Test", function () {
  let ccipLocalSimulator;
  let routerAddress;
  let CrossChainNameServiceRegister;
  let CrossChainNameServiceReceiver;
  let CrossChainNameServiceLookup;
  let registerContract;
  let receiverContract;
  let lookupContract;
  let deployer;
  let aliceEOA;

  before(async function () {
    [deployer, aliceEOA] = await ethers.getSigners();

    // Deploy CCIPLocalSimulator contract
    const CCIPLocalSimulator = await ethers.getContractFactory("CCIPLocalSimulator");
    ccipLocalSimulator = await CCIPLocalSimulator.deploy();
    await ccipLocalSimulator.deployed();

    // Get Router contract address
    routerAddress = await ccipLocalSimulator.configuration();

    // Deploy CrossChainNameService contracts
    const CrossChainNameServiceRegister = await ethers.getContractFactory("CrossChainNameServiceRegister");
    const CrossChainNameServiceReceiver = await ethers.getContractFactory("CrossChainNameServiceReceiver");
    const CrossChainNameServiceLookup = await ethers.getContractFactory("CrossChainNameServiceLookup");

    registerContract = await CrossChainNameServiceRegister.deploy(routerAddress, receiverAddress);
    receiverContract = await CrossChainNameServiceReceiver.deploy(routerAddress);
    lookupContract = await CrossChainNameServiceLookup.deploy(routerAddress);

    await registerContract.deployed();
    await receiverContract.deployed();
    await lookupContract.deployed();

    // Enable chains
    await registerContract.enableChain(1, receiverContract.address, 1000000); // Example chain selector and gas limit
    await receiverContract.enableChain(1);
    await lookupContract.enableChain(1);
  });

  it("should register and lookup a name", async function () {
    const name = "alice.ccns";
    await registerContract.register(name);

    const registeredAddress = await lookupContract.lookup(name);
    expect(registeredAddress).to.equal(aliceEOA.address);
  });

  after(async function () {
    // Cleanup if necessary
  });
});
