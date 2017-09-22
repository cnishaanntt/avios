/////////////////////////////////////////////////////////////////////
// Copyright (c) Autodesk, Inc. All rights reserved
// Written by Forge Partner Development
//
// Permission to use, copy, modify, and distribute this software in
// object code form for any purpose and without fee is hereby granted,
// provided that the above copyright notice appears in all copies and
// that both that copyright notice and the limited warranty and
// restricted rights notice below appear in all supporting
// documentation.
//
// AUTODESK PROVIDES THIS PROGRAM "AS IS" AND WITH ALL FAULTS.
// AUTODESK SPECIFICALLY DISCLAIMS ANY IMPLIED WARRANTY OF
// MERCHANTABILITY OR FITNESS FOR A PARTICULAR USE.  AUTODESK, INC.
// DOES NOT WARRANT THAT THE OPERATION OF THE PROGRAM WILL BE
// UNINTERRUPTED OR ERROR FREE.
/////////////////////////////////////////////////////////////////////

if (!window.jQuery) alert('jQuery is required for this sample');
if (!window.XLSX) alert('Sheet JS is required for this sample');
//var fs=require('fs');

 var tryRequire = require('try-require');
  //var fs = tryRequire.resolve('fs');
  

function team(){
// var fs = require('fs');//.createWriteStream('hello'); //, {flags: 'a'});
  //f.write('test'); 
 // f.end();
  //var bb = new Blob([s2ab(f)], {type: "text/plain;charset=utf-8"});
  //fs.exists('new.txt'){alert('hi)}
  //saveAs(f, "hi world.txt");
 
 alert( tryRequire.lastError() );
  var a=0;
 // alert('f:'+ f);
  alert('a:'+ a);
}

