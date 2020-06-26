# interspace

Interpsace is a Typescript algorithm that predictively matches input strings to an intended input within a set of labels.

# Design

Interspace takes input strings for n number of parameters and compares those n strings against a given set of ground truth labels that have those parameters. The result of this comparison are predictive matches between the inputs and labels. The best scoring matches are displayed. 

For example: 
<pre>
Input: 
 Parameter 1: "Philly"          Parameter 2: "Penn" 

Set of Labels:
  ... 
  Parameter 1: "Cincinnati"     Parameter 2: "Ohio" 
  Parameter 1: "Denver"         Parameter 2: "Colorado" 
  Parameter 1: "Philadelphia"   Parameter 2: "Pennsylvania" 
  ... 

Output: 
  Guess: 
    1 - Philadelphia, Pennsylvania 
    2 - Scranton, Pennsylvania 
    3 - Phoenix, Arizona 
    ... 
    
</pre>

# Usage and configuration

Within interspace, there are three areas of customization. 

1 - input your own ground truth labels as a csv file ( as an example you can change the example set of labels above to be whatever you would like).  
2 - change the inputted parameters ( you can change add a parameter, for example zip code. Or remove parameters too). 
3 - adjust the relative weighting of each parameter ( assign parameters higher or lower weightings in the scoring algorithm).  

