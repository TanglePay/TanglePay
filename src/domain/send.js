
import {drainOutputIds, sleep, Channel} from './util'
import IotaNext from '../common/iota-wallet/iota-next'
import BigNumber from 'bignumber.js'
let IotaObj = IotaNext
const ConsolidationStopThresInputsNums = 100;

const domainName = 'send-consolidate';

export const sendDomainSwitch = true;

// flow: requirements -> expected outputs -> drain outputids until stop condition -> check inputs and outputs if match

let isProcessing = false;
export const SMRTokenSend = async (toAddress, sendAmount, ext) => {
    if (isProcessing) {
        throw new Error('is processing')
    }
    isProcessing = true
    try {
        let { tokenId, token, taggedData, realBalance, mainBalance, tag, metadata } = ext
        tag = tag || 'TanglePay'
        
        const {
            bech32Address, baseSeed,isLedger,processFeature,bech32ToHex,IndexerPluginClient, outputIdResolver, minBalance, addressKeyPair, getHardwareBip32Path, signatureFunc,hardwarePath
        } = helperContext    
        const drainContext = makeDrainOutputIdsContext(outputIdResolver)
        drainOutputIds(drainContext)
        const tasks = [
            fetchOutputIdsIntoChannelForUnlock(drainContext.inChannel, {
                hasNativeTokens: true
            }),
            fetchOutputIdsIntoChannelForExpiration(drainContext.inChannel, {
                hasNativeTokens: true
            })
        ]
        await Promise.all(tasks)
        let cd = drainContext.inChannel.numPushed;

        const ctx = {
            outputs: [],
            inputsAndSignatureKeyPairs: [],
            toAddress,
            tokenId,
            ext,
            tag,
            taggedData,
            outputSMRBalance: BigNumber(0),
            inputSMRBalance: BigNumber(0),
            tokenAmountToSend: BigNumber(sendAmount),
            tokenAmountByFar: BigNumber(0),
            isTokenSatisfied: false
        };
        
        for (;;) {
            cd--;
            if (cd < 0) {
                break;
            }
            const addressOutput = await drainContext.outChannel.poll();
            digestTokenOutput(ctx, addressOutput)
            if (ctx.isTokenSatisfied) {
                break;
            }
        }
        drainContext.isStop = true;
        if (!ctx.isTokenSatisfied) {
            throw new Error('token not satisfied')
        }
        const outputsInputsWithCash = await supplyCashAndConsolidateAsMuchAsPossible(ctx)
        checkInputsAndOutputsMatch(outputsInputsWithCash)
        return await sendTx(ctx, outputsInputsWithCash)
    } catch (e) {
        throw e
    } finally {
        isProcessing = false
    }
    
}

const fetchOutputIdsIntoChannelForUnlock = async (channel, extraQueryParam) => {
    const {IndexerPluginClient, bech32Address} = helperContext
    const basicParam = {
        addressBech32: bech32Address,
        hasStorageDepositReturn: false,
        pageSize: 10000,
    }
    const param = {...basicParam, ...extraQueryParam}
    const outputIdsWrapper = await IndexerPluginClient.outputs(param);
    const {items: outputIdsRaw} = outputIdsWrapper ?? {}
    const outputIds = outputIdsRaw ?? []
    for (const outputId of outputIds) { // TODO: reverse?
        console.log('fetchOutputIdsIntoChannelForUnlock push outputid',outputId)
        channel.push(outputId);
    }
}
const fetchOutputIdsIntoChannelForExpiration = async (channel, extraQueryParam) => {
    const {IndexerPluginClient, bech32Address} = helperContext
    const basicParam = {
        expirationReturnAddressBech32: bech32Address,
        expiresBefore: Math.floor(Date.now() / 1000),
        hasExpiration: true,
        pageSize: 10000,
    }
    const param = {...basicParam, ...extraQueryParam}
    const outputIdsWrapper = await IndexerPluginClient.outputs(param);
    const {items: outputIdsRaw} = outputIdsWrapper ?? {}
    const outputIds = outputIdsRaw ?? []
    for (const outputId of outputIds) { // TODO: reverse?
        console.log('fetchOutputIdsIntoChannelForExpiration push outputid',outputId)
        channel.push(outputId);
    }
}
const makeBasicOutput = (outputBalanceBig, bech32Address) => {
    const {minBalance, bech32Hrp, bech32ToHex} = helperContext
    if (!outputBalanceBig.gte(minBalance)) return undefined
    const basicOutput = {
        address: `0x${bech32ToHex(bech32Address)}`,
        addressType: 0, // ED25519_ADDRESS_TYPE
        type: 3, //BASIC_OUTPUT_TYPE
        amount: outputBalanceBig.toString(),
        unlockConditions: [
            {
                type: 0, // ADDRESS_UNLOCK_CONDITION_TYPE
                address: IotaObj.Bech32Helper.addressFromBech32(bech32Address, bech32Hrp)
            }
        ],
    }
    return basicOutput
}

