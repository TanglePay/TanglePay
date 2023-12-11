
import {drainOutputIds, sleep, Channel} from './util'
import IotaNext from '../common/iota-wallet/iota-next'
import BigNumber from 'bignumber.js'
import I18n from '../common/lang'
let IotaObj = IotaNext
const ConsolidationStopThresInputsNums = 100;

const domainName = 'send-consolidate';

let exceptTagPrefixList = ['PARTICIPATE','GROUPFIMUTE','GROUPFIVOTE','GROUPFIMARK']
// get exceptTagPrefixList
  
export const setExzeptTagPrefixList = (list) => {
    exceptTagPrefixList = list
}

export const getExzeptTagPrefixList = () => {

}

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
        const tasks = getAllBasicOutputsTask(drainContext)
        await Promise.all(tasks)
        let cd = drainContext.inChannel.numPushed;

        const ctx = {
            outputs: [],
            inputsAndSignatureKeyPairs: [],
            toAddress,
            tokenId,
            nativeTokens: [],
            ext,
            tag,
            taggedData,
            outputSMRBalance: BigNumber(0),
            inputSMRBalance: BigNumber(0),
            tokenAmountToSend: BigNumber(sendAmount),
            tokenAmountByFar: BigNumber(0),
            isFromTokenSend: true,
            isTokenSatisfied: false,
            isConsolidationSatisfied: false
        };
        
        for (;;) {
            cd--;
            if (cd < 0) {
                break;
            }
            const addressOutput = await drainContext.outChannel.poll();
            if (!ctx.isTokenSatisfied) {
                digestTokenOutput(ctx, addressOutput);
            } else if (!ctx.isConsolidationSatisfied) {
                digestCashOutput(ctx, addressOutput)
                if (ctx.inputsAndSignatureKeyPairs.length >= ConsolidationStopThresInputsNums) {
                    ctx.isConsolidationSatisfied = true
                    break;
                }
            }
        }
        // log ctx
        console.log('SMRTokenSend ctx',JSON.parse(JSON.stringify(ctx),true))
        drainContext.isStop = true;
        if (!ctx.isTokenSatisfied) {
            throw new Error('token not satisfied')
        }
        finishingCtx(ctx)
        checkInputsAndOutputsMatch(ctx)
        return await sendTx(ctx, ctx)
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
    console.log('fetchOutputIdsIntoChannelForUnlock push outputids',outputIds,extraQueryParam)
    for (const outputId of outputIds) { // TODO: reverse?
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

const makeBasicOutputWithTokens = (bech32Address, nativeTokens) => {
    nativeTokens = sortByHexStringField(nativeTokens ?? [], 'id');
    const {bech32Hrp, bech32ToHex, rentStructure} = helperContext
    const basicOutput = {
        address: `0x${bech32ToHex(bech32Address)}`,
        addressType: 0, // ED25519_ADDRESS_TYPE
        type: 3, //BASIC_OUTPUT_TYPE
        amount: '',
        nativeTokens:nativeTokens??[],
        unlockConditions: [
            {
                type: 0, // ADDRESS_UNLOCK_CONDITION_TYPE
                address: IotaObj.Bech32Helper.addressFromBech32(bech32Address, bech32Hrp)
            }
        ],
    }
    const deposit = IotaObj.TransactionHelper.getStorageDeposit(basicOutput, rentStructure)
    basicOutput.amount = deposit.toString()
    return basicOutput
}
const sortByHexStringField = (objects, field) => {
    // Use the compare function to sort the objects based on the specified field
    objects.sort((a, b) => {
      const aValue = IotaObj.Converter.hexToBytes(a[field]);
      const bValue = IotaObj.Converter.hexToBytes(b[field]);
  
      for (let i = 0; i < Math.min(aValue.length, bValue.length); i++) {
        if (aValue[i] !== bValue[i]) {
          return aValue[i] - bValue[i];
        }
      }
      return aValue.length - bValue.length;
    });
  
    return objects;
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
            isFromTokenSend: false
        };
        const outputsInputsWithCash = await supplyCashAndConsolidateAsMuchAsPossible(ctx)
        // if input smr balance is less than output smr balance, throw insufficient balance error
        if (ctx.inputSMRBalance.gt(ctx.outputSMRBalance)) {
            throw new Error('insufficient balance')
        }
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
            isNftSatisfied: false,
            isFromTokenSend: false
        };
        for(;;) {
            cd--;
            if (cd < 0) {
                break;
            }
            const addressOutput = await drainContext.outChannel.poll();
            
            digestNftOutput(ctx, addressOutput)

            if (ctx.nftIds.length == ctx.outputs.length) {
                ctx.isNftSatisfied = true
                break;
            }
            
        }
        // log ctx
        console.log('SMRNFTSend ctx',JSON.parse(JSON.stringify(ctx),true))
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
function isHexZero(str) {
    // Check if the input is null or not a string
    if (str === null || typeof str !== 'string') {
        return false;
    }

    // Check if the string starts with '0x' and has at least one more character
    if (str.startsWith("0x") && str.length > 2) {
        // Remove the '0x' prefix and check if the remaining characters are all zeros
        return str.substring(2).split('').every(char => char === '0');
    }
    return false;
}
const getNftIdFromOutput = (addressOutput) => {
    let outputNftId = addressOutput.output.nftId
    // convert outputNftId from hex to number
    if (isHexZero(outputNftId)) {
        let outputId = addressOutput.output.outputId
        if (outputId == undefined) {
            outputId = IotaObj.TransactionHelper.outputIdFromTransactionData(addressOutput.metadata.transactionId,addressOutput.metadata.outputIndex)
        }
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
    ctx.outputSMRBalance = ctx.outputSMRBalance.plus(new BigNumber(curOutput.amount))
    ctx.outputs.push(curOutput)
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
    } else {
        digestCashOutput(ctx, addressOutput)
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
            curToken = {...token};
        }
    }
    const currentTokenAmount = new BigNumber(curToken.amount)
    if (ctx.tokenAmountByFar.plus(currentTokenAmount).lte(ctx.tokenAmountToSend)) {
        ctx.tokenAmountByFar = ctx.tokenAmountByFar.plus(currentTokenAmount)
    } else {
        const remainder = ctx.tokenAmountByFar.plus(currentTokenAmount).minus(ctx.tokenAmountToSend)
        curToken.amount = BigNumberToHex(remainder)
        nativeTokens.push(curToken)
        ctx.tokenAmountByFar = ctx.tokenAmountToSend
    }
    if (nativeTokens.length > 0) {
        ctx.nativeTokens = mergeNativeTokens(ctx.nativeTokens, nativeTokens)
    }
    if (ctx.tokenAmountByFar.eq(ctx.tokenAmountToSend)) {
        ctx.isTokenSatisfied = true
        const tokenOutput = processFeature({
            address: `0x${bech32ToHex(ctx.toAddress)}`,
            addressType: 0, // ED25519_ADDRESS_TYPE
            type: 3, //BASIC_OUTPUT_TYPE
            amount: '',
            nativeTokens: [
                {
                    id: ctx.tokenId,
                    amount: BigNumberToHex(ctx.tokenAmountToSend)
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
const BigNumberToHex = (bigNumber) => {
    return `0x${bigNumber.toString(16)}`
}
const mergeNativeTokens = (nativeTokens, nativeTokensToMerge) => {
    const nativeTokensMap = {}
    for (const token of nativeTokens) {
        const tokenId = token.id
        const amount = new BigNumber(token.amount)
        if (nativeTokensMap[tokenId]) {
            nativeTokensMap[tokenId] = nativeTokensMap[tokenId].plus(amount)
        } else {
            nativeTokensMap[tokenId] = amount
        }
    }
    for (const token of nativeTokensToMerge) {
        const tokenId = token.id
        const amount = new BigNumber(token.amount)
        if (nativeTokensMap[tokenId]) {
            nativeTokensMap[tokenId] = nativeTokensMap[tokenId].plus(amount)
        } else {
            nativeTokensMap[tokenId] = amount
        }
    }
    const nativeTokensMerged = []
    for (const tokenId of Object.keys(nativeTokensMap)) {
        const amount = nativeTokensMap[tokenId]
        nativeTokensMerged.push({
            id: tokenId,
            amount: BigNumberToHex(amount)
        })
    }
    return nativeTokensMerged
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
    if (features) {
        const tag = features.find(o=>o.type==3)
        if (tag) {
              const tagStr = IotaObj.Converter.hexToUtf8(tag.tag)
              let isExzept = false;
              for (const prefix of exceptTagPrefixList) {
                if (tagStr && tagStr.startsWith(prefix)) {
                    isExzept = true;
                    break;
                }
              }
              if (isExzept) {
                return false
              }
        }
    }
    
    return true;
}
const digestCashOutputToOutputs = (ctx, addressOutput) => {
    if (addressOutput.output.nativeTokens && addressOutput.output.nativeTokens.length > 0) {
        ctx.nativeTokens = mergeNativeTokens(ctx.nativeTokens, addressOutput.output.nativeTokens)
    }
}
const getAllBasicOutputsTask = (drainContext) => {
    return [
        fetchOutputIdsIntoChannelForUnlock(drainContext.inChannel, {
            hasTimelock: true,
            timelockedBefore: Math.floor(Date.now() / 1000)
        }),
        fetchOutputIdsIntoChannelForUnlock(drainContext.inChannel, {
            hasTimelock: false
        }),
        
        fetchOutputIdsIntoChannelForExpiration(drainContext.inChannel, {
        })
    ]
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
    const tasks = getAllBasicOutputsTask(drainContext)
    await Promise.all(tasks)
    let cd = drainContext.inChannel.numPushed;
    const ctx = {
        outputs,
        inputsAndSignatureKeyPairs,
        outputSMRBalance,
        inputSMRBalance,
        nativeTokens: [],
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

    finishingCtx(ctx)
    //TODO
    //console.log('supplyCashAndConsolidateAsMuchAsPossible ctx',ctx)
    return ctx
}
const finishingCtx = (ctx) => {
    const {bech32Address} = helperContext
    if (ctx.nativeTokens.length > 0) {
        const tokenOutput = makeBasicOutputWithTokens(bech32Address, ctx.nativeTokens)
        ctx.outputs.push(tokenOutput)
        ctx.outputSMRBalance = ctx.outputSMRBalance.plus(new BigNumber(tokenOutput.amount))
    }
    if (ctx.outputSMRBalance.lt(ctx.inputSMRBalance)) {
        const cashOutput = makeBasicOutput(ctx.inputSMRBalance.minus(ctx.outputSMRBalance), bech32Address)
        ctx.outputs.push(cashOutput)
        ctx.outputSMRBalance = ctx.outputSMRBalance.plus(new BigNumber(cashOutput.amount))
    }
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
            const nftId = getNftIdFromOutput({output})
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
    const {client,address,signatureFunc,getHardwareBip32Path} = helperContext
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
    },signatureFunc,
    getHardwareBip32Path)
    return res
}

