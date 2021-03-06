var _ = require('underscore');
var Sheet = module.exports = function(id,db){
  this.id = id;
  this.db = db;
  this._data = null;
}

Sheet.prototype.rowAt = function(index,cb){
  var sheet = this;
  index = Number(index);
  sheet.db.getSheet(this.id,function(err,data){
    if(err) cb(err);
    if(index >= data.rows.length) return cb(new Error("row index out of bounds"));
    cb(null,data.rows[index]);
  });
};

Sheet.prototype.colAt = function(index,cb){
  var sheet = this;
  index = Number(index);
  sheet.db.getSheet(this.id,function(err,data){
    if(err) cb(err);
    if(index >= data.cols.length) return cb(new Error("col index out of bounds"));
    cb(null,data.cols[index]);
  });
};

Sheet.prototype.commitCell = function(row,col,cell,cb){
  var sheet = this;
  sheet.db.getSheet(this.id,function(err,data){
    if(err) throw err;
    if(!data.cells[row]) data.cells[row] = {};
    data.cells[row][col] = cell;
    sheet.db.setCells(sheet.id,data.cells,cb);
  }); 
};

Sheet.prototype.updateCell = function(row,col,val,cb){
  cb(null,row,col,val);
};

Sheet.prototype.getValue = function(row,col,cb){
  var sheet = this;
  sheet.db.getSheet(this.id,function(err,data){
    if(err) throw err;
    if(!data.cells[row]) return cb(null,''); 
    cb(null, data.cells[row][col] || '');
  }); 
};

Sheet.prototype.getSheet = function(id,cb){
  var sheet = this;
  if(sheet._data) return cb(null,this._data);
  sheet.db.getSheet(this.id,function(err,data){
    sheet._data = data;
    cb(null,sheet._data);
  });
};

Sheet.prototype.insertCol = function(position, new_id, cb){
  var sheet = this;
  sheet.db.getSheet(this.id,function(err,data){
    if(err) throw err;
    data.cols.splice(position,0,new_id);
    sheet.db.setColIndex(sheet.id,data.cols,cb);
  }); 
};

Sheet.prototype.insertRow = function(position, new_id, cb){
  var sheet = this;
  sheet.db.getSheet(this.id,function(err,data){
    if(err) throw err;
    data.rows.splice(position,0,new_id);
    sheet.db.setRowIndex(sheet.id,data.rows,cb);
  }); 
};

Sheet.prototype.deleteCol = function(col_id, cb){
  var sheet = this;
  sheet.db.getSheet(this.id,function(err,data){
    var col_pos = _.indexOf(data.cols,col_id);
    if(col_pos === -1) return false;
    _.each(data.rows,function(row_id){
      if(data.cells[row_id]){
         delete data.cells[row_id][col_id];
      }   
    }); 
    data.cols.splice(col_pos,1);
    sheet.db.setColIndex(sheet.id,data.cols);
    sheet.db.setCells(sheet.id,data.cells,cb);
  });
};

Sheet.prototype.deleteRow = function(row_id, cb){
  var sheet = this;
  sheet.db.getSheet(this.id,function(err,data){
    var row_pos = _.indexOf(data.rows,row_id);
    if(row_pos === -1) return false;
    data.cells[row_id] = {};
    data.rows.splice(row_pos,1);
    sheet.db.setRowIndex(sheet.id,data.rows);
    sheet.db.setCells(sheet.id,data.cells,cb);
  });
};
