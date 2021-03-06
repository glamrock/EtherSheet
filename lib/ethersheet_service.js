var util = require("util");
var events = require("events");
var ueberDB = require("ueberDB");
var uuid = require('node-uuid').v4;
var async = require('async');

/***********************************************
 * EtherSheetService
 ***********************************************/
var EtherSheetService = module.exports = function(config){
  var es = this;
  es.config = config;
  events.EventEmitter.call(this);
  this.connectionHandler = function(){};
  es.db = new ueberDB.database(
    es.config.db_type, {
    user: es.config.db_user, 
    host: es.config.db_host, 
    password: es.config.db_password, 
    database: es.config.db_name 
  });
  es.db.init(function(err){
    es.connectionHandler(err);
  });
}
// inherits from EventEmitter
util.inherits(EtherSheetService, events.EventEmitter);

// EtherSheet Internal Data
EtherSheetService.models = {
  sheet: require('./models/sheet'),
  selection: require('./models/selection')
};
EtherSheetService.colors = [
  '#0EF012',
  '#1BA5E0',
  '#a233ca',
  '#DFF25E',
  '#F283F0',
  '#FAA166',
  '#FC3F52'
];

// EtherSheet API

EtherSheetService.prototype.onConnect = function(cb){
  this.connectionHandler = cb;
};

EtherSheetService.prototype.getModel = function(type,id){
  return new EtherSheetService.models[type](id,this);
};

EtherSheetService.prototype.getRandomColor = function(){
  var idx = Math.floor(Math.random() * 100);  
  return EtherSheetService.colors[idx % EtherSheetService.colors.length]
};

EtherSheetService.prototype.getSheet = function(sheet_id,cb){
  var es = this;
  async.parallel({
    id: function(cb){
      cb(null,sheet_id);
    },
    rows: function(cb){
      es.getRowIndex(sheet_id,cb);
    },
    cols: function(cb){
      es.getColIndex(sheet_id,cb);
    },
    cells: function(cb){
      es.getCells(sheet_id,cb);
    }
  },function(err,data){
    if(err) throw err;
    if(!data.rows){
      return es.createSheet(sheet_id,cb);
    }
    cb(null,data);
  });
}; 

EtherSheetService.prototype.createSheet = function(sheet_id,cb){
  var es = this;
  var data = {
    id: sheet_id,
    rows: es.initializeRows(),
    cols: es.initializeCols(),
    cells: {}
  };

  async.parallel({
    rows: function(cb){
      es.setRowIndex(sheet_id,data.rows,cb);
    },
    cols: function(cb){
      es.setColIndex(sheet_id,data.cols,cb);
    },
    cells: function(cb){
      es.setCells(sheet_id,data.cells,cb);
    }
  },function(err){
    if(err) throw err;
    cb(null,data);
  });
};

EtherSheetService.prototype.deleteSheet = function(sheet_id,cb){
  var es = this;
  async.parallel({
    rows: function(cb){
      es.deleteRowIndex(sheet_id,cb);
    },
    cols: function(cb){
      es.deleteColIndex(sheet_id,cb);
    },
    cells: function(cb){
      es.deleteCells(sheet_id,cb);
    }
  },function(err){
    if(err) throw err;
    cb(null);
  });
};

EtherSheetService.prototype.initializeRows = function(){
    var es = this;
    var row_count = es.config.default_row_count;
    var rows = [];
    for(var i = 0; i<row_count; i++){
      rows.push(uuid());
    }
    return rows
};
EtherSheetService.prototype.initializeCols = function(){
    var es = this;
    var col_count = es.config.default_col_count;
    var cols = [];
    for(var i = 0; i<col_count; i++){
      cols.push(uuid());
    }
    return cols;
};

EtherSheetService.prototype.setRowIndex = function(sheet_id,rows,cb){
  var es = this;
  es.db.set(sheet_id + ':rows', rows, cb);
};

EtherSheetService.prototype.getRowIndex = function(sheet_id,cb){
  var es = this;
  es.db.get(sheet_id + ':rows',cb);
};

EtherSheetService.prototype.deleteRowIndex = function(sheet_id,cb){
  var es = this;
  es.db.remove(sheet_id + ':rows',cb);
};


EtherSheetService.prototype.setColIndex = function(sheet_id, cols, cb){
  var es = this;
  es.db.set(sheet_id + ':cols', cols, cb);
};

EtherSheetService.prototype.getColIndex = function(sheet_id, cb){
  var es = this;
  es.db.get(sheet_id + ':cols',cb);
};

EtherSheetService.prototype.deleteColIndex = function(sheet_id,cb){
  var es = this;
  es.db.remove(sheet_id + ':cols',cb);
};

EtherSheetService.prototype.setCells = function(sheet_id, cells, cb){
  var es = this;
  es.db.set(sheet_id + ':cells', cells, cb);
};

EtherSheetService.prototype.getCells = function(sheet_id, cb){
  var es = this;
  es.db.get(sheet_id + ':cells',cb);
};

EtherSheetService.prototype.deleteCells = function(sheet_id,cb){
  var es = this;
  es.db.remove(sheet_id + ':cells',cb);
};