const makeDrainOutputIdsContext = (outputIdResolver, numOfParrallels = 5) => {
    const inChannel = new Channel();
    const outChannel = new Channel();
    const threadNum = numOfParrallels;
    const isStop = false;
    return {
        inChannel,
        outChannel,
        threadNum,
        isStop,
        outputIdResolver
    }
}
let helperContext = {}
export const setHelperContext = (ctx) => {
    helperContext = ctx
}
export const SMRCashSend = async (toAddress, sendAmount, ext) => {
    if (isProcessing) {
        throw new Error('is processing')
    }
    isProcessing = true
    try {
        let { taggedData, tag } = ext
        tag = tag || 'TanglePay'
        const {processFeature} = helperContext
        const expectedOutput = processFeature(makeBasicOutput(BigNumber(sendAmount), toAddress), ext)
        const ctx = {
            outputs: [expectedOutput],
            inputsAndSignatureKeyPairs: [],
            outputSMRBalance: BigNumber(sendAmount),
            inputSMRBalance: BigNumber(0),
            toAddress,
            ext,
            tag,
            taggedData,
            tokenAmountToSend: BigNumber(sendAmount),
        };
        const outputsInputsWithCash = await supplyCashAndConsolidateAsMuchAsPossible(ctx)
        checkInputsAndOutputsMatch(outputsInputsWithCash)
        return await sendTx(ctx, outputsInputsWithCash)
    } catch (e) {
        throw e
    } finally {
        isProcessing = false
    }
}
export const SMRNFTSend = async (toAddress, sendAmount, ext) => {
    if (isProcessing) {
        throw new Error('is processing')
    }
    isProcessing = true
    try {
        const {
            bech32Address, baseSeed,isLedger,processFeature,bech32ToHex,IndexerPluginClient, outputIdResolver, minBalance, addressKeyPair, getHardwareBip32Path, signatureFunc,hardwarePath
        } = helperContext    
        const outputIdsWrapper = await IndexerPluginClient.nfts({ addressBech32: bech32Address })
        const {items: outputIdsRaw} = outputIdsWrapper ?? {}
        const outputIds = outputIdsRaw ?? []
        let { nftId, taggedData, tag, isNftUnlock, metadata } = ext
        const nftIds = (nftId || '').split(',')
        tag = tag || 'TanglePay'

        const drainContext = makeDrainOutputIdsContext(outputIdResolver)
        for (const outputId of outputIds) { // TODO: reverse?
            drainContext.inChannel.push(outputId);
        }
        drainOutputIds(drainContext)
        let cd = outputIds.length
        const ctx = {
            outputs: [],
            inputsAndSignatureKeyPairs: [],
            outputSMRBalance: BigNumber(0),
            inputSMRBalance: BigNumber(0),
            tokenAmountToSend: BigNumber(sendAmount),
            toAddress,
            ext,
            tag,
            taggedData,
            nftIds,
            isNftSatisfied: false
        };
        for(;;) {
            cd--;
            if (cd < 0) {
                break;
            }
            const addressOutput = await drainContext.outChannel.poll();
            
            digestNftOutput(ctx, addressOutput)

            if (ctx.nftIds.length == outputs.length) {
                isNftSatisfied = true
                break;
            }
            
        }
        drainContext.isStop = true;
        if (!ctx.isNftSatisfied) {
            throw new Error('nft not satisfied')
        }
        const outputsInputsWithCash = await supplyCashAndConsolidateAsMuchAsPossible(ctx)
        checkInputsAndOutputsMatch(outputsInputsWithCash)
        return await sendTx(ctx, outputsInputsWithCash)
    } catch (e) {
        throw e
    } finally {
        isProcessing = false
    }

}
const digestNftOutput = (ctx,addressOutput) => {
    const canDigest = canDigestNftOutput(ctx, addressOutput)
    if (canDigest) {
        digestNftOutputToOutputs(ctx, addressOutput)
        digestOutputToInputsAndSignatureKeyPairs(ctx, addressOutput)
    }
}
const getNftIdFromOutput = (addressOutput) => {
    let outputNftId = addressOutput.output.nftId
    if (outputNftId == 0) {
        outputNftId = IotaObj.TransactionHelper.resolveIdFromOutputId(outputId)
    }
    return outputNftId
}

