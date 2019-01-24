var safeCompare = require('safe-compare');

var Web3 = require('web3');
let express = require('express');
var cors = require('cors')
const bodyParser = require('body-parser');

/*var Personal = require('web3-eth-personal');
var personal = new Personal("http://localhost:8101");
*/
// console.log('personl ',personal);

var Net = require('web3-net');
var net = new Net("http://localhost:8101");

let app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

//setup server port
var port = process.env.PORT || 3000;

if (typeof web3 !== 'undefined') {
  web3 = new Web3(web3.currentProvider);
} else {
  // set the provider you want from Web3.providers
  web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8101"));
}


var fromBlock = 0;
var lastBlock = 0;


web3.extend({
	property: 'personal',
    methods: [{
        name: 'listWallets',
        call: 'personal_listWallets',
		params: 0
    },{
    	name: 'newAccount',
        call: 'personal_newAccount',
        params: 1
    },{
    	name: 'listAccounts',
        call: 'personal_listAccounts',
        params: 0
    },{
	    name: 'unlockAccount',
	    call: 'personal_unlockAccount',
	    params: 2	
    },{
	    name: 'lockAccount',
	    call: 'personal_lockAccount',
	    params: 1	
    }]
});


web3.extend({
	property: 'miner',
    methods: [{
        name: 'start',
        call: 'miner_start',
		params: 1
    },
	{
		name: 'stop',
        call: 'miner_stop',
	}]
});

web3.extend({
	property: 'admin',
    methods: [{
    	name: 'getPeers',
    	call: 'admin_peers',
    },
    ,{
    	name: 'addPeer',
        call: 'admin_addPeer',
        params: 1
    },{
    	name: 'nodeInfo',
        call: 'admin_nodeInfo',
        params: 0
    },{
 		name: 'datadir',
        call: 'admin_datadir',
        params: 0
    }
    ]
});

//done
app.post('/createAccount' , (req,res) => {
	const { password } = req.body;
	var finalResult = {
		"data" : null
	}
	web3.personal.newAccount(password)
	.then(result =>{
		onSuccess(result,getEmptyFinalVar(),res);
	})
	.catch(err =>{
		onFailure(getEmptyFinalVar(),res);
	})
});

//done
app.get('/getAccountList', (req, res) => {

	web3.eth.getAccounts()
	.then(result =>{
		onSuccess(result,getEmptyFinalVar(),res);
	})
	.catch(err =>{
		onFailure(getEmptyFinalVar(),res);
	})
});

//done
app.get('/getWalletList', (req, res) => {
	
	web3.personal.listWallets()
	.then(result =>{
		onSuccess(result,getEmptyFinalVar(),res);
	})
	.catch(err =>{
		onFailure(getEmptyFinalVar(),res);
	})
})

//done
app.get('/getBlockNumber', (req, res) => {
	
	web3.eth.getBlockNumber()
	.then(result =>{
		onSuccess(result,getEmptyFinalVar(),res);
	})
	.catch(err =>{
		onFailure(getEmptyFinalVar(),res);
	})
});

//done
app.post('/getBalance', (req, res) => {
	
	const{ address } = req.body;
	
	web3.eth.getBalance(address)
	.then(result =>{
		onSuccess(result,getEmptyFinalVar(),res);
	})
	.catch(err =>{
		onFailure(getEmptyFinalVar(),res);
	})	
});

//done
app.get('/getGasPrice', (req, res) => {
	web3.eth.getGasPrice()	
	.then(result =>{
		onSuccess(result,getEmptyFinalVar(),res);
	})
	.catch(err =>{
		onFailure(getEmptyFinalVar(),res);
	})
});

//done
app.get('/getHashRate', (req,res) => {
	web3.eth.getHashrate()
	.then(result =>{
		onSuccess(result,getEmptyFinalVar(),res);
	})
	.catch(err => {
		onFailure(getEmptyFinalVar(),res);
	})
});


function getEmptyFinalVar(){
	var finalResult = {
		"data" : null
	}

	return finalResult;
}

