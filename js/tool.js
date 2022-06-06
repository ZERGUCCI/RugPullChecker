var userBalance;
var account;
var ownsSheep;
var contractSourceCode;
var masterChefBurn = false;
var foundBurn = false;
var masterChefTimelock = false;
var foundTimelock = false;
var minimumSheeepRequirment = 1000000;
var devisor;

//ALL API KEYS USED ARE FREE. DONT STEAL JUST GO MAKE YOUR OWN AT BSCSCAN... EASIER THAN SCRAPING THIS WEBSITE FOR THEM

const ethereumButton = document.querySelector('.enableEthereumButton');

ethereumButton.addEventListener('click', () => {
    getAccount();
});

async function getAccount() {
  var accounts = await ethereum.request({ method: 'eth_requestAccounts' });
  account = accounts[0];
  ethereumButton.innerText = truncateAddress(account);
  checkSheepBalance(account);
}

function truncateAddress(str) {
  return str.slice(0, 4) + '...' + str.slice(-4)
}

window.checkSheepBalance = function(address){
  //This is using a free API key, no point in stealing just go make one at https://bscscan.com
  $.getJSON("https://api.bscscan.com/api?module=account&action=tokenbalance&contractaddress=0x0025B42bfc22CbbA6c02d23d4Ec2aBFcf6E014d4&address=" + address + "&tag=latest&apikey=AKN8YGBUZGGQYPKYT9WU9PPMJRAR8534MR",loadData);
}

function loadData(data){
  userBalance = data.result;
  return payWall(userBalance);
}

function payWall(userBalance){
  if ((parseFloat(userBalance, 10)/Math.pow(10,devisor)) >= minimumSheeepRequirment){
    ownsSheep = false;
  } else{
    ownsSheep = true;
  } 
}

async function checkMetamask() {
    if (typeof window.ethereum !== 'undefined') {
        ethereum.isConnected();
      try {
        // Request account access
        await window.ethereum.enable();
        return true
      } catch(e) {
        // User denied access
        return false
      }
    }
}

if (typeof window.ethereum !== 'undefined') {
    console.log('MetaMask is installed!');
}

function checkForBurnFunction(contractSourceCode){
  if(contractSourceCode){
    //console.log(contractSourceCode);
    if((contractSourceCode.search("function burn") != -1)||(contractSourceCode.search("function Burn") != -1)||(contractSourceCode.search("_Burn") != -1)){
      return true;
    }
    else{
      return false;
    }
  }
}

function checkForTimeLock(contractSourceCode){
  if(contractSourceCode){
    if((contractSourceCode.search("releaseTime") != -1)||(contractSourceCode.search("TimeLock") != -1)||(contractSourceCode.search("TokenTimelock") != -1)||(contractSourceCode.search("Liquidity lock") != -1)){
      return true;
    }
    else{
      return false;
    }
  }
}

function isContract(contract,i){
  var smart  = contract.result;

  if(smart[0].ABI == "Contract source code not verified"){
    document.getElementById("smartContract"+(i)).innerHTML = "No";
  }
  else {
    document.getElementById("smartContract"+(i)).innerHTML = "Yes";
    var isBurnFunction = checkForBurnFunction(smart[0].SourceCode);
    var hasTimelock = checkForTimeLock(smart[0].SourceCode);
    
    if((isBurnFunction)&&(masterChefBurn == false)){
      foundBurn = true;
      document.getElementById("BurnInformationParagraph").innerHTML = "A Burn function was found within a contract that is one of the top 5 lquidity holders but not in the masterchef contract for the pool.";
      document.getElementById("BurnInformationParagraph").style.color = "#FF8000";
    }else{
      if((isBurnFunction)&&(masterChefBurn == true)){
        foundBurn = true;
        document.getElementById("BurnInformationParagraph").innerHTML = "A Burn function was found within a contract that is one of the top 5 liqudity holders and in the masterchef contract for the pool.";
        document.getElementById("BurnInformationParagraph").style.color = "green";
      }
    }

    if((hasTimelock)&&(masterChefTimelock == false)){
      foundTimelock = true;
      document.getElementById("TimelockInformationParagraph").innerHTML = "A timelock function was found within a contract that is one of the top 5 lquidity holders but not in the masterchef contract for the pool.";
      document.getElementById("TimelockInformationParagraph").style.color = "#green";
    }else{
      if((hasTimelock)&&(masterChefTimelock == true)){
        foundTimelock = true;
        document.getElementById("TimelockInformationParagraph").innerHTML = "A timelock function was found within a contract that is one of the top 5 liqudity holders and in the masterchef contract for the pool.";
        document.getElementById("TimelockInformationParagraph").style.color = "green";
      }
    }   
  }
}

