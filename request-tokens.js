async function main() {
    // Get the token contract address from command line args
    const tokenAddress = "0xe8F920229F964d0bA163f4adDf032591539C09f5";
    const accountAddress = "0xD3a0d17b71167F9fB96FdDD826CA88741c9B06Fc";
  
    if (!tokenAddress || !accountAddress) {
      console.error("Please provide token address and account address as arguments");
      process.exit(1);
    }
  
    // Get the ERC20 contract interface
    const erc20ABI = [
      "function balanceOf(address owner) view returns (uint256)",
      "function decimals() view returns (uint8)",
      "function requestTokens(address to)"
    ];
  
    // Create a contract instance
    const tokenContract = await ethers.getContractAt(erc20ABI, tokenAddress);
  
    try {
      // Get token decimals
      const decimals = await tokenContract.decimals();
      
      // Get balance
      const balance = await tokenContract.balanceOf(accountAddress);
      
      // Convert balance to human readable format
      const formattedBalance = ethers.formatUnits(balance, decimals);
      
      console.log(`Current balance for address ${accountAddress}:`);
      console.log(`${formattedBalance} USDC`);
  
      // Request tokens
      const tx = await tokenContract.requestTokens(accountAddress);
      console.log("Transaction hash:", tx.hash);
  
      // Get balance
      const updatedBalance = await tokenContract.balanceOf(accountAddress);
      
      // Convert balance to human readable format
      const formattedUpdatedBalance = ethers.formatUnits(updatedBalance, decimals);
      
      console.log(`Current balance for address ${accountAddress}:`);
      console.log(`${formattedUpdatedBalance} USDC`);
  
    } catch (error) {
      console.error("Error getting balance:", error);
      process.exit(1);
    }
  }
    
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });