
//Imports
var fs = require('fs');
var stream = require('stream');

//Creating OutStreams for each json file
var outStream1 = fs.createWriteStream("json/gdpgni2005.json");
var outStream2 = fs.createWriteStream("json/gdpgnipc2005.json");
var outStream3 = fs.createWriteStream("json/gdpindia.json");
var outStream4 = fs.createWriteStream("json/aggregate.json");


//Creating Instream and Reading Files
var rl = require('readline').createInterface({
  input: require('fs').createReadStream('WDI_Data.csv')
});

var string = fs.readFileSync('json/continents.json');
var continents =JSON.parse(string);

//Creating global Variables and arrays
var heading = new Array();

var gdpgni2005 = new Array();
var gdpgnipc2005 = new Array();

var gdppercapita2005 = new Array();
var gdpindia = new Array();

var gdp2005 = new Array();
var gni2005 = new Object();
var gnipercapita2005 = new Object();


var master = new Array();
var aggregate = new Object();


aggregate["ASIA"]=new Array();
aggregate["AFRICA"]=new Array();
aggregate["EUROPE"]=new Array();
aggregate["N_AMERICA"]=new Array();
aggregate["S_AMERICA"]=new Array();
aggregate["OCEANIA"]=new Array();

for (i=0;i<56;i++){

  aggregate.ASIA[i]=0.0;
  aggregate.AFRICA[i]=0.0;
  aggregate.EUROPE[i]=0.0;
  aggregate.N_AMERICA[i]=0.0;
  aggregate.S_AMERICA[i]=0.0;
  aggregate.OCEANIA[i]=0.0;
}


//Reading the Main Data

rl.on('line', function(line) {
  currentLine=line.split(",");

//Heading saved in a array
  if(currentLine[0]=="Country Name")
    //for(i in currentLine){
      heading=currentLine;
  //}
  else if (currentLine[2]=="GDP (constant 2005 US$)"){
        if(continents[currentLine[0]] != undefined){
        var obj = new Object();
        obj["Country"]=currentLine[0];
        obj["Value"]=parseFloat(currentLine[49]);
        gdp2005.push(obj);
      }
  }
  else if(currentLine[2]=="GNI (constant 2005 US$)"){
      if(continents[currentLine[0]] != undefined)
      gni2005[currentLine[0]]=parseFloat(currentLine[49]);
  }
  else if(currentLine[2]=="GDP per capita (constant 2005 US$)"){
        if(continents[currentLine[0]] != undefined){
        var obj = new Object();
        obj["Country"]=currentLine[0];
        obj["Value"]=parseFloat(currentLine[49]);
        gdppercapita2005.push(obj);
      }

        for(i=4;i<currentLine.length;i++)
            if(!isNaN(parseFloat(currentLine[i])) && continents[currentLine[0]] != undefined)
            aggregate[continents[currentLine[0]]][i-4]=aggregate[continents[currentLine[0]]][i-4]+parseFloat(currentLine[i]);

  }
  else if(currentLine[2]== "GNI per capita (constant 2005 US$)"){
    if(continents[currentLine[0]] != undefined)
    gnipercapita2005[currentLine[0]]=parseFloat(currentLine[49]);

  }
  else if(currentLine[2]== "GDP growth (annual %)" && currentLine[0]=='India'){

    for(i=4;i<currentLine.length;i++){
      var obj = new Object;
      obj["Year"]=heading[i];
      obj["Value"]=parseFloat(currentLine[i]);
      gdpindia.push(obj);
    }

  }


});

rl.on('close', function(){

  for(i=4;i<60;i++){
    newObj= new Object();
    newObj["Year"]=heading[i];
    newObj["ASIA"]=aggregate.ASIA[i-4];
    newObj["AFRICA"]=aggregate.AFRICA[i-4];
    newObj["EUROPE"]=aggregate.EUROPE[i-4];
    newObj["N_AMERICA"]=aggregate.N_AMERICA[i-4];
    newObj["S_AMERICA"]=aggregate.S_AMERICA[i-4];
    newObj["OCEANIA"]=aggregate.OCEANIA[i-4];
    master.push(newObj)
  }

gdp2005.sort(function(a,b){return b.Value - a.Value});
//console.log(gni2005);
  for (i=0;i<15;i++){
      var obj = new Object();
      obj["Country"]=gdp2005[i].Country;
      obj["GDPUS$"]=gdp2005[i].Value;
      obj["GNIUS$"] =gni2005[gdp2005[i].Country];
      gdpgni2005.push(obj);
  }

  gdppercapita2005.sort(function(a,b){return b.Value - a.Value});

  for (i=0;i<15;i++){
      var obj = new Object();
      obj["Country"]=gdppercapita2005[i].Country;
      obj["GDPPC"]=gdppercapita2005[i].Value;
      obj["GNIPC"] =gnipercapita2005[gdppercapita2005[i].Country];
      gdpgnipc2005.push(obj);
  }

//Creating all json files
outStream1.write(JSON.stringify(gdpgni2005));
outStream2.write(JSON.stringify(gdpgnipc2005));
outStream3.write(JSON.stringify(gdpindia));
outStream4.write(JSON.stringify(master));

});
