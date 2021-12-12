const {
    ChainId,
    Fetcher,
    WETH,
    Route,
    Trade,
    TokenAmount,
    TradeType,
    Percent,
} = require("@uniswap/sdk");
const ethers = require("ethers");
const chainId = ChainId.MAINNET;
const tetherAddress = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
const wbtcAddress = "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599";

async function init() {
    const usdt = await Fetcher.fetchTokenData(chainId, tetherAddress);
    const wbtc = await Fetcher.fetchTokenData(chainId, wbtcAddress);
    const weth = WETH[chainId];
    const pair1 = await Fetcher.fetchPairData(weth, wbtc);
    const pair2 = await Fetcher.fetchPairData(wbtc, usdt);
    const route = new Route([pair1, pair2], weth);
    const trade = new Trade(
        route,
        new TokenAmount(weth, "1000000000000000000"),
        TradeType.EXACT_INPUT
    );
    const slippageTolerance = new Percent("50", "1000"); //50 bips ie. 0.5% tolerance
    const minOutAmount = trade.minimumAmountOut(slippageTolerance).raw;
    const path = [weth.address, wbtc.address, usdt.address];
    const to = "";
    const deadline = Math.floor(Date.now() / 1000) + 5 * 60;
    const value = trade.inputAmount.raw;
    console.log(route.midPrice.toSignificant(6));
    //console.log(route.midPrice.invert().toSignificant(6));
    console.log(trade.executionPrice.toSignificant(6));
    console.log(trade.nextMidPrice.toSignificant(6));

    const provider = ethers.getDefaultProvider("mainnet", {
        infura: "https://mainnet.infura.io/v3/04941aeb1c5f43a6838c3893a5c8c8b6",
    });
    const signer = new ethers.Wallet(PRIVATE_KEY);
    const account = signer.connect(provider);
    const uniswap = new ethers.Contract(
        "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
        [
            "function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline)external payable returns (uint[] memory amounts);",
            account,
        ]
    );
    const tx = await uniswap.sendExactETHForTokens(
        minOutAmount,
        path,
        to,
        deadline,
        { value, gasPrice: 20e9 }
    );
    const receipt = await tx.wait();
    console.log(receipt);
}
init();
