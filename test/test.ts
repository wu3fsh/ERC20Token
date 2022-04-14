import { ethers } from "hardhat";
import { Contract, ContractFactory, Signer } from "ethers";
import { expect } from "chai";

describe("Token", function () {
  const name: string = "Test Coin";
  const symbol: string = "Test Coin";
  const decimals: number = 2;
  const totalSupply: number = 100;
  let owner: Signer;
  let addresses: Signer[];
  let factory: ContractFactory;
  let token: Contract;

  beforeEach(async function () {
    [owner, ...addresses] = await ethers.getSigners();
    factory = await ethers.getContractFactory('ERC20Token');
    token = await factory.deploy(name, symbol, decimals, totalSupply);
  });

  it("should get expected info", async function () {
    const totalSupplyWithDecimals: number = totalSupply * (10 ** decimals);
    expect(await token.name()).to.equal(name);
    expect(await token.symbol()).to.equal(symbol);
    expect(await token.decimals()).to.equal(decimals);
    expect(await token.totalSupply()).to.equal(totalSupplyWithDecimals);
    expect(await token.balanceOf(owner.getAddress())).to.equal(totalSupplyWithDecimals);
  });

  it("should transfer tokens", async function () {
    const amount: number = 100;
    expect(await token.balanceOf(owner.getAddress())).to.equal(totalSupply * (10 ** decimals));
    await token.transfer(addresses[1].getAddress(), amount);
    expect(await token.balanceOf(owner.getAddress())).to.equal(totalSupply * (10 ** decimals) - amount);
    expect(await token.balanceOf(addresses[1].getAddress())).to.equal(amount);
  });

  it("Should throw an exception if account doesn't have enough money to transfer", async function () {
    try {
      expect(
        await token.transfer(addresses[1].getAddress(), totalSupply * (10 ** decimals) + 1)
      ).to.throw();
    } catch (error: unknown) {
      expect(error instanceof Error ? error.message : "").to.have.string("Account doesn't have enough money to transfer");
    }
  });

  it("should approve an address and amount of tokens to transferFrom", async function () {
    const amount: number = 10;
    await token.approve(addresses[1].getAddress(), amount);
    expect(await token.allowance(owner.getAddress(), addresses[1].getAddress())).to.equal(amount);
  });

  it("should transferFrom one address to another", async function () {
    const amount: number = 10;
    const to: string = await addresses[1].getAddress();
    const from: string = await owner.getAddress();

    await token.approve(to, amount);

    expect(await token.allowance(from, to)).to.equal(amount);
    expect(await token.balanceOf(from)).to.equal(totalSupply * (10 ** decimals));

    await token.connect(addresses[1]).transferFrom(from, to, amount);

    expect(await token.allowance(from, to)).to.equal(0);
    expect(await token.balanceOf(from)).to.equal(totalSupply * (10 ** decimals) - amount);
    expect(await token.balanceOf(to)).to.equal(amount);
  });

  it("Should throw an exception if account doesn't have enough money to transfer", async function () {
    try {
      const amount: number = 10;
      const to: string = await addresses[1].getAddress();
      const from: string = await owner.getAddress();
      await token.approve(to, amount);
      expect(await token.allowance(from, to)).to.equal(amount);
      expect(await token.connect(addresses[1]).transferFrom(from, to, totalSupply * (10 ** decimals) + 1)
      ).to.throw();
    } catch (error: unknown) {
      expect(error instanceof Error ? error.message : "").to.have.string("Account doesn't have enough money to transfer");
    }
  });

  it("Should throw an exception if money transfer limit exceeded", async function () {
    try {
      const amount: number = 10;
      const to: string = await addresses[1].getAddress();
      const from: string = await owner.getAddress();
      await token.approve(to, amount);
      expect(await token.allowance(from, to)).to.equal(amount);
      expect(await token.connect(addresses[1]).transferFrom(from, to, amount));
      expect(await token.connect(addresses[1]).transferFrom(from, to, 1)
      ).to.throw();
    } catch (error: unknown) {
      expect(error instanceof Error ? error.message : "").to.have.string("Money transfer limit exceeded");
    }
  });

  it("Should throw an exception if account doesn't have enough money to burn", async function () {
    try {
      const amount: number = 10;
      const from: string = await addresses[1].getAddress();
      expect(await token.burn(from, amount)
      ).to.throw();
    } catch (error: unknown) {
      expect(error instanceof Error ? error.message : "").to.have.string("Account doesn't have enough money to burn");
    }
  });

  it("Should throw an exception if a non-owner address tries to burn tokens", async function () {
    try {
      const amount: number = 10;
      const from: string = await addresses[1].getAddress();
      expect(await token.connect(addresses[1]).burn(from, amount)
      ).to.throw();
    } catch (error: unknown) {
      expect(error instanceof Error ? error.message : "").to.have.string("Only the owner of the contract can perform this operation");
    }
  });

  it("should burn tokens", async function () {
    const amount: number = 10;
    const from: string = await owner.getAddress();
    expect(await token.balanceOf(from)).to.equal(totalSupply * (10 ** decimals));
    expect(await token.burn(from, amount));
    expect(await token.balanceOf(from)).to.equal(totalSupply * (10 ** decimals) - amount);
    expect(await token.totalSupply()).to.equal(totalSupply * (10 ** decimals) - amount);
  });

  it("should mint tokens", async function () {
    const amount: number = 10;
    const from: string = await owner.getAddress();
    expect(await token.balanceOf(from)).to.equal(totalSupply * (10 ** decimals));
    expect(await token.mint(from, amount));
    expect(await token.balanceOf(from)).to.equal(totalSupply * (10 ** decimals) + amount);
    expect(await token.totalSupply()).to.equal(totalSupply * (10 ** decimals) + amount);
  });

  it("Should throw an exception if a non-owner address tries to mint tokens", async function () {
    try {
      const amount: number = 10;
      const from: string = await addresses[1].getAddress();
      expect(await token.connect(addresses[1]).mint(from, amount)
      ).to.throw();
    } catch (error: unknown) {
      expect(error instanceof Error ? error.message : "").to.have.string("Only the owner of the contract can perform this operation");
    }
  });
});