var ForgeXLS = {
  Utility: {
    Constants: {
      BASE_URL: 'https://developer.api.autodesk.com',
      MODEL_DERIVATIVE_V2: '/modelderivative/v2/designdata/'
    },

    forgeGetRequest: function (url, token, callback) {
      jQuery.ajax({
        url: url,
        beforeSend: function (request) {
          request.setRequestHeader('Authorization', 'Bearer ' + token);
        },
        success: function (response) {
          if (response.result && response.result === 'success') {
            setTimeout(function () {
              $.notify('Please wait. Retrieving meta-data for ' + fileName, { className: "info", position:"bottom right" });
              ForgeXLS.Utility.forgeGetRequest(url, token, callback);
            }, 3000);
            return;
          }
          if (callback)
            callback(response);
        }
      });
    },
    getMetadata: function (urn, token, callback) {
      console.log('Downloading metadata...');
      this.forgeGetRequest(this.Constants.BASE_URL + this.Constants.MODEL_DERIVATIVE_V2 + urn + '/metadata', token, callback);
    },

    getHierarchy: function (urn, guid, token, callback) {
      console.log('Downloading hierarchy...');
      this.forgeGetRequest(this.Constants.BASE_URL + this.Constants.MODEL_DERIVATIVE_V2 + urn + '/metadata/' + guid, token, callback);
    },

    getProperties: function (urn, guid, token, callback) {
      console.log('Downloading properties...');
      this.forgeGetRequest(this.Constants.BASE_URL + this.Constants.MODEL_DERIVATIVE_V2 + urn + '/metadata/' + guid + '/properties', token, callback);
    }
  },

  downloadXLSX: function (urn, fileName, token, status, fileType) {    
    if (fileType.indexOf('rvt') == -1) {
      if (status) status(true, 'Not a Revit file. Only Revit files are supported, at the moment. Aborting conversion.');
      return;
    }

    if (status) {
      status(false, 'Preparing ' + fileName);
      status(false, 'Reading project information....');
    }

    this.prepareTables(urn, token, function (tables) {
      if (status) status(false, 'Building XLSX file...');

      var wb = new Workbook();
      jQuery.each(tables, function (name, table) {
     //  console.log(table);                                                 //intro
      // console.log(name);                                                  //intro
        
        /* fs.appendFile('empirestate.txt', 'table : '+ table +'and name : '+name, (err) => {  
            if (err) throw err;
            console.log('The lyrics were updated!');
        }); */
        
        //var f = require('fs').createWriteStream('table : '+ table +'and name : '+name, {flags: 'a'});
        

        if (name.indexOf('<')==-1) { // skip tables starting with <
          var ws = ForgeXLS.sheetFromTable(table);
          wb.SheetNames.push(name);
          wb.Sheets[name] = ws;
        }
      });

      var wbout = XLSX.write(wb, {bookType: 'xlsx', bookSST: true, type: 'binary'});
      saveAs(new Blob([s2ab(wbout)], {type: "application/octet-stream"}), fileName);
      
     
      
      if (status) status(true, 'Downloading...');
    })
  },

  sheetFromTable: function (table) {
    var ws = {};
    var range = {s: {c: 10000000, r: 10000000}, e: {c: 0, r: 0}};

    var allProperties = [];
    table.forEach(function (object) {
      jQuery.each(object, function (propName, propValue) {
        if (allProperties.indexOf(propName) == -1)
         //console.log(propName);                                    //intro
          /* fs.appendFile('empirestate.txt', 'propName : '+ propName, (err) => {  
            if (err) throw err;
            console.log('The lyrics were updated!');
        }); */
          allProperties.push(propName);
      })
    });

    table.forEach(function (object) {
      allProperties.forEach(function (propName) {
        if (!object.hasOwnProperty(propName))
          object[propName] = '';
      });
    });

    var propsNames = [];
    for (var propName in table[0]) {
      propsNames.push(propName);
    }
    //propsNames.sort(); // removed due first 3 ID columns

    var R = 0;
    var C = 0;
    for (; C != propsNames.length; ++C) {
      var cell_ref = XLSX.utils.encode_cell({c: C, r: R});
      ws[cell_ref] = {v: propsNames[C], t: 's'};
    }
    R++;

    for (var index = 0; index != table.length; ++index) {
      C = 0;
      propsNames.forEach(function (propName) {
        if (range.s.r > R) range.s.r = 0;
        if (range.s.c > C) range.s.c = 0;
        if (range.e.r < R) range.e.r = R;
        if (range.e.c < C) range.e.c = C;
        var cell = {v: table[index][propName]};
        if (cell.v == null) return;
        var cell_ref = XLSX.utils.encode_cell({c: C, r: R});

        if (typeof cell.v === 'number') cell.t = 'n';
        else if (typeof cell.v === 'boolean') cell.t = 'b';
        else if (cell.v instanceof Date) {
          cell.t = 'n';
          cell.z = XLSX.SSF._table[14];
          cell.v = datenum(cell.v);
        }
        else cell.t = 's';

        ws[cell_ref] = cell;
        C++;
      });
      R++;
    }
    if (range.s.c < 10000000) ws['!ref'] = XLSX.utils.encode_range(range);
    return ws;
  },

  
  
  prepareTables: function (urn, token, callback) {
    this.Utility.getMetadata(urn, token, function (metadata) {
      if (metadata.data.metadata.length == 0) {
        alert('Unexpected metadata');
        return;
      }
      var guid = metadata.data.metadata[0].guid;
            //console.log('guid:'+guid);                                                                //intro
      /* fs.appendFile('empirestate.txt', 'guid : '+ guid, (err) => {  
            if (err) throw err;
            console.log('The lyrics were updated!');
        }); */
      ForgeXLS.Utility.getHierarchy(urn, guid, token, function (hierarchy) {
            //console.log('hierarchy:'+hierarchy);                                                      //intro
        
         /* fs.appendFile('empirestate.txt', 'hierarchy:'+hierarchy , (err) => {  
            if (err) throw err;
            console.log('The lyrics were updated!');
        }); */
        ForgeXLS.Utility.getProperties(urn, guid, token, function (properties) {
            //console.log('properties:'+properties);                                                    //intro
          /*  fs.appendFile('empirestate.txt','properties:'+properties, (err) => {  
            if (err) throw err;
            console.log('The lyrics were updated!');
        }); */
          
          callback(ForgeXLS.prepareRawData(hierarchy, properties));
        });
      });
    });
  },

  prepareRawData: function (hierarchy, properties) {
    var tables = {};
    hierarchy.data.objects[0].objects.forEach(function (category) {
      var idsOnCategory = [];
      ForgeXLS.getAllElementsOnCategory(idsOnCategory, category.objects);

      var rows = [];
      idsOnCategory.forEach(function (objectid) {
        var columns = ForgeXLS.getProperties(objectid, properties);
        //console.log('columns:'+columns);
        rows.push(columns);
      });
      tables[category.name] = rows;
    });
    return tables;
  },

  getAllElementsOnCategory: function (ids, category) {
    category.forEach(function (item) {
      if (typeof(item.objects) === 'undefined') {
        if (!ids.indexOf(item.objectid) >= 0)
         //console.log('item.objectId:'+item.objectId);                                            //intro
          /*  fs.appendFile('empirestate.txt','item.objectId:'+item.objectId, (err) => {  
            if (err) throw err;
            console.log('The lyrics were updated!');
        }); */
          
          ids.push(item.objectid);
      }
      else
        ForgeXLS.getAllElementsOnCategory(ids, item.objects);
    });
  },

  getProperties: function (id, objCollection) {
    var data = {};
    objCollection.data.collection.forEach(function (obj) {
      if (obj.objectid != id) return;

      data['Viewer ID'] = id;
      data['Revit ID'] = obj.name.match(/\d+/g)[0];      
      data['Name'] = obj.name.replace('[' + data['Revit ID'] + ']', '').trim();
      
      //console.log('data[Name]':+ data['Name']);                                               //intro
      
        /*  fs.appendFile('empirestate.txt','data[Name]':+ data['Name'], (err) => {  
            if (err) throw err;
            console.log('The lyrics were updated!');
        }); */

      for (var propGroup in obj.properties) {
        if (propGroup.indexOf('__') > -1) break;
        if (obj.properties.hasOwnProperty(propGroup)) {
          for (var propName in obj.properties[propGroup]) {
            if (obj.properties[propGroup].hasOwnProperty(propName) && !Array.isArray(obj.properties[propGroup][propName]))
              data[propGroup + ':' + propName] = obj.properties[propGroup][propName];
          }
        }
      }
    });
    //console.log('data:'+ data);                                                            //intro
    
   /*  fs.appendFile('empirestate.txt','data:'+ data, (err) => {  
            if (err) throw err;
            console.log('The lyrics were updated!');
        }); */

    return data;
  }
};

function Workbook() {
  if (!(this instanceof Workbook)) return new Workbook();
  this.SheetNames = [];
  //console.log('this.SheetNames :'+this.SheetNames);                                       //intro
   /* fs.appendFile('empirestate.txt','this.SheetNames :'+this.SheetNames, (err) => {  
            if (err) throw err;
            console.log('The lyrics were updated!');
        }); */
  this.Sheets = {};
 // console.log('this.Sheets :'+this.Sheets);                                              //intro
   /* fs.appendFile('empirestate.txt','this.Sheets :'+this.Sheets, (err) => {  
            if (err) throw err;
            console.log('The lyrics were updated!');
        }); */
}

function datenum(v, date1904) {
  if (date1904) v += 1462;
  var epoch = Date.parse(v);
  return (epoch - new Date(Date.UTC(1899, 11, 30))) / (24 * 60 * 60 * 1000);
}

function s2ab(s) {
  var buf = new ArrayBuffer(s.length);
  var view = new Uint8Array(buf);
  for (var i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
  return buf;
}

function glu(){
  var blob = new Blob(["hi"], {type: "text/plain;charset=utf-8"});
  saveAs(blob, "hello world.txt");
   //alert('go');
  alert('file:'+f);
  alert('haha');
}

