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
				// Create first node
				createNode("<Your idea here>", getCenter());
			}
		});

		// Node handling functions
		var nodeCount = 0;
		var edgeCount = 0;
		var currentFontSize = "16px";
		var createNode = function(text, position) {
			var size = computeStringSize(text, currentFontSize);
			cy.add({
				group: 'nodes',
				nodes: [
					{
						data: {
							id: 'n'+(++nodeCount)
						},
						position: {
							x: position.x,
							y: position.y
						}
					}
				]							
			});
			var newnode = cy.getElementById('n'+nodeCount);
			newnode.style({
				'content': text,
				'width': size.width,
				'height': size.height,
				'text-valign': 'center',
				'text-halign': 'center',
				'border-color': 'darkgray',
				'background-color': 'white',
				'border-width': '1px',
				'shape': 'rectangle'
			});
		}
		var updateNodeText = function(node, text) {
		}
		var selectNode = function(node) {
		}
		var unselectNode = function(node) {
		}
		var deleteNode = function(node) {
		}
		
		// Utility functions
		var computeStringSize = function(text, fontsize) {
			// HACK: dynamically compute need size putting the string in a hidden div element
			var computer = document.getElementById("fontsizecomputer");
			computer.innerHTML = text.replace("<","&lt;").replace(">","&gt;");
			computer.style.fontSize = fontsize;
			return {width: (computer.clientWidth+20)+"px", heigth: (computer.clientHeight+4)+"px"};
		}
		var getCenter = function() {
			var canvas = document.getElementById("canvas");
			var center = {x: canvas.clientWidth/2, y: canvas.clientHeight/2};
			return center;
		}
    });

});
