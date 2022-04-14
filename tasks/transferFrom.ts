import { task } from "hardhat/config";

task("transfer-from", "Transfer tokens from one address to another")
  .addParam('from', "The address from which we will transfer tokens")
  .addParam('to', "The address to which we will transfer tokens")
  .addParam('value', "Tokens amount")
  .setAction(async (taskArgs, hre) => {
    const contract = await hre.ethers.getContractFactory('ERC20Token');
    const token = contract.attach(process.env.ERC20_TOKEN_ADDRESS!);
    const accounts = await hre.ethers.getSigners();
    await token.connect(accounts[1]).transferFrom(taskArgs.from, taskArgs.to, taskArgs.value);
    console.log("Done");
  });