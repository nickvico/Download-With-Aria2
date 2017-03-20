/*
* @Author: NickVico
* @Date:   2017-03-19 22:01:38
* @Last Modified by:   NickVico
* @Last Modified time: 2017-03-19 22:33:38
*/

'use strict';

function save_options() {
    var minSize = document.getElementById('minSize').value;
    var rpcHost = document.getElementById('rpcHost').value;
    var rpcPort = document.getElementById('rpcPort').value;
    chrome.storage.sync.set({
        minSize: minSize,
        rpcHost: rpcHost,
        rpcPort: rpcPort
    }, function() {
        localStorage["AriaNg.Options"] = `{"language":"zh_CN","browserNotification":true,"rpcHost":"${rpcHost}","rpcPort":${rpcPort},"protocol":"http"}`;
        alert('保存成功！');
    });
}

function restore_options() {
    chrome.storage.sync.get({
        minSize: 0,
        rpcHost: 'localhost',
        rpcPort: 6800
    }, function(conf) {
        document.getElementById('minSize').value = conf.minSize;
        document.getElementById('rpcHost').value = conf.rpcHost;
        document.getElementById('rpcPort').value = conf.rpcPort;
    });
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);
