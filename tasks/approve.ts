import { task } from "hardhat/config";

task("approve", "Set an allowance address and an allowance amount tokens to transfer from your behalf")
  .addParam('spender', "The address that will be allowed to transfer your tokens")
  .addParam('amount', "Tokens amount")
  .setAction(async (taskArgs, hre) => {
    const contract = await hre.ethers.getContractFactory('ERC20Token');
    const token = contract.attach(process.env.ERC20_TOKEN_ADDRESS!);
    await token.approve(taskArgs.spender, taskArgs.amount);
    console.log("Done");
  });