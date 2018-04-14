// Fretboard
//==============
//
// Copyright (c) 2018 Michael Rieppel
//
// Internally, the program identifies notes by integers (see the global NOTES variable)
// rather than by their ordinary names, due to enharmonic equivalents which have two
// ordinary names. E.g. the program uniformly uses '1' for what would ordinarily be called
// either "C#" or "Db", depending on context.
//
// A scale is represented as an array of integers, each integer representing a note in
// the scale.  E.g. Cmaj is [0,2,4,5,7,9,11].  Similarly for chords.  E.g. the Cmaj 
// chord is represented as [0,4,7], corresponding to the 1st, 3rd, and 5th degrees of
// the Cmaj scale.
//
// The function scaleDict then takes a scale in array form and returns a dictionary
// that pairs integers in the array with ordinary note names, resolving between the two 
// names of enharmonic equivalents as appropriate.  Such a dictionary can also be applied
// to an array representing a chord to get the names of the notes in that chord.


var NOTES = {"C":0,"B#":0,"C#":1,"Db":1,"D":2,"D#":3,"Eb":3,"E":4,"Fb":4,"E#":5,"F":5,"F#":6,"Gb":6,"G":7,"G#":8,"Ab":8,"A":9,"A#":10,"Bb":10,"B":11,"Cb":11}

// Main function to collect user input and display the appropriate scale 
function putScale() {
	var tuning = document.getElementById('scaletuning').value.split(",").reverse();
	var root = document.getElementById('scaleroot').value;
	var m = document.getElementById('scalemode'); 
	
	var mode = m.options[m.selectedIndex].text; // name of mode
	var modear = m.value.split(",").map(x => parseInt(x)); // interval array for mode
	
	var board = makeBoard(tuning);
	
	var fscale = makeScale(modear,NOTES[root]); // Full scale
	var scale = getScaleFrag(fscale,mode); // Scale fragment for pentatonics etc.
	
	var boardnotes = findScaleNotes(board,scale);
	var dict = scaleDict(fscale,root);
	var boardnotes = putLetters(boardnotes,dict);
	
	var scalestr = scale.map(x => dict[x]).join(","); // String description of scale
	d3.select("#scaleinfo").html(dict[NOTES[root]]+" "+mode+" Scale: "+scalestr);

	drawopennotes("scaleboard",tuning);
	for(var i=0;i<boardnotes.length;i++) {
		drawnotes("scaleboard",i+1,boardnotes[i]);
	}
}

// Takes a full scale (as an array of integers) and the name of a mode, and returns
// the appropriate scale fragment (for pentatonic scales, blues etc.).  For full
// diatonic scales, just returns the original scale
function getScaleFrag(fscale,mode) {
	switch(mode) {
		case "Maj. Pentatonic" : return [fscale[0],fscale[1],fscale[2],fscale[4],fscale[5]];
		case "Min. Pentatonic" : return [fscale[0],fscale[2],fscale[3],fscale[4],fscale[6]];
		case "Blues" : return [fscale[0],fscale[2],fscale[3],fscale[4],fscale[5],fscale[7]];
		default : return fscale;
	}
}

// Main function to collect user input and display the appropriate chord
function putChord() {
	var tuning = document.getElementById('chordtuning').value.split(",").reverse();
	var root = document.getElementById('chordroot').value;
	
	var m = document.getElementById('chordmode'); 
 	var mode = m.options[m.selectedIndex].text;
 	var modear = m.value.split(",").map(x => parseInt(x));

	var scale = makeScale(modear,NOTES[root]);
	
	var chord = getChord(scale,mode);
	
	var board = makeBoard(tuning);
	var boardnotes = findScaleNotes(board,chord);
	var dict = scaleDict(scale,root);
	
	var boardnotes = putLetters(boardnotes,dict);
	
	var chordstr = chord.map(x => dict[x]).join(",");
	d3.select("#chordinfo").html(dict[NOTES[root]]+mode+" Chord: "+chordstr);
	
 	drawopennotes("chordboard",tuning);
 	for(var i=0;i<boardnotes.length;i++) {
 		drawnotes("chordboard",i+1,boardnotes[i]);
 	}
}

