/** Foundry reset() rebuilds prepared embedded models from source before preparing again.
 * Calling prepareData() alone can reuse transient activity entries appended by other modules.
 */
export function refreshActorPreparation(actor){
 if(typeof actor.reset==='function')actor.reset();else actor.prepareData();
}
