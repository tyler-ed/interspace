/*
To Do:
Split tasks into different files
Create real index file
Test and Troubleshoot algorithm

build onto electron
*/
// EDIT THIS
const man_test = "Fresenius"
const mod_test = "millenium hx"
///////

import {match_manager, Parameter} from "./manager";

async function main() {
  match_manager.params.push(new Parameter("manufacturer", 4))
  match_manager.params.push(new Parameter("model", 2))
  match_manager.init();
  await match_manager.process_guess(man_test, mod_test);
}

main().then(() =>{
    console.log('all done');
});