function onSuccess(result,finalResult,res){
	finalResult.data = result;
	res.send(finalResult);
}

function onFailure(finalResult,res){
	res.send(finalResult);
}

//done
app.post('/send', (req, res) => {
	const {password, from, to, amount } = req.body;

	web3.personal.unlockAccount(from, password)
	.then(result =>{
		return result;
	})
	.then(isAccountUnlocked =>{
		if (isAccountUnlocked) {
				web3.eth.sendTransaction({
	    			from : from,
					to : to,
					value : amount
			},function(error, hash){
				if(error)
					onFailure(getEmptyFinalVar(),res);
				else{
					onSuccess(hash,getEmptyFinalVar(),res);
				}
	    
		});
		}
	})
	.catch(error =>{
			console.log(error);
			onFailure(getEmptyFinalVar(),res);
	})
});

//done
app.post('/getTransaction',(req,res) => {
	const { thash } = req.body;

	web3.eth.getTransaction(thash)
	.then(result =>{
		onSuccess(result,getEmptyFinalVar(),res);
	})
	.catch(err => {
		onFailure(getEmptyFinalVar(),res);
	})	
});

//done
app.get('/getPendingTransactions', (req, res) => {
	web3.eth.getBlock("pending")
	.then(transactions =>{
		return transactions;
	})
	.then(transactionsArray =>{
		var result = transactionsArray.transactions;

        var length = result.length;

 		var allTransactions = [];	
        if(length > 0){
				for(i=0; i<length; i++){
       		const val = i;
        	web3.eth.getTransaction(result[val])
			.then(result=> {
				allTransactions.push(result);
				if (val == length - 1) {
					onSuccess(allTransactions,getEmptyFinalVar(),res);
				}else{
					console.log('i = ',val);
				}
			})
			.catch(error =>{
				sendEmptyArry(res);
			})
       	}
        }else{
        	sendEmptyArry(res);
        }		 
	})
	.catch(error => {
		sendEmptyArry(res);
	})
});

function sendEmptyArry(res){
	var finalResult = {
		"data" : []
	}

	res.send(finalResult);
}

app.get('/local_ip',(req,res)=>{
    var os = require('os');
    var interfaces = os.networkInterfaces();
    var addresses = [];
    for (var k in interfaces) {
        for (var k2 in interfaces[k]) {
            var address = interfaces[k][k2];
            if (address.family === 'IPv4' && !address.internal) {
                addresses.push(address.address);
            }
        }
    }
    res.send({ip:addresses[0]});
})

//variables for getting all and mytransactions
var txs = [];
var txsList = [];

//done
app.post('/getMyTransactions', (req,res) => {
	const { address } = req.body;

	txs.length = 0;

	web3.eth.getBlockNumber()
	.then(blockNumber => {
		console.log('blockNumber ',blockNumber);
		if (blockNumber > 0) {
			getAllTransactionsForMyTransations(0,blockNumber,address,res);
		}else{
			sendEmptyArry(res);
		}
	})
	.catch(err => {
		sendEmptyArry(res);
	})
})


function getAllTransactionsForMyTransations(currentBlock,lastBlock,address,res){
	if (currentBlock > lastBlock ) {
		console.log('currentBlock ', currentBlock)
		txsList.length = 0;

		console.log('transactions ',txs);
		getTransactionForMyList(txs,0,address,res);

	}else{
		web3.eth.getBlock(currentBlock)
		.then(result =>{
			let length = result.transactions.length;

			if (length > 0) {
				for(let j = 0; j < length; j++) {
					txs.push(result.transactions[j]);
				 }
	   		}

	   		currentBlock++;

	   		getAllTransactionsForMyTransations(currentBlock,lastBlock,address,res);

		})
		.catch(err =>{
			onFailure(getEmptyFinalVar(),res);
		})
	}
}


