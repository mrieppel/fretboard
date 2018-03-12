Fretboard
=========

Fretboard is a guitar theory app that lets users see where the notes corresponding to a given chord, or to a complete scale, occur along the length of a guitar's fretboard.  For chords, users can specify the root note, type of chord, and guitar tuning.  Similarly, for scales.  The fretboard is drawn using the [D3.js](http://d3js.org/) library.

A live version is [here](http://mrieppel.github.io/fretboard/)

Internally, the program represents notes as integers (0 for C, 1 for C#, 2 for D etc.).  Thus [enharmonic equivalents](https://en.wikipedia.org/wiki/Enharmonic), like C# and Db, are represented by the same integer.  One problem is to then recover the correct name for a note in the context of a given key (e.g. in the Bmaj scale, it's called "C#", but in the Fmin scale it's called Db). I'm not certain that the program solves this problem correctly in *all* cases (especially for chords).  If you come across bugs, please email at: mrieppel at gmail dot com.