const csv = require('csv-parser');
const fs = require('fs');
const glob = require('glob');
import {get_dists, argsort} from "./distance"

let match_manager = new (class {
    initiated:boolean = false
    labels:string[][]
    keys:string[] = []
    params:Parameter[] = []

    last_input:string[]
    matching_results:number[][]

    //Settings:
    //Auto Match Selection:
    auto_choice:boolean = true
    auto_threshold:number = .5
    //Adaptive Match Displaying
    adaptive_listing:boolean = true
    adaptive_threshold:number = .2
    display_num:number = 5 //Number of matches to display
    worthy_size:number = 12 //Number of matches considered plausible
    softmax_beta:number = 3 //Higher, more confident guesses - Lower, less confident guesses
    
    constructor() {
        if(this.display_num+1>this.worthy_size){
            this.worthy_size = this.display_num+1;
        }
    }

    async process_guess(...inputs:string[]):Promise<void> {
        if(!this.initiated){
            await this.init();    
        }
        let input_distances:number[][] = []
        let label_probabilities:number[][] = []
        this.params.forEach((item, index) => {
            let transfer:number[] = get_dists(inputs[item.guess_collumn], this.labels, item.name)
            input_distances.push(transfer)
            label_probabilities.push(this.get_probabilities(transfer, item.weighting))
        })
        let polished_probabilities = this.polish_probabilities(label_probabilities);
        this.matching_results = polished_probabilities;
        this.last_input = inputs;
        this.log_results();
    }

    async init():Promise<void> {
        this.labels = await this.scrape();
        this.normalize_parameter_weights();
        this.initiated = true;
    }

    log_results():void{
        console.log('\n', 'Guesses:');
        for(let i:number = 0; i<this.display_num; i++){
            let probability:number = this.matching_results[i][1];
            if((this.adaptive_listing&&probability>=this.adaptive_threshold)||!this.adaptive_listing){
                let log_string:string = '';
                log_string += Math.round(100*probability)+'% - ';
                this.params.forEach((item, index) => {
                log_string += item.name+': '+this.labels[this.matching_results[i][0]][item.name];
                if(index<this.params.length-1){
                    log_string += ', ';
                }
                }); 
                if(i==0&&this.auto_choice&&this.make_choice(this.matching_results)){
                    log_string += "  < Confident Match"
                }
                console.log(log_string);
            }
        }
        console.log('\n', 'Actual: ');
        let log_string = '';
        this.params.forEach((item, index) => {
            log_string += item.name+': '+this.last_input[item.guess_collumn];
            if(index<this.params.length-1){
                log_string += ', ';
            }
        });
        console.log(log_string, "\n");
    }
    
    get_probabilities(weights:number[], parameter_weighting:number):number[]{
        let sum = 0;
        let probs = [];
        let maximum = weights.reduce((a, b) => {
            return Math.max(a,b)
        })
        weights.forEach((item) => {sum += Math.exp(-parameter_weighting*this.softmax_beta*(item**1))});
        weights.forEach((item) => {
            let p = Math.exp(-parameter_weighting*this.softmax_beta*(item**1))/sum
            probs.push(p)
        })
        return probs
    }

    polish_probabilities(label_probabilities:number[][]):number[][]{
        let aggregate_probabilities:number[] = Array(label_probabilities[0].length);
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
        let scaled_sort:number[][] = [];
        for(let i:number = 0; i<this.worthy_size; i++){
            scaled_sort.push([argsorted_by_probs[i], aggregate_probabilities[argsorted_by_probs[i]]/prob_sum]);     
        }
        return scaled_sort;
    }

    make_choice(matching_results:number[][]):boolean{
        if(matching_results[0][1]>this.auto_threshold){
            if(matching_results[0][1]-matching_results[1][1]>this.auto_threshold/2){
                return true;
            }
        }
        return false;
    }

    scrape():Promise<string[][]>{
        return new Promise<string[][]>((resolve, reject) => {
            const path_to_csv:string  = this.get_csv_path();
            let results:string[][] = []

            var stream = fs.createReadStream(path_to_csv);
    
            stream.pipe(csv())
            .on('data', (data) => {
            results.push(data)    
            }).on('end', () => {
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

    normalize_parameter_weights():void{
        let sum:number = 0;
        this.params.forEach((item) => {
            sum += item.weighting;
        });
        sum /= this.params.length;
        this.params.forEach((item) => {
            item.weighting /= sum;
        });
    }
});

class Parameter {
    name:string
    weighting:number
    guess_collumn:number
    constructor(name:string = "none", weighting:number = 1, guess_collumn:number=null) {
        this.name = name;
        this.weighting = weighting;

        if(guess_collumn){
            this.guess_collumn = guess_collumn;
        }else{
            this.guess_collumn = match_manager.params.length;
        }
    }
}

export{match_manager, Parameter}; 