const levenshtein = require('js-levenshtein');

function argsort(clickCount: number[]){
    const sort_this:number[] = clickCount
    .map((item, index) => [item, index]) // add the clickCount to sort by
    .sort(([count1], [count2]) => count2 - count1) // sort by the clickCount data
    .map(([, item]) => item); // extract the sorted items

    return sort_this;
}

function string_comparison(s1:string, s2:string): number{
    const words1:string[] = s1.toLowerCase().split(' ').join(',').split('-').join(',').split('_').join(',').split(','); //Test Case
    const words2:string[] = s2.toLowerCase().split(' ').join(',').split('-').join(',').split('_').join(',').split(','); //Label
    let sum_weights:number = 0;

    for(let a:number=0; a<words1.length; a++){
        let min_weight:number = 1000;
        for(let b:number=0; b<words2.length; b++){
            let this_weight:number
            if(words2[b].length>0){
                this_weight = levenshtein(words1[a], words2[b])-.9*Math.max(words2[b].length-words1[a].length, 0);
            }else{
                this_weight = 1000;
            }
            min_weight = Math.min(min_weight, this_weight);
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

export {get_dists, argsort}