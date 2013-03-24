var podio = require('./lib/main');

try {
    podio.init({client_secret: 'client_secret', client_id: 'client_id', app_token: 'app_token', app_id: 'app_id', grant_type: 'app'});
    podio.authenticate(function(){
        podio.addItem('app_id',{'title': 'Test project', 'description': 'description value'},function(item_id) {
            console.log('Item created: ' + item_id);
            podio.uploadFile('../unnamed.png','nexus.png','image/png',function(file_id) {
                console.log('File Uploaded: ' + file_id);
                podio.attachFileToItem(file_id,item_id,function() {
                    console.log('File ' + file_id + ' attached to item ' + item_id);
                });
            });
        });
    });
} catch(err) {
    console.log(err);
}