// Takes a scale and the name of a "mode" (type of chord, e.g. "maj" or "dim7")
// and returns the fragment of the scale representing the chord.
function getChord(scale,mode) {
	switch(mode) {
		case "maj" : return [scale[0],scale[2],scale[4]];
		case "min" : return [scale[0],scale[2],scale[4]];
		case "7" : return [scale[0],scale[2],scale[4],scale[6]];
		case "maj7" : return [scale[0],scale[2],scale[4],scale[6]];
		case "min7" : return [scale[0],scale[2],scale[4],scale[6]];
		case "maj6" : return [scale[0],scale[2],scale[4],scale[5]];
		case "min6" : return [scale[0],scale[2],scale[4],scale[5]];
		case "aug" : return [scale[0],scale[2],scale[4]];
		case "dim" : return [scale[0],scale[2],scale[4]];
		case "dim7" : return [scale[0],scale[2],scale[4],scale[6]];
		case "sus4" : return [scale[0],scale[3],scale[4]];
		case "9" : return [scale[0],scale[1],scale[2],scale[4],scale[6]];
		default : return scale;
	}
}

// Takes a scale (array of integers) and a root (e.g. "C"), and returns the appropriate 
// names for the other notes in the scale (determines whether e.g. C#, represented as an
// int 1 in the scale, should be called "C#" or "Db").  Flats and sharps get returned
// in unicode.
function scaleDict(scale,root) {
	root = root.replace(/b/g,'\u266D');
	root = root.replace(/#/g,'\u266F');
	var test = root;
	var out = {};
	out[scale[0]] = root;
	for(var i=1;i<scale.length;i++) {
		out[scale[i]] = getLet(scale[i],test);
		test += ","+out[scale[i]];
	}
	return out;
	
	function getLet(n,str) {
		switch(n) {
			case 0 : return str.indexOf("C")<0 ? "C" : "B\u266F";
			case 1 : return str.indexOf("C")<0 ? "C\u266F" : "D\u266D";
			case 2 : return "D";
			case 3 : return str.indexOf("D")<0 ? "D\u266F" : "E\u266D";
			case 4 : return "E";
			case 5 : return str.indexOf("F")<0 ? "F" : "E\u266F";
			case 6 : return str.indexOf("F")<0 ? "F\u266F" : "G\u266D";
			case 7 : return "G";
			case 8 : return str.indexOf("G")<0 ? "G\u266F" : "A\u266D";
			case 9 : return "A";
			case 10 : return str.indexOf("A")<0 ? "A\u266F" : "B\u266D";
			case 11 : return str.indexOf("B")<0 ? "B" : "C\u266D";		
		}
	}
}

// Takes a mode (an array specifying the intervals for the scale) and a root note 
// (represented as integer) and returns the scale (array of integers) starting at the 
// root and moving up by the specified intervals.
function makeScale(mode,root) {
		var scale = [root];
		for(var i=0;i<(mode.length-1);i++) {
			root += mode[i];
			scale.push(root%12);
		}
	return scale;
}

// Takes a full fretboard (each fret labeled with the note it corresponds to) and a scale
// (as an array of ints) and removes those frets from the fretboard that don't correspond
// to notes in the given scale
function findScaleNotes(board,scale) {
	return board.map(function (s) {
		return s.filter(function (p) {
			return scale.indexOf(p[1]) >=0;});});
}

// Takes a tuning and returns a full fretboard based on that tuning, with each fret
// assigned the note it corresponds to on the given tuning.  A fretboard is a 
// multidimensional array: one array for each of the 6 strings, where each of those
// arrays in turn consists of 14 arrays representing the 14 frets on that string.  Each
// of these "fret arrays" contains two integers: the first for the fret number, the 
// second for the note (as integer) that corresponds to that fret on the tuning.
function makeBoard(tuning) {
	var board = [];
	var string = [];
	for(var i=0;i<6;i++) {
		var note = NOTES[tuning[i]];
		for(var j=0;j<15;j++) {
			string.push([j,(note%12)]);
			note++;
		}
		board.push(string);
		string = [];
	}
	return board;
}


// Takes a fretboard and a dictionary and labels assigns to each fret the ordinary note 
// that corresponds to it. (Frets are originally labeled with the integer name of the
// note, and this function replaces that integer with the ordinary name of the note.)
function putLetters(board,dict) {
	return board.map(function(nested) {
		return nested.map(function(i) {
			return [i[0],dict[i[1]]];
		});});
}


// Main function to collect user input and display the appropriate chord progression
function putProg() {
	var root = document.getElementById('progroot').value;
	var m = document.getElementById('progmode'); 
	
	var mode = m.options[m.selectedIndex].text; // name of mode
	var modear = m.value.split(",").map(x => parseInt(x)); // interval array for mode
	
	
	var scale = makeScale(modear,NOTES[root]);
		
	var dict = scaleDict(scale,root);
	
	var scalenotes = scale.map(x => dict[x]); // Put letters for scale notes
	
	d3.select("#keyspan").html(dict[NOTES[root]]+" "+mode);
	d3.select("#progdiv").html(makeTable(scalenotes,mode));
}

// Takes a scale (array of ints) and the name of a mode (either "Major" or "Minor") and
// builds and html table for the chord progression based on that scale. 
function makeTable(scale,mode) {
	var pattern = (mode=="Major" ? ["","m","m","","","m","dim"] : ["m","dim","","m","m","",""]);
	
	var majnum = '<td>I</td><td>ii</td><td>iii</td><td>IV</td><td>V</td><td>vi</td><td>vii</td>';
	var minnum = '<td>i</td><td>ii</td><td>III</td><td>iv</td><td>v</td><td>VI</td><td>VII</td>';
	var pre = '<table id="progtable"><tr><td></td>';
	
	pre += (mode=="Major" ? majnum : minnum);
	pre += '</tr><tr id="divider"><td class = "label">Chord:</td>';
	
	for(var i=0;i<7;i++) {
		pre += '<td>'+scale[i]+pattern[i]+'</td>';
	}
	pre += '</tr><tr><td class = "label">Triad:</td>';
	for(var i=0;i<7;i++) {
		pre += '<td>'+scale[i]+'</td>';
	}
	pre += '</tr><tr><td></td>';
	for(var i=0;i<7;i++) {
		pre += '<td>'+scale[(i+2)%7]+'</td>';
	}
	pre += '</tr><tr><td></td>';
	for(var i=0;i<7;i++) {
		pre += '<td>'+scale[(i+4)%7]+'</td>';
	}
	pre += '</tr></table>';
	
	return pre;
}
	
	

// BELOW ARE FUNCTIONS TO DRAW TO SVG USING D3

// Draws the notes each of the 6 strings is tuned to to the left of that string.
function drawopennotes(id,tuning) {
	var st = d3.select("#"+id).selectAll("g.string");
	var x = st.data(tuning);
	var y = x.selectAll("text.opennote").data(d => [d]);
	y.text(d => d);
	y.enter()
		.append("text")
		.attr("x",25)
		.attr("y",5)
		.attr("class","opennote")
		.style("font-family","Verdana")
		.style("font-size","14px")
		.text(function (d) {return d;});
	
	y.exit().remove();
}

// Draws the notes corresponding to the given scale or chord onto the fretboard.
function drawnotes(id,string,frets) {
	var st = d3.select("#"+id).select("#s"+string);

	var c = st.selectAll("circle.note").data(frets)
		.attr("r",11)
		.attr("cx", d => d[0]==0 ? 35 : (d[0]*50)+30)
		.attr("cy", 0)
		.attr("class","note")
		.style("stroke","black")
		.style("stroke-width","1");
	
	c.enter()
		.append("circle")
		.attr("r",11)
		.attr("cx", d => d[0]==0 ? 35 : (d[0]*50)+30)
		.attr("cy", 0)
		.attr("class","note")
		.style("stroke","black")
		.style("stroke-width","1");
	
	c.exit().remove();

	var t = st.selectAll("text.note").data(frets)
		.attr("x", d => d[0]==0 ? 28 : (d[0]*50)+23)
		.attr("y", 4)
		.attr("class","note")
		.style("font-family","Verdana")
		.style("font-size","11px")
		.text(d => d[1]);
		
	t.data(frets).enter()
		.append("text")
		.attr("x", d => d[0]==0 ? 28 : (d[0]*50)+23)
		.attr("y", 4)
		.attr("class","note")
		.style("font-family","Verdana")
		.style("font-size","11px")
		.text(d => d[1]);
		
	t.exit().remove();
}