function topHolders(data, masterchef){
  var holders = data;
  var n = Object.keys(holders).length;

  

  function GetSortOrder(prop) {    
    return function(a, b) {    
        if (parseFloat(a[prop],10) > parseFloat(b[prop],10)) {    
            return 1;    
        } else if (parseFloat(a[prop],10) < parseFloat(b[prop],10)) {    
            return -1;    
        }    
        return 0;    
    }    
  }
    

  holders.sort(GetSortOrder("TokenHolderQuantity"));
  document.getElementById("returnHeader").innerHTML = "List of Top Holders in Pool";

  $.getJSON('https://api.bscscan.com/api?module=contract&action=getsourcecode&address='+masterchef+'&apikey=HYPEI3YFZWIYN13S18VQC3CNHRA51PC7DB%27', function(data){
    //document.getElementById("smartContract"+(i)).innerHTML = "Yes";
    // console.log(masterchef);
    // console.log(data.result);
    var masterChefBurnFunction = checkForBurnFunction(data.result[0].SourceCode);
    var masterChefHasTimelock = checkForTimeLock(data.result[0].SourceCode);
    // console.log(masterChefBurnFunction);
    // console.log(masterChefHasTimelock);

    if(masterChefBurnFunction){
      masterChefBurn = true;
      document.getElementById("BurnInformationParagraph").innerHTML = "A Burn function was found in the masterchef contract for this pool.";
      document.getElementById("BurnInformationParagraph").style.color = "#88CC00";
    }

    if(masterChefHasTimelock){
      masterChefTimelock = true;
      document.getElementById("TimelockInformationParagraph").innerHTML = "A Timelock function was found in the masterchef contract for this pool.";
      document.getElementById("TimelockInformationParagraph").style.color = "#88CC00";
    }
  });

  

  for (let i = n-1 ; i>=n-5; i--) {
    // This is using a free API key, no point in stealing just go make one at https://bscscan.com
    fetch('https://api.bscscan.com/api?module=contract&action=getsourcecode&address='+holders[i].TokenHolderAddress+
    '&apikey=HYPEI3YFZWIYN13S18VQC3CNHRA51PC7DB%27')
      .then(response => response.json())
      .then(contract => isContract(contract,n-i,masterchef));
    document.getElementById("rank"+(n-i)).innerHTML = (n-i)+". ";
    document.getElementById("address"+(n-i)).innerHTML = (holders[i].TokenHolderAddress);
    document.getElementById("quantity"+(n-i)).innerHTML =  parseFloat(holders[i].TokenHolderQuantity, 10)/Math.pow(10,devisor);
  }

  var dEadBurn = holders.find(item => item.TokenHolderAddress === "0x000000000000000000000000000000000000dead");
  if(dEadBurn){
    var LPHeldBy0xdEad = parseFloat(dEadBurn.TokenHolderQuantity, 10)/Math.pow(10,devisor);
    document.getElementById("BurnAmountHeldBy0xdEad").innerHTML = "The industry standard burn address 0xdead contains: " + LPHeldBy0xdEad + " LP tokens";
    if (LPHeldBy0xdEad > 100){
      document.getElementById("BurnAmountHeldBy0xdEad").style.color = "green";
    }else{
      document.getElementById("BurnAmountHeldBy0xdEad").style.color = "#E6E600";
    }
  }else{
    document.getElementById("BurnAmountHeldBy0xdEad").innerHTML = "The industry standard burn address 0xdead is not in use for this LP token. Although it is possible they are burning to a different address, this should raise some concern...";
    document.getElementById("BurnAmountHeldBy0xdEad").style.color = "red";
  }

  var zeroOneBurn = holders.find(item => item.TokenHolderAddress === "0x0000000000000000000000000000000000000001");
  if(zeroOneBurn){
    var LPHeldBy0x1 = parseFloat(zeroOneBurn.TokenHolderQuantity, 10)/Math.pow(10,devisor);
    document.getElementById("BurnAmountHeldBy0x1").innerHTML = "The industry standard burn address 0x1 contains: " + LPHeldBy0x1 + " LP tokens";
    if (LPHeldBy0x1 > 100){
      document.getElementById("BurnAmountHeldBy0x1").style.color = "green";
    }else{
      document.getElementById("BurnAmountHeldBy0x1").style.color = "#E6E600";
    }
  }else{
    document.getElementById("BurnAmountHeldBy0x1").innerHTML = "The industry standard burn address 0x1 is not in use for this LP token. Although it is possible they are burning to a different address, this should raise some concern...";
    document.getElementById("BurnAmountHeldBy0x1").style.color = "red";
  }


  var zeroBurn = holders.find(item => item.TokenHolderAddress === "0x0000000000000000000000000000000000000000");
  if(zeroBurn){
    var LPHeldBy0x0 = parseFloat(zeroBurn.TokenHolderQuantity, 10)/Math.pow(10,devisor);
    document.getElementById("BurnAmountHeldBy0x0").innerHTML = "The industry standard burn address 0x0 contains: " + LPHeldBy0x0 + " LP tokens";
    if (LPHeldBy0x0 > 100){
      document.getElementById("BurnAmountHeldBy0x0").style.color = "green";
    }else{
      document.getElementById("BurnAmountHeldBy0x0").style.color = "#E6E600";
    }
  }else{
    document.getElementById("BurnAmountHeldBy0x0").innerHTML = "The industry standard burn address 0x0 is not in use for this LP token. Although it is possible they are burning to a different address, this should raise some concern...";
    document.getElementById("BurnAmountHeldBy0x0").style.color = "red";
  }

  window.scrollBy(0,400);
}