function getTransactionForMyList(txs,count,address,res){
	if (count == txs.length) {
		console.log('final list ',txsList);
		onSuccess(txsList,getEmptyFinalVar(),res);	
	}else{
		
		web3.eth.getTransaction(txs[count])
		.then(result => {
			if (result.from == address || result.to == address) {
				txsList.push(result);
			}
			
			count++;

			getTransactionForMyList(txs,count,address,res);
		})
		.catch(err => {
			onFailure(getEmptyFinalVar(),res);
		})
	}

}


//done
app.get('/getAllTransactions', (req,res) => {

	txs.length = 0;

	web3.eth.getBlockNumber()
	.then(result => {
		if (result > 0) {

			getAllTransactions(0,result,res);

		}else{
			sendEmptyArry(res);
		}
	})
	.catch(err =>{
		sendEmptyArry(res);
	})
})


function getAllTransactions(currentBlock,lastBlock,res) {
	if (currentBlock > lastBlock ) {
		txsList.length = 0;

		getTransactionFromList(txs,0,res);

	}else{
		web3.eth.getBlock(currentBlock)
		.then(result =>{
			let length = result.transactions.length;

			if (length > 0) {
				for(let j = 0; j < length; j++) {
				     txs.push(result.transactions[j]);
				 }
	   		}

	   		currentBlock++;

	   		getAllTransactions(currentBlock,lastBlock,res);

		})
	}
}



function getTransactionFromList(txs,count,res){
	if (count == txs.length) {
		onSuccess(txsList,getEmptyFinalVar(),res);	
	}else{
		web3.eth.getTransaction(txs[count])
		.then(result => {
			txsList.push(result);

			count++;

			getTransactionFromList(txs,count,res);
		})
	}

}

//done
app.get('/getPeers', (req,res) => {
	web3.admin.getPeers((err,data)=>{
		if (err) {
			onFailure(getEmptyFinalVar(),res);
		}else{
			onSuccess(data,getEmptyFinalVar(),res);
		}
	});
});

//done
app.get('/getPeersCount',(req,res) => {
	net.getPeerCount()
	.then(result =>{
		onSuccess(result,getEmptyFinalVar(),res);
	})
	.catch(err => {
		onFailure(getEmptyFinalVar(),res);
	})
});

//done
app.post('/addPeer', (req, res) => {
	const { enode } = req.body;

	var finalResult = {
		"data" : null
	}

	web3.admin.addPeer(enode,(err,data) => {
		if (data) {
			onSuccess(data,getEmptyFinalVar(),res);
		}else{
			onFailure(getEmptyFinalVar(),res);
		}
	})
});

//done
app.post('/startMining', (req,res) => {
	const { threads } = req.body;

		web3.eth.getBlockNumber()
		.then(result => {
			fromBlock = result;
			web3.miner.start(threads,(err,data)=>{
				console.log(err,data);
				if (err) {
					onFailure(getEmptyFinalVar(),res);
				}else{
					onSuccess(true,getEmptyFinalVar(),res);
				}
		});
	})
});


//get mined blocks when mining started
app.post('/getMinedBlock', (req,res) => {
	const { blockNumber } = req.body;

	web3.eth.getBlock(blockNumber)
	.then(result =>{
		onSuccess(result,getEmptyFinalVar(),res);
	})
	.catch(err => {
		onFailure(getEmptyFinalVar(),res);
	})
});

//done
app.get('/stopMining', (req,res) => {
	const { threads } = req.body;

		web3.eth.getBlockNumber()
		.then(result =>{
			lastBlock = result;
			console.log(lastBlock);

			web3.miner.stop((err,data)=>{
			if (err) {
				onFailure(getEmptyFinalVar(),res);
			}else{
				onSuccess(true,getEmptyFinalVar(),res);
			}
		});
	})
});

//get node id(done)
app.get('/getNodeId', (req,res) => {
	web3.admin.nodeInfo((err,data) =>{
		if (data) {
			onSuccess(data.id,getEmptyFinalVar(),res);
		}else{
			onFailure(getEmptyFinalVar(),res);
		}
	});
});

