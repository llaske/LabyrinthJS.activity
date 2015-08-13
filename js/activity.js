define(function (require) {
    var activity = require("sugar-web/activity/activity");

    // Manipulate the DOM only when it is ready.
    require(['domReady!'], function (doc) {

        // Initialize the activity.
        activity.setup();
	
		// Handle toolbar mode switch
		var currentMode = 0;
		var nodetextButton = document.getElementById("nodetext-button");
		var linkButton = document.getElementById("link-button");
		var removeButton = document.getElementById("delete-button");
		var switchMode = function(newMode) {
			currentMode = newMode;
			nodetextButton.classList.remove('active');			
			linkButton.classList.remove('active');			
			removeButton.classList.remove('active');
			if (newMode == 0) nodetextButton.classList.add('active');
			else if (newMode == 1) linkButton.classList.add('active');
			else if (newMode == 2) removeButton.classList.add('active');
		}	
		nodetextButton.addEventListener('click', function () { switchMode(0); }, true);
		linkButton.addEventListener('click', function () { switchMode(1); }, true);
		removeButton.addEventListener('click', function () { switchMode(2); }, true);
	
		// Initialize Cytoscape
		cy = cytoscape({
			container: document.getElementById('cy'),
			
			ready: function() {
				console.log("Hello world !");
			}
		});
    });

});