document.getElementById("tool-search-bar-icon").onclick = function(){
  if(ownsSheep){
    document.getElementById("connect-wallet-reminder").innerHTML = "";

    var inputContract = document.getElementById("tool-search-bar-input").value;
    var holders = [{}];
    var x = 10;

    $.ajaxSetup({
      async: false
    });

    $.getJSON('https://api.bscscan.com/api?module=token&action=tokeninfo&contractaddress='+inputContract+'&apikey=HYPEI3YFZWIYN13S18VQC3CNHRA51PC7DB%27', function(data){
      //console.log(data);  
      devisor = data.result[0].divisor;
    });
    //console.log(devisor);


    for(let i = 1; i <= x; i++){
      $.getJSON('https://api.bscscan.com/api?module=token&action=tokenholderlist&contractaddress='+inputContract+ '&page='+i+'&offset=10000&apikey=HYPEI3YFZWIYN13S18VQC3CNHRA51PC7DB', function(data){
        if(data.status == "1"){
          holders = holders.concat(data.result);
        }
        else{
          x = i;
          topHolders(holders, inputContract);
        }
      });
    }

    document.getElementById("PoolInformation").innerHTML = "Pool Information";

    document.getElementById("whatIsBurnHeader").innerHTML = "What is Burning?";
    document.getElementById("whatIsBurn").innerHTML = "Cryptocurrency tokens or coins are burned when they are permanently removed from the circulating supply on purpose — as opposed to assets that are lost on accident, like by being unintentionally sent to an address with no owner or via the loss of access to the wallet where they are stored. Token burning is usually performed by the development team behind a particular cryptocurrency asset. It can be done in several ways, most commonly by sending the coins to a so-called “eater address”: its current balance is publicly visible on the blockchain, but access to its contents is unavailable to anyone. Burning can be done with different goals in mind, but most often it is used for deflationary purposes: the decrease in the circulating supply tends to drive an asset’s price upward, incentivizing traders and investors to get involved. Having a burn function or finding alot of liqudity tokens in the standard burn addresses gives people reassurance a pool is not gonna bee rug pulled.";
    document.getElementById("burnResults").innerHTML = "Burn Results";
    document.getElementById("BurnInformation").innerHTML = "Burn Information";
    if((masterChefBurn == false)&&(foundBurn == false)){
      document.getElementById("BurnInformationParagraph").innerHTML = "A burn function was not found in either the masterchef or any of the top liquidity smart contracts...";
      document.getElementById("BurnInformationParagraph").style.color = "red"
    }
    
    document.getElementById("whatIsTimelockHeader").innerHTML = "What is a Timelock?";
    document.getElementById("whatIsTimelock").innerHTML = "A timelock is a piece of code that locks a certain functionality of a smart contract until a specific amount of time has passed. Most often, this is the ability to transfer a token out of the contract. This makes it similar to a vesting schedule — funds won’t be accessible until a certain date, time, or block height. Timelocks have been used by many project owners to demonstrate their commitment to the ongoing health of their platform. In light of the numerous hacks, scams, and rugpulls across various DeFi platforms, timelocks are one indicator that a project is legitimate.";
    document.getElementById("timelockResults").innerHTML = "Timelock Results";
    document.getElementById("TimelockInformation").innerHTML = "Timelock Information";
    if((masterChefTimelock == false)&&(foundTimelock == false)){
      document.getElementById("TimelockInformationParagraph").innerHTML = "A timelock function was not found in either the masterchef or any of the top liquidity smart contracts...";
      document.getElementById("TimelockInformationParagraph").style.color = "red";
    }

    document.getElementById("rank").innerHTML = "Rank";
    document.getElementById("address").innerHTML = "Address";
    document.getElementById("quantity").innerHTML = "Quantity";
    document.getElementById("smart").innerHTML = "Smart Contract";

    $.ajaxSetup({
      async: true
    });

  }
  else{
    document.getElementById("connect-wallet-reminder").innerHTML = "Please connect a wallet with more than " + minimumSheeepRequirment + " sheeptoken in order to use the tool. If you have the minimum required sheeptoken but are still getting this error make sure your metamask is connected to the BSC network.";
  }
}

document.getElementById("tool-search-bar-input").onkeypress = function(e){
  if (!e) e = window.event;
  var keyCode = e.code || e.key;
  if (keyCode == 'Enter'){
    document.getElementById("tool-search-bar-icon").click();
  }
}
