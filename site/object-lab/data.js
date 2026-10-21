/* Object Lab: the one place puzzle content lives. Adding an object means adding an entry here and an image in assets/object-lab/.
   Each object has one UX principle, one sentence applying it to what is visible in the photo, and one source for the principle. */

export const IMAGE_W = 1600, IMAGE_H = 1200;              /* every photo is cover-cropped to this 4:3 board */

export const DIFFICULTIES = {
  easy:   { id: "easy",   label: "Easy",   cols: 3, rows: 3, pieces: 9,  minutes: "2 to 4 min" },
  medium: { id: "medium", label: "Medium", cols: 4, rows: 4, pieces: 16, minutes: "4 to 7 min" },
  hard:   { id: "hard",   label: "Hard",   cols: 5, rows: 5, pieces: 25, minutes: "8 to 14 min" }
};
export const DEFAULT_DIFFICULTY = "easy";

export const PUZZLES = [
  {
    id: "radio", name: "Vintage Radio", kind: "Consumer product",
    image: "assets/object-lab/radio.jpg",
    alt: "A wooden vintage tube radio with a large round tuning knob and a curved dial",
    credit: { by: "Masaki Ikeda", license: "Public domain", href: "https://commons.wikimedia.org/wiki/File:Toshiba_Vacuum_tube_Radio.jpg" },
    principle: "Natural mapping",
    insight: "The big tuning knob sits right beside its frequency dial, so the control and the result it changes are read together.",
    source: { label: "Nielsen Norman Group, Natural Mappings and Stimulus-Response Compatibility", href: "https://www.nngroup.com/articles/natural-mappings/" }
  },
  {
    id: "camera", name: "Retro Camera", kind: "Consumer product",
    image: "assets/object-lab/camera.jpg",
    alt: "A black Leica M6 rangefinder camera seen from the front with its body cap on",
    credit: { by: "Sodacan", license: "CC BY-SA 4.0", href: "https://commons.wikimedia.org/wiki/File:Leica_M6_TTL_front.jpg" },
    principle: "Signifiers",
    insight: "Knurled dials and small raised buttons look like things to turn and press, cueing the action before anyone reads a label.",
    source: { label: "Don Norman, Signifiers, not affordances", href: "https://jnd.org/signifiers-not-affordances/" }
  },
  {
    id: "controller", name: "Game Controller", kind: "Consumer product",
    image: "assets/object-lab/controller.jpg",
    alt: "A grey Nintendo Entertainment System controller with a cross-shaped D-pad and two red buttons",
    credit: { by: "Evan-Amos", license: "Public domain", href: "https://commons.wikimedia.org/wiki/File:Nintendo-Entertainment-System-NES-Controller-FL.jpg" },
    principle: "Recognition over recall",
    insight: "SELECT, START, A and B are printed right beside their buttons, so players recognise each control instead of memorising it.",
    source: { label: "Nielsen Norman Group, 10 Usability Heuristics (#6)", href: "https://www.nngroup.com/articles/ten-usability-heuristics/" }
  },
  {
    id: "flange", name: "Mechanical Flange", kind: "Engineering part",
    image: "assets/object-lab/flange.jpg",
    alt: "Two machined aluminium and stainless steel flanges with bolt holes on a grey background, beside a small scale",
    credit: { by: "U.S. National Archives (NARA 17444079)", license: "Public domain", href: "https://commons.wikimedia.org/wiki/File:ALUMINUM_AND_STAINLESS_STEEL_FLANGE_ASSEMBLY_-_NARA_-_17444079.jpg" },
    principle: "Consistency and standards",
    insight: "A ring of evenly spaced bolt holes is the shared pattern that lets flanges join, just as consistent components let interfaces fit together.",
    source: { label: "Nielsen Norman Group, 10 Usability Heuristics (#4)", href: "https://www.nngroup.com/articles/ten-usability-heuristics/" }
  }
];

export const byId = (id) => PUZZLES.find((p) => p.id === id);