//get genesis(done)
app.get('/getGenesis', (req,res) => {
	web3.admin.nodeInfo((err,data) =>{
		if (data) {
			onSuccess(data.protocols.eth.genesis,getEmptyFinalVar(),res);
		}else{
			onFailure(getEmptyFinalVar(),res);
		}
	});
});

//get data dir(done)
app.get('/getDatadir', (req,res) => {
	web3.admin.datadir((err,data) =>{
		if (data) {
			onSuccess(data,getEmptyFinalVar(),res);		
		}else{
			onFailure(getEmptyFinalVar(),res);
		}
	});
});


//get enode(done)
app.get('/getEnode', (req,res) => {
	web3.admin.nodeInfo((err,data) =>{
		if (data) {
			onSuccess(data.enode,getEmptyFinalVar(),res);
		}else{
			onFailure(getEmptyFinalVar(),res);
		}
	});
});

//get peers id(done)
app.get('/getPeersId', (req,res) => {
	web3.admin.getPeers()
	.then(result =>{
		console.log('result ',result);
		return result;
	})
	.then(peersList => {
		if (peersList.length > 0) {

			var ids = [];

			for(let i=0; i<peersList.length; i++){
				const val = i;
				ids.push(peersList[i].id);

				if (val == peersList.length - 1) {
					onSuccess(ids,getEmptyFinalVar(),res);
				}
			}

		}else{
			sendEmptyArry(res);
		}
	})
	.catch(err =>{
		sendEmptyArry(res);
	})
});

//unlock account(done)
app.post('/unlockAccount',(req,res) => {
	const { address, password } = req.body;

	web3.personal.unlockAccount(address,password)
	.then(result =>{
		onSuccess(result,getEmptyFinalVar(),res);
	})
	.catch(err => {
		onFailure(getEmptyFinalVar(),res);
	})
});


//lock account(done)
app.post('/lockAccount',(req,res) => {
	const { address } = req.body;

	web3.personal.lockAccount(address)
	.then(result =>{
		onSuccess(result,getEmptyFinalVar(),res);
	})
	.catch(err => {
		onFailure(getEmptyFinalVar(),res);
	})
});

var myminedblocks = [];

//get my mined blocks by user
app.post('/getMyMinedBlocks',(req,res) => {
		myminedblocks.length = 0;
		const { mineraddress } = req.body;

		web3.eth.getBlockNumber()
		.then(blockNumber =>{
			console.log(blockNumber);
			return blockNumber;
		})
		.then(blockNumber =>{
			if (blockNumber > 0) {
				getMinedBlocks(0,blockNumber,mineraddress,res);
			}
	});
})


function getMinedBlocks(blockNumber,lastBlock,mineraddress,res){
	if (blockNumber > lastBlock) {
		onSuccess(myminedblocks,getEmptyFinalVar(),res);
	}else{
		web3.eth.getBlock(blockNumber)
		.then(result =>{
			if (safeCompare(mineraddress.toUpperCase(),result.miner.toUpperCase())) {
				myminedblocks.push(result);
				console.log('equal')
			}else{
				console.log('not equal');
			}
			blockNumber++;

			getMinedBlocks(blockNumber,lastBlock,mineraddress,res);
		})
	}
}

var blocksMined = 0;

//get my MiningReward
app.post('/getMyMiningReward', (req,res) => {
	blocksMined = 0;

	const { mineraddress } = req.body;

	getMyMiningReward(fromBlock,lastBlock,mineraddress,res);
})



function getMyMiningReward(fromBlock, lastBlock, mineraddress, res){
	if (fromBlock > lastBlock) {
		miningReward = blocksMined * 5;
		onSuccess(miningReward,getEmptyFinalVar(),res);
	}else{
		web3.eth.getBlock(fromBlock)
		.then(result =>{
			if (safeCompare(mineraddress.toUpperCase(),result.miner.toUpperCase())) {
				blocksMined ++;
			}else{
				console.log('not equal');
			}

			fromBlock++;
			getMyMiningReward(fromBlock,lastBlock,mineraddress,res);
		})
	}
}

app.listen(port, () => {
	console.log('server started at ', port);
})
