const { Gateway, Wallets, TxEventHandler, GatewayOptions, DefaultEventHandlerStrategies, TxEventHandlerFactory, DefaultCheckpointers } = require('fabric-network');
const fs = require('fs');
const EventStrategies = require('fabric-network/lib/impl/event/defaulteventhandlerstrategies');
const path = require("path")
const log4js = require('log4js');
const logger = log4js.getLogger('TracechainNetwork');
const util = require('util')

const helper = require('./helper');
const { blockListener, contractListener, commitListener } = require('./Listeners');
const { resolve } = require('path');
const { fullList } = require('npm');

const invokeTransaction = async (channelName, chaincodeName, fcn, args, username, org_name, transientData) => {
    try {
        const ccp = await helper.getCCP(org_name);

        const walletPath = await helper.getWalletPath(org_name);
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        let identity = await wallet.get(username);
        if (!identity) {
            console.log(`An identity for the user ${username} does not exist in the wallet, so registering user`);
            await helper.getRegisteredUser(username, org_name, true)
            identity = await wallet.get(username);
            console.log('Run the registerUser.js application before retrying');
            return;
        }


        const connectOptions = {
            wallet, identity: username, discovery: { enabled: true, asLocalhost: true },
            // eventHandlerOptions: EventStrategies.NONE
            eventHandlerOptions: {
                commitTimeout: 100,
                strategy: DefaultEventHandlerStrategies.NETWORK_SCOPE_ALLFORTX
            }
        }

        const gateway = new Gateway();
        await gateway.connect(ccp, connectOptions);
        await gateway.disconnect();


        const network = await gateway.getNetwork(channelName);

        const contract = network.getContract(chaincodeName);

        let result;


        switch (fcn) {
            case "CreateAsset":
                console.log("====== Executing InsertAssetRecords ======")
                result = await contract.submitTransaction(fcn, args[0], args[1], args[2], args[3], args[4]);
                console.log(`Output: CreateAsset= ${result.toString()}`)
                result = { txid: result.toString() }
                break;
            case "UpdateAsset":
                console.log("====== Executing Update Asset record ======")
                result = await contract.submitTransaction(fcn, args[0], args[1], args[2], args[3], args[4]);
                console.log(`Output: UpdateAsset= ${result.toString()}`)
                result = { txid: result.toString() }
                break;
            case "AddActive":
                console.log("====== Executing InsertAssetRecords ======")
                result = await contract.submitTransaction(fcn, args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7]);
                console.log(`Output: addActive= ${result.toString()}`)
                result = { txid: result.toString() }
                break;
            case "StudentAcknowledgement":
                console.log("====== Executing studentAcknowledgement ======")
                result = await contract.submitTransaction(fcn, args[0], args[1]);
                console.log(`Output: studentAcknowledgement= ${result.toString()}`)
                result = { txid: result.toString() }
                break;
            case "UpdateCertificate":
                console.log("====== Executing updateCertificate ======")
                result = await contract.submitTransaction(fcn, args[0], args[1], args[2], args[3], args[4], args[5], args[6]);
                console.log(`Output: updateCertificate= ${result.toString()}`)
                result = { txid: result.toString() }
                break;
            case "DeleteCertificate":
                console.log("====== Executing deleteCertificate ======")
                result = await contract.submitTransaction(fcn, args[0]);
                console.log(`Output: deleteCertificate= ${result.toString()}`)
                result = { txid: result.toString() }
                break;
            case "AddUser":
                console.log("====== Executing addUser ======")
                result = await contract.submitTransaction(fcn, args[0], args[1], args[2], args[3], args[4]);
                console.log(`Output: addUser= ${result.toString()}`)
                result = { txid: result.toString() }
                break;
            default:
                break;
        }



        await network.addBlockListener(blockListener)



        const response_payload = {
            result: result,
            error: false,
            errorData: null
        }

        console.log("Invoke Transaction Try Block Response Payload: ", response_payload)
        return response_payload;


    } catch (error) {

        console.log(`Invoke Transaction Getting error: ${error}`)
        const response_payload = {
            result: null,
            error: true,
            errorData: error.message
        }
        console.log("Invoke Transaction Catch Block Response Payload: ", response_payload)
        return response_payload

    }
}

exports.invokeTransaction = invokeTransaction;

