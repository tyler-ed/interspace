const csv = require('csv-parser');
const fs = require('fs');
const levenshtein = require('js-levenshtein');
var results = [];




function argsort(clickCount: number[]){
    const sort_this = clickCount
    .map((item, index) => [item, index]) // add the clickCount to sort by
    .sort(([count1], [count2]) => count2 - count1) // sort by the clickCount data
    .map(([, item]) => item); // extract the sorted items

    return sort_this;
}

function string_comparison(s1, s2): number{
    const words1 = s1.toLowerCase().split(' ').join(',').split('-').join(',').split('_').join(',').split(','); //Test Case
    const words2 = s2.toLowerCase().split(' ').join(',').split('-').join(',').split('_').join(',').split(','); //Label
    let sum_weights = 0;

    for(var a=0; a<words1.length; a++){
        var min_weight = 1000;
        for(var b=0; b<words2.length; b++){
            if(words2[b].length>0){
                min_weight = Math.min(min_weight, levenshtein(words1[a], words2[b])-Math.max(words2[b].length-words1[a].length, 0));
            }      
        }
        sum_weights += min_weight;
    }
    return sum_weights;
}

function get_dists(test: string, res: number[], index: string): number[]{
    const dist = [];
    res.forEach(element => dist.push(string_comparison(test, element[index])));
    return dist
}

// EDIT THIS
const man_test = "Beck Coulter"
const mod_test = "Jolly"
///////

fs.createReadStream('train.csv')
  .pipe(csv())
  .on('data', (data) => {
      results.push(data)})
  .on('end', () => {
    let key = Object.keys(results[0]);

    let man_d = get_dists(man_test, results, key[0]);
    let mon_d = get_dists(mod_test, results, key[1]);

    let man_sorted = argsort(man_d);
    let mod_sorted = argsort(mon_d);
    let overall_score = Array(results.length);

    man_sorted.forEach((value, index)=>{
        overall_score[value] = results.length - index;
    })
    mod_sorted.forEach((value, index)=>{
        overall_score[value] += results.length - index;
    })

    let overall_rank = argsort(overall_score).reverse();
    //console.log(overall_score);

    console.log("\n", "Guesses:");
    for(let i = 0; i<5; i++){
        console.log(i+" _ Manufacturer: " + results[overall_rank[i]][key[0]] + ", Model: " + results[overall_rank[i]][key[1]])
    }
    console.log("\n", "Actual: ");
    console.log("Manufacturer: " + man_test + ", Model: " + mod_test, "\n")
});
