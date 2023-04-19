export function trackKeys(keys) {
  let down = Object.create(null);
  function track(event) {
    if (keys.includes(event.key)) {
      down[event.key] = event.type === "keydown";
      event.preventDefault();
    }
  }
  window.addEventListener("keydown", track);
  window.addEventListener("keyup", track);

  down.unregister = () => {
    window.removeEventListener("keydown", track);
    window.removeEventListener("keyup", track);
  };

  return down;
}
