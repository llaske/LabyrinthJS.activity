define(function (require) {
    var activity = require("sugar-web/activity/activity");
	var colorpalette = require("sugar-web/graphics/colorpalette");
	var textpalette = require("fontpalette");

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
			hideSubToolbar();
			if (lastSelected != null) {
				unselectAllNode();
				lastSelected = null;
			}
		}	
		nodetextButton.addEventListener('click', function () { switchMode(0); }, true);
		linkButton.addEventListener('click', function () { switchMode(1); lastSelected = null; }, true);
		removeButton.addEventListener('click', function () { switchMode(2); }, true);
		
		// Handle sub toolbar
		var subToolbar = document.getElementById("sub-toolbar");
		var textValue = document.getElementById("textvalue");
		var boldButton = document.getElementById("bold-button");
		var italicButton = document.getElementById("italics-button");
        var foregroundButton = document.getElementById("foreground-button");
		foregroundPalette = new colorpalette.ColorPalette(foregroundButton);
		foregroundPalette.setColor('rgb(0, 0, 0)');
		var ignoreForegroundEvent = false; // HACK: Need because SetColor itself raise an event
        var backgroundButton = document.getElementById("background-button");
		backgroundPalette = new colorpalette.ColorPalette(backgroundButton);
		backgroundPalette.setColor('rgb(255, 255, 255)');
		var ignoreBackgroundEvent = false;
		var fontMinusButton = document.getElementById("fontminus-button");
		var fontPlusButton = document.getElementById("fontplus-button");
        var fontButton = document.getElementById("font-button");
		fontPalette = new textpalette.TextPalette(fontButton);
		
		foregroundPalette.addEventListener('colorChange', function(e) {
			if (!ignoreForegroundEvent) lastSelected.style('color', e.detail.color);
			ignoreForegroundEvent = false;
		});
		
		backgroundPalette.addEventListener('colorChange', function(e) {
			if (!ignoreBackgroundEvent) lastSelected.style('background-color', e.detail.color);
			ignoreBackgroundEvent = false;
		});
		
		fontPalette.addEventListener('fontChange', function(e) {
			var newfont = e.detail.family;
			lastSelected.data('font-family', newfont);
			lastSelected.removeClass('arial-text comic-text verdana-text');
			updateNodeText(lastSelected);
			if (newfont == 'Arial') lastSelected.addClass('arial-text');
			else if (newfont == 'Comic Sans MS') lastSelected.addClass('comic-text');
			else if (newfont == 'Verdana') lastSelected.addClass('verdana-text');
		});
		
		textValue.addEventListener('input', function() {
			updateNodeText(lastSelected, textValue.value);
		});
		
		boldButton.addEventListener('click', function () {
			lastSelected.toggleClass('bold-text');
			updateNodeText(lastSelected);
		});
		italicButton.addEventListener('click', function () {
			lastSelected.toggleClass('italic-text');
			updateNodeText(lastSelected);
		});
		
		fontMinusButton.addEventListener('click', function() {
			lastSelected.data('font-size', Math.max(6, lastSelected.data('font-size')-2));
			updateNodeText(lastSelected);
		});
		
		fontPlusButton.addEventListener('click', function() {
			lastSelected.data('font-size', Math.min(100, lastSelected.data('font-size')+2));
			updateNodeText(lastSelected);
		});
		
		var showSubToolbar = function(node) {
			subToolbar.style.visibility = "visible";
			textValue.value = node.style()["content"];
			if (node.hasClass('bold-text')) {
				boldButton.classList.add('active');
			} else {
				boldButton.classList.remove('active');			
			}
			if (node.hasClass('italic-text')) {
				italicButton.classList.add('active');
			} else {
				italicButton.classList.remove('active');			
			}
			ignoreForegroundEvent = true;
			foregroundPalette.setColor(node.style()['color']);
			ignoreBackgroundEvent = true;
			backgroundPalette.setColor(node.style()['background-color']);
			fontPalette.setFont(node.data('font-family'));
		}
		var hideSubToolbar = function() {
			subToolbar.style.visibility = "hidden";
		}

		// --- Cytoscape handling
		
		// Initialize board
		cy = cytoscape({
			container: document.getElementById('cy'),
			
			ready: function() {
				// Create first node and select id
				var firstNode = createNode(defaultText, getCenter());
				firstNode.select();
				selectNode(firstNode);
				lastSelected = firstNode;
				showSubToolbar(firstNode);
			},
			
			style: [
				{
					selector: '.bold-text',
					css: {
						'font-weight': 'bold'
					}
				},
				{
					selector: '.italic-text',
					css: {
						'font-style': 'italic'
					}
				},
				{
					selector: '.arial-text',
					css: {
						'font-family': 'Arial'
					}
				},
				{
					selector: '.comic-text',
					css: {
						'font-family': 'Comic Sans MS'
					}
				},
				{
					selector: '.verdana-text',
					css: {
						'font-family': 'Verdana'
					}
				}
			]
		});
		
		// Event: a node is selected
		cy.on('tap', 'node', function() {
			if (currentMode == 2) {
				deleteNode(this);
				if (lastSelected == this) lastSelected = null;
				return;
			} else if (currentMode == 1) {
				if (lastSelected != null && lastSelected != this) {
					createEdge(lastSelected, this);
				}
				lastSelected = this;
				return;
			} else {
				if (isSelectedNode(this)) {
					unselectNode(this);
					hideSubToolbar();
				} else {
					selectNode(this);
					showSubToolbar(this);
					if (textValue.value == defaultText)
						textValue.setSelectionRange(0, textValue.value.length);
					else
						textValue.setSelectionRange(textValue.value.length, textValue.value.length);
				}
				lastSelected = this;
			}
		});

		// Event: a node is unselected
		cy.on('unselect', 'node', function() {
			unselectNode(this);
		});

		// Event: an edge is selected
		cy.on('select', 'edge', function() {
			if (currentMode == 2) {
				deleteEdge(this);
				return;
			}
			hideSubToolbar();
		});
		
		// Event: tap on the board
		cy.on('tap', function(e){
			if (e.cyTarget === cy) {
				if (currentMode == 0) {
					var newNode = createNode(defaultText, e.cyPosition);
					if (lastSelected != null)
						createEdge(lastSelected, newNode);
					newNode.select();
					selectNode(newNode);
					lastSelected = newNode;					
					showSubToolbar(newNode);
				}
			}
		});

		// --- Node and edge handling functions
		var nodeCount = 0;
		var edgeCount = 0;
		var defaultFontFamily = "Arial";
		var defaultFontSize = 16;
		var lastSelected = null;
		var defaultText = "<Your new idea>";
		
		// Create a new node with text and position
		var createNode = function(text, position) {
			var size = computeStringSize(text, defaultFontFamily, defaultFontSize, false, false);
			cy.add({
				group: 'nodes',
				nodes: [
					{
						data: {
							id: 'n'+(++nodeCount),
							'font-family': defaultFontFamily,
							'font-size': defaultFontSize,
							'font-weight': 'normal'
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
				'color': 'rgb(0, 0, 0)',
				'font-family': 'Arial',
				'font-size': defaultFontSize+'px',
				'text-valign': 'center',
				'text-halign': 'center',
				'border-color': 'darkgray',
				'background-color': 'rgb(255, 255, 255)',
				'border-width': '1px',
				'shape': 'roundrectangle'
			});
			return newnode;
		}
		
		// Update node text and change size
		var updateNodeText = function(node, text) {
			if (text === undefined) text = node.style()['content'];
			var fontSize = node.data('font-size');
			var fontFamily = node.data('font-family');
			var size = computeStringSize(text, fontFamily, fontSize, node.hasClass('bold-text'), node.hasClass('italic-text'));
			node.style({
				'content': text,
				'font-size': fontSize+'px',
				'font-family': fontFamily,
				'width': size.width,
				'height': size.height
			});			
		}
		
		// Test if node is selected
		var isSelectedNode = function(node) {
			return node.style()['border-style'] == 'dashed';
		}
		
		// Set node as selected
		var selectNode = function(node) {
			node.style({
				'border-color': 'black',
				'border-style': 'dashed',
				'border-width': '4px'
			});
		}
		
		// Set node as unselected
		var unselectNode = function(node) {
			node.style({
				'border-color': 'darkgray',
				'border-style': 'solid',					
				'border-width': '1px'
			});		
		}
		
		// Unselect all node
		var unselectAllNode = function() {
			var nodes = cy.collection("node");
			for (var i = 0 ; i < nodes.length ; i++) {
				unselectNode(nodes[i]);
			}
		}
		
		// Delete node, linked edges are removed too
		var deleteNode = function(node) {
			cy.remove(node);
		}
		
		// Create a new edge between two nodes
		var createEdge = function(n1, n2) {
			cy.add({
				group: 'nodes',
				edges: [
					{ data: { id: 'e'+(++edgeCount), source: n1.id(), target: n2.id() } }
				]							
			});		
		}
		
		// Remove an edge
		var deleteEdge = function(edge) {
			cy.remove(edge);
		}
		
		// --- Utility functions
		// HACK: dynamically compute need size putting the string in a hidden div element
		var computeStringSize = function(text, fontfamily, fontsize, bold, italic) {
			var computer = document.getElementById("fontsizecomputer");
			computer.innerHTML = text.replace("<","&lt;").replace(">","&gt;");
			computer.style.fontFamily = fontfamily;
			computer.style.fontSize = fontsize+"px";
			if (bold) computer.style.fontWeight = "bold";
			else computer.style.fontWeight = "normal";
			if (italic) computer.style.fontStyle = "italic";
			else computer.style.fontStyle = "normal";			
			return {width: (computer.clientWidth+fontsize)+"px", height: (computer.clientHeight+fontsize)+"px"};
		}
		
		// Get center of drawing zone
		var getCenter = function() {
			var canvas = document.getElementById("canvas");
			var center = {x: canvas.clientWidth/2, y: canvas.clientHeight/2};
			return center;
		}
    });

});
