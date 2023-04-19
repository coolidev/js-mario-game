import { DOMDisplay } from "./domdisplay";
import { CanvasDisplay } from "./canvasdisplay";
import { State } from "./state";
import { trackKeys } from "./trackKeys";
import { Level } from "./level";

/**
 * Correr animacion
 * @param {*} frameFunc
 */
function runAnimation(frameFunc) {
  let lastTime = null;
  function frame(time) {
    if (lastTime != null) {
      let timeStep = Math.min(time - lastTime, 100) / 1000;
      if (frameFunc(timeStep) === false) return;
    }
    lastTime = time;
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
/**
 * Abandonar nivel
 * @param {*} level
 */
function runLevel(level) {
  let display = new CanvasDisplay(document.body, level);
  let state = State.start(level);
  let ending = 1;
  let running = "yes";
  return new Promise(resolve => {
    function escHandler(event) {
      if (event.key !== "Escape") {
        return;
      }
      event.preventDefault();

      if (running === "yes") {
        running = "pausing";
      } else if (running === "no") {
        running = "yes";
        runAnimation(frame);
      }

      console.log(running);
    }

    window.addEventListener("keydown", escHandler);
    const arrowKeys = trackKeys(["ArrowLeft", "ArrowRight", "ArrowUp"]);

    function frame(time) {
      if (running === "pausing") {
        running = "no";
        return false;
      }

      state = state.update(time, arrowKeys);
      display.syncState(state);
      if (state.status === "playing") {
        return true;
      } else if (ending > 0) {
        ending -= time;
        return true;
      } else {
        display.clear();
        window.removeEventListener("keydown", escHandler);
        arrowKeys.unregister();
        resolve(state.status);
        return false;
      }
    }

    runAnimation(frame);
  });
}
/**
 * correr juego
 * @param {*} plans
 */
export async function runGame(plans) {
  let life = 0;
  for (let level = 0; level < plans.length; ) {
    if (level === 0 && life === 0) {
      life = 3;
    }
    console.log(`count of life is ${life}`);

    let status = await runLevel(new Level(plans[level]));
    if (status === "won") {
      level++;
    } else if (status === "lost") {
      life--;
      if (life === 0) {
        level = 0;
      }
    }
  }
  console.log("You've won!");
}

