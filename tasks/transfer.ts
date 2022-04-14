import { task } from "hardhat/config";

task("transfer", "Transfer tokens to another address")
  .addParam('to', "The address to which we will transfer tokens")
  .addParam('value', "Tokens amount")
  .setAction(async (taskArgs, hre) => {
    const contract = await hre.ethers.getContractFactory('ERC20Token');
    const token = contract.attach(process.env.ERC20_TOKEN_ADDRESS!);
    await token.transfer(taskArgs.to, taskArgs.value);
    console.log("Done");
  });