const canDigestNftOutput = (ctx, addressOutput) => {
    let isUnlock = IotaObj.checkUnLock(addressOutput)
    const outputNftId = getNftIdFromOutput(addressOutput)
    if (
        isUnlock &&
        !addressOutput.metadata.isSpent &&
        outputNftId &&
        ctx.nftIds.includes(outputNftId)
    ) {
        return true;
    }
    return false
}

const digestNftOutputToOutputs = (ctx, addressOutput) => {
    const {processFeature, bech32ToHex, bech32Hrp, rentStructure} = helperContext
    const outputNftId = getNftIdFromOutput(addressOutput)
    const outputAmount = addressOutput.output.amount
    const curOutput = processFeature({
        immutableFeatures: addressOutput.output.immutableFeatures,
        address: `0x${bech32ToHex(ctx.toAddress)}`,
        nftId: outputNftId,
        addressType: 0, // NFT_ADDRESS_TYPE
        amount: outputAmount,
        type: 6,
        unlockConditions: [
            {
                type: 0, // ADDRESS_UNLOCK_CONDITION_TYPE
                address: IotaObj.Bech32Helper.addressFromBech32(ctx.toAddress, bech32Hrp)
            }
        ]
    }, ctx.ext)
    const currentAmount = new BigNumber(curOutput.amount)
    const deposit = IotaObj.TransactionHelper.getStorageDeposit(curOutput, rentStructure)
    if (currentAmount.lt(deposit)) {
        curOutput.amount = deposit
    }
    ctx.outputSMRBalance = outputSMRBalance.plus(new BigNumber(curOutput.amount))
    outputs.push(curOutput)
}
const digestOutputToInputsAndSignatureKeyPairs = (ctx, addressOutput) => {
    const {hardwarePath,addressKeyPair} = helperContext
    const input = {
        type: 0, // UTXO_INPUT_TYPE
        transactionId: addressOutput.metadata.transactionId,
        transactionOutputIndex: addressOutput.metadata.outputIndex,
        hardwarePath
    }
    const inputData = {
        input,
        consumingOutput: addressOutput.output
    }
    if (addressKeyPair) {
        inputData.addressKeyPair = addressKeyPair
    }
    ctx.inputsAndSignatureKeyPairs.push(inputData)
    const amount = new BigNumber(addressOutput.output.amount)
    ctx.inputSMRBalance = ctx.inputSMRBalance.plus(amount)
}
const digestTokenOutput = (ctx ,addressOutput) => {
    const canDigest = canDigestTokenOutput(ctx, addressOutput)
    if (canDigest) {
        digestTokenOutputToOutputs(ctx, addressOutput)
        digestOutputToInputsAndSignatureKeyPairs(ctx, addressOutput)
    }
}
const canDigestTokenOutput = (ctx, addressOutput) => {
    if (!addressOutput.metadata.isSpent) {
        if (BigNumber(addressOutput.output.amount).eq(0)) {
            return false; // Zero balance, skip token?
        } else {
            const outputType = addressOutput?.output?.type;
            const isUnlock = IotaObj.checkUnLock(addressOutput);
            
            if (outputType == 3 && isUnlock) {
                const nativeTokens = addressOutput?.output?.nativeTokens || [];
                const curToken = nativeTokens.find((e) => e.id === ctx.tokenId);
                
                return !!curToken; // Returns true if curToken exists, otherwise false
            }
        }
    }
    return false;
}
const digestTokenOutputToOutputs = (ctx, addressOutput) => {
    const {processFeature, bech32ToHex, bech32Hrp, rentStructure, bech32Address} = helperContext
    const nativeTokens = [];
    let curToken
    for (const token of addressOutput.output.nativeTokens) {
        if (token.id !== ctx.tokenId) {
            nativeTokens.push(token);
        } else if (!curToken) {
            curToken = token;
        }
    }
    const currentTokenAmount = new BigNumber(curToken.amount)
    if (ctx.tokenAmountByFar.plus(currentTokenAmount).lte(ctx.tokenAmountToSend)) {
        ctx.tokenAmountByFar = ctx.tokenAmountByFar.plus(currentTokenAmount)
    } else {
        const remainder = ctx.tokenAmountByFar.plus(currentTokenAmount).minus(ctx.tokenAmountToSend)
        curToken.amount = remainder.toString()
        nativeTokens.push(curToken)
        ctx.tokenAmountByFar = ctx.tokenAmountToSend
    }
    if (nativeTokens.length > 0) {
        const tokenRemainder = {
            immutableFeatures: addressOutput.output.immutableFeatures,
            address: `0x${bech32ToHex(bech32Address)}`,
            addressType: 0, // ED25519_ADDRESS_TYPE
            type: 3, //BASIC_OUTPUT_TYPE
            amount: '',
            nativeTokens,
            unlockConditions: [
                {
                    type: 0, // ADDRESS_UNLOCK_CONDITION_TYPE
                    address: IotaObj.Bech32Helper.addressFromBech32(bech32Address, bech32Hrp)
                }
            ],
        }
        const deposit = IotaObj.TransactionHelper.getStorageDeposit(tokenRemainder, rentStructure)
        tokenRemainder.amount = deposit.toString()
        ctx.outputSMRBalance = ctx.outputSMRBalance.plus(deposit)
        ctx.outputs.push(tokenRemainder)
    }
    if (ctx.tokenAmountByFar.eq(ctx.tokenAmountToSend)) {
        ctx.isTokenSatisfied = true
        const tokenOutput = processFeature({
            immutableFeatures: addressOutput.output.immutableFeatures,
            address: `0x${bech32ToHex(ctx.toAddress)}`,
            addressType: 0, // ED25519_ADDRESS_TYPE
            type: 3, //BASIC_OUTPUT_TYPE
            amount: '',
            nativeTokens: [
                {
                    id: ctx.tokenId,
                    amount: `0x${ctx.tokenAmountToSend.toString(16)}`
                }
            ],
            unlockConditions: [
                {
                    type: 0, // ADDRESS_UNLOCK_CONDITION_TYPE
                    address: IotaObj.Bech32Helper.addressFromBech32(ctx.toAddress, bech32Hrp)
                }
            ],
        }, ctx.ext)
        const deposit = IotaObj.TransactionHelper.getStorageDeposit(tokenOutput, rentStructure)
        tokenOutput.amount = deposit.toString()
        ctx.outputSMRBalance = ctx.outputSMRBalance.plus(deposit)
        ctx.outputs.push(tokenOutput)
    }
}
const digestCashOutput = (ctx, addressOutput) => {
    const canDigest = canDigestCashOutput(ctx, addressOutput)
    if (canDigest) {
        console.log('digestCashOutput before',JSON.parse(JSON.stringify(ctx),true))
        digestCashOutputToOutputs(ctx, addressOutput)
        digestOutputToInputsAndSignatureKeyPairs(ctx, addressOutput)
        console.log('digestCashOutput after',JSON.parse(JSON.stringify(ctx),true))
    }
}
const canDigestCashOutput = (ctx, addressOutput) => {
    if (addressOutput.metadata.isSpent) return false
    const isUnlock = IotaObj.checkUnLock(addressOutput);
    if (!isUnlock) return false
    const outputAmount = new BigNumber(addressOutput.output.amount)
    if (outputAmount.eq(0)) return false
    const features = addressOutput.output.features
    if (!features) return true
    const tagFeature = features.find(feature=>feature.type === 3)
    if (tagFeature) return false
    const metadataFeature = features.find(feature=>feature.type === 2)
    if (metadataFeature) return false
    if (addressOutput.output.nativeTokens && outputs.output.nativeTokens.length > 0) return false
    return true;
}
const digestCashOutputToOutputs = (ctx, addressOutput) => {
}
export const supplyCashAndConsolidateAsMuchAsPossible = async (args) => {
    const {        
        outputs,
        inputsAndSignatureKeyPairs,
        outputSMRBalance,
        inputSMRBalance,
        toAddress,
        tag,
        taggedData,
        ext
    } = args
    const {bech32Address, outputIdResolver} = helperContext
    
    // drain outputIds
    const drainContext = makeDrainOutputIdsContext(outputIdResolver)
    drainOutputIds(drainContext)
    const tasks = [
        fetchOutputIdsIntoChannelForUnlock(drainContext.inChannel, {
            hasTimelock: true,
            timelockedBefore: Math.floor(Date.now() / 1000),
            hasNativeTokens: false
        }),
        fetchOutputIdsIntoChannelForUnlock(drainContext.inChannel, {
            hasTimelock: false,
            hasNativeTokens: false
        }),
        
        fetchOutputIdsIntoChannelForExpiration(drainContext.inChannel, {
            hasNativeTokens: false
        })
    ]
    await Promise.all(tasks)
    let cd = drainContext.inChannel.numPushed;
    const ctx = {
        outputs,
        inputsAndSignatureKeyPairs,
        outputSMRBalance,
        inputSMRBalance,
        toAddress,
        tag,
        taggedData,
        ext,
        isConsolidationSatisfied: false
    };
    for(;;) {
        cd--;
        if (cd < 0) {
            break;
        }
        const addressOutput = await drainContext.outChannel.poll();
        digestCashOutput(ctx, addressOutput)
        if (ctx.inputsAndSignatureKeyPairs.length >= ConsolidationStopThresInputsNums) {
            ctx.isConsolidationSatisfied = true
            break;
        }
    }
    drainContext.isStop = true;

    if (ctx.outputSMRBalance.lt(ctx.inputSMRBalance)) {
        const diff = ctx.inputSMRBalance.minus(ctx.outputSMRBalance)
        const diffOutput = makeBasicOutput(diff, bech32Address)
        ctx.outputs.push(diffOutput)
        ctx.outputSMRBalance = ctx.outputSMRBalance.plus(diff)
    }
    console.log('supplyCashAndConsolidateAsMuchAsPossible ctx',ctx)
    return ctx
}

