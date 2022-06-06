
var http = require('http');
const fetch = require("node-fetch");

var server = http.createServer(function(req, res) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    var message = 'It works!\n',
        version = 'NodeJS ' + process.versions.node + '\n',
        response = [message, version].join('\n');
    res.end(response);


    function isContract(contract,i)
    {
      var smart  = contract.result;
      //console.log(smart[0].SourceCode);
      if(smart[0].ABI == "Contract source code not verified")
      {console.log(i + " Not a smart contract:");}
      else {console.log(i+ " Smart contract:");}
    }
    
    function topHolders(data){
      var holders = data.result;
      var n = Object.keys(holders).length;
      console.log(n);
      
      function GetSortOrder(prop) {    
        return function(a, b) {    
            if (a[prop].length >= b[prop].length) {    
                return a[prop] > b[prop];
            } 
            return -1;    
        }    
    }    
        
    holders.sort(GetSortOrder("TokenHolderQuantity"));
    
    console.log("Top holders : ");    
    for (let i = n-1 ; i>=n-5; i--) {    
      fetch('https://api.bscscan.com/api?module=contract&action=getsourcecode&address='+holders[i].TokenHolderAddress+'&apikey=HYPEI3YFZWIYN13S18VQC3CNHRA51PC7DB')
      .then(response => response.json())
      .then(contract => isContract(contract,n-i));
        console.log(n-i + ". " + holders[i].TokenHolderAddress + " " + holders[i].TokenHolderQuantity);    
    }
    post

    }
});
server.listen();


/*
fetch('https://api.bscscan.com/api?module=token&action=tokenholderlist&contractaddress=0x8FA59693458289914dB0097F5F366d771B7a7C3F&page=1&offset=10000&apikey=HYPEI3YFZWIYN13S18VQC3CNHRA51PC7DB')
  .then(response => response.json())
  .then(data => topHolders(data));
*/
//const holders = JSON.parse(response.result);

