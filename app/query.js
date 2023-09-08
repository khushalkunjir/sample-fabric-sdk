const { Gateway, Wallets, } = require('fabric-network');
const fs = require('fs');
const path = require("path")
const log4js = require('log4js');
const logger = log4js.getLogger('TracechainNetwork');
const util = require('util')


const helper = require('./helper')
const query = async (channelName, chaincodeName, args, fcn, username, org_name) => {

    try {


        const ccp = await helper.getCCP(org_name) 

        const walletPath = await helper.getWalletPath(org_name) 
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        let identity = await wallet.get(username);
        if (!identity) {
            console.log(`An identity for the user ${username} does not exist in the wallet, so registering user`);
            await helper.getRegisteredUser(username, org_name, true)
            identity = await wallet.get(username);
            console.log('Run the registerUser.js application before retrying');
            return;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, {
            wallet, identity: username, discovery: { enabled: true, asLocalhost: true }
        });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork(channelName);

        // Get the contract from the network.
        const contract = network.getContract(chaincodeName);
        let result;

        switch (fcn) {
            case "ReadAsset":
                console.log("======= Executing Get Aseet =======")
                result = await contract.evaluateTransaction(fcn, args[0]);
                break;
            case "AssetExists":
                    console.log("======= Check asset exist =======")
                    result = await contract.evaluateTransaction(fcn, args[0]);
                    break;
                    case "GetAllAssets":
                        console.log("======= Get GetAllAssets =======")
                        result = await contract.evaluateTransaction(fcn);
                        break;
            case "GetUser":
                console.log("======= Executing Get User =======")
                result = await contract.evaluateTransaction(fcn, args[0]);
                break;
            case "GetAllUser":
	        	console.log("======= Executing getAllUser =======")
	        	result = await contract.evaluateTransaction(fcn, args[0]);
	        	break;
            case "AssetExists":
                console.log("======= Executing AssetExists =======")
                result = await contract.evaluateTransaction(fcn, args[0]);
                break;
                case "Query":
                    console.log("======= Executing query =======")
                    result = await contract.evaluateTransaction(fcn, args[0]);
                    break;
            default:
                break;
        }


        console.log(`Transaction has been evaluated, result is: ${result.toString()}`);

        result = JSON.parse(result.toString());

        const response_payload = {
            result: result,
            error: false,
            errorData: null
        }

        console.log("Query Transaction Try Block Response Payload: ", response_payload)
        return response_payload

    } catch (error) {

        console.log(`Query Transaction Getting error: ${error}`)
        const response_payload = {
            result: null,
            error: true,
            errorData: error.message
        }
        console.log("Query Transaction Catch Block Response Payload: ", response_payload)
        return response_payload

    }
}

exports.query = query

