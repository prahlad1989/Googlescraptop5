function eachSite(url){
  let response=UrlFetchApp.fetch(url).getContentText();
  xml=XmlService.parse(response);
}

function onOpen() {
    var ui = SpreadsheetApp.getUi().createMenu('GoogleScrape')
        .addItem('Search', 'scrapeGoogle')
        .addToUi();
}

function getTags(root,accum,tagList){
  html.getChildren().forEach(function(child){
    if(tagList.indexOf(child.getName())!= -1)
      accum.push([child.getName(), child.getText()]);
    getTags(child,accum,tagList);
  })
}

function Bad() {
  SpreadsheetApp.getActive().getActiveSheet().getCurrentCell().setValue("223er");
  SpreadsheetApp.getUi().alert("gsda");
  map=new Map();
  value=SpreadsheetApp.getActive().getActiveSheet().getRange("c11:c11").getValue().toString();
  
  range=SpreadsheetApp.getActive().getActiveSheet().getRange(1,4,4,2).getValues().forEach(function(row){
    value=value.replace('/'+row[0]+'/g',row[1]);
  });
  
  SpreadsheetApp.getUi().alert(value);
  SpreadsheetApp.getActive().getActiveSheet().getRange("c11:c11").setValue(value);
}




function scrapeGoogle() {
  tic=new Date().getTime()/1000;
  let spread=SpreadsheetApp.getActive();
  let inputSheet=spread.getSheetByName("Overview");
  var domain=inputSheet.getRange(2,2,1,1).merge().getValue();
  var query=inputSheet.getRange(1, 2, 1, 1).merge().getValue();
  if(!query || !domain){
    SpreadsheetApp.getUi().alert("Give Input");
    return;
  }
  var url="http://recoil.co.in/googlescrape?domain="+domain+"&query="+encodeURIComponent(query);
  console.log(url);
  var response=UrlFetchApp.fetch(url,{"muteHttpExceptions":true,"USER_AGENT" : "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.14; rv:65.0) Gecko/20100101 Firefox/65.0"}).getContentText();

  
  searchResults=JSON.parse(response).searchResults;
  sizeMap={"h1":16,"h2":14,"h3":12,"h4":10,"h5":8};
  let sheetName=query.substring(0,Math.min(25,query.trim().length));
  
  sheet=spread.getSheetByName(sheetName);
  sheet && spread.deleteSheet(sheet); //if sheet exists delete
  sheet=spread.getSheetByName("Model").copyTo(spread).setName(sheetName);
  sheet=spread.getSheetByName(sheetName);
  sheet.getRange("b1:b1").setValue(query).setBackground("#999999");
  sheet.getRange("d1:d1").setValue(domain).setBackground("#999999");
  sheet.getRange("f1:f1").setValue(new Date()).setBackground("#999999");
  
  let resultNums=[];
  for(let i=0;i<searchResults.length;i++){
    resultNums.push(i+1);
  }
  sheet.getRange(3,2,1,resultNums.length).setValues([resultNums]);
  
  let links=searchResults.map(function(eachResult,i){
    return eachResult.link;
  });                                   
  sheet.getRange(2, 2, 1, links.length).setValues([links]);
  
  let titles=searchResults.map(function(eachResult,i){
    return eachResult.title;
  });                                   
  sheet.getRange(4, 2, 1, titles.length).setValues([titles]).setFontSize(11);
  
  searchResults.forEach(function(eachResult,i){
    console.log("each resut %s", eachResult);
    let scraped=eachResult.scarpe
    let values=scraped.map(function(x){
      value=x[1];
      value=value.replaceAll("Ã¶","ö");
      return value;
    });
    let fonts=scraped.map(function(x){
      let fontsizeForTag=sizeMap[x[0]]
      return [fontsizeForTag];
    });
    
    values.length>0 && sheet.getRange(5, i+2, values.length).setValues(values).setFontSizes(fonts);
    
  });                                                                                         
  
  sheet.getRange(1, 1, sheet.getLastRow(), sheet.getLastColumn()).setHorizontalAlignment("left").setVerticalAlignment("top").setWrap(true);
  //process
  spread.setActiveSheet(sheet);
  console.log(searchResults.length);
  toc=new Date().getTime()/1000;
  //SpreadsheetApp.getUi().alert(toc-tic);
}
                        
                       
                        



