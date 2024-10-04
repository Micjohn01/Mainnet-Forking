import { ethers } from "hardhat";
const helpers = require("@nomicfoundation/hardhat-network-helpers");


async function main() {
    const ROUTER_ADDRESS = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
    const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
    const DIA = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";

    const TOKEN_HOLDER = "0xf584F8728B874a6a5c7A8d4d387C9aae9172D621";

    await helpers.impersonateAccount(TOKEN_HOLDER);
    const impersonatedSigner = await ethers.getSigner(TOKEN_HOLDER);

    const amountOut = ethers.parseUnits("1", 18);
    const amountInMax = ethers.parseUnits("3000", 6);

    const USDC_Contract = await ethers.getContractAt("IERC20", USDC, impersonatedSigner);
    const UPCX_Contract = await ethers.getContractAt("IERC20", DIA, impersonatedSigner);

    const usdcBal = await USDC_Contract.balanceOf(TOKEN_HOLDER);
    const upcxBal = await UPCX_Contract.balanceOf(TOKEN_HOLDER);
    
    console.log("usdc balance before swap", Number(usdcBal));
    console.log("upcx balance before swap", Number(upcxBal));


    const ROUTER = await ethers.getContractAt("IUniswapV2Router", ROUTER_ADDRESS, impersonatedSigner);

    const [amountIn, amountOutMin] = await ROUTER.getAmountsIn(amountOut, [USDC, DIA]);
    console.log("amountIn", Number(amountIn), "amountOutMin", Number(amountOutMin));
    

    await USDC_Contract.approve(ROUTER_ADDRESS, amountInMax);


    const deadline = Math.floor(Date.now() / 1000) + 60 * 20;



    await ROUTER.swapTokensForExactTokens(
        amountOut,
        amountInMax,
        [USDC, DIA],
        impersonatedSigner.address,
        deadline);

        const usdcBalAfter = await USDC_Contract.balanceOf(impersonatedSigner.address);
        const upcxBalAfter = await UPCX_Contract.balanceOf(impersonatedSigner.address);

        console.log("======================================================")

        console.log("usdc balance after swap", Number(usdcBalAfter));
        console.log("upcx balance after swap", Number(upcxBalAfter));
}



main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
