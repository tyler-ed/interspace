/*
To Do:
Split tasks into different files
Create real index file
Test and Troubleshoot algorithm

build onto electron
*/
// EDIT THIS
const man_test = "GE"
const mod_test = "LS"
///////

import {match_manager, Parameter} from "./manager";

async function main() {
  match_manager.params.push(new Parameter("manufacturer", 1, 0, 0))
  match_manager.params.push(new Parameter("model", 1, 1, 1))
  await match_manager.process_guess(man_test, mod_test);
}

main().then(() =>{
    console.log('all done');
});










