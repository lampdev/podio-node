var podio = require('./lib/main');

try {
    podio.init({client_secret: 'lDi0X4ZfS6c4nF536CJfSRaXKkxhN0mLTUPN8Q908Pn8hBoPnkOyyJQVtM53y2EI', client_id: 'lampdev-sample-app', app_token: 'bd35b64bb8924201b12909f5eeb267f4', app_id: '3788374', grant_type: 'app'});
    podio.authenticate(function(){
        podio.addItem('3788374',{'title': 'Test project', 'description': 'description value'},function(item_id) {
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
