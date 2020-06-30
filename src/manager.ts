const csv = require('csv-parser');
const fs = require('fs');
const glob = require('glob');
import {get_dists, argsort} from "./distance"

let match_manager = new (class {
    scraped:boolean = false
    labels:string[][]
    keys:string[] = []
    params:Parameter[] = []

    last_input:string[]
    matching_results:number[][]

    //settings
    adaptive_listing:boolean = false
    adaptive_threshold = .2
    display_num:number = 5
    worthy_size:number = 12
    
    constructor() {
        if(this.display_num+1>this.worthy_size){
            this.worthy_size = this.display_num+1;
        }
    }

    async process_guess(...inputs:string[]): Promise<void> {


        if(!this.scraped){
            this.labels = await this.scrape();
            //this.keys = Object.keys(this.labels);
        }
        console.log("\n");
        console.log("\n");
        console.log(this.labels[1]["manufacturer"])
        console.log("\n");
        console.log("\n");



        throw new Error('No csv file detected');
        let input_distances:number[][] 
        let label_probabilities:number[][]
        this.params.forEach((item, index) => {
            let transfer:number[] = get_dists(inputs[item.guess_collumn], this.labels, item.name)
            input_distances.push(transfer)
            label_probabilities.push(this.get_probabilities(transfer))
        })
        let polished_probabilities = this.polish_probabilities(label_probabilities);
        this.matching_results = polished_probabilities;
        this.last_input = inputs;
        this.log_results();

    }

    log_results():void{
        console.log('\n', 'Guesses:');
        for(let i = 0; i<this.display_num; i++){
            let log_string:string = '';
            log_string += Math.round(100*this.matching_results[i][1])+'% - ';
            this.params.forEach((item, index) => {
                log_string += item.name+': '+this.labels[this.matching_results[i][0]][item.name];
                if(index<this.params.length-1){
                    log_string += ', ';
                }
            }); 
            console.log(log_string);
        }
        console.log('\n', 'Actual: ');
        let log_string = '';
        this.params.forEach((item, index) => {
            log_string += item.name+': '+this.last_input[item.guess_collumn];
            if(index<this.params.length-1){
                log_string += ', ';
            }
        });
        console.log(log_string);
    }
    get_probabilities(weights: number[]):number[]{
        let sum = 0;
        let probs = [];
        let maximum = weights.reduce((a, b) => {
            return Math.max(a,b)
        })
        weights.forEach((item) => {sum += Math.exp(-(item**2))});
        weights.forEach((item) => {
            let p = Math.exp(-(item**2))/sum
            probs.push(p)
        })
        return probs
    }
    polish_probabilities(label_probabilities:number[][]):number[][]{
        let aggregate_probabilities:number[];
        for(let i:number = 0; i<this.labels.length; i++){
            aggregate_probabilities[i]=1;
            label_probabilities.forEach((item, index) => {
                aggregate_probabilities[i] *= item[i];
            })
        }
        let argsorted_by_probs:number[] = argsort(aggregate_probabilities);
        let prob_sum:number = 0;
        for(let i:number = 0; i<this.worthy_size; i++){
            prob_sum += aggregate_probabilities[argsorted_by_probs[i]];        
        }
        let scaled_sort:number[][];
        for(let i:number = 0; i<this.worthy_size; i++){
            scaled_sort.push([argsorted_by_probs[i], aggregate_probabilities[argsorted_by_probs[i]]/prob_sum]);     
        }
        return scaled_sort;
    }
    scrape(): Promise<string[][]>{
        return new Promise<string[][]>((resolve, reject) => {
            const path_to_csv:string  = this.get_csv_path();
            let results:string[][] = []

            var stream = fs.createReadStream(path_to_csv);
    
            stream.pipe(csv())
            .on('data', (data) => {
            results.push(data)    
            }).on('end', () => {
                this.scraped = true;
                resolve(results);
            }).on('error', () => {
                reject('Failed to read csv file')
            });
        });
    }
    get_csv_path(): string{
        let path_to_csv = glob.sync('../*.csv');
        if(path_to_csv){
            if(path_to_csv.length>1){
                throw new Error('Multiple csv files detected');
            }
            return path_to_csv[0];
        }
        throw new Error('No csv file detected');
    }   
});

class Parameter {
    name:string
    weighting:number
    label_collumn:number
    guess_collumn:number
    constructor(name:string = "none", weighting:number = 1, label_collumn:number, guess_collumn:number=null) {
        this.name = name
        this.weighting = weighting
        this.label_collumn = label_collumn
        if(guess_collumn){
            this.guess_collumn = guess_collumn
        }else{
            this.guess_collumn = label_collumn
        }
    }
}

export{match_manager, Parameter}; 