const checkInputsAndOutputsMatch = async ({inputsAndSignatureKeyPairs, outputs}) => {
    const inputsSMRBalance = inputsAndSignatureKeyPairs.reduce((acc, cur) => {
        return acc.plus(new BigNumber(cur.consumingOutput.amount))
    }, BigNumber(0))
    const outputsSMRBalance = outputs.reduce((acc, cur) => {
        return acc.plus(new BigNumber(cur.amount))
    }, BigNumber(0))
    if (!inputsSMRBalance.eq(outputsSMRBalance)) {
        throw new Error('inputs and outputs not match, smr balance not match')
    }
    const inputsNFTSet = new Set()
    for (const input of inputsAndSignatureKeyPairs) {
        const output = input.consumingOutput
        if (output.type === 6) {
            const nftId = getNftIdFromOutput(output)
            if (inputsNFTSet.has(nftId)) {
                throw new Error('inputs and outputs not match, duplicate nft')
            }
            inputsNFTSet.add(nftId)
        }
    }
    const outputsNFTSet = new Set()
    for (const output of outputs) {
        if (output.type === 6) {
            const nftId = output.nftId
            if (outputsNFTSet.has(nftId)) {
                throw new Error('inputs and outputs not match, duplicate nft')
            }
            outputsNFTSet.add(nftId)
        }
    }
    if (inputsNFTSet.size !== outputsNFTSet.size) {
        throw new Error('inputs and outputs not match, nft not match')
    }
    for (const nftId of inputsNFTSet) {
        if (!outputsNFTSet.has(nftId)) {
            throw new Error('inputs and outputs not match, nft not match')
        }
    }
    const inputsTokenMap = {}
    for (const input of inputsAndSignatureKeyPairs) {
        const output = input.consumingOutput
        if (output.type === 3) {
            for (const token of (output.nativeTokens??[])) {
                const tokenId = token.id
                const amount = new BigNumber(token.amount)
                if (inputsTokenMap[tokenId]) {
                    inputsTokenMap[tokenId] = inputsTokenMap[tokenId].plus(amount)
                } else {
                    inputsTokenMap[tokenId] = amount
                }
            }
        }
    }
    const outputsTokenMap = {}
    for (const output of outputs) {
        if (output.type === 3) {
            for (const token of (output.nativeTokens??[])) {
                const tokenId = token.id
                const amount = new BigNumber(token.amount)
                if (outputsTokenMap[tokenId]) {
                    outputsTokenMap[tokenId] = outputsTokenMap[tokenId].plus(amount)
                } else {
                    outputsTokenMap[tokenId] = amount
                }
            }
        }
    }
    // check size first
    if (Object.keys(inputsTokenMap).length !== Object.keys(outputsTokenMap).length) {
        throw new Error('inputs and outputs not match, token not match')
    }
    for (const tokenId of Object.keys(inputsTokenMap)) {
        if (!outputsTokenMap[tokenId]) {
            throw new Error('inputs and outputs not match, token not match')
        }
        if (!outputsTokenMap[tokenId].eq(inputsTokenMap[tokenId])) {
            throw new Error('inputs and outputs not match, token not match')
        }
    }
    return true
}

const sendTx = async (ctx, {outputs, inputsAndSignatureKeyPairs}) => {
    const {client,address} = helperContext
    const {tag, taggedData, ext, toAddress, tokenAmountToSend} = ctx
    const res = await IotaObj.sendAdvanced(client, inputsAndSignatureKeyPairs, outputs, {
        tag: IotaObj.Converter.utf8ToBytes(tag),
        data: taggedData
            ? IotaObj.Converter.utf8ToBytes(taggedData)
            : IotaObj.Converter.utf8ToBytes(
                  JSON.stringify({
                      from: address, //main address
                      to: toAddress,
                      amount: tokenAmountToSend.toString(),
                      collection: ext?.isCollection ? 1 : 0
                  })
              )
    })
    return res
}

