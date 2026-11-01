import {scenarioById} from "./scenarios.js";
export const CONFIG={
  storageKey:"motor-estrategia-porter-v1",
  ...scenarioById("porter")
};
export function activateScenario(id){
  Object.assign(CONFIG,scenarioById(id));
  return CONFIG;
}
