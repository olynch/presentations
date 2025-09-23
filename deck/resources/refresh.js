var reconnectFrequency = 2000;
var evtSource;

function setupEventSource() {
    evtSource = new EventSource("refresh");
    evtSource.onmessage = function (e) {
        if (e.data == "refresh") {
            evtSource.close();
            location.reload();
        } else {
            console.log(e.data);
        }
    };
    evtSource.onerror = function (e) {
        evtSource.close();
        setTimeout(setupEventSource, reconnectFrequency);
    };
}

setupEventSource();
