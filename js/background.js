/*
* @Author: NickVico
* @Date:   2017-03-19 22:47:59
* @Last Modified by:   NickVico
* @Last Modified time: 2017-03-20 20:05:17
*/

'use strict';

chrome.downloads.onDeterminingFilename.addListener(
    function(item, suggest) {
        //console.debug( item );
        chrome.storage.sync.get({
            minSize: 0,
            rpcHost: 'localhost',
            rpcPort: 6800
        }, function(conf) {
            if(item.fileSize > conf.minSize) {
                chrome.cookies.getAll({url: item.finalUrl}, function(cookies) {
                    //console.debug( cookies );
                    var strCookie = '';
                    for (var i in cookies) {
                        strCookie += `${cookies[i].name}=${cookies[i].value}; `;
                    }
                    var rpc = [{
                        'jsonrpc': '2.0',
                        'method': 'aria2.addUri',
                        'id': (new Date()).getTime().toString(),
                        'params': [
                            [ item.finalUrl ],
                            {
                                'out': decodeURIComponent(item.filename),
                                'header': `Referer: ${item.referrer}\nCookie: ${strCookie}`
                            }
                        ]
                    }];
                    var xhr = new XMLHttpRequest();
                    xhr.timeout = 2000;
                    xhr.open('POST', `http://${conf.rpcHost}:${conf.rpcPort}/jsonrpc?tm=` + (new Date()).getTime().toString(), true);
                    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=utf-8');
                    xhr.onload = function(e) {
                        if(this.status == 200 || this.status == 304) {
                            chrome.downloads.cancel(item.id, function(e){
                                chrome.downloads.erase({id: item.id});
                            });
                            var fileName = decodeURIComponent(item.filename);
                            var fileSize = bytesToSize(item.fileSize);
                            showNotify('任务已送往 Aria2 进行下载！！！', `文件名称：${fileName}\n文件大小：${fileSize}`, 'download');
                        }
                    };
                    xhr.onerror = function(e) {
                        showNotify('添加任务到 Aria2 出错！！！', '请检查 Aria2 JSON-RPC 配置是否正确！', 'warn');
                    };
                    xhr.ontimeout = xhr.onerror;
                    xhr.send(JSON.stringify(rpc));
                });
            }
        });
        suggest({filename: item.filename, conflict_action: 'uniquify', conflictAction: 'uniquify'});
        return true;
    }
);

function showNotify(title, message, icon) {
    if(chrome.notifications) {
        var opt = {
            type: 'basic',
            title: title,
            message: message,
            iconUrl: `img/${icon}.png`,
            isClickable: true
        };
        chrome.notifications.create('', opt, function(id) {
            setTimeout(function() {
                chrome.notifications.clear(id, function(){});
            }, 5000);
        });
    } else {
        console.log('浏览器不支持桌面通知！');
    }
}

function bytesToSize(bytes) {
    if (bytes === 0) return '0 B';
    var k = 1024,
        sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
        i = Math.floor(Math.log(bytes) / Math.log(k));
   return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
}
