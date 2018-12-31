// Add file path shim for Jupyter 3/4
var IGV_PATH = location.origin + Jupyter.contents.base_url + "nbextensions/igv/";
console.log(IGV_PATH)
define(
    [IGV_PATH + "igvjs/igv.min.js"],
    function (igv) {

        if(!igv.browserCache) igv.browserCache = {}

        /**
         * Load the IGV.js nbextension
         */
        function load_ipython_extension() {
            registerComm()
        }

        function createBrowser(div, config) {
            // TODO -- send message that browser is ready
            igv.createBrowser(div, config)
                .then(function (browser) {
                    igv.browserCache[config.id] = browser;
                })
        }

        function getBrowser(id) {
            return igv.browserCache[id]
        }

        function registerComm() {
            Jupyter.notebook.kernel.comm_manager.register_target('igvcomm',
                function(comm, msg) {
                    // comm is the frontend comm instance
                    // msg is the comm_open message, which can carry data

                    // Register handlers for later messages:
                    comm.on_msg(function(msg) {
                        var data = JSON.parse(msg.content.data)
                        var method = data.command
                        var id = data.id
                        switch(method) {

                            case "create":
                                var div = document.getElementById(id)
                                createBrowser(div, data.options)

                            case "zoomIn":
                                getBrowser(id).zoomIn()
                                break

                            case "zoomOut":
                                getBrowser(id).zoomOut()
                                break

                            case "loadTrack":
                                getBrowser(id).loadTrack(data.track)
                                break

                            case "search":
                                getBrowser(id).search(data.locus)
                                break

                            case "remove":
                                delete igv.browserCache[id]
                                var div = document.getElementById(id)
                                div.parentNode.removeChild(div)
                                break

                            default:
                                console.error("Unrecognized method: " + msg.method)
                        }
                    });
                    comm.on_close(function(msg) {});
                    comm.send({'foo': 0});
                });
        }

        return {
            load_ipython_extension: load_ipython_extension,
            createBrowser: createBrowser,
            getBrowser: getBrowser
        };

    });
