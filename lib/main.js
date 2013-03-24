var _client_id  = '';
var _grant_type = '';
var _app_id     = '';
var _app_token  = '';
var _client_secret = '';
var _isAuthenticated = false;
var _access_token = '';
var _expires_in = 0;
var _refresh_token = '';
var _baseUrl = 'https://api.podio.com';
var _request = require('request');
var _fs = require('fs');

exports.init = function(options) {
  _client_secret = options.client_secret;
  _app_token     = options.app_token;
  _app_id        = options.app_id;
  _grant_type    = options.grant_type;
  _client_id     = options.client_id;
}

exports.authenticate = function(cb) {
  _makeRequest('POST',_baseUrl + "/oauth/token",{client_id: _client_id, grant_type: _grant_type, app_id: _app_id, app_token: _app_token, client_secret: _client_secret},function(response){
        _isAuthenticated = true;
        _access_token = response.access_token;
        _expires_in   = response.expires_in;
        _refresh_token = response.refresh_token;
        cb.call(this);
    });
}
var _makeRequest = function(type, url, params, cb) {
  var headers = {};
  if(_isAuthenticated) {
    headers.Authorization = 'OAuth2 ' + _access_token ;
  }
  _request({method: type, url: url, json: true, form: params, headers: headers},function (error, response, body) {
    if(!error && response.statusCode == 200) {
      cb.call(this,body);
    } else {
      throw new Error('Error occured while launching a request to Podio: ' + error + '; body: ' + JSON.stringify (body));
    }
  });
}

var _makeJSONRequest = function(type, url, params, cb) {
  var headers = {};
  if(_isAuthenticated) {
    headers.Authorization = 'OAuth2 ' + _access_token ;
  }
  _request({method: type, url: url, json: true, body: JSON.stringify(params), headers: headers},function (error, response, body) {
    if(!error && parseInt(response.statusCode / 100) == 2) {
      cb.call(this,body);
    } else {
      throw new Error('Error occured while launching a request to Podio: ' + error + '; body: ' + JSON.stringify (body));
    }
  });
}

var _makeMultipartRequest = function(url, params, cb) {
  var boundary = _generateBoundary(),
      crlf = "\r\n",
      delimiter = crlf + "--" + boundary,
      headers = [
        'Content-Disposition: form-data; name="source"; filename="' + params.file_name + '"' + crlf,
        'Content-Type: ' + params.content_type + crlf,
      ],
      closeDelimiter = delimiter + "--",
      multipartBody;
  var headers_request = {};
  if(_isAuthenticated) {
    headers_request.Authorization = 'OAuth2 ' + _access_token ;
  }
  headers_request['Content-Type'] = 'multipart/form-data; boundary=' + boundary;
  multipartBody = Buffer.concat([
    new Buffer(delimiter + crlf + headers.join('') + crlf),
    params.data]
  );
  headers = [
    'Content-Disposition: form-data; name="filename"' + crlf,
    'Content-Type: text/plain' + crlf,
  ];
  multipartBody = Buffer.concat([
    multipartBody,
    new Buffer(delimiter + crlf + headers.join('') + crlf),
    new Buffer(params.file_name),
    new Buffer(closeDelimiter)
    ]
  );
  _request({method: 'POST', url: url, body: multipartBody, headers: headers_request}, function (error, response, body) {
    if(!error && parseInt(response.statusCode / 100) == 2) {
      cb.call(this,JSON.parse(body));
    } else {
      throw new Error('Error occured while launching a request to Podio: ' + error + '; body: ' + JSON.stringify (body));
    }
  });
}
var _generateBoundary = function() {
  var boundary = '--------------------------';
  for (var i = 0; i < 24; i++) {
    boundary += Math.floor(Math.random() * 10).toString(16);
  }
  return boundary;
}
exports.getApp = function(app_id, cb) {
  _makeJSONRequest('GET', _baseUrl + "/app/" + app_id,{},function(response) {
    cb.call(this,response);
  });
}

exports.addItem = function(app_id, field_values, cb) {
  _makeJSONRequest('POST', _baseUrl + "/item/app/" + app_id + '/',{fields: field_values},function(response) {
    cb.call(this,response.item_id);
  });
}

exports.uploadFile = function(file_name, file_alias, content_type, cb) {
  _makeMultipartRequest(_baseUrl + "/file/", {data: _fs.readFileSync(file_name), file_name: file_alias, content_type: content_type}, function(response) {
    cb.call(this,response.file_id);
  });
}

exports.attachFileToItem = function(file_id,item_id, cb) {
  _makeJSONRequest('POST', _baseUrl + "/file/" + file_id + '/attach',{ref_type: 'item', ref_id: item_id},function(response) {
    cb();
  });
}
