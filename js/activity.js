define(function (require) {
    var activity = require("sugar-web/activity/activity");

    // Manipulate the DOM only when it is ready.
    require(['domReady!'], function (doc) {

        // Initialize the activity.
        activity.setup();

		// Initialize Cytoscape
		cy = cytoscape({
			container: document.getElementById('cy'),
			
			ready: function() {
				console.log("Hello world !");
			}
		});
    });

});
