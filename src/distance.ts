const levenshtein = require('js-levenshtein');

function argsort(clickCount: number[]){
    const sort_this = clickCount
    .map((item, index) => [item, index]) // add the clickCount to sort by
    .sort(([count1], [count2]) => count2 - count1) // sort by the clickCount data
    .map(([, item]) => item); // extract the sorted items

    return sort_this;
}

function string_comparison(s1:string, s2:string): number{
    const words1 = s1.toLowerCase().split(' ').join(',').split('-').join(',').split('_').join(',').split(','); //Test Case
    const words2 = s2.toLowerCase().split(' ').join(',').split('-').join(',').split('_').join(',').split(','); //Label
    let sum_weights = 0;

    for(var a=0; a<words1.length; a++){
        var min_weight = 1000;
        for(var b=0; b<words2.length; b++){
            if(words2[b].length>0){
                min_weight = Math.min(min_weight, levenshtein(words1[a], words2[b])-.9*Math.max(words2[b].length-words1[a].length, 0));
            }      
        }
        sum_weights += min_weight;
    }
    return sum_weights;
}

function get_dists(test: string, res: string[][], index: string): number[]{
    const dist:number[] = [];
    res.forEach(element => dist.push(string_comparison(test, element[index])));
    return dist
}