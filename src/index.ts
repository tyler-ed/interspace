/*
To Do:

build onto electron
*/
// EDIT THIS
const man_test = "Abbott"
const mod_test = "Stat"
///////

import {match_manager, Parameter} from "./manager";

async function main() {
  match_manager.params.push(new Parameter("manufacturer", 4))
  match_manager.params.push(new Parameter("model", 2))
  await match_manager.process_guess(man_test, mod_test);
}

main().then(() =>{
    console.log('all done